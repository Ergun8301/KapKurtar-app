import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { ArrowLeft, Lock, CheckCircle2, AlertTriangle } from 'lucide-react';

export default function UpdatePasswordPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setIsError(false);
    setLoading(true);

    if (password !== confirm) {
      setIsError(true);
      setMessage('❌ Les mots de passe ne correspondent pas.');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setIsError(true);
      setMessage('❌ Le mot de passe doit contenir au moins 6 caractères.');
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({ password });

      if (error) {
        setIsError(true);
        setMessage(`❌ ${error.message}`);
      } else {
        setIsError(false);
        setMessage('✅ Votre mot de passe a été réinitialisé avec succès.');
        // 🔁 Retour automatique à la connexion après 3 secondes
        setTimeout(() => navigate('/customer/auth'), 3000);
      }
    } catch (err: any) {
      setIsError(true);
      setMessage('❌ Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAF5] flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 space-y-6">
        {/* Bouton retour */}
        <button
          onClick={() => navigate('/customer/auth')}
          className="inline-flex items-center text-[#3A6932] hover:text-[#2d5226] font-medium"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour à la connexion
        </button>

        {/* En-tête */}
        <div className="text-center">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-[#3A6932] rounded-2xl flex items-center justify-center shadow-lg">
              <Lock className="w-8 h-8 text-white" />
            </div>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Nouveau mot de passe
          </h1>
          <p className="text-gray-600 mb-6">
            Entrez et confirmez votre nouveau mot de passe pour sécuriser votre compte.
          </p>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleUpdate} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Nouveau mot de passe
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full pl-4 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#3A6932] focus:border-transparent text-base"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Confirmez le mot de passe
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              className="w-full pl-4 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#3A6932] focus:border-transparent text-base"
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
            {loading ? 'Mise à jour...' : 'Mettre à jour le mot de passe'}
          </button>
        </form>

        {/* Lien retour bas de page */}
        <div className="text-center pt-4">
          <p className="text-gray-600 text-sm">
            Vous n’avez pas demandé cette réinitialisation ?{' '}
            <button
              onClick={() => navigate('/')}
              className="text-[#3A6932] font-semibold hover:underline"
            >
              Retour à l’accueil
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
