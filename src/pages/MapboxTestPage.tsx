import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

const MapboxTestPage = () => {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const userMarker = useRef<mapboxgl.Marker | null>(null);
  const [isLocated, setIsLocated] = useState(false);

  useEffect(() => {
    if (!mapContainer.current) return;

    // 🌍 Carte globe Turquie initiale
    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [35.2433, 38.9637],
      zoom: 1.8,
      projection: "globe",
    });

    mapRef.current = map;

    // 🌎 Animation du globe en rotation lente
    let rotate = true;
    function rotateGlobe() {
      if (!rotate) return;
      const center = map.getCenter();
      map.easeTo({
        center: [center.lng + 0.2, center.lat],
        duration: 10000,
        easing: (n) => n,
      });
      requestAnimationFrame(rotateGlobe);
    }
    rotateGlobe();

    // 🎬 Cinématique d’intro : zoom vers la Turquie après 3s
    setTimeout(() => {
      map.flyTo({
        center: [35.2433, 38.9637],
        zoom: 4,
        speed: 0.8,
        curve: 1.2,
        essential: true,
      });
    }, 3000);

    // 📍 Géolocalisation auto (après 5s pour laisser l’animation)
    setTimeout(() => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            rotate = false;
            const { longitude, latitude } = pos.coords;
            setIsLocated(true);
            map.flyTo({
              center: [longitude, latitude],
              zoom: 13,
              speed: 1.5,
              curve: 1.5,
            });
            if (userMarker.current) userMarker.current.remove();
            userMarker.current = new mapboxgl.Marker({ color: "#007bff" })
              .setLngLat([longitude, latitude])
              .setPopup(new mapboxgl.Popup().setHTML("📍 Vous êtes ici"))
              .addTo(map);
          },
          () => console.warn("Localisation refusée ou indisponible"),
          { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 }
        );
      }
    }, 5000);

    return () => map.remove();
  }, []);

  // 🎯 Bouton manuel “Centrer sur moi”
  const handleLocate = () => {
    if (!mapRef.current || !navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { longitude, latitude } = pos.coords;
        setIsLocated(true);
        mapRef.current!.flyTo({
          center: [longitude, latitude],
          zoom: 13,
          speed: 1.2,
          curve: 1.5,
        });
        if (userMarker.current) userMarker.current.remove();
        userMarker.current = new mapboxgl.Marker({ color: "#ff3b30" })
          .setLngLat([longitude, latitude])
          .setPopup(new mapboxgl.Popup().setHTML("📍 Ma position actuelle"))
          .addTo(mapRef.current!);
      },
      () => alert("Impossible de récupérer votre position"),
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 }
    );
  };

  return (
    <div className="relative flex flex-col items-center w-full">
      {/* 🗺️ Conteneur carte */}
      <div
        ref={mapContainer}
        className="w-[95%] md:w-[90%] lg:w-[85%] h-[80vh] md:h-[85vh] lg:h-[90vh] rounded-xl shadow-md border border-gray-200"
      />

      {/* 📍 Bouton en haut à droite */}
      <button
        onClick={handleLocate}
        className="absolute top-4 right-4 bg-white/90 text-gray-700 px-3 py-2 rounded-full shadow-md hover:bg-white"
      >
        📍 {isLocated ? "Recentrer sur moi" : "Centrer sur moi"}
      </button>
    </div>
  );
};

export default MapboxTestPage;
