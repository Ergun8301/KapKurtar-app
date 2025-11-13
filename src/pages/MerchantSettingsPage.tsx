import React, { useState, useEffect } from 'react';
import { Settings, Bell, Package, TrendingDown, Check, AlertTriangle, Trash2, X, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabaseClient';

const MerchantSettingsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [newReservationNotif, setNewReservationNotif] = useState(false);
  const [stockLowNotif, setStockLowNotif] = useState(false);
  const [promoExpiringNotif, setPromoExpiringNotif] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const savedNewReservation = localStorage.getItem('merchant_newReservationNotif');
    const savedStockLow = localStorage.getItem('merchant_stockLowNotif');
    const savedPromoExpiring = localStorage.getItem('merchant_promoExpiringNotif');

    if (savedNewReservation !== null) setNewReservationNotif(savedNewReservation === 'true');
    if (savedStockLow !== null) setStockLowNotif(savedStockLow === 'true');
    if (savedPromoExpiring !== null) setPromoExpiringNotif(savedPromoExpiring === 'true');
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
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-tilkapp-blue focus:ring-offset-2 ${
        value ? 'bg-tilkapp-blue' : 'bg-gray-300'
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
          <div className="fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg bg-tilkapp-blue text-white flex items-center">
            <Check className="w-5 h-5 mr-2" />
            Settings updated
          </div>
        )}

        <button
          onClick={() => navigate('/merchant/dashboard')}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Dashboard
        </button>

        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
              <Settings className="w-6 h-6 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          </div>

          <div className="space-y-8">
            <div className="border-t pt-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <Bell className="w-5 h-5 text-blue-600 mr-2" />
                Notifications
              </h2>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                      <Bell className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">New reservation</p>
                      <p className="text-sm text-gray-600">Get notified when customers reserve your products</p>
                    </div>
                  </div>
                  <ToggleButton
                    value={newReservationNotif}
                    onClick={() => handleToggle('merchant_newReservationNotif', newReservationNotif, setNewReservationNotif)}
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                      <Package className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Stock low</p>
                      <p className="text-sm text-gray-600">Alert when product quantity is running low</p>
                    </div>
                  </div>
                  <ToggleButton
                    value={stockLowNotif}
                    onClick={() => handleToggle('merchant_stockLowNotif', stockLowNotif, setStockLowNotif)}
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center mr-4">
                      <TrendingDown className="w-5 h-5 text-yellow-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Promo expiring</p>
                      <p className="text-sm text-gray-600">Reminder before your promotions expire</p>
                    </div>
                  </div>
                  <ToggleButton
                    value={promoExpiringNotif}
                    onClick={() => handleToggle('merchant_promoExpiringNotif', promoExpiringNotif, setPromoExpiringNotif)}
                  />
                </div>
              </div>
            </div>

            <div className="border-t pt-6">
              <h2 className="text-xl font-semibold text-red-600 mb-6 flex items-center">
                <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
                Danger zone
              </h2>

              <div className="p-6 bg-red-50 rounded-lg border-2 border-red-200">
                <div className="flex items-start mb-4">
                  <AlertTriangle className="w-6 h-6 text-red-600 mr-3 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-red-900 mb-2">Delete your merchant account</h3>
                    <p className="text-red-700 text-sm mb-4">
                      Deleting your account will permanently remove your business profile, all products,
                      and customer interactions. This action cannot be undone.
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
                  <strong>Note:</strong> Your notification preferences are saved locally in your browser.
                  They will apply across all your sessions on this device.
                </p>
              </div>
            </div>
          </div>
        </div>

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
                    Are you sure you want to delete your merchant account?
                  </p>
                  <p className="text-red-600 text-sm">
                    This action cannot be undone. All your business data, products, and customer
                    interactions will be permanently removed.
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

export default MerchantSettingsPage;
