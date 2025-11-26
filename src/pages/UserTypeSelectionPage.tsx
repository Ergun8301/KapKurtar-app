import React from "react";
import { useNavigate } from "react-router-dom";
import { ShoppingCart, Store } from "lucide-react";

/**
 * Page de sélection du type d'utilisateur
 * Affichée uniquement sur mobile natif (Capacitor) comme porte d'entrée
 * Redirige vers les pages d'authentification existantes
 */
const UserTypeSelectionPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div
      className="h-screen overflow-hidden flex flex-col px-6 py-8"
      style={{ backgroundColor: "#00A690" }}
    >
      {/* HAUT - Logo et messages */}
      <div className="text-center pt-4 pb-6">
        {/* Logo texte */}
        <h1 className="text-4xl font-bold mb-2">
          <span style={{ color: "#F75C00" }}>KAP</span>
          <span style={{ color: "#F7F2E7" }}>KURTAR</span>
        </h1>
        <p className="text-xl font-semibold text-white mb-1">
          Hoş Geldiniz!
        </p>
        <p className="text-sm" style={{ color: "#E0F2F1" }}>
          Gıda israfını birlikte önleyelim
        </p>
      </div>

      {/* MILIEU + BAS - Boutons */}
      <div className="flex-1 flex flex-col justify-center gap-4 pb-8">
        {/* Bouton Client */}
        <button
          onClick={() => navigate("/customer/auth")}
          className="flex-1 max-h-[160px] rounded-2xl shadow-lg flex flex-col items-center justify-center transition-transform active:scale-[0.98]"
          style={{ backgroundColor: "#F7F2E7" }}
        >
          <ShoppingCart size={40} style={{ color: "#00A690" }} />
          <span className="text-2xl font-bold mt-2" style={{ color: "#00615F" }}>
            Müşteriyim
          </span>
          <span className="text-sm text-gray-500 mt-1">
            Fırsatları keşfet ve tasarruf et
          </span>
        </button>

        {/* Bouton Marchand */}
        <button
          onClick={() => navigate("/merchant/auth")}
          className="flex-1 max-h-[160px] rounded-2xl shadow-lg flex flex-col items-center justify-center transition-transform active:scale-[0.98] border-2"
          style={{ backgroundColor: "#FFFFFF", borderColor: "#F75C00" }}
        >
          <Store size={40} style={{ color: "#F75C00" }} />
          <span className="text-2xl font-bold mt-2" style={{ color: "#00615F" }}>
            İşletmeyim
          </span>
          <span className="text-sm text-gray-500 mt-1">
            Ürünlerini sat, israfı önle
          </span>
        </button>
      </div>
    </div>
  );
};

export default UserTypeSelectionPage;
