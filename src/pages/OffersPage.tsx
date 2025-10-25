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
const DEFAULT_LOCATION: [number, number] = [28.9784, 41.0082]; // Istanbul 🇹🇷

// --- 🎨 Style personnalisé
const customMapboxCSS = `
  /* Supprimer halos */
  .mapboxgl-ctrl-geolocate, .mapboxgl-ctrl-geocoder input:focus {
    outline: none !important;
    box-shadow: none !important;
  }

  /* Bouton GPS : bien calé dans le coin */
  .mapboxgl-ctrl-top-right {
    top: 12px !important;
    right: 12px !important;
  }

  /* Barre de recherche : gauche sur desktop, centrée sur mobile */
  .mapboxgl-ctrl-geocoder {
    position: absolute !important;
    top: 12px !important;
    left: 15px !important;
    width: 320px !important;
    max-width: 90% !important;
    box-shadow: 0 2px 6px rgba(0,0,0,0.15);
    border-radius: 8px !important;
    z-index: 5 !important;
  }

  @media (max-width: 640px) {
    .mapboxgl-ctrl-geocoder {
      left: 50% !important;
      transform: translateX(-50%) !important;
      width: 90% !important;
    }
  }

  /* 🧹 Nettoyage pied de carte */
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
  const [center, setCenter] = useState<[number, number]>(DEFAULT_LOCATION);
  const [radiusKm, setRadiusKm] = useState<number>(
    Number(localStorage.getItem("radiusKm")) || 10
  );

  // Injecter le CSS custom
  useEffect(() => {
    const styleTag = document.createElement("style");
    styleTag.innerHTML = customMapboxCSS;
    document.head.appendChild(styleTag);
    return () => document.head.removeChild(styleTag);
  }, []);

  // Initialisation carte
  useEffect(() => {
    mapboxgl.accessToken =
      "pk.eyJ1Ijoia2lsaWNlcmd1bjAxIiwiYSI6ImNtaDRoazJsaTFueXgwOHFwaWRzMmU3Y2QifQ.aieAqNwRgY40ydzIDBxc6g";
    if (!mapContainerRef.current) return;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: MAP_STYLE,
      center,
      zoom: 9,
    });
    mapRef.current = map;

    const geolocate = new mapboxgl.GeolocateControl({
      positionOptions: { enableHighAccuracy: true },
      trackUserLocation: true,
      showUserHeading: true,
    });
    map.addControl(geolocate);

    geolocate.on("geolocate", (e) => {
      const lng = e.coords.longitude;
      const lat = e.coords.latitude;
      setCenter([lng, lat]);
      map.flyTo({ center: [lng, lat], zoom: 12 });
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
      setCenter([lng, lat]);
      map.flyTo({ center: [lng, lat], zoom: 12 });
    });

    return () => map.remove();
  }, []);

  // Dessiner le rayon
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
      paint: {
        "fill-color": "rgba(0,0,0,0.35)",
        "fill-opacity": 0.35,
      },
    });
  }

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
        <p className="text-gray-500 text-center mt-10">
          Aucune offre disponible dans ce rayon.
        </p>
      </div>
    </div>
  );
}

// --- Cercle GeoJSON ---
function createGeoJSONCircle(
  center: [number, number],
  radiusInMeters: number,
  points = 64
) {
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
