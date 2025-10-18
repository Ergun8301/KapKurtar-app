import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, ArrowLeft, Store } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { useAuthFlow } from '../hooks/useAuthFlow';

type AuthMode = 'login' | 'register';

const MerchantAuthPage = () => {
  const navigate = useNavigate();
  const { user, role, profile, loading: authLoading, initialized } = useAuthFlow();
  const [mode, setMode] = useState<AuthMode>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    companyName: ''
  });

  useEffect(() => {
    if (initialized && user && role && profile) {
      if (role === 'merchant') {
        navigate('/merchant/dashboard');
      } else if (role === 'client') {
        navigate('/offers');
      }
    }
  }, [initialized, user, role, profile, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });
        if (error) throw error;
      } else {
        if (formData.password.length < 6) {
          throw new Error('Le mot de passe doit contenir au moins 6 caractères');
        }
        if (!formData.companyName.trim()) {
          throw new Error('Le nom de l\'entreprise est requis');
        }

        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
        });
        if (authError) throw authError;

        if (authData.user) {
          const { error: merchantError } = await supabase.from('merchants').insert({
            profile_id: authData.user.id,
            company_name: formData.companyName
          });
          if (merchantError) throw merchantError;
        }
      }
    } catch (err) {
      const error = err as Error;
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading && !initialized) {
    return (
      <div className="min-h-screen bg-[#FAFAF5] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3A6932]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAF5] flex flex-col">
      <div className="flex-1 flex items-center justify-center py-8 px-4">
        <div className="w-full max-w-md space-y-6">
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center text-[#3A6932] hover:text-[#2d5226] font-medium mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour
          </button>

          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 bg-[#FF6B35] rounded-2xl flex items-center justify-center shadow-lg">
                <Store className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {mode === 'login' ? 'Espace Commerçant' : 'Devenez Partenaire'}
            </h1>
            <p className="text-gray-600">
              {mode === 'login'
                ? 'Gérez vos offres et réduisez le gaspillage'
                : 'Rejoignez SEPET et valorisez vos invendus'}
            </p>
          </div>

          <div className="bg-white rounded-3xl shadow-xl p-6 space-y-6">
            <div className="flex bg-gray-100 rounded-2xl p-1">
              <button
                onClick={() => setMode('login')}
                className={`flex-1 py-3 text-center font-semibold rounded-xl transition-all ${
                  mode === 'login'
                    ? 'bg-white text-[#FF6B35] shadow-md'
                    : 'text-gray-500'
                }`}
              >
                Connexion
              </button>
              <button
                onClick={() => setMode('register')}
                className={`flex-1 py-3 text-center font-semibold rounded-xl transition-all ${
                  mode === 'register'
                    ? 'bg-white text-[#FF6B35] shadow-md'
                    : 'text-gray-500'
                }`}
              >
                Inscription
              </button>
            </div>

            {error && (
              <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-lg">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'register' && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Nom de l'entreprise
                  </label>
                  <div className="relative">
                    <Store className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleInputChange}
                      className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent text-base"
                      placeholder="Votre commerce"
                      required={mode === 'register'}
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent text-base"
                    placeholder="commerce@example.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Mot de passe
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full pl-12 pr-14 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent text-base"
                    placeholder="••••••••"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#FF6B35] text-white py-4 rounded-xl font-bold text-lg hover:bg-[#e55a28] transition-all shadow-lg hover:shadow-xl disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Chargement...
                  </div>
                ) : mode === 'login' ? (
                  'Se connecter'
                ) : (
                  'Créer mon espace'
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MerchantAuthPage;
