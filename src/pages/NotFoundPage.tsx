import React from "react";
import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center h-[70vh] text-center text-gray-700 px-4">
      <h1 className="text-5xl font-bold mb-4">404 - Page non trouvée</h1>
      <p className="text-lg mb-6">
        Oups ! La page que vous cherchez n’existe pas ou a été déplacée.
      </p>
      <Link
        to="/"
        className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
      >
        Retour à l’accueil
      </Link>
    </div>
  );
}
