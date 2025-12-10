import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Search,
  Package,
  User,
  LayoutDashboard,
  PlusCircle,
  LogIn,
  Store,
  Map,
} from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import { useAddProduct } from "../../contexts/AddProductContext";
import BottomNavItem from "./BottomNavItem";

/**
 * Barre de navigation inférieure pour mobile natif
 * Affiche 2-4 onglets selon le rôle de l'utilisateur :
 * - Non connecté : Teklifler, Giriş, İşletmeler (3)
 * - Client : Teklifler, Harita, Rezervasyonlar, Profil (4)
 * - Marchand : Panel, Teklif Ekle (2)
 */
const BottomNav: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, userType } = useAuthStore();
  const { openAddProductModal } = useAddProduct();

  // Cacher la BottomNav sur la page de sélection ET les pages d'auth
  const hiddenPaths = ["/", "/customer/auth", "/merchant/auth"];
  if (hiddenPaths.includes(location.pathname)) {
    return null;
  }

  // Configuration des onglets selon le rôle
  const getNavItems = () => {
    // Utilisateur non connecté
    if (!user) {
      return [
        { icon: Search, label: "Teklifler", path: "/offers" },
        { icon: LogIn, label: "Giriş", path: "/customer/auth" },
        { icon: Store, label: "İşletmeler", path: "/for-merchants" },
      ];
    }

    // Marchand connecté - 2 onglets seulement
    if (userType === "merchant") {
      return [
        { icon: LayoutDashboard, label: "Panel", path: "/merchant/dashboard" },
        { icon: PlusCircle, label: "Teklif Ekle", path: "/merchant/dashboard", action: "openAddProduct" },
      ];
    }

    // Client connecté (par défaut) - 4 onglets
    return [
      { icon: Search, label: "Teklifler", path: "/offers" },
      { icon: Map, label: "Harita", path: "/map" },
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

  const handleNavigation = (path: string, action?: string) => {
    // Si action spéciale, exécuter l'action au lieu de naviguer
    if (action === "openAddProduct") {
      // S'assurer d'être sur le dashboard avant d'ouvrir la modale
      if (location.pathname !== "/merchant/dashboard") {
        navigate("/merchant/dashboard");
      }
      // Ouvrir la modale avec un petit délai pour permettre la navigation
      setTimeout(() => openAddProductModal(), 100);
      return;
    }
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
            isActive={!item.action && isActive(item.path)}
            onClick={() => handleNavigation(item.path, item.action)}
          />
        ))}
      </div>
    </nav>
  );
};

export default BottomNav;
