import React, { useEffect, useRef, useState } from "react";
import mapboxgl, { Map, Marker } from "mapbox-gl";
import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";
import "mapbox-gl/dist/mapbox-gl.css";
import "@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../hooks/useAuth";

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
    z-index: 2500 !important;
  }

  .mapboxgl-popup-content {
    border-radius: 12px !important;
    box-shadow: 0 4px 12px rgba(0,0,0,0.2) !important;
    padding: 0 !important;
    max-width: 260px !important;
  }

  .mapboxgl-popup-close-button {
    top: 6px !important;
    right: 6px !important;
    font-size: 20px !important;
    color: #666 !important;
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
  const [viewMode, setViewMode] = useState<"nearby" | "all">("nearby");
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
  const [selectedMerchant, setSelectedMerchant] = useState<MerchantGroup | null>(null);

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

  // 🔋 Calcul du pourcentage de temps restant (pour la barre)
  const getTimeProgress = (from?: string, until?: string) => {
    if (!from || !until) return 0;
    const now = Date.now();
    const start = new Date(from).getTime();
    const end = new Date(until).getTime();
    const total = end - start;
    const remaining = end - now;
    if (total <= 0) return 0;
    return Math.max(0, Math.min(100, (remaining / total) * 100));
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
                zoom: 12,
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
              zoom: 6,
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
      zoom: 7,
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
      setViewMode("nearby");
      map.flyTo({ center: [lng, lat], zoom: 12, essential: true });
      
      const input = document.querySelector(".mapboxgl-ctrl-geocoder input") as HTMLInputElement;
      if (input) input.value = "";
    });

    // Barre de recherche
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

  // ⭕ Gestion du cercle de rayon (seulement en mode "nearby")
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

  // 📦 Chargement des offres depuis Supabase
  useEffect(() => {
    const fetchOffers = async () => {
      if (!center || !Number.isFinite(center[0]) || !Number.isFinite(center[1])) {
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
  }, [center, clientId, viewMode, radiusKm]);

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

  // 📍 Ajout des marqueurs marchands sur la carte avec popup Version B
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

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

      // 🎨 Création du marqueur avec logo (15% plus grand)
      const el = document.createElement("div");
      el.className = "merchant-marker";
      el.style.width = "42px";
      el.style.height = "42px";
      el.style.borderRadius = "50%";
      el.style.border = "3px solid #fff";
      el.style.cursor = "pointer";
      el.style.boxShadow = "0 2px 6px rgba(0,0,0,0.25)";
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
        el.innerHTML = `<span style="font-size:20px;">🏪</span>`;
      }

      // 📦 Popup Version B - orienté marchand
      const displayedOffers = merchant.offers.slice(0, 3);
      
      const popupHTML = `
        <div style="width:260px;font-family:-apple-system,sans-serif;border-radius:12px;overflow:hidden;">
          
          <!-- 🏪 Bandeau haut marchand -->
          <div style="background:#f9fafb;padding:12px;border-bottom:1px solid #e5e7eb;display:flex;align-items:center;gap:10px;">
            ${
              merchant.merchant_logo_url
                ? `<img src="${merchant.merchant_logo_url}" style="width:42px;height:42px;border-radius:50%;object-fit:cover;border:2px solid #fff;" crossorigin="anonymous" />`
                : `<div style="width:42px;height:42px;border-radius:50%;background:#e5e7eb;display:flex;align-items:center;justify-content:center;font-size:20px;">🏪</div>`
            }
            <div style="flex:1;">
              <div style="font-size:14px;font-weight:600;color:#111;margin-bottom:2px;">
                ${merchant.merchant_name}
              </div>
              <div style="font-size:11px;color:#666;">
                ${merchant.offers.length} offre${merchant.offers.length > 1 ? 's' : ''} disponible${merchant.offers.length > 1 ? 's' : ''}
              </div>
            </div>
            <button 
              class="view-all-merchant-btn"
              data-merchant-id="${merchant.merchant_id}"
              style="background:none;border:none;color:#22c55e;font-size:18px;cursor:pointer;padding:4px;"
              title="Voir toutes les offres"
            >
              →
            </button>
          </div>

          <!-- 📦 Vignettes produits -->
          <div style="padding:8px;display:flex;gap:6px;overflow-x:auto;">
            ${displayedOffers.map((offer) => `
              <div 
                class="offer-mini-card"
                data-offer-id="${offer.offer_id}"
                style="
                  min-width:72px;
                  cursor:pointer;
                  border-radius:8px;
                  overflow:hidden;
                  border:1px solid #e5e7eb;
                  background:#fff;
                "
              >
                <img 
                  src="${offer.image_url}" 
                  style="width:72px;height:60px;object-fit:cover;display:block;"
                  crossorigin="anonymous"
                />
                <div style="padding:4px;text-align:center;">
                  <div style="font-size:12px;font-weight:600;color:#22c55e;">
                    ${offer.price_after.toFixed(2)}€
                  </div>
                  <div style="font-size:9px;color:#ef4444;font-weight:600;">
                    -${getDiscountPercent(offer.price_before, offer.price_after)}%
                  </div>
                </div>
              </div>
            `).join('')}
          </div>

          <!-- 📞 Infos bas + bouton principal -->
          <div style="padding:10px;background:#f9fafb;border-top:1px solid #e5e7eb;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;font-size:11px;color:#666;">
              ${merchant.merchant_phone ? `<span>📞 ${merchant.merchant_phone}</span>` : '<span></span>'}
              ${merchant.merchant_city ? `<span>📍 ${merchant.merchant_city}</span>` : '<span></span>'}
            </div>
            <button
              class="view-all-merchant-btn-main"
              data-merchant-id="${merchant.merchant_id}"
              style="
                width:100%;
                background:#22c55e;
                color:#fff;
                border:none;
                border-radius:8px;
                padding:8px;
                font-size:13px;
                font-weight:600;
                cursor:pointer;
              "
            >
              Voir toutes les offres
            </button>
          </div>
        </div>
      `;

      const popup = new mapboxgl.Popup({ offset: 25, maxWidth: "280px" }).setHTML(popupHTML);

      popup.on('open', () => {
        setTimeout(() => {
          // Listeners sur les mini-cartes produits
          displayedOffers.forEach((offer) => {
            const miniCard = document.querySelector(`[data-offer-id="${offer.offer_id}"]`) as HTMLElement;
            if (miniCard && !miniCard.dataset.listenerAdded) {
              const handleClick = () => setSelectedOffer(offer);
              miniCard.addEventListener('click', handleClick);
              miniCard.dataset.listenerAdded = 'true';

              popup.on('close', () => {
                miniCard.removeEventListener('click', handleClick);
                delete miniCard.dataset.listenerAdded;
              });
            }
          });

          // Listeners sur les boutons "Voir toutes les offres"
          const btns = [
            document.querySelector(`[data-merchant-id="${merchant.merchant_id}"].view-all-merchant-btn`),
            document.querySelector(`[data-merchant-id="${merchant.merchant_id}"].view-all-merchant-btn-main`)
          ];

          btns.forEach((btn) => {
            if (btn && !(btn as HTMLElement).dataset.listenerAdded) {
              const handleClick = () => setSelectedMerchant(merchant);
              btn.addEventListener('click', handleClick);
              (btn as HTMLElement).dataset.listenerAdded = 'true';

              popup.on('close', () => {
                btn.removeEventListener('click', handleClick);
                delete (btn as HTMLElement).dataset.listenerAdded;
              });
            }
          });
        }, 10);
      });

      const marker = new mapboxgl.Marker(el)
        .setLngLat([merchant.merchant_lng, merchant.merchant_lat])
        .setPopup(popup)
        .addTo(map);

      (map as any)._markers = (map as any)._markers || [];
      (map as any)._markers.push(marker);
    });
  }, [merchantGroups]);

  // 🌍 Ajustement de la vue carte en mode "all"
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

  // 🔄 Gestion du changement de mode de vue
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

  // 📏 Gestion du changement de rayon
  const handleRadiusChange = (val: number) => {
    setRadiusKm(val);
    localStorage.setItem("radiusKm", String(val));
  };

  // 🚨 Protection contre les coordonnées invalides
  if (!center || !Number.isFinite(center[0]) || !Number.isFinite(center[1])) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-100px)] bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de la carte...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-100px)]">
      {/* 🗺️ CARTE */}
      <div className="relative flex-1 border-r border-gray-200 h-1/2 md:h-full">
        <div ref={mapContainerRef} style={{ width: "100%", height: "100%" }} />

        {/* Slider de rayon (visible uniquement en mode proximité) */}
        {viewMode === "nearby" && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[1000] bg-white rounded-full shadow px-3 py-1 flex items-center space-x-2 border border-gray-200">
            <input
              type="range"
              min={1}
              max={30}
              value={radiusKm}
              onInput={(e) => handleRadiusChange(Number((e.target as HTMLInputElement).value))}
              className="w-36 accent-green-500 cursor-pointer focus:outline-none"
            />
            <span className="text-sm text-gray-700 font-medium">{radiusKm} km</span>
          </div>
        )}
      </div>

      {/* 📋 LISTE DES OFFRES - DESKTOP */}
      <div className="hidden md:block md:w-1/2 overflow-y-auto bg-gray-50 p-4">
        {/* 🔘 Toggle entre les modes de vue */}
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
          <div className="space-y-3">
            {offers.map((offer) => (
              <OfferCardHorizontal 
                key={offer.offer_id} 
                offer={offer} 
                onClick={() => setSelectedOffer(offer)}
                getDiscountPercent={getDiscountPercent}
                getTimeRemaining={getTimeRemaining}
                getTimeProgress={getTimeProgress}
                viewMode={viewMode}
              />
            ))}
          </div>
        )}
      </div>

      {/* 📱 PANNEAU MOBILE COULISSANT */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-lg z-[1500] max-h-[50vh] overflow-y-auto">
        <div className="flex justify-center pt-2 pb-1">
          <div className="w-12 h-1 bg-gray-300 rounded-full"></div>
        </div>

        <div className="flex justify-center px-4 pb-3">
          <div className="flex bg-gray-100 rounded-2xl overflow-hidden shadow-sm">
            <button
              className={`px-4 py-2 text-xs font-semibold transition-all duration-200 ${
                viewMode === "nearby"
                  ? "bg-white text-green-700 shadow"
                  : "text-gray-500 hover:text-green-600"
              }`}
              onClick={() => handleViewModeChange("nearby")}
            >
              📍 Proximité
            </button>
            <button
              className={`px-4 py-2 text-xs font-semibold transition-all duration-200 ${
                viewMode === "all"
                  ? "bg-white text-green-700 shadow"
                  : "text-gray-500 hover:text-green-600"
              }`}
              onClick={() => handleViewModeChange("all")}
            >
              🌍 Toutes
            </button>
          </div>
        </div>

        <div className="px-4 pb-4 space-y-3">
          {offers.length === 0 ? (
            <p className="text-gray-500 text-center text-sm py-6">
              {viewMode === "nearby"
                ? "Aucune offre à proximité"
                : "Aucune offre disponible"}
            </p>
          ) : (
            offers.map((offer) => (
              <OfferCardMobile 
                key={offer.offer_id} 
                offer={offer} 
                onClick={() => setSelectedOffer(offer)}
                getDiscountPercent={getDiscountPercent}
                getTimeRemaining={getTimeRemaining}
                getTimeProgress={getTimeProgress}
              />
            ))
          )}
        </div>
      </div>

      {/* 🔍 MODALE DÉTAILS OFFRE AMÉLIORÉE */}
      {selectedOffer && (
        <ImprovedOfferModal
          offer={selectedOffer}
          merchantOffers={offers.filter(o => o.merchant_name === selectedOffer.merchant_name && o.offer_id !== selectedOffer.offer_id)}
          onClose={() => setSelectedOffer(null)}
          getDiscountPercent={getDiscountPercent}
          getTimeRemaining={getTimeRemaining}
        />
      )}

      {/* 🏪 MODALE MARCHAND (toutes ses offres) */}
      {selectedMerchant && (
        <MerchantModal
          merchant={selectedMerchant}
          onClose={() => setSelectedMerchant(null)}
          onSelectOffer={(offer) => {
            setSelectedMerchant(null);
            setSelectedOffer(offer);
          }}
          getDiscountPercent={getDiscountPercent}
          getTimeRemaining={getTimeRemaining}
        />
      )}
    </div>
  );
}

