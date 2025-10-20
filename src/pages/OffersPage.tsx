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
  shadowSize: [41, 41]
});

const offerIcon = new Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
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
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
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
            .from('clients')
            .select('id')
            .eq('auth_id', user.id)
            .maybeSingle();

          if (clientData) {
            const { data, error } = await supabase.rpc('get_offers_nearby_dynamic_v2', {
              client_id: clientData.id,
              radius_meters: radiusKm * 1000,
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

        const { data, error } = await supabase
          .from('offers')
          .select(`
            id,
            title,
            description,
            price_before,
            price_after,
            discount_percent,
            image_url,
            merchant_id,
            merchants!inner (
              id,
              name,
              profiles!inner (
                lat,
                lng
              )
            )
          `)
          .eq('status', 'active')
          .limit(50);

        if (error) {
          console.error('Error fetching public offers:', error);
          setOffers([]);
        } else if (data) {
          const formattedOffers = data
            .filter((offer: any) => {
              const profile = offer.merchants?.profiles;
              return profile && profile.lat && profile.lng;
            })
            .map((offer: any) => {
              const profile = offer.merchants.profiles;
              const lat = profile.lat;
              const lng = profile.lng;
              const distance = calculateDistance(
                userLocation.lat,
                userLocation.lng,
                lat,
                lng
              );

              return {
                offer_id: offer.id,
                title: offer.title,
                description: offer.description,
                price_before: offer.price_before,
                price_after: offer.price_after,
                discount_percent: offer.discount_percent,
                offer_lat: lat,
                offer_lng: lng,
                merchant_name: offer.merchants.name,
                distance_meters: distance,
                image_url: offer.image_url,
              };
            })
            .filter((offer: Offer) => offer.distance_meters <= radiusKm * 1000)
            .sort((a: Offer, b: Offer) => a.distance_meters - b.distance_meters);

          setOffers(formattedOffers);
        }
      } catch (err) {
        console.error('Error:', err);
        setOffers([]);
      }
    };

    fetchOffers();
  }, [user, userLocation, radiusKm, loading]);

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371000;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const handleRadiusChange = (newRadiusKm: number) => {
    setRadiusKm(newRadiusKm);
    localStorage.setItem('searchRadius', (newRadiusKm * 1000).toString());

    const zoom = newRadiusKm <= 5 ? 13 : newRadiusKm <= 10 ? 12 : newRadiusKm <= 20 ? 11 : 10;
    setMapZoom(zoom);
  };

  const handleOfferClick = (offer: Offer) => {
    setMapCenter([offer.offer_lat, offer.offer_lng]);
    setMapZoom(15);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOfferActionClick = () => {
    if (!user) {
      navigate('/customer/auth');
    }
  };

  const radiusOptions = [2, 5, 10, 15, 20];

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
        {geoStatus === 'denied' && (
          <div className="bg-orange-100 border-l-4 border-orange-500 p-4">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-orange-600 mr-3" />
              <div className="flex-1">
                <p className="text-sm text-orange-800">
                  <strong>Impossible d'accéder à votre position.</strong> Affichage de la zone de Bourg-en-Bresse par défaut.
                </p>
              </div>
            </div>
          </div>
        )}

        {geoStatus === 'error' && (
          <div className="bg-red-100 border-l-4 border-red-500 p-4">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-600 mr-3" />
              <div className="flex-1">
                <p className="text-sm text-red-800">
                  <strong>Erreur de géolocalisation.</strong> Position par défaut utilisée.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="p-4 border-b border-gray-200">
          <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center space-x-2">
              <MapPin className="w-5 h-5 text-green-600" />
              <span className="font-medium text-gray-700">Rayon:</span>
            </div>
            <div className="flex space-x-2 flex-wrap">
              {radiusOptions.map((radius) => (
                <button
                  key={radius}
                  onClick={() => handleRadiusChange(radius)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    radiusKm === radius
                      ? 'bg-green-600 text-white shadow-md'
                      : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                  }`}
                >
                  {radius} km
                </button>
              ))}
            </div>
            <button
              onClick={requestGeolocation}
              className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              <Navigation className="w-4 h-4" />
              <span>📍 Me géolocaliser</span>
            </button>
          </div>
        </div>

        <div className="relative h-[500px]">
          <MapContainer
            center={mapCenter}
            zoom={mapZoom}
            style={{ height: '100%', width: '100%' }}
            className="z-0"
          >
            <MapController center={mapCenter} zoom={mapZoom} />
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <Circle
              center={[userLocation.lat, userLocation.lng]}
              radius={radiusKm * 1000}
              pathOptions={{
                color: '#10b981',
                fillColor: '#10b981',
                fillOpacity: 0.1,
                weight: 2
              }}
            />

            <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
              <Popup>
                <div className="text-center">
                  <p className="font-semibold text-blue-600">
                    {geoStatus === 'success' ? 'Vous êtes ici' : 'Position par défaut (Bourg-en-Bresse)'}
                  </p>
                  <p className="text-sm text-gray-600">Rayon: {radiusKm} km</p>
                </div>
              </Popup>
            </Marker>

            {offers.map((offer) => (
              <Marker
                key={offer.offer_id}
                position={[offer.offer_lat, offer.offer_lng]}
                icon={offerIcon}
              >
                <Popup>
                  <div className="w-64">
                    {offer.image_url && (
                      <img
                        src={offer.image_url}
                        alt={offer.title}
                        className="w-full h-32 object-cover rounded-lg mb-2"
                      />
                    )}
                    <h4 className="font-bold text-gray-900 mb-1">{offer.title}</h4>
                    <p className="text-sm text-gray-700 font-medium mb-1">{offer.merchant_name}</p>
                    <p className="text-sm text-green-600 font-semibold mb-2">
                      📍 {(offer.distance_meters / 1000).toFixed(2)} km
                    </p>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg font-bold text-green-600">
                          {offer.price_after.toFixed(2)}€
                        </span>
                        <span className="text-sm text-gray-400 line-through">
                          {offer.price_before.toFixed(2)}€
                        </span>
                      </div>
                      <span className="bg-red-500 text-white px-2 py-1 rounded text-sm font-bold">
                        -{offer.discount_percent}%
                      </span>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        <div className="p-4 bg-gray-50 border-t border-gray-200">
          <div className="max-w-7xl mx-auto">
            {offers.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-gray-500 text-lg mb-2">Aucune offre dans ce rayon 🌍</p>
                <p className="text-sm text-gray-400">
                  Essayez d'augmenter le rayon de recherche
                </p>
              </div>
            ) : (
              <div className="text-sm text-gray-600">
                <span className="font-semibold text-gray-900">{offers.length}</span> offre
                {offers.length !== 1 ? 's' : ''} trouvée{offers.length !== 1 ? 's' : ''} dans un
                rayon de {radiusKm} km
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Offres disponibles</h2>

        {offers.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">Aucune offre disponible</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {offers.map((offer) => (
              <div
                key={offer.offer_id}
                className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow cursor-pointer overflow-hidden"
                onClick={() => handleOfferClick(offer)}
              >
                {offer.image_url && (
                  <img
                    src={offer.image_url}
                    alt={offer.title}
                    className="w-full h-48 object-cover"
                  />
                )}
                <div className="p-4">
                  <h3 className="font-bold text-lg text-gray-900 mb-1">{offer.title}</h3>
                  <p className="text-sm text-gray-600 font-medium mb-2">{offer.merchant_name}</p>
                  <p className="text-sm text-green-600 font-semibold mb-3">
                    📍 {(offer.distance_meters / 1000).toFixed(2)} km
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

                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{offer.description}</p>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOfferActionClick();
                    }}
                    className="w-full flex items-center justify-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    <span>{user ? 'Voir détail' : 'Se connecter pour réserver'}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
