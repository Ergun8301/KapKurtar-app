// ✅ MerchantOnboardingPage.tsx corrigé et compatible Supabase (sans rien casser)

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Phone, MapPin, Navigation, Building, SkipForward } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { upsertMerchantProfile, setMerchantLocation } from '../api';
import { useAuth } from '../hooks/useAuth';

const MerchantOnboardingPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    company_name: '',
    first_name: '',
    last_name: '',
    phone: '',
    street: '',
    city: '',
    country: 'FR',
    postal_code: '',
  });

  useEffect(() => {
    if (!user) navigate('/auth/merchant');
  }, [user, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLocationRequest = async () => {
    setLocationLoading(true);
    setError('');

    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });
      const { latitude, longitude } = pos.coords;
      await setMerchantLocation(latitude, longitude);
      alert('📍 Localisation enregistrée !');
    } catch {
      setError("Impossible d'obtenir la localisation. Activez le GPS.");
    } finally {
      setLocationLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!formData.company_name.trim()) {
      alert('Veuillez renseigner le nom de votre entreprise');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await upsertMerchantProfile({
        id: user.id,
        email: user.email,
        ...formData,
        onboarding_completed: true,
      });

      alert("✅ Profil sauvegardé avec succès !");

      await supabase
        .from("merchants")
        .update({ onboarding_completed: true })
        .eq("email", user.email);

      navigate('/merchant/dashboard');
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la sauvegarde');
    } finally {
      setIsLoading(false);
    }
  };

  // 🚀 Nouveau bouton "Passer pour l’instant"
  const handleSkip = async () => {
    if (!user) return;
    try {
      await upsertMerchantProfile({
        id: user.id,
        onboarding_completed: true,
      });
      navigate('/merchant/dashboard');
    } catch {
      navigate('/merchant/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Bienvenue chez <span className="text-green-600">TILKAPP</span> 🌱
          </h1>
          <p className="text-gray-600">
            Complétez votre profil marchand (facultatif sauf le nom).
          </p>
        </div>

        <div className="bg-white shadow-lg rounded-lg p-8">
          <div className="animate-fadeIn bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg mb-4 text-center shadow-sm">
            👋 Bienvenue chez <b>TILKAPP</b> ! Complétez votre profil marchand pour commencer à publier vos offres.
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Nom entreprise */}
            <div className="relative">
              <Building className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                name="company_name"
                placeholder="Nom de l'entreprise *"
                value={formData.company_name}
                onChange={handleInputChange}
                className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500"
                required
              />
            </div>

            {/* Infos personnelles (facultatives) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <input
                type="text"
                name="first_name"
                placeholder="Prénom (facultatif)"
                value={formData.first_name}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border rounded-lg"
              />
              <input
                type="text"
                name="last_name"
                placeholder="Nom (facultatif)"
                value={formData.last_name}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border rounded-lg"
              />
            </div>

            <input
              type="tel"
              name="phone"
              placeholder="Téléphone (facultatif)"
              value={formData.phone}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border rounded-lg"
            />

            {/* Adresse (facultative) */}
            <input
              type="text"
              name="street"
              placeholder="Rue / adresse"
              value={formData.street}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border rounded-lg"
            />

            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                name="city"
                placeholder="Ville"
                value={formData.city}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border rounded-lg"
              />
              <input
                type="text"
                name="postal_code"
                placeholder="Code postal"
                value={formData.postal_code}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border rounded-lg"
              />
            </div>

            {/* Localisation */}
            <button
              type="button"
              onClick={handleLocationRequest}
              disabled={locationLoading}
              className="w-full bg-blue-500 text-white px-4 py-3 rounded-lg hover:bg-blue-600"
            >
              {locationLoading ? 'Obtention...' : '📍 Utiliser ma position actuelle'}
            </button>

            {/* Boutons */}
            <div className="flex gap-4 mt-6">
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-green-500 text-white py-3 rounded-lg hover:bg-green-600"
              >
                {isLoading ? 'Sauvegarde...' : 'Enregistrer'}
              </button>

              <button
                type="button"
                onClick={handleSkip}
                className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg hover:bg-gray-200"
              >
                Passer pour l’instant
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default MerchantOnboardingPage;
