import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Phone, MapPin, Navigation } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { upsertClientProfile, setClientLocation } from '../api';
import { useAuth } from '../hooks/useAuth';

const CustomerOnboardingPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [localUser, setLocalUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [locationLoading, setLocationLoading] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    city: '',
    country: 'FR',
    postal_code: '',
  });

  useEffect(() => {
    const initUser = async () => {
      if (!user) {
        navigate('/auth/customer');
        return;
      }
      setLocalUser(user);

      if (user.user_metadata) {
        setFormData(prev => ({
          ...prev,
          first_name: user.user_metadata.first_name || '',
          last_name: user.user_metadata.last_name || '',
        }));
      }
    };
    initUser();
  }, [user, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLocationRequest = async () => {
    setLocationLoading(true);
    setError('');

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });

      const { latitude, longitude } = position.coords;
      await setClientLocation(latitude, longitude);
      
      // Show success message
      alert('Location saved successfully!');
    } catch (err: any) {
      setError('Failed to get location. Please enable location services.');
    } finally {
      setLocationLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsLoading(true);
    setError('');

    try {
      await upsertClientProfile({
        id: user.id,
        email: user.email,
        first_name: formData.first_name,
        last_name: formData.last_name,
        phone: formData.phone,
        city: formData.city,
        postal_code: formData.postal_code,
        country: formData.country,
      });

      navigate('/app');
    } catch (err: any) {
      setError(err.message || 'Failed to save profile');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-6">
            <div className="w-12 h-12 bg-tilkapp-green rounded-lg flex items-center justify-center mr-3">
              <span className="text-white font-bold text-xl">R</span>
            </div>
            <span className="font-bold text-2xl text-gray-900">TILKAPP</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome! Let's set up your profile</h1>
          <p className="text-gray-600">
            Help us personalize your experience and find the best offers near you
          </p>
        </div>

        <div className="bg-white shadow-lg rounded-lg p-8">
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  name="first_name"
                  placeholder="First Name"
                  value={formData.first_name}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tilkapp-green focus:border-transparent"
                  required
                />
              </div>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  name="last_name"
                  placeholder="Last Name"
                  value={formData.last_name}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tilkapp-green focus:border-transparent"
                  required
                />
              </div>
            </div>

            {/* Contact Information */}
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="tel"
                name="phone"
                placeholder="Phone Number"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tilkapp-green focus:border-transparent"
              />
            </div>

            {/* Location Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <MapPin className="w-5 h-5 mr-2 text-tilkapp-green" />
                Location Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  name="city"
                  placeholder="City"
                  value={formData.city}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tilkapp-green focus:border-transparent"
                />
                <input
                  type="text"
                  name="postal_code"
                  placeholder="Postal Code"
                  value={formData.postal_code}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tilkapp-green focus:border-transparent"
                />
              </div>

              <select
                name="country"
                value={formData.country}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tilkapp-green focus:border-transparent"
              >
                <option value="FR">France</option>
                <option value="US">United States</option>
                <option value="CA">Canada</option>
                <option value="GB">United Kingdom</option>
                <option value="DE">Germany</option>
                <option value="ES">Spain</option>
                <option value="IT">Italy</option>
              </select>

              {/* Location Button */}
              <button
                type="button"
                onClick={handleLocationRequest}
                disabled={locationLoading}
                className="w-full bg-green-100 text-white px-4 py-3 rounded-lg font-medium hover:bg-tilkapp-orange transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center"
              >
                <Navigation className="w-5 h-5 mr-2" />
                {locationLoading ? 'Getting Location...' : 'Use My Current Location'}
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-tilkapp-green text-white py-3 px-4 rounded-lg font-semibold hover:bg-tilkapp-orange transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Saving...' : 'Complete Setup'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CustomerOnboardingPage;