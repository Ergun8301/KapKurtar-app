import React, { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

const MapboxTestPage = () => {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    // Création de la carte 🌍
    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [35.2433, 38.9637], // 🇹🇷 Turquie
      zoom: 3.5,
      projection: "globe",
    });

    mapRef.current = map;

    // Animation du globe 🌎
    let rotate = true;
    function rotateGlobe() {
      if (!rotate) return;
      const center = map.getCenter();
      map.easeTo({ center: [center.lng + 0.1, center.lat], duration: 20000, easing: (n) => n });
      requestAnimationFrame(rotateGlobe);
    }
    rotateGlobe();

    // Géolocalisation auto si autorisée 📍
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          rotate = false;
          const { longitude, latitude } = pos.coords;
          map.flyTo({ center: [longitude, latitude], zoom: 13, speed: 1.2 });
          new mapboxgl.Marker({ color: "#007bff" })
            .setLngLat([longitude, latitude])
            .setPopup(new mapboxgl.Popup().setHTML("📍 Vous êtes ici"))
            .addTo(map);
        },
        () => console.warn("Localisation non autorisée ou indisponible"),
        { enableHighAccuracy: true, timeout: 10000 }
      );
    }

    return () => map.remove();
  }, []);

  // 📍 Bouton “Ma position actuelle”
  const handleLocate = () => {
    if (!mapRef.current || !navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { longitude, latitude } = pos.coords;
        mapRef.current.flyTo({ center: [longitude, latitude], zoom: 13, speed: 1.2 });
        new mapboxgl.Marker({ color: "#ff3b30" })
          .setLngLat([longitude, latitude])
          .setPopup(new mapboxgl.Popup().setHTML("📍 Ma position actuelle"))
          .addTo(mapRef.current!);
      },
      () => alert("Impossible de récupérer votre position"),
      { enableHighAccuracy: true }
    );
  };

  return (
    <div className="relative flex flex-col items-center w-full min-h-[70vh] md:min-h-[80vh] lg:min-h-[85vh]">
      {/* 🗺️ Conteneur carte */}
      <div ref={mapContainer} className="w-full h-full rounded-xl shadow-md" />

      {/* 📍 Bouton fixe sur la carte */}
      <button
        onClick={handleLocate}
        className="absolute bottom-4 left-4 bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 text-sm"
      >
        📍 Ma position actuelle
      </button>
    </div>
  );
};

export default MapboxTestPage;
