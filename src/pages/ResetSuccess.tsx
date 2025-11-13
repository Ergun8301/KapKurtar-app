import React from 'react';

export default function ResetSuccess() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white shadow-md rounded-2xl p-8 text-center">
        <h1 className="text-2xl font-bold text-blue-600 mb-4">
          Mot de passe mis à jour ✅
        </h1>
        <p className="text-gray-700 mb-6">
          Votre mot de passe a été réinitialisé avec succès. 
          Vous pouvez maintenant vous connecter à votre compte.
        </p>
        <a
          href="/"
          className="inline-block bg-blue-700 text-white px-6 py-2 rounded-lg hover:bg-blue-800 transition"
        >
          Retour à l’accueil
        </a>
      </div>
    </div>
  );
}
