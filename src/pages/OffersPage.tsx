import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import { Icon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Navigation, AlertCircle, MapPin, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../hooks/useAuth';

delete (Icon.Default.prototype as any)._getIconUrl;
Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const userIcon = new Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const offerIcon = new Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

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

const MapController = ({ center, zoom }: { center: [number, number]; zoom: number }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
};

export default function OffersPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number }>(DEFAULT_LOCATION);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [radiusKm, setRadiusKm] = useState<number>(() => {
    const saved = localStorage.getItem('searchRadius');
    return saved ? parseInt(saved, 10) / 1000 : 5;
  });
  const [loading, setLoading] = useState(true);
  const [geoStatus, setGeoStatus] = useState<'pending' | 'success' | 'denied' | 'error'>('pending');
  const [mapCenter, setMapCenter] = useState<[number, number]>([DEFAULT_LOCATION.lat, DEFAULT_LOCATION.lng]);
  const [mapZoom, setMapZoom] = useState(12);

  const requestGeolocation = () => {
    if (!navigator.geolocation) {
      setGeoStatus('error');
      setLoading(false);
      return;
    }

    setLoading(true);
    setGeoStatus('pending');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const location = { lat: latitude, lng: longitude };
        setUserLocation(location);
        setMapCenter([latitude, longitude]);
        setGeoStatus('success');

        const zoom = radiusKm <= 5 ? 13 : radiusKm <= 10 ? 12 : radiusKm <= 20 ? 11 : 10;
        setMapZoom(zoom);
        setLoading(false);
      },
      (error) => {
        console.error('Geolocation error:', error);
        if (error.code === error.PERMISSION_DENIED) {
          setGeoStatus('denied');
        } else {
          setGeoStatus('error');
        }
        setUserLocation(DEFAULT_LOCATION);
        setMapCenter([DEFAULT_LOCATION.lat, DEFAULT_LOCATION.lng]);
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  useEffect(() => {
    requestGeolocation();
  }, []);

  useEffect(() => {
    if (loading) return;

    const fetchOffers = async () => {
      try {
        if (user) {
          const { data: clientData } = await supabase
            .from('profiles')
            .select('id')
            .eq('auth_id', user.id)
            .maybeSingle();

          if (clientData) {
            const { data, error } = await supabase.rpc('get_offers_nearby_dynamic', {
              p_client_id: clientData.id,
              p_radius_meters: radiusKm * 1000,
            });

            if (error) {
              console.error('Error fetching offers:', error);
              setOffers([]);
            } else {
              setOffers(data || []);
            }
            return;
          }
        }
      } catch (err) {
        console.error('Error:', err);
        setOffers([]);
      }
    };

    fetchOffers();
  }, [user, userLocation, radiusKm, loading]);

  const handleOfferClick = (offer: Offer) => {
    setMapCenter([offer.offer_lat, offer.offer_lng]);
    setMapZoom(15);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading && geoStatus === 'pending') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de la carte...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-lg">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <button
            onClick={requestGeolocation}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            <Navigation className="w-4 h-4" /> <span>Me géolocaliser</span>
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row h-[calc(100vh-100px)]">
        <div className="md:w-1/2 h-[400px] md:h-auto">
          <MapContainer center={mapCenter} zoom={mapZoom} style={{ height: '100%', width: '100%' }}>
            <MapController center={mapCenter} zoom={mapZoom} />
            <TileLayer
              attribution='&copy; <a href="https://www.mapbox.com/">Mapbox</a>'
              url={`https://api.mapbox.com/styles/v1/mapbox/streets-v12/tiles/{z}/{x}/{y}?access_token=${import.meta.env.VITE_MAPBOX_TOKEN}`}
              tileSize={512}
              zoomOffset={-1}
            />

            <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
              <Popup>Vous êtes ici</Popup>
            </Marker>

            {offers.map((offer) => (
              <Marker
                key={offer.offer_id}
                position={[offer.offer_lat, offer.offer_lng]}
                icon={offerIcon}
                eventHandlers={{
                  click: () => handleOfferClick(offer),
                }}
              >
                <Popup>
                  <div className="text-sm">
                    <strong>{offer.title}</strong>
                    <br />
                    <span>{offer.price_after.toFixed(2)} €</span>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        <div className="w-full md:w-1/2 overflow-y-auto p-4">
          <h2 className="text-xl font-bold mb-4">Offres à proximité</h2>
          {offers.length === 0 ? (
            <p className="text-gray-500 text-center">Aucune offre disponible</p>
          ) : (
            <div className="space-y-3">
              {offers.map((offer) => (
                <div
                  key={offer.offer_id}
                  className="p-3 bg-white rounded-xl shadow hover:shadow-lg cursor-pointer"
                  onClick={() => handleOfferClick(offer)}
                >
                  <h3 className="font-semibold">{offer.title}</h3>
                  <p className="text-green-600 font-bold">
                    {(offer.distance_meters / 1000).toFixed(2)} km
                  </p>
                  <p>
                    {offer.price_after.toFixed(2)}€ <span className="line-through text-gray-400">{offer.price_before.toFixed(2)}€</span>
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
