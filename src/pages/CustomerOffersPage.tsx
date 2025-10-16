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
import { OffersMap } from '../components/OffersMap';
import { GeolocationButton } from '../components/GeolocationButton';

const CustomerOffersPage = () => {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [clientId, setClientId] = useState<string | null>(null);
  const [radiusKm, setRadiusKm] = useState(10);
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

  useEffect(() => {
    const savedRadius = localStorage.getItem('searchRadius');
    if (savedRadius) {
      const radiusMeters = parseInt(savedRadius, 10);
      if (!isNaN(radiusMeters)) {
        setRadiusKm(Math.round(radiusMeters / 1000));
      }
    } else {
      const radiusMeters = radiusKm * 1000;
      localStorage.setItem('searchRadius', radiusMeters.toString());
    }

    const radiusParam = searchParams.get('radius');
    if (radiusParam) {
      const radius = parseInt(radiusParam, 10);
      if (!isNaN(radius) && radius >= 1 && radius <= 50) {
        setRadiusKm(radius);
      }
    }

    // Listen for storage changes from other tabs/windows
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'searchRadius' && e.newValue) {
        const radiusMeters = parseInt(e.newValue, 10);
        if (!isNaN(radiusMeters)) {
          setRadiusKm(Math.round(radiusMeters / 1000));
          refetch();
        }
      }
    };

    // Listen for custom radius change events (same tab)
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
    setRadiusKm(newRadius);
    const radiusMeters = newRadius * 1000;
    localStorage.setItem('searchRadius', radiusMeters.toString());
    setSearchParams({ radius: newRadius.toString() });
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
    console.log('🔵 [SEPET] Reserve button clicked for offerId:', offerId);
    if (!user) {
      console.warn('⚠️ [SEPET] No user authenticated');
      setToast({ message: 'Please sign in to make a reservation', type: 'error' });
      setTimeout(() => navigate('/customer/auth'), 2000);
      return;
    }
    console.log('✓ [SEPET] User authenticated:', user.id);
    console.log('✓ [SEPET] Opening quantity modal');
    setSelectedOfferId(offerId);
  };

  const handleConfirmReservation = async (quantity: number) => {
    console.log('🟢 [SEPET] Confirming reservation with quantity:', quantity);
    const offer = displayOffers.find((o: any) => o.id === selectedOfferId);
    if (!offer) {
      console.error('❌ [SEPET] Offer not found for selectedOfferId:', selectedOfferId);
      return;
    }

    const merchantId = 'merchant_id' in offer ? (offer as NearbyOffer).merchant_id : '';

    console.log('📦 [SEPET] Offer details:', {
      id: offer.id,
      title: 'title' in offer ? offer.title : '',
      merchant_id: merchantId,
      quantity_available: 'quantity' in offer ? (offer as NearbyOffer).quantity : 'unknown',
      requested_quantity: quantity
    });

    setReserving(true);
    try {
      console.log('🚀 [SEPET] Calling createReservation API...');
      const result = await createReservation(offer.id, merchantId, quantity);
      console.log('📥 [SEPET] createReservation response:', result);

      if (result.success) {
        console.log('✅ [SEPET] Reservation SUCCESS!');
        setToast({ message: '✓ Reservation confirmed!', type: 'success' });
        setSelectedOfferId(null);
        refetch();
      } else {
        console.error('❌ [SEPET] Reservation FAILED:', result.error);
        setToast({ message: result.error || 'Failed to create reservation', type: 'error' });
      }
    } catch (error: any) {
      console.error('💥 [SEPET] Exception during reservation:', error);
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
    if (meters < 1000) {
      return `${Math.round(meters)}m`;
    }
    return `${(meters / 1000).toFixed(1)}km`;
  };

  const calculateDiscount = (priceBefore: number, priceAfter: number): number => {
    return Math.round(100 * (1 - priceAfter / priceBefore));
  };

  const unsortedOffers = hasLocation ? nearbyOffers : offers;
  const displayOffers = [...unsortedOffers].sort((a, b) => {
    const dateA = new Date(a.created_at || 0).getTime();
    const dateB = new Date(b.created_at || 0).getTime();
    return dateB - dateA;
  });
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

  const handleOfferClickOnMap = (offerId: string) => {
    setViewDetailsOfferId(offerId);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-gray-200 rounded-lg h-80 animate-pulse"></div>
            ))}
          </div>
        </div>
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
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Activer la géolocalisation
                </h3>
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
                {locationError && (
                  <p className="text-red-600 text-sm mt-2">{locationError}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {hasLocation && (
          <div className="mb-8 bg-white rounded-lg p-6 shadow-md">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <MapPin className="w-5 h-5 text-green-600 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Offres à proximité
                </h3>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-500">
                  {nearbyOffers.length} offre{nearbyOffers.length !== 1 ? 's' : ''} trouvée{nearbyOffers.length !== 1 ? 's' : ''}
                </span>
                {user && clientId && (
                  <GeolocationButton
                    userRole="client"
                    userId={user.id}
                    onSuccess={(coords) => {
                      window.location.reload();
                    }}
                  />
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rayon de recherche : {radiusKm} km
                </label>
                <input
                  type="range"
                  min="1"
                  max="30"
                  value={radiusKm}
                  onChange={(e) => handleRadiusChange(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-600"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>1 km</span>
                  <span>15 km</span>
                  <span>30 km</span>
                </div>
              </div>
            </div>

            {offersError && (
              <p className="text-red-600 text-sm mt-4">{offersError}</p>
            )}

            {nearbyOffers.length === 0 && !offersLoading && (
              <p className="text-gray-500 text-center py-4">
                Aucune offre trouvée dans un rayon de {radiusKm} km
              </p>
            )}
          </div>
        )}

        {/* Map View */}
        {hasLocation && (
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
                localStorage.setItem('searchRadius', radius.toString());
              }}
              onOfferClick={handleOfferClickOnMap}
              centerLat={mapCenter?.lat}
              centerLng={mapCenter?.lng}
              highlightOfferId={highlightOfferId || undefined}
            />
            )}
          </div>
        )}

        {/* Filter Bar */}
        {(
          <div className="mb-12">
            <div className="flex items-center mb-6">
              <Filter className="w-5 h-5 text-gray-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Filter by category</h3>
            </div>
            <div className="flex flex-wrap gap-3">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-6 py-3 rounded-full font-medium transition-all ${
                    selectedCategory === category
                      ? 'bg-green-500 text-white shadow-lg'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:border-green-300'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Offers Grid */}
        {displayOffers.length === 0 && !isLoading ? (
          <div className="text-center py-16">
            <p className="text-xl text-gray-600 mb-4">
              No offers available at the moment
            </p>
            <p className="text-gray-500">
              Check back soon for new deals from local merchants!
            </p>
          </div>
        ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {displayOffers.map((offer) => {
            const isNearbyOffer = 'distance_m' in offer;
            const discountPercent = isNearbyOffer
              ? (offer as NearbyOffer).discount_percent
              : (offer as Offer).discount_percentage;

            return (
            <div
              key={offer.id}
              onClick={() => setViewDetailsOfferId(offer.id)}
              className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 group cursor-pointer"
            >
              <div className="relative">
                <img
                  src={offer.image_url || 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg'}
                  alt={offer.title}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                  -{discountPercent}%
                </div>
                <button className="absolute top-4 right-4 bg-white bg-opacity-90 p-2 rounded-full hover:bg-opacity-100 transition-all shadow-lg">
                  <Heart className="w-5 h-5 text-gray-600 hover:text-red-500" />
                </button>
              </div>

              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="text-sm font-medium text-gray-700">4.8</span>
                  </div>
                  <div className="flex items-center text-sm text-red-600 font-medium">
                    <Clock className="w-4 h-4 mr-1" />
                    {formatTimeLeft(isNearbyOffer ? (offer as NearbyOffer).available_until : (offer as Offer).available_until)}
                  </div>
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-2">{offer.title}</h3>
                <p className="text-gray-600 mb-4 text-sm line-clamp-2">{offer.description}</p>

                <div className="flex items-center text-sm text-gray-500 mb-4">
                  <MapPin className="w-4 h-4 mr-1" />
                  <span className="font-medium">
                    {isNearbyOffer ? (offer as NearbyOffer).merchant_name : (offer as Offer).merchant?.company_name || 'Local Restaurant'}
                  </span>
                  {isNearbyOffer && (
                    <span className="ml-2 text-xs text-green-600 font-semibold">
                      • {formatDistance((offer as NearbyOffer).distance_m)}
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl font-bold text-green-600">
                      {isNearbyOffer
                        ? `€${(offer as NearbyOffer).price_after.toFixed(2)}`
                        : `$${(offer as Offer).discounted_price}`
                      }
                    </span>
                    <span className="text-lg text-gray-400 line-through">
                      {isNearbyOffer
                        ? `€${(offer as NearbyOffer).price_before.toFixed(2)}`
                        : `$${(offer as Offer).original_price}`
                      }
                    </span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setViewDetailsOfferId(offer.id);
                    }}
                    className="bg-green-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-600 transition-colors shadow-md"
                  >
                    Voir détails
                  </button>
                </div>
              </div>
            </div>
            );
          })}
        </div>
        )}

        {/* App Download CTA */}
        {(
        <div className="bg-white rounded-2xl p-12 shadow-lg text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Get instant notifications with our mobile app
          </h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto text-lg">
            Never miss a deal! Download our app to receive push notifications when new offers 
            become available near you.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <a
              href="#"
              className="transition-transform hover:scale-105"
            >
              <img 
                src="https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg" 
                alt="Download on the App Store" 
                className="h-14"
              />
            </a>
            <a
              href="#"
              className="transition-transform hover:scale-105"
            >
              <img 
                src="https://play.google.com/intl/en_us/badges/static/images/badges/en_badge_web_generic.png" 
                alt="Get it on Google Play" 
                className="h-14"
              />
            </a>
          </div>

          <div className="flex items-center justify-center text-green-600">
            <Smartphone className="w-5 h-5 mr-2" />
            <span className="font-medium">Available on iOS and Android</span>
          </div>
        </div>
        )}

        {/* Quantity Modal */}
        {selectedOfferId && (() => {
          const offer = displayOffers.find((o: any) => o.id === selectedOfferId);
          const isNearbyOffer = offer && 'merchant_id' in offer;

          return offer ? (
            <QuantityModal
              isOpen={true}
              onClose={() => setSelectedOfferId(null)}
              onConfirm={handleConfirmReservation}
              offerTitle={isNearbyOffer ? (offer as NearbyOffer).title : (offer as Offer).title}
              availableQuantity={isNearbyOffer ? (offer as NearbyOffer).quantity : 10}
              price={isNearbyOffer ? (offer as NearbyOffer).price_after : parseFloat((offer as Offer).discounted_price)}
              loading={reserving}
            />
          ) : null;
        })()}

        {/* Offer Details Modal */}
        {viewDetailsOfferId && (() => {
          const offer = displayOffers.find((o: any) => o.id === viewDetailsOfferId);
          const isNearbyOffer = offer && 'merchant_id' in offer;

          if (!offer) return null;

          const offerData = {
            id: offer.id,
            title: offer.title,
            description: offer.description,
            image_url: offer.image_url,
            price_before: isNearbyOffer ? (offer as NearbyOffer).price_before : parseFloat((offer as Offer).original_price),
            price_after: isNearbyOffer ? (offer as NearbyOffer).price_after : parseFloat((offer as Offer).discounted_price),
            quantity: isNearbyOffer ? (offer as NearbyOffer).quantity : 10,
            available_until: isNearbyOffer ? (offer as NearbyOffer).available_until : (offer as Offer).available_until,
            distance_km: isNearbyOffer ? (offer as NearbyOffer).distance_m / 1000 : undefined,
            merchant_street: isNearbyOffer ? (offer as NearbyOffer).merchant_street : undefined,
            merchant_city: isNearbyOffer ? (offer as NearbyOffer).merchant_city : undefined,
            merchant_postal_code: isNearbyOffer ? (offer as NearbyOffer).merchant_postal_code : undefined,
            merchant_lat: isNearbyOffer ? (offer as NearbyOffer).offer_lat : undefined,
            merchant_lng: isNearbyOffer ? (offer as NearbyOffer).offer_lng : undefined,
          };

          return (
            <OfferDetailsModal
              isOpen={true}
              onClose={() => setViewDetailsOfferId(null)}
              onReserve={() => {
                const merchantId = isNearbyOffer ? (offer as NearbyOffer).merchant_id : '';
                setViewDetailsOfferId(null);
                handleReserve(offer.id, merchantId);
              }}
              offer={offerData}
              onViewMap={isNearbyOffer && offerData.merchant_lat && offerData.merchant_lng ? () => {
                setViewDetailsOfferId(null);
                setMapCenter({ lat: offerData.merchant_lat!, lng: offerData.merchant_lng! });
                setHighlightOfferId(offer.id);
                setTimeout(() => {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }, 100);
              } : undefined}
            />
          );
        })()}

        {/* Toast Notification */}
        {toast && (
          <div className="fixed top-20 right-4 z-50 animate-slide-down">
            <div className={`${
              toast.type === 'success' ? 'bg-green-50 border-green-500' : 'bg-red-50 border-red-500'
            } border-l-4 rounded-lg shadow-lg p-4 max-w-sm`}>
              <p className={`font-semibold ${
                toast.type === 'success' ? 'text-green-900' : 'text-red-900'
              }`}>
                {toast.message}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerOffersPage;