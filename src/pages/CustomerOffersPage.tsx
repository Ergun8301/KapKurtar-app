import React, { useState, useEffect } from 'react';
import { Clock, MapPin, Star, Heart, ArrowRight, Filter, Smartphone, User, LogOut, Navigation, Map } from 'lucide-react';
import { getActiveOffers, type Offer } from '../api';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabaseClient';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useClientLocation } from '../hooks/useClientLocation';
import { useNearbyOffers, type NearbyOffer } from '../hooks/useNearbyOffers';
import { createReservation } from '../api/reservations';
import { QuantityModal } from '../components/QuantityModal';
import { OfferDetailsModal } from '../components/OfferDetailsModal';
import { GeolocationButton } from '../components/GeolocationButton';
import { OffersMap } from '../components/OffersMap'; // ✅ Remplacé proprement par une version sans fallback interne

const CustomerOffersPage = () => {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [clientId, setClientId] = useState<string | null>(null);
  const [radiusKm, setRadiusKm] = useState(10);
  const MAX_RADIUS_KM = 10;
  const [showGeolocationPrompt, setShowGeolocationPrompt] = useState(false);
  const [selectedOfferId, setSelectedOfferId] = useState<string | null>(null);
  const [viewDetailsOfferId, setViewDetailsOfferId] = useState<string | null>(null);
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number } | null>(null);
  const [highlightOfferId, setHighlightOfferId] = useState<string | null>(null);
  const [reserving, setReserving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [showMap, setShowMap] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const { location, loading: locationLoading, error: locationError, requestGeolocation, hasLocation } = useClientLocation(clientId);
  const { offers: nearbyOffers, loading: offersLoading, error: offersError, refetch } = useNearbyOffers({
    clientId,
    radiusKm,
    enabled: hasLocation
  });

  const categories = ['All', 'Bakery', 'Fruits', 'Ready Meals', 'Drinks'];

  // 🛰️ GPS: mettre à jour mapCenter dès que la géolocalisation est prête
  useEffect(() => {
    if (location && location.latitude && location.longitude) {
      setMapCenter({ lat: location.latitude, lng: location.longitude });
    }
  }, [location]);

  useEffect(() => {
    const savedRadius = localStorage.getItem('radius_meters');
    if (savedRadius) {
      const radiusMeters = parseInt(savedRadius, 10);
      if (!isNaN(radiusMeters)) {
        setRadiusKm(Math.min(Math.round(radiusMeters / 1000), MAX_RADIUS_KM));
      }
    } else {
      const radiusMeters = radiusKm * 1000;
      localStorage.setItem('radius_meters', radiusMeters.toString());
    }

    const radiusParam = searchParams.get('radius');
    if (radiusParam) {
      const radius = parseInt(radiusParam, 10);
      if (!isNaN(radius) && radius >= 1 && radius <= MAX_RADIUS_KM) {
        setRadiusKm(Math.min(radius, MAX_RADIUS_KM));
      }
    }

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'radius_meters' && e.newValue) {
        const radiusMeters = parseInt(e.newValue, 10);
        if (!isNaN(radiusMeters)) {
          setRadiusKm(Math.min(Math.round(radiusMeters / 1000), MAX_RADIUS_KM));
          refetch();
        }
      }
    };

    const handleRadiusChanged = (e: CustomEvent) => {
      const radiusMeters = e.detail?.radiusMeters;
      if (radiusMeters) {
        setRadiusKm(Math.round(radiusMeters / 1000));
        refetch();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('radiusChanged', handleRadiusChanged as EventListener);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('radiusChanged', handleRadiusChanged as EventListener);
    };
  }, [searchParams, refetch]);

  useEffect(() => {
    const fetchClientId = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('clients')
          .select('id, location')
          .eq('id', user.id)
          .maybeSingle();

        if (error) {
          console.error('Error fetching client:', error);
          return;
        }

        if (data) {
          setClientId(data.id);
          if (!data.location) {
            setShowGeolocationPrompt(true);
          }
        }
      } catch (err) {
        console.error('Error:', err);
      }
    };

    fetchClientId();
  }, [user]);

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        const data = await getActiveOffers();
        setOffers(data.slice(0, 12));
      } catch (error) {
        console.error('Error fetching offers:', error);
      } finally {
        setLoading(false);
      }
    };

    if (!hasLocation) {
      fetchOffers();
    } else {
      setLoading(false);
    }
  }, [hasLocation]);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const formatTimeLeft = (dateString: string) => {
    const now = new Date();
    const end = new Date(dateString);
    const diff = end.getTime() - now.getTime();

    if (diff <= 0) return 'Expired';

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    return `${hours}h ${minutes}m left`;
  };

  const getUserDisplayName = () => {
    return user?.email?.split('@')[0] || 'Customer';
  };

  const handleRadiusChange = (newRadius: number) => {
    const clampedRadius = Math.min(newRadius, MAX_RADIUS_KM);
    setRadiusKm(clampedRadius);
    const radiusMeters = clampedRadius * 1000;
    localStorage.setItem('radius_meters', radiusMeters.toString());
    setSearchParams({ radius: clampedRadius.toString() });
  };

  const handleRequestLocation = async () => {
    try {
      await requestGeolocation();
      setShowGeolocationPrompt(false);
      refetch();
    } catch (err) {
      console.error('Failed to get location:', err);
    }
  };

  const handleReserve = (offerId: string, merchantId: string) => {
    if (!user) {
      setToast({ message: 'Please sign in to make a reservation', type: 'error' });
      setTimeout(() => navigate('/customer/auth'), 2000);
      return;
    }
    setSelectedOfferId(offerId);
  };

  const handleConfirmReservation = async (quantity: number) => {
    const offer = displayOffers.find((o: any) => o.id === selectedOfferId);
    if (!offer) return;
    const merchantId = 'merchant_id' in offer ? (offer as NearbyOffer).merchant_id : '';
    setReserving(true);
    try {
      const result = await createReservation(offer.id, merchantId, quantity);
      if (result.success) {
        setToast({ message: 'Réservation effectuée ✅', type: 'success' });
        setSelectedOfferId(null);
        refetch();
      } else {
        setToast({ message: result.error || 'Impossible de réserver ❌', type: 'error' });
      }
    } catch (error: any) {
      setToast({ message: error.message || 'An error occurred', type: 'error' });
    } finally {
      setReserving(false);
    }
  };

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const formatDistance = (meters: number): string => {
    return meters < 1000 ? `${Math.round(meters)}m` : `${(meters / 1000).toFixed(1)}km`;
  };

  const unsortedOffers = hasLocation ? nearbyOffers : offers;
  const displayOffers = [...unsortedOffers].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const isLoading = loading || offersLoading || locationLoading;

  const mapOffers = nearbyOffers
    .filter(offer => offer.offer_lat && offer.offer_lng)
    .map(offer => ({
      id: offer.id,
      title: offer.title,
      lat: offer.offer_lat!,
      lng: offer.offer_lng!,
      price: offer.price_after,
      price_before: offer.price_before,
      distance_km: (offer.distance_m / 1000).toFixed(1),
      image_url: offer.image_url || 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg',
      discount: offer.discount_percent,
      merchant_name: offer.merchant_name
    }));

  const userLocationCoords = location ? { lat: location.latitude, lng: location.longitude } : null;

  const handleOfferClickOnMap = (offerId: string) => setViewDetailsOfferId(offerId);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p>Chargement des offres...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {showGeolocationPrompt && !hasLocation && (
          <div className="mb-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-start">
              <Navigation className="w-6 h-6 text-blue-600 mr-4 mt-1" />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Activer la géolocalisation</h3>
                <p className="text-gray-600 mb-4">
                  Autorisez l'accès à votre position pour voir les offres à proximité et obtenir les meilleures recommandations.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={handleRequestLocation}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                  >
                    Activer la géolocalisation
                  </button>
                  <button
                    onClick={() => setShowGeolocationPrompt(false)}
                    className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                  >
                    Plus tard
                  </button>
                </div>
                {locationError && <p className="text-red-600 text-sm mt-2">{locationError}</p>}
              </div>
            </div>
          </div>
        )}

        {hasLocation && (
          <div className="mb-8 bg-white rounded-lg p-6 shadow-md">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <MapPin className="w-5 h-5 text-green-600 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900">Offres à proximité</h3>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-500">
                  {nearbyOffers.length} offre{nearbyOffers.length !== 1 ? 's' : ''} trouvée{nearbyOffers.length !== 1 ? 's' : ''}
                </span>
                {user && clientId && (
                  <GeolocationButton
                    userRole="client"
                    userId={user.id}
                    onSuccess={() => window.location.reload()}
                  />
                )}
              </div>
            </div>

            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rayon de recherche : {radiusKm} km
              </label>
              <input
                type="range"
                min="1"
                max="10"
                value={radiusKm}
                onChange={(e) => handleRadiusChange(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-600"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>1 km</span>
                <span>5 km</span>
                <span>10 km</span>
              </div>
            </div>
          </div>
        )}

        {hasLocation && mapCenter && (
          <div className="mb-8">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-2xl font-bold text-gray-900">Carte des offres</h3>
              <button
                onClick={() => setShowMap(!showMap)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-md"
              >
                <Map className="w-5 h-5" />
                <span>{showMap ? 'Masquer la carte' : '🗺 Afficher la carte'}</span>
              </button>
            </div>
            {showMap && (
              <OffersMap
                userLocation={userLocationCoords}
                offers={mapOffers}
                radiusKm={radiusKm}
                onRadiusChange={(radius) => {
                  setRadiusKm(radius);
                  localStorage.setItem('radius_meters', (radius * 1000).toString());
                }}
                onOfferClick={handleOfferClickOnMap}
                centerLat={mapCenter.lat}
                centerLng={mapCenter.lng}
                highlightOfferId={highlightOfferId || undefined}
              />
            )}
          </div>
        )}

        {/* ... reste du code inchangé (offres, modaux, notifications, etc.) */}
      </div>
    </div>
  );
};

export default CustomerOffersPage;
