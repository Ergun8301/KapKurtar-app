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

// 🗺️ Style Tilkapp V2 (Mapbox Studio)
const MAP_STYLE = "mapbox://styles/kilicergun01/cmh4k0xk6008i01qt4f8p1mas";

// 📍 Position par défaut (Bourg-en-Bresse)
const DEFAULT_LOCATION: [number, number] = [5.2258, 46.2044];

export default function OffersPage() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<Map | null>(null);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [userLocation, setUserLocation] = useState<[number, number]>(
    DEFAULT_LOCATION
  );
  const [center, setCenter] = useState<[number, number]>(DEFAULT_LOCATION);
  const [radiusKm, setRadiusKm] = useState<number>(
    Number(localStorage.getItem("radiusKm")) || 10
  );
  const [loading, setLoading] = useState(false);

  // 1️⃣ Initialisation de la carte Mapbox
  useEffect(() => {
    mapboxgl.accessToken =
      "pk.eyJ1Ijoia2lsaWNlcmd1bjAxIiwiYSI6ImNtaDRoazJsaTFueXgwOHFwaWRzMmU3Y2QifQ.aieAqNwRgY40ydzIDBxc6g";
    if (!mapContainerRef.current) return;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: MAP_STYLE,
      center,
      zoom: 12,
    });

    mapRef.current = map;

    // 📍 Contrôle de géolocalisation
    const geolocate = new mapboxgl.GeolocateControl({
      positionOptions: { enableHighAccuracy: true },
      trackUserLocation: true,
      showUserHeading: true,
    });
    map.addControl(geolocate);

    geolocate.on("geolocate", (e) => {
      const lng = e.coords.longitude;
      const lat = e.coords.latitude;
      setUserLocation([lng, lat]);
      setCenter([lng, lat]);
    });

    // 🔍 Barre de recherche Mapbox Geocoding
    const geocoder = new MapboxGeocoder({
      accessToken: mapboxgl.accessToken,
      mapboxgl: mapboxgl,
      marker: false,
      placeholder: "Rechercher une adresse ou un lieu...",
      language: "fr",
    });
    map.addControl(geocoder);

    geocoder.on("result", (e) => {
      const [lng, lat] = e.result.center;
      setCenter([lng, lat]);
    });

    return () => {
      map.remove();
    };
  }, []);

  // 2️⃣ Cercle dynamique (zoom selon le rayon)
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Attendre que le style soit bien chargé avant d’ajouter la couche
    if (!map.isStyleLoaded()) {
      map.once("load", () => {
        drawRadius(map, center, radiusKm);
      });
    } else {
      drawRadius(map, center, radiusKm);
    }
  }, [center, radiusKm]);

  // --- fonction utilitaire : dessine le cercle ---
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

      const bounds = new mapboxgl.LngLatBounds();
      circle.geometry.coordinates[0].forEach(([lng, lat]) =>
        bounds.extend([lng, lat])
      );
      map.fitBounds(bounds, { padding: 50, duration: 800 });
    } catch (err) {
      console.warn("Erreur drawRadius :", err);
    }
  }

  // 3️⃣ Chargement des offres depuis Supabase
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

  // 4️⃣ Affichage des marqueurs d’offres
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
        <span style="color:green;font-weight:bold;">${offer.price_after.toFixed(
          2
        )} €</span>
        <span style="text-decoration:line-through;color:#999;margin-left:4px;">${offer.price_before.toFixed(
          2
        )} €</span><br/>
        <a href="https://www.google.com/maps/dir/?api=1&destination=${
          offer.offer_lat
        },${offer.offer_lng}" target="_blank">🗺️ Itinéraire</a>
      `);

      const marker = new mapboxgl.Marker(el)
        .setLngLat([offer.offer_lng, offer.offer_lat])
        .setPopup(popup)
        .addTo(map);

      (map as any)._markers.push(marker);
    });
  }, [offers]);

  // 5️⃣ Slider de rayon
  const handleRadiusChange = (val: number) => {
    setRadiusKm(val);
    localStorage.setItem("radiusKm", String(val));
  };

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-100px)]">
      {/* 🗺️ Carte */}
      <div className="relative flex-1 border-r border-gray-200">
        <div ref={mapContainerRef} style={{ width: "100%", height: "100%" }} />

        {/* 🎚️ Slider de rayon */}
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

      {/* 💸 Liste des offres */}
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

// 🧮 fonction pour créer un cercle autour du point
function createGeoJSONCircle(
  center: [number, number],
  radiusInMeters: number,
  points = 64
) {
  const coords = {
    latitude: center[1],
    longitude: center[0],
  };
  const km = radiusInMeters / 1000;
  const ret = [];
  const distanceX = km / (111.320 * Math.cos((coords.latitude * Math.PI) / 180));
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
