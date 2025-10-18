import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { ArrowLeft, Lock } from 'lucide-react';

export default function UpdatePasswordPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setError(error.message);
    } else {
      setMessage('✅ Votre mot de passe a été réinitialisé avec succès.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#FAFAF5] flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 space-y-6">
        <button
          onClick={() => navigate('/customer/auth')}
          className="inline-flex items-center text-[#3A6932] hover:text-[#2d5226] font-medium"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour à la connexion
        </button>

        <div className="text-center">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-[#3A6932] rounded-2xl flex items-center justify-center shadow-lg">
              <Lock className="w-8 h-8 text-white" />
            </div>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Nouveau mot de passe
          </h1>
          <p className="text-gray-600 mb-6">
            Entrez un nouveau mot de passe pour sécuriser votre compte.
          </p>
        </div>

        <form onSubmit={handleUpdate} className="space-y-4">
          <input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="w-full pl-4 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#3A6932] focus:border-transparent text-base"
          />

          {message && (
            <p className="text-green-700 bg-green-50 border border-green-200 p-3 rounded-lg text-sm">
              {message}
            </p>
          )}
          {error && (
            <p className="text-red-700 bg-red-50 border border-red-200 p-3 rounded-lg text-sm">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#3A6932] text-white py-3 rounded-xl font-semibold hover:bg-[#2d5226] transition-all disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? 'Mise à jour...' : 'Mettre à jour le mot de passe'}
          </button>
        </form>
      </div>
    </div>
  );
}
