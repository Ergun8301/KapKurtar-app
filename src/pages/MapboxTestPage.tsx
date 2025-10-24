import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { MapPin } from "lucide-react"; // ✅ icône Google-style (pin rose)

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

const MapboxTestPage = () => {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const userMarker = useRef<mapboxgl.Marker | null>(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    // 🌍 Carte centrée sur la Turquie avec un zoom plus proche
    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [35.2433, 38.9637],
      zoom: 2.1, // ✅ globe un peu plus rapproché
      projection: "globe",
    });

    mapRef.current = map;

    // 🌎 Rotation lente du globe
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

    // 🎬 Zoom doux sur la Turquie après 1,8 s
    setTimeout(() => {
      map.flyTo({
        center: [35.2433, 38.9637],
        zoom: 4.8,
        speed: 1.2,
        curve: 1.3,
      });
    }, 1800);

    // 📍 Géolocalisation automatique si autorisée
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
            userMarker.current = new mapboxgl.Marker({ color: "#ff007a" }) // ✅ rose Google style
              .setLngLat([longitude, latitude])
              .setPopup(new mapboxgl.Popup().setHTML("📍 Vous êtes ici"))
              .addTo(map);
          },
          () => console.warn("Localisation refusée ou indisponible"),
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
      }
    }, 3500);

    return () => map.remove();
  }, []);

  // 🎯 Bouton flottant minimaliste (style Google Maps)
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
        userMarker.current = new mapboxgl.Marker({ color: "#ff007a" })
          .setLngLat([longitude, latitude])
          .setPopup(new mapboxgl.Popup().setHTML("📍 Ma position actuelle"))
          .addTo(mapRef.current!);
      },
      () => alert("Impossible de récupérer votre position"),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  return (
    <div className="relative flex flex-col items-center w-full min-h-[75vh] md:min-h-[80vh] lg:min-h-[85vh]">
      {/* 🗺️ Carte — encadrée, pas plein écran */}
      <div
        ref={mapContainer}
        className="w-[95%] md:w-[90%] lg:w-[85%] h-[75vh] rounded-xl shadow-lg border border-gray-200 overflow-hidden"
      />

      {/* 📍 Bouton rond stylé */}
      <button
        onClick={handleLocate}
        className="absolute top-5 right-5 bg-white/90 p-3 rounded-full shadow-md hover:bg-white hover:scale-105 transition-all"
        title="Centrer sur moi"
      >
        <MapPin className="w-5 h-5 text-pink-500" />
      </button>
    </div>
  );
};

export default MapboxTestPage;
