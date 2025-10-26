import React, { useState, useEffect } from 'react';
import { MapPin, Clock, Star, Navigation, Smartphone } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { getNearbyOffers, getGenericOffers, getClientProfile, setClientLocation } from '../api';

interface Offer {
  id: string;
  title: string;
  description: string;
  image_url: string;
  price_before: number;
  price_after: number;
  available_until: string;
  distance_m?: number;
  merchant?: {
    company_name: string;
    street?: string;
    city?: string;
  };
}

const CustomerAppPage = () => {
  const { user } = useAuthStore();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showLocationPrompt, setShowLocationPrompt] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);

  useEffect(() => {
    loadOffers();
  }, [user]);

  const loadOffers = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Check if user has location
      const profile = await getClientProfile(user.id);
      
      if (profile?.location) {
        // User has location, get nearby offers
        // For demo, we'll use a default location
        const nearbyOffers = await getNearbyOffers(48.8566, 2.3522, 5); // Paris coordinates
        setOffers(nearbyOffers || []);
      } else {
        // No location, show generic offers and prompt for location
        const genericOffers = await getGenericOffers();
        setOffers(genericOffers || []);
        setShowLocationPrompt(true);
      }
    } catch (error) {
      console.error('Error loading offers:', error);
      // Fallback to generic offers
      try {
        const genericOffers = await getGenericOffers();
        setOffers(genericOffers || []);
      } catch (fallbackError) {
        console.error('Error loading generic offers:', fallbackError);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLocationRequest = async () => {
    setLocationLoading(true);

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });

      const { latitude, longitude } = position.coords;
      await setClientLocation(latitude, longitude);
      setShowLocationPrompt(false);
      
      // Reload offers with new location
      const nearbyOffers = await getNearbyOffers(latitude, longitude, 5);
      setOffers(nearbyOffers || []);
    } catch (error) {
      console.error('Error getting location:', error);
      alert('Failed to get location. Please enable location services.');
    } finally {
      setLocationLoading(false);
    }
  };

  const calculateDiscount = (priceBefore: number, priceAfter: number) => {
    return Math.round(((priceBefore - priceAfter) / priceBefore) * 100);
  };

  const formatTimeLeft = (availableUntil: string) => {
    const now = new Date();
    const end = new Date(availableUntil);
    const diff = end.getTime() - now.getTime();
    
    if (diff <= 0) return 'Expired';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m left`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Location Prompt */}
      {showLocationPrompt && (
        <div className="bg-blue-50 border-b border-blue-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <MapPin className="w-5 h-5 text-blue-600 mr-2" />
                <span className="text-blue-800 font-medium">Share your location to see nearby offers</span>
              </div>
              <button
                onClick={handleLocationRequest}
                disabled={locationLoading}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 inline-flex items-center"
              >
                <Navigation className="w-4 h-4 mr-2" />
                {locationLoading ? 'Getting Location...' : 'Share Location'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Offers Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {offers.length === 0 ? (
          <div className="text-center py-12">
            <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No offers available</h3>
            <p className="text-gray-600">Check back later or share your location to see nearby deals.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {offers.map((offer) => (
              <div
                key={offer.id}
                onClick={() => setSelectedOffer(offer)}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group"
              >
                <div className="relative">
                  <img
                    src={offer.image_url || 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400'}
                    alt={offer.title}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                    -{offer.discount_percent}%
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="text-sm font-medium text-gray-700">4.8</span>
                    </div>
                    <div className="flex items-center text-sm text-red-600 font-medium">
                      <Clock className="w-4 h-4 mr-1" />
                      {formatTimeLeft(offer.available_until)}
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 mb-2">{offer.title}</h3>
                  <p className="text-gray-600 mb-4 text-sm line-clamp-2">{offer.description}</p>

                  {offer.distance_m && (
                    <div className="flex items-center text-sm text-gray-500 mb-4">
                      <MapPin className="w-4 h-4 mr-1" />
                      <span>{Math.round(offer.distance_m / 1000 * 10) / 10} km away</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl font-bold text-green-600">
                        €{offer.price_after}
                      </span>
                      <span className="text-lg text-gray-400 line-through">
                        €{offer.price_before}
                      </span>
                    </div>
                    <button className="bg-green-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-600 transition-colors shadow-md">
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Offer Details Modal */}
      {selectedOffer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="relative">
              <img
                src={selectedOffer.image_url || 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400'}
                alt={selectedOffer.title}
                className="w-full h-48 object-cover"
              />
              <button
                onClick={() => setSelectedOffer(null)}
                className="absolute top-4 right-4 bg-white bg-opacity-90 p-2 rounded-full hover:bg-opacity-100 transition-all"
              >
                ×
              </button>
            </div>

            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{selectedOffer.title}</h2>
              <p className="text-gray-600 mb-6">{selectedOffer.description}</p>

              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-2">
                  <span className="text-3xl font-bold text-green-600">
                    €{selectedOffer.price_after}
                  </span>
                  <span className="text-xl text-gray-400 line-through">
                    €{selectedOffer.price_before}
                  </span>
                </div>
                <div className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                  -{selectedOffer.discount_percent}%
                </div>
              </div>

              <button className="w-full bg-green-500 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-600 transition-colors mb-4">
                Reserve in App
              </button>

              {/* App Download Banner */}
              <div className="bg-gray-900 rounded-lg p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <Smartphone className="w-5 h-5 text-white mr-2" />
                  <span className="text-white font-medium">Download our app to receive real-time notifications</span>
                </div>
                <div className="flex justify-center space-x-2">
                  <img 
                    src="https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg" 
                    alt="Download on the App Store" 
                    className="h-10"
                  />
                  <img 
                    src="https://play.google.com/intl/en_us/badges/static/images/badges/en_badge_web_generic.png" 
                    alt="Get it on Google Play" 
                    className="h-10"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerAppPage;