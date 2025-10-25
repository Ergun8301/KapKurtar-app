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

export default function OffersPage() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<Map | null>(null);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [center, setCenter] = useState<[number, number]>(DEFAULT_LOCATION);
  const [radiusKm, setRadiusKm] = useState<number>(
    Number(localStorage.getItem("radiusKm")) || 10
  );

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

    // --- Bouton géoloc
    const geolocate = new mapboxgl.GeolocateControl({
      positionOptions: { enableHighAccuracy: true },
      trackUserLocation: true,
      showUserHeading: true,
    });
    map.addControl(geolocate, "top-right");

    geolocate.on("geolocate", (e) => {
      const lng = e.coords.longitude;
      const lat = e.coords.latitude;
      setCenter([lng, lat]);
      map.flyTo({ center: [lng, lat], zoom: 12 });
    });

    // --- Barre de recherche
    const geocoder = new MapboxGeocoder({
      accessToken: mapboxgl.accessToken,
      mapboxgl,
      marker: false,
      placeholder: "Rechercher une adresse ou un lieu...",
      language: "fr",
    });
    map.addControl(geocoder, "top-left");

    // ✅ Après chargement, repositionne la barre à l'axe du slider
    map.on("load", () => {
      const moveSearchBar = () => {
        const search = document.querySelector(
          ".mapboxgl-ctrl-geocoder"
        ) as HTMLElement;
        if (search) {
          search.style.position = "absolute";
          search.style.top = "10px";
          search.style.left = "50%";
          search.style.transform = "translateX(-50%)";
          search.style.width = "340px";
          search.style.zIndex = "5";
          search.style.boxShadow = "0 2px 6px rgba(0,0,0,0.15)";
          search.style.borderRadius = "8px";
        }
      };

      // On le fait une fois après un petit délai, pour être sûr que Mapbox ait fini de l’injecter
      setTimeout(moveSearchBar, 300);
    });

    return () => map.remove();
  }, []);

  // --- Cercle de rayon et ombrage
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
