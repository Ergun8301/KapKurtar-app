// src/pages/OffersPage.tsx
import { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from "react-leaflet";
import L, { Icon } from "leaflet";
import "leaflet/dist/leaflet.css";
import { Eye, X, Maximize2 } from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../hooks/useAuth";

// --- Icônes
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
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const offerIcon = new Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const searchIcon = new Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

interface Offer {
  offer_id: string;
  title: string;
  merchant_name: string;
  price_before: number;
  price_after: number;
  distance_meters: number;
  offer_lat: number;
  offer_lng: number;
  image_url?: string;
}

const DEFAULT_LOCATION = { lat: 46.2044, lng: 5.2258 };

const MapController = ({ center }: { center: [number, number] }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center);
  }, [center, map]);
  return null;
};

export default function OffersPage() {
  const { user } = useAuth();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(DEFAULT_LOCATION);
  const [center, setCenter] = useState<[number, number]>([
    DEFAULT_LOCATION.lat,
    DEFAULT_LOCATION.lng,
  ]);
  const [searchLocation, setSearchLocation] = useState<[number, number] | null>(null);
  const [radiusKm, setRadiusKm] = useState<number>(
    Number(localStorage.getItem("radiusKm")) || 10
  );
  const [isFullScreen, setIsFullScreen] = useState(false);

  const mapRef = useRef<L.Map>(null);
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isSelecting, setIsSelecting] = useState(false);

  // --- Géolocalisation
  const requestGeolocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const loc = { lat: latitude, lng: longitude };
        setUserLocation(loc);
        setCenter([latitude, longitude]);
        setLoading(false);
      },
      () => setLoading(false),
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  useEffect(() => {
    requestGeolocation();
  }, []);

  // --- Charger les offres
  useEffect(() => {
    if (!user) return;
    const fetchOffers = async () => {
      const { data: client } = await supabase
        .from("clients")
        .select("id")
        .eq("auth_id", user.id)
        .maybeSingle();
      if (client) {
        const { data } = await supabase.rpc("get_offers_nearby_dynamic", {
          p_client_id: client.id,
          p_radius_meters: radiusKm * 1000,
        });
        setOffers(data || []);
      }
    };
    fetchOffers();
  }, [user, center, radiusKm]);

  // --- Barre de recherche Mapbox
  useEffect(() => {
    if (isSelecting) return;
    if (query.length < 3) return setSuggestions([]);
    const load = async () => {
      const res = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          query
        )}.json?access_token=${import.meta.env.VITE_MAPBOX_TOKEN}&language=fr`
      );
      const data = await res.json();
      setSuggestions(data.features || []);
    };
    const t = setTimeout(load, 400);
    return () => clearTimeout(t);
  }, [query, isSelecting]);

  const handleSelect = (feature: any) => {
    const [lng, lat] = feature.center;
    setIsSelecting(true);
    setCenter([lat, lng]);
    setSearchLocation([lat, lng]);
    setQuery(feature.place_name);
    setSuggestions([]);
    setTimeout(() => setIsSelecting(false), 800);
  };

  // --- Recentrage automatique
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const r = radiusKm * 1000;
    const circle = L.circle(center, { radius: r });
    setTimeout(() => {
      map.fitBounds(circle.getBounds(), { padding: [50, 50] });
    }, 200);
  }, [radiusKm, center]);

  // --- Recalcule taille carte plein écran
  useEffect(() => {
    if (isFullScreen && mapRef.current) {
      setTimeout(() => mapRef.current!.invalidateSize(), 400);
    }
  }, [isFullScreen]);

  const activeCenter = searchLocation || [userLocation.lat, userLocation.lng];

  const handleRadiusChange = (val: number) => {
    setRadiusKm(val);
    localStorage.setItem("radiusKm", String(val));
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin h-10 w-10 border-4 border-green-500 border-t-transparent rounded-full" />
      </div>
    );

  return (
    <div
      className={`${
        isFullScreen
          ? "fixed inset-0 z-[2000] bg-white"
          : "flex flex-col md:flex-row h-[calc(100vh-100px)]"
      } transition-all`}
    >
      {/* 🗺️ Carte */}
      <div className="relative flex-1 border-r border-gray-200">
        <MapContainer
          whenCreated={(map) => (mapRef.current = map)}
          center={activeCenter}
          zoom={12}
          style={{ height: "100%", width: "100%" }}
        >
          <MapController center={activeCenter} />
          <TileLayer
            attribution='&copy; <a href="https://www.mapbox.com/">Mapbox</a>'
            url={`https://api.mapbox.com/styles/v1/mapbox/streets-v12/tiles/{z}/{x}/{y}?access_token=${
              import.meta.env.VITE_MAPBOX_TOKEN
            }`}
            tileSize={512}
            zoomOffset={-1}
          />

          {/* 🟢 Cercle clair */}
          <Circle
            center={activeCenter}
            radius={radiusKm * 1000}
            pathOptions={{
              color: "rgba(0,0,0,0.2)",
              fillColor: "rgba(255,255,255,0.4)",
              fillOpacity: 0.6,
            }}
          />

          {/* Points */}
          <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
            <Popup>📍 Vous êtes ici</Popup>
          </Marker>

          {searchLocation && (
            <Marker position={searchLocation} icon={searchIcon}>
              <Popup>📍 Adresse recherchée</Popup>
            </Marker>
          )}

          {offers.map((o) => (
            <Marker
              key={o.offer_id}
              position={[o.offer_lat, o.offer_lng]}
              icon={offerIcon}
            >
              <Popup>
                <strong>{o.title}</strong>
                <br />
                {o.merchant_name}
                <br />
                {(o.distance_meters / 1000).toFixed(2)} km
                <br />
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${o.offer_lat},${o.offer_lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline text-sm"
                >
                  🗺️ Voir dans Google Maps
                </a>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        {/* 🔍 Barre de recherche + GPS */}
        <div className="absolute top-4 left-4 right-16 z-[1000] flex justify-center">
          <div className="relative w-full md:w-3/4 lg:w-2/3">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher une adresse ou un lieu..."
              className="w-full px-4 py-2 bg-white/90 border border-gray-300 rounded-full shadow-sm focus:outline-none focus:ring-1 focus:ring-green-400 text-gray-700"
            />
            {suggestions.length > 0 && (
              <ul className="absolute mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto w-full">
                {suggestions.map((f) => (
                  <li
                    key={f.id}
                    onClick={() => handleSelect(f)}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                  >
                    {f.place_name}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* 📍 Bouton GPS */}
        <button
          onClick={requestGeolocation}
          className="absolute top-4 right-4 z-[1000] flex items-center justify-center w-10 h-10 rounded-full bg-white/90 border border-gray-300 shadow hover:bg-gray-100 active:scale-95"
          title="Me géolocaliser"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="2"
            stroke="rgb(59,130,246)"
            className="w-5 h-5"
          >
            <circle cx="12" cy="12" r="3" />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 2v2m0 16v2m10-10h-2M4 12H2m16.95 7.05l-1.414-1.414M6.464 6.464 5.05 5.05m13.9 0-1.414 1.414M6.464 17.536 5.05 18.95"
            />
          </svg>
        </button>

        {/* 🎚️ Slider simple */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[1000] bg-white/90 rounded-full shadow px-3 py-1 flex items-center space-x-2 border border-gray-200">
          <input
            type="range"
            min={1}
            max={30}
            value={radiusKm}
            onChange={(e) => handleRadiusChange(Number(e.target.value))}
            className="w-36 accent-green-500 cursor-pointer focus:outline-none"
          />
          <span className="text-sm text-gray-700 font-medium">{radiusKm} km</span>
        </div>

        {/* ⛶ Plein écran */}
        <button
          onClick={() => setIsFullScreen(true)}
          className="absolute bottom-4 right-4 z-[1000] bg-white/90 border border-gray-300 rounded-full p-2 shadow hover:bg-gray-100"
          title="Agrandir la carte"
        >
          <Maximize2 className="w-4 h-4 text-gray-600" />
        </button>

        {isFullScreen && (
          <button
            onClick={() => setIsFullScreen(false)}
            className="absolute top-4 right-4 z-[2001] bg-white rounded-full p-2 shadow border hover:bg-gray-100"
          >
            <X className="w-5 h-5 text-gray-700" />
          </button>
        )}
      </div>

      {/* 💸 Liste des offres */}
      {!isFullScreen && (
        <div className="md:w-1/2 overflow-y-auto bg-gray-50 p-4">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Offres à proximité</h2>
          {offers.length === 0 ? (
            <p className="text-gray-500 text-center mt-10">
              Aucune offre disponible dans ce rayon.
            </p>
          ) : (
            <div className="space-y-4">
              {offers.map((o) => (
                <div
                  key={o.offer_id}
                  className="flex bg-white rounded-lg shadow-sm hover:shadow-md transition overflow-hidden cursor-pointer"
                >
                  {o.image_url && (
                    <img
                      src={o.image_url}
                      alt={o.title}
                      className="w-24 h-24 object-cover"
                    />
                  )}
                  <div className="flex-1 p-3">
                    <h3 className="font-semibold text-gray-800">{o.title}</h3>
                    <p className="text-sm text-gray-500">{o.merchant_name}</p>
                    <p className="text-green-600 font-semibold">
                      {(o.distance_meters / 1000).toFixed(2)} km
                    </p>
                    <div className="flex items-center justify-between mt-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-green-600">
                          {o.price_after.toFixed(2)} €
                        </span>
                        <span className="line-through text-gray-400 text-sm">
                          {o.price_before.toFixed(2)} €
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
      )}
    </div>
  );
}
