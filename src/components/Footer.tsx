import React from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, MapPin, ArrowRight } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="relative bg-[#00A690] text-white overflow-hidden">
      {/* Vague SVG animée en haut */}
      <div className="absolute top-0 left-0 right-0 h-16 overflow-hidden">
        <svg
          className="w-full h-full"
          viewBox="0 0 1440 80"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
        >
          <path
            d="M0,40 C240,10 480,70 720,40 C960,10 1200,70 1440,40 L1440,0 L0,0 Z"
            fill="url(#wave-gradient)"
            className="animate-wave"
          />
          <defs>
            <linearGradient id="wave-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#F75C00" />
              <stop offset="50%" stopColor="#FF6B1A" />
              <stop offset="100%" stopColor="#F75C00" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Contenu principal */}
      <div className="relative pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Grid 3 colonnes avec glass morphism */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">

            {/* SECTION 1 - Logo & Identité */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
              {/* Logo carré */}
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl w-32 h-32 flex items-center justify-center mb-6 border border-white/20">
                <img
                  src="https://zhabjdyzawffsmvziojl.supabase.co/storage/v1/object/public/logos/FAVICON%20MINI%20ss%20fond.png"
                  alt="KapKurtar"
                  className="h-24 w-auto"
                />
              </div>

              {/* Nom & Slogan */}
              <h3 className="text-2xl font-bold mb-3">KapKurtar</h3>
              <p className="text-white/90 text-base leading-relaxed mb-6">
                Gıda israfını birlikte azaltalım
              </p>

              {/* Réseaux sociaux */}
              <div className="flex space-x-3">
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-lg flex items-center justify-center border border-white/20 hover:bg-[#F75C00] hover:border-[#F75C00] hover:rotate-6 hover:scale-110 transition-all duration-300"
                  aria-label="Facebook"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-lg flex items-center justify-center border border-white/20 hover:bg-[#F75C00] hover:border-[#F75C00] hover:rotate-6 hover:scale-110 transition-all duration-300"
                  aria-label="Twitter"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                  </svg>
                </a>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-lg flex items-center justify-center border border-white/20 hover:bg-[#F75C00] hover:border-[#F75C00] hover:rotate-6 hover:scale-110 transition-all duration-300"
                  aria-label="Instagram"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
              </div>
            </div>

            {/* SECTION 2 - Navigation */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
              <h4 className="text-sm font-bold uppercase tracking-wider mb-2">NAVIGATION</h4>
              <div className="w-12 h-0.5 bg-[#F75C00] mb-6"></div>

              <nav className="space-y-3">
                <Link
                  to="/"
                  className="flex items-center text-white/90 hover:text-white hover:translate-x-1 transition-all duration-300 group"
                >
                  <ArrowRight className="w-4 h-4 mr-2 text-[#F75C00] group-hover:translate-x-1 transition-transform" />
                  <span>Ana Sayfa</span>
                </Link>
                <Link
                  to="/offers"
                  className="flex items-center text-white/90 hover:text-white hover:translate-x-1 transition-all duration-300 group"
                >
                  <ArrowRight className="w-4 h-4 mr-2 text-[#F75C00] group-hover:translate-x-1 transition-transform" />
                  <span>Teklifleri Keşfet</span>
                </Link>
                <Link
                  to="/for-merchants"
                  className="flex items-center text-white/90 hover:text-white hover:translate-x-1 transition-all duration-300 group"
                >
                  <ArrowRight className="w-4 h-4 mr-2 text-[#F75C00] group-hover:translate-x-1 transition-transform" />
                  <span>İşletmeler İçin</span>
                </Link>
                <Link
                  to="/blog"
                  className="flex items-center text-white/90 hover:text-white hover:translate-x-1 transition-all duration-300 group"
                >
                  <ArrowRight className="w-4 h-4 mr-2 text-[#F75C00] group-hover:translate-x-1 transition-transform" />
                  <span>Blog</span>
                </Link>
                <Link
                  to="/faq"
                  className="flex items-center text-white/90 hover:text-white hover:translate-x-1 transition-all duration-300 group"
                >
                  <ArrowRight className="w-4 h-4 mr-2 text-[#F75C00] group-hover:translate-x-1 transition-transform" />
                  <span>SSS</span>
                </Link>
                <Link
                  to="/contact"
                  className="flex items-center text-white/90 hover:text-white hover:translate-x-1 transition-all duration-300 group"
                >
                  <ArrowRight className="w-4 h-4 mr-2 text-[#F75C00] group-hover:translate-x-1 transition-transform" />
                  <span>Bize Ulaşın</span>
                </Link>
              </nav>
            </div>

            {/* SECTION 3 - Contact & Apps */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
              <h4 className="text-sm font-bold uppercase tracking-wider mb-2">BAĞLANTI</h4>
              <div className="w-12 h-0.5 bg-[#F75C00] mb-6"></div>

              {/* Contact */}
              <div className="space-y-4 mb-8">
                <a
                  href="https://wa.me/33685507985?text=Merhaba%20KapKurtar"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start space-x-3 text-white/90 hover:text-white transition-colors group"
                >
                  <MessageCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-[#F75C00] group-hover:scale-110 transition-transform" />
                  <div>
                    <div className="font-medium">WhatsApp</div>
                    <div className="text-sm">+33 6 85 50 79 85</div>
                  </div>
                </a>

                <div className="flex items-start space-x-3 text-white/90">
                  <MapPin className="w-5 h-5 flex-shrink-0 mt-0.5 text-[#F75C00]" />
                  <div>
                    <div className="font-medium">Antalya</div>
                    <div className="text-sm">Türkiye</div>
                  </div>
                </div>
              </div>

              {/* Séparateur */}
              <div className="w-full h-px bg-white/20 mb-6"></div>

              {/* Apps */}
              <h5 className="text-sm font-bold uppercase tracking-wider mb-4">UYGULAMA</h5>
              <div className="space-y-3">
                <button
                  disabled
                  className="w-full flex items-center justify-center gap-2 bg-white/10 border border-white/30 text-white/60 px-4 py-3 rounded-lg cursor-not-allowed"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.5,12.92 20.16,13.19L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z"/>
                  </svg>
                  <span className="text-sm font-medium">Google Play</span>
                </button>

                <button
                  disabled
                  className="w-full flex items-center justify-center gap-2 bg-white/10 border border-white/30 text-white/60 px-4 py-3 rounded-lg cursor-not-allowed"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.71,19.5C17.88,20.74 17,21.95 15.66,21.97C14.32,22 13.89,21.18 12.37,21.18C10.84,21.18 10.37,21.95 9.1,22C7.79,22.05 6.8,20.68 5.96,19.47C4.25,17 2.94,12.45 4.7,9.39C5.57,7.87 7.13,6.91 8.82,6.88C10.1,6.86 11.32,7.75 12.11,7.75C12.89,7.75 14.37,6.68 15.92,6.84C16.57,6.87 18.39,7.1 19.56,8.82C19.47,8.88 17.39,10.1 17.41,12.63C17.44,15.65 20.06,16.66 20.09,16.67C20.06,16.74 19.67,18.11 18.71,19.5M13,3.5C13.73,2.67 14.94,2.04 15.94,2C16.07,3.17 15.6,4.35 14.9,5.19C14.21,6.04 13.07,6.7 11.95,6.61C11.8,5.46 12.36,4.26 13,3.5Z"/>
                  </svg>
                  <span className="text-sm font-medium">App Store</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Barre du bas */}
      <div className="bg-[#008C7A] border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0 text-sm">
            <p className="text-white/80">
              © 2025 KapKurtar. Tüm hakları saklıdır.
            </p>
            <div className="flex space-x-6">
              <Link to="/legal" className="text-white/80 hover:text-white transition-colors">
                Gizlilik Politikası
              </Link>
              <Link to="/legal" className="text-white/80 hover:text-white transition-colors">
                Kullanım Koşulları
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
