import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

const AuthCallbackPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        const role = searchParams.get('role');

        if (!role || !['client', 'merchant'].includes(role)) {
          setError('Invalid role parameter');
          setLoading(false);
          return;
        }

        let retryCount = 0;
        const maxRetries = 5;
        let session = null;

        while (retryCount < maxRetries && !session) {
          const { data: { session: currentSession } } = await supabase.auth.getSession();

          if (currentSession) {
            session = currentSession;
            break;
          }

          await new Promise(resolve => setTimeout(resolve, 500));
          retryCount++;
        }

        if (!session) {
          setError('Unable to retrieve session after OAuth');
          setLoading(false);
          return;
        }

        await supabase.rpc('set_role_for_me', { p_role: role });

        const { error: updateError } = await supabase
          .from('profiles')
          .update({ role })
          .eq('auth_id', session.user.id);

        if (updateError) {
          console.error('Error updating role in profiles:', updateError);
        }

        if (role === 'merchant') {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('id')
            .eq('auth_id', session.user.id)
            .single();

          if (profileData) {
            const { data: merchantData } = await supabase
              .from('merchants')
              .select('id')
              .eq('profile_id', profileData.id)
              .maybeSingle();

            if (!merchantData) {
              navigate('/merchant/add-product');
            } else {
              navigate('/merchant/dashboard');
            }
          } else {
            navigate('/merchant/dashboard');
          }
        } else {
          navigate('/offers');
        }
      } catch (err) {
        console.error('OAuth callback error:', err);
        setError((err as Error).message);
        setLoading(false);
      }
    };

    handleOAuthCallback();
  }, [navigate, searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAF5] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3A6932] mx-auto mb-4"></div>
          <p className="text-gray-600">Finalisation de la connexion...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#FAFAF5] flex items-center justify-center px-4">
        <div className="bg-white rounded-3xl shadow-xl p-8 max-w-md w-full">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-red-600 text-2xl">✕</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Erreur de connexion</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => navigate('/')}
              className="w-full bg-[#3A6932] text-white py-3 rounded-xl font-semibold hover:bg-[#2d5226] transition-colors"
            >
              Retour à l'accueil
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default AuthCallbackPage;
