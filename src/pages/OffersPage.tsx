import React, { useEffect, useRef, useState } from "react";
import mapboxgl, { Map, Marker } from "mapbox-gl";
import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";
import "mapbox-gl/dist/mapbox-gl.css";
import "@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css";
import { supabase } from "../lib/supabaseClient";

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

// 🎨 CSS personnalisé — version finale
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
      flex-direction: column !important;
      gap: 6px !important;
    }

    .mapboxgl-ctrl-geocoder {
      width: 90% !important;
      height: 30px !important;
      font-size: 13px !important;
    }
  }

  .mapboxgl-ctrl-logo,
  .mapboxgl-ctrl-attrib,
  .mapbox-improve-map {
    display: none !important;
  }
`;

export default function OffersPage() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<Map | null>(null);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [userMarker, setUserMarker] = useState<Marker | null>(null);
  const [userLocation, setUserLocation] = useState<[number, number]>(DEFAULT_LOCATION);
  const [center, setCenter] = useState<[number, number]>(DEFAULT_LOCATION);
  const [radiusKm, setRadiusKm] = useState<number>(
    Number(localStorage.getItem("radiusKm")) || 10
  );

  useEffect(() => {
    const styleTag = document.createElement("style");
    styleTag.innerHTML = customMapboxCSS;
    document.head.appendChild(styleTag);
    return () => document.head.removeChild(styleTag);
  }, []);

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

    // ✅ Contrôle de géolocalisation
    const geolocate = new mapboxgl.GeolocateControl({
      positionOptions: { enableHighAccuracy: true },
      trackUserLocation: true,
      showUserHeading: true,
    });

    map.addControl(geolocate, "top-right");

    // 👉 Si l'utilisateur refuse la géoloc, on affiche une alerte au clic
    map.on("error", (e) => {
      if (e?.error?.code === 1) {
        alert(
          "⛔ La géolocalisation est désactivée.\nVeuillez l’activer dans votre navigateur pour vous localiser."
        );
      }
    });

    // 🧭 Quand on clique sur le bouton de géoloc
    geolocate.on("geolocate", (e) => {
      const lng = e.coords.longitude;
      const lat = e.coords.latitude;
      setUserLocation([lng, lat]);
      setCenter([lng, lat]);
      map.flyTo({ center: [lng, lat], zoom: 12, essential: true });

      // Ajoute un joli marqueur rouge moderne
      if (userMarker) userMarker.remove();
      const el = document.createElement("div");
      el.style.width = "18px";
      el.style.height = "18px";
      el.style.background = "red";
      el.style.border = "2px solid white";
      el.style.borderRadius = "50%";
      el.style.boxShadow = "0 0 8px rgba(0,0,0,0.4)";
      const newMarker = new mapboxgl.Marker(el).setLngLat([lng, lat]).addTo(map);
      setUserMarker(newMarker);
    });

    // 🔍 Barre de recherche
    const geocoder = new MapboxGeocoder({
      accessToken: mapboxgl.accessToken,
      mapboxgl,
      marker: false,
      placeholder: "Rechercher une adresse ou un lieu...",
      language: "fr",
    });
    map.addControl(geocoder);

    // 👉 Quand une adresse est trouvée, place un marqueur rouge
    geocoder.on("result", (e) => {
      const [lng, lat] = e.result.center;
      setCenter([lng, lat]);
      map.flyTo({ center: [lng, lat], zoom: 12, essential: true });

      if (userMarker) userMarker.remove();
      const el = document.createElement("div");
      el.style.width = "18px";
      el.style.height = "18px";
      el.style.background = "red";
      el.style.border = "2px solid white";
      el.style.borderRadius = "50%";
      el.style.boxShadow = "0 0 8px rgba(0,0,0,0.4)";
      const newMarker = new mapboxgl.Marker(el).setLngLat([lng, lat]).addTo(map);
      setUserMarker(newMarker);
    });

    return () => map.remove();
  }, []);

  // 🟢 Cercle dynamique
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
      if (map.getLayer("outside-mask")) map.removeLayer("outside-mask");
      if (map.getSource("outside-mask")) map.removeSource("outside-mask");

      const circle = createGeoJSONCircle(center, radiusKm * 1000);

      map.addSource("radius", { type: "geojson", data: circle });
      map.addLayer({
        id: "radius",
        type: "fill",
        source: "radius",
        paint: { "fill-color": "#22c55e", "fill-opacity": 0.15 },
      });
    } catch (err) {
      console.warn("Erreur drawRadius :", err);
    }
  }

  // Chargement des offres (inchangé)
  useEffect(() => {
    const fetchOffers = async () => {
      const { data } = await supabase.rpc("get_offers_nearby_dynamic", {
        p_client_id: null,
        p_radius_meters: radiusKm * 1000,
      });
      setOffers(data || []);
    };
    fetchOffers();
  }, [center, radiusKm]);

  // Slider
  const handleRadiusChange = (val: number) => {
    setRadiusKm(val);
    localStorage.setItem("radiusKm", String(val));
  };

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-100px)]">
      <div className="relative flex-1 border-r border-gray-200">
        <div ref={mapContainerRef} style={{ width: "100%", height: "100%" }} />

        {/* 🎚️ Slider */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[1000] bg-white rounded-full shadow px-3 py-1 flex items-center space-x-2 border border-gray-200">
          <input
            type="range"
            min={1}
            max={30}
            value={radiusKm}
            onChange={(e) => handleRadiusChange(Number(e.target.value))}
            className="w-36 accent-green-500 cursor-pointer focus:outline-none"
          />
          <span className="text-sm text-gray-700 font-medium">{radiusKm} km</span>
        </div>
      </div>

      {/* 🛒 Offres */}
      <div className="md:w-1/2 overflow-y-auto bg-gray-50 p-4">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Offres à proximité</h2>
        {offers.length === 0 ? (
          <p className="text-gray-500 text-center mt-10">
            Aucune offre disponible dans ce rayon.
          </p>
        ) : (
          <div className="space-y-4">
            {offers.map((o) => (
              <div key={o.offer_id} className="flex bg-white rounded-lg shadow-sm hover:shadow-md transition overflow-hidden cursor-pointer">
                {o.image_url && (
                  <img src={o.image_url} alt={o.title} className="w-24 h-24 object-cover" />
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

// 🔵 Cercle GeoJSON
function createGeoJSONCircle(center: [number, number], radiusInMeters: number, points = 64) {
  const coords = { latitude: center[1], longitude: center[0] };
  const km = radiusInMeters / 1000;
  const ret = [];
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
