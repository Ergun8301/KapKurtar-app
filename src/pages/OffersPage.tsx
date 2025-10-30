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
`;

export default function OffersPage() {
  const { user } = useAuth();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<Map | null>(null);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [userLocation, setUserLocation] = useState<[number, number]>(DEFAULT_LOCATION);
  const [center, setCenter] = useState<[number, number]>(DEFAULT_LOCATION);
  const [radiusKm, setRadiusKm] = useState<number>(Number(localStorage.getItem("radiusKm")) || 10);
  const [clientId, setClientId] = useState<string | null>(null);
  const [clientIdFetched, setClientIdFetched] = useState(false);
  const [isGeolocating, setIsGeolocating] = useState(false);
  const [hasGeolocated, setHasGeolocated] = useState(false);
  const [viewMode, setViewMode] = useState<"nearby" | "all">("nearby");

  // Injecter CSS personnalisé Mapbox
  useEffect(() => {
    const styleTag = document.createElement("style");
    styleTag.innerHTML = customMapboxCSS;
    document.head.appendChild(styleTag);
    return () => document.head.removeChild(styleTag);
  }, []);

  // Récupération profil client
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
        if (error) console.error("Erreur profil client:", error);
        else if (profile) setClientId(profile.id);
        else console.warn("Aucun profil client trouvé.");
      } catch (err) {
        console.error("Erreur fetchClientId:", err);
      } finally {
        setClientIdFetched(true);
      }
    };
    fetchClientId();
  }, [user, clientIdFetched]);

  // Géolocalisation automatique
  useEffect(() => {
    if (!clientId || isGeolocating || hasGeolocated) return;
    if (!navigator.geolocation) return;

    setIsGeolocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          await supabase.rpc("update_client_location", {
            p_client_id: clientId,
            p_lat: latitude,
            p_lng: longitude,
          });
          setUserLocation([longitude, latitude]);
          setCenter([longitude, latitude]);
          mapRef.current?.flyTo({ center: [longitude, latitude], zoom: 12 });
        } catch (err) {
          console.error("Erreur MAJ position:", err);
        } finally {
          setIsGeolocating(false);
          setHasGeolocated(true);
        }
      },
      (err) => {
        console.warn("Géoloc refusée:", err);
        setUserLocation(DEFAULT_LOCATION);
        setCenter(DEFAULT_LOCATION);
        mapRef.current?.flyTo({ center: DEFAULT_LOCATION, zoom: 6 });
        setIsGeolocating(false);
        setHasGeolocated(true);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, [clientId]);

  // Initialisation carte Mapbox
  useEffect(() => {
    mapboxgl.accessToken =
      "pk.eyJ1Ijoia2lsaWNlcmd1bjAxIiwiYSI6ImNtaDRoazJsaTFueXgwOHFwaWRzMmU3Y2QifQ.aieAqNwRgY40ydzIDBxc6g";
    if (!mapContainerRef.current) return;
    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: MAP_STYLE,
      center,
      zoom: 7,
    });
    mapRef.current = map;

    const geolocate = new mapboxgl.GeolocateControl({
      positionOptions: { enableHighAccuracy: true },
      trackUserLocation: false,
      showUserHeading: true,
    });
    map.addControl(geolocate, "top-right");

    const geocoder = new MapboxGeocoder({
      accessToken: mapboxgl.accessToken,
      mapboxgl,
      marker: false,
      placeholder: "Rechercher une adresse...",
      language: "fr",
    });
    map.addControl(geocoder);
    return () => map.remove();
  }, []);

  // Cercle de rayon
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (viewMode === "nearby") drawRadius(map, center, radiusKm);
    else removeRadius(map);
  }, [center, radiusKm, viewMode]);

  function drawRadius(map: Map, center: [number, number], radiusKm: number) {
    removeRadius(map);
    const circle = createGeoJSONCircle(center, radiusKm * 1000);
    map.addSource("radius", { type: "geojson", data: circle });
    map.addLayer({
      id: "radius",
      type: "fill",
      source: "radius",
      paint: { "fill-color": "#22c55e", "fill-opacity": 0.15 },
    });
  }

  function removeRadius(map: Map) {
    ["radius", "outside-mask"].forEach((id) => {
      if (map.getLayer(id)) map.removeLayer(id);
      if (map.getSource(id)) map.removeSource(id);
    });
  }

  // Chargement des offres
  useEffect(() => {
    const fetchOffers = async () => {
      if (!center) return;
      try {
        let result;
        if (viewMode === "all") {
          result = await supabase.rpc("get_offers_nearby_public", {
            p_longitude: 29,
            p_latitude: 39,
            p_radius_meters: 2000000,
          });
        } else if (clientId) {
          result = await supabase.rpc("get_offers_nearby_dynamic_secure", {
            client_id: clientId,
            radius_meters: radiusKm * 1000,
          });
        } else {
          const [lng, lat] = center;
          result = await supabase.rpc("get_offers_nearby_public", {
            p_longitude: lng,
            p_latitude: lat,
            p_radius_meters: radiusKm * 1000,
          });
        }

        if (result.error) {
          console.error("Erreur offres:", result.error);
          setOffers([]);
        } else {
          console.log(`Mode ${viewMode}: ${result.data?.length || 0} offres`);
          setOffers(result.data || []);
        }
      } catch (err) {
        console.error("Erreur fetchOffers:", err);
        setOffers([]);
      }
    };
    fetchOffers();
  }, [clientId, center, radiusKm, viewMode]);

  // Marqueurs carte
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    (map as any)._markers?.forEach((m: Marker) => m.remove());
    (map as any)._markers = [];
    offers.forEach((o) => {
      if (!Number.isFinite(o.offer_lng) || !Number.isFinite(o.offer_lat)) return;
      const el = document.createElement("div");
      el.className = "offer-marker";
      el.style.cssText =
        "background:#22c55e;width:20px;height:20px;border-radius:50%;border:2px solid #fff;cursor:pointer;box-shadow:0 2px 4px rgba(0,0,0,0.2);";
      const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
        <strong>${o.title}</strong><br/>
        ${o.merchant_name}<br/>
        <span style="color:green;font-weight:bold;">${o.price_after.toFixed(2)} €</span>
        <span style="text-decoration:line-through;color:#999;margin-left:4px;">${o.price_before.toFixed(2)} €</span><br/>
        <a href="https://www.google.com/maps/dir/?api=1&destination=${o.offer_lat},${o.offer_lng}" target="_blank">🗺️ Itinéraire</a>
      `);
      new mapboxgl.Marker(el).setLngLat([o.offer_lng, o.offer_lat]).setPopup(popup).addTo(map);
    });
  }, [offers]);

  const handleViewModeChange = (mode: "nearby" | "all") => {
    setViewMode(mode);
    if (mode === "nearby" && mapRef.current) mapRef.current.flyTo({ center: userLocation, zoom: 12 });
    if (mode === "all") setCenter(DEFAULT_LOCATION);
  };

  const handleRadiusChange = (val: number) => {
    setRadiusKm(val);
    localStorage.setItem("radiusKm", String(val));
  };

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
      {/* Carte */}
      <div className="relative flex-1 border-r border-gray-200">
        <div ref={mapContainerRef} style={{ width: "100%", height: "100%" }} />
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

      {/* Liste d’offres */}
      <div className="md:w-1/2 overflow-y-auto bg-gray-50 p-4">
        <div className="flex justify-center mb-6">
          <div className="flex bg-gray-100 rounded-2xl overflow-hidden shadow-sm">
            <button
              className={`px-5 py-2.5 text-sm font-semibold transition-all ${
                viewMode === "nearby" ? "bg-white text-green-700 shadow" : "text-gray-500 hover:text-green-600"
              }`}
              onClick={() => handleViewModeChange("nearby")}
            >
              📍 Offres à proximité
            </button>
            <button
              className={`px-5 py-2.5 text-sm font-semibold transition-all ${
                viewMode === "all" ? "bg-white text-green-700 shadow" : "text-gray-500 hover:text-green-600"
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
              ? "Aucune offre dans ce rayon. Essayez d’augmenter la distance !"
              : "Aucune offre disponible pour le moment."}
          </p>
        ) : (
          <div className="space-y-4">
            {offers.map((o) => (
              <div
                key={o.offer_id}
                className="flex bg-white rounded-lg shadow-sm hover:shadow-md transition overflow-hidden cursor-pointer"
              >
                <div className="w-24 h-24 bg-gray-100 flex items-center justify-center rounded-lg overflow-hidden">
                  {o.image_url ? (
                    <img
                      src={o.image_url}
                      alt={o.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        console.warn("❌ Image introuvable :", o.image_url);
                        (e.currentTarget as HTMLImageElement).src =
                          "https://via.placeholder.com/150x150.png?text=Aucune+image";
                      }}
                    />
                  ) : (
                    <span className="text-gray-400 text-xs text-center px-2">Pas d’image</span>
                  )}
                </div>

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
                      <span className="font-bold text-green-600">{o.price_after.toFixed(2)} €</span>
                      <span className="line-through text-gray-400 text-sm">
                        {o.price_before.toFixed(2)} €
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Fonction utilitaire : cercle GeoJSON
export function createGeoJSONCircle(center: [number, number], radiusInMeters: number, points = 64) {
  const coords = { latitude: center[1], longitude: center[0] };
  const km = radiusInMeters / 1000;
  const ret: [number, number][] = [];
  const distanceX = km / (111.32 * Math.cos((coords.latitude * Math.PI) / 180));
  const distanceY = km / 110.574;
  for (let i = 0; i < points; i++) {
    const theta = (i / points) * (2 * Math.PI);
    ret.push([coords.longitude + distanceX * Math.cos(theta), coords.latitude + distanceY * Math.sin(theta)]);
  }
  ret.push(ret[0]);
  return { type: "Feature", geometry: { type: "Polygon", coordinates: [ret] } };
}
