import React, { useState, useEffect } from 'react';
import { Settings, Bell, Mail, MessageSquare, Smartphone, Globe, Palette, MapPin, Check, AlertTriangle, Trash2, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../hooks/useAuth';

const SettingsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [emailAlerts, setEmailAlerts] = useState(false);
  const [inAppPopups, setInAppPopups] = useState(false);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [language, setLanguage] = useState('FR');
  const [theme, setTheme] = useState('light');
  const [searchRadius, setSearchRadius] = useState(10);
  const [showToast, setShowToast] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const savedEmailAlerts = localStorage.getItem('emailAlerts');
    const savedInAppPopups = localStorage.getItem('inAppPopups');
    const savedSmsNotifications = localStorage.getItem('smsNotifications');
    const savedLanguage = localStorage.getItem('language');
    const savedTheme = localStorage.getItem('theme');
    const savedSearchRadius = localStorage.getItem('searchRadius');

    if (savedEmailAlerts !== null) setEmailAlerts(savedEmailAlerts === 'true');
    if (savedInAppPopups !== null) setInAppPopups(savedInAppPopups === 'true');
    if (savedSmsNotifications !== null) setSmsNotifications(savedSmsNotifications === 'true');
    if (savedLanguage) setLanguage(savedLanguage);
    if (savedTheme) setTheme(savedTheme);

    // Load radius from localStorage (stored in meters, display in km)
    if (savedSearchRadius) {
      const radiusMeters = parseInt(savedSearchRadius, 10);
      if (!isNaN(radiusMeters)) {
        setSearchRadius(Math.round(radiusMeters / 1000));
      }
    } else {
      // Initialize with default 10km = 10000m
      localStorage.setItem('searchRadius', '10000');
    }
  }, []);

  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => setShowToast(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  const handleToggle = (key: string, currentValue: boolean, setter: (value: boolean) => void) => {
    const newValue = !currentValue;
    setter(newValue);
    localStorage.setItem(key, String(newValue));
    setShowToast(true);
  };

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLanguage = e.target.value;
    setLanguage(newLanguage);
    localStorage.setItem('language', newLanguage);
    setShowToast(true);
  };

  const handleThemeToggle = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    setShowToast(true);
  };

  const handleRadiusChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newRadiusKm = Number(e.target.value);
    setSearchRadius(newRadiusKm);
    // Convert km to meters for storage
    const radiusMeters = newRadiusKm * 1000;
    localStorage.setItem('searchRadius', String(radiusMeters));
    setShowToast(true);

    // Dispatch custom event to notify other components
    window.dispatchEvent(new CustomEvent('radiusChanged', {
      detail: { radiusMeters }
    }));
  };

  const handleDeleteAccount = async () => {
    if (!user) return;

    setIsDeleting(true);
    try {
      const { error } = await supabase.auth.admin.deleteUser(user.id);

      if (error) {
        const { error: signOutError } = await supabase.auth.signOut();
        if (signOutError) throw signOutError;
      }

      localStorage.clear();
      setTimeout(() => {
        navigate('/');
      }, 1000);
    } catch (error: any) {
      console.error('Error deleting account:', error);
      setTimeout(async () => {
        await supabase.auth.signOut();
        localStorage.clear();
        navigate('/');
      }, 1500);
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const ToggleButton = ({ value, onClick }: { value: boolean; onClick: () => void }) => (
    <button
      onClick={onClick}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${
        value ? 'bg-green-500' : 'bg-gray-300'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          value ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {showToast && (
          <div className="fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg bg-green-500 text-white flex items-center">
            <Check className="w-5 h-5 mr-2" />
            Settings updated
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
              <Settings className="w-6 h-6 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          </div>

          <div className="space-y-8">
            {/* Notifications Section */}
            <div className="border-t pt-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <Bell className="w-5 h-5 text-green-600 mr-2" />
                Notifications
              </h2>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                      <Mail className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Email alerts</p>
                      <p className="text-sm text-gray-600">Receive important updates via email</p>
                    </div>
                  </div>
                  <ToggleButton
                    value={emailAlerts}
                    onClick={() => handleToggle('emailAlerts', emailAlerts, setEmailAlerts)}
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mr-4">
                      <MessageSquare className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">In-app pop-ups</p>
                      <p className="text-sm text-gray-600">Show notifications within the app</p>
                    </div>
                  </div>
                  <ToggleButton
                    value={inAppPopups}
                    onClick={() => handleToggle('inAppPopups', inAppPopups, setInAppPopups)}
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-4">
                      <MessageSquare className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">SMS notifications</p>
                      <p className="text-sm text-gray-600">Get text messages for urgent updates</p>
                    </div>
                  </div>
                  <ToggleButton
                    value={smsNotifications}
                    onClick={() => handleToggle('smsNotifications', smsNotifications, setSmsNotifications)}
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-100 rounded-lg border border-gray-300 opacity-60 cursor-not-allowed">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center mr-4">
                      <Smartphone className="w-5 h-5 text-gray-500" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-700">Mobile push (coming soon)</p>
                      <p className="text-sm text-gray-500">Push notifications on your mobile device</p>
                    </div>
                  </div>
                  <button
                    disabled
                    className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-300 cursor-not-allowed"
                  >
                    <span className="inline-block h-4 w-4 transform rounded-full bg-white translate-x-1" />
                  </button>
                </div>
              </div>
            </div>

            {/* Preferences Section */}
            <div className="border-t pt-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <Settings className="w-5 h-5 text-green-600 mr-2" />
                Preferences
              </h2>

              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center mb-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                        <Globe className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Language</p>
                        <p className="text-sm text-gray-600">Choose your preferred language</p>
                      </div>
                    </div>
                  </div>
                  <select
                    value={language}
                    onChange={handleLanguageChange}
                    className="w-full mt-2 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="FR">French (Français)</option>
                    <option value="EN">English</option>
                    <option value="TR">Turkish (Türkçe)</option>
                  </select>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center mr-4">
                      <Palette className="w-5 h-5 text-yellow-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Theme</p>
                      <p className="text-sm text-gray-600">
                        {theme === 'light' ? 'Light mode' : 'Dark mode'}
                      </p>
                    </div>
                  </div>
                  <ToggleButton value={theme === 'dark'} onClick={handleThemeToggle} />
                </div>

                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-4">
                        <MapPin className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Search radius</p>
                        <p className="text-sm text-gray-600">How far to search for offers ({searchRadius} km)</p>
                      </div>
                    </div>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="50"
                    value={searchRadius}
                    onChange={handleRadiusChange}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-500"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-2">
                    <span>1 km</span>
                    <span>50 km</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Danger Zone Section */}
            <div className="border-t pt-6">
              <h2 className="text-xl font-semibold text-red-600 mb-6 flex items-center">
                <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
                Danger zone
              </h2>

              <div className="p-6 bg-red-50 rounded-lg border-2 border-red-200">
                <div className="flex items-start mb-4">
                  <AlertTriangle className="w-6 h-6 text-red-600 mr-3 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-red-900 mb-2">Delete your account</h3>
                    <p className="text-red-700 text-sm mb-4">
                      Deleting your account will permanently remove your data. This action cannot be undone.
                      All your reservations, favorites, and points will be lost forever.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete my account
                </button>
              </div>
            </div>

            <div className="border-t pt-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-blue-800 text-sm">
                  <strong>Note:</strong> Your preferences are saved locally in your browser.
                  They will apply across all your sessions on this device.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Delete Account Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Delete Account</h2>
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="mb-6">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                  <p className="text-red-800 font-medium mb-2">
                    Are you sure you want to delete your account?
                  </p>
                  <p className="text-red-600 text-sm">
                    This action cannot be undone. All your data will be permanently removed.
                  </p>
                </div>
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                  disabled={isDeleting}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={isDeleting}
                  className="flex-1 px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isDeleting ? 'Deleting...' : 'Delete Account'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingsPage;
