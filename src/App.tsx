import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";

import Header from "./components/Header";
import Footer from "./components/Footer";
import { AddProductProvider } from "./contexts/AddProductContext";
import { supabase } from "./lib/supabaseClient";

// ✅ Pages principales
import HomePage from "./pages/HomePage";
import OffersPage from "./pages/OffersPage";
import CustomerAuthPage from "./pages/CustomerAuthPage";
import MerchantAuthPage from "./pages/MerchantAuthPage";
import AuthCallbackPage from "./pages/AuthCallbackPage";
import ProfileCompletePage from "./pages/ProfileCompletePage";
import MerchantDashboardPage from "./pages/MerchantDashboardPage";

// ✅ Pages utilisateurs
import FavoritesPage from "./pages/FavoritesPage";
import ReviewsPage from "./pages/ReviewsPage";
import DownloadPage from "./pages/DownloadPage";
import NotFoundPage from "./pages/NotFoundPage";

// ✅ Page de test notifications
import TestNotificationsPage from "./pages/TestNotificationsPage";

/* 🔁 Vérifie la session et redirige selon le rôle */
function SessionRedirect() {
  const nav = useNavigate();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setChecked(true);
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("auth_id", user.id)
        .single();

      if (!error && data?.role === "merchant") {
        nav("/merchant/dashboard");
      } else if (!error && data?.role === "client") {
        nav("/offers");
      }

      setChecked(true);
    })();
  }, [nav]);

  if (!checked) return null;
  return null;
}

function App() {
  return (
    <AddProductProvider>
      <Router>
        <div className="flex flex-col min-h-screen bg-white">
          <Header />
          <main className="flex-grow">
            <SessionRedirect />
            <Routes>
              {/* 🏠 Accueil */}
              <Route path="/" element={<HomePage />} />

              {/* 🗺️ Offres */}
              <Route path="/offers" element={<OffersPage />} />

              {/* ❤️ Favoris */}
              <Route path="/favorites" element={<FavoritesPage />} />

              {/* ⭐ Avis */}
              <Route path="/reviews" element={<ReviewsPage />} />

              {/* 🔐 Authentification */}
              <Route path="/customer/auth" element={<CustomerAuthPage />} />
              <Route path="/merchant/auth" element={<MerchantAuthPage />} />
              <Route path="/auth/callback" element={<AuthCallbackPage />} />

              {/* 👤 Compléter profil */}
              <Route path="/profile/complete" element={<ProfileCompletePage />} />

              {/* 🏪 Tableau de bord marchand */}
              <Route
                path="/merchant/dashboard"
                element={<MerchantDashboardPage />}
              />

              {/* 📱 Téléchargement */}
              <Route path="/download" element={<DownloadPage />} />

              {/* 🔔 Page de test notifications */}
              <Route
                path="/test-notifications"
                element={<TestNotificationsPage />}
              />

              {/* 🚫 Redirections anciennes */}
              <Route
                path="/customer/teaser"
                element={<Navigate to="/offers" replace />}
              />

              {/* 404 */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AddProductProvider>
  );
}

export default App;
