import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navigation, MapPin, Check, Leaf } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { useAuthFlow } from '../hooks/useAuthFlow';

type Step = 1 | 2 | 3;

interface GeocodingResult {
  lat: string;
  lon: string;
  display_name: string;
}

const ClientOnboardingPage = () => {
  const navigate = useNavigate();
  const { user, updateLocation } = useAuthFlow();
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [city, setCity] = useState('');
  const [radiusKm, setRadiusKm] = useState(3);
  const [preferences, setPreferences] = useState({
    halal: false,
    vegan: false,
    eco: true
  });

  const handleGeolocation = async () => {
    setLoading(true);
    setError('');

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          timeout: 10000,
          enableHighAccuracy: true
        });
      });

      const { latitude, longitude } = position.coords;
      await updateLocation(longitude, latitude);

      // TODO: Implement reverse geocoding with GPS-only approach
      // For now, skip city name resolution
      setCity('');

      setCurrentStep(2);
    } catch (err) {
      setError('Impossible d\'accéder à votre position. Veuillez saisir votre ville.');
    } finally {
      setLoading(false);
    }
  };

  const handleCitySubmit = async () => {
    if (!city.trim()) {
      setError('Veuillez saisir votre ville');
      return;
    }

    setLoading(true);
    setError('');

    // TODO: Address geocoding disabled - implement GPS-only approach
    setError('Address geocoding is currently disabled. Please use "Use Current Location" button.');
    setLoading(false);

    /* COMMENTED OUT - OLD GEOCODING IMPLEMENTATION
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));

      const response = await fetch(
        `https://example.com/geocode?q=${encodeURIComponent(city)}&limit=1`,
        { headers: { 'User-Agent': 'SEPET-App/1.0' } }
      );

      const data: GeocodingResult[] = await response.json();

      if (data.length === 0) {
        throw new Error('Ville non trouvée');
      }

      const { lat, lon } = data[0];
      await updateLocation(parseFloat(lon), parseFloat(lat));

      setCurrentStep(2);
    } catch (err) {
      setError('Ville non trouvée');
    } finally {
      setLoading(false);
    }
    */
  };

  const handleRadiusSubmit = () => {
    setCurrentStep(3);
  };

  const handlePreferencesSubmit = async () => {
    if (!user) return;

    setLoading(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          search_radius_meters: radiusKm * 1000,
          preferences,
          city,
          onboarding_completed: true
        })
        .eq('auth_id', user.id);

      if (error) throw error;

      navigate('/offers/map');
    } catch (err) {
      setError('Erreur lors de l\'enregistrement');
    } finally {
      setLoading(false);
    }
  };

  const togglePreference = (key: keyof typeof preferences) => {
    setPreferences(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="min-h-screen bg-[#FAFAF5] flex flex-col">
      <div className="max-w-2xl mx-auto w-full px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-[#3A6932] rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-3xl">S</span>
            </div>
          </div>

          <div className="flex items-center justify-center space-x-2 mb-6">
            {[1, 2, 3].map((step) => (
              <div
                key={step}
                className={`h-2 rounded-full transition-all ${
                  step <= currentStep ? 'bg-[#3A6932] w-12' : 'bg-gray-300 w-8'
                }`}
              />
            ))}
          </div>

          <h1 className="text-3xl font-bold text-center text-gray-900 mb-2">
            {currentStep === 1 && 'Où êtes-vous ?'}
            {currentStep === 2 && 'Rayon de recherche'}
            {currentStep === 3 && 'Vos préférences'}
          </h1>
          <p className="text-center text-gray-600">
            {currentStep === 1 && 'Nous avons besoin de votre position pour trouver les offres près de chez vous'}
            {currentStep === 2 && 'Choisissez la distance maximale pour voir les offres'}
            {currentStep === 3 && 'Personnalisez votre expérience'}
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {currentStep === 1 && (
            <div className="space-y-6">
              <button
                onClick={handleGeolocation}
                disabled={loading}
                className="w-full bg-[#3A6932] text-white py-5 rounded-2xl font-bold text-lg hover:bg-[#2d5226] transition-all shadow-lg hover:shadow-xl disabled:bg-gray-400 flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                    Chargement...
                  </>
                ) : (
                  <>
                    <Navigation className="w-6 h-6 mr-3" />
                    Utiliser ma position actuelle
                  </>
                )}
              </button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500 font-medium">Ou</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Saisissez votre ville
                </label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Istanbul, Paris, Ankara..."
                    className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#3A6932] focus:border-transparent text-base"
                    onKeyDown={(e) => e.key === 'Enter' && handleCitySubmit()}
                  />
                </div>
              </div>

              <button
                onClick={handleCitySubmit}
                disabled={loading || !city.trim()}
                className="w-full bg-[#FF6B35] text-white py-5 rounded-2xl font-bold text-lg hover:bg-[#e55a28] transition-all shadow-lg hover:shadow-xl disabled:bg-gray-400"
              >
                Continuer
              </button>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-semibold text-gray-700">Distance</span>
                  <span className="text-2xl font-bold text-[#3A6932]">{radiusKm} km</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  step="1"
                  value={radiusKm}
                  onChange={(e) => setRadiusKm(parseInt(e.target.value))}
                  className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #3A6932 0%, #3A6932 ${((radiusKm - 1) / 9) * 100}%, #e5e7eb ${((radiusKm - 1) / 9) * 100}%, #e5e7eb 100%)`
                  }}
                />
                <div className="flex justify-between text-xs text-gray-500 mt-2">
                  <span>1 km</span>
                  <span>10 km</span>
                </div>
              </div>

              <div className="bg-[#FAFAF5] rounded-xl p-4">
                <p className="text-sm text-gray-600">
                  Vous verrez les offres situées dans un rayon de <span className="font-bold text-[#3A6932]">{radiusKm} km</span> autour de vous. Vous pourrez modifier ce paramètre plus tard.
                </p>
              </div>

              <button
                onClick={handleRadiusSubmit}
                className="w-full bg-[#3A6932] text-white py-5 rounded-2xl font-bold text-lg hover:bg-[#2d5226] transition-all shadow-lg hover:shadow-xl"
              >
                Continuer
              </button>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="space-y-4">
                <button
                  onClick={() => togglePreference('halal')}
                  className={`w-full p-5 rounded-2xl border-2 transition-all ${
                    preferences.halal
                      ? 'border-[#3A6932] bg-[#3A6932]/5'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center mr-4 ${
                        preferences.halal ? 'bg-[#3A6932]' : 'bg-gray-100'
                      }`}>
                        <span className={`text-2xl ${preferences.halal ? 'text-white' : 'text-gray-400'}`}>
                          🥩
                        </span>
                      </div>
                      <div className="text-left">
                        <div className="font-bold text-gray-900">Halal</div>
                        <div className="text-sm text-gray-600">Produits certifiés halal</div>
                      </div>
                    </div>
                    {preferences.halal && (
                      <Check className="w-6 h-6 text-[#3A6932]" />
                    )}
                  </div>
                </button>

                <button
                  onClick={() => togglePreference('vegan')}
                  className={`w-full p-5 rounded-2xl border-2 transition-all ${
                    preferences.vegan
                      ? 'border-[#3A6932] bg-[#3A6932]/5'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center mr-4 ${
                        preferences.vegan ? 'bg-[#3A6932]' : 'bg-gray-100'
                      }`}>
                        <span className={`text-2xl ${preferences.vegan ? 'text-white' : 'text-gray-400'}`}>
                          🌱
                        </span>
                      </div>
                      <div className="text-left">
                        <div className="font-bold text-gray-900">Vegan</div>
                        <div className="text-sm text-gray-600">Sans produits animaux</div>
                      </div>
                    </div>
                    {preferences.vegan && (
                      <Check className="w-6 h-6 text-[#3A6932]" />
                    )}
                  </div>
                </button>

                <button
                  onClick={() => togglePreference('eco')}
                  className={`w-full p-5 rounded-2xl border-2 transition-all ${
                    preferences.eco
                      ? 'border-[#3A6932] bg-[#3A6932]/5'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center mr-4 ${
                        preferences.eco ? 'bg-[#3A6932]' : 'bg-gray-100'
                      }`}>
                        <Leaf className={`w-6 h-6 ${preferences.eco ? 'text-white' : 'text-gray-400'}`} />
                      </div>
                      <div className="text-left">
                        <div className="font-bold text-gray-900">Éco-responsable</div>
                        <div className="text-sm text-gray-600">Privilégier les produits locaux et bio</div>
                      </div>
                    </div>
                    {preferences.eco && (
                      <Check className="w-6 h-6 text-[#3A6932]" />
                    )}
                  </div>
                </button>
              </div>

              <button
                onClick={handlePreferencesSubmit}
                disabled={loading}
                className="w-full bg-[#3A6932] text-white py-5 rounded-2xl font-bold text-lg hover:bg-[#2d5226] transition-all shadow-lg hover:shadow-xl disabled:bg-gray-400"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                    Enregistrement...
                  </div>
                ) : (
                  'Découvrir les offres'
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClientOnboardingPage;
