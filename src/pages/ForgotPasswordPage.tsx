import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, CheckCircle2, AlertTriangle } from 'lucide-react';

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setIsError(false);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/update-password`,
      });

      if (error) {
        setIsError(true);
        setMessage("❌ " + error.message);
      } else {
        setIsError(false);
        setMessage('✅ Un lien de réinitialisation vous a été envoyé par e-mail.');
      }
    } catch (err: any) {
      setIsError(true);
      setMessage("❌ Une erreur inattendue s’est produite. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAF5] flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 space-y-6">
        {/* Bouton retour */}
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center text-[#3A6932] hover:text-[#2d5226] font-medium"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour à l’accueil
        </button>

        {/* En-tête */}
        <div className="text-center">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-[#3A6932] rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-3xl">S</span>
            </div>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Mot de passe oublié ?
          </h1>
          <p className="text-gray-600 mb-6">
            Entrez votre adresse e-mail ci-dessous. Nous vous enverrons un lien
            pour réinitialiser votre mot de passe.
          </p>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleResetPassword} className="space-y-5">
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="email"
              placeholder="votre@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#3A6932] focus:border-transparent text-base"
            />
          </div>

          {message && (
            <div
              className={`flex items-center p-3 rounded-lg text-sm border ${
                isError
                  ? 'bg-red-50 border-red-200 text-red-700'
                  : 'bg-blue-50 border-blue-200 text-blue-700'
              }`}
            >
              {isError ? (
                <AlertTriangle className="w-5 h-5 mr-2 text-red-600" />
              ) : (
                <CheckCircle2 className="w-5 h-5 mr-2 text-blue-600" />
              )}
              <span>{message}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#3A6932] text-white py-4 rounded-xl font-bold text-lg hover:bg-[#2d5226] transition-all shadow-lg hover:shadow-xl disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? 'Envoi en cours...' : 'Envoyer le lien de réinitialisation'}
          </button>
        </form>

        {/* Lien retour bas de page */}
        <div className="text-center pt-4">
          <p className="text-gray-600 text-sm">
            Vous vous souvenez de votre mot de passe ?{' '}
            <button
              onClick={() => navigate('/customer/auth')}
              className="text-[#3A6932] font-semibold hover:underline"
            >
              Se connecter
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
