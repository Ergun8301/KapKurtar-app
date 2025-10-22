import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, ArrowLeft, Store } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { useAuthFlow } from '../hooks/useAuthFlow';

type AuthMode = 'login' | 'register';

const MerchantAuthPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, role, profile, loading: authLoading, initialized, refetchProfile } = useAuthFlow();
  const [mode, setMode] = useState<AuthMode>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({ email: '', password: '', companyName: '' });

  // ✅ 1. Appliquer automatiquement le rôle merchant une fois la session prête
  useEffect(() => {
    (async () => {
      if (!initialized || !user) return;

      try {
        // 🧩 Met à jour le rôle dans Supabase
        await supabase.rpc('set_role_for_me', { p_role: 'merchant' });
        await supabase.from('profiles').update({ role: 'merchant' }).eq('auth_id', user.id);

        // 🧱 Crée automatiquement une ligne merchant si inexistante
        const { data: profileRow } = await supabase
          .from('profiles')
          .select('id')
          .eq('auth_id', user.id)
          .maybeSingle();

        if (profileRow) {
          const { data: existingMerchant } = await supabase
            .from('merchants')
            .select('id')
            .eq('profile_id', profileRow.id)
            .maybeSingle();

          if (!existingMerchant) {
            console.log('🆕 Création du merchant via RPC...');
            await supabase.rpc('get_or_create_merchant_for_profile');
            console.log('✅ Merchant créé automatiquement.');
          }
        }
      } catch (err) {
        console.error('Erreur mise à jour rôle merchant:', err);
      }
    })();
  }, [initialized, user]);

  // ✅ 2. Redirections automatiques après connexion
  useEffect(() => {
    (async () => {
      if (!initialized || !user) return;

      if (role === 'merchant' && profile) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('id')
          .eq('auth_id', user.id)
          .single();

        if (profileData) {
          const { data: merchantData } = await supabase
            .from('merchants')
            .select('id')
            .eq('profile_id', profileData.id)
            .maybeSingle();

          if (merchantData) {
            const { data: offers } = await supabase
              .from('offers')
              .select('id')
              .eq('merchant_id', merchantData.id)
              .limit(1);

            if (!offers || offers.length === 0) navigate('/merchant/add-product');
            else navigate('/merchant/dashboard');
          } else {
            navigate('/merchant/add-product');
          }
        }
      } else if (role === 'client') {
        navigate('/offers');
      }
    })();
  }, [initialized, user, role, profile]);

  // ✅ 3. Gestion formulaire
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // ✅ 4. Auth email/password
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      if (mode === 'login') {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });
        if (error) throw error;
      } else {
        if (formData.password.length < 6)
          throw new Error('Le mot de passe doit contenir au moins 6 caractères');
        if (!formData.companyName.trim())
          throw new Error("Le nom de l'entreprise est requis");

        const { error: signUpError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
        });
        if (signUpError) throw signUpError;
      }

      // ⏳ on laisse la redirection automatique s’occuper du reste
      await refetchProfile();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ 5. Auth Google
  const handleGoogleAuth = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?role=merchant`,
        },
      });
      if (error) throw error;
    } catch (err) {
      setError((err as Error).message);
    }
  };

  // ✅ 6. Loader
  if (authLoading && !initialized) {
    return (
      <div className="min-h-screen bg-[#FAFAF5] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF6B35]"></div>
      </div>
    );
  }

  // ✅ 7. Interface
  return (
    <div className="min-h-screen bg-[#FAFAF5] flex flex-col">
      <div className="flex-1 flex items-center justify-center py-8 px-4">
        <div className="w-full max-w-md space-y-6">
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center text-[#FF6B35] hover:text-[#e55a28] font-medium mb-4"
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
                className={`flex-1 py-3 font-semibold rounded-xl ${
                  mode === 'login'
                    ? 'bg-white text-[#FF6B35] shadow-md'
                    : 'text-gray-500'
                }`}
              >
                Connexion
              </button>
              <button
                onClick={() => setMode('register')}
                className={`flex-1 py-3 font-semibold rounded-xl ${
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
                    <Store className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
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
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
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
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
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
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
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

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500 font-medium">
                  Ou continuer avec
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleGoogleAuth}
              className="w-full flex items-center justify-center px-4 py-4 border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition-all font-semibold"
            >
              <svg className="w-6 h-6 mr-3" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Google
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MerchantAuthPage;
