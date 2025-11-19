import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Menu,
  X,
  ChevronDown,
  User,
  Settings,
  LogOut,
  ArrowRight,
  Store,
  LayoutDashboard,
  Bell,
  Package,
  Download,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { supabase } from "../lib/supabaseClient";
import { NotificationBell } from "./NotificationBell";
import { logoutUser } from "../lib/logout";
import { useAddProduct } from "../contexts/AddProductContext";
import DownloadAppModal from "./DownloadAppModal";

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading } = useAuth();
  const { openAddProductModal } = useAddProduct();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMerchant, setIsMerchant] = useState<boolean | null>(null);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const hasCheckedRef = useRef(false);

  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user || hasCheckedRef.current) return;
    
    const checkUserType = async () => {
      hasCheckedRef.current = true;

      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("id")
        .eq("auth_id", user.id)
        .maybeSingle();

      if (profileError || !profileData) {
        setIsMerchant(false);
        return;
      }

      const { data: merchantData } = await supabase
        .from("merchants")
        .select("id")
        .eq("profile_id", profileData.id)
        .maybeSingle();

      setIsMerchant(!!merchantData);
    };

    checkUserType();
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };

    if (isUserMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isUserMenuOpen]);

  const handleSignOut = async () => {
    await logoutUser(navigate);
    setIsUserMenuOpen(false);
  };

  const getUserDisplayName = () => user?.email?.split("@")[0] || "User";

  const navigation = [
    { name: "Teklifleri Keşfet", href: "/offers" },
    { name: "İşletmeler İçin", href: "/for-merchants" },
  ];

  if (user && isMerchant === null) return null;

  return (
    <header className="bg-[#00A690] shadow-sm border-b border-[#00A690] sticky top-0 z-40">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <a href="/" className="flex items-center space-x-3">
            <img
              src="https://zhabjdyzawffsmvziojl.supabase.co/storage/v1/object/public/logos/KK%20fond%20vert%20(4).png"
              alt="KapKurtar"
              className="h-14 w-auto md:h-24 lg:h-32"
            />
          </a>
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              {navigation.map((item) => (
                <a key={item.name} href={item.href} className="text-[#F7F2E7] hover:text-[#F75C00] px-3 py-2 rounded-md text-sm font-medium transition-colors duration-300">
                  {item.name}
                </a>
              ))}
              <button
                onClick={() => setShowDownloadModal(true)}
                className="bg-[#00A690] text-white hover:bg-[#F75C00] px-4 py-2 rounded-md text-sm font-medium transition-colors duration-300 border border-white/20 flex items-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Uygulamayı İndir</span>
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {loading ? (
              <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
            ) : user ? (
              <>
                <NotificationBell userType={isMerchant ? "merchant" : "client"} />
                <div className="relative" ref={userMenuRef}>
                  <button onClick={() => setIsUserMenuOpen(!isUserMenuOpen)} className="flex items-center space-x-2 text-[#F7F2E7] hover:text-[#F75C00] transition-colors duration-300">
                    <div className="w-8 h-8 bg-[#F7F2E7] rounded-full flex items-center justify-center">
                      {isMerchant ? <Store className="w-4 h-4 text-[#00A690]" /> : <User className="w-4 h-4 text-[#00A690]" />}
                    </div>
                    <span className="hidden sm:block font-medium">{getUserDisplayName()}</span>
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                      {isMerchant ? (
                        <>
                          <button onClick={() => { setIsUserMenuOpen(false); navigate("/merchant/dashboard"); }} className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                            <LayoutDashboard className="w-4 h-4 mr-2" />
                            Kontrol Paneli
                          </button>
                          <button onClick={() => { setIsUserMenuOpen(false); window.dispatchEvent(new CustomEvent("openMerchantProfileModal")); }} className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                            <Settings className="w-4 h-4 mr-2" />
                            Ayarlar
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => {
                              setIsUserMenuOpen(false);
                              navigate("/customer/dashboard");
                            }}
                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            <Package className="w-4 h-4 mr-2" />
                            Rezervasyonlarım
                          </button>
                          <button
                            onClick={() => {
                              setIsUserMenuOpen(false);
                              navigate("/client/profile");
                            }}
                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            <User className="w-4 h-4 mr-2" />
                            Profilim
                          </button>
                        </>
                      )}
                      <hr className="my-1" />
                      <button onClick={handleSignOut} className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                        <LogOut className="w-4 h-4 mr-2" />
                        Çıkış Yap
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="relative" ref={userMenuRef}>
                <button onClick={() => setIsUserMenuOpen(!isUserMenuOpen)} className="bg-[#F7F2E7] text-[#00A690] px-4 py-2 rounded-lg font-bold hover:bg-[#F75C00] hover:text-white transition-colors duration-300 inline-flex items-center">
                  Giriş Yap
                  <ChevronDown className="w-4 h-4 ml-1" />
                </button>
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                    <div className="px-4 py-2 text-xs text-gray-500 uppercase tracking-wide font-semibold">Hesap Türünü Seçin</div>
                    <button onClick={() => { setIsUserMenuOpen(false); navigate("/customer/auth"); }} className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-100">
                      <User className="w-4 h-4 mr-3" />
                      Müşteri Girişi
                      <ArrowRight className="w-4 h-4 ml-auto" />
                    </button>
                    <button onClick={() => { setIsUserMenuOpen(false); navigate("/merchant/auth"); }} className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-100">
                      <Store className="w-4 h-4 mr-3" />
                      İşletme Girişi
                      <ArrowRight className="w-4 h-4 ml-auto" />
                    </button>
                  </div>
                )}
              </div>
            )}
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden p-2 rounded-md text-[#F7F2E7] hover:text-white transition-colors duration-300">
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </nav>

      {/* ✅ MENU MOBILE - C'ÉTAIT ÇA QUI MANQUAIT */}
      {isMenuOpen && (
        <div className="md:hidden bg-[#00A690] border-t border-white/20">
          <div className="px-4 py-4 space-y-3">
            {navigation.map((item) => (

               <a key={item.name}
                href={item.href}
                onClick={() => setIsMenuOpen(false)}
                className="block px-3 py-2 text-[#F7F2E7] hover:text-white hover:bg-white/10 rounded-lg transition-colors duration-300"
              >
                {item.name}
              </a>
            ))}

            <button
              onClick={() => {
                setShowDownloadModal(true);
                setIsMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 text-[#F7F2E7] hover:text-white hover:bg-white/10 rounded-lg transition-colors duration-300 flex items-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Uygulamayı İndir</span>
            </button>

            {!user && (
              <>
                <hr className="border-white/20 my-2" />
                <a
                  href="/customer/auth"
                  onClick={() => setIsMenuOpen(false)}
                  className="block px-3 py-2 text-[#F7F2E7] hover:text-white hover:bg-white/10 rounded-lg transition-colors duration-300"
                >
                  Müşteri Girişi
                </a>
                <a
                  href="/merchant/auth"
                  onClick={() => setIsMenuOpen(false)}
                  className="block px-3 py-2 text-[#F7F2E7] hover:text-white hover:bg-white/10 rounded-lg transition-colors duration-300"
                >
                  İşletme Girişi
                </a>
              </>
            )}
          </div>
        </div>
      )}

      {/* Download App Modal */}
      <DownloadAppModal
        isOpen={showDownloadModal}
        onClose={() => setShowDownloadModal(false)}
      />
    </header>
  );
};

export default Header;