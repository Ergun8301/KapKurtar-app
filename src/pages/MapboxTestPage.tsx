import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { MapPin } from "lucide-react";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

const MapboxTestPage = () => {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const userMarker = useRef<mapboxgl.Marker | null>(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [35.2433, 38.9637],
      zoom: 2.2,
      projection: "globe",
    });

    mapRef.current = map;

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

    setTimeout(() => {
      map.flyTo({
        center: [35.2433, 38.9637],
        zoom: 4.8,
        speed: 1.2,
        curve: 1.3,
      });
    }, 1800);

    // géoloc automatique
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
            userMarker.current = new mapboxgl.Marker({ color: "#ff007a" })
              .setLngLat([longitude, latitude])
              .setPopup(new mapboxgl.Popup().setHTML("📍 Vous êtes ici"))
              .addTo(map);
          },
          () => console.warn("Localisation refusée"),
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
      }
    }, 3500);

    // ---- Ajout du bouton DANS la carte ----
    map.on("load", () => {
      const btn = document.createElement("button");
      btn.className =
        "mapboxgl-ctrl mapboxgl-ctrl-group bg-white rounded-full shadow-md p-2 hover:scale-105 transition-all";
      btn.style.position = "absolute";
      btn.style.bottom = "20px";
      btn.style.right = "20px";
      btn.style.cursor = "pointer";
      btn.title = "Centrer sur moi";

      const icon = document.createElement("div");
      icon.innerHTML = `<svg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke-width='2' stroke='#ff007a' width='22' height='22'><path stroke-linecap='round' stroke-linejoin='round' d='M12 11.25a.75.75 0 110 1.5.75.75 0 010-1.5zm0 9.75a9.75 9.75 0 100-19.5 9.75 9.75 0 000 19.5z' /></svg>`;
      btn.appendChild(icon);

      btn.onclick = () => {
        if (!navigator.geolocation || !mapRef.current) return;
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
          () => alert("Impossible de récupérer votre position")
        );
      };

      mapContainer.current?.appendChild(btn);
    });

    return () => map.remove();
  }, []);

  return (
    <div className="relative flex flex-col items-center w-full min-h-[75vh] md:min-h-[80vh] lg:min-h-[85vh]">
      <div
        ref={mapContainer}
        className="w-[95%] md:w-[90%] lg:w-[85%] h-[75vh] rounded-xl shadow-lg border border-gray-200 overflow-hidden relative"
      />
    </div>
  );
};

export default MapboxTestPage;
