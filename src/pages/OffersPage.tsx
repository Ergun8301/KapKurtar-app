import React, { useEffect, useRef, useState } from "react";
import mapboxgl, { Map, Marker } from "mapbox-gl";
import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";
import "mapbox-gl/dist/mapbox-gl.css";
import "@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../hooks/useAuth";

type Offer = {
  offer_id: string;
  title: string;
  merchant_name: string;
  price_before: number;
  price_after: number;
  distance_meters: number;
  offer_lat: number;
  offer_lng: number;
  image_url: string;
  available_until?: string;
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

  /* ✅ Correction popup Mapbox caché derrière le slider */
  .mapboxgl-popup {
    z-index: 2000 !important; /* s'affiche toujours au-dessus */
  }

  .mapboxgl-popup-content {
    border-radius: 14px !important;
    box-shadow: 0 4px 10px rgba(0,0,0,0.15) !important;
    padding: 0 !important; /* supprime le padding interne excessif */
  }

  .mapboxgl-popup-close-button {
    top: 4px !important;
    right: 6px !important;
  }
`;

export default function OffersPage() {
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

  const getDiscountPercent = (before: number, after: number) => {
    if (!before || before === 0) return 0;
    return Math.round(((before - after) / before) * 100);
  };

  const getTimeRemaining = (until?: string) => {
    if (!until) return "";
    const diff = new Date(until).getTime() - Date.now();
    if (diff <= 0) return "⏰ Expirée";
    const h = Math.floor(diff / 1000 / 60 / 60);
    const m = Math.floor((diff / 1000 / 60) % 60);
    return h > 0 ? `⏰ ${h}h ${m}min` : `⏰ ${m} min restantes`;
  };

  // Injection CSS
  useEffect(() => {
    const styleTag = document.createElement("style");
    styleTag.innerHTML = customMapboxCSS;
    document.head.appendChild(styleTag);
    return () => document.head.removeChild(styleTag);
  }, []);

  // Récupère le profil client connecté
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

  // Géolocalisation automatique pour clients connectés
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
          console.error("Erreur lors de la mise à jour de la position:", error);
        } finally {
          setIsGeolocating(false);
          setHasGeolocated(true);
        }
      },
      (error) => {
        console.warn("Géolocalisation refusée ou impossible:", error);
        setUserLocation(DEFAULT_LOCATION);
        setCenter(DEFAULT_LOCATION);

        if (mapRef.current && Number.isFinite(DEFAULT_LOCATION[0]) && Number.isFinite(DEFAULT_LOCATION[1])) {
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

  // Initialisation de la carte
  useEffect(() => {
    mapboxgl.accessToken =
      "pk.eyJ1Ijoia2lsaWNlcmd1bjAxIiwiYSI6ImNtaDRoazJsaTFueXgwOHFwaWRzMmU3Y2QifQ.aieAqNwRgY40ydzIDBxc6g";

    if (!mapContainerRef.current) return;

    // Utiliser DEFAULT_LOCATION si center est invalide
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
      setViewMode("nearby"); // Retour au mode proximité lors de la géolocalisation
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
      setViewMode("nearby"); // Retour au mode proximité lors d'une recherche
      map.flyTo({ center: [lng, lat], zoom: 12, essential: true });
    });

    return () => map.remove();
  }, []);

  // Gestion du cercle de rayon (seulement en mode "nearby")
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

  // Chargement des offres
useEffect(() => {
  const fetchOffers = async () => {
    // 🧭 Protection contre les coordonnées invalides
    if (!center || !Number.isFinite(center[0]) || !Number.isFinite(center[1])) {
      console.warn("🧭 fetchOffers skipped: invalid center", center);
      return;
    }

    try {
      let data, error;

      if (viewMode === "all") {
        // 🌍 Mode "Toutes les offres" - utilise un grand rayon (2000 km)
        const [lng, lat] = center;
        const result = await supabase.rpc("get_offers_nearby_public", {
          user_lng: lng,
          user_lat: lat,
          radius_meters: 2000000,
        });
        data = result.data;
        error = result.error;
      } else {
        // 📍 Mode "Proximité"
        if (clientId) {
          // 👤 Utilisateur connecté avec profil client
          const result = await supabase.rpc("get_offers_nearby_dynamic_secure", {
            client_id: clientId,
            radius_meters: radiusKm * 1000,
          });
          data = result.data;
          error = result.error;
        } else {
          // 🧭 Utilisateur non connecté - utilise les coordonnées directes
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

      // 🧩 --- Bloc de diagnostic complet ---
      if (error) {
        console.error("❌ Erreur Supabase:", error.message);
      } else {
        console.log("✅ Données reçues depuis Supabase:", data);

        const debugData = data?.map((o: any) => ({
          title: o.title,
          image_url: o.image_url,
          from: o.available_from,
          until: o.available_until,
          expired: o.expired_at,
          is_active: o.is_active,
        }));

        console.log("🧩 Diagnostic des offres :", debugData);

        const offersWithoutImage = debugData?.filter((o) => !o.image_url);
        if (offersWithoutImage?.length) {
          console.warn("⚠️ Offres sans image détectées:", offersWithoutImage);
        } else {
          console.log("🖼️ Toutes les offres ont une image ✅");
        }
      }
      // 🧩 --- Fin bloc diagnostic ---

      setOffers(data || []);
    } catch (error) {
      console.error("❌ Erreur lors de la récupération des offres:", error);
      setOffers([]);
    }
  };

  fetchOffers();
}, [center, clientId, viewMode, radiusKm]);

import React, { useEffect, useRef, useState } from "react";
import mapboxgl, { Marker } from "mapbox-gl";
import { supabase } from "../lib/supabaseClient";

type Offer = {
  offer_id: string;
  title: string;
  image_url: string;
  price_before: number;
  price_after: number;
  offer_lat: number;
  offer_lng: number;
  available_until: string;
  available_from?: string;
};

const MAP_STYLE = "mapbox://styles/kilicergun01/cmh4k0xk6008i01qt4f8p1mas";
const DEFAULT_LOCATION: [number, number] = [2.35, 48.85]; // Paris par défaut

export default function OffersPage() {
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
  const [viewMode, setViewMode] = useState<"nearby" | "all">("nearby");

  // Initialisation de la carte
  useEffect(() => {
    mapboxgl.accessToken = "pk.eyJ1Ijoia2lsaWNlcmd1bjAxIiwiYSI6ImNsa2p3dHV4ZzA3aGkzbnF6dW90YjJicTgifQ.7V8A7Lh-lMZ6f3RrQgbSQA";
    const map = new mapboxgl.Map({
      container: "map",
      style: MAP_STYLE,
      center: DEFAULT_LOCATION,
      zoom: 11,
    });
    mapRef.current = map;
    return () => map.remove();
  }, []);

  // Exemple d’offres statiques (à remplacer par ton Supabase)
  useEffect(() => {
    setOffers([
      {
        offer_id: "1",
        title: "Pizza",
        image_url: "https://images.unsplash.com/photo-1601924582971-d42bb6f88c7d",
        price_before: 12,
        price_after: 7,
        offer_lat: 48.86,
        offer_lng: 2.33,
        available_until: new Date(Date.now() + 4 * 3600 * 1000).toISOString(),
      },
    ]);
  }, []);

  // 🗺️ Marqueurs d'offres
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    (map as any)._markers?.forEach((m: Marker) => m.remove());
    (map as any)._markers = [];

    const isMobile = window.innerWidth < 768;

    offers.forEach((offer) => {
      if (!Number.isFinite(offer.offer_lng) || !Number.isFinite(offer.offer_lat)) return;

      // Élément visuel du marqueur
      const el = document.createElement("div");
      el.className = "offer-marker";
      el.style.background = "#22c55e";
      el.style.width = "20px";
      el.style.height = "20px";
      el.style.borderRadius = "50%";
      el.style.border = "2px solid #fff";
      el.style.cursor = "pointer";
      el.style.boxShadow = "0 2px 4px rgba(0,0,0,0.2)";

      const marker = new mapboxgl.Marker(el).setLngLat([offer.offer_lng, offer.offer_lat]);

      if (!isMobile) {
        const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
          <div style="width:200px;font-family:sans-serif;">
            <img src="${offer.image_url}" style="width:100%;height:100px;object-fit:cover;border-radius:8px;margin-bottom:4px;">
            <strong>${offer.title}</strong><br/>
            ${offer.price_after.toFixed(2)}€ <span style="color:#888;text-decoration:line-through;">${offer.price_before.toFixed(2)}€</span>
          </div>
        `);
        marker.setPopup(popup);
      } else {
        el.addEventListener("click", () => {
          map.flyTo({
            center: [offer.offer_lng, offer.offer_lat],
            zoom: 14,
            speed: 1.3,
            curve: 1.4,
            essential: true,
          });
          setSelectedOffer(offer); // affiche la fiche mobile
        });
      }

      marker.addTo(map);
      (map as any)._markers.push(marker);
    });
  }, [offers]);

  return (
    <div style={{ position: "relative", width: "100%", height: "100vh" }}>
      {/* 🗺️ Carte */}
      <div id="map" style={{ width: "100%", height: "100%" }} />

      {/* 📱 Fiche mobile flottante */}
      {selectedOffer && (
        <div
          onClick={() => setSelectedOffer(null)}
          style={{
            position: "fixed",
            bottom: "0",
            left: "0",
            right: "0",
            background: "#fff",
            borderTopLeftRadius: "16px",
            borderTopRightRadius: "16px",
            boxShadow: "0 -2px 10px rgba(0,0,0,0.15)",
            zIndex: 1000,
            animation: "slideUp 0.3s ease-out",
            padding: "12px 16px",
          }}
        >
          <div style={{ textAlign: "center" }}>
            <img
              src={selectedOffer.image_url}
              alt={selectedOffer.title}
              style={{
                width: "100%",
                height: "140px",
                borderRadius: "12px",
                objectFit: "cover",
                marginBottom: "8px",
              }}
            />
            <h3 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "4px" }}>
              {selectedOffer.title}
            </h3>
            <p style={{ color: "#16a34a", fontWeight: 700 }}>
              {selectedOffer.price_after.toFixed(2)} €{" "}
              <span style={{ textDecoration: "line-through", color: "#888", fontSize: "13px" }}>
                {selectedOffer.price_before.toFixed(2)} €
              </span>
            </p>
            <button
              style={{
                marginTop: "10px",
                background: "#22c55e",
                color: "white",
                border: "none",
                borderRadius: "8px",
                padding: "8px 16px",
                fontWeight: 600,
                fontSize: "14px",
                width: "100%",
              }}
            >
              Voir détails / Réserver
            </button>
          </div>
        </div>
      )}

      {/* 🌿 Animation CSS */}
      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

  // Gestion du changement de rayon
  const handleRadiusChange = (val: number) => {
    setRadiusKm(val);
    localStorage.setItem("radiusKm", String(val));
  };

  // Protection contre les coordonnées invalides
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

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-100px)]">
      <div className="relative flex-1 border-r border-gray-200">
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

      {/* Liste des offres */}
      <div className="md:w-1/2 overflow-y-auto bg-gray-50 p-4">
        {/* 🔘 Toggle élégant entre les modes de vue */}
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
              <div
                key={o.offer_id}
                className="flex bg-white rounded-lg shadow-sm hover:shadow-md transition overflow-hidden cursor-pointer"
              >
                {o.image_url && (
                  <img
                    src={o.image_url}
                    alt={o.title}
                    className="w-24 h-24 object-cover"
                    crossOrigin="anonymous"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).style.display = 'none';
                    }}
                  />
                )}
                <div className="flex-1 p-3">
                  <h3 className="font-semibold text-gray-800">{o.title}</h3>
                  <p className="text-sm text-gray-500">{o.merchant_name}</p>
                  {viewMode === "nearby" && o.distance_meters > 0 && (
                    <p className="text-green-600 font-semibold">
                      📍 {(o.distance_meters / 1000).toFixed(2)} km
                    </p>
                  )}
                  <div className="flex items-center justify-between mt-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-green-600">
                        {o.price_after.toFixed(2)} €
                      </span>
                      <span className="line-through text-gray-400 text-sm">
                        {o.price_before.toFixed(2)} €
                      </span>
                      <span className="text-xs text-red-600 font-semibold bg-red-50 px-1.5 py-0.5 rounded">
                        -{getDiscountPercent(o.price_before, o.price_after)}%
                      </span>
                    </div>
                  </div>
                  {o.available_until && (
                    <div className="text-[11px] text-gray-600 font-medium mt-1">
                      {getTimeRemaining(o.available_until)}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Fonction utilitaire : créer un cercle GeoJSON
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