import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { LocateFixed } from "lucide-react"; // petite icône GPS moderne

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

const MapboxTestPage = () => {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const userMarker = useRef<mapboxgl.Marker | null>(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    // 🌍 1. Initialisation : globe Turquie vue équilibrée
    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [35.2433, 38.9637],
      zoom: 1.5, // légèrement plus proche qu’avant
      projection: "globe",
    });

    mapRef.current = map;

    // 🌎 2. Effet rotation douce du globe
    let rotate = true;
    function rotateGlobe() {
      if (!rotate) return;
      const center = map.getCenter();
      map.easeTo({
        center: [center.lng + 0.25, center.lat],
        duration: 12000,
        easing: (n) => n,
      });
      requestAnimationFrame(rotateGlobe);
    }
    rotateGlobe();

    // 🎬 3. Zoom automatique vers la Turquie après 2 secondes
    setTimeout(() => {
      map.flyTo({
        center: [35.2433, 38.9637],
        zoom: 4.8,
        speed: 1.2,
        curve: 1.4,
      });
    }, 2000);

    // 📍 4. Géolocalisation automatique si autorisée
    setTimeout(() => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            rotate = false;
            const { longitude, latitude } = pos.coords;
            map.flyTo({
              center: [longitude, latitude],
              zoom: 13,
              speed: 1.4,
              curve: 1.3,
            });
            if (userMarker.current) userMarker.current.remove();
            userMarker.current = new mapboxgl.Marker({ color: "#007bff" })
              .setLngLat([longitude, latitude])
              .setPopup(new mapboxgl.Popup().setHTML("📍 Vous êtes ici"))
              .addTo(map);
          },
          () => console.warn("Localisation refusée ou indisponible"),
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
      }
    }, 4000);

    return () => map.remove();
  }, []);

  // 🎯 5. Bouton rond discret “centrer sur moi”
  const handleLocate = () => {
    if (!mapRef.current || !navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { longitude, latitude } = pos.coords;
        mapRef.current!.flyTo({
          center: [longitude, latitude],
          zoom: 13,
          speed: 1.2,
          curve: 1.3,
        });
        if (userMarker.current) userMarker.current.remove();
        userMarker.current = new mapboxgl.Marker({ color: "#ff3b30" })
          .setLngLat([longitude, latitude])
          .setPopup(new mapboxgl.Popup().setHTML("📍 Ma position actuelle"))
          .addTo(mapRef.current!);
      },
      () => alert("Impossible de récupérer votre position"),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  return (
    <div className="relative flex flex-col items-center w-screen h-screen overflow-hidden">
      {/* 🗺️ Carte plein écran */}
      <div ref={mapContainer} className="absolute inset-0 rounded-none" />

      {/* 📍 Bouton rond flottant */}
      <button
        onClick={handleLocate}
        className="absolute top-4 right-4 bg-white/90 text-gray-800 p-2 rounded-full shadow-md hover:bg-white hover:scale-105 transition-all"
        title="Centrer sur moi"
      >
        <LocateFixed className="w-5 h-5 text-red-500" />
      </button>
    </div>
  );
};

export default MapboxTestPage;
