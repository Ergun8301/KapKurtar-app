import React from "react";
import { useNavigate } from "react-router-dom";

/**
 * Page de sélection du type d'utilisateur
 * Affichée uniquement sur mobile natif (Capacitor) comme porte d'entrée
 * Redirige vers les pages d'authentification existantes
 */
const UserTypeSelectionPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6"
      style={{ backgroundColor: "#F7F2E7" }}
    >
      {/* Logo KAPKURTAR */}
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold">
          <span style={{ color: "#00A690" }}>KAP</span>
          <span style={{ color: "#F75C00" }}>KURTAR</span>
        </h1>
      </div>

      {/* Titre de bienvenue */}
      <h2
        className="text-2xl font-semibold mb-2 text-center"
        style={{ color: "#00615F" }}
      >
        Hoş Geldiniz!
      </h2>

      {/* Sous-titre */}
      <p className="text-gray-600 mb-10 text-center">
        Nasıl devam etmek istersiniz?
      </p>

      {/* Boutons de sélection */}
      <div className="w-full max-w-xs space-y-4">
        {/* Bouton Client */}
        <button
          onClick={() => navigate("/customer/auth")}
          className="w-full py-4 px-6 rounded-xl text-white font-semibold text-lg shadow-lg transition-transform active:scale-95"
          style={{ backgroundColor: "#00A690" }}
        >
          🛒 Müşteriyim
        </button>

        {/* Bouton Marchand */}
        <button
          onClick={() => navigate("/merchant/auth")}
          className="w-full py-4 px-6 rounded-xl text-white font-semibold text-lg shadow-lg transition-transform active:scale-95"
          style={{ backgroundColor: "#F75C00" }}
        >
          🏪 İşletmeyim
        </button>
      </div>

      {/* Note discrète */}
      <p className="mt-10 text-sm text-gray-500 text-center">
        Gıda israfını birlikte azaltalım
      </p>
    </div>
  );
};

export default UserTypeSelectionPage;
