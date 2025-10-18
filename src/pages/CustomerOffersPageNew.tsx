import React, { useState } from 'react';
import { Clock, MapPin, LogOut, Navigation } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthFlow } from '../hooks/useAuthFlow';
import { useNearbyOffers } from '../hooks/useNearbyOffers';
import { AddressRegistration } from '../components/AddressRegistration';
import { createReservation } from '../api/reservations';

const CustomerOffersPageNew = () => {
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuthFlow();
  const [radiusMeters, setRadiusMeters] = useState(3000);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [reserving, setReserving] = useState<string | null>(null);

  const { offers, loading, error, refetch } = useNearbyOffers({
    clientId: user?.id || null,
    radiusKm: radiusMeters / 1000,
    enabled: profile?.has_location || false
  });

  const handleRadiusChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (value >= 500 && value <= 10000) {
      setRadiusMeters(value);
    }
  };

  const handleReserve = async (offerId: string, merchantId: string) => {
    if (!user) {
      setToast({ message: 'Please log in to reserve', type: 'error' });
      return;
    }

    setReserving(offerId);

    try {
      const result = await createReservation(offerId, merchantId, 1);

      if (result.success) {
        setToast({ message: 'Reservation confirmed ✅', type: 'success' });
        await refetch();
      } else {
        setToast({ message: 'Reservation failed ❌', type: 'error' });
      }
    } catch (error) {
      setToast({ message: 'Reservation failed ❌', type: 'error' });
    } finally {
      setReserving(null);
      setTimeout(() => setToast(null), 3000);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const formatDistance = (meters: number) => {
    if (meters < 1000) {
      return `${Math.round(meters)}m`;
    }
    return `${(meters / 1000).toFixed(1)}km`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg ${
            toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
          } text-white`}
        >
          {toast.message}
        </div>
      )}

      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center mr-3">
                <span className="text-white font-bold text-lg">S</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">SEPET</h1>
                <p className="text-sm text-gray-600">Nearby Offers</p>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="flex items-center px-4 py-2 text-gray-700 hover:text-red-600 transition-colors"
            >
              <LogOut className="w-5 h-5 mr-2" />
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AddressRegistration />

        {profile?.has_location && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Navigation className="w-5 h-5 text-green-600 mr-2" />
                Search Radius
              </h3>
              <span className="text-sm text-gray-600">
                {(radiusMeters / 1000).toFixed(1)} km
              </span>
            </div>
            <input
              type="range"
              min="500"
              max="10000"
              step="100"
              value={radiusMeters}
              onChange={handleRadiusChange}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-2">
              <span>500m</span>
              <span>10km</span>
            </div>
          </div>
        )}

        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {!loading && !error && offers.length === 0 && profile?.has_location && (
          <div className="text-center py-12">
            <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No offers nearby</h3>
            <p className="text-gray-600">Try increasing your search radius</p>
          </div>
        )}

        {!loading && offers.length > 0 && (
          <>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {offers.length} Offer{offers.length !== 1 ? 's' : ''} Found
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {offers.map((offer) => (
                <div
                  key={offer.id}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="relative h-48 bg-gray-200">
                    {offer.image_url && (
                      <img
                        src={offer.image_url}
                        alt={offer.title}
                        className="w-full h-full object-cover"
                      />
                    )}
                    <div className="absolute top-3 right-3 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                      -{offer.discount_percent}%
                    </div>
                  </div>

                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">{offer.title}</h3>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {offer.description}
                    </p>

                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <div className="flex items-baseline space-x-2">
                          <span className="text-xs text-gray-500 line-through">
                            €{offer.price_before.toFixed(2)}
                          </span>
                          <span className="text-lg font-bold text-green-600">
                            €{offer.price_after.toFixed(2)}
                          </span>
                        </div>
                      </div>
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">Stock: {offer.quantity}</span>
                      </div>
                    </div>

                    <div className="flex items-center text-sm text-gray-600 mb-4">
                      <MapPin className="w-4 h-4 mr-1" />
                      <span>{formatDistance(offer.distance_m)} away</span>
                    </div>

                    <button
                      onClick={() => handleReserve(offer.id, offer.merchant_id)}
                      disabled={reserving === offer.id || offer.quantity === 0}
                      className="w-full bg-green-500 text-white py-3 rounded-lg font-medium hover:bg-green-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                      {reserving === offer.id ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                          Reserving...
                        </>
                      ) : offer.quantity === 0 ? (
                        'Out of Stock'
                      ) : (
                        'Reserve'
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default CustomerOffersPageNew;
