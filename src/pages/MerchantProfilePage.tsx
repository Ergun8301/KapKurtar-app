import React, { useState, useEffect } from 'react';
import {
  Plus, X, Upload, Package, Clock, Pause, Play, Trash2,
  CreditCard as Edit, Bell, ChevronDown, ChevronUp
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabaseClient';
import { useAddProduct } from '../contexts/AddProductContext';
import { uploadImageToSupabase } from '../lib/uploadImage';
import { GeolocationButton } from '../components/GeolocationButton';
import { NotificationBell } from '../components/NotificationBell';
import { useRealtimeNotifications } from '../hooks/useRealtimeNotifications';
import { type Notification } from '../api/notifications';

interface Offer {
  id: string;
  title: string;
  description: string;
  image_url: string | null;
  price_before: number;
  price_after: number;
  discount_percent: number | null;
  available_from: string;
  available_until: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  quantity: number;
}

const MerchantDashboardPage = () => {
  const { user } = useAuth();
  const { showAddProductModal, openAddProductModal, closeAddProductModal } = useAddProduct();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [editingOffer, setEditingOffer] = useState<Offer | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [togglingOfferId, setTogglingOfferId] = useState<string | null>(null);
  const [showNotifications, setShowNotifications] = useState(true);
  const { notifications, unreadCount } = useRealtimeNotifications(user?.id || null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image: null as File | null,
    imagePreview: '',
    price_before: '',
    price_after: '',
    quantity: '',
    available_from: '',
    available_until: '',
    startNow: true,
    duration: '2h',
    customDuration: ''
  });

  useEffect(() => {
    loadOffers();
    if (!user) return;

    const channel = supabase
      .channel('merchant-offers-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'offers', filter: `merchant_id=eq.${user.id}` },
        () => loadOffers()
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [user]);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const loadOffers = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('offers')
        .select('*')
        .eq('merchant_id', user.id)
        .order('updated_at', { ascending: false });
      if (error) throw error;
      setOffers(data || []);
    } catch (error: any) {
      setToast({ message: error.message || 'Erreur chargement produits', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const calculateDiscount = (priceBefore: string, priceAfter: string): number => {
    const before = parseFloat(priceBefore);
    const after = parseFloat(priceAfter);
    if (!before || !after || before <= 0) return 0;
    return Math.round(((before - after) / before) * 100);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const MAX_SIZE = 5 * 1024 * 1024;
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/heic', 'image/heif', 'image/avif'];

      if (file.size > MAX_SIZE) {
        setToast({ message: 'Image trop volumineuse (max. 5 Mo).', type: 'error' });
        return;
      }
      if (!validTypes.includes(file.type.toLowerCase())) {
        setToast({ message: 'Format non pris en charge (JPG, PNG, WEBP, HEIC, AVIF).', type: 'error' });
        return;
      }

      setFormData({ ...formData, image: file });
      const reader = new FileReader();
      reader.onloadend = () => setFormData(prev => ({ ...prev, imagePreview: reader.result as string }));
      reader.readAsDataURL(file);
    }
  };

  const handlePublish = async () => {
    if (!user) return;
    if (!formData.title.trim() || !formData.price_before || !formData.price_after || !formData.quantity) {
      setToast({ message: 'Tous les champs obligatoires doivent être remplis.', type: 'error' });
      return;
    }

    setIsPublishing(true);
    try {
      let imageUrl = null;
      if (formData.image) {
        const randomId = crypto.randomUUID();
        const imagePath = `${user.id}/${randomId}.jpg`;
        imageUrl = await uploadImageToSupabase(formData.image, 'product-images', imagePath);
      }

      const offerData = {
        merchant_id: user.id,
        title: formData.title,
        description: formData.description,
        image_url: imageUrl,
        price_before: parseFloat(formData.price_before),
        price_after: parseFloat(formData.price_after),
        quantity: parseInt(formData.quantity),
        available_from: formData.available_from,
        available_until: formData.available_until,
        is_active: true
      };

      const { data, error } = await supabase.from('offers').insert([offerData]).select().single();
      if (error) throw error;

      setOffers([data, ...offers]);
      closeAddProductModal();
      setToast({ message: '✅ Produit ajouté avec succès', type: 'success' });
    } catch (error: any) {
      setToast({ message: error.message || 'Erreur lors de la publication', type: 'error' });
    } finally {
      setIsPublishing(false);
    }
  };

  const handleUpdateOffer = async () => {
    if (!user || !editingOffer) return;
    setIsPublishing(true);
    try {
      let imageUrl = editingOffer.image_url;
      if (formData.image) {
        const randomId = crypto.randomUUID();
        const imagePath = `${user.id}/${randomId}.jpg`;
        imageUrl = await uploadImageToSupabase(formData.image, 'product-images', imagePath);
      }

      const updatedData = {
        title: formData.title,
        description: formData.description,
        image_url: imageUrl,
        price_before: parseFloat(formData.price_before),
        price_after: parseFloat(formData.price_after),
        quantity: parseInt(formData.quantity),
        available_from: formData.available_from,
        available_until: formData.available_until
      };

      const { data, error } = await supabase
        .from('offers')
        .update(updatedData)
        .eq('id', editingOffer.id)
        .eq('merchant_id', user.id)
        .select()
        .single();

      if (error) throw error;
      setOffers(offers.map(o => (o.id === editingOffer.id ? data : o)));
      setToast({ message: '✅ Produit mis à jour avec succès', type: 'success' });
    } catch (error: any) {
      setToast({ message: error.message || 'Erreur de mise à jour', type: 'error' });
    } finally {
      setIsPublishing(false);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50">
      {toast && (
        <div
          className={`fixed top-4 right-4 z-[9999] px-6 py-3 rounded-lg shadow-lg text-white ${
            toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
          }`}
        >
          {toast.message}
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Mes Produits</h2>
            <p className="text-gray-600 mt-1">{offers.length} produits au total</p>
          </div>
          <div className="flex items-center gap-4">
            <NotificationBell />
            {user && (
              <GeolocationButton
                userRole="merchant"
                userId={user.id}
                onSuccess={() => setToast({ message: 'Position mise à jour ✅', type: 'success' })}
              />
            )}
            <button
              onClick={openAddProductModal}
              className="flex items-center px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium shadow-sm"
            >
              <Plus className="w-5 h-5 mr-2" />
              Ajouter un produit
            </button>
          </div>
        </div>

        {showAddProductModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-screen overflow-y-auto">
              <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Nouveau produit</h2>
                <button onClick={closeAddProductModal} className="text-gray-400 hover:text-gray-600">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nom du produit</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Ex: Box de croissants frais"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Décris ton produit..."
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Image du produit</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                    {formData.imagePreview ? (
                      <div className="relative">
                        <img src={formData.imagePreview} alt="Preview" className="max-h-48 mx-auto rounded" />
                        <button
                          onClick={() =>
                            setFormData({ ...formData, image: null, imagePreview: '' })
                          }
                          className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <label className="cursor-pointer">
                        <Upload className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">Prendre une photo ou importer</p>
                        <input
                          type="file"
                          accept="image/*"
                          capture="environment"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                </div>

                <button
                  onClick={handlePublish}
                  disabled={isPublishing}
                  className="w-full py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium"
                >
                  {isPublishing ? 'Publication...' : 'Publier'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MerchantDashboardPage;
