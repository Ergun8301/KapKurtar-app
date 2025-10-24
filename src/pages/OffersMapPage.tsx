import React, { useRef, useEffect, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { MapPin } from "lucide-react";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

interface Offer {
  id: string;
  title: string;
  description: string;
  image_url?: string;
  price_after: number;
  price_before: number;
  discount_percent: number;
  distance_km?: number;
}

const fakeOffers: Offer[] = [
  {
    id: "1",
    title: "Panier surprise - Boulangerie Ankara",
    description: "Viennoiseries et pains frais invendus du jour.",
    image_url: "https://images.unsplash.com/photo-1509440159596-0249088772ff",
    price_after: 3.5,
    price_before: 10,
    discount_percent: 65,
    distance_km: 1.2,
  },
  {
    id: "2",
    title: "Restaurant Istanbul Kebab",
    description: "Plat chaud à emporter, portions généreuses.",
    image_url: "https://images.unsplash.com/photo-1600891963931-96053a51b0c9",
    price_after: 4,
    price_before: 12,
    discount_percent: 67,
    distance_km: 2.8,
  },
  {
    id: "3",
    title: "Fruits & Légumes - Marché local",
    description: "Panier de fruits frais invendus du jour.",
    image_url: "https://images.unsplash.com/photo-1565958011705-44e211de0d25",
    price_after: 2.5,
    price_before: 8,
    discount_percent: 68,
    distance_km: 4.6,
  },
];

const OffersMapPage = () => {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const userMarker = useRef<mapboxgl.Marker | null>(null);
  const [isLocated, setIsLocated] = useState(false);

  useEffect(() => {
    if (!mapContainer.current) return;

    // Carte initiale : centrée Turquie
    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [35.2433, 39.0],
      zoom: 5.2,
      projection: "globe",
    });

    mapRef.current = map;

    // Ajout des points d'offres factices
    fakeOffers.forEach((offer) => {
      const marker = new mapboxgl.Marker({ color: "#16a34a" })
        .setLngLat([
          35.2433 + (Math.random() - 0.5) * 3, // un peu aléatoire
          39.0 + (Math.random() - 0.5) * 3,
        ])
        .setPopup(
          new mapboxgl.Popup().setHTML(`
            <div style="font-family: sans-serif; font-size: 13px;">
              <strong>${offer.title}</strong><br/>
              <span style="color: green; font-weight: bold;">${offer.price_after}€</span>
              <span style="text-decoration: line-through; color: gray;">${offer.price_before}€</span>
              <br/><em>${offer.description}</em>
            </div>
          `)
        )
        .addTo(map);
    });

    return () => map.remove();
  }, []);

  // 📍 Fonction de géolocalisation
  const handleLocate = () => {
    if (!mapRef.current || !navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { longitude, latitude } = pos.coords;
        setIsLocated(true);

        mapRef.current!.flyTo({
          center: [longitude, latitude],
          zoom: 13,
          speed: 1.3,
          curve: 1.2,
        });

        if (userMarker.current) userMarker.current.remove();
        userMarker.current = new mapboxgl.Marker({ color: "#1d4ed8" })
          .setLngLat([longitude, latitude])
          .setPopup(new mapboxgl.Popup().setHTML("<b>📍 Vous êtes ici</b>"))
          .addTo(mapRef.current!);
      },
      () => alert("Impossible de vous localiser."),
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
    );
  };

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-80px)] w-full bg-gray-50">
      {/* 🗺️ Carte */}
      <div className="relative w-full md:w-1/2 h-[60vh] md:h-full">
        <div
          ref={mapContainer}
          className="absolute inset-0 rounded-none md:rounded-l-xl shadow-md border border-gray-200"
        />
        {/* 📍 Bouton géoloc minimaliste */}
        <button
          onClick={handleLocate}
          className="absolute top-4 left-4 bg-white/90 rounded-full p-2 shadow-md hover:bg-white transition"
          title="Me géolocaliser"
        >
          <MapPin className="w-5 h-5 text-blue-600" />
        </button>
      </div>

      {/* 🛍️ Liste d’offres */}
      <div className="w-full md:w-1/2 overflow-y-auto border-t md:border-t-0 md:border-l border-gray-200 p-4 bg-white">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Offres disponibles</h2>

        <div className="grid grid-cols-1 gap-4">
          {fakeOffers.map((offer) => (
            <div
              key={offer.id}
              className="bg-gray-50 rounded-xl shadow hover:shadow-md transition p-3 flex space-x-3 cursor-pointer"
            >
              {offer.image_url && (
                <img
                  src={offer.image_url}
                  alt={offer.title}
                  className="w-20 h-20 rounded-lg object-cover"
                />
              )}
              <div className="flex flex-col justify-between flex-1">
                <div>
                  <h3 className="text-sm font-bold text-gray-800">{offer.title}</h3>
                  <p className="text-xs text-gray-500 line-clamp-2">
                    {offer.description}
                  </p>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-bold text-green-600">
                      {offer.price_after.toFixed(2)}€
                    </span>
                    <span className="text-xs text-gray-400 line-through">
                      {offer.price_before.toFixed(2)}€
                    </span>
                  </div>
                  <span className="bg-red-500 text-white px-2 py-0.5 rounded text-xs font-bold">
                    -{offer.discount_percent}%
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OffersMapPage;
