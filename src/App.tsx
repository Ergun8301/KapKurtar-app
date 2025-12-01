import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
} from "react-router-dom";
import { HelmetProvider } from 'react-helmet-async';
import { Capacitor } from "@capacitor/core";
import { App as CapacitorApp } from "@capacitor/app";
import { Browser } from "@capacitor/browser";
import Header from "./components/Header";
import Footer from "./components/Footer";
import ScrollToTop from "./components/ScrollToTop";
import BottomNav from "./components/navigation/BottomNav";
import { AddProductProvider } from "./contexts/AddProductContext";
import { supabase } from "./lib/supabaseClient";

// ✅ Pages principales
import HomePage from "./pages/HomePage";
import OffersPage from "./pages/OffersPage";
import CustomerAuthPage from "./pages/CustomerAuthPage";
import MerchantAuthPage from "./pages/MerchantAuthPage";
import AuthCallbackPage from "./pages/AuthCallbackPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import MerchantForgotPasswordPage from "./pages/MerchantForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import ProfileCompletePage from "./pages/ProfileCompletePage";
import MerchantDashboardPage from "./pages/MerchantDashboardPage";
import ClientProfilePage from "./pages/ClientProfilePage";
import ClientDashboardPage from "./pages/ClientDashboardPage";
import UserTypeSelectionPage from "./pages/UserTypeSelectionPage";

// ✅ Pages utilisateurs
import FavoritesPage from "./pages/FavoritesPage";
import ReviewsPage from "./pages/ReviewsPage";
import DownloadPage from "./pages/DownloadPage";
import NotFoundPage from "./pages/NotFoundPage";

// ✅ Pages marketing
import FAQPage from "./pages/FAQPage";
import BlogPage from "./pages/BlogPage";
import ContactPage from "./pages/ContactPage";
import AboutPage from "./pages/AboutPage";
import ForMerchantsPage from "./pages/ForMerchantsPage";
import LegalPage from "./pages/LegalPage";
import CityPage from "./pages/CityPage";

// ✅ Articles blog
import BlogArticle4 from "./pages/BlogArticle4";
import BlogArticle5 from "./pages/BlogArticle5";
import BlogArticle6 from "./pages/BlogArticle6";
import BlogArticle7 from "./pages/BlogArticle7";
import BlogArticle8 from "./pages/BlogArticle8";
import BlogArticle9 from "./pages/BlogArticle9";
import BlogArticle10 from "./pages/BlogArticle10";

