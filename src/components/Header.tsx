import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, ChevronDown, User, Settings, LogOut, ArrowRight, Store, LayoutDashboard, Plus, TrendingUp, Bell } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabaseClient';
import { useAddProduct } from '../contexts/AddProductContext';
import { NotificationBell } from './NotificationBell';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading } = useAuth();
  const { openAddProductModal } = useAddProduct();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMerchant, setIsMerchant] = useState(false);

  useEffect(() => {
    const checkUserType = async () => {
      if (!user) {
        setIsMerchant(false);
        return;
      }

      const { data: merchantData } = await supabase
        .from('merchants')
        .select('id')
        .eq('id', user.id)
        .maybeSingle();

      setIsMerchant(!!merchantData);
    };

    checkUserType();
  }, [user]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setIsUserMenuOpen(false);
    navigate('/');
  };

  const getUserDisplayName = () => {
    return user?.email?.split('@')[0] || 'User';
  };

  const navigation = [
    { name: 'Explore Offers', href: '/offers' },
    { name: 'For Merchants', href: '/merchant/info' },
    { name: 'Download App', href: '/download' },
  ];

  const isMerchantPage = location.pathname.startsWith('/merchant/');

  return (
    <>
      <header className="bg-white shadow-sm border-b sticky top-0 z-40">
        <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <a href="/" className="flex items-center">
                  <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center mr-2">
                    <span className="text-white font-bold text-lg">R</span>
                  </div>
                  <span className="font-bold text-xl text-gray-900">ResQ Food</span>
                </a>
              </div>
            </div>

            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-8">
                {navigation.map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    className="text-gray-600 hover:text-green-500 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    {item.name}
                  </a>
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {loading ? (
                <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
              ) : user ? (
                <>
                  <NotificationBell />
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
                    <span className="hidden sm:block font-medium">{getUserDisplayName()}</span>
                    <ChevronDown className="w-4 h-4" />
                  </button>

                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                      {isMerchant ? (
                        <>
                          <button
                            onClick={() => {
                              setIsUserMenuOpen(false);
                              navigate('/merchant/dashboard');
                            }}
                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            <LayoutDashboard className="w-4 h-4 mr-2" />
                            My Dashboard
                          </button>
                          <button
                            onClick={() => {
                              setIsUserMenuOpen(false);
                              navigate('/merchant/stats');
                            }}
                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            <TrendingUp className="w-4 h-4 mr-2" />
                            Statistics
                          </button>
                          <button
                            onClick={() => {
                              setIsUserMenuOpen(false);
                              openAddProductModal();
                            }}
                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Add Product
                          </button>
                          <button
                            onClick={() => {
                              setIsUserMenuOpen(false);
                              navigate('/merchant/profile');
                            }}
                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            <Store className="w-4 h-4 mr-2" />
                            Business Profile
                          </button>
                          <button
                            onClick={() => {
                              setIsUserMenuOpen(false);
                              navigate('/merchant/settings');
                            }}
                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            <Settings className="w-4 h-4 mr-2" />
                            Settings
                          </button>
                        </>
                      ) : (
                        <>
                          <a
                            href="/profile"
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            <User className="w-4 h-4 mr-2" />
                            My Profile
                          </a>
                          <a
                            href="/settings"
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            <Settings className="w-4 h-4 mr-2" />
                            Settings
                          </a>
                          <a
                            href="/notifications"
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            <Bell className="w-4 h-4 mr-2" />
                            Notifications
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
                          navigate('/customer/auth');
                        }}
                        className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <User className="w-4 h-4 mr-3" />
                        <div className="text-left">
                          <div className="font-medium">Customer Login</div>
                          <div className="text-xs text-gray-500">Access exclusive offers</div>
                        </div>
                        <ArrowRight className="w-4 h-4 ml-auto" />
                      </button>
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          navigate('/merchant/auth');
                        }}
                        className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <Store className="w-4 h-4 mr-3" />
                        <div className="text-left">
                          <div className="font-medium">Merchant Login</div>
                          <div className="text-xs text-gray-500">Manage your business</div>
                        </div>
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
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </nav>

        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navigation.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-green-500 hover:bg-gray-50"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </a>
              ))}
            </div>
          </div>
        )}
      </header>
    </>
  );
};

export default Header;
