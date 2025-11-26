import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, ArrowLeft } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { useAuthFlow } from '../hooks/useAuthFlow';
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
            emailRedirectTo: `${window.location.origin}/auth/callback?role=client`,
          },
        });
        if (error) throw error;

        alert(
          '✅ Bir onay e-postası gönderildi. Hesabınızı etkinleştirmek için lütfen bağlantıya tıklayın.'
        );
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ 5. Auth Google (rôle client)
  const handleGoogleAuth = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?role=client`,
        },
      });
      if (error) throw error;
    } catch (err) {
      setError((err as Error).message);
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

            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CustomerAuthPage;