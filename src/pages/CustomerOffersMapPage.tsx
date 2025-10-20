import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle } from "react-leaflet";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";
import "leaflet/dist/leaflet.css";
import { supabase } from "../lib/supabaseClient";

export default function CustomerOffersMapPage() {
  const [offers, setOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [radius, setRadius] = useState(5000);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);

  // 🌍 Position neutre si le GPS échoue (centrée sur le monde)
  const worldCenter: [number, number] = [0, 0];

  useEffect(() => {
    // 🛰️ Tente la géolocalisation navigateur
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const coords: [number, number] = [pos.coords.latitude, pos.coords.longitude];
        setUserLocation(coords);

        // Appel Supabase : offres proches
        const { data, error } = await supabase.rpc("get_offers_nearby_dynamic", {
          client_id: "00000000-0000-0000-0000-000000000000",
          radius_meters: radius,
        });

        if (!error) setOffers(data || []);
        setLoading(false);
      },
      async (err) => {
        console.warn("⚠️ Géolocalisation refusée :", err.message);
        setUserLocation(worldCenter);

        const { data, error } = await supabase.rpc("get_offers_nearby_dynamic", {
          client_id: "00000000-0000-0000-0000-000000000000",
          radius_meters: radius,
        });

        if (!error) setOffers(data || []);
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, [radius]);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* HEADER */}
      <header className="flex items-center justify-between p-4 bg-white shadow">
        <h1 className="text-2xl font-bold text-green-600">🌿 SEPET</h1>
        <div className="flex items-center gap-2">
          <input
            type="range"
            min={1000}
            max={50000}
            step={1000}
            value={radius}
            onChange={(e) => setRadius(Number(e.target.value))}
            className="w-40 accent-green-600"
          />
          <span className="text-sm text-gray-600">{radius / 1000} km</span>
        </div>
      </header>

      {/* LOADER */}
      {loading && (
        <div className="flex justify-center items-center flex-1">
          <Loader2 className="animate-spin text-green-600 w-10 h-10" />
        </div>
      )}

      {/* CONTENU PRINCIPAL */}
      {!loading && (
        <div className="grid md:grid-cols-2 gap-4 p-4">
          {/* 🗺️ CARTE LEAFLET */}
          <div className="h-[400px] md:h-[600px] rounded-xl overflow-hidden shadow">
            <MapContainer
              center={userLocation || worldCenter}
              zoom={userLocation ? 13 : 2}
              className="h-full w-full"
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution="&copy; OpenStreetMap contributors"
              />

              {/* ✅ Position utilisateur */}
              {userLocation && userLocation !== worldCenter && (
                <>
                  <Marker position={userLocation}>
                    <Popup>
                      <div className="text-center">
                        <p className="font-bold text-green-600">📍 Vous êtes ici</p>
                        <p>Rayon de recherche : {radius / 1000} km</p>
                      </div>
                    </Popup>
                  </Marker>
                  <Circle center={userLocation} radius={radius} color="green" />
                </>
              )}

              {/* 📦 Offres proches */}
              {offers.map((offer, i) => (
                <Marker key={i} position={[offer.latitude, offer.longitude]}>
                  <Popup>
                    <div className="text-center">
                      <h3 className="font-bold">{offer.title}</h3>
                      <p>{offer.price} €</p>
                      <button className="mt-2 px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700">
                        Réserver
                      </button>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>

          {/* 📋 LISTE DES OFFRES */}
          <div className="space-y-3 overflow-y-auto">
            <AnimatePresence>
              {offers.length > 0 ? (
                offers.map((offer, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="p-4 bg-white rounded-xl shadow hover:shadow-md"
                  >
                    <h2 className="font-semibold text-lg">{offer.title}</h2>
                    <p className="text-gray-600">{offer.description}</p>
                    <p className="text-green-600 font-bold">{offer.price} €</p>
                  </motion.div>
                ))
              ) : (
                <p className="text-center text-gray-500">
                  Aucune offre dans ce rayon 🌍
                </p>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
}
