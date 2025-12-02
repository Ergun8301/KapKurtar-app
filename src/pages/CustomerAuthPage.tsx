import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, ArrowLeft } from 'lucide-react';
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';
import { supabase } from '../lib/supabaseClient';
import { useAuthFlow } from '../hooks/useAuthFlow';
import { getRedirectUrl, isNativePlatform } from '../lib/appConfig';
import ProfileCompletionModal from '../components/ProfileCompletionModal';

type AuthMode = 'login' | 'register';

const CustomerAuthPage = () => {
  const navigate = useNavigate();
  const { user, role, loading: authLoading, initialized, refetchProfile } = useAuthFlow();
  const [mode, setMode] = useState<AuthMode>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showProfileModal, setShowProfileModal] = useState(false);

  // ✅ 1. Redirection automatique après connexion
  useEffect(() => {
    if (!initialized || !user) return;

    if (role === 'client') {
      // Vérifier si le profil est complet
      checkProfileCompletion();
    } else if (role === 'merchant') {
      navigate('/merchant/dashboard');
    }
  }, [initialized, user, role, navigate]);

  // ✅ 2. Vérifier si le profil client est complet
  const checkProfileCompletion = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('first_name, last_name')
        .eq('auth_id', user.id)
        .maybeSingle();

      if (error) throw error;

      // Si prénom ou nom manquant → afficher popup
      if (!data?.first_name || !data?.last_name) {
        setShowProfileModal(true);
      } else {
        // Profil complet → redirection vers offres
        navigate('/offers');
      }
    } catch (err) {
      console.error('Erreur vérification profil:', err);
      navigate('/offers'); // Redirection par défaut en cas d'erreur
    }
  };

  // ✅ 3. Gestion du formulaire
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ✅ 4. Connexion / Inscription e-mail
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

        if (data.user) {
          await refetchProfile();
          // La vérification du profil se fera via useEffect
        }
      } else {
        if (formData.password.length < 6)
          throw new Error('Şifre en az 6 karakter içermelidir');

        const { data, error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              role: 'client',
            },
            emailRedirectTo: getRedirectUrl('/auth/callback?role=client'),
          },
        });
        if (error) throw error;

        // Email confirmation is disabled - check profile completion
        if (data.user) {
          await refetchProfile();
          // useEffect will handle redirection and profile completion check
        }
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ 5. Auth Google (rôle client)
  const handleGoogleAuth = async () => {
    setIsLoading(true);
    setError('');

    try {
      const isNative = isNativePlatform();
      console.log('🔍 [OAuth Debug] ========== GOOGLE AUTH START ==========');
      console.log('🔍 [OAuth Debug] isNativePlatform():', isNative);

      if (isNative) {
        // 📱 Mode NATIVE: Utiliser Google Auth plugin (Google Play Services)
        console.log('🔍 [OAuth Debug] Mode NATIVE - GoogleAuth.signIn()');

        // Connexion Google native via Google Play Services
        const googleUser = await GoogleAuth.signIn();
        console.log('🔍 [OAuth Debug] GoogleAuth.signIn() OK:', googleUser.email);

        // Récupérer l'idToken pour Supabase
        const idToken = googleUser.authentication.idToken;
        if (!idToken) {
          throw new Error('Impossible de récupérer le token Google');
        }
        console.log('🔍 [OAuth Debug] idToken obtenu, longueur:', idToken.length);

        // Authentifier avec Supabase via idToken
        const { data, error } = await supabase.auth.signInWithIdToken({
          provider: 'google',
          token: idToken,
        });

        if (error) {
          console.error('🔍 [OAuth Debug] Erreur signInWithIdToken:', error);
          throw error;
        }

        if (data.user) {
          console.log('✅ [OAuth Debug] Supabase signInWithIdToken OK:', data.user.email);

          // Créer/mettre à jour le profil avec le rôle client
          const { error: profileError } = await supabase.from('profiles').upsert(
            {
              auth_id: data.user.id,
              email: data.user.email,
              role: 'client',
            },
            { onConflict: 'auth_id' }
          );

          if (profileError) {
            console.warn('⚠️ [OAuth Debug] Erreur profil:', profileError.message);
          }

          await refetchProfile();
          // useEffect will handle redirection and profile completion check
        }
      } else {
        // 🌐 Web : comportement OAuth standard
        console.log('🔍 [OAuth Debug] Mode WEB - flow OAuth standard');
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: getRedirectUrl('/auth/callback?role=client'),
          },
        });
        if (error) throw error;
      }
    } catch (err) {
      console.error('🔍 [OAuth Debug] ERREUR:', err);
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ 6. Callback après complétion du profil
  const handleProfileComplete = async () => {
    setShowProfileModal(false);
    await refetchProfile();
    navigate('/offers');
  };

  // ✅ 7. Loader
  if (authLoading && !initialized) {
    return (
      <div className="min-h-screen bg-[#FAFAF5] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3A6932]"></div>
      </div>
    );
  }

  // ✅ 8. Interface
  return (
    <>
      {/* Modal de complétion de profil */}
      {showProfileModal && user && (
        <ProfileCompletionModal
          isOpen={showProfileModal}
          userEmail={user.email || ''}
          userId={user.id}
          onComplete={handleProfileComplete}
        />
      )}

      <div className="h-full overflow-hidden bg-[#FAFAF5] flex flex-col">
        <div className="flex-1 flex items-center justify-center py-4 px-4">
          <div className="w-full max-w-md space-y-4">
            <button
              onClick={() => navigate('/')}
              className="inline-flex items-center text-[#3A6932] hover:text-[#2d5226] font-medium"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Geri
            </button>

            <div className="text-center mb-4">
              <h1 className="text-2xl font-bold text-gray-900 mb-1">
                {mode === 'login' ? 'Hoş Geldiniz' : 'Hesap Oluştur'}
              </h1>
              <p className="text-gray-600 text-sm">
                {mode === 'login'
                  ? 'Yakınınızdaki tekliflere erişin'
                  : 'Gıdayı kurtarın, tasarruf edin'}
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-xl p-5 space-y-4">
              <div className="flex bg-gray-100 rounded-2xl p-1">
                <button
                  onClick={() => setMode('login')}
                  className={`flex-1 py-3 font-semibold rounded-xl ${
                    mode === 'login'
                      ? 'bg-white text-[#3A6932] shadow-md'
                      : 'text-gray-500'
                  }`}
                >
                  Giriş
                </button>
                <button
                  onClick={() => setMode('register')}
                  className={`flex-1 py-3 font-semibold rounded-xl ${
                    mode === 'register'
                      ? 'bg-white text-[#3A6932] shadow-md'
                      : 'text-gray-500'
                  }`}
                >
                  Kayıt
                </button>
              </div>

              {error && (
                <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-lg">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">E-posta</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#3A6932] focus:border-transparent text-base"
                      placeholder="email@ornek.com"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Şifre
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
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
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {mode === 'login' && (
                    <div className="text-right mt-2">
                      <button
                        type="button"
                        onClick={() => navigate('/forgot-password')}
                        className="text-sm text-[#3A6932] hover:text-[#2d5226] font-medium"
                      >
                        Şifremi unuttum?
                      </button>
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-[#3A6932] text-white py-4 rounded-xl font-bold text-lg hover:bg-[#2d5226] transition-all shadow-lg hover:shadow-xl disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Yükleniyor...
                    </div>
                  ) : mode === 'login' ? (
                    'Giriş Yap'
                  ) : (
                    'Hesap Oluştur'
                  )}
                </button>
              </form>

              {/* Séparateur */}
              <div className="flex items-center gap-2 my-2">
                <div className="flex-1 h-px bg-gray-300"></div>
                <span className="text-gray-500 text-sm">veya</span>
                <div className="flex-1 h-px bg-gray-300"></div>
              </div>

              {/* Bouton Google */}
              <button
                type="button"
                onClick={handleGoogleAuth}
                className="w-full py-3 border border-gray-300 rounded-xl flex items-center justify-center gap-2 hover:bg-gray-50 transition-all"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                <span className="font-medium">Google</span>
              </button>

            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CustomerAuthPage;