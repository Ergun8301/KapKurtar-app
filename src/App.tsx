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
import CustomerMapPage from "./pages/CustomerMapPage";

// Pages utilisateurs
import FavoritesPage from "./pages/FavoritesPage";
import CustomerHistoryPage from "./pages/CustomerHistoryPage";
import ReviewsPage from "./pages/ReviewsPage";

import DownloadPage from "./pages/DownloadPage";
import NotFoundPage from "./pages/NotFoundPage";

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

              {/* 🗺️ Offres */}
              <Route path="/offers" element={<OffersPage />} />
              <Route path="/offers/map" element={<CustomerMapPage />} />

              {/* ❤️ Favoris */}
              <Route path="/favorites" element={<FavoritesPage />} />

              {/* 🕒 Historique */}
              <Route path="/history" element={<CustomerHistoryPage />} />

              {/* ⭐ Avis */}
              <Route path="/reviews" element={<ReviewsPage />} />

              {/* 🔐 Auth */}
              <Route path="/customer/auth" element={<CustomerAuthPage />} />
              <Route path="/merchant/auth" element={<MerchantAuthPage />} />

              {/* 👤 Onboarding */}
              <Route path="/onboarding" element={<ClientOnboardingPage />} />
              <Route path="/profile/complete" element={<ProfileCompletePage />} />

              {/* 🏪 Marchands */}
              <Route path="/merchant/dashboard" element={<MerchantDashboardPage />} />

              {/* 📱 Téléchargement */}
              <Route path="/download" element={<DownloadPage />} />

              {/* 🚫 Anciennes routes */}
              <Route path="/customer/teaser" element={<Navigate to="/offers" replace />} />

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