// 💻 CARTE OFFRE HORIZONTALE DESKTOP (3 lignes max, bien équilibrée)
const OfferCardHorizontal = ({ 
  offer, 
  onClick, 
  getDiscountPercent,
  getTimeRemaining,
  getTimeProgress,
  viewMode
}: { 
  offer: Offer; 
  onClick: () => void;
  getDiscountPercent: (before: number, after: number) => number;
  getTimeRemaining: (until?: string) => string;
  getTimeProgress: (from?: string, until?: string) => number;
  viewMode: string;
}) => {
  const progress = getTimeProgress(offer.available_from, offer.available_until);
  let progressColor = "#22c55e";
  if (progress < 60) progressColor = "#facc15";
  if (progress < 30) progressColor = "#ef4444";

  return (
    <div
      className="bg-white rounded-xl shadow-sm hover:shadow-md transition overflow-hidden cursor-pointer relative"
      onClick={onClick}
    >
      <div className="flex items-center h-[100px]">
        {/* Photo produit */}
        <img
          src={offer.image_url}
          alt={offer.title}
          className="w-24 h-full object-cover flex-shrink-0"
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
        />

        {/* Zone centrale - 3 lignes */}
        <div className="flex-1 px-4 py-2">
          {/* Ligne 1: Logo + Nom marchand */}
          <div className="flex items-center gap-2 mb-1">
            {offer.merchant_logo_url ? (
              <img
                src={offer.merchant_logo_url}
                alt={offer.merchant_name}
                className="w-6 h-6 rounded-full object-cover"
                crossOrigin="anonymous"
              />
            ) : (
              <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs">
                🏪
              </div>
            )}
            <span className="font-semibold text-gray-900 text-[14px]">
              {offer.merchant_name}
            </span>
          </div>

          {/* Ligne 2: Titre + Prix + Badge */}
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-bold text-gray-900 text-[13px] truncate flex-1 mr-3">
              {offer.title}
            </h3>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="text-base font-bold text-green-600">
                {offer.price_after.toFixed(2)}€
              </span>
              <span className="text-xs text-gray-400 line-through">
                {offer.price_before.toFixed(2)}€
              </span>
              <span className="bg-white text-red-600 font-bold text-[11px] px-1.5 py-0.5 rounded border border-red-200">
                -{getDiscountPercent(offer.price_before, offer.price_after)}%
              </span>
            </div>
          </div>

          {/* Ligne 3: Timer + Distance + Téléphone */}
          <div className="flex items-center gap-3 text-[11px] text-gray-600">
            {offer.available_until && (
              <span className="flex items-center gap-1">
                ⏱ {getTimeRemaining(offer.available_until)}
              </span>
            )}
            {viewMode === "nearby" && offer.distance_meters > 0 && (
              <span className="flex items-center gap-1 text-green-600 font-semibold">
                📍 {(offer.distance_meters / 1000).toFixed(1)} km
              </span>
            )}
            {offer.merchant_phone && (
              <span className="flex items-center gap-1">
                📞 {offer.merchant_phone}
              </span>
            )}
          </div>
        </div>

        {/* Adresse à droite */}
        <div className="px-4 text-right text-[11px] text-gray-600 w-32 flex-shrink-0">
          {offer.merchant_street && <div>{offer.merchant_street}</div>}
          {offer.merchant_city && <div className="font-medium">{offer.merchant_city}</div>}
        </div>
      </div>

      {/* Barre de progression temps restant */}
      <div className="h-1 w-full bg-gray-200">
        <div 
          className="h-full transition-all duration-300"
          style={{ 
            width: `${progress}%`,
            backgroundColor: progressColor
          }}
        />
      </div>
    </div>
  );
};

