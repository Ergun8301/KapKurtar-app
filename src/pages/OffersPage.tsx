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
  image_url?: string;
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
  const [isGeolocating, setIsGeolocating] = useState(false);
  const [viewMode, setViewMode] = useState<"nearby" | "all">("nearby");

  // Injecte le CSS
  useEffect(() => {
    const styleTag = document.createElement("style");
    styleTag.innerHTML = customMapboxCSS;
    document.head.appendChild(styleTag);
    return () => document.head.removeChild(styleTag);
  }, []);

  // Profil client connecté
  useEffect(() => {
    const fetchClientId = async () => {
      if (!user) return setClientId(null);

      const { data: profile } = await supabase
        .from("profiles")
        .select("id")
        .eq("auth_id", user.id)
        .eq("role", "client")
        .maybeSingle();

      setClientId(profile?.id || null);
    };
    fetchClientId();
  }, [user]);

  // Géolocalisation auto
  useEffect(() => {
    if (!clientId || isGeolocating) return;

    setIsGeolocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        await supabase.rpc("update_client_location", {
          client_id: clientId,
          longitude,
          latitude,
          status: "success",
        });
        setUserLocation([longitude, latitude]);
        setCenter([longitude, latitude]);
        mapRef.current?.flyTo({ center: [longitude, latitude], zoom: 12 });
        setIsGeolocating(false);
      },
      () => setIsGeolocating(false),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, [clientId]);

  // Initialisation carte
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

    geocoder.on("result", (e) => {
      const [lng, lat] = e.result.center;
      setCenter([lng, lat]);
      map.flyTo({ center: [lng, lat], zoom: 12 });
    });

    return () => map.remove();
  }, []);

  // Cercle dynamique
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (!map.isStyleLoaded()) {
      map.once("load", () => drawRadius(map, center, radiusKm));
    } else {
      drawRadius(map, center, radiusKm);
    }
  }, [center, radiusKm]);

  function drawRadius(map: Map, center: [number, number], radiusKm: number) {
    try {
      if (map.getLayer("radius")) map.removeLayer("radius");
      if (map.getSource("radius")) map.removeSource("radius");
      const circle = createGeoJSONCircle(center, radiusKm * 1000);
      map.addSource("radius", { type: "geojson", data: circle });
      map.addLayer({
        id: "radius",
        type: "fill",
        source: "radius",
        paint: { "fill-color": "#22c55e", "fill-opacity": 0.15 },
      });
    } catch {}
  }

  // Chargement des offres
  useEffect(() => {
    const fetchOffers = async () => {
      try {
        let data, error;
        if (viewMode === "all") {
          const result = await supabase.from("offers").select(`
            id as offer_id, title, price_before, price_after, merchant_id, location
          `).eq("is_active", true);
          data = result.data?.map((o) => ({
            offer_id: o.offer_id,
            title: o.title,
            merchant_name: "",
            price_before: o.price_before,
            price_after: o.price_after,
            distance_meters: 0,
            offer_lat: o.location.coordinates[1],
            offer_lng: o.location.coordinates[0],
          })) || [];
          error = result.error;
        } else if (clientId) {
          const result = await supabase.rpc("get_offers_nearby_dynamic", {
            p_client_id: clientId,
            p_radius_meters: radiusKm * 1000,
          });
          data = result.data;
          error = result.error;
        } else {
          const [lng, lat] = center;
          const result = await supabase.rpc("get_offers_nearby_public", {
            p_longitude: lng,
            p_latitude: lat,
            p_radius_meters: radiusKm * 1000,
          });
          data = result.data;
          error = result.error;
        }

        if (error) setOffers([]);
        else setOffers(data || []);
      } catch {
        setOffers([]);
      }
    };
    fetchOffers();
  }, [clientId, center, radiusKm, viewMode]);

  // Marqueurs
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    (map as any)._markers?.forEach((m: Marker) => m.remove());
    (map as any)._markers = [];

    offers.forEach((offer) => {
      const el = document.createElement("div");
      el.className = "offer-marker";
      el.style.background = "#22c55e";
      el.style.width = "20px";
      el.style.height = "20px";
      el.style.borderRadius = "50%";
      el.style.border = "2px solid #fff";

      const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
        <strong>${offer.title}</strong><br/>
        ${offer.merchant_name}<br/>
        <span style="color:green;font-weight:bold;">${offer.price_after.toFixed(2)} €</span>
        <span style="text-decoration:line-through;color:#999;margin-left:4px;">${offer.price_before.toFixed(2)} €</span><br/>
        <a href="https://www.google.com/maps/dir/?api=1&destination=${offer.offer_lat},${offer.offer_lng}" target="_blank">🗺️ Itinéraire</a>
      `);

      new mapboxgl.Marker(el).setLngLat([offer.offer_lng, offer.offer_lat]).setPopup(popup).addTo(map);
      (map as any)._markers.push(el);
    });
  }, [offers]);

  const handleRadiusChange = (val: number) => {
    setRadiusKm(val);
    localStorage.setItem("radiusKm", String(val));
  };

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-100px)]">
      <div className="relative flex-1 border-r border-gray-200">
        <div ref={mapContainerRef} style={{ width: "100%", height: "100%" }} />

        {/* Slider */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[1000] bg-white rounded-full shadow px-3 py-1 flex items-center space-x-2 border border-gray-200">
          <input
            type="range"
            min={1}
            max={30}
            value={radiusKm}
            onInput={(e) => handleRadiusChange(Number(e.target.value))}
            className="w-36 accent-green-500 cursor-pointer focus:outline-none"
          />
          <span className="text-sm text-gray-700 font-medium">{radiusKm} km</span>
        </div>
      </div>

      {/* Liste des offres */}
      <div className="md:w-1/2 overflow-y-auto bg-gray-50 p-4">
        {/* Barre double onglet moderne */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex bg-gray-100 rounded-2xl overflow-hidden shadow-sm">
            <button
              className={`px-4 py-2 text-sm font-semibold transition-all ${
                viewMode === "nearby"
                  ? "bg-white text-green-700 shadow"
                  : "text-gray-500 hover:text-green-600"
              }`}
              onClick={() => setViewMode("nearby")}
            >
              Offres à proximité
            </button>
            <button
              className={`px-4 py-2 text-sm font-semibold transition-all ${
                viewMode === "all"
                  ? "bg-white text-green-700 shadow"
                  : "text-gray-500 hover:text-green-600"
              }`}
              onClick={() => setViewMode("all")}
            >
              Toutes les offres
            </button>
          </div>
        </div>

        {offers.length === 0 ? (
          <p className="text-gray-500 text-center mt-10">
            Aucune offre disponible dans ce rayon.
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
                  />
                )}
                <div className="flex-1 p-3">
                  <h3 className="font-semibold text-gray-800">{o.title}</h3>
                  <p className="text-sm text-gray-500">{o.merchant_name}</p>
                  <p className="text-green-600 font-semibold">
                    {(o.distance_meters / 1000).toFixed(2)} km
                  </p>
                  <div className="flex items-center justify-between mt-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-green-600">
                        {o.price_after.toFixed(2)} €
                      </span>
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

// Cercle GeoJSON
export function createGeoJSONCircle(center: [number, number], radiusInMeters: number, points = 64) {
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
  return { type: "Feature", geometry: { type: "Polygon", coordinates: [ret] } };
}
