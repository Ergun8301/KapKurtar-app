import React, { useState } from 'react';
import { MapPin, Navigation } from 'lucide-react';
import { useAuthFlow } from '../hooks/useAuthFlow';

interface NominatimResult {
  lat: string;
  lon: string;
  display_name: string;
}

export const AddressRegistration: React.FC = () => {
  const { profile, updateLocation, refetchProfile } = useAuthFlow();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [address, setAddress] = useState('');

  if (!profile || profile.has_location) {
    return null;
  }

  const handleGeocodeAddress = async () => {
    if (!address.trim()) {
      setError('Please enter an address');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));

      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`,
        {
          headers: {
            'User-Agent': 'SEPET-App/1.0'
          }
        }
      );

      if (!response.ok) throw new Error('Geocoding failed');

      const data: NominatimResult[] = await response.json();

      if (data.length === 0) {
        throw new Error('Address not found');
      }

      const { lat, lon } = data[0];

      const result = await updateLocation(parseFloat(lon), parseFloat(lat));

      if (!result.success) {
        throw new Error(result.error || 'Failed to save location');
      }

      setSuccess('Address registered successfully!');
      await refetchProfile();
      setTimeout(() => setIsOpen(false), 2000);
    } catch (err) {
      const error = err as Error;
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUseCurrentLocation = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          timeout: 10000,
          enableHighAccuracy: true
        });
      });

      const { latitude, longitude } = position.coords;

      const result = await updateLocation(longitude, latitude);

      if (!result.success) {
        throw new Error(result.error || 'Failed to save location');
      }

      setSuccess('Location registered successfully!');
      await refetchProfile();
      setTimeout(() => setIsOpen(false), 2000);
    } catch (err) {
      const error = err as Error;
      setError('Failed to get location. Please enable location services or enter address manually.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <MapPin className="w-5 h-5 text-yellow-600 mr-3" />
            <p className="text-sm text-yellow-800">
              <span className="font-semibold">Location not set.</span> Register your address to see nearby offers.
            </p>
          </div>
          <button
            onClick={() => setIsOpen(true)}
            className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors font-medium text-sm"
          >
            Register Address
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 mb-4 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <MapPin className="w-5 h-5 text-green-600 mr-2" />
          Register Your Address
        </h3>
        <button
          onClick={() => setIsOpen(false)}
          className="text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-600">{success}</p>
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Enter your address
          </label>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="123 Main St, City, Country"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            disabled={loading}
          />
        </div>

        <button
          onClick={handleGeocodeAddress}
          disabled={loading || !address.trim()}
          className="w-full bg-green-500 text-white py-3 rounded-lg font-medium hover:bg-green-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              Processing...
            </>
          ) : (
            <>
              <MapPin className="w-5 h-5 mr-2" />
              Save Address
            </>
          )}
        </button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Or</span>
          </div>
        </div>

        <button
          onClick={handleUseCurrentLocation}
          disabled={loading}
          className="w-full bg-blue-500 text-white py-3 rounded-lg font-medium hover:bg-blue-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
        >
          <Navigation className="w-5 h-5 mr-2" />
          Use Current Location
        </button>
      </div>
    </div>
  );
};
