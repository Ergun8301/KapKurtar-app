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

  useEffect(() => {
    (async () => {
      if (!initialized || !user) return;
      try {
        await supabase.rpc('set_role_for_me', { p_role: 'merchant' });
        await supabase.from('profiles').update({ role: 'merchant' }).eq('auth_id', user.id);
      } catch (err) {
        console.error('Erreur mise à jour rôle merchant:', err);
      }
    })();
  }, [initialized, user]);

  useEffect(() => {
    if (!initialized || !user) return;
    if (role === 'merchant') navigate('/merchant/dashboard');
    else if (role === 'client') navigate('/offers');
  }, [initialized, user, role, profile, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

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
        await supabase.rpc('set_role_for_me', { p_role: 'merchant' });
        await refetchProfile();
        navigate('/merchant/dashboard');
      } else {
        if (formData.password.length < 6)
          throw new Error('Le mot de passe doit contenir au moins 6 caractères');
        if (!formData.companyName.trim())
          throw new Error("Le nom de l'entreprise est requis");

        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
        });
        if (signUpError) throw signUpError;

        if (signUpData?.user) {
          await supabase.rpc('create_merchant_from_profile_secure', {
            p_auth_id: signUpData.user.id,
          });
        }

        alert('✅ Un e-mail de confirmation vous a été envoyé.');
      }
    } catch (err) {
      console.error(err);
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}/auth/callback?role=merchant` },
      });
      if (error) throw error;
    } catch (err) {
      setError((err as Error).message);
    }
  };

  if (authLoading && !initialized) {
    return (
      <div className="min-h-screen bg-[#FAFAF5] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF6B35]" />
      </div>
    );
  }

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
          {/* ... le reste du formulaire comme avant ... */}
        </div>
      </div>
    </div>
  );
};

export default MerchantAuthPage;