/* 🔗 Gère les deep links sur mobile natif */
function DeepLinkHandler() {
  const navigate = useNavigate();

  useEffect(() => {
    // Ne configurer que sur les plateformes natives
    if (!Capacitor.isNativePlatform()) {
      console.log('🔗 [DeepLink] Pas une plateforme native, skip');
      return;
    }

    console.log('🔗 [DeepLink] Configuration des listeners...');

    // Écouter les deep links entrants
    const setupDeepLinks = async () => {
      // Gérer l'URL qui a lancé l'app (si ouverte via deep link)
      console.log('🔗 [DeepLink] Vérification getLaunchUrl...');
      const appUrlOpen = await CapacitorApp.getLaunchUrl();
      console.log('🔗 [DeepLink] getLaunchUrl résultat:', appUrlOpen);
      if (appUrlOpen?.url) {
        console.log('🔗 [DeepLink] App lancée via deep link:', appUrlOpen.url);
        handleDeepLink(appUrlOpen.url);
      }

      // Écouter les deep links pendant que l'app est ouverte
      console.log('🔗 [DeepLink] Ajout listener appUrlOpen...');
      CapacitorApp.addListener('appUrlOpen', (event) => {
        console.log('🔗 [DeepLink] EVENT appUrlOpen reçu:', event.url);
        handleDeepLink(event.url);
      });

      console.log('🔗 [DeepLink] Setup terminé');
    };

    const handleDeepLink = async (url: string) => {
      try {
        console.log('🔗 [DeepLink] URL reçue (raw):', url);

        let path = '';
        let search = '';
        let hash = '';

        // Parser l'URL selon son format
        if (url.startsWith('com.kapkurtar.app:')) {
          // Custom scheme
          const withoutScheme = url.replace('com.kapkurtar.app:', '');
          const cleanPath = withoutScheme.replace(/^\/+/, '/');
          const hashIndex = cleanPath.indexOf('#');
          const searchIndex = cleanPath.indexOf('?');

          if (hashIndex !== -1) {
            hash = cleanPath.substring(hashIndex);
            path = searchIndex !== -1 ? cleanPath.substring(0, searchIndex) : cleanPath.substring(0, hashIndex);
            search = searchIndex !== -1 && searchIndex < hashIndex ? cleanPath.substring(searchIndex, hashIndex) : '';
          } else if (searchIndex !== -1) {
            path = cleanPath.substring(0, searchIndex);
            search = cleanPath.substring(searchIndex);
          } else {
            path = cleanPath;
          }
        } else {
          // URL standard (https://kapkurtar.com/...)
          const urlObj = new URL(url);
          path = urlObj.pathname;
          search = urlObj.search;
          hash = urlObj.hash;
        }

        console.log('🔗 [DeepLink] Parsed - path:', path, 'search:', search, 'hash:', hash ? 'present (tokens)' : 'empty');

        // 🔐 Si le hash contient des tokens OAuth, établir la session Supabase
        if (hash && hash.includes('access_token')) {
          console.log('🔗 [DeepLink] Tokens OAuth détectés, extraction...');

          // Extraire les tokens du hash (#access_token=xxx&refresh_token=yyy&...)
          const hashParams = new URLSearchParams(hash.substring(1)); // Retirer le #
          const accessToken = hashParams.get('access_token');
          const refreshToken = hashParams.get('refresh_token');

          console.log('🔗 [DeepLink] access_token présent:', !!accessToken);
          console.log('🔗 [DeepLink] refresh_token présent:', !!refreshToken);

          if (accessToken) {
            console.log('🔗 [DeepLink] Appel setSession...');

            // Établir la session Supabase avec les tokens
            const { data, error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken || '',
            });

            console.log('🔗 [DeepLink] setSession terminé');

            if (error) {
              console.error('🔗 [DeepLink] Erreur setSession:', error.message);
            } else {
              console.log('🔗 [DeepLink] ✅ Session établie pour:', data.user?.email);

              // Fermer le browser in-app
              try {
                console.log('🔗 [DeepLink] Fermeture browser...');
                await Browser.close();
                console.log('🔗 [DeepLink] Browser fermé');
              } catch {
                // Ignorer si le browser n'était pas ouvert
              }

              // 🔄 Forcer un rechargement complet pour rafraîchir l'état auth
              console.log('🔗 [DeepLink] Redirection vers /auth/callback...');
              window.location.href = '/auth/callback' + search;
              return;
            }
          }
        }

        // Fermer le browser pour les autres deep links
        try {
          await Browser.close();
        } catch {
          // Ignorer
        }

        // Navigation standard pour les autres deep links
        const fullPath = path + search + hash;
        console.log('🔗 [DeepLink] Navigation vers:', fullPath);
        navigate(fullPath);
      } catch (error) {
        console.error('❌ [DeepLink] Erreur parsing:', error);
      }
    };

    setupDeepLinks();

    // Cleanup listener
    return () => {
      CapacitorApp.removeAllListeners();
    };
  }, [navigate]);

  return null;
}

/* 🔁 Vérifie la session et redirige selon le rôle */
function SessionRedirect() {
  const nav = useNavigate();
  const location = useLocation();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    (async () => {
      // ✅ Ne pas rediriger si on est déjà sur ces pages protégées
      const noRedirectPaths = [
        '/client/profile',
        '/merchant/dashboard',
        '/customer/dashboard',
        '/customer/auth',
        '/merchant/auth',
        '/forgot-password',
        '/merchant/forgot-password',
        '/reset-password',
        '/auth/callback',
        '/profile/complete'
      ];
      
      if (noRedirectPaths.includes(location.pathname)) {
        setChecked(true);
        return;
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();
      
      if (!user) {
        setChecked(true);
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("role, first_name, last_name")
        .eq("auth_id", user.id)
        .single();

      if (!error && data?.role === "merchant") {
        nav("/merchant/dashboard");
      } else if (!error && data?.role === "client") {
        // ✅ Vérifier si le profil est complet AVANT de rediriger
        if (!data.first_name || !data.last_name) {
          // Profil incomplet → NE PAS rediriger
          setChecked(true);
          return;
        }
        // Profil complet → rediriger vers offres
        nav("/offers");
      }
      setChecked(true);
    })();
  }, [nav, location.pathname]);

  if (!checked) return null;
  return null;
}

function App() {
  // Détecter si on est sur mobile natif (Android/iOS via Capacitor)
  const isNative = Capacitor.isNativePlatform();

  // Ajouter classe native-app sur html pour CSS global
  useEffect(() => {
    if (isNative) {
      document.documentElement.classList.add('native-app');
    }
    return () => {
      document.documentElement.classList.remove('native-app');
    };
  }, [isNative]);

  return (
    <HelmetProvider>
      <AddProductProvider>
        <Router>
          <div className={`flex flex-col bg-white ${isNative ? 'h-screen overflow-hidden' : 'min-h-screen'}`}>
            <Header />
            {/* Spacer pour compenser le header fixe (64px + 25px safe area sur natif) */}
            <div style={{ height: isNative ? '89px' : '64px' }} />
            <ScrollToTop />
            {/* 🔗 Handler pour les deep links sur mobile */}
            <DeepLinkHandler />
            {/* Main avec padding-bottom pour la BottomNav sur mobile natif */}
            <main
              className="flex-grow"
              style={{ paddingBottom: isNative ? '110px' : '0px' }}
            >
              <SessionRedirect />
              <Routes>
              {/* 🏠 Accueil - Page de sélection sur mobile natif, HomePage sur web */}
              <Route path="/" element={isNative ? <UserTypeSelectionPage /> : <HomePage />} />

              {/* 🗺️ Offres */}
              <Route path="/offers" element={<OffersPage />} />

              {/* 👤 Profils clients */}
              <Route path="/client/profile" element={<ClientProfilePage />} />
              <Route path="/customer/dashboard" element={<ClientDashboardPage />} />

              {/* ❤️ Favoris */}
              <Route path="/favorites" element={<FavoritesPage />} />

              {/* ⭐ Avis */}
              <Route path="/reviews" element={<ReviewsPage />} />

              {/* 🔐 Authentification */}
              <Route path="/customer/auth" element={<CustomerAuthPage />} />
              <Route path="/merchant/auth" element={<MerchantAuthPage />} />
              <Route path="/auth/callback" element={<AuthCallbackPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/merchant/forgot-password" element={<MerchantForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />

              {/* 👤 Compléter profil */}
              <Route path="/profile/complete" element={<ProfileCompletePage />} />

              {/* 🏪 Tableau de bord marchand */}
              <Route path="/merchant/dashboard" element={<MerchantDashboardPage />} />

              {/* 📱 Téléchargement */}
              <Route path="/download" element={<DownloadPage />} />

              {/* 📚 Pages marketing */}
              <Route path="/faq" element={<FAQPage />} />
              <Route path="/blog" element={<BlogPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/for-merchants" element={<ForMerchantsPage />} />
              <Route path="/legal" element={<LegalPage />} />

              {/* 🏙️ Pages villes (SEO local) */}
              <Route path="/istanbul" element={<CityPage city="istanbul" cityTurkish="İstanbul" />} />
              <Route path="/ankara" element={<CityPage city="ankara" cityTurkish="Ankara" />} />
              <Route path="/izmir" element={<CityPage city="izmir" cityTurkish="İzmir" />} />
              <Route path="/antalya" element={<CityPage city="antalya" cityTurkish="Antalya" />} />
              <Route path="/bursa" element={<CityPage city="bursa" cityTurkish="Bursa" />} />

              {/* 📰 Articles blog individuels */}
              <Route path="/blog/4" element={<BlogArticle4 />} />
              <Route path="/blog/5" element={<BlogArticle5 />} />
              <Route path="/blog/6" element={<BlogArticle6 />} />
              <Route path="/blog/7" element={<BlogArticle7 />} />
              <Route path="/blog/8" element={<BlogArticle8 />} />
              <Route path="/blog/9" element={<BlogArticle9 />} />
              <Route path="/blog/10" element={<BlogArticle10 />} />

              {/* 🚫 Redirections anciennes */}
              <Route
                path="/customer/teaser"
                element={<Navigate to="/offers" replace />}
              />

              {/* 404 */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </main>
          {/* Footer visible uniquement sur web (pas sur mobile natif) */}
          {!isNative && <Footer />}
          {/* BottomNav visible uniquement sur mobile natif */}
          {isNative && <BottomNav />}
        </div>
      </Router>
    </AddProductProvider>
    </HelmetProvider>
  );
}

export default App;