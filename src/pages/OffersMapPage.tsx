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
  description: string;
  price_before: number;
  price_after: number;
  discount_percent: number;
  distance_meters: number;
  merchant_name: string;
  image_url?: string;
  longitude: number;
  latitude: number;
}

const OffersMapPage = () => {
  const { user } = useAuth();
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const userMarker = useRef<mapboxgl.Marker | null>(null);

  const [offers, setOffers] = useState<Offer[]>([]);
  const [isLocated, setIsLocated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userCoords, setUserCoords] = useState<[number, number]>([35.2433, 39.0]); // Turquie par défaut

  // === INIT MAP ===
  useEffect(() => {
    if (!mapContainer.current) return;

    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [35.2433, 39.0],
      zoom: 5.1,
      projection: "globe",
    });

    mapRef.current = map;

    // 🌍 Bouton de géolocalisation manuelle (petite icône)
    const geoBtn = document.createElement("button");
    geoBtn.className =
      "absolute z-10 top-4 left-4 bg-white rounded-full shadow p-2 hover:bg-gray-100";
    geoBtn.innerHTML = "📍";
    geoBtn.onclick = () => handleLocate();
    map.getContainer().appendChild(geoBtn);

    // Lancement automatique de la géolocalisation
    locateUser();

    return () => map.remove();
  }, []);

  // === GEOLOC USER ===
  const locateUser = () => {
    if (!navigator.geolocation) {
      console.warn("Géolocalisation non supportée");
      setLoading(false);
      return;
    }

    setLoading(true);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { longitude, latitude } = pos.coords;
        setUserCoords([longitude, latitude]);
        setIsLocated(true);
        mapRef.current?.flyTo({ center: [longitude, latitude], zoom: 13 });

        // Marqueur utilisateur
        if (userMarker.current) userMarker.current.remove();
        userMarker.current = new mapboxgl.Marker({ color: "#ff3b30" })
          .setLngLat([longitude, latitude])
          .setPopup(new mapboxgl.Popup().setHTML("<b>Vous êtes ici 📍</b>"))
          .addTo(mapRef.current!);

        await fetchOffers([longitude, latitude]);
        setLoading(false);
      },
      (err) => {
        console.warn("Erreur géolocalisation:", err);
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleLocate = () => locateUser();

  // === FETCH OFFERS (corrigé) ===
  const fetchOffers = async (coords: [number, number]) => {
    try {
      if (!user) {
        console.warn("Utilisateur non connecté");
        return;
      }

      // 🔍 Récupère le profil client dans "profiles"
      const { data: client, error: clientError } = await supabase
        .from("profiles")
        .select("id")
        .eq("auth_id", user.id)
        .single();

      if (clientError) {
        console.error("Erreur profil client:", clientError);
        return;
      }

      // 📡 Appelle la fonction RPC Supabase
      const { data, error } = await supabase.rpc("get_offers_nearby_dynamic", {
        p_client_id: client.id,
        p_radius_meters: 10000,
      });

      if (error) {
        console.error("Erreur RPC:", error);
        setOffers([]);
      } else {
        console.log(`✅ ${data?.length || 0} offre(s) trouvée(s)`);
        setOffers(data || []);
      }
    } catch (e) {
      console.error("Erreur fetch offers:", e);
    }
  };

  // === MARKERS ===
  useEffect(() => {
    if (!mapRef.current || !offers.length) return;

    // Supprime les anciens marqueurs avant d'en ajouter de nouveaux
    document.querySelectorAll(".mapboxgl-marker").forEach((m) => m.remove());

    offers.forEach((offer) => {
      const marker = new mapboxgl.Marker({ color: "#10b981" })
        .setLngLat([offer.longitude, offer.latitude])
        .setPopup(
          new mapboxgl.Popup().setHTML(`
            <div style="max-width:180px">
              <strong>${offer.title}</strong><br/>
              <small>${offer.merchant_name}</small><br/>
              <span style="color:green;font-weight:bold">${offer.price_after}€</span>
            </div>
          `)
        )
        .addTo(mapRef.current!);
    });
  }, [offers]);

  // === LOADING STATE ===
  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin h-10 w-10 border-4 border-green-500 border-t-transparent rounded-full mx-auto mb-3"></div>
          <p className="text-gray-600">Chargement de la carte...</p>
        </div>
      </div>
    );

  // === RENDER ===
  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-100px)] bg-gray-50">
      {/* 🗺️ CARTE */}
      <div ref={mapContainer} className="flex-1 relative rounded-lg shadow-md m-2" />

      {/* 💸 OFFRES */}
      <div className="w-full md:w-1/2 overflow-y-auto bg-white border-l border-gray-200 p-4">
        <h2 className="text-xl font-bold mb-4 text-gray-800">Offres à proximité</h2>
        {offers.length === 0 ? (
          <p className="text-gray-500 text-center mt-10">
            Aucune offre disponible autour de vous
          </p>
        ) : (
          <div className="space-y-4">
            {offers.map((offer) => (
              <div
                key={offer.offer_id}
                className="flex bg-gray-50 rounded-lg shadow-sm hover:shadow-md transition cursor-pointer overflow-hidden"
              >
                {offer.image_url && (
                  <img
                    src={offer.image_url}
                    alt={offer.title}
                    className="w-24 h-24 object-cover"
                  />
                )}
                <div className="flex-1 p-3">
                  <h3 className="font-semibold text-gray-800">{offer.title}</h3>
                  <p className="text-sm text-gray-500">{offer.merchant_name}</p>
                  <p className="text-green-600 font-semibold">
                    {(offer.distance_meters / 1000).toFixed(2)} km
                  </p>
                  <div className="flex items-center justify-between mt-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-green-600">
                        {offer.price_after.toFixed(2)}€
                      </span>
                      <span className="line-through text-gray-400 text-sm">
                        {offer.price_before.toFixed(2)}€
                      </span>
                    </div>
                    <button className="flex items-center gap-1 text-green-700 hover:text-green-900">
                      <Eye className="w-4 h-4" /> Voir
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OffersMapPage;
