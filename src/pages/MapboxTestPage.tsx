import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

const MapboxTestPage: React.FC = () => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const [userMarker, setUserMarker] = useState<mapboxgl.Marker | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Initialisation de la carte
    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [32.85, 39.93], // Ankara
      zoom: 11,
    });

    map.addControl(new mapboxgl.NavigationControl(), "top-right");
    mapRef.current = map;

    return () => map.remove();
  }, []);

  // Fonction pour se géolocaliser
  const handleGeolocate = () => {
    if (!mapRef.current) return;

    if (!navigator.geolocation) {
      alert("La géolocalisation n’est pas disponible sur ce navigateur.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { longitude, latitude } = position.coords;

        // Supprime l’ancien marqueur si existant
        if (userMarker) userMarker.remove();

        // Ajoute un nouveau marqueur
        const marker = new mapboxgl.Marker({ color: "#007AFF" })
          .setLngLat([longitude, latitude])
          .addTo(mapRef.current!);

        setUserMarker(marker);

        // Centre la carte sur ta position
        mapRef.current!.flyTo({
          center: [longitude, latitude],
          zoom: 14,
          speed: 1.2,
        });
      },
      () => {
        alert("Impossible de récupérer votre position.");
      }
    );
  };

  return (
    <div className="w-full h-screen relative">
      {/* Conteneur de la carte */}
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Bouton Ma position */}
      <button
        onClick={handleGeolocate}
        className="absolute bottom-6 left-6 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-blue-700 transition"
      >
        📍 Ma position actuelle
      </button>
    </div>
  );
};

export default MapboxTestPage;
