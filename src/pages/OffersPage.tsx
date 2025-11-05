import React, { useEffect, useRef, useState } from "react";
import mapboxgl, { Map, Marker } from "mapbox-gl";
import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";
import "mapbox-gl/dist/mapbox-gl.css";
import "@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../hooks/useAuth";
import { OfferDetailsModal } from "../components/OfferDetailsModal";

// 🧱 Type Offer complet
type Offer = {
  offer_id: string;
  merchant_id?: string;
  title: string;
  description?: string;
  price_before: number;
  price_after: number;
  discount_percent?: number;
  quantity?: number;
  merchant_name: string;
  merchant_logo_url?: string;
  merchant_phone?: string;
  merchant_street?: string;
  merchant_city?: string;
  merchant_postal_code?: string;
  distance_meters: number;
  offer_lat: number;
  offer_lng: number;
  image_url: string;
  available_from?: string;
  available_until?: string;
  expired_at?: string | null;
  is_active?: boolean;
};

// 📦 Type pour regrouper les offres par marchand
type MerchantGroup = {
  merchant_id: string;
  merchant_name: string;
  merchant_logo_url?: string;
  merchant_phone?: string;
  merchant_street?: string;
  merchant_city?: string;
  merchant_postal_code?: string;
  merchant_lat: number;
  merchant_lng: number;
  distance_meters: number;
  offers: Offer[];
};

const MAP_STYLE = "mapbox://styles/kilicergun01/cmh4k0xk6008i01qt4f8p1mas";
const DEFAULT_LOCATION: [number, number] = [28.9784, 41.0082]; // Istanbul

const customMapboxCSS = `
  .mapboxgl-ctrl-geolocate:focus,
  .mapboxgl-ctrl-geocoder input:focus {
    outline: none !important;
    box-shadow: none !important;
  }

  .mapboxgl-ctrl-top-left {
    top: 10px !important;
    left: 10px !important;
  }

  .mapboxgl-ctrl-top-right {
    top: 10px !important;
    right: 10px !important;
  }

  .mapboxgl-ctrl-geocoder {
    width: 280px !important;
    max-width: calc(100vw - 100px) !important;
    border-radius: 12px !important;
    box-shadow: 0 2px 8px rgba(0,0,0,0.15) !important;
    height: 40px !important;
    font-size: 14px !important;
  }

  @media (max-width: 768px) {
    .mapboxgl-ctrl-geocoder {
      width: calc(100vw - 80px) !important;
      height: 40px !important;
    }
  }

  .mapboxgl-ctrl-logo,
  .mapboxgl-ctrl-attrib,
  .mapbox-improve-map {
    display: none !important;
  }

  .mapboxgl-popup {
    display: none !important;
  }
`;

