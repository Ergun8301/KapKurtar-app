import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Home,
  Search,
  Package,
  User,
  LayoutDashboard,
  ShoppingBag,
  ClipboardList,
  LogIn,
  Store,
} from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import BottomNavItem from "./BottomNavItem";

/**
 * Barre de navigation inférieure pour mobile natif
 * Affiche 4 onglets selon le rôle de l'utilisateur :
 * - Non connecté : Accueil, Offres, Connexion, Marchands
 * - Client : Accueil, Offres, Réservations, Profil
 * - Marchand : Dashboard, Mes Offres, Commandes, Profil
 */
const BottomNav: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, userType } = useAuthStore();

  // Cacher la BottomNav sur la page de sélection (route "/")
  if (location.pathname === "/") {
    return null;
  }

  // Configuration des onglets selon le rôle
  const getNavItems = () => {
    // Utilisateur non connecté
    if (!user) {
      return [
        { icon: Home, label: "Ana Sayfa", path: "/" },
        { icon: Search, label: "Teklifler", path: "/offers" },
        { icon: LogIn, label: "Giriş", path: "/customer/auth" },
        { icon: Store, label: "İşletmeler", path: "/for-merchants" },
      ];
    }

    // Marchand connecté
    if (userType === "merchant") {
      return [
        { icon: LayoutDashboard, label: "Panel", path: "/merchant/dashboard" },
        { icon: ShoppingBag, label: "Tekliflerim", path: "/merchant/dashboard?tab=offers" },
        { icon: ClipboardList, label: "Siparişler", path: "/merchant/dashboard?tab=orders" },
        { icon: User, label: "Profil", path: "/merchant/dashboard?tab=profile" },
      ];
    }

    // Client connecté (par défaut)
    return [
      { icon: Home, label: "Ana Sayfa", path: "/" },
      { icon: Search, label: "Teklifler", path: "/offers" },
      { icon: Package, label: "Rezervasyonlar", path: "/customer/dashboard" },
      { icon: User, label: "Profil", path: "/client/profile" },
    ];
  };

  const navItems = getNavItems();

  // Vérifie si un onglet est actif basé sur le pathname
  const isActive = (path: string) => {
    // Gestion des query params pour le dashboard marchand
    const basePath = path.split("?")[0];
    const currentPath = location.pathname;

    // Cas spécial pour la page d'accueil
    if (basePath === "/" && currentPath === "/") {
      return true;
    }

    // Cas spécial pour le dashboard marchand avec tabs
    if (basePath === "/merchant/dashboard" && currentPath === "/merchant/dashboard") {
      // Si c'est le premier onglet (Dashboard sans params), actif seulement si pas de tab
      if (path === "/merchant/dashboard" && !location.search) {
        return true;
      }
      // Sinon vérifier le paramètre tab
      const urlParams = new URLSearchParams(location.search);
      const pathParams = new URLSearchParams(path.split("?")[1]);
      return urlParams.get("tab") === pathParams.get("tab");
    }

    // Comparaison standard
    return currentPath === basePath || currentPath.startsWith(basePath + "/");
  };

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50"
      style={{
        paddingBottom: "45px", // Safe area bottom pour Android + espace boutons système
        boxShadow: "0 -2px 10px rgba(0, 0, 0, 0.1)",
      }}
    >
      <div className="flex items-center justify-around h-[60px]">
        {navItems.map((item, index) => (
          <BottomNavItem
            key={index}
            icon={item.icon}
            label={item.label}
            isActive={isActive(item.path)}
            onClick={() => handleNavigation(item.path)}
          />
        ))}
      </div>
    </nav>
  );
};

export default BottomNav;
