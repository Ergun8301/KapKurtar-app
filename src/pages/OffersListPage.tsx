import React, { useEffect, useState, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { Geolocation } from "@capacitor/geolocation";
import { NativeSettings, AndroidSettings } from "capacitor-native-settings";
import { Clock, Search, MapPin, Globe, Loader2 } from "lucide-react";
import mapboxgl from "mapbox-gl";
import SEO from "../components/SEO";
import { useAuth } from "../hooks/useAuth";
import { OfferDetailsModal } from "../components/OfferDetailsModal";
import { useClientNotifications } from "../hooks/useClientNotifications";
import { useOffers, type Offer } from "../hooks/useOffers";

// Cordova plugin for native GPS enable popup (Android)
declare global {
  interface Window {
    cordova?: {
      plugins?: {
        locationAccuracy?: {
          request: (success: (code: number) => void, error: (err: any) => void, accuracy: number) => void;
          canRequest: (callback: (canRequest: boolean) => void) => void;
          isRequesting: (callback: (isRequesting: boolean) => void) => void;
          REQUEST_PRIORITY_HIGH_ACCURACY: number;
          SUCCESS_SETTINGS_SATISFIED: number;
          SUCCESS_USER_AGREED: number;
          ERROR_USER_DISAGREED: number;
        };
      };
    };
  }
}

mapboxgl.accessToken = "pk.eyJ1Ijoia2lsaWNlcmd1bjAxIiwiYSI6ImNtaDRqdDdoazBkOGEycXNhM2E4cjhnMHIifQ.5g3VwT6o3E3FwlcaUBzbCA";

const DEFAULT_LOCATION: [number, number] = [35.2433, 38.9637]; // Centre Turquie

export default function OffersListPage() {
  useClientNotifications();
  const { user } = useAuth();
  const [userLocation, setUserLocation] = useState<[number, number]>(DEFAULT_LOCATION);
  const [center, setCenter] = useState<[number, number]>(DEFAULT_LOCATION);
  const [radiusKm, setRadiusKm] = useState<number>(
    Number(localStorage.getItem("radiusKm")) || 10
  );
  const [clientId, setClientId] = useState<string | null>(null);
  const [clientIdFetched, setClientIdFetched] = useState(false);
  const [isGeolocating, setIsGeolocating] = useState(false);
  const [hasGeolocated, setHasGeolocated] = useState(false);
  const [viewMode, setViewMode] = useState<"nearby" | "all">("all");
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchAddress, setSearchAddress] = useState("");
  const [addressSuggestions, setAddressSuggestions] = useState<Array<{ place_name: string; center: [number, number] }>>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'warning' | 'error' } | null>(null);

  // Fetch offers using shared hook
  const { offers, loading } = useOffers({
    clientId,
    viewMode,
    radiusKm,
    center,
    enabled: clientIdFetched,
  });

  // 🔐 Récupérer le clientId de l'utilisateur connecté
  useEffect(() => {
    const fetchClientId = async () => {
      if (!user) {
        setClientId(null);
        setClientIdFetched(true);
        return;
      }

      try {
        const { data: profileData, error: profileError } = await import("../lib/supabaseClient")
          .then((m) => m.supabase)
          .then((supabase) => supabase.from("profiles").select("id").eq("auth_id", user.id).maybeSingle());

        if (profileError || !profileData) {
          console.error("❌ Profil introuvable:", profileError);
          setClientId(null);
        } else {
          setClientId(profileData.id);
          console.log("✅ clientId:", profileData.id);
        }
      } catch (error) {
        console.error("❌ Erreur fetchClientId:", error);
        setClientId(null);
      } finally {
        setClientIdFetched(true);
      }
    };

    fetchClientId();
  }, [user]);

  // 🌍 Géolocalisation automatique au chargement
  // ✅ RÈGLE: Si GPS réussit → Yakında, si GPS échoue → Tümü automatiquement
  useEffect(() => {
    if (hasGeolocated) return;

    console.log("🔍 Capacitor Geolocation plugin available:", !!Geolocation);

    const autoGeolocate = async () => {
      try {
        const permissions = await Geolocation.checkPermissions();
        console.log("📱 Permissions actuelles:", permissions.location);

        if (permissions.location === "denied") {
          console.log("⚠️ Permission de localisation refusée → Basculer sur Tümü");
          setViewMode("all"); // ✅ Fallback automatique sur Tümü
          setHasGeolocated(true);
          return;
        }

        if (permissions.location === "prompt" || permissions.location === "prompt-with-rationale") {
          console.log("📲 Demande de permission...");
          const requestResult = await Geolocation.requestPermissions();
          if (requestResult.location === "denied") {
            console.log("❌ Permission refusée par l'utilisateur → Basculer sur Tümü");
            setViewMode("all"); // ✅ Fallback automatique sur Tümü
            setHasGeolocated(true);
            return;
          }
        }

        console.log("📍 Récupération de la position GPS...");
        const position = await Geolocation.getCurrentPosition({
          enableHighAccuracy: true,
          timeout: 10000,
        });

        const { latitude, longitude } = position.coords;
        console.log("✅ Position obtenue:", { latitude, longitude });

        const newLocation: [number, number] = [longitude, latitude];
        setUserLocation(newLocation);
        setCenter(newLocation);

        // ✅ GPS réussi → Basculer sur Yakında
        setViewMode("nearby");
        console.log("✅ GPS OK → Mode Yakında activé");

        // Mettre à jour la localisation dans Supabase
        if (clientId) {
          const { supabase } = await import("../lib/supabaseClient");
          const { error: updateError } = await supabase.rpc("update_client_location", {
            p_client_id: clientId,
            p_lat: latitude,
            p_lng: longitude,
            p_status: "success",
          });

          if (updateError) {
            console.error("❌ Erreur mise à jour localisation:", updateError);
          } else {
            console.log("✅ Localisation mise à jour dans Supabase");
          }
        }

        setHasGeolocated(true);
      } catch (error: any) {
        console.error("❌ Erreur géolocalisation:", error);
        console.log("❌ GPS échoué → Basculer sur Tümü");
        setViewMode("all"); // ✅ Fallback automatique sur Tümü
        setHasGeolocated(true);
      }
    };

    autoGeolocate();
  }, [hasGeolocated, clientId]);

  // 🔗 Deep link : ouvrir automatiquement l'offre depuis ?offer_id=XXX
  useEffect(() => {
    const offerId = searchParams.get("offer_id");
    if (offerId && offers.length > 0) {
      const targetOffer = offers.find((o) => o.offer_id === offerId);
      if (targetOffer) {
        setSelectedOffer(targetOffer);
        setSearchParams({}); // Nettoyer l'URL
      }
    }
  }, [searchParams, offers, setSearchParams]);

  const handleRadiusChange = (newRadius: number) => {
    setRadiusKm(newRadius);
    localStorage.setItem("radiusKm", String(newRadius));
  };

  const handleViewModeChange = (mode: "nearby" | "all") => {
    setViewMode(mode);
  };

  const handleGeolocate = async () => {
    setIsGeolocating(true);

    try {
      const permissions = await Geolocation.requestPermissions();

      if (permissions.location === "denied") {
        setIsGeolocating(false);

        if (window.cordova?.plugins?.locationAccuracy) {
          window.cordova.plugins.locationAccuracy.canRequest((canRequest) => {
            if (canRequest) {
              window.cordova!.plugins!.locationAccuracy!.request(
                (code) => {
                  if (code === window.cordova!.plugins!.locationAccuracy!.SUCCESS_USER_AGREED) {
                    handleGeolocate();
                  } else {
                    // ✅ Si l'utilisateur refuse → Basculer sur Tümü
                    setViewMode("all");
                    setToast({ message: "GPS refusé. Affichage de toutes les offres.", type: "warning" });
                    setTimeout(() => setToast(null), 3000);
                  }
                },
                (err) => {
                  console.error("locationAccuracy error:", err);
                  setViewMode("all"); // ✅ Fallback
                  NativeSettings.open({ optionAndroid: AndroidSettings.Location });
                },
                window.cordova.plugins.locationAccuracy.REQUEST_PRIORITY_HIGH_ACCURACY
              );
            } else {
              setViewMode("all"); // ✅ Fallback
              NativeSettings.open({ optionAndroid: AndroidSettings.Location });
            }
          });
        } else {
          setViewMode("all"); // ✅ Fallback
          NativeSettings.open({ optionAndroid: AndroidSettings.Location });
        }
        return;
      }

      const position = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 10000,
      });

      const { latitude, longitude } = position.coords;
      const newLocation: [number, number] = [longitude, latitude];

      setUserLocation(newLocation);
      setCenter(newLocation);
      setViewMode("nearby"); // ✅ GPS réussi → Yakında
      setHasGeolocated(true);

      if (clientId) {
        const { supabase } = await import("../lib/supabaseClient");
        await supabase.rpc("update_client_location", {
          p_client_id: clientId,
          p_lat: latitude,
          p_lng: longitude,
          p_status: "success",
        });
      }
    } catch (error: any) {
      console.error("Géolocalisation error:", error);

      if (error.code === 1) {
        // Permission refusée
        setViewMode("all"); // ✅ Fallback
        NativeSettings.open({ optionAndroid: AndroidSettings.Location });
      } else if (error.code === 2) {
        // GPS indisponible
        if (window.cordova?.plugins?.locationAccuracy) {
          window.cordova.plugins.locationAccuracy.request(
            () => handleGeolocate(),
            () => {
              setViewMode("all"); // ✅ Fallback
              NativeSettings.open({ optionAndroid: AndroidSettings.Location });
            },
            window.cordova.plugins.locationAccuracy.REQUEST_PRIORITY_HIGH_ACCURACY
          );
        } else {
          setViewMode("all"); // ✅ Fallback
        }
      } else if (error.code === 3) {
        // Timeout
        setViewMode("all"); // ✅ Fallback
        setToast({ message: "GPS timeout. Affichage de toutes les offres.", type: "warning" });
        setTimeout(() => setToast(null), 3000);
      } else {
        // Autre erreur
        setViewMode("all"); // ✅ Fallback
      }
    } finally {
      setIsGeolocating(false);
    }
  };

  const fetchAddressSuggestions = async (query: string) => {
    if (!query || query.trim().length < 3) {
      setAddressSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${mapboxgl.accessToken}&limit=5&language=tr&country=TR`
      );
      const data = await response.json();

      if (data.features && data.features.length > 0) {
        const suggestions = data.features.map((feature: any) => ({
          place_name: feature.place_name,
          center: feature.center,
        }));
        setAddressSuggestions(suggestions);
        setShowSuggestions(true);
      } else {
        setAddressSuggestions([]);
        setShowSuggestions(false);
      }
    } catch (error) {
      console.error("Autocomplete error:", error);
      setAddressSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleAddressInputChange = (value: string) => {
    setSearchAddress(value);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      fetchAddressSuggestions(value);
    }, 300);
  };

  const handleSuggestionSelect = (suggestion: { place_name: string; center: [number, number] }) => {
    const [lng, lat] = suggestion.center;

    setCenter([lng, lat]);
    setUserLocation([lng, lat]);
    setViewMode("nearby");
    setSearchAddress("");
    setAddressSuggestions([]);
    setShowSuggestions(false);
  };

  const handleAddressSearch = async () => {
    if (!searchAddress.trim()) return;

    setShowSuggestions(false);
    setAddressSuggestions([]);

    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(searchAddress)}.json?access_token=${mapboxgl.accessToken}&limit=1&language=tr`
      );
      const data = await response.json();

      if (data.features && data.features.length > 0) {
        const [lng, lat] = data.features[0].center;

        setCenter([lng, lat]);
        setUserLocation([lng, lat]);
        setViewMode("nearby");
        setSearchAddress("");
      } else {
        setToast({ message: "Adres bulunamadı. Lütfen farklı bir adres deneyin.", type: "error" });
        setTimeout(() => setToast(null), 3000);
      }
    } catch (error) {
      console.error("Address search error:", error);
      setToast({ message: "Adres arama hatası. Lütfen tekrar deneyin.", type: "error" });
      setTimeout(() => setToast(null), 3000);
    }
  };

  const getDiscountPercent = (priceBefore: number, priceAfter: number) => {
    return Math.round(((priceBefore - priceAfter) / priceBefore) * 100);
  };

  const getTimeRemaining = (availableUntil: string) => {
    const now = new Date().getTime();
    const end = new Date(availableUntil).getTime();
    const diff = end - now;

    if (diff <= 0) return "Süresi doldu";

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days} gün ${hours % 24} saat kaldı`;
    }
    if (hours > 0) return `${hours} saat ${minutes} dk kaldı`;
    return `${minutes} dakika kaldı`;
  };

  const getProgressPercent = (availableFrom: string | undefined, availableUntil: string) => {
    if (!availableFrom) return 0;
    const start = new Date(availableFrom).getTime();
    const end = new Date(availableUntil).getTime();
    const now = new Date().getTime();
    const total = end - start;
    const elapsed = now - start;
    return Math.min(100, Math.max(0, (elapsed / total) * 100));
  };

  const OfferCard = ({ offer }: { offer: Offer }) => (
    <div
      className="bg-white rounded-lg shadow-sm hover:shadow-md transition overflow-hidden cursor-pointer flex flex-col"
      onClick={() => setSelectedOffer(offer)}
    >
      {offer.image_url && (
        <img
          src={offer.image_url}
          alt={offer.title}
          className="w-full h-40 object-cover"
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).style.display = "none";
          }}
        />
      )}

      <div className="p-4 flex-1 flex flex-col">
        <h3 className="font-bold text-gray-900 text-base mb-2 line-clamp-2">
          {offer.title}
        </h3>

        <div className="flex items-center gap-2 flex-wrap mb-3">
          <span className="font-bold text-[#00A690] text-lg">
            {offer.price_after.toFixed(2)}₺
          </span>
          <span className="line-through text-gray-400 text-sm">
            {offer.price_before.toFixed(2)}₺
          </span>
          <span className="text-xs text-red-600 font-semibold bg-red-50 px-2 py-1 rounded">
            -{getDiscountPercent(offer.price_before, offer.price_after)}%
          </span>
        </div>

        {offer.available_until && (
          <div className="space-y-1 mb-3">
            <div className="text-xs text-gray-700 font-semibold">
              <span>{getTimeRemaining(offer.available_until)}</span>
            </div>
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 rounded-full ${
                  getProgressPercent(offer.available_from, offer.available_until) < 33 ? 'animate-pulse-fast' :
                  getProgressPercent(offer.available_from, offer.available_until) < 67 ? 'animate-pulse-medium' :
                  ''
                }`}
                style={{
                  width: `${getProgressPercent(offer.available_from, offer.available_until)}%`,
                  backgroundColor: getProgressPercent(offer.available_from, offer.available_until) < 33 ? '#ef4444' :
                                  getProgressPercent(offer.available_from, offer.available_until) < 67 ? '#f59e0b' : '#16a34a'
                }}
              />
            </div>
          </div>
        )}

        <div className="mt-auto pt-3 border-t border-gray-100 flex items-center gap-2">
          {offer.merchant_logo_url ? (
            <img
              src={offer.merchant_logo_url}
              alt={offer.merchant_name}
              className="w-8 h-8 rounded-full object-cover border border-gray-200"
              crossOrigin="anonymous"
              referrerPolicy="no-referrer"
            />
          ) : (
            <img
              src="https://zhabjdyzawffsmvziojl.supabase.co/storage/v1/object/public/logos/FAVICON%20MINI%20rond%20fond%20vert.png"
              alt="KapKurtar"
              className="w-8 h-8 rounded-full object-cover"
              crossOrigin="anonymous"
              referrerPolicy="no-referrer"
            />
          )}
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-900 text-xs line-clamp-1">
              {offer.merchant_name}
            </p>
            {offer.merchant_city && offer.merchant_city !== "À définir" && (
              <p className="text-gray-600 text-[10px] line-clamp-1">
                📍 {offer.merchant_city}
              </p>
            )}
          </div>
          {viewMode === "nearby" && offer.distance_meters > 0 && (
            <p className="text-[#00A690] font-semibold text-xs whitespace-nowrap">
              {(offer.distance_meters / 1000).toFixed(1)} km
            </p>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      <SEO
        title="İndirimli Yemek Fırsatları - KapKurtar"
        description="Yakınınızdaki restoranlar, fırınlar ve marketlerden %70 indirimli yemek fırsatları. Keşfet, rezerve et, kazan!"
        canonical="/offers"
        keywords="indirimli yemek, ucuz yemek, yakındaki fırsatlar, fazla gıda"
      />

      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-20 left-1/2 -translate-x-1/2 z-[9999] px-6 py-4 rounded-xl shadow-2xl text-white text-center max-w-sm animate-bounce-in ${
            toast.type === 'success' ? 'bg-[#00A690]' :
            toast.type === 'warning' ? 'bg-gradient-to-r from-orange-500 to-red-500' :
            'bg-red-500'
          }`}
        >
          <p className="font-semibold text-base">{toast.message}</p>
        </div>
      )}

      <style>{`
        @keyframes bounce-in {
          0% { transform: translateX(-50%) scale(0.8) translateY(-20px); opacity: 0; }
          50% { transform: translateX(-50%) scale(1.05) translateY(0); }
          100% { transform: translateX(-50%) scale(1) translateY(0); opacity: 1; }
        }
        .animate-bounce-in {
          animation: bounce-in 0.4s ease-out forwards;
        }
        @keyframes pulse-fast {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        @keyframes pulse-medium {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.85; }
        }
        .animate-pulse-fast {
          animation: pulse-fast 1s ease-in-out infinite;
        }
        .animate-pulse-medium {
          animation: pulse-medium 1.5s ease-in-out infinite;
        }
      `}</style>

      <div className="min-h-screen bg-gray-50">
        {/* Header Controls */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4 space-y-3">
            {/* Search bar */}
            <div className="relative">
              <input
                type="text"
                placeholder="Adres ara... (örn: Kadıköy, İstanbul)"
                className="w-full py-2.5 px-4 pl-11 bg-gray-50 rounded-xl text-sm border border-gray-200 focus:ring-2 focus:ring-[#00A690] focus:outline-none focus:border-transparent"
                value={searchAddress}
                onChange={(e) => handleAddressInputChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleAddressSearch();
                  }
                }}
                onBlur={() => {
                  setTimeout(() => setShowSuggestions(false), 200);
                }}
                onFocus={() => {
                  if (addressSuggestions.length > 0) setShowSuggestions(true);
                }}
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              {searchAddress && (
                <button
                  onClick={handleAddressSearch}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#00A690] text-white px-3 py-1.5 rounded-lg text-xs font-medium"
                >
                  Ara
                </button>
              )}

              {/* Address suggestions */}
              {showSuggestions && addressSuggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden z-[1000]">
                  {addressSuggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      className="w-full px-4 py-3 text-left text-sm hover:bg-gray-50 border-b border-gray-50 last:border-b-0 flex items-start gap-2"
                      onClick={() => handleSuggestionSelect(suggestion)}
                    >
                      <MapPin className="w-4 h-4 text-[#00A690] flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700 line-clamp-2">{suggestion.place_name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Filter buttons */}
            <div className="flex gap-2">
              <button
                onClick={handleGeolocate}
                disabled={isGeolocating}
                className={`flex-1 py-2.5 rounded-xl flex items-center justify-center gap-2 font-medium transition-all ${
                  viewMode === "nearby"
                    ? "bg-[#00A690] text-white"
                    : "bg-gray-100 text-gray-600"
                } ${isGeolocating ? "opacity-70" : ""}`}
              >
                {isGeolocating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">Konum alınıyor...</span>
                  </>
                ) : (
                  <>
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm">Yakında</span>
                  </>
                )}
              </button>
              <button
                onClick={() => handleViewModeChange("all")}
                className={`flex-1 py-2.5 rounded-xl flex items-center justify-center gap-2 font-medium transition-all ${
                  viewMode === "all"
                    ? "bg-[#00A690] text-white"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                <Globe className="w-4 h-4" />
                <span className="text-sm">Tümü</span>
              </button>
            </div>

            {/* Radius slider */}
            {viewMode === "nearby" && (
              <div className="bg-gray-50 rounded-xl p-3 flex items-center gap-3 border border-gray-200">
                <span className="text-xs text-gray-600 whitespace-nowrap font-medium">Yarıçap:</span>
                <input
                  type="range"
                  min={1}
                  max={50}
                  value={radiusKm}
                  onInput={(e) => handleRadiusChange(Number((e.target as HTMLInputElement).value))}
                  className="flex-1 accent-[#00A690] cursor-pointer"
                />
                <span className="text-sm font-bold text-[#00A690] min-w-[50px] text-right">
                  {radiusKm} km
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Offers Grid */}
        <div className="container mx-auto px-4 py-6">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00A690] mx-auto mb-4"></div>
                <p className="text-gray-600">Teklifler yükleniyor...</p>
              </div>
            </div>
          ) : offers.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-500 text-lg mb-4">
                {viewMode === "nearby"
                  ? "Yakınınızda henüz teklif bulunmuyor. Arama yarıçapını artırın veya tüm teklifleri görüntüleyin."
                  : "Henüz aktif teklif bulunmuyor."
                }
              </p>
              {viewMode === "nearby" && (
                <button
                  onClick={() => setViewMode("all")}
                  className="bg-[#00A690] text-white px-6 py-3 rounded-xl font-medium hover:bg-[#008c7a] transition"
                >
                  Tüm Teklifleri Gör
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="mb-4 text-sm text-gray-600">
                <span className="font-semibold">{offers.length}</span> teklif bulundu
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {offers.map((offer) => (
                  <OfferCard key={offer.offer_id} offer={offer} />
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Offer Details Modal */}
      {selectedOffer && (
        <OfferDetailsModal
          offer={selectedOffer}
          onClose={() => setSelectedOffer(null)}
          onOfferChange={(newOffer) => setSelectedOffer(newOffer)}
        />
      )}
    </>
  );
}
