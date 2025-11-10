import React, { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import mapboxgl, { Map, Marker } from "mapbox-gl";
import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";
import "mapbox-gl/dist/mapbox-gl.css";
import "@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../hooks/useAuth";
import { OfferDetailsModal } from "../components/OfferDetailsModal";
import { MerchantBottomSheet } from "../components/MerchantBottomSheet";
import { useClientNotifications } from "../hooks/useClientNotifications";

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

const MAP_STYLE = "mapbox://styles/kilicergun01/cmh4k0xk6008i01qt4f8p1mas";
// 🔧 FIX : Centre de la Turquie (au lieu d'Istanbul) pour meilleure UX
const DEFAULT_LOCATION: [number, number] = [35.2433, 38.9637]; // Centre Turquie
const DEFAULT_ZOOM = 6; // Zoom pour voir toute la Turquie

const customMapboxCSS = `
  .mapboxgl-ctrl-geolocate:focus,
  .mapboxgl-ctrl-geocoder input:focus {
    outline: none !important;
    box-shadow: none !important;
  }

  .mapboxgl-ctrl-top-right {
    top: 10px !important;
    right: 10px !important;
    display: flex !important;
    align-items: center !important;
    gap: 0px !important;
    transform: translateX(-55%) !important;
  }

  .mapboxgl-ctrl-geocoder {
    width: 280px !important;
    max-width: 80% !important;
    border-radius: 8px !important;
    box-shadow: 0 2px 6px rgba(0,0,0,0.15);
    height: 32px !important;
    font-size: 14px !important;
  }

  @media (max-width: 640px) {
    .mapboxgl-ctrl-top-right {
      top: 8px !important;
      right: 50% !important;
      transform: translateX(50%) !important;
      flex-direction: row !important;
      justify-content: center !important;
      gap: 6px !important;
    }

    .mapboxgl-ctrl-geocoder {
      width: 80% !important;
      height: 36px !important;
    }
  }

  .mapboxgl-ctrl-logo,
  .mapboxgl-ctrl-attrib,
  .mapbox-improve-map {
    display: none !important;
  }

  .mapboxgl-popup {
    z-index: 2000 !important;
  }

  .mapboxgl-popup-content {
    border-radius: 14px !important;
    box-shadow: 0 4px 10px rgba(0,0,0,0.15) !important;
    padding: 0 !important;
  }

  .mapboxgl-popup-close-button {
    top: 4px !important;
    right: 6px !important;
  }
`;

export default function OffersPage() {
  useClientNotifications();
  const { user } = useAuth();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<Map | null>(null);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [userLocation, setUserLocation] = useState<[number, number]>(DEFAULT_LOCATION);
  const [center, setCenter] = useState<[number, number]>(DEFAULT_LOCATION);
  const [radiusKm, setRadiusKm] = useState<number>(
    Number(localStorage.getItem("radiusKm")) || 10
  );
  const [clientId, setClientId] = useState<string | null>(null);
  const [clientIdFetched, setClientIdFetched] = useState(false);
  const [isGeolocating, setIsGeolocating] = useState(false);
  const [hasGeolocated, setHasGeolocated] = useState(false);
  const [viewMode, setViewMode] = useState<"nearby" | "all">("nearby");
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
  const [selectedMerchantId, setSelectedMerchantId] = useState<string | null>(null);
  const [merchantOffers, setMerchantOffers] = useState<Offer[]>([]);
  const [searchParams, setSearchParams] = useSearchParams();

  const getDiscountPercent = (before: number, after: number) => {
    if (!before || before === 0) return 0;
    return Math.round(((before - after) / before) * 100);
  };

  const getTimeRemaining = (until?: string) => {
    if (!until) return "";
    const diff = new Date(until).getTime() - Date.now();
    if (diff <= 0) return "⏰ Expirée";
    
    const totalMinutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    const days = Math.floor(hours / 24);
    
    if (hours >= 48) {
      const remainingHours = hours % 24;
      return `⏰ ${days} jour${days > 1 ? 's' : ''} ${remainingHours}h`;
    }
    
    if (hours >= 24) {
      const remainingHours = hours % 24;
      return `⏰ ${days} jour ${remainingHours}h`;
    }
    
    if (hours > 0) {
      return `⏰ ${hours}h ${minutes}min`;
    }
    
    return `⏰ ${minutes} min`;
  };

  useEffect(() => {
    const styleTag = document.createElement("style");
    styleTag.innerHTML = customMapboxCSS;
    document.head.appendChild(styleTag);
    return () => document.head.removeChild(styleTag);
  }, []);

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
          console.error("Erreur lors de la récupération du profil client :", error);
        } else if (profile) {
          setClientId(profile.id);
        } else {
          console.warn("Aucun profil client trouvé pour cet utilisateur.");
        }
      } catch (error) {
        console.error("Erreur lors de la récupération du profil client :", error);
      } finally {
        setClientIdFetched(true);
      }
    };

    fetchClientId();
  }, [user, clientIdFetched]);

  useEffect(() => {
    if (!clientId || isGeolocating || hasGeolocated) return;

    const geolocateClient = async () => {
      if (!navigator.geolocation) {
        console.warn("Géolocalisation non disponible sur cet appareil");
        setUserLocation(DEFAULT_LOCATION);
        setCenter(DEFAULT_LOCATION);
        setHasGeolocated(true);
        return;
      }

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
                zoom: 12,
                essential: true,
              });
            }
          } catch (error) {
            console.error("Erreur lors de la mise à jour de la position:", error);
          } finally {
            setIsGeolocating(false);
            setHasGeolocated(true);
          }
        },
        (error) => {
          console.warn("Géolocalisation haute précision échouée, tentative en mode économique...", error);
          
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
                    zoom: 6,
                    essential: true,
                  });
                }
              } catch (error) {
                console.error("Erreur lors de la mise à jour de la position:", error);
              } finally {
                setIsGeolocating(false);
                setHasGeolocated(true);
              }
            },
            (fallbackError) => {
              console.warn("Géolocalisation impossible:", fallbackError);
              // 🔧 FIX : Pas d'alerte, juste utiliser la position par défaut
              setUserLocation(DEFAULT_LOCATION);
              setCenter(DEFAULT_LOCATION);

              if (mapRef.current) {
                mapRef.current.flyTo({
                  center: DEFAULT_LOCATION,
                  zoom: DEFAULT_ZOOM,
                  essential: true,
                });
              }
              setIsGeolocating(false);
              setHasGeolocated(true);
            },
            { enableHighAccuracy: false, timeout: 15000, maximumAge: 300000 }
          );
        },
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
      );
    };

    geolocateClient();
  }, [clientId]);

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
      zoom: DEFAULT_ZOOM, // 🔧 FIX : Zoom 6 pour voir toute la Turquie
    });

    mapRef.current = map;

    const geolocate = new mapboxgl.GeolocateControl({
      positionOptions: { 
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      },
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
      setViewMode("nearby");
      map.flyTo({ center: [lng, lat], zoom: 12, essential: true });
      
      const input = document.querySelector(".mapboxgl-ctrl-geocoder input") as HTMLInputElement;
      if (input) input.value = "";
    });

    geolocate.on("error", (e) => {
      console.error("❌ Erreur géolocalisation:", e);
      // 🔧 FIX : Pas d'alerte, gérer silencieusement
    });

    const geocoder = new MapboxGeocoder({
      accessToken: mapboxgl.accessToken,
      mapboxgl,
      marker: false,
      placeholder: "Rechercher une adresse ou un lieu...",
      language: "fr",
    });
    map.addControl(geocoder);

    geocoder.on("result", (e) => {
      const [lng, lat] = e.result.center;
      if (!Number.isFinite(lng) || !Number.isFinite(lat)) return;
      setCenter([lng, lat]);
      setViewMode("nearby");
      map.flyTo({ center: [lng, lat], zoom: 12, essential: true });
    });

    return () => map.remove();
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const updateRadius = () => {
      if (viewMode === "nearby") {
        drawRadius(map, center, radiusKm);
      } else {
        removeRadius(map);
      }
    };

    if (!map.isStyleLoaded()) {
      map.once("load", updateRadius);
    } else {
      updateRadius();
    }
  }, [center, radiusKm, viewMode]);

  function drawRadius(map: Map, center: [number, number], radiusKm: number) {
    try {
      removeRadius(map);

      const circle = createGeoJSONCircle(center, radiusKm * 1000);
      
      map.addSource("radius", { type: "geojson", data: circle });
      map.addLayer({
        id: "radius",
        type: "fill",
        source: "radius",
        paint: { "fill-color": "#22c55e", "fill-opacity": 0.15 },
      });

      const outerPolygon = {
        type: "Feature",
        geometry: {
          type: "Polygon",
          coordinates: [
            [
              [-180, -90],
              [180, -90],
              [180, 90],
              [-180, 90],
              [-180, -90],
            ],
            circle.geometry.coordinates[0],
          ],
        },
      };

      map.addSource("outside-mask", { type: "geojson", data: outerPolygon });
      map.addLayer({
        id: "outside-mask",
        type: "fill",
        source: "outside-mask",
        paint: { "fill-color": "rgba(0,0,0,0.35)", "fill-opacity": 0.35 },
      });

      const bounds = new mapboxgl.LngLatBounds();
      circle.geometry.coordinates[0].forEach(([lng, lat]) => bounds.extend([lng, lat]));
      map.fitBounds(bounds, { padding: 50, duration: 800 });
    } catch (err) {
      console.warn("Erreur drawRadius :", err);
    }
  }

  function removeRadius(map: Map) {
    try {
      if (map.getLayer("radius")) map.removeLayer("radius");
      if (map.getSource("radius")) map.removeSource("radius");
      if (map.getLayer("outside-mask")) map.removeLayer("outside-mask");
      if (map.getSource("outside-mask")) map.removeSource("outside-mask");
    } catch (err) {
      console.warn("Erreur removeRadius :", err);
    }
  }

  useEffect(() => {
    const fetchOffers = async () => {
      if (!center || !Number.isFinite(center[0]) || !Number.isFinite(center[1])) {
        console.warn("🧭 fetchOffers skipped: invalid center", center);
        return;
      }

      try {
        let data, error;

        if (viewMode === "all") {
          const [lng, lat] = center;
          const result = await supabase.rpc("get_offers_nearby_public", {
            user_lng: lng,
            user_lat: lat,
            radius_meters: 2000000,
          });
          data = result.data;
          error = result.error;
        } else {
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
        }

        if (error) {
          console.error("❌ Erreur Supabase:", error.message);
        } else {
          console.log("✅ Données reçues depuis Supabase:", data);
        }

        setOffers(data || []);
      } catch (error) {
        console.error("❌ Erreur lors de la récupération des offres:", error);
        setOffers([]);
      }
    };

    fetchOffers();
  }, [center, clientId, viewMode, radiusKm]);

  useEffect(() => {
    const offerId = searchParams.get('offer_id');
    
    if (!offerId || !mapRef.current || offers.length === 0) return;

    const targetOffer = offers.find(o => o.offer_id === offerId);
    
    if (!targetOffer) {
      console.warn('🔍 Offre non trouvée:', offerId);
      return;
    }

    console.log('🎯 Centrage sur offre via notification:', targetOffer.title);

    if (Number.isFinite(targetOffer.offer_lng) && Number.isFinite(targetOffer.offer_lat)) {
      mapRef.current.flyTo({
        center: [targetOffer.offer_lng, targetOffer.offer_lat],
        zoom: 15,
        essential: true,
        duration: 1500
      });

      setTimeout(() => {
        setSelectedOffer(targetOffer);
        setSearchParams({}, { replace: true });
      }, 1600);
    }
  }, [searchParams, offers]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    (map as any)._markers?.forEach((m: Marker) => m.remove());
    (map as any)._markers = [];

    offers.forEach((offer) => {
      if (
        !Number.isFinite(offer.offer_lng) ||
        !Number.isFinite(offer.offer_lat)
      ) {
        return;
      }

      const el = document.createElement("div");
      el.className = "offer-marker";
      el.style.width = "42px";
      el.style.height = "42px";
      el.style.borderRadius = "50%";
      el.style.border = "3px solid #fff";
      el.style.cursor = "pointer";
      el.style.boxShadow = "0 3px 8px rgba(0,0,0,0.3)";
      el.style.overflow = "hidden";
      el.style.backgroundColor = "#f5f5f5";
      el.style.display = "flex";
      el.style.alignItems = "center";
      el.style.justifyContent = "center";

      if (offer.merchant_logo_url) {
        el.innerHTML = `<img src="${offer.merchant_logo_url}" style="width:100%;height:100%;object-fit:cover;" crossorigin="anonymous" onerror="this.onerror=null; this.src='/logo-tilkapp.png' || 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🏪</text></svg>';" />`;
      } else {
        el.innerHTML = `<img src="/logo-tilkapp.png" style="width:100%;height:100%;object-fit:cover;" crossorigin="anonymous" onerror="this.onerror=null; this.parentElement.innerHTML='<span style=font-size:24px>🏪</span>';" />`;
      }

      el.addEventListener('click', () => {
        const merchantId = offer.merchant_id || offer.merchant_name;
        setSelectedMerchantId(merchantId);
        
        const merchantProducts = offers.filter(o => 
          (o.merchant_id || o.merchant_name) === merchantId
        );
        setMerchantOffers(merchantProducts);
      });

      const marker = new mapboxgl.Marker(el)
        .setLngLat([offer.offer_lng, offer.offer_lat])
        .addTo(map);

      (map as any)._markers.push(marker);
    });
  }, [offers]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (viewMode === "all" && offers.length > 0) {
      const valid = offers.filter(
        (o) => Number.isFinite(o.offer_lng) && Number.isFinite(o.offer_lat)
      );

      if (valid.length > 0) {
        const bounds = new mapboxgl.LngLatBounds();
        valid.forEach((o) => bounds.extend([o.offer_lng, o.offer_lat]));
        map.fitBounds(bounds, { padding: 80, duration: 800 });
      }
    }
  }, [offers, viewMode]);

  const handleViewModeChange = (mode: "nearby" | "all") => {
    setViewMode(mode);
    
    if (mode === "nearby" && mapRef.current && Number.isFinite(userLocation[0]) && Number.isFinite(userLocation[1])) {
      mapRef.current.flyTo({
        center: userLocation,
        zoom: 12,
        essential: true,
      });
    }

    if (mode === "all") {
      setCenter(DEFAULT_LOCATION);
    }
  };

  const handleRadiusChange = (val: number) => {
    setRadiusKm(val);
    localStorage.setItem("radiusKm", String(val));
  };

  if (!center || !Number.isFinite(center[0]) || !Number.isFinite(center[1])) {
    console.warn("🧭 Map skipped render: invalid center", center);
    return (
      <div className="flex items-center justify-center h-[calc(100vh-100px)] bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de la carte...</p>
        </div>
      </div>
    );
  }

  const OfferCard = ({ offer, isMobile = false }: { offer: Offer; isMobile?: boolean }) => (
    <div
      key={offer.offer_id}
      className={`flex bg-white rounded-lg shadow-sm hover:shadow-md transition overflow-hidden cursor-pointer ${
        isMobile ? "h-24" : "h-28"
      }`}
      onClick={() => setSelectedOffer(offer)}
    >
      {offer.image_url && (
        <img
          src={offer.image_url}
          alt={offer.title}
          className={`${isMobile ? "w-24 h-24" : "w-28 h-28"} object-cover flex-shrink-0`}
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).style.display = "none";
          }}
        />
      )}

      <div className={`flex-1 ${isMobile ? "p-2" : "p-3"} flex flex-col justify-between`}>
        <h3 className={`font-bold text-gray-900 ${isMobile ? "text-sm" : "text-base"} line-clamp-1`}>
          {offer.title}
        </h3>

        <div className="flex items-center gap-2 flex-wrap">
          <span className={`font-bold text-green-600 ${isMobile ? "text-base" : "text-lg"}`}>
            {offer.price_after.toFixed(2)}€
          </span>
          <span className={`line-through text-gray-400 ${isMobile ? "text-xs" : "text-sm"}`}>
            {offer.price_before.toFixed(2)}€
          </span>
          <span className="text-xs text-red-600 font-semibold bg-red-50 px-1.5 py-0.5 rounded whitespace-nowrap">
            -{getDiscountPercent(offer.price_before, offer.price_after)}%
          </span>
        </div>

        {offer.available_until && (
          <div className={`${isMobile ? "text-[10px]" : "text-xs"} text-gray-600 font-medium flex items-center gap-1`}>
            <span>{getTimeRemaining(offer.available_until)}</span>
          </div>
        )}
      </div>

      <div className={`${isMobile ? "w-24 p-2" : "w-32 p-3"} border-l border-gray-100 flex flex-col items-center justify-center text-center bg-gray-50`}>
        {offer.merchant_logo_url ? (
          <img
            src={offer.merchant_logo_url}
            alt={offer.merchant_name}
            className={`${isMobile ? "w-10 h-10" : "w-12 h-12"} rounded-full object-cover mb-1 border-2 border-white shadow-sm`}
            crossOrigin="anonymous"
            referrerPolicy="no-referrer"
            onError={(e) => {
              const target = e.currentTarget as HTMLImageElement;
              target.style.display = "none";
              const parent = target.parentElement;
              if (parent) {
                const fallback = document.createElement("div");
                fallback.className = `${isMobile ? "w-10 h-10" : "w-12 h-12"} rounded-full bg-gray-200 flex items-center justify-center mb-1`;
                fallback.innerHTML = '<span class="text-lg">🏪</span>';
                parent.insertBefore(fallback, parent.firstChild);
              }
            }}
          />
        ) : (
          <div className={`${isMobile ? "w-10 h-10" : "w-12 h-12"} rounded-full bg-gray-200 flex items-center justify-center mb-1`}>
            <span className={isMobile ? "text-base" : "text-lg"}>🏪</span>
          </div>
        )}

        <p className={`font-semibold text-gray-900 ${isMobile ? "text-[10px]" : "text-xs"} line-clamp-2 mb-1 w-full px-1`}>
          {offer.merchant_name}
        </p>

        {offer.merchant_city && offer.merchant_city !== "À définir" && (
          <p className={`text-gray-600 ${isMobile ? "text-[9px]" : "text-[10px]"} line-clamp-1 w-full px-1 mb-1`}>
            📍 {offer.merchant_city}
          </p>
        )}

        {viewMode === "nearby" && offer.distance_meters > 0 && (
          <p className={`text-green-600 font-semibold ${isMobile ? "text-[10px]" : "text-xs"}`}>
            {(offer.distance_meters / 1000).toFixed(1)} km
          </p>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-100px)]">
      <div className="relative flex-1 border-r border-gray-200 h-1/2 md:h-full">
        <div ref={mapContainerRef} style={{ width: "100%", height: "100%" }} />

        {viewMode === "nearby" && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[900] bg-white rounded-full shadow-lg px-4 py-2.5 flex items-center space-x-3 border-2 border-green-500/20">
            <input
              type="range"
              min={1}
              max={30}
              value={radiusKm}
              onInput={(e) => handleRadiusChange(Number((e.target as HTMLInputElement).value))}
              className="w-32 md:w-36 accent-green-500 cursor-pointer focus:outline-none"
            />
            <span className="text-sm text-gray-900 font-bold whitespace-nowrap">{radiusKm} km</span>
          </div>
        )}
      </div>

      <div className="hidden md:block md:w-1/2 overflow-y-auto bg-gray-50 p-4">
        <div className="flex justify-center mb-6">
          <div className="flex bg-gray-100 rounded-2xl overflow-hidden shadow-sm">
            <button
              className={`px-5 py-2.5 text-sm font-semibold transition-all duration-200 ${
                viewMode === "nearby"
                  ? "bg-white text-green-700 shadow"
                  : "text-gray-500 hover:text-green-600"
              }`}
              onClick={() => handleViewModeChange("nearby")}
            >
              📍 Offres à proximité
            </button>
            <button
              className={`px-5 py-2.5 text-sm font-semibold transition-all duration-200 ${
                viewMode === "all"
                  ? "bg-white text-green-700 shadow"
                  : "text-gray-500 hover:text-green-600"
              }`}
              onClick={() => handleViewModeChange("all")}
            >
              🌍 Toutes les offres
            </button>
          </div>
        </div>

        {offers.length === 0 ? (
          <p className="text-gray-500 text-center mt-10">
            {viewMode === "nearby"
              ? "Aucune offre disponible dans ce rayon. Essayez d'augmenter la distance !"
              : "Aucune offre disponible pour le moment."}
          </p>
        ) : (
          <div className="space-y-4">
            {offers.map((o) => (
              <OfferCard key={o.offer_id} offer={o} />
            ))}
          </div>
        )}
      </div>

      <MerchantBottomSheet
        merchantId={selectedMerchantId}
        offers={merchantOffers}
        onClose={() => {
          setSelectedMerchantId(null);
          setMerchantOffers([]);
        }}
        onOfferClick={(offer) => setSelectedOffer(offer)}
      />

      <OfferDetailsModal
        offer={selectedOffer}
        onClose={() => setSelectedOffer(null)}
        onOfferChange={(newOffer) => setSelectedOffer(newOffer)}
      />
    </div>
  );
}

export function createGeoJSONCircle(
  center: [number, number],
  radiusInMeters: number,
  points = 64
) {
  const coords = { latitude: center[1], longitude: center[0] };
  const km = radiusInMeters / 1000;
  const ret: [number, number][] = [];

  const distanceX = km / (111.32 * Math.cos((coords.latitude * Math.PI) / 180));
  const distanceY = km / 110.574;

  for (let i = 0; i < points; i++) {
    const theta = (i / points) * (2 * Math.PI);
    const x = distanceX * Math.cos(theta);
    const y = distanceY * Math.sin(theta);
    ret.push([coords.longitude + x, coords.latitude + y]);
  }

  ret.push(ret[0]);

  return {
    type: "Feature",
    geometry: {
      type: "Polygon",
      coordinates: [ret],
    },
  };
}