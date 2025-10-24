import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Circle, Popup, useMap } from "react-leaflet";
import { Icon } from "leaflet";
import "leaflet/dist/leaflet.css";
import { Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../hooks/useAuth";

// --- Icônes personnalisées ---
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

// --- Types ---
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
  const [radius, setRadius] = useState(10000); // par défaut 10 km
  const [geoStatus, setGeoStatus] = useState<
    "pending" | "success" | "denied" | "error"
  >("pending");
  const [mapCenter, setMapCenter] = useState<[number, number]>([
    DEFAULT_LOCATION.lat,
    DEFAULT_LOCATION.lng,
  ]);
  const [mapZoom, setMapZoom] = useState(12);
  const [searchQuery, setSearchQuery] = useState("");

  // --- Géolocalisation ---
  const requestGeolocation = () => {
    setSearchQuery(""); // 🧭 si on clique GPS, on efface la recherche
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
        setGeoStatus(
          err.code === err.PERMISSION_DENIED ? "denied" : "error"
        );
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

  // --- Charger les offres depuis Supabase ---
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
          const { data, error } = await supabase.rpc(
            "get_offers_nearby_dynamic",
            {
              p_client_id: client.id,
              p_radius_meters: radius,
            }
          );
          if (error) console.error(error);
          setOffers(data || []);
        }
      } catch (err) {
        console.error("Erreur fetch offers:", err);
      }
    };

    fetchOffers();
  }, [user, userLocation, radius, loading]);

  const handleOfferClick = (offer: Offer) => {
    setMapCenter([offer.offer_lat, offer.offer_lng]);
    setMapZoom(15);
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
      <div className="md:w-1/2 h-[50vh] md:h-auto relative border-r border-gray-200 bg-gray-100">
        <MapContainer
          center={mapCenter}
          zoom={mapZoom}
          style={{ height: "100%", width: "100%" }}
          zoomControl={true}
          minZoom={3}
          maxZoom={18}
        >
          <MapController center={mapCenter} zoom={mapZoom} />

          {/* ✅ Carte Mapbox - ton style Tilkapp */}
          <TileLayer
            attribution='© Mapbox © OpenStreetMap'
            url="https://api.mapbox.com/styles/v1/kilicergun01/cmh4k0xk6008i01qt4f8p1mas/tiles/{z}/{x}/{y}?access_token=pk.eyJ1Ijoia2lsaWNlcmd1bjAxIiwiYSI6ImNtaDRoazJsaTFueXgwOHFwaWRzMmU3Y2QifQ.aieAqNwRgY40ydzIDBxc6g"
            tileSize={512}
            zoomOffset={-1}
          />

          {/* 📍 Position utilisateur */}
          <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
            <Popup>📍 Vous êtes ici</Popup>
          </Marker>

          {/* 🔵 Cercle de rayon */}
          <Circle
            center={[userLocation.lat, userLocation.lng]}
            radius={radius}
            color="black"
            fillColor="transparent"
            weight={1.2}
          />
        </MapContainer>

        {/* 🧭 Bouton GPS */}
        <button
          onClick={requestGeolocation}
          className="absolute top-4 right-4 z-[1000] flex items-center justify-center w-10 h-10 rounded-full shadow-md bg-white hover:bg-gray-100 transition-all border border-gray-200 active:scale-95"
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

        {/* 🎚️ Slider du rayon */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white rounded-full shadow-lg px-4 py-2 flex items-center space-x-2 border border-gray-200">
          <input
            type="range"
            min="1000"
            max="30000"
            step="1000"
            value={radius}
            onChange={(e) => setRadius(parseInt(e.target.value))}
            className="w-40 accent-green-600 cursor-pointer"
          />
          <span className="text-gray-800 font-medium">
            {(radius / 1000).toFixed(0)} km
          </span>
        </div>
      </div>

      {/* 💸 Liste des offres à droite */}
      <div className="md:w-1/2 overflow-y-auto bg-gray-50 p-4">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Offres à proximité</h2>

        {offers.length === 0 ? (
          <p className="text-gray-500 text-center mt-10">
            Aucune offre disponible autour de vous.
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
