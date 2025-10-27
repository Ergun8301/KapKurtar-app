import React, { useState, useEffect } from 'react';
import { Plus, X, Upload, Package, Clock, Pause, Play, Trash2, CreditCard as Edit, Bell, ChevronDown, ChevronUp } from 'lucide-react';
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
  discount_percent: number | null; // GENERATED column in DB (read-only, computed from price_before/price_after)
  available_from: string;
  available_until: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  quantity: number;
}

const MerchantDashboardPage = () => {
    useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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
    const checkExpiredOffers = async () => {
      try {
        await supabase.rpc('auto_expire_offers');
        console.log('Fonction auto_expire_offers exécutée avec succès');
      } catch (error) {
        console.error('Erreur lors de la vérification des offres expirées :', error);
      }
    };

    checkExpiredOffers();
    loadOffers();

    // Subscribe to realtime updates for merchant's offers
    if (!user) return;

    console.log('Subscribing to realtime updates for merchant offers...');
    const channel = supabase
      .channel('merchant-offers-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'offers',
          filter: `merchant_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Merchant offers table changed:', payload);
          loadOffers();
        }
      )
      .subscribe();

    return () => {
      console.log('Unsubscribing from merchant offers realtime...');
      supabase.removeChannel(channel);
    };
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
      console.error('Error loading offers:', error);
      setToast({ message: error.message || 'Failed to load offers', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const getOfferStatus = (offer: Offer): 'active' | 'paused' | 'expired' => {
    const now = new Date();
    const availableUntil = new Date(offer.available_until);

    if (now > availableUntil) return 'expired';
    if (!offer.is_active) return 'paused';
    return 'active';
  };

  const calculateTimeLeft = (endDate: string) => {
    const now = new Date();
    const end = new Date(endDate);
    const diff = end.getTime() - now.getTime();

    if (diff < 0) return 'Expired';

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return days + ' day' + (days > 1 ? 's' : '') + ' left';
    }
    if (hours > 0) return hours + 'h ' + minutes + 'm left';
    return minutes + 'm left';
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (name === 'duration' || name === 'customDuration') {
      updateEndDate(value, name === 'duration' ? 'duration' : 'custom');
    }
  };

  const calculateDiscount = (priceBefore: string, priceAfter: string): number => {
    const before = parseFloat(priceBefore);
    const after = parseFloat(priceAfter);
    if (!before || !after || before <= 0) return 0;
    return Math.round(((before - after) / before) * 100);
  };

  const updateEndDate = (durationValue: string, type: 'duration' | 'custom') => {
    const startDate = formData.startNow ? new Date() : new Date(formData.available_from);
    if (isNaN(startDate.getTime())) return;

    let minutes = 0;
    if (type === 'duration') {
      switch(durationValue) {
        case '30min': minutes = 30; break;
        case '1h': minutes = 60; break;
        case '2h': minutes = 120; break;
        case '4h': minutes = 240; break;
        case 'allday':
          const endOfDay = new Date(startDate);
          endOfDay.setHours(23, 59, 0, 0);
          setFormData(prev => ({
            ...prev,
            available_until: endOfDay.toISOString().slice(0, 16)
          }));
          return;
        case 'custom':
          minutes = parseInt(formData.customDuration) || 0;
          break;
        default:
          return;
      }
    } else {
      minutes = parseInt(durationValue) || 0;
    }

    const endDate = new Date(startDate.getTime() + minutes * 60000);
    setFormData(prev => ({
      ...prev,
      available_until: endDate.toISOString().slice(0, 16)
    }));
  };

  const handleStartNowChange = (checked: boolean) => {
    setFormData(prev => {
      const newData = { ...prev, startNow: checked };
      if (checked) {
        const now = new Date();
        newData.available_from = now.toISOString().slice(0, 16);
      }
      return newData;
    });
    if (checked && formData.duration) {
      setTimeout(() => updateEndDate(formData.duration, 'duration'), 0);
    }
  };

  useEffect(() => {
    const now = new Date();
    const twoHoursLater = new Date(now.getTime() + 120 * 60000);
    setFormData(prev => ({
      ...prev,
      available_from: now.toISOString().slice(0, 16),
      available_until: twoHoursLater.toISOString().slice(0, 16)
    }));
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const MAX_SIZE = 5 * 1024 * 1024;
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/heic', 'image/heif', 'image/avif'];

      if (file.size > MAX_SIZE) {
        setToast({ message: 'Image trop volumineuse (max. 5 Mo). Réduis la taille ou compresse-la avant d\'envoyer.', type: 'error' });
        return;
      }

      if (!validTypes.includes(file.type.toLowerCase())) {
        setToast({ message: 'Format non pris en charge. Formats acceptés : JPG, PNG, WEBP, HEIC, HEIF, AVIF.', type: 'error' });
        return;
      }

      setFormData({ ...formData, image: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, imagePreview: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePublish = async () => {
    if (!user) {
      console.error('User not authenticated');
      setToast({ message: 'Please log in to create an offer', type: 'error' });
      return;
    }

    // Validate required fields
    if (!formData.title.trim()) {
      setToast({ message: 'Title is required', type: 'error' });
      return;
    }

    if (!formData.price_before || parseFloat(formData.price_before) <= 0) {
      setToast({ message: 'Valid price before is required', type: 'error' });
      return;
    }

    if (!formData.price_after || parseFloat(formData.price_after) <= 0) {
      setToast({ message: 'Valid price after is required', type: 'error' });
      return;
    }

    if (!formData.quantity || parseInt(formData.quantity) <= 0) {
      setToast({ message: 'Valid quantity is required', type: 'error' });
      return;
    }

    if (parseFloat(formData.price_after) >= parseFloat(formData.price_before)) {
      setToast({ message: 'Discounted price must be lower than original price', type: 'error' });
      return;
    }

    console.log('Creating new offer...', {
      merchant_id: user.id,
      title: formData.title,
      price_before: formData.price_before,
      price_after: formData.price_after,
      quantity: formData.quantity
    });

    setIsPublishing(true);
    try {
      // Trouver le profil lié à l'utilisateur connecté
      console.log('🔍 Recherche du profil pour auth_id:', user.id);
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('auth_id', user.id)
        .maybeSingle();

      if (profileError || !profileData) {
        console.error('❌ Impossible de trouver le profil lié à cet utilisateur', profileError);
        setToast({ message: 'Erreur : profil introuvable', type: 'error' });
        setIsPublishing(false);
        return;
      }

      console.log('✅ Profil trouvé, profile.id:', profileData.id);

      // Trouver le marchand correspondant à ce profil
      console.log('🔍 Recherche du marchand pour profile_id:', profileData.id);
      const { data: merchantData, error: merchantError } = await supabase
        .from('merchants')
        .select('id')
        .eq('profile_id', profileData.id)
        .maybeSingle();

      if (merchantError || !merchantData) {
        console.error('❌ Impossible de trouver le marchand lié à ce profil', {
          profile_id: profileData.id,
          error: merchantError,
          merchantData
        });
        setToast({ message: 'Erreur : marchand introuvable', type: 'error' });
        setIsPublishing(false);
        return;
      }

      console.log('✅ Marchand trouvé, merchant.id:', merchantData.id);

      let imageUrl = null;
      if (formData.image) {
        console.log('Uploading image to Supabase storage...');
        const randomId = crypto.randomUUID();
const path = `${user.id}/${randomId}.jpg`;
imageUrl = await uploadImageToSupabase(formData.image, 'product-images', path);
        console.log('Image uploaded successfully:', imageUrl);
      }

      const discountPercent = calculateDiscount(formData.price_before, formData.price_after);
      console.log('Calculated discount:', discountPercent + '%');

      const offerData = {
        merchant_id: merchantData.id,
        title: formData.title,
        description: formData.description,
        image_url: imageUrl,
        price_before: parseFloat(formData.price_before),
        price_after: parseFloat(formData.price_after),
        quantity: parseInt(formData.quantity),
        available_from: formData.available_from,
        available_until: formData.available_until,
        is_active: true
        // NOTE: discount_percent is a GENERATED column in DB - do NOT send it
      };

      console.log('Inserting offer into Supabase:', offerData);

      const { data, error } = await supabase
        .from('offers')
        .insert([offerData])
        .select()
        .single();

      if (error) {
        console.error('Supabase insert error:', error);
        throw error;
      }

      console.log('✅ Offer created successfully:', data);
      console.log('Offer ID:', data.id);
      console.log('Created at:', data.created_at);

      // Verify audit log entry was created
      const { data: auditLog, error: auditError } = await supabase
        .from('audit_log')
        .select('*')
        .eq('table_name', 'offers')
        .eq('record_id', data.id)
        .eq('action', 'INSERT')
        .maybeSingle();

      if (auditLog) {
        console.log('✅ Audit log entry created:', auditLog);
        console.log('Audit log new_data:', auditLog.new_data);
      } else if (auditError) {
        console.warn('Could not verify audit log:', auditError);
      }

      setOffers([data, ...offers]);
      closeAddProductModal();
      setFormData({
        title: '',
        description: '',
        image: null,
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
      setToast({ message: '✅ Offer added successfully', type: 'success' });
    } catch (error: any) {
      console.error('❌ Error publishing offer:', error);
      setToast({ message: error.message || 'Failed to publish offer', type: 'error' });
    } finally {
      setIsPublishing(false);
    }
  };

  const toggleOfferStatus = async (offerId: string, currentStatus: boolean) => {
    if (!user) {
      console.error('User not authenticated');
      setToast({ message: 'Please log in to update offer status', type: 'error' });
      return;
    }

    // Prevent double-clicks
    if (togglingOfferId === offerId) {
      console.log('Already toggling this offer, ignoring...');
      return;
    }

    const newStatus = !currentStatus;
    const actionText = newStatus ? 'Activating' : 'Pausing';

    console.log(`${actionText} offer...`, {
      offer_id: offerId,
      old_status: currentStatus,
      new_status: newStatus
    });

    setTogglingOfferId(offerId);

    try {
      console.log('Updating is_active in Supabase...');
      const { data, error } = await supabase
        .from('offers')
        .update({ is_active: newStatus })
        .eq('id', offerId)
        .eq('merchant_id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Supabase update error:', error);
        throw error;
      }

      console.log('✅ Offer status updated successfully:', data);
      console.log('New is_active value:', data.is_active);

      // Verify audit log entry was created
      const { data: auditLog, error: auditError } = await supabase
        .from('audit_log')
        .select('*')
        .eq('table_name', 'offers')
        .eq('record_id', offerId)
        .eq('action', 'UPDATE')
        .order('changed_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (auditLog) {
        console.log('✅ Audit log entry created:', auditLog);
        console.log('Audit log old_data.is_active:', auditLog.old_data?.is_active);
        console.log('Audit log new_data.is_active:', auditLog.new_data?.is_active);
      } else if (auditError) {
        console.warn('Could not verify audit log:', auditError);
      } else {
        console.warn('No audit log entry found for this update');
      }

      // Update local state immediately
      setOffers(offers.map(o => o.id === offerId ? data : o));

      const successMessage = newStatus ? '✅ Offer activated' : '✅ Offer paused';
      setToast({ message: successMessage, type: 'success' });
    } catch (error: any) {
      console.error('❌ Error updating offer status:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      });
      setToast({ message: '❌ Failed to update offer status', type: 'error' });
    } finally {
      setTogglingOfferId(null);
    }
  };

  const deleteOffer = async (offerId: string) => {
    if (!user || !confirm('Are you sure you want to delete this product?')) return;

    try {
      const { error } = await supabase
        .from('offers')
        .delete()
        .eq('id', offerId)
        .eq('merchant_id', user.id);

      if (error) throw error;

      setOffers(offers.filter(o => o.id !== offerId));
      setToast({ message: 'Product deleted', type: 'success' });
    } catch (error: any) {
      console.error('Error deleting offer:', error);
      setToast({ message: error.message || 'Failed to delete product', type: 'error' });
    }
  };

  const openEditModal = (offer: Offer) => {
    console.log('Opening edit modal for offer:', offer);
    setEditingOffer(offer);
    setFormData({
      title: offer.title,
      description: offer.description,
      image: null,
      imagePreview: offer.image_url || '',
      price_before: offer.price_before.toString(),
      price_after: offer.price_after.toString(),
      quantity: offer.quantity.toString(),
      available_from: offer.available_from,
      available_until: offer.available_until,
      startNow: false,
      duration: '2h',
      customDuration: ''
    });
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setEditingOffer(null);
    setFormData({
      title: '',
      description: '',
      image: null,
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
  };

  const handleUpdateOffer = async () => {
    if (!user || !editingOffer) {
      console.error('User not authenticated or no offer selected');
      setToast({ message: 'Cannot update offer', type: 'error' });
      return;
    }

    // Validate required fields
    if (!formData.title.trim()) {
      setToast({ message: 'Title is required', type: 'error' });
      return;
    }

    if (!formData.price_before || parseFloat(formData.price_before) <= 0) {
      setToast({ message: 'Valid price before is required', type: 'error' });
      return;
    }

    if (!formData.price_after || parseFloat(formData.price_after) <= 0) {
      setToast({ message: 'Valid price after is required', type: 'error' });
      return;
    }

    if (!formData.quantity || parseInt(formData.quantity) < 0) {
      setToast({ message: 'Valid quantity is required', type: 'error' });
      return;
    }

    if (parseFloat(formData.price_after) >= parseFloat(formData.price_before)) {
      setToast({ message: 'Discounted price must be lower than original price', type: 'error' });
      return;
    }

    console.log('=== BEFORE UPDATE ===');
    console.log('Old offer data:', {
      id: editingOffer.id,
      title: editingOffer.title,
      description: editingOffer.description,
      price_before: editingOffer.price_before,
      price_after: editingOffer.price_after,
      quantity: editingOffer.quantity,
      discount_percent: editingOffer.discount_percent
    });

    setIsPublishing(true);
    try {
      // Trouver le profil lié à l'utilisateur connecté
      console.log('🔍 Recherche du profil pour auth_id:', user.id);
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('auth_id', user.id)
        .maybeSingle();

      if (profileError || !profileData) {
        console.error('❌ Impossible de trouver le profil lié à cet utilisateur', profileError);
        setToast({ message: 'Erreur : profil introuvable', type: 'error' });
        setIsPublishing(false);
        return;
      }

      console.log('✅ Profil trouvé, profile.id:', profileData.id);

      // Trouver le marchand correspondant à ce profil
      console.log('🔍 Recherche du marchand pour profile_id:', profileData.id);
      const { data: merchantData, error: merchantError } = await supabase
        .from('merchants')
        .select('id')
        .eq('profile_id', profileData.id)
        .maybeSingle();

      if (merchantError || !merchantData) {
        console.error('❌ Impossible de trouver le marchand lié à ce profil', {
          profile_id: profileData.id,
          error: merchantError,
          merchantData
        });
        setToast({ message: 'Erreur : marchand introuvable', type: 'error' });
        setIsPublishing(false);
        return;
      }

      console.log('✅ Marchand trouvé, merchant.id:', merchantData.id);

      let imageUrl = editingOffer.image_url;
      if (formData.image) {
        console.log('Uploading new image to Supabase storage...');
        const randomId = crypto.randomUUID();
const path = `${user.id}/${randomId}.jpg`;
imageUrl = await uploadImageToSupabase(formData.image, 'product-images', path);
        console.log('New image uploaded successfully:', imageUrl);
      }

      const discountPercent = calculateDiscount(formData.price_before, formData.price_after);
      console.log('Calculated new discount:', discountPercent + '%');

      const updatedData = {
        title: formData.title,
        description: formData.description,
        image_url: imageUrl,
        price_before: parseFloat(formData.price_before),
        price_after: parseFloat(formData.price_after),
        quantity: parseInt(formData.quantity),
        available_from: formData.available_from,
        available_until: formData.available_until
        // NOTE: discount_percent is a GENERATED column in DB - do NOT send it
      };

      console.log('=== AFTER UPDATE (new data) ===');
      console.log('Updated offer data:', updatedData);

      console.log('Updating offer in Supabase...');
      const { data, error } = await supabase
        .from('offers')
        .update(updatedData)
        .eq('id', editingOffer.id)
        .eq('merchant_id', merchantData.id)
        .select()
        .single();

      if (error) {
        console.error('Supabase update error:', error);
        throw error;
      }

      console.log('✅ Offer updated successfully:', data);
      console.log('Updated offer ID:', data.id);

      // Verify audit log entry was created
      const { data: auditLog, error: auditError } = await supabase
        .from('audit_log')
        .select('*')
        .eq('table_name', 'offers')
        .eq('record_id', data.id)
        .eq('action', 'UPDATE')
        .order('changed_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (auditLog) {
        console.log('✅ Audit log entry created:', auditLog);
        console.log('Audit log old_data:', auditLog.old_data);
        console.log('Audit log new_data:', auditLog.new_data);
      } else if (auditError) {
        console.warn('Could not verify audit log:', auditError);
      }

      setOffers(offers.map(o => o.id === editingOffer.id ? data : o));
      closeEditModal();
      setToast({ message: '✅ Offer updated successfully', type: 'success' });
    } catch (error: any) {
      console.error('❌ Error updating offer:', error);
      setToast({ message: error.message || 'Failed to update offer', type: 'error' });
    } finally {
      setIsPublishing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'expired': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {toast && (
        <div className={'fixed top-4 right-4 z-[9999] px-6 py-3 rounded-lg shadow-lg ' + (toast.type === 'success' ? 'bg-green-500' : 'bg-red-500') + ' text-white'}>
          {toast.message}
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">My Products</h2>
            <p className="text-gray-600 mt-1">{offers.length} total products</p>
          </div>
          <div className="flex items-center gap-4">
            <NotificationBell />
            {user && (
              <GeolocationButton
                userRole="merchant"
                userId={user.id}
                onSuccess={(coords) => {
                  setToast({ message: 'Votre position a été mise à jour avec succès !', type: 'success' });
                  loadOffers();
                }}
              />
            )}
            <button
              onClick={openAddProductModal}
              className="flex items-center px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium shadow-sm"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Product
            </button>
          </div>
        </div>

        {/* Notifications Section */}
        <div className="mb-6 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-900">
                Notifications
                {unreadCount > 0 && (
                  <span className="ml-2 px-2 py-1 bg-red-500 text-white text-xs rounded-full">
                    {unreadCount}
                  </span>
                )}
              </h3>
            </div>
            {showNotifications ? (
              <ChevronUp className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            )}
          </button>

          {showNotifications && (
            <div className="border-t border-gray-200">
              {notifications.length === 0 ? (
                <div className="px-6 py-8 text-center text-gray-500">
                  Aucune nouvelle notification 📭
                </div>
              ) : (
                <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
                  {notifications.slice(0, 10).map((notification: Notification) => {
                    const formatTime = (dateString: string) => {
                      const date = new Date(dateString);
                      const now = new Date();
                      const diffMs = now.getTime() - date.getTime();
                      const diffMins = Math.floor(diffMs / 60000);
                      const diffHours = Math.floor(diffMs / 3600000);

                      if (diffMins < 1) return 'À l\'instant';
                      if (diffMins < 60) return `Il y a ${diffMins}m`;
                      if (diffHours < 24) return `Il y a ${diffHours}h`;

                      return date.toLocaleDateString('fr-FR', {
                        day: '2-digit',
                        month: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit'
                      });
                    };

                    const getNotificationColor = (type: string) => {
                      switch (type) {
                        case 'reservation':
                          return 'bg-yellow-50 border-l-4 border-yellow-500';
                        case 'stock_empty':
                          return 'bg-red-50 border-l-4 border-red-500';
                        case 'offer':
                          return 'bg-blue-50 border-l-4 border-blue-500';
                        default:
                          return 'bg-gray-50 border-l-4 border-gray-500';
                      }
                    };

                    return (
                      <div
                        key={notification.id}
                        className={`px-6 py-4 ${getNotificationColor(notification.type)} ${
                          !notification.is_read ? 'font-semibold' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="text-sm font-semibold text-gray-900 mb-1">
                              {notification.title}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {notification.message}
                            </p>
                            <p className="text-xs text-gray-400 mt-2">
                              {formatTime(notification.created_at)}
                            </p>
                          </div>
                          {!notification.is_read && (
                            <span className="ml-3 flex-shrink-0 w-2 h-2 bg-red-500 rounded-full mt-1"></span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {offers.map(offer => {
            const status = getOfferStatus(offer);
            return (
              <div key={offer.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                <div className="relative h-48">
                  <img
                    src={offer.image_url || 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400'}
                    alt={offer.title}
                    className="w-full h-full object-cover"
                  />
                  <div className={'absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-medium ' + getStatusColor(status)}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </div>
                </div>

                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-1">{offer.title}</h3>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{offer.description}</p>

                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <div className="flex items-baseline space-x-2">
                        <span className="text-xs text-gray-500 line-through">{offer.price_before.toFixed(2)} euro</span>
                        <span className="text-lg font-bold text-green-600">{offer.price_after.toFixed(2)} euro</span>
                      </div>
                      {offer.discount_percent && (
                        <span className="text-xs font-medium text-green-600">
                          -{offer.discount_percent}% off
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm mb-4">
                    <div className="flex items-center text-gray-600">
                      <Clock className="w-4 h-4 mr-1" />
                      <span>{calculateTimeLeft(offer.available_until)}</span>
                    </div>
                    <div className="text-gray-600">
                      <span className="font-medium">Stock: {offer.quantity}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => toggleOfferStatus(offer.id, offer.is_active)}
                      className={'flex-1 flex items-center justify-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ' +
                        (togglingOfferId === offer.id
                          ? 'bg-gray-200 text-gray-500 cursor-wait opacity-60'
                          : status === 'active'
                            ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            : status === 'paused'
                              ? 'bg-green-100 text-green-700 hover:bg-green-200'
                              : 'bg-gray-100 text-gray-500 cursor-not-allowed'
                        )}
                      disabled={status === 'expired' || togglingOfferId === offer.id}
                    >
                      {togglingOfferId === offer.id ? (
                        <>
                          <div className="w-4 h-4 mr-1 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                          {status === 'active' ? 'Pausing...' : 'Activating...'}
                        </>
                      ) : status === 'active' ? (
                        <><Pause className="w-4 h-4 mr-1" /> Pause Offer</>
                      ) : (
                        <><Play className="w-4 h-4 mr-1" /> Activate Offer</>
                      )}
                    </button>
                    <button
                      onClick={() => openEditModal(offer)}
                      className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                      title="Edit"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteOffer(offer.id)}
                      className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {offers.length === 0 && (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No products yet</h3>
            <p className="text-gray-600 mb-6">Get started by adding your first product</p>
            <button
              onClick={openAddProductModal}
              className="inline-flex items-center px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Your First Product
            </button>
          </div>
        )}
      </div>

      {showAddProductModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-screen overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Add New Product</h2>
              <button onClick={closeAddProductModal} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Product Name</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="e.g., Fresh Croissants Box"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe your product..."
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">📸 Photo du produit</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                  {formData.imagePreview ? (
                    <div className="relative">
                      <img src={formData.imagePreview} alt="Preview" className="max-h-48 mx-auto rounded" />
                      <button
                        onClick={() => setFormData({ ...formData, image: null, imagePreview: '' })}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="cursor-pointer">
                      <Upload className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">Prendre une photo ou choisir une image</p>
                      <input
  type="file"
  accept="image/*"
  capture
  onChange={handleImageUpload}
  className="hidden"
/>
                    </label>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Original Price (€)</label>
                  <input
                    type="number"
                    name="price_before"
                    value={formData.price_before}
                    onChange={handleInputChange}
                    placeholder="12.00"
                    step="0.01"
                    min="0"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sale Price (€)</label>
                  <input
                    type="number"
                    name="price_after"
                    value={formData.price_after}
                    onChange={handleInputChange}
                    placeholder="5.00"
                    step="0.01"
                    min="0"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>

              {formData.price_before && formData.price_after && parseFloat(formData.price_before) > 0 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
                  <span className="text-lg font-bold text-green-600">
                    -{calculateDiscount(formData.price_before, formData.price_after)}% discount
                  </span>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Quantity Available</label>
                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleInputChange}
                  placeholder="10"
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div className="border-t pt-4">
                <div className="flex items-center mb-3">
                  <input
                    type="checkbox"
                    id="startNow"
                    checked={formData.startNow}
                    onChange={(e) => handleStartNowChange(e.target.checked)}
                    className="w-4 h-4 text-green-500 rounded focus:ring-green-500"
                  />
                  <label htmlFor="startNow" className="ml-2 text-sm font-medium text-gray-700">
                    Start: Now
                  </label>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Start Date and Time</label>
                    <input
                      type="datetime-local"
                      name="available_from"
                      value={formData.available_from}
                      onChange={handleInputChange}
                      disabled={formData.startNow}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">End Date and Time</label>
                    <input
                      type="datetime-local"
                      name="available_until"
                      value={formData.available_until}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Duration</label>
                  <select
                    name="duration"
                    value={formData.duration}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="30min">30 minutes</option>
                    <option value="1h">1 hour</option>
                    <option value="2h">2 hours</option>
                    <option value="4h">4 hours</option>
                    <option value="allday">All day (today)</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>

                {formData.duration === 'custom' && (
                  <div className="mt-3">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Custom Duration (minutes)</label>
                    <input
                      type="number"
                      name="customDuration"
                      value={formData.customDuration}
                      onChange={handleInputChange}
                      placeholder="120"
                      min="1"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                )}
              </div>

              <button
                onClick={handlePublish}
                disabled={isPublishing || !formData.title || !formData.description || !formData.price_before || !formData.price_after || !formData.available_from || !formData.available_until}
                className="w-full py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPublishing ? 'Publishing...' : 'Publish Product'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showEditModal && editingOffer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-screen overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Edit Product</h2>
              <button onClick={closeEditModal} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Product Name</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="e.g., Fresh Croissants Box"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder="Describe your product..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">📸 Photo du produit</label>
                <div className="flex items-center space-x-4">
                  <label className="flex-1 flex items-center justify-center px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-green-500 transition-colors">
                    <Upload className="w-5 h-5 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-600">
                      {formData.image ? formData.image.name : 'Prendre une photo ou choisir une image (optionnel)'}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                </div>
                {formData.imagePreview && (
                  <div className="mt-3">
                    <img src={formData.imagePreview} alt="Preview" className="w-full h-48 object-cover rounded-lg" />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Original Price</label>
                  <div className="relative">
                    <input
                      type="number"
                      name="price_before"
                      value={formData.price_before}
                      onChange={handleInputChange}
                      step="0.01"
                      min="0"
                      placeholder="20.00"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                    <span className="absolute right-3 top-2.5 text-gray-500">€</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Discounted Price</label>
                  <div className="relative">
                    <input
                      type="number"
                      name="price_after"
                      value={formData.price_after}
                      onChange={handleInputChange}
                      step="0.01"
                      min="0"
                      placeholder="10.00"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                    <span className="absolute right-3 top-2.5 text-gray-500">€</span>
                  </div>
                  {formData.price_before && formData.price_after && (
                    <p className="text-sm text-green-600 mt-1">
                      {calculateDiscount(formData.price_before, formData.price_after)}% discount
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Quantity Available</label>
                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleInputChange}
                  min="0"
                  placeholder="10"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Available From</label>
                <input
                  type="datetime-local"
                  name="available_from"
                  value={formData.available_from}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Available Until</label>
                <input
                  type="datetime-local"
                  name="available_until"
                  value={formData.available_until}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <button
                onClick={handleUpdateOffer}
                disabled={isPublishing || !formData.title || !formData.description || !formData.price_before || !formData.price_after || !formData.available_from || !formData.available_until}
                className="w-full py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPublishing ? 'Updating...' : 'Update Product'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MerchantDashboardPage;
