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
    customDuration: '',
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
          filter: `merchant_id=eq.${user.id}`,
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

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
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
      switch (durationValue) {
        case '30min':
          minutes = 30;
          break;
        case '1h':
          minutes = 60;
          break;
        case '2h':
          minutes = 120;
          break;
        case '4h':
          minutes = 240;
          break;
        case 'allday':
          const endOfDay = new Date(startDate);
          endOfDay.setHours(23, 59, 0, 0);
          setFormData((prev) => ({
            ...prev,
            available_until: endOfDay.toISOString().slice(0, 16),
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
    setFormData((prev) => ({
      ...prev,
      available_until: endDate.toISOString().slice(0, 16),
    }));
  };

  const handleStartNowChange = (checked: boolean) => {
    setFormData((prev) => {
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
    setFormData((prev) => ({
      ...prev,
      available_from: now.toISOString().slice(0, 16),
      available_until: twoHoursLater.toISOString().slice(0, 16),
    }));
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const MAX_SIZE = 5 * 1024 * 1024;
      const validTypes = [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/webp',
        'image/heic',
        'image/heif',
        'image/avif',
      ];
      if (file.size > MAX_SIZE) {
        setToast({
          message:
            "Image trop volumineuse (max. 5 Mo). Réduis la taille ou compresse-la avant d'envoyer.",
          type: 'error',
        });
        return;
      }
      if (!validTypes.includes(file.type.toLowerCase())) {
        setToast({
          message:
            'Format non pris en charge. Formats acceptés : JPG, PNG, WEBP, HEIC, HEIF, AVIF.',
          type: 'error',
        });
        return;
      }

      setFormData({ ...formData, image: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, imagePreview: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  // ... (reste inchangé de ton code)
};

export default MerchantDashboardPage;
