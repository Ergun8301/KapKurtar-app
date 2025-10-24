import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../hooks/useAuth";
import { Eye } from "lucide-react";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

interface Offer {
  offer_id: string;
  title: string;
  price_after: number;
  distance_meters: number;
  longitude: number;
  latitude: number;
  image_url?: string;
}

const OffersMapPage = () => {
  const { user } = useAuth();
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);

  const [offers, setOffers] = useState<Offer[]>([]);
  const [selectedOffer, setSelectedOffer] = useState<string | null>(null);
  const [userCoords, setUserCoords] = useState<[number, number]>([35.2433, 39.0]); // Turquie par défaut
  const [loading, setLoading] = useState(true);

  // 🧭 1. Géolocalisation utilisateur
  useEffect(() => {
    if (!navigator.geolocation) {
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { longitude, latitude } = pos.coords;
        setUserCoords([longitude, latitude]);
        setLoading(false);
      },
      () => {
        console.warn("Localisation refusée ou indisponible");
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, []);

  // 🗺️ 2. Initialisation de la carte Mapbox
  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: userCoords,
      zoom: 7,
      projection: "globe",
    });

    mapRef.current = map;

    return () => map.remove();
  }, [userCoords]);

  // 🧮 3. Récupération des offres dynamiques
  useEffect(() => {
    const fetchOffers = async () => {
      if (!user) return;

      const { data: clientData } = await supabase
        .from("profiles")
        .select("id")
        .eq("auth_id", user.id)
        .maybeSingle();

      if (!clientData) return;

      const { data, error } = await supabase.rpc("get_offers_nearby_dynamic", {
        p_client_id: clientData.id,
        p_radius_meters: 10000, // 10 km par défaut
      });

      if (error) {
        console.error("Erreur lors du chargement des offres :", error);
        return;
      }

      setOffers(data || []);
    };

    fetchOffers();
  }, [user]);

  // 📍 4. Ajout des marqueurs sur la carte
  useEffect(() => {
    if (!mapRef.current || offers.length === 0) return;

    offers.forEach((offer) => {
      const marker = new mapboxgl.Marker({
        color: offer.offer_id === selectedOffer ? "#10b981" : "#1d4ed8",
      })
        .setLngLat([offer.longitude, offer.latitude])
        .setPopup(
          new mapboxgl.Popup().setHTML(`
            <div style="font-size:14px;">
              <strong>${offer.title}</strong><br/>
              💶 ${offer.price_after}€<br/>
              📏 ${(offer.distance_meters / 1000).toFixed(1)} km
            </div>
          `)
        )
        .addTo(mapRef.current!);
    });
  }, [offers, selectedOffer]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-gray-500">Chargement de la carte...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      {/* 🗺️ Carte à gauche */}
      <div ref={mapContainer} className="flex-1 h-[50vh] md:h-auto" />

      {/* 🧾 Liste des offres à droite */}
      <div className="w-full md:w-[420px] overflow-y-auto bg-white border-l border-gray-200">
        <h2 className="text-xl font-bold p-4 border-b">Offres à proximité</h2>

        {offers.length === 0 ? (
          <p className="text-center text-gray-500 p-6">Aucune offre trouvée</p>
        ) : (
          <div className="divide-y">
            {offers.map((offer) => (
              <div
                key={offer.offer_id}
                className={`p-4 cursor-pointer hover:bg-gray-50 ${
                  selectedOffer === offer.offer_id ? "bg-green-50" : ""
                }`}
                onClick={() => setSelectedOffer(offer.offer_id)}
              >
                {offer.image_url && (
                  <img
                    src={offer.image_url}
                    alt={offer.title}
                    className="w-full h-40 object-cover rounded-lg mb-2"
                  />
                )}
                <h3 className="font-semibold text-gray-900">{offer.title}</h3>
                <p className="text-sm text-gray-600">
                  💶 {offer.price_after} € — {(offer.distance_meters / 1000).toFixed(1)} km
                </p>
                <button className="mt-2 w-full bg-green-600 text-white py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-green-700">
                  <Eye className="w-4 h-4" /> Voir
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OffersMapPage;
