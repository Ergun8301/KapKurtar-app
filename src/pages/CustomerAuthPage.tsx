import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, ArrowLeft } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { useAuthFlow } from '../hooks/useAuthFlow';

type AuthMode = 'login' | 'register';

const CustomerAuthPage = () => {
  const navigate = useNavigate();
  const { user, role, profile, loading: authLoading, initialized } = useAuthFlow();
  const [mode, setMode] = useState<AuthMode>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  useEffect(() => {
    if (initialized && user && role && profile) {
      if (!profile.onboarding_completed) {
        navigate('/onboarding/client');
      } else if (role === 'client') {
        navigate('/offers');
      } else if (role === 'merchant') {
        navigate('/merchant/dashboard');
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

        const { error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
        });
        if (error) throw error;
      }
    } catch (err) {
      const error = err as Error;
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/offers`,
        },
      });
      if (error) throw error;
    } catch (err) {
      const error = err as Error;
      setError(error.message);
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
              <div className="w-16 h-16 bg-[#3A6932] rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-3xl">S</span>
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {mode === 'login' ? 'Bienvenue' : 'Rejoignez SEPET'}
            </h1>
            <p className="text-gray-600">
              {mode === 'login'
                ? 'Accédez à des offres exclusives près de chez vous'
                : 'Sauvez de la nourriture, économisez de l\'argent'}
            </p>
          </div>

          <div className="bg-white rounded-3xl shadow-xl p-6 space-y-6">
            <div className="flex bg-gray-100 rounded-2xl p-1">
              <button
                onClick={() => setMode('login')}
                className={`flex-1 py-3 text-center font-semibold rounded-xl transition-all ${
                  mode === 'login'
                    ? 'bg-white text-[#3A6932] shadow-md'
                    : 'text-gray-500'
                }`}
              >
                Connexion
              </button>
              <button
                onClick={() => setMode('register')}
                className={`flex-1 py-3 text-center font-semibold rounded-xl transition-all ${
                  mode === 'register'
                    ? 'bg-white text-[#3A6932] shadow-md'
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
                    className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#3A6932] focus:border-transparent text-base"
                    placeholder="votre@email.com"
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
                    className="w-full pl-12 pr-14 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#3A6932] focus:border-transparent text-base"
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

                {mode === 'login' && (
                  <p className="text-sm text-right mt-2">
                    <a
                      href="/forgot-password"
                      className="text-[#3A6932] hover:underline"
                    >
                      Mot de passe oublié ?
                    </a>
                  </p>
                )}
              </div>
