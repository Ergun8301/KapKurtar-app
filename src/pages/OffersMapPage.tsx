import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

interface Offer {
  id: string;
  title: string;
  merchant: string;
  price_after: number;
  price_before: number;
  discount_percent: number;
  distance_km: number;
  image_url?: string;
  lat: number;
  lng: number;
}

const fakeOffers: Offer[] = [
  {
    id: "1",
    title: "Panier anti-gaspillage - Boulangerie Marmara",
    merchant: "Marmara",
    price_after: 4.5,
    price_before: 9,
    discount_percent: 50,
    distance_km: 1.2,
    image_url: "https://images.unsplash.com/photo-1608198093002-ad4e005484b9?w=400",
    lat: 39.92,
    lng: 32.85, // Ankara
  },
  {
    id: "2",
    title: "Plateau repas végétarien",
    merchant: "GreenFood",
    price_after: 5.9,
    price_before: 12,
    discount_percent: 51,
    distance_km: 2.7,
    image_url: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400",
    lat: 41.01,
    lng: 28.97, // Istanbul
  },
  {
    id: "3",
    title: "Fruits et légumes invendus",
    merchant: "MarketBio",
    price_after: 3.2,
    price_before: 6.5,
    discount_percent: 51,
    distance_km: 0.8,
    image_url: "https://images.unsplash.com/photo-1590080875831-b21badd9f8b9?w=400",
    lat: 37.0,
    lng: 35.32, // Adana
  },
];

export default function OffersMapPage() {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const userMarker = useRef<mapboxgl.Marker | null>(null);
  const [isLocated, setIsLocated] = useState(false);
  const [userPosition, setUserPosition] = useState<[number, number]>([35.24, 39.0]);

  // ---- Initialisation carte ----
  useEffect(() => {
    if (!mapContainer.current) return;

    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [35.24, 39.0],
      zoom: 5.1,
      projection: "globe",
    });

    mapRef.current = map;

    // ajout des offres fake
    map.on("load", () => {
      fakeOffers.forEach((offer) => {
        const el = document.createElement("div");
        el.className = "marker";
        el.style.width = "20px";
        el.style.height = "20px";
        el.style.borderRadius = "50%";
        el.style.backgroundColor = "#16a34a";
        el.style.border = "2px solid white";
        el.style.boxShadow = "0 0 4px rgba(0,0,0,0.3)";
        el.style.cursor = "pointer";

        const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
          <div style="width: 180px;">
            ${offer.image_url ? `<img src="${offer.image_url}" style="width:100%;height:90px;object-fit:cover;border-radius:8px;" />` : ""}
            <h4 style="font-weight:bold;margin:4px 0;">${offer.title}</h4>
            <p style="margin:2px 0;color:#555;">${offer.merchant}</p>
            <p style="color:#16a34a;">📍 ${offer.distance_km} km</p>
            <p><strong>${offer.price_after}€</strong> <span style="text-decoration:line-through;color:gray;">${offer.price_before}€</span></p>
          </div>
        `);

        new mapboxgl.Marker(el)
          .setLngLat([offer.lng, offer.lat])
          .setPopup(popup)
          .addTo(map);
      });
    });

    return () => map.remove();
  }, []);

  // ---- Bouton "Centrer sur moi" ----
  const handleLocate = () => {
    if (!mapRef.current || !navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { longitude, latitude } = pos.coords;
        setUserPosition([longitude, latitude]);
        setIsLocated(true);

        mapRef.current!.flyTo({
          center: [longitude, latitude],
          zoom: 13,
          speed: 1.2,
          curve: 1.4,
        });

        if (userMarker.current) userMarker.current.remove();
        userMarker.current = new mapboxgl.Marker({ color: "#007bff" })
          .setLngLat([longitude, latitude])
          .setPopup(new mapboxgl.Popup().setHTML("📍 Ma position actuelle"))
          .addTo(mapRef.current!);
      },
      () => alert("Impossible de récupérer votre position"),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
      {/* Liste d'offres */}
      <div className="md:w-2/5 w-full border-r border-gray-200 p-4 overflow-y-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Offres disponibles</h2>
        {fakeOffers.map((offer) => (
          <div
            key={offer.id}
            className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow cursor-pointer overflow-hidden mb-4"
          >
            {offer.image_url && (
              <img
                src={offer.image_url}
                alt={offer.title}
                className="w-full h-44 object-cover"
              />
            )}
            <div className="p-4">
              <h3 className="font-bold text-lg text-gray-900 mb-1">{offer.title}</h3>
              <p className="text-sm text-gray-600 font-medium mb-2">{offer.merchant}</p>
              <p className="text-sm text-green-600 font-semibold mb-3">
                📍 {offer.distance_km} km
              </p>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <span className="text-xl font-bold text-green-600">
                    {offer.price_after.toFixed(2)}€
                  </span>
                  <span className="text-sm text-gray-400 line-through">
                    {offer.price_before.toFixed(2)}€
                  </span>
                </div>
                <span className="bg-red-500 text-white px-3 py-1 rounded-lg text-sm font-bold">
                  -{offer.discount_percent}%
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Carte Mapbox */}
      <div className="relative md:w-3/5 w-full">
        <div
          ref={mapContainer}
          className="h-[60vh] md:h-screen w-full rounded-none md:rounded-xl shadow-md border border-gray-200"
        />

        {/* Bouton vertical à gauche */}
        <div className="absolute top-6 left-4 flex flex-col items-center space-y-3 bg-white/90 rounded-xl p-2 shadow-md">
          <button
            onClick={handleLocate}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-green-600 hover:bg-green-700 text-white font-bold shadow-md"
            title="Me géolocaliser"
          >
            📍
          </button>
          {isLocated && (
            <span className="text-xs text-gray-600 font-medium mt-1">Centré</span>
          )}
        </div>
      </div>
    </div>
  );
}
