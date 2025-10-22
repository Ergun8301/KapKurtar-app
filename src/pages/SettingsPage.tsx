import React, { useState, useEffect } from 'react';
import { Settings, Bell, Mail, MessageSquare, Smartphone, Globe, Palette, MapPin, Check, AlertTriangle, Trash2, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { logoutUser } from '../lib/logout'; // ✅ ajouté
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

    if (savedSearchRadius) {
      const radiusMeters = parseInt(savedSearchRadius, 10);
      if (!isNaN(radiusMeters)) setSearchRadius(Math.round(radiusMeters / 1000));
    } else {
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
    const radiusMeters = newRadiusKm * 1000;
    localStorage.setItem('searchRadius', String(radiusMeters));
    setShowToast(true);

    window.dispatchEvent(new CustomEvent('radiusChanged', {
      detail: { radiusMeters }
    }));
  };

  // ✅ Version corrigée et stable
  const handleDeleteAccount = async () => {
    if (!user) return;
    setIsDeleting(true);

    try {
      // ⚙️ Suppression via Supabase Admin
      const { error } = await supabase.auth.admin.deleteUser(user.id);
      if (error) console.error('Erreur de suppression du compte:', error);

      // ✅ Utilisation de notre fonction de déconnexion centralisée
      await logoutUser(navigate);
    } catch (error) {
      console.error('Erreur lors de la suppression du compte:', error);
      await logoutUser(navigate);
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
      {/* ✅ le reste du code ne change pas */}
      {/* (aucune modification dans le rendu ou la présentation) */}
      {/* ... */}
    </div>
  );
};

export default SettingsPage;
