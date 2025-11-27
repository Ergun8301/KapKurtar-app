import React, { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import mapboxgl, { Map, Marker } from "mapbox-gl";
import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";
import "mapbox-gl/dist/mapbox-gl.css";
import "@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css";
import { Geolocation } from "@capacitor/geolocation";
import { Clock, Search, MapPin, Globe, Loader2 } from "lucide-react";
import SEO from "../components/SEO";
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
  .mapboxgl-ctrl-geocoder input:focus {
    outline: none !important;
    box-shadow: none !important;
  }

  /* Geocoder positionné en haut, sous le header */
  .mapboxgl-ctrl-top-right {
    top: 70px !important;
    left: 50% !important;
    right: auto !important;
    transform: translateX(-50%) !important;
    z-index: 100 !important;
  }

  .mapboxgl-ctrl-geocoder {
    width: 320px !important;
    max-width: 90vw !important;
    border-radius: 12px !important;
    box-shadow: 0 2px 8px rgba(0,0,0,0.15) !important;
    height: 44px !important;
    font-size: 15px !important;
  }

  .mapboxgl-ctrl-geocoder input {
    height: 44px !important;
    padding: 8px 40px !important;
  }

  .mapboxgl-ctrl-geocoder .mapboxgl-ctrl-geocoder--icon-search {
    top: 12px !important;
    left: 12px !important;
  }

  /* Mobile : Cacher le Geocoder Mapbox (on utilise notre propre barre de recherche) */
  @media (max-width: 768px) {
    .mapboxgl-ctrl-geocoder,
    .mapboxgl-ctrl-top-right {
      display: none !important;
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
  const [viewMode, setViewMode] = useState<"nearby" | "all">("all");
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
  const [selectedMerchantId, setSelectedMerchantId] = useState<string | null>(null);
  const [merchantOffers, setMerchantOffers] = useState<Offer[]>([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchAddress, setSearchAddress] = useState("");
  const [addressSuggestions, setAddressSuggestions] = useState<Array<{ place_name: string; center: [number, number] }>>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const getDiscountPercent = (before: number, after: number) => {
    if (!before || before === 0) return 0;
    return Math.round(((before - after) / before) * 100);
  };

  const getTimeRemaining = (until?: string) => {
    if (!until) return "";
    const diff = new Date(until).getTime() - Date.now();
    if (diff <= 0) return "⏰ Süresi Doldu";

    const totalMinutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    const days = Math.floor(hours / 24);

    if (hours >= 48) {
      const remainingHours = hours % 24;
      return `⏰ ${days} gün ${remainingHours}s`;
    }

    if (hours >= 24) {
      const remainingHours = hours % 24;
      return `⏰ ${days} gün ${remainingHours}s`;
    }

    if (hours > 0) {
      return `⏰ ${hours}s ${minutes}dk`;
    }

    return `⏰ ${minutes} dk`;
  };

  const getProgressPercent = (availableFrom?: string, availableUntil?: string) => {
    if (!availableFrom || !availableUntil) return 0;

    const now = new Date();
    const start = new Date(availableFrom);
    const end = new Date(availableUntil);

    const total = end.getTime() - start.getTime();
    const remaining = end.getTime() - now.getTime();

    if (remaining <= 0) return 0;
    if (remaining >= total) return 100;

    return Math.max(0, Math.min(100, (remaining / total) * 100));
  };

  useEffect(() => {
    const styleTag = document.createElement("style");
    styleTag.innerHTML = customMapboxCSS;
    document.head.appendChild(styleTag);
    return () => document.head.removeChild(styleTag);
  }, []);

  // Debug: vérifier que le plugin Geolocation est disponible
  useEffect(() => {
    console.log("🔍 Capacitor Geolocation plugin available:", !!Geolocation);
    console.log("🔍 Geolocation methods:", Object.keys(Geolocation));
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

    // Geocoder (barre de recherche) - seul contrôle Mapbox conservé
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

  // 🔔 Refresh offres en temps réel via notifications
  useEffect(() => {
    if (!clientId) return;

    const channel = supabase
      .channel(`client_offers_refresh_${clientId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `recipient_id=eq.${clientId}`,
        },
        (payload: any) => {
          const notification = payload.new;

          // Si notification d'offre, recharger la liste
          if (notification.type === 'offer' || notification.type === 'offer_nearby') {
            console.log('🔔 Nouvelle offre → Refresh automatique');

            const fetchOffersRefresh = async () => {
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
                  const result = await supabase.rpc("get_offers_nearby_dynamic_secure", {
                    client_id: clientId,
                    radius_meters: radiusKm * 1000,
                  });
                  data = result.data;
                  error = result.error;
                }

                if (!error) {
                  setOffers(data || []);
                }
              } catch (error) {
                console.error('Erreur refresh offres:', error);
              }
            };

            fetchOffersRefresh();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [clientId, center, viewMode, radiusKm]);

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
  el.innerHTML = `<img src="${offer.merchant_logo_url}" style="width:100%;height:100%;object-fit:cover;" crossorigin="anonymous" onerror="this.onerror=null; this.src='https://zhabjdyzawffsmvziojl.supabase.co/storage/v1/object/public/logos/FAVICON%20MINI%20rond%20fond%20vert.png';" />`;
} else {
  el.innerHTML = `<img src="https://zhabjdyzawffsmvziojl.supabase.co/storage/v1/object/public/logos/FAVICON%20MINI%20rond%20fond%20vert.png" style="width:100%;height:100%;object-fit:cover;" crossorigin="anonymous" onerror="this.onerror=null; this.parentElement.innerHTML='<span style=font-size:24px>🏪</span>';" />`;
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

  // 📍 Fonction de géolocalisation pour le bouton Yakında (utilise Capacitor plugin)
  const handleGeolocate = async () => {
    console.log("=== GEOLOCATION START ===");
    setIsGeolocating(true);

    try {
      // Demander la permission via le plugin Capacitor
      console.log("Requesting permissions...");
      const permission = await Geolocation.requestPermissions();
      console.log("Permission result:", JSON.stringify(permission));

      // Vérifier si au moins une permission est accordée
      const hasPermission = permission.location === 'granted' || permission.coarseLocation === 'granted';

      if (!hasPermission) {
        console.warn("Permission de géolocalisation refusée:", permission);

        // Proposer d'ouvrir les paramètres de l'app
        const openSettings = window.confirm("Lütfen GPS'i açın");

        if (openSettings) {
          // Ouvrir les paramètres de l'app Android
          window.open('app-settings:', '_system');
        }

        setIsGeolocating(false);
        return;
      }

      console.log("Permission granted, getting position...");

      try {
        // Obtenir la position via le plugin Capacitor (timeout 10 secondes)
        const position = await Geolocation.getCurrentPosition({
          enableHighAccuracy: true,
          timeout: 10000,
        });

        console.log("Position received:", JSON.stringify(position.coords));

        const lng = position.coords.longitude;
        const lat = position.coords.latitude;

        console.log("Coordinates - lng:", lng, "lat:", lat);

        if (!Number.isFinite(lng) || !Number.isFinite(lat)) {
          console.error("Invalid coordinates!");
          setIsGeolocating(false);
          return;
        }

        // Mettre à jour la position AVANT de changer le mode
        console.log("Updating state: userLocation, center, viewMode...");
        setUserLocation([lng, lat]);
        setCenter([lng, lat]);
        setViewMode("nearby");

        // Fly to position
        if (mapRef.current) {
          console.log("Flying to position...");
          mapRef.current.flyTo({
            center: [lng, lat],
            zoom: 13,
            essential: true,
          });
        }

        // Effacer le champ de recherche
        const input = document.querySelector(".mapboxgl-ctrl-geocoder input") as HTMLInputElement;
        if (input) input.value = "";

        console.log("=== GEOLOCATION SUCCESS ===");

      } catch (positionError: any) {
        console.error("=== POSITION ERROR ===", positionError);

        // GPS désactivé → Proposer d'ouvrir les paramètres de localisation
        const openSettings = window.confirm("Lütfen GPS'i açın");

        if (openSettings) {
          // Ouvrir les paramètres de localisation Android
          try {
            // Méthode Android : intent pour ouvrir les paramètres de localisation
            window.location.href = 'intent://settings/location_source#Intent;scheme=android-app;package=com.android.settings;end';
          } catch (e) {
            console.log("Intent failed, trying app-settings");
            window.open('app-settings:', '_system');
          }
        }
      }

    } catch (error) {
      console.error("=== GEOLOCATION ERROR ===", error);

      // Erreur générale → Proposer d'ouvrir les paramètres
      const openSettings = window.confirm("Lütfen GPS'i açın");

      if (openSettings) {
        window.open('app-settings:', '_system');
      }
    } finally {
      console.log("=== GEOLOCATION END ===");
      setIsGeolocating(false);
    }
  };

  // 🔍 Fonction de recherche d'adresse avec autocomplete
  const fetchAddressSuggestions = async (query: string) => {
    if (!query.trim() || query.length < 2) {
      setAddressSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${mapboxgl.accessToken}&limit=5&language=tr`
      );
      const data = await response.json();

      if (data.features && data.features.length > 0) {
        setAddressSuggestions(
          data.features.map((f: any) => ({
            place_name: f.place_name,
            center: f.center as [number, number],
          }))
        );
        setShowSuggestions(true);
      } else {
        setAddressSuggestions([]);
        setShowSuggestions(false);
      }
    } catch (error) {
      console.error("Autocomplete hatası:", error);
      setAddressSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleAddressInputChange = (value: string) => {
    setSearchAddress(value);

    // Debounce les appels API
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

    if (mapRef.current) {
      mapRef.current.flyTo({
        center: [lng, lat],
        zoom: 13,
        duration: 1500
      });
    }
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

        if (mapRef.current) {
          mapRef.current.flyTo({
            center: [lng, lat],
            zoom: 13,
            duration: 1500
          });
        }
      } else {
        alert("Adres bulunamadı. Lütfen farklı bir adres deneyin.\n\n(Address not found. Please try a different address.)");
      }
    } catch (error) {
      console.error("Adres arama hatası:", error);
      alert("Adres arama hatası. Lütfen tekrar deneyin.");
    }
  };

  if (!center || !Number.isFinite(center[0]) || !Number.isFinite(center[1])) {
    console.warn("🧭 Map skipped render: invalid center", center);
    return (
      <div className="flex items-center justify-center h-[calc(100vh-100px)] bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00A690] mx-auto mb-4"></div>
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
          <span className={`font-bold text-[#00A690] ${isMobile ? "text-base" : "text-lg"}`}>
            {offer.price_after.toFixed(2)}₺
          </span>
          <span className={`line-through text-gray-400 ${isMobile ? "text-xs" : "text-sm"}`}>
            {offer.price_before.toFixed(2)}₺
          </span>
          <span className="text-xs text-red-600 font-semibold bg-red-50 px-1.5 py-0.5 rounded whitespace-nowrap">
            -{getDiscountPercent(offer.price_before, offer.price_after)}%
          </span>
        </div>

        {offer.available_until && (
          <div className="space-y-1">
            <div className={`${isMobile ? "text-[10px]" : "text-xs"} text-gray-700 font-semibold`}>
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
  <img
    src="https://zhabjdyzawffsmvziojl.supabase.co/storage/v1/object/public/logos/FAVICON%20MINI%20rond%20fond%20vert.png"
    alt="KapKurtar"
    className={`${isMobile ? "w-10 h-10" : "w-12 h-12"} rounded-full object-cover mb-1 border-2 border-white shadow-sm`}
    crossOrigin="anonymous"
    referrerPolicy="no-referrer"
  />
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
          <p className={`text-[#00A690] font-semibold ${isMobile ? "text-[10px]" : "text-xs"}`}>
            {(offer.distance_meters / 1000).toFixed(1)} km
          </p>
        )}
      </div>
    </div>
  );

  return (
    <>
      <SEO
        title="İndirimli Yemek Fırsatları - KapKurtar"
        description="Yakınınızdaki restoranlar, fırınlar ve marketlerden %70 indirimli yemek fırsatları. Haritada keşfet, rezerve et, kazan!"
        canonical="/offers"
        keywords="indirimli yemek, ucuz yemek harita, yakındaki fırsatlar, fazla gıda"
      />
      <div className="flex flex-col md:flex-row h-[calc(100vh-100px)]">
        <div className="relative flex-1 border-r border-gray-200 h-1/2 md:h-full">
          <div ref={mapContainerRef} style={{ width: "100%", height: "100%" }} />

        {/* Slider desktop - visible seulement en mode nearby sur desktop */}
        {viewMode === "nearby" && (
          <div className="hidden md:flex absolute bottom-4 left-1/2 -translate-x-1/2 z-[900] bg-white rounded-full shadow-lg px-4 py-2.5 items-center space-x-3 border-2 border-[#00A690]/20">
            <input
              type="range"
              min={1}
              max={30}
              value={radiusKm}
              onInput={(e) => handleRadiusChange(Number((e.target as HTMLInputElement).value))}
              className="w-32 md:w-36 accent-[#00A690] cursor-pointer focus:outline-none"
            />
            <span className="text-sm text-gray-900 font-bold whitespace-nowrap">{radiusKm} km</span>
          </div>
        )}

        {/* 📱 CONTRÔLES MOBILES - Recherche + Boutons + Slider */}
        <div className="md:hidden absolute bottom-4 left-0 right-0 z-[901] px-3 space-y-2">

          {/* Barre de recherche d'adresse avec autocomplete */}
          <div className="relative">
            <input
              type="text"
              placeholder="Adres ara... (örn: Kadıköy, İstanbul)"
              className="w-full py-3 px-4 pl-11 bg-white rounded-xl shadow-lg text-sm border border-gray-100 focus:ring-2 focus:ring-[#00A690] focus:outline-none focus:border-transparent"
              value={searchAddress}
              onChange={(e) => handleAddressInputChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleAddressSearch();
                }
              }}
              onBlur={() => {
                // Délai pour permettre le clic sur une suggestion
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

            {/* Liste des suggestions d'adresse */}
            {showSuggestions && addressSuggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-[1000]">
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

          {/* Boutons Yakında / Tümü */}
          <div className="bg-white rounded-xl shadow-lg p-1 flex border border-gray-100">
            <button
              onClick={handleGeolocate}
              disabled={isGeolocating}
              className={`flex-1 py-3 rounded-lg flex items-center justify-center gap-2 font-medium transition-all ${
                viewMode === "nearby"
                  ? "bg-[#00A690] text-white"
                  : "bg-transparent text-gray-600"
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
              className={`flex-1 py-3 rounded-lg flex items-center justify-center gap-2 font-medium transition-all ${
                viewMode === "all"
                  ? "bg-[#00A690] text-white"
                  : "bg-transparent text-gray-600"
              }`}
            >
              <Globe className="w-4 h-4" />
              <span className="text-sm">Tümü</span>
            </button>
          </div>

          {/* Slider de rayon - visible seulement en mode nearby */}
          {viewMode === "nearby" && (
            <div className="bg-white rounded-xl shadow-lg p-3 flex items-center gap-3 border border-gray-100">
              <span className="text-xs text-gray-500 whitespace-nowrap">Yarıçap:</span>
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

      <div className="hidden md:block md:w-1/2 overflow-y-auto bg-gray-50 p-4">
        <div className="flex justify-center mb-6">
          <div className="flex bg-gray-100 rounded-2xl overflow-hidden shadow-sm">
            <button
              className={`px-5 py-2.5 text-sm font-semibold transition-all duration-200 ${
                viewMode === "nearby"
                  ? "bg-white text-[#00A690] shadow"
                  : "text-gray-500 hover:text-[#00A690]"
              }`}
              onClick={() => handleViewModeChange("nearby")}
            >
              📍 Yakındaki Teklifler
            </button>
            <button
              className={`px-5 py-2.5 text-sm font-semibold transition-all duration-200 ${
                viewMode === "all"
                  ? "bg-white text-[#00A690] shadow"
                  : "text-gray-500 hover:text-[#00A690]"
              }`}
              onClick={() => handleViewModeChange("all")}
            >
              🌍 Tüm Teklifler
            </button>
          </div>
        </div>

        {offers.length === 0 ? (
          <p className="text-gray-500 text-center mt-10">
            {viewMode === "nearby"
              ? "Bu yarıçapta teklif bulunmuyor. Mesafeyi artırmayı deneyin!"
              : "Şu anda teklif bulunmuyor."}
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
    </>
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