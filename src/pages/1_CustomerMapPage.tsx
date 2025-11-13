import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import { Icon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Navigation, AlertCircle, Star } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../hooks/useAuth';
import FavoriteButton from '../components/FavoriteButton'; // ❤️ nouveau composant

// ---------- ICONES ----------
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

// ---------- TYPES ----------
interface Offer {
  offer_id: string;
  title: string;
  description: string;
  price_before: number;
  price_after: number;
  discount_percent: number;
  offer_lat: number;
  offer_lng: number;
  merchant_id: string;
  merchant_name: string;
  distance_meters: number;
  image_url?: string;
}

interface MerchantRating {
  merchant_id: string;
  avg_rating: number;
  review_count: number;
}

const DEFAULT_LOCATION = { lat: 46.2044, lng: 5.2258 };

// ---------- MAP CONTROLLER ----------
const MapController: React.FC<{ center: [number, number]; zoom: number }> = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
};

// ---------- PAGE PRINCIPALE ----------
export default function CustomerMapPage() {
  const { user } = useAuth();
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number }>(DEFAULT_LOCATION);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [ratings, setRatings] = useState<Record<string, MerchantRating>>({});
  const [radiusKm, setRadiusKm] = useState<number>(() => {
    const saved = localStorage.getItem('searchRadius');
    return saved ? parseInt(saved, 10) / 1000 : 5;
  });
  const [loading, setLoading] = useState(true);
  const [geoStatus, setGeoStatus] = useState<'pending' | 'success' | 'denied' | 'error'>('pending');
  const [clientId, setClientId] = useState<string | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>([DEFAULT_LOCATION.lat, DEFAULT_LOCATION.lng]);
  const [mapZoom, setMapZoom] = useState(12);

  // 🔐 Récupération du client_id
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
          console.error('Erreur client_id:', error);
          return;
        }
        if (data) setClientId(data.id);
      } catch (err) {
        console.error('Erreur client_id:', err);
      }
    };
    fetchClientId();
  }, [user]);

  // 📍 Géolocalisation
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
        console.error('Erreur GPS:', error);
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

  // 📡 Chargement des offres proches
  useEffect(() => {
    if (!clientId || loading) return;
    const fetchOffers = async () => {
      try {
        const { data, error } = await supabase.rpc('get_offers_nearby_dynamic_v2', {
          client_id: clientId,
          radius_meters: radiusKm * 1000,
        });
        if (error) {
          console.error('Erreur offres:', error);
          setOffers([]);
        } else {
          setOffers(data || []);
        }
      } catch (err) {
        console.error('Erreur requête offres:', err);
        setOffers([]);
      }
    };
    fetchOffers();
  }, [clientId, userLocation, radiusKm, loading]);

  // ⭐ Charger la moyenne des avis
  useEffect(() => {
    const fetchRatings = async () => {
      if (offers.length === 0) return;
      const merchantIds = offers.map((o) => o.merchant_id);
      const { data, error } = await supabase
        .from('reviews')
        .select('merchant_id, rating')
        .in('merchant_id', merchantIds);

      if (error) {
        console.error('Erreur chargement avis:', error);
        return;
      }

      const grouped: Record<string, { sum: number; count: number }> = {};
      data.forEach((r) => {
        if (!grouped[r.merchant_id]) grouped[r.merchant_id] = { sum: 0, count: 0 };
        grouped[r.merchant_id].sum += r.rating;
        grouped[r.merchant_id].count += 1;
      });

      const result: Record<string, MerchantRating> = {};
      Object.entries(grouped).forEach(([merchant_id, g]) => {
        result[merchant_id] = {
          merchant_id,
          avg_rating: g.sum / g.count,
          review_count: g.count,
        };
      });

      setRatings(result);
    };

    fetchRatings();
  }, [offers]);

  // ⚙️ Changement de rayon
  const handleRadiusChange = (newRadiusKm: number) => {
    setRadiusKm(newRadiusKm);
    localStorage.setItem('searchRadius', (newRadiusKm * 1000).toString());
    const zoom = newRadiusKm <= 5 ? 13 : newRadiusKm <= 10 ? 12 : newRadiusKm <= 20 ? 11 : 10;
    setMapZoom(zoom);
  };

  const radiusOptions = [2, 5, 10, 15, 20];

  // 🌀 Loader initial
  if (loading && geoStatus === 'pending') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700 mx-auto mb-4"></div>
          <p className="text-gray-600">Obtention de votre position...</p>
        </div>
      </div>
    );
  }

  // ---------- RENDU ----------
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">

          {/* CONTROLES */}
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center space-x-2">
                <MapPin className="w-5 h-5 text-blue-600" />
                <span className="font-medium text-gray-700">Rayon :</span>
              </div>
              <div className="flex space-x-2 flex-wrap">
                {radiusOptions.map((radius) => (
                  <button
                    key={radius}
                    onClick={() => handleRadiusChange(radius)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      radiusKm === radius
                        ? 'bg-blue-700 text-white shadow-md'
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

          {/* 🗺️ CARTE */}
          <div className="relative h-[600px]">
            <MapContainer
              center={mapCenter}
              zoom={mapZoom}
              style={{ height: '100%', width: '100%' }}
              className="z-0"
            >
              <MapController center={mapCenter} zoom={mapZoom} />
             <TileLayer
  attribution='&copy; <a href="https://www.mapbox.com/">Mapbox</a>'
  url="https://api.mapbox.com/styles/v1/mapbox/streets-v12/tiles/{z}/{x}/{y}?access_token=${import.meta.env.VITE_MAPBOX_TOKEN}"
  tileSize={512}
  zoomOffset={-1}
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
                    <p className="text-sm text-gray-600">Rayon : {radiusKm} km</p>
                  </div>
                </Popup>
              </Marker>

              {/* 🟢 OFFRES AVEC NOTE ET COEUR */}
              {offers.map((offer) => {
                const rating = ratings[offer.merchant_id];
                return (
                  <Marker
                    key={offer.offer_id}
                    position={[offer.offer_lat, offer.offer_lng]}
                    icon={offerIcon}
                  >
                    <Popup>
                      <div className="w-64 text-center">
                        {offer.image_url && (
                          <img
                            src={offer.image_url}
                            alt={offer.title}
                            className="w-full h-32 object-cover rounded-lg mb-2"
                          />
                        )}
                        <h4 className="font-bold text-gray-900 mb-1">{offer.title}</h4>
                        <div className="flex items-center justify-center mb-1">
                          <p className="text-sm text-gray-700 font-medium">{offer.merchant_name}</p>
                          {rating && (
                            <div className="flex items-center ml-2">
                              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400 mr-1" />
                              <span className="text-sm text-gray-700 font-semibold">
                                {rating.avg_rating.toFixed(1)}
                              </span>
                              <span className="text-xs text-gray-400 ml-1">
                                ({rating.review_count})
                              </span>
                            </div>
                          )}
                        </div>

                        <p className="text-sm text-blue-600 font-semibold mb-2">
                          📍 {(offer.distance_meters / 1000).toFixed(2)} km
                        </p>

                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <span className="text-lg font-bold text-blue-600">
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

                        <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                          {offer.description}
                        </p>

                        {/* ❤️ Bouton Favori */}
                        <div className="flex justify-center">
                          <FavoriteButton merchantId={offer.merchant_id} />
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
            </MapContainer>
          </div>

          {/* BAS DE PAGE */}
          <div className="p-4 bg-gray-50 border-t border-gray-200">
            {offers.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 text-lg mb-2">Aucune offre dans ce rayon 🌍</p>
                <p className="text-sm text-gray-400">Essayez d’augmenter le rayon de recherche</p>
              </div>
            ) : (
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">
                  <span className="font-semibold text-gray-900">{offers.length}</span>{' '}
                  offre{offers.length > 1 ? 's' : ''} trouvée{offers.length > 1 ? 's' : ''} dans un
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
