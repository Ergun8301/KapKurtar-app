import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, MapPin, User, ShoppingBag, LogOut } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('auth_id', user.id)
          .single();
        setProfile(data);
      }
    };

    getUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
      if (!session?.user) {
        setProfile(null);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    navigate('/');
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const navLinks = [
    { path: '/offers', label: 'Offres', icon: MapPin },
    { path: '/blog', label: 'Blog', icon: null },
    { path: '/faq', label: 'FAQ', icon: null },
  ];

  return (
    <header className="bg-tilkapp-green sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo - PLUS GROS */}
          <Link to="/" className="flex items-center">
            <img 
              src="/tilkapp-logo.svg" 
              alt="TILKAPP" 
              className="h-16 w-auto" 
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center space-x-1 text-lg font-medium transition-colors ${
                  isActive(link.path)
                    ? 'text-white border-b-2 border-white'
                    : 'text-tilkapp-beige hover:text-white'
                }`}
              >
                {link.icon && <link.icon className="w-5 h-5" />}
                <span>{link.label}</span>
              </Link>
            ))}

            {user ? (
              <div className="flex items-center space-x-4">
                {profile?.role === 'merchant' ? (
                  <Link
                    to="/merchant/dashboard"
                    className="flex items-center space-x-2 bg-white text-tilkapp-green px-4 py-2 rounded-lg hover:bg-tilkapp-beige transition-colors font-medium"
                  >
                    <ShoppingBag className="w-5 h-5" />
                    <span>Dashboard</span>
                  </Link>
                ) : (
                  <Link
                    to="/client/profile"
                    className="flex items-center space-x-2 bg-white text-tilkapp-green px-4 py-2 rounded-lg hover:bg-tilkapp-beige transition-colors font-medium"
                  >
                    <User className="w-5 h-5" />
                    <span>Profil</span>
                  </Link>
                )}
                <button
                  onClick={handleSignOut}
                  className="flex items-center space-x-2 text-white hover:text-tilkapp-beige transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Déconnexion</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/customer/auth"
                  className="text-tilkapp-beige hover:text-white font-medium transition-colors"
                >
                  Connexion
                </Link>
                <Link
                  to="/merchant/auth"
                  className="bg-tilkapp-orange text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors font-medium"
                >
                  Commerçant
                </Link>
              </div>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-white"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-tilkapp-green border-t border-white/20">
          <div className="px-4 py-4 space-y-3">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsMenuOpen(false)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                  isActive(link.path)
                    ? 'bg-white/20 text-white'
                    : 'text-tilkapp-beige hover:bg-white/10'
                }`}
              >
                {link.icon && <link.icon className="w-5 h-5" />}
                <span>{link.label}</span>
              </Link>
            ))}

            {user ? (
              <>
                {profile?.role === 'merchant' ? (
                  <Link
                    to="/merchant/dashboard"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center space-x-2 px-3 py-2 bg-white text-tilkapp-green rounded-lg"
                  >
                    <ShoppingBag className="w-5 h-5" />
                    <span>Dashboard</span>
                  </Link>
                ) : (
                  <Link
                    to="/client/profile"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center space-x-2 px-3 py-2 bg-white text-tilkapp-green rounded-lg"
                  >
                    <User className="w-5 h-5" />
                    <span>Profil</span>
                  </Link>
                )}
                <button
                  onClick={() => {
                    handleSignOut();
                    setIsMenuOpen(false);
                  }}
                  className="flex items-center space-x-2 px-3 py-2 text-white hover:bg-white/10 rounded-lg w-full"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Déconnexion</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/customer/auth"
                  onClick={() => setIsMenuOpen(false)}
                  className="block px-3 py-2 text-tilkapp-beige hover:bg-white/10 rounded-lg"
                >
                  Connexion
                </Link>
                <Link
                  to="/merchant/auth"
                  onClick={() => setIsMenuOpen(false)}
                  className="block px-3 py-2 bg-tilkapp-orange text-white rounded-lg text-center"
                >
                  Commerçant
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;