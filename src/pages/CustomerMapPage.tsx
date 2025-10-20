import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import { Icon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Navigation, AlertCircle } from 'lucide-react';
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

const MapController: React.FC<{ center: [number, number]; zoom: number }> = ({ center, zoom }) => {
  const map = useMap();

  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);

  return null;
};

export default function CustomerMapPage() {
  const { user } = useAuth();
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number }>(DEFAULT_LOCATION);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [radiusKm, setRadiusKm] = useState<number>(() => {
    const saved = localStorage.getItem('searchRadius');
    return saved ? parseInt(saved, 10) / 1000 : 5;
  });
  const [loading, setLoading] = useState(true);
  const [geoStatus, setGeoStatus] = useState<'pending' | 'success' | 'denied' | 'error'>('pending');
  const [clientId, setClientId] = useState<string | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>([DEFAULT_LOCATION.lat, DEFAULT_LOCATION.lng]);
  const [mapZoom, setMapZoom] = useState(12);

  useEffect(() => {
    const fetchClientId = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('clients')
          .select('id')
          .eq('auth_id', user.id)
          .maybeSingle();

        if (error) {
          console.error('Error fetching client:', error);
          return;
        }

        if (data) {
          setClientId(data.id);
        }
      } catch (err) {
        console.error('Error:', err);
      }
    };

    fetchClientId();
  }, [user]);

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
    if (!clientId || loading) return;

    const fetchOffers = async () => {
      try {
        const { data, error } = await supabase.rpc('get_offers_nearby_dynamic_v2', {
          client_id: clientId,
          radius_meters: radiusKm * 1000,
        });

        if (error) {
          console.error('Error fetching offers:', error);
          setOffers([]);
        } else {
          setOffers(data || []);
        }
      } catch (err) {
        console.error('Error:', err);
        setOffers([]);
      }
    };

    fetchOffers();
  }, [clientId, userLocation, radiusKm, loading]);

  const handleRadiusChange = (newRadiusKm: number) => {
    setRadiusKm(newRadiusKm);
    localStorage.setItem('searchRadius', (newRadiusKm * 1000).toString());

    const zoom = newRadiusKm <= 5 ? 13 : newRadiusKm <= 10 ? 12 : newRadiusKm <= 20 ? 11 : 10;
    setMapZoom(zoom);
  };

  const radiusOptions = [2, 5, 10, 15, 20];

  if (loading && geoStatus === 'pending') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Obtention de votre position...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
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

          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center space-x-2">
                <MapPin className="w-5 h-5 text-green-600" />
                <span className="font-medium text-gray-700">Rayon de recherche:</span>
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
                title="Rafraîchir la position"
              >
                <Navigation className="w-4 h-4" />
                <span>📍 Me géolocaliser</span>
              </button>
            </div>
          </div>

          <div className="relative h-[600px]">
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
                    <p className="text-sm text-gray-600">
                      Rayon: {radiusKm} km
                    </p>
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
                      <p className="text-sm text-gray-700 font-medium mb-1">
                        {offer.merchant_name}
                      </p>
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
                      <p className="text-xs text-gray-600 line-clamp-2">{offer.description}</p>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>

          <div className="p-4 bg-gray-50 border-t border-gray-200">
            {offers.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 text-lg mb-2">Aucune offre dans ce rayon 🌍</p>
                <p className="text-sm text-gray-400">
                  Essayez d'augmenter le rayon de recherche
                </p>
              </div>
            ) : (
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">
                  <span className="font-semibold text-gray-900">{offers.length}</span> offre
                  {offers.length !== 1 ? 's' : ''} trouvée{offers.length !== 1 ? 's' : ''} dans un
                  rayon de {radiusKm} km
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
