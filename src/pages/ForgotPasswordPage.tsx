import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail } from 'lucide-react';

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/update-password`,
    });

    setLoading(false);

    if (error) {
      setMessage("Erreur : " + error.message);
    } else {
      setMessage('Un lien de réinitialisation vous a été envoyé par e-mail.');
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAF5] flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 space-y-6">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center text-[#3A6932] hover:text-[#2d5226] font-medium"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour
        </button>

        <div className="text-center">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-[#3A6932] rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-3xl">S</span>
            </div>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Réinitialiser le mot de passe
          </h1>
          <p className="text-gray-600 mb-6">
            Entrez votre e-mail pour recevoir un lien de réinitialisation.
          </p>
        </div>

        <form onSubmit={handleResetPassword} className="space-y-4">
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
            <p
              className={`text-sm p-3 rounded-lg border ${
                message.startsWith('Erreur')
                  ? 'text-red-700 bg-red-50 border-red-200'
                  : 'text-green-700 bg-green-50 border-green-200'
              }`}
            >
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#3A6932] text-white py-3 rounded-xl font-semibold hover:bg-[#2d5226] transition-all disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? 'Envoi en cours...' : 'Envoyer le lien'}
          </button>
        </form>
      </div>
    </div>
  );
}
