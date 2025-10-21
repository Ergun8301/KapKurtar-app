import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import { AddProductProvider } from "./contexts/AddProductContext";

// Pages principales
import HomePage from "./pages/HomePage";
import OffersPage from "./pages/OffersPage";
import CustomerAuthPage from "./pages/CustomerAuthPage";
import MerchantAuthPage from "./pages/MerchantAuthPage";
import ClientOnboardingPage from "./pages/ClientOnboardingPage";
import ProfileCompletePage from "./pages/ProfileCompletePage";
import MerchantDashboardPage from "./pages/MerchantDashboardPage";

// Page carte (nouvelle version unifiée)
import CustomerMapPage from "./pages/CustomerMapPage";

// Autres pages utiles
import DownloadPage from "./pages/DownloadPage";
import NotFoundPage from "./pages/NotFoundPage";

// Nouvelle page : Favoris ❤️
import FavoritesPage from "./pages/FavoritesPage";

function App() {
  return (
    <AddProductProvider>
      <Router>
        <div className="flex flex-col min-h-screen bg-white">
          <Header />
          <main className="flex-grow">
            <Routes>

              {/* 🏠 Accueil */}
              <Route path="/" element={<HomePage />} />

              {/* 🗺️ Offres et carte */}
              <Route path="/offers" element={<OffersPage />} />
              <Route path="/offers/map" element={<CustomerMapPage />} />

              {/* ❤️ Favoris */}
              <Route path="/favorites" element={<FavoritesPage />} />

              {/* 🔐 Authentification */}
              <Route path="/customer/auth" element={<CustomerAuthPage />} />
              <Route path="/merchant/auth" element={<MerchantAuthPage />} />

              {/* 👤 Parcours utilisateur */}
              <Route path="/onboarding" element={<ClientOnboardingPage />} />
              <Route path="/profile/complete" element={<ProfileCompletePage />} />

              {/* 🏪 Espace commerçant */}
              <Route path="/merchant/dashboard" element={<MerchantDashboardPage />} />

              {/* 📱 Téléchargement de l’app */}
              <Route path="/download" element={<DownloadPage />} />

              {/* 🚫 Redirection ancienne page */}
              <Route path="/customer/teaser" element={<Navigate to="/offers" replace />} />

              {/* 🚫 Page non trouvée */}
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