export default function OffersPage() {
  const { user } = useAuth();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<Map | null>(null);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [merchantGroups, setMerchantGroups] = useState<MerchantGroup[]>([]);
  const [userLocation, setUserLocation] = useState<[number, number]>(DEFAULT_LOCATION);
  const [center, setCenter] = useState<[number, number]>(DEFAULT_LOCATION);
  const [radiusKm, setRadiusKm] = useState<number>(
    Number(localStorage.getItem("radiusKm")) || 10
  );
  const [clientId, setClientId] = useState<string | null>(null);
  const [clientIdFetched, setClientIdFetched] = useState(false);
  const [isGeolocating, setIsGeolocating] = useState(false);
  const [hasGeolocated, setHasGeolocated] = useState(false);
  const [viewMode, setViewMode] = useState<"map" | "list">("map");
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
  const [selectedMerchant, setSelectedMerchant] = useState<MerchantGroup | null>(null);
  const [showMerchantSheet, setShowMerchantSheet] = useState(false);
  const [showMerchantPage, setShowMerchantPage] = useState(false);

  // 🧮 Calcul de la réduction en pourcentage
  const getDiscountPercent = (before: number, after: number) => {
    if (!before || before === 0) return 0;
    return Math.round(((before - after) / before) * 100);
  };

  // ⏰ Calcul du temps restant
  const getTimeRemaining = (until?: string) => {
    if (!until) return "";
    const diff = new Date(until).getTime() - Date.now();
    if (diff <= 0) return "Expirée";
    const h = Math.floor(diff / 1000 / 60 / 60);
    const m = Math.floor((diff / 1000 / 60) % 60);
    return h > 0 ? `${h}h ${m}min` : `${m}min`;
  };

  // 📍 Formater la distance
  const formatDistance = (meters: number) => {
    if (meters < 1000) return `${Math.round(meters)}m`;
    return `${(meters / 1000).toFixed(1)}km`;
  };

  // 💉 Injection CSS personnalisé
  useEffect(() => {
    const styleTag = document.createElement("style");
    styleTag.innerHTML = customMapboxCSS;
    document.head.appendChild(styleTag);
    return () => document.head.removeChild(styleTag);
  }, []);

  // 👤 Récupération du profil client connecté
  useEffect(() => {
    if (clientIdFetched) return;

    const fetchClientId = async () => {
      if (!user) {
        setClientId(null);
        setClientIdFetched(true);
        return;
      }

      try {
        const { data: profile, error } = await supabase
          .from("profiles")
          .select("id")
          .eq("auth_id", user.id)
          .eq("role", "client")
          .maybeSingle();

        if (error) {
          console.error("Erreur profil client:", error);
        } else if (profile) {
          setClientId(profile.id);
        }
      } catch (error) {
        console.error("Erreur profil client:", error);
      } finally {
        setClientIdFetched(true);
      }
    };

    fetchClientId();
  }, [user, clientIdFetched]);

  // 🧭 Géolocalisation automatique pour clients connectés
  useEffect(() => {
    if (!clientId || isGeolocating || hasGeolocated) return;

    const geolocateClient = async () => {
      if (!navigator.geolocation) return;

      setIsGeolocating(true);

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;

          try {
            await supabase.rpc("update_client_location", {
              p_client_id: clientId,
              p_lat: latitude,
              p_lng: longitude,
            });

            setUserLocation([longitude, latitude]);
            setCenter([longitude, latitude]);

            if (mapRef.current && Number.isFinite(longitude) && Number.isFinite(latitude)) {
              mapRef.current.flyTo({
                center: [longitude, latitude],
                zoom: 13,
                essential: true,
              });
            }
          } catch (error) {
            console.error("Erreur mise à jour position:", error);
          } finally {
            setIsGeolocating(false);
            setHasGeolocated(true);
          }
        },
        (error) => {
          console.warn("Géolocalisation refusée:", error);
          setUserLocation(DEFAULT_LOCATION);
          setCenter(DEFAULT_LOCATION);

          if (mapRef.current) {
            mapRef.current.flyTo({
              center: DEFAULT_LOCATION,
              zoom: 10,
              essential: true,
            });
          }
          setIsGeolocating(false);
          setHasGeolocated(true);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    };

    geolocateClient();
  }, [clientId]);

  // 🗺️ Initialisation de la carte Mapbox
  useEffect(() => {
    mapboxgl.accessToken =
      "pk.eyJ1Ijoia2lsaWNlcmd1bjAxIiwiYSI6ImNtaDRoazJsaTFueXgwOHFwaWRzMmU3Y2QifQ.aieAqNwRgY40ydzIDBxc6g";

    if (!mapContainerRef.current) return;

    const safeCenter: [number, number] =
      center && Number.isFinite(center[0]) && Number.isFinite(center[1])
        ? center
        : DEFAULT_LOCATION;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: MAP_STYLE,
      center: safeCenter,
      zoom: 11,
    });

    mapRef.current = map;

    // Contrôle de géolocalisation
    const geolocate = new mapboxgl.GeolocateControl({
      positionOptions: { enableHighAccuracy: true },
      trackUserLocation: false,
      showUserHeading: true,
    });
    map.addControl(geolocate, "top-right");

    geolocate.on("geolocate", (e) => {
      const lng = e.coords.longitude;
      const lat = e.coords.latitude;
      if (!Number.isFinite(lng) || !Number.isFinite(lat)) return;
      setUserLocation([lng, lat]);
      setCenter([lng, lat]);
      map.flyTo({ center: [lng, lat], zoom: 13, essential: true });
    });

    // Barre de recherche
    const geocoder = new MapboxGeocoder({
      accessToken: mapboxgl.accessToken,
      mapboxgl,
      marker: false,
      placeholder: "Rechercher un commerce ou une offre…",
      language: "fr",
    });
    map.addControl(geocoder, "top-left");

    geocoder.on("result", (e) => {
      const [lng, lat] = e.result.center;
      if (!Number.isFinite(lng) || !Number.isFinite(lat)) return;
      setCenter([lng, lat]);
      map.flyTo({ center: [lng, lat], zoom: 13, essential: true });
    });

    return () => map.remove();
  }, []);

  // 📦 Chargement des offres depuis Supabase
  useEffect(() => {
    const fetchOffers = async () => {
      if (!center || !Number.isFinite(center[0]) || !Number.isFinite(center[1])) {
        return;
      }

      try {
        let data, error;

        if (clientId) {
          const result = await supabase.rpc("get_offers_nearby_dynamic_secure", {
            client_id: clientId,
            radius_meters: radiusKm * 1000,
          });
          data = result.data;
          error = result.error;
        } else {
          const [lng, lat] = center;
          const result = await supabase.rpc("get_offers_nearby_public", {
            user_lng: lng,
            user_lat: lat,
            radius_meters: radiusKm * 1000,
          });
          data = result.data;
          error = result.error;
        }

        if (error) {
          console.error("Erreur Supabase:", error.message);
          setOffers([]);
        } else {
          setOffers(data || []);
          groupOffersByMerchant(data || []);
        }
      } catch (error) {
        console.error("Erreur récupération offres:", error);
        setOffers([]);
      }
    };

    fetchOffers();
  }, [center, clientId, radiusKm]);

  // 🏪 Regroupement des offres par marchand
  const groupOffersByMerchant = (offersList: Offer[]) => {
    const groups = new Map<string, MerchantGroup>();

    offersList.forEach((offer) => {
      const merchantId = offer.merchant_id || offer.merchant_name;
      
      if (!groups.has(merchantId)) {
        groups.set(merchantId, {
          merchant_id: merchantId,
          merchant_name: offer.merchant_name,
          merchant_logo_url: offer.merchant_logo_url,
          merchant_phone: offer.merchant_phone,
          merchant_street: offer.merchant_street,
          merchant_city: offer.merchant_city,
          merchant_postal_code: offer.merchant_postal_code,
          merchant_lat: offer.offer_lat,
          merchant_lng: offer.offer_lng,
          distance_meters: offer.distance_meters,
          offers: [],
        });
      }

      groups.get(merchantId)!.offers.push(offer);
    });

    setMerchantGroups(Array.from(groups.values()));
  };

  // 📍 Ajout des marqueurs marchands sur la carte
  useEffect(() => {
    const map = mapRef.current;
    if (!map || viewMode !== "map") return;

    // Nettoyage des anciens marqueurs
    (map as any)._markers?.forEach((m: Marker) => m.remove());
    (map as any)._markers = [];

    merchantGroups.forEach((merchant) => {
      if (
        !Number.isFinite(merchant.merchant_lng) ||
        !Number.isFinite(merchant.merchant_lat)
      ) {
        return;
      }

      // 🎨 Création du marqueur avec logo
      const el = document.createElement("div");
      el.className = "merchant-marker";
      el.style.width = "48px";
      el.style.height = "48px";
      el.style.borderRadius = "50%";
      el.style.border = "3px solid #fff";
      el.style.cursor = "pointer";
      el.style.boxShadow = "0 2px 8px rgba(0,0,0,0.25)";
      el.style.overflow = "hidden";
      el.style.backgroundColor = "#f5f5f5";
      el.style.display = "flex";
      el.style.alignItems = "center";
      el.style.justifyContent = "center";

      if (merchant.merchant_logo_url) {
        const img = document.createElement("img");
        img.src = merchant.merchant_logo_url;
        img.style.width = "100%";
        img.style.height = "100%";
        img.style.objectFit = "cover";
        img.crossOrigin = "anonymous";
        el.appendChild(img);
      } else {
        el.innerHTML = `<span style="font-size:24px;">🏪</span>`;
      }

      // Clic sur le marqueur → ouvre la bande coulissante
      el.addEventListener("click", () => {
        setSelectedMerchant(merchant);
        setShowMerchantSheet(true);
      });

      const marker = new mapboxgl.Marker(el)
        .setLngLat([merchant.merchant_lng, merchant.merchant_lat])
        .addTo(map);

      (map as any)._markers = (map as any)._markers || [];
      (map as any)._markers.push(marker);
    });
  }, [merchantGroups, viewMode]);

  // 📏 Gestion du changement de rayon
  const handleRadiusChange = (val: number) => {
    setRadiusKm(val);
    localStorage.setItem("radiusKm", String(val));
  };

  // 🚨 Protection contre les coordonnées invalides
  if (!center || !Number.isFinite(center[0]) || !Number.isFinite(center[1])) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de la carte...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-screen overflow-hidden bg-gray-50">
      {/* 🔘 Toggle Carte / Liste (sticky sur mobile) */}
      <div className="absolute top-2 left-1/2 -translate-x-1/2 z-[1100] bg-white rounded-full shadow-lg px-1 py-1 flex gap-1">
        <button
          className={`px-4 py-2 text-sm font-semibold rounded-full transition-all ${
            viewMode === "map"
              ? "bg-green-500 text-white"
              : "text-gray-600 hover:bg-gray-100"
          }`}
          onClick={() => setViewMode("map")}
        >
          🗺️ Carte
        </button>
        <button
          className={`px-4 py-2 text-sm font-semibold rounded-full transition-all ${
            viewMode === "list"
              ? "bg-green-500 text-white"
              : "text-gray-600 hover:bg-gray-100"
          }`}
          onClick={() => setViewMode("list")}
        >
          📋 Liste
        </button>
      </div>

      {/* 🗺️ VUE CARTE */}
      {viewMode === "map" && (
        <div className="relative w-full h-full">
          <div ref={mapContainerRef} className="w-full h-full" />

          {/* Slider de rayon */}
          <div className="absolute bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-[1000] bg-white rounded-full shadow-lg px-4 py-2 flex items-center gap-3">
            <input
              type="range"
              min={1}
              max={50}
              value={radiusKm}
              onChange={(e) => handleRadiusChange(Number(e.target.value))}
              className="w-32 md:w-40 accent-green-500 cursor-pointer"
            />
            <span className="text-sm font-medium text-gray-700 whitespace-nowrap">
              {radiusKm} km
            </span>
          </div>
        </div>
      )}

      {/* 📋 VUE LISTE */}
      {viewMode === "list" && (
        <div className="w-full h-full overflow-y-auto pt-16 pb-6 px-4 md:px-8">
          {offers.length === 0 ? (
            <p className="text-gray-500 text-center mt-20">
              Aucune offre disponible dans ce rayon
            </p>
          ) : (
            <div className="max-w-7xl mx-auto">
              {/* Mobile: cartes verticales */}
              <div className="md:hidden space-y-4">
                {offers.map((offer) => (
                  <OfferCardMobile key={offer.offer_id} offer={offer} onClick={() => setSelectedOffer(offer)} />
                ))}
              </div>

              {/* Desktop: cartes horizontales */}
              <div className="hidden md:block space-y-3">
                {offers.map((offer) => (
                  <OfferCardDesktop key={offer.offer_id} offer={offer} onClick={() => setSelectedOffer(offer)} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 📱 BANDE COULISSANTE MARCHAND (Mobile style TooGoodToGo) */}
      {showMerchantSheet && selectedMerchant && (
        <div
          className="fixed inset-0 z-[2000] bg-black/30 transition-opacity"
          onClick={() => setShowMerchantSheet(false)}
        >
          <div
            className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl max-h-[40vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Poignée */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-12 h-1 bg-gray-300 rounded-full"></div>
            </div>

            {/* Contenu */}
            <div className="px-6 pb-6">
              <div className="flex items-start gap-4">
                {/* Logo */}
                {selectedMerchant.merchant_logo_url ? (
                  <img
                    src={selectedMerchant.merchant_logo_url}
                    alt={selectedMerchant.merchant_name}
                    className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
                    crossOrigin="anonymous"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-2xl">
                    🏪
                  </div>
                )}

                {/* Infos */}
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 mb-1">
                    {selectedMerchant.merchant_name}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                    <span className="font-semibold text-green-600">
                      {formatDistance(selectedMerchant.distance_meters)}
                    </span>
                    <span>•</span>
                    <span>
                      {selectedMerchant.merchant_street}, {selectedMerchant.merchant_city}
                    </span>
                  </div>

                  {/* Bouton */}
                  <button
                    className="w-full bg-green-500 text-white font-semibold py-3 rounded-xl hover:bg-green-600 transition"
                    onClick={() => {
                      setShowMerchantSheet(false);
                      setShowMerchantPage(true);
                    }}
                  >
                    Voir les offres ({selectedMerchant.offers.length})
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 🏪 PAGE MARCHAND COMPLÈTE */}
      {showMerchantPage && selectedMerchant && (
        <div className="fixed inset-0 z-[2100] bg-white overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3">
            <button
              onClick={() => {
                setShowMerchantPage(false);
                setSelectedMerchant(null);
              }}
              className="text-gray-600 hover:text-gray-900"
            >
              ← Retour
            </button>
          </div>

          {/* Contenu */}
          <div className="p-6 max-w-4xl mx-auto">
            {/* Infos marchand */}
            <div className="flex items-start gap-4 mb-6">
              {selectedMerchant.merchant_logo_url ? (
                <img
                  src={selectedMerchant.merchant_logo_url}
                  alt={selectedMerchant.merchant_name}
                  className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
                  crossOrigin="anonymous"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center text-3xl">
                  🏪
                </div>
              )}
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  {selectedMerchant.merchant_name}
                </h1>
                <p className="text-gray-600 text-sm mb-1">
                  📍 {selectedMerchant.merchant_street}, {selectedMerchant.merchant_city}
                </p>
                <p className="text-green-600 font-semibold">
                  {formatDistance(selectedMerchant.distance_meters)}
                </p>
              </div>
            </div>

            {/* Les offres de ce commerce */}
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Les offres de ce commerce
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {selectedMerchant.offers.map((offer) => (
                <div
                  key={offer.offer_id}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden cursor-pointer hover:shadow-md transition"
                  onClick={() => {
                    setShowMerchantPage(false);
                    setSelectedOffer(offer);
                  }}
                >
                  <img
                    src={offer.image_url}
                    alt={offer.title}
                    className="w-full h-40 object-cover"
                    crossOrigin="anonymous"
                  />
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">{offer.title}</h3>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-green-600">
                          {offer.price_after.toFixed(2)}€
                        </span>
                        <span className="text-sm text-gray-400 line-through">
                          {offer.price_before.toFixed(2)}€
                        </span>
                      </div>
                      <span className="bg-white text-red-600 font-bold text-xs px-2 py-1 rounded border border-red-200">
                        -{getDiscountPercent(offer.price_before, offer.price_after)}%
                      </span>
                    </div>
                    {offer.available_until && (
                      <p className="text-xs text-gray-500">
                        ⏱ {getTimeRemaining(offer.available_until)}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Section anti-gaspillage */}
            <div className="bg-green-50 rounded-xl p-6 mb-6">
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                🌱 Acteur de la lutte anti-gaspillage
              </h3>
              <p className="text-gray-700">
                +{selectedMerchant.offers.reduce((acc, o) => acc + (o.quantity || 1), 0)} produits sauvés
              </p>
            </div>

            {/* Carte du commerce */}
            <div className="h-64 rounded-xl overflow-hidden border border-gray-200">
              <div
                ref={(el) => {
                  if (el && !el.dataset.initialized) {
                    el.dataset.initialized = "true";
                    const miniMap = new mapboxgl.Map({
                      container: el,
                      style: MAP_STYLE,
                      center: [selectedMerchant.merchant_lng, selectedMerchant.merchant_lat],
                      zoom: 15,
                      interactive: false,
                    });
                    new mapboxgl.Marker({ color: "#22c55e" })
                      .setLngLat([selectedMerchant.merchant_lng, selectedMerchant.merchant_lat])
                      .addTo(miniMap);
                  }
                }}
                className="w-full h-full"
              />
            </div>
          </div>
        </div>
      )}

      {/* 🔍 MODALE DÉTAILS OFFRE */}
      <OfferDetailsModal
        offer={selectedOffer}
        onClose={() => setSelectedOffer(null)}
      />
    </div>
  );
}

// 📱 CARTE OFFRE MOBILE (style TooGoodToGo)
const OfferCardMobile = ({ offer, onClick }: { offer: Offer; onClick: () => void }) => {
  const getDiscountPercent = (before: number, after: number) => {
    if (!before || before === 0) return 0;
    return Math.round(((before - after) / before) * 100);
  };

  const getTimeRemaining = (until?: string) => {
    if (!until) return "";
    const diff = new Date(until).getTime() - Date.now();
    if (diff <= 0) return "Expirée";
    const h = Math.floor(diff / 1000 / 60 / 60);
    const m = Math.floor((diff / 1000 / 60) % 60);
    return h > 0 ? `${h}h ${m}min` : `${m}min`;
  };

  return (
    <div
      className="bg-white rounded-2xl shadow-sm overflow-hidden cursor-pointer hover:shadow-md transition"
      onClick={onClick}
    >
      <div className="relative">
        <img
          src={offer.image_url}
          alt={offer.title}
          className="w-full h-48 object-cover"
          crossOrigin="anonymous"
        />
        <div className="absolute top-3 right-3 bg-white text-red-600 font-bold text-sm px-3 py-1 rounded-lg border border-red-200">
          -{getDiscountPercent(offer.price_before, offer.price_after)}%
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          {offer.merchant_logo_url ? (
            <img
              src={offer.merchant_logo_url}
              alt={offer.merchant_name}
              className="w-8 h-8 rounded-full object-cover"
              crossOrigin="anonymous"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm">
              🏪
            </div>
          )}
          <span className="font-semibold text-gray-900">{offer.merchant_name}</span>
        </div>
        <h3 className="font-bold text-lg text-gray-900 mb-2">{offer.title}</h3>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-green-600">
              {offer.price_after.toFixed(2)}€
            </span>
            <span className="text-sm text-gray-400 line-through">
              {offer.price_before.toFixed(2)}€
            </span>
          </div>
          {offer.available_until && (
            <span className="text-xs text-gray-500">
              ⏱ {getTimeRemaining(offer.available_until)}
            </span>
          )}
        </div>
        {offer.distance_meters > 0 && (
          <p className="text-sm text-gray-600">
            📍 {(offer.distance_meters / 1000).toFixed(1)} km
          </p>
        )}
      </div>
    </div>
  );
};

// 💻 CARTE OFFRE DESKTOP (3 lignes max)
const OfferCardDesktop = ({ offer, onClick }: { offer: Offer; onClick: () => void }) => {
  const getDiscountPercent = (before: number, after: number) => {
    if (!before || before === 0) return 0;
    return Math.round(((before - after) / before) * 100);
  };

  const getTimeRemaining = (until?: string) => {
    if (!until) return "";
    const diff = new Date(until).getTime() - Date.now();
    if (diff <= 0) return "Expirée";
    const h = Math.floor(diff / 1000 / 60 / 60);
    const m = Math.floor((diff / 1000 / 60) % 60);
    return h > 0 ? `${h}h ${m}min` : `${m}min`;
  };

  return (
    <div
      className="bg-white rounded-xl shadow-sm hover:shadow-md transition overflow-hidden cursor-pointer flex items-center"
      onClick={onClick}
    >
      {/* Photo produit */}
      <img
        src={offer.image_url}
        alt={offer.title}
        className="w-32 h-32 object-cover flex-shrink-0"
        crossOrigin="anonymous"
      />

      {/* Zone centrale */}
      <div className="flex-1 p-4">
        {/* Ligne 1: Logo + Nom commerce */}
        <div className="flex items-center gap-2 mb-2">
          {offer.merchant_logo_url ? (
            <img
              src={offer.merchant_logo_url}
              alt={offer.merchant_name}
              className="w-7 h-7 rounded-full object-cover"
              crossOrigin="anonymous"
            />
          ) : (
            <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-xs">
              🏪
            </div>
          )}
          <span className="font-semibold text-gray-900 text-sm">
            {offer.merchant_name}
          </span>
        </div>

        {/* Ligne 2: Nom produit + Prix + Réduction */}
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-bold text-gray-900">{offer.title}</h3>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-green-600">
                {offer.price_after.toFixed(2)}€
              </span>
              <span className="text-sm text-gray-400 line-through">
                {offer.price_before.toFixed(2)}€
              </span>
            </div>
            <span className="bg-white text-red-600 font-bold text-xs px-2 py-1 rounded border border-red-200">
              -{getDiscountPercent(offer.price_before, offer.price_after)}%
            </span>
          </div>
        </div>

        {/* Ligne 3: Timer + Distance + Téléphone */}
        <div className="flex items-center gap-4 text-sm text-gray-600">
          {offer.available_until && (
            <span>⏱ {getTimeRemaining(offer.available_until)}</span>
          )}
          {offer.distance_meters > 0 && (
            <span>📍 {(offer.distance_meters / 1000).toFixed(1)} km</span>
          )}
          {offer.merchant_phone && <span>📞 {offer.merchant_phone}</span>}
        </div>
      </div>

      {/* Adresse à droite */}
      <div className="px-4 text-right">
        <p className="text-sm text-gray-600">
          {offer.merchant_street}
          <br />
          {offer.merchant_city}
        </p>
      </div>
    </div>
  );
};