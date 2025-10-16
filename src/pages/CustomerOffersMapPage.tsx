import React, { useState, useEffect, useRef } from 'react';
import { Clock, MapPinOff, Settings, LogOut, User, ShoppingCart, MapPin } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useClientLocation } from '../hooks/useClientLocation';
import { useNearbyOffers } from '../hooks/useNearbyOffers';
import { getActiveOffers } from '../api/offers';
import { createReservation } from '../api/reservations';
import { OffersMap } from '../components/OffersMap';
import { QuantityModal } from '../components/QuantityModal';
import { smartSortOffers, formatTimeLeft, getUrgencyColor } from '../utils/offersSorting';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

const CustomerOffersMapPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [radiusKm, setRadiusKm] = useState(20);
  const [selectedOfferId, setSelectedOfferId] = useState<string | null>(null);
  const [reserving, setReserving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [showAllOffers, setShowAllOffers] = useState(false);
  const [publicOffers, setPublicOffers] = useState<any[]>([]);
  const [loadingPublic, setLoadingPublic] = useState(false);
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number } | null>(null);
  const [manualAddress, setManualAddress] = useState('');
  const [showDebugData, setShowDebugData] = useState(false);
  const offerRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  const centerLat = searchParams.get('lat') ? parseFloat(searchParams.get('lat')!) : undefined;
  const centerLng = searchParams.get('lng') ? parseFloat(searchParams.get('lng')!) : undefined;
  const highlightOfferId = searchParams.get('offerId') || undefined;

  const { location, loading: locationLoading } = useClientLocation(user?.id || null);

  const {
    offers: nearbyOffers,
    loading: offersLoading,
    refetch
  } = useNearbyOffers({
    clientId: user?.id || null,
    radiusKm: showAllOffers ? 1000 : radiusKm,
    enabled: !!user && !!location
  });

  console.log('[PAGE] nearbyOffers from hook:', nearbyOffers);
  console.log('[PAGE] nearbyOffers count:', nearbyOffers.length);

  useEffect(() => {
    if (!user) {
      const fetchPublicOffers = async () => {
        setLoadingPublic(true);
        try {
          const offers = await getActiveOffers();
          setPublicOffers(offers);
        } catch (error) {
          console.error('Error fetching public offers:', error);
        } finally {
          setLoadingPublic(false);
        }
      };
      fetchPublicOffers();
    }
  }, [user]);

  // Smart sort offers
  const sortedOffers = user ? smartSortOffers(nearbyOffers) : publicOffers;

  // Prepare offers for map
  const mapOffers = sortedOffers
    .filter(offer => {
      const hasCoords = offer.offer_lat && offer.offer_lng;
      if (!hasCoords) {
        console.warn('[PAGE] Offer missing coordinates:', offer);
      }
      return hasCoords;
    })
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

  console.log('[PAGE] mapOffers prepared for OffersMap:', mapOffers);
  console.log('[PAGE] mapOffers count:', mapOffers.length);

  useEffect(() => {
    const savedRadius = localStorage.getItem('searchRadius');
    if (savedRadius) {
      const radius = parseInt(savedRadius, 10);
      if (!isNaN(radius) && radius >= 1 && radius <= 50) {
        setRadiusKm(radius);
      }
    }
  }, []);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const handleReserve = (offerId: string) => {
    console.log('🔵 [SEPET] handleReserve called for offerId:', offerId);
    if (!user) {
      console.warn('⚠️ [SEPET] No user authenticated');
      setToast({ message: 'Please sign in to make a reservation', type: 'error' });
      return;
    }
    console.log('✓ [SEPET] User authenticated:', user.id);
    console.log('✓ [SEPET] Opening quantity modal for offerId:', offerId);
    setSelectedOfferId(offerId);
  };

  const handleConfirmReservation = async (quantity: number) => {
    console.log('🟢 [SEPET] handleConfirmReservation called with quantity:', quantity);
    const offer = sortedOffers.find(o => o.id === selectedOfferId);
    if (!offer) {
      console.error('❌ [SEPET] Offer not found for selectedOfferId:', selectedOfferId);
      return;
    }

    console.log('📦 [SEPET] Offer found:', {
      id: offer.id,
      title: offer.title,
      merchant_id: offer.merchant_id,
      quantity_available: offer.quantity,
      requested_quantity: quantity
    });

    setReserving(true);
    try {
      console.log('🚀 [SEPET] Calling createReservation API...');
      const result = await createReservation(offer.id, offer.merchant_id, quantity);
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

  const handleOfferClick = (offerId: string) => {
    const element = offerRefs.current[offerId];
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      element.classList.add('ring-4', 'ring-green-500');
      setTimeout(() => {
        element.classList.remove('ring-4', 'ring-green-500');
      }, 2000);
    }
  };

  const handleChangeLocation = () => {
    navigate('/profile');
  };

  const userLocationCoords = location
    ? (() => {
        const match = location.match(/POINT\(([^ ]+) ([^ ]+)\)/);
        const coords = match ? { lat: parseFloat(match[2]), lng: parseFloat(match[1]) } : null;
        console.log('[MAP] userLocationCoords (DB parsed):', coords);
        return coords;
      })()
    : null;

  console.log('[MAP] mapCenter (state):', mapCenter);
  console.log('[MAP] Priority: mapCenter > userLocationCoords > default');


  if (locationLoading || offersLoading || loadingPublic) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading offers near you...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Offers Near You
              </h1>
              <p className="text-sm text-gray-600">
                {sortedOffers.length} offer{sortedOffers.length !== 1 ? 's' : ''} within {showAllOffers ? 'all areas' : `${radiusKm} km`}
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => navigate('/profile')}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                title="Settings"
              >
                <Settings className="w-6 h-6" />
              </button>
              <button
                onClick={() => navigate('/profile')}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                title="Profile"
              >
                <User className="w-6 h-6" />
              </button>
              <button
                onClick={handleSignOut}
                className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Map - Show with user location or France default */}
        {
          <div className="mb-8">
            {!user && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-blue-600" />
                  <p className="text-blue-900 font-medium">Sign in to see personalized offers near you</p>
                </div>
              </div>
            )}

            {/* Manual Address Input */}
            {user && (
              <div className="bg-white rounded-lg shadow-md p-4 mb-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  📍 Choisissez votre localisation
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Utilisez la géolocalisation automatique ou saisissez une adresse manuellement
                </p>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Adresse manuelle
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: 8 rue Antoine, 01000 Bourg-en-Bresse"
                      value={manualAddress}
                      onChange={(e) => setManualAddress(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <button
                    onClick={() => {
                      if (!manualAddress.trim()) {
                        alert('Veuillez saisir une adresse.');
                        return;
                      }
                      alert(`Adresse saisie : ${manualAddress}\n\n(La mise à jour Supabase sera ajoutée plus tard)`);
                    }}
                    className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                    disabled={!manualAddress.trim()}
                  >
                    Valider l'adresse
                  </button>
                  <p className="text-xs text-gray-500">
                    💡 Cette fonction capture uniquement l'adresse (lecture seule, aucune modification en base)
                  </p>
                </div>
              </div>
            )}
            <OffersMap
              userLocation={mapCenter ?? userLocationCoords ?? { lat: 46.5, lng: 3 }}
              offers={mapOffers}
              radiusKm={radiusKm}
              onRadiusChange={(radius) => {
                console.log('[PAGE] Radius changed to:', radius);
                setRadiusKm(radius);
                setShowAllOffers(false);
                localStorage.setItem('searchRadius', radius.toString());
                setTimeout(() => {
                  console.log('[PAGE] Triggering refetch after radius change');
                  refetch();
                }, 100);
              }}
              onOfferClick={handleOfferClick}
              centerLat={mapCenter?.lat ?? centerLat}
              centerLng={mapCenter?.lng ?? centerLng}
              highlightOfferId={highlightOfferId}
              onGeolocationSuccess={(coords) => {
                console.log('[MAP] onGeolocationSuccess called with:', coords);
                setMapCenter(coords);
                console.log('[MAP] mapCenter state updated to:', coords);
                refetch();
              }}
            />

            {/* Debug Data Viewer */}
            {user && nearbyOffers.length > 0 && (
              <div className="mt-4">
                <button
                  onClick={() => setShowDebugData(!showDebugData)}
                  className="text-sm text-gray-600 hover:text-gray-900 underline"
                >
                  {showDebugData ? '▼ Masquer' : '▶ Afficher'} les données brutes (vérification)
                </button>
                {showDebugData && (
                  <div className="mt-2">
                    <div className="bg-gray-100 rounded-lg p-3 mb-2">
                      <p className="text-xs font-semibold text-gray-700 mb-1">
                        Données de la fonction get_offers_nearby_dynamic_v2 :
                      </p>
                      <p className="text-xs text-gray-600 mb-2">
                        {nearbyOffers.length} offre(s) trouvée(s) dans un rayon de {radiusKm} km
                      </p>
                    </div>
                    <pre className="bg-gray-900 text-green-400 text-xs p-4 rounded-lg overflow-x-auto max-h-96 overflow-y-auto">
                      {JSON.stringify(nearbyOffers, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </div>
        }

        {/* No offers message */}
        {!showAllOffers && sortedOffers.length === 0 && userLocationCoords && (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center mb-8">
            <MapPinOff className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No offers near you
            </h3>
            <p className="text-gray-600 mb-6">
              We couldn't find any offers within {radiusKm} km of your location.
            </p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => setShowAllOffers(true)}
                className="bg-green-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-600 transition-colors"
              >
                View All Offers
              </button>
              <button
                onClick={handleChangeLocation}
                className="bg-gray-200 text-gray-800 px-6 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors"
              >
                Change Location
              </button>
            </div>
          </div>
        )}

        {/* Offers Grid */}
        {sortedOffers.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedOffers.map((offer) => (
              <div
                key={offer.id}
                ref={(el) => { offerRefs.current[offer.id] = el; }}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300"
              >
                <div className="relative">
                  <img
                    src={offer.image_url || 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg'}
                    alt={offer.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-lg text-sm font-bold">
                    -{offer.discount_percent}%
                  </div>
                  <div className={`absolute top-4 right-4 flex items-center space-x-1 px-3 py-1 rounded-lg text-sm font-semibold ${getUrgencyColor(offer.expiresInHours)} bg-white`}>
                    <Clock className="w-4 h-4" />
                    <span>{formatTimeLeft(offer.available_until)}</span>
                  </div>
                </div>

                <div className="p-4">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{offer.title}</h3>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{offer.description}</p>

                  <div className="flex items-center text-sm text-gray-500 mb-3">
                    <span>{offer.merchant_name}</span>
                    <span className="mx-2">•</span>
                    <span>{(offer.distance_m / 1000).toFixed(1)} km away</span>
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl font-bold text-green-600">
                        ${offer.price_after.toFixed(2)}
                      </span>
                      <span className="text-lg text-gray-400 line-through">
                        ${offer.price_before.toFixed(2)}
                      </span>
                    </div>
                    <span className="text-sm text-gray-600">
                      {offer.quantity} left
                    </span>
                  </div>

                  <button
                    onClick={() => handleReserve(offer.id)}
                    disabled={offer.quantity <= 0}
                    className="w-full bg-green-500 text-white px-4 py-3 rounded-lg font-medium hover:bg-green-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {offer.quantity <= 0 ? 'Sold Out' : 'Reserve Now'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quantity Modal */}
      {selectedOfferId && (() => {
        const offer = sortedOffers.find(o => o.id === selectedOfferId);
        return offer ? (
          <QuantityModal
            isOpen={true}
            onClose={() => setSelectedOfferId(null)}
            onConfirm={handleConfirmReservation}
            offerTitle={offer.title}
            availableQuantity={offer.quantity}
            price={offer.price_after}
            loading={reserving}
          />
        ) : null;
      })()}

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-4 right-4 z-50 animate-slide-up">
          <div
            className={`px-6 py-4 rounded-lg shadow-xl ${
              toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
            } text-white font-medium flex items-center space-x-2`}
          >
            <span>{toast.message}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerOffersMapPage;