// 📱 CARTE OFFRE MOBILE (compacte)
const OfferCardMobile = ({ 
  offer, 
  onClick,
  getDiscountPercent,
  getTimeRemaining,
  getTimeProgress
}: { 
  offer: Offer; 
  onClick: () => void;
  getDiscountPercent: (before: number, after: number) => number;
  getTimeRemaining: (until?: string) => string;
  getTimeProgress: (from?: string, until?: string) => number;
}) => {
  const progress = getTimeProgress(offer.available_from, offer.available_until);
  let progressColor = "#22c55e";
  if (progress < 60) progressColor = "#facc15";
  if (progress < 30) progressColor = "#ef4444";

  return (
    <div
      className="bg-white rounded-xl shadow-sm overflow-hidden cursor-pointer relative"
      onClick={onClick}
    >
      <div className="flex h-20">
        <img
          src={offer.image_url}
          alt={offer.title}
          className="w-20 h-20 object-cover"
          crossOrigin="anonymous"
        />
        <div className="flex-1 p-2">
          <div className="flex items-center gap-1.5 mb-1">
            {offer.merchant_logo_url ? (
              <img
                src={offer.merchant_logo_url}
                alt={offer.merchant_name}
                className="w-5 h-5 rounded-full object-cover"
                crossOrigin="anonymous"
              />
            ) : (
              <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center text-[10px]">
                🏪
              </div>
            )}
            <span className="font-semibold text-gray-900 text-xs truncate">
              {offer.merchant_name}
            </span>
          </div>
          <h3 className="font-bold text-sm text-gray-900 mb-1 truncate">
            {offer.title}
          </h3>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-bold text-green-600">
                {offer.price_after.toFixed(2)}€
              </span>
              <span className="text-[10px] text-gray-400 line-through">
                {offer.price_before.toFixed(2)}€
              </span>
              <span className="bg-white text-red-600 font-bold text-[10px] px-1 py-0.5 rounded border border-red-200">
                -{getDiscountPercent(offer.price_before, offer.price_after)}%
              </span>
            </div>
            {offer.available_until && (
              <span className="text-[10px] text-gray-500">
                ⏱ {getTimeRemaining(offer.available_until)}
              </span>
            )}
          </div>
        </div>
      </div>
      <div className="h-1 w-full bg-gray-200">
        <div 
          className="h-full"
          style={{ 
            width: `${progress}%`,
            backgroundColor: progressColor
          }}
        />
      </div>
    </div>
  );
};

// 🔍 MODALE DÉTAILS OFFRE AMÉLIORÉE (2 colonnes desktop)
const ImprovedOfferModal = ({
  offer,
  merchantOffers,
  onClose,
  getDiscountPercent,
  getTimeRemaining
}: {
  offer: Offer;
  merchantOffers: Offer[];
  onClose: () => void;
  getDiscountPercent: (before: number, after: number) => number;
  getTimeRemaining: (until?: string) => string;
}) => {
  return (
    <div 
      className="fixed inset-0 bg-black/50 z-[3000] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[70vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Bandeau supérieur: Logo + Nom + Titre */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-4 z-10">
          {offer.merchant_logo_url ? (
            <img
              src={offer.merchant_logo_url}
              alt={offer.merchant_name}
              className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
              crossOrigin="anonymous"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-xl">
              🏪
            </div>
          )}
          <div className="flex-1">
            <h2 className="font-bold text-xl text-gray-900">{offer.title}</h2>
            <p className="text-sm text-gray-600">{offer.merchant_name}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl font-light"
          >
            ×
          </button>
        </div>

        {/* Contenu principal: 2 colonnes sur desktop */}
        <div className="p-6">
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {/* Colonne gauche: Photo */}
            <div>
              <img
                src={offer.image_url}
                alt={offer.title}
                className="w-full h-64 md:h-80 object-cover rounded-xl"
                crossOrigin="anonymous"
              />
            </div>

            {/* Colonne droite: Infos */}
            <div className="space-y-4">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-bold text-green-600">
                  {offer.price_after.toFixed(2)}€
                </span>
                <span className="text-lg text-gray-400 line-through">
                  {offer.price_before.toFixed(2)}€
                </span>
                <span className="bg-white text-red-600 font-bold text-sm px-2 py-1 rounded border-2 border-red-200">
                  -{getDiscountPercent(offer.price_before, offer.price_after)}%
                </span>
              </div>

              {offer.available_until && (
                <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-2">
                  <span className="text-red-600 font-semibold">
                    ⏱ {getTimeRemaining(offer.available_until)}
                  </span>
                </div>
              )}

              {offer.description && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                  <p className="text-gray-700 text-sm">{offer.description}</p>
                </div>
              )}

              <div className="space-y-2 text-sm text-gray-600">
                {offer.merchant_phone && (
                  <div className="flex items-center gap-2">
                    <span>📞</span>
                    <span>{offer.merchant_phone}</span>
                  </div>
                )}
                {offer.merchant_street && (
                  <div className="flex items-center gap-2">
                    <span>📍</span>
                    <span>{offer.merchant_street}, {offer.merchant_city}</span>
                  </div>
                )}
                {offer.quantity && (
                  <div className="flex items-center gap-2">
                    <span>📦</span>
                    <span>{offer.quantity} disponible{offer.quantity > 1 ? 's' : ''}</span>
                  </div>
                )}
              </div>

              <button className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-xl transition">
                Réserver maintenant
              </button>
            </div>
          </div>

          {/* Autres produits du marchand */}
          {merchantOffers.length > 0 && (
            <div>
              <h3 className="font-bold text-lg text-gray-900 mb-4">
                Autres offres de {offer.merchant_name}
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {merchantOffers.slice(0, 4).map((otherOffer) => (
                  <div
                    key={otherOffer.offer_id}
                    className="bg-gray-50 rounded-xl overflow-hidden cursor-pointer hover:shadow-md transition"
                    onClick={() => {
                      onClose();
                      setTimeout(() => {
                        const event = new CustomEvent('selectOffer', { detail: otherOffer });
                        window.dispatchEvent(event);
                      }, 100);
                    }}
                  >
                    <img
                      src={otherOffer.image_url}
                      alt={otherOffer.title}
                      className="w-full h-24 object-cover"
                      crossOrigin="anonymous"
                    />
                    <div className="p-2">
                      <p className="text-xs font-semibold text-gray-900 truncate mb-1">
                        {otherOffer.title}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-green-600">
                          {otherOffer.price_after.toFixed(2)}€
                        </span>
                        <span className="text-[10px] text-red-600 font-semibold">
                          -{getDiscountPercent(otherOffer.price_before, otherOffer.price_after)}%
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// 🏪 MODALE MARCHAND (toutes ses offres)
const MerchantModal = ({
  merchant,
  onClose,
  onSelectOffer,
  getDiscountPercent,
  getTimeRemaining
}: {
  merchant: MerchantGroup;
  onClose: () => void;
  onSelectOffer: (offer: Offer) => void;
  getDiscountPercent: (before: number, after: number) => number;
  getTimeRemaining: (until?: string) => string;
}) => {
  return (
    <div 
      className="fixed inset-0 bg-black/50 z-[3000] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[70vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-4 z-10">
          {merchant.merchant_logo_url ? (
            <img
              src={merchant.merchant_logo_url}
              alt={merchant.merchant_name}
              className="w-14 h-14 rounded-full object-cover border-2 border-gray-200"
              crossOrigin="anonymous"
            />
          ) : (
            <div className="w-14 h-14 rounded-full bg-gray-200 flex items-center justify-center text-2xl">
              🏪
            </div>
          )}
          <div className="flex-1">
            <h2 className="font-bold text-xl text-gray-900">{merchant.merchant_name}</h2>
            <p className="text-sm text-gray-600">
              📍 {merchant.merchant_street}, {merchant.merchant_city}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl font-light"
          >
            ×
          </button>
        </div>

        {/* Liste des offres */}
        <div className="p-6">
          <h3 className="font-bold text-lg mb-4">
            {merchant.offers.length} offre{merchant.offers.length > 1 ? 's' : ''} disponible{merchant.offers.length > 1 ? 's' : ''}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {merchant.offers.map((offer) => (
              <div
                key={offer.offer_id}
                className="bg-white border border-gray-200 rounded-xl overflow-hidden cursor-pointer hover:shadow-md transition"
                onClick={() => onSelectOffer(offer)}
              >
                <img
                  src={offer.image_url}
                  alt={offer.title}
                  className="w-full h-40 object-cover"
                  crossOrigin="anonymous"
                />
                <div className="p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">{offer.title}</h4>
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
        </div>
      </div>
    </div>
  );
};

// 🧮 Fonction utilitaire : créer un cercle GeoJSON
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