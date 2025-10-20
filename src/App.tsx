import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';

// Pages principales
import HomePage from './pages/HomePage';
import OffersPage from './pages/OffersPage';
import CustomerAuthPage from './pages/CustomerAuthPage';
import MerchantAuthPage from './pages/MerchantAuthPage';
import ClientOnboardingPage from './pages/ClientOnboardingPage';
import ProfileCompletePage from './pages/ProfileCompletePage';
import MerchantDashboardPage from './pages/MerchantDashboardPage';

// Page carte (nouvelle version unifiée)
import CustomerMapPage from './pages/CustomerMapPage';

// Autres pages utiles
import DownloadPage from './pages/DownloadPage';
import NotFoundPage from './pages/NotFoundPage'; // ✅ présent et fonctionnel

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-white">
        <Header />
        <main className="flex-grow">
          <Routes>

            {/* 🏠 Accueil */}
            <Route path="/" element={<HomePage />} />

            {/* 🗺️ Page carte / offres */}
            <Route path="/offers" element={<OffersPage />} />
            <Route path="/offers/map" element={<CustomerMapPage />} />

            {/* 🔐 Auth */}
            <Route path="/customer/auth" element={<CustomerAuthPage />} />
            <Route path="/merchant/auth" element={<MerchantAuthPage />} />

            {/* 👤 Parcours utilisateur */}
            <Route path="/onboarding" element={<ClientOnboardingPage />} />
            <Route path="/profile/complete" element={<ProfileCompletePage />} />

            {/* 🏪 Espace marchand */}
            <Route path="/merchant/dashboard" element={<MerchantDashboardPage />} />

            {/* 📱 Téléchargement app */}
            <Route path="/download" element={<DownloadPage />} />

            {/* 🚫 Ancienne page teaser supprimée */}
            <Route path="/customer/teaser" element={<Navigate to="/offers" replace />} />

            {/* 404 */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
