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
      className="min-h-screen flex flex-col justify-between px-6 py-12"
      style={{ backgroundColor: "#F7F2E7" }}
    >
      {/* HAUT - Logo et bienvenue */}
      <div className="text-center pt-8">
        <h1 className="text-5xl font-bold mb-4">
          <span style={{ color: "#00A690" }}>KAP</span>
          <span style={{ color: "#F75C00" }}>KURTAR</span>
        </h1>
        <p className="text-2xl font-semibold" style={{ color: "#00A690" }}>
          Hoş Geldiniz!
        </p>
      </div>

      {/* MILIEU - Message principal */}
      <div className="text-center">
        <p className="text-xl font-medium mb-2" style={{ color: "#00615F" }}>
          Gıda israfını birlikte önleyelim
        </p>
        <p className="text-gray-600">
          Nasıl devam etmek istersiniz?
        </p>
      </div>

      {/* BAS - Boutons */}
      <div className="space-y-4 pb-8">
        <button
          onClick={() => navigate("/customer/auth")}
          className="w-full py-5 rounded-xl text-white text-lg font-semibold transition-all duration-200 hover:opacity-90 active:scale-95"
          style={{ backgroundColor: "#00A690" }}
        >
          🛒 Müşteriyim
        </button>
        <button
          onClick={() => navigate("/merchant/auth")}
          className="w-full py-5 rounded-xl text-white text-lg font-semibold transition-all duration-200 hover:opacity-90 active:scale-95"
          style={{ backgroundColor: "#F75C00" }}
        >
          🏪 İşletmeyim
        </button>
      </div>
    </div>
  );
};

export default UserTypeSelectionPage;
