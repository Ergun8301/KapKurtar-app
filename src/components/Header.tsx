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
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { supabase } from "../lib/supabaseClient";
import { NotificationBell } from "./NotificationBell";
import { logoutUser } from "../lib/logout";
import { useAddProduct } from "../contexts/AddProductContext";

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading } = useAuth();
  const { openAddProductModal } = useAddProduct();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMerchant, setIsMerchant] = useState<boolean | null>(null);
  const hasCheckedRef = useRef(false);

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

  const handleSignOut = async () => {
    await logoutUser(navigate);
    setIsUserMenuOpen(false);
  };

  const getUserDisplayName = () =>
    user?.email?.split("@")[0] || "User";

  const navigation = [
    { name: "Explore Offers", href: "/offers" },
    { name: "For Merchants", href: "/merchant/info" },
    { name: "Download App", href: "/download" },
  ];

  if (user && isMerchant === null) return null;

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-40">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <a href="/" className="flex items-center">
            <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center mr-2">
              <span className="text-white font-bold text-lg">R</span>
            </div>
            <span className="font-bold text-xl text-gray-900">ResQ Food</span>
          </a>

          <div className="ml-10 flex items-baseline space-x-8">
              {navigation.map((item) => (
                
                  key={item.name}
                  href={item.href}
                  className="text-gray-600 hover:text-green-500 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  {item.name}
                </a>
              ))}
            </div>

          <div className="flex items-center space-x-4">
            {loading ? (
              <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
            ) : user ? (
              <>
                <NotificationBell userType={isMerchant ? "merchant" : "client"} />
                
                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center space-x-2 text-gray-700 hover:text-green-500 transition-colors"
                  >
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      {isMerchant ? (
                        <Store className="w-4 h-4 text-green-600" />
                      ) : (
                        <User className="w-4 h-4 text-green-600" />
                      )}
                    </div>
                    <span className="hidden sm:block font-medium">
                      {getUserDisplayName()}
                    </span>
                    <ChevronDown className="w-4 h-4" />
                  </button>

                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                      {isMerchant ? (
                        <>
                          <button
                            onClick={() => {
                              setIsUserMenuOpen(false);
                              navigate("/merchant/dashboard");
                            }}
                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            <LayoutDashboard className="w-4 h-4 mr-2" />
                            Dashboard
                          </button>
                          <button
                            onClick={() => {
                              setIsUserMenuOpen(false);
                              const event = new CustomEvent("openMerchantProfileModal");
                              window.dispatchEvent(event);
                            }}
                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            <Settings className="w-4 h-4 mr-2" />
                            Settings
                          </button>
                        </>
                      ) : (
                        <>
                          
                            href="/profile"
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            <User className="w-4 h-4 mr-2" />
                            My Profile
                          </a>
                          
                            href="/settings"
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            <Settings className="w-4 h-4 mr-2" />
                            Settings
                          </a>
                        </>
                      )}

                      <hr className="my-1" />

                      <button
                        onClick={handleSignOut}
                        className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="bg-green-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-600 transition-colors inline-flex items-center"
                >
                  Sign In
                  <ChevronDown className="w-4 h-4 ml-1" />
                </button>
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                    <div className="px-4 py-2 text-xs text-gray-500 uppercase tracking-wide font-semibold">
                      Choose Account Type
                    </div>
                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        navigate("/customer/auth");
                      }}
                      className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <User className="w-4 h-4 mr-3" />
                      Customer Login
                      <ArrowRight className="w-4 h-4 ml-auto" />
                    </button>
                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        navigate("/merchant/auth");
                      }}
                      className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <Store className="w-4 h-4 mr-3" />
                      Merchant Login
                      <ArrowRight className="w-4 h-4 ml-auto" />
                    </button>
                  </div>
                )}
              </div>
            )}

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
            >
              {isMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;