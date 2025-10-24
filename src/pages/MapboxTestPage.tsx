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
      projection: "globe", // Vue 3D effet planète
    });

    mapRef.current = map;

    // Animation de rotation douce du globe 🌎
    let rotate = true;
    function rotateGlobe() {
      if (!rotate) return;
      const center = map.getCenter();
      map.easeTo({ center: [center.lng + 0.1, center.lat], duration: 20000, easing: (n) => n });
      requestAnimationFrame(rotateGlobe);
    }
    rotateGlobe();

    // Tentative de géolocalisation de l’utilisateur 📍
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          rotate = false; // stop rotation
          const { longitude, latitude } = position.coords;
          map.flyTo({
            center: [longitude, latitude],
            zoom: 13,
            essential: true,
            speed: 1.2,
          });

          // Ajout d’un marqueur bleu sur l’utilisateur
          new mapboxgl.Marker({ color: "#007bff" })
            .setLngLat([longitude, latitude])
            .setPopup(new mapboxgl.Popup().setHTML("📍 Vous êtes ici"))
            .addTo(map);
        },
        () => {
          console.warn("Localisation non autorisée ou indisponible");
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    }

    return () => map.remove();
  }, []);

  return (
    <div className="flex flex-col items-center w-full h-screen">
      <div ref={mapContainer} className="w-full h-full" />
    </div>
  );
};

export default MapboxTestPage;
