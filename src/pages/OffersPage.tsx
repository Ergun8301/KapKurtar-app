// src/pages/OffersPage.tsx
import { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from "react-leaflet";
import { Icon } from "leaflet";
import "leaflet/dist/leaflet.css";
import { Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../hooks/useAuth";

// --- Icônes Leaflet
delete (Icon.Default.prototype as any)._getIconUrl;
Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const userIcon = new Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const offerIcon = new Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const searchIcon = new Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

// --- Types
interface Offer {
  offer_id: string;
  title: string;
  description: string;
  price_before: number;
  price_after: number;
  discount_percent: number;
  offer_lat: number;
  offer_lng: number;
  merchant_name: string;
  distance_meters: number;
  image_url?: string;
}

const DEFAULT_LOCATION = { lat: 46.2044, lng: 5.2258 };

const MapController = ({
  center,
  zoom,
}: {
  center: [number, number];
  zoom: number;
}) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
};

export default function OffersPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [userLocation, setUserLocation] = useState(DEFAULT_LOCATION);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [geoStatus, setGeoStatus] = useState<
    "pending" | "success" | "denied" | "error"
  >("pending");
  const [mapCenter, setMapCenter] = useState<[number, number]>([
    DEFAULT_LOCATION.lat,
    DEFAULT_LOCATION.lng,
  ]);
  const [mapZoom, setMapZoom] = useState(12);

  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [searchLocation, setSearchLocation] = useState<[number, number] | null>(
    null
  );
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [radiusKm, setRadiusKm] = useState<number>(
    Number(localStorage.getItem("radiusKm")) || 10
  );

  // --- Géolocalisation
  const requestGeolocation = () => {
    if (!navigator.geolocation) {
      setGeoStatus("error");
      setLoading(false);
      return;
    }
    setGeoStatus("pending");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setUserLocation({ lat: latitude, lng: longitude });
        setMapCenter([latitude, longitude]);
        setGeoStatus("success");
        setMapZoom(13);
        setLoading(false);
      },
      (err) => {
        console.warn("Geolocation error:", err);
        setGeoStatus(err.code === err.PERMISSION_DENIED ? "denied" : "error");
        setUserLocation(DEFAULT_LOCATION);
        setMapCenter([DEFAULT_LOCATION.lat, DEFAULT_LOCATION.lng]);
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  useEffect(() => {
    requestGeolocation();
  }, []);

  // --- Charger les offres dynamiquement
  useEffect(() => {
    if (loading) return;
    const fetchOffers = async () => {
      try {
        const { data: client } = await supabase
          .from("clients")
          .select("id")
          .eq("auth_id", user?.id)
          .maybeSingle();

        if (client) {
          const { data, error } = await supabase.rpc("get_offers_nearby_dynamic", {
            p_client_id: client.id,
            p_radius_meters: radiusKm * 1000,
          });
          if (error) console.error(error);
          setOffers(data || []);
        }
      } catch (err) {
        console.error("Erreur fetch offers:", err);
      }
    };
    fetchOffers();
  }, [user, userLocation, radiusKm, loading]);

  // --- Geocoding Mapbox
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!query || query.length < 3) {
        setSuggestions([]);
        return;
      }
      try {
        const res = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
            query
          )}.json?access_token=${import.meta.env.VITE_MAPBOX_TOKEN}&language=fr`
        );
        const data = await res.json();
        setSuggestions(data.features || []);
      } catch (err) {
        console.error("Erreur Geocoding:", err);
      }
    };
    const timer = setTimeout(fetchSuggestions, 400);
    return () => clearTimeout(timer);
  }, [query]);

  const handleSelectSuggestion = (feature: any) => {
    const [lng, lat] = feature.center;
    setMapCenter([lat, lng]);
    setMapZoom(14);
    setSearchLocation([lat, lng]);
    setSuggestions([]);
    setQuery(feature.place_name);
  };

  const handleOfferClick = (offer: Offer) => {
    setMapCenter([offer.offer_lat, offer.offer_lng]);
    setMapZoom(15);
  };

  const handleRadiusChange = (value: number) => {
    setRadiusKm(value);
    localStorage.setItem("radiusKm", String(value));
  };

  if (loading && geoStatus === "pending") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin h-10 w-10 border-4 border-green-500 border-t-transparent rounded-full mx-auto mb-3" />
          <p className="text-gray-600">Chargement de la carte...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-100px)]">
      {/* 🗺️ Carte à gauche */}
      <div className="relative md:w-1/2 h-[50vh] md:h-auto border-r border-gray-200">
        {/* 🔍 Barre de recherche */}
        <div className="absolute top-4 left-4 right-4 z-[1000] flex items-center justify-center">
          <div className="relative w-full md:w-3/4 lg:w-2/3">
            <input
              ref={inputRef}
              type="text"
              placeholder="Rechercher une adresse ou un lieu..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full px-4 py-2 bg-white border rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            {suggestions.length > 0 && (
              <ul className="absolute mt-1 bg-white border rounded-md shadow-md max-h-60 overflow-auto w-full z-[2000]">
                {suggestions.map((feature) => (
                  <li
                    key={feature.id}
                    onClick={() => handleSelectSuggestion(feature)}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                  >
                    {feature.place_name}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* 🎚️ Slider de rayon */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-[1000] bg-white rounded-full shadow-lg px-4 py-2 flex items-center space-x-2 border">
          <span className="text-sm text-gray-700 font-medium">
            Rayon : {radiusKm} km
          </span>
          <input
            type="range"
            min={1}
            max={30}
            value={radiusKm}
            onChange={(e) => handleRadiusChange(Number(e.target.value))}
            className="w-32 accent-green-500 cursor-pointer"
          />
        </div>

        {/* 🌍 Carte principale */}
        <MapContainer
          center={mapCenter}
          zoom={mapZoom}
          style={{ height: "100%", width: "100%" }}
        >
          <MapController center={mapCenter} zoom={mapZoom} />
          <TileLayer
            attribution='&copy; <a href="https://www.mapbox.com/">Mapbox</a>'
            url={`https://api.mapbox.com/styles/v1/mapbox/streets-v12/tiles/{z}/{x}/{y}?access_token=${
              import.meta.env.VITE_MAPBOX_TOKEN
            }`}
            tileSize={512}
            zoomOffset={-1}
          />

          {/* 🔵 Position utilisateur */}
          <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
            <Popup>📍 Vous êtes ici</Popup>
          </Marker>

          {/* 🔘 Cercle de rayon */}
          <Circle
            center={[userLocation.lat, userLocation.lng]}
            radius={radiusKm * 1000}
            pathOptions={{
              color: "rgba(34,197,94,0.6)",
              fillColor: "rgba(34,197,94,0.2)",
              fillOpacity: 0.2,
            }}
          />

          {/* 📍 Adresse recherchée */}
          {searchLocation && (
            <Marker position={searchLocation} icon={searchIcon}>
              <Popup>📍 Adresse recherchée</Popup>
            </Marker>
          )}

          {/* 🏪 Offres */}
          {offers.map((offer) => (
            <Marker
              key={offer.offer_id}
              position={[offer.offer_lat, offer.offer_lng]}
              icon={offerIcon}
            >
              <Popup>
                <strong>{offer.title}</strong>
                <br />
                {offer.merchant_name}
                <br />
                <span className="text-green-600 font-semibold">
                  {offer.price_after.toFixed(2)}€
                </span>
                <br />
                <span className="text-sm text-gray-500">
                  {(offer.distance_meters / 1000).toFixed(2)} km
                </span>
                <br />
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${offer.offer_lat},${offer.offer_lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline text-sm"
                >
                  🗺️ Voir l’itinéraire
                </a>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* 💸 Liste des offres */}
      <div className="md:w-1/2 overflow-y-auto bg-gray-50 p-4">
        <h2 className="text-xl font-bold text-gray-800 mb-4">
          Offres à proximité
        </h2>

        {offers.length === 0 ? (
          <p className="text-gray-500 text-center mt-10">
            Aucune offre disponible dans ce rayon.
          </p>
        ) : (
          <div className="space-y-4">
            {offers.map((offer) => (
              <div
                key={offer.offer_id}
                onClick={() => handleOfferClick(offer)}
                className="flex bg-white rounded-lg shadow-sm hover:shadow-md transition cursor-pointer overflow-hidden"
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
}
