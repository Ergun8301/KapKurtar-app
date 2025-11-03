import React, { useState, useEffect } from 'react';
import { Plus, Package, Clock, Pause, Play, Trash2, CreditCard as Edit, Bell, ChevronDown, ChevronUp, X, Building2, Upload } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabaseClient';
import { useAddProduct } from '../contexts/AddProductContext';
import { uploadImageToSupabase } from '../lib/uploadImage';
import { NotificationBell } from '../components/NotificationBell';
import { useRealtimeNotifications } from '../hooks/useRealtimeNotifications';
import { type Notification } from '../api/notifications';
import { OfferForm } from '../components/OfferForm';

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
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
  quantity: number;
}

interface MerchantProfile {
  id: string;
  profile_id: string;
  company_name: string | null;
  phone: string | null;
  street: string | null;
  city: string | null;
  postal_code: string | null;
  logo_url: string | null;
  onboarding_completed: boolean;
}

const MerchantDashboardPage = () => {
    useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const { user } = useAuth();
  const { showAddProductModal, openAddProductModal, closeAddProductModal } = useAddProduct();
  const [merchantId, setMerchantId] = useState<string | null>(null);
  const [merchantProfile, setMerchantProfile] = useState<MerchantProfile | null>(null);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [editingOffer, setEditingOffer] = useState<Offer | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [togglingOfferId, setTogglingOfferId] = useState<string | null>(null);
  const [showNotifications, setShowNotifications] = useState(true);
  const { notifications, unreadCount } = useRealtimeNotifications(user?.id || null);
  const [showOnboardingModal, setShowOnboardingModal] = useState(false);
  const [onboardingData, setOnboardingData] = useState({
    company_name: '',
    phone: '',
    street: '',
    city: '',
    postal_code: '',
    logo_url: ''
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [isSubmittingOnboarding, setIsSubmittingOnboarding] = useState(false);


// Fetch merchant ID from user and auto-geolocate
useEffect(() => {
  const fetchMerchantIdAndGeolocate = async () => {
    if (!user) {
      setMerchantId(null);
      return;
    }

    try {
      console.log('🔍 Recherche du profil pour auth_id:', user.id);

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('auth_id', user.id)
        .maybeSingle();

      if (profileError) throw profileError;
      if (!profileData) {
        console.warn('⚠️ Aucun profil trouvé pour cet utilisateur');
        return;
      }

      const { data: merchantData, error: merchantError } = await supabase
        .from('merchants')
        .select('id, profile_id, company_name, phone, street, city, postal_code, logo_url, onboarding_completed')
        .eq('profile_id', profileData.id)
        .maybeSingle();

      if (merchantError) throw merchantError;
      if (merchantData) {
        console.log('✅ Marchand trouvé, ID:', merchantData.id);
        setMerchantId(merchantData.id);
        setMerchantProfile(merchantData);

        const isProfileIncomplete =
          !merchantData.onboarding_completed ||
          !merchantData.company_name ||
          !merchantData.phone ||
          !merchantData.street ||
          !merchantData.city ||
          !merchantData.postal_code ||
          !merchantData.logo_url;

        if (isProfileIncomplete) {
          console.log('⚠️ Profil marchand incomplet, affichage de la modale');
          setShowOnboardingModal(true);
          setOnboardingData({
            company_name: merchantData.company_name || '',
            phone: merchantData.phone || '',
            street: merchantData.street || '',
            city: merchantData.city || '',
            postal_code: merchantData.postal_code || '',
            logo_url: merchantData.logo_url || ''
          });
        }

                // 🧭 Pas de géolocalisation automatique
        // Si tu veux plus tard proposer un bouton "Détecter ma position", tu pourras réutiliser ce code :
        /*
        const handleManualGeolocation = async () => {
          if (!navigator.geolocation) {
            console.warn("⚠️ La géolocalisation n'est pas supportée par ce navigateur");
            return;
          }

          navigator.geolocation.getCurrentPosition(
            async (position) => {
              const { latitude, longitude } = position.coords;
              console.log('✅ Position obtenue manuellement:', { latitude, longitude });

              const { error: updateError } = await supabase.rpc('update_merchant_location', {
                p_merchant_id: merchantData.id,
                p_latitude: latitude,
                p_longitude: longitude,
              });

              if (updateError) {
                console.error('❌ Erreur RPC update_merchant_location:', updateError);
              } else {
                console.log('✅ Position du marchand mise à jour avec succès');
              }
            },
            (error) => {
              console.warn('⚠️ Impossible de récupérer la position:', error.message);
            }
          );
        };
        */

      } else {
        console.warn('⚠️ Aucun marchand trouvé pour ce profil');
      }
    } catch (error) {
      console.error('Erreur lors de la récupération du merchant ID:', error);
    }
  };

  fetchMerchantIdAndGeolocate();
}, [user]);

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

  if (!merchantId) {
    console.log('⏳ Merchant ID non disponible, attente...');
    return;
  }

  console.log('✅ Merchant ID disponible :', merchantId);
  loadOffers();

  // Subscribe to realtime updates for merchant's offers
  console.log('Subscribing to realtime updates for merchant offers...');
  const channel = supabase
    .channel('merchant-offers-changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'offers',
        filter: `merchant_id=eq.${merchantId}`,
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
}, [merchantId]);

useEffect(() => {
  if (toast) {
    const timer = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(timer);
  }
}, [toast]);

const loadOffers = async () => {
  if (!merchantId) return;

  try {
    console.log('Fetching offers for merchant:', merchantId);

    const { data, error } = await supabase
      .from('offers')
      .select('*')
      .eq('merchant_id', merchantId)
      .eq('is_deleted', false)
      .order('updated_at', { ascending: false });

    if (error) throw error;

    console.log('Offers loaded:', data);
    setOffers(data || []);
  } catch (error: any) {
    console.error('Error loading offers:', error);
    setToast({
      message: error.message || 'Failed to load offers',
      type: 'error',
    });
  } finally {
    setLoading(false);
  }
};

const getOfferStatus = (offer: Offer): 'active' | 'paused' | 'expired' => {
  const now = new Date();
  const availableUntil = new Date(offer.available_until);

  // priorité : expirée > pause > active
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







const handlePublish = async (formData: any) => {
  if (!user) {
    console.error('User not authenticated');
    setToast({ message: 'Please log in to create an offer', type: 'error' });
    return;
  }

  if (parseFloat(formData.price_after) >= parseFloat(formData.price_before)) {
    setToast({
      message: 'Discounted price must be lower than original price',
      type: 'error',
    });
    return;
  }

  console.log('Creating new offer...', {
    merchant_id: user.id,
    title: formData.title,
    price_before: formData.price_before,
    price_after: formData.price_after,
    quantity: formData.quantity,
  });

  setIsPublishing(true);
  try {
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

      const { data: merchantData, error: merchantError } = await supabase
        .from('merchants')
        .select('id, location')
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
      console.log('📍 Localisation du marchand:', merchantData.location);

      let imageUrl = null;
      if (formData.image) {
        console.log('Uploading image to Supabase storage...');
        const randomId = crypto.randomUUID();
        const path = `${user.id}/${randomId}.jpg`;
        imageUrl = await uploadImageToSupabase(formData.image, 'product-images', path);
        console.log('Image uploaded successfully:', imageUrl);
      }

      const offerData: any = {
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
      };

      if (merchantData.location) {
        offerData.location = merchantData.location;
        console.log('✅ Localisation du marchand copiée vers l\'offre');
      } else {
        console.warn('⚠️ Aucune localisation trouvée pour ce marchand');
      }

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

      const { data: auditLog, error: auditError } = await supabase
        .from('audit_log')
        .select('*')
        .eq('table_name', 'offers')
        .eq('record_id', data.id)
        .eq('action', 'INSERT')
        .maybeSingle();

      if (auditLog) {
        console.log('✅ Audit log entry created:', auditLog);
      } else if (auditError) {
        console.warn('Could not verify audit log:', auditError);
      }

      setOffers([data, ...offers]);
      closeAddProductModal();
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

  if (togglingOfferId === offerId) return;

  const newStatus = !currentStatus;
  const actionText = newStatus ? 'Activating' : 'Pausing';
  console.log(`${actionText} offer via RPC...`);

  setTogglingOfferId(offerId);

  try {
    // 🟢 Appel RPC sécurisé Supabase
    const { error } = await supabase.rpc('toggle_offer_status', { p_offer_id: offerId });

    if (error) throw error;

    console.log('✅ RPC toggle_offer_status executed successfully.');
    await loadOffers();

    const successMessage = newStatus ? '✅ Offer activated' : '✅ Offer paused';
    setToast({ message: successMessage, type: 'success' });
  } catch (error: any) {
    console.error('❌ Error toggling offer status:', error);
    setToast({ message: error.message || 'Failed to toggle offer status', type: 'error' });
  } finally {
    setTogglingOfferId(null);
  }
};

  const deleteOffer = async (offerId: string) => {
  if (!user) {
    setToast({ message: 'Please log in to delete offers', type: 'error' });
    return;
  }

  const confirmed = confirm('Are you sure you want to hide (soft delete) this offer?');
  if (!confirmed) return;

  try {
    console.log('🗑️ Calling delete_offer_soft RPC...');
    const { error } = await supabase.rpc('delete_offer_soft', { p_offer_id: offerId });

    if (error) throw error;

    console.log('✅ RPC delete_offer_soft executed successfully.');
    await loadOffers();
    setToast({ message: '🗑️ Offer hidden (soft deleted)', type: 'success' });
  } catch (error: any) {
    console.error('❌ Error soft deleting offer:', error);
    setToast({ message: error.message || 'Failed to delete offer', type: 'error' });
  }
};

  const openEditModal = (offer: Offer) => {
    console.log('Opening edit modal for offer:', offer);
    setEditingOffer(offer);
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setEditingOffer(null);
  };

  const handleUpdateOffer = async (formData: any) => {
    if (!user || !editingOffer) {
      console.error('User not authenticated or no offer selected');
      setToast({ message: 'Cannot update offer', type: 'error' });
      return;
    }

    if (parseFloat(formData.price_after) >= parseFloat(formData.price_before)) {
      setToast({ message: 'Discounted price must be lower than original price', type: 'error' });
      return;
    }

    console.log('=== UPDATING OFFER ===');
    console.log('Offer ID:', editingOffer.id);

    setIsPublishing(true);
    try {
      let imageUrl = editingOffer.image_url;
      if (formData.image) {
        console.log('Uploading new image to Supabase storage...');
        const randomId = crypto.randomUUID();
        const path = `${user.id}/${randomId}.jpg`;
        imageUrl = await uploadImageToSupabase(formData.image, 'product-images', path);
        console.log('New image uploaded successfully:', imageUrl);
      }

      const updateData: any = {
        title: formData.title,
        description: formData.description,
        image_url: imageUrl,
        price_before: parseFloat(formData.price_before),
        price_after: parseFloat(formData.price_after),
        quantity: parseInt(formData.quantity),
        available_from: formData.available_from,
        available_until: formData.available_until,
      };

      console.log('Updating offer with data:', updateData);

      const { error } = await supabase
        .from('offers')
        .update(updateData)
        .eq('id', editingOffer.id);

      if (error) {
        console.error('❌ Error updating offer:', error);
        throw error;
      }

      console.log('✅ Offer updated successfully');
      await loadOffers();
      closeEditModal();
      setToast({ message: '✅ Offer updated successfully', type: 'success' });
    } catch (error: any) {
      console.error('❌ Error updating offer:', error);
      setToast({ message: error.message || 'Failed to update offer', type: 'error' });
    } finally {
      setIsPublishing(false);
    }
  };

const handleOnboardingSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!merchantId) return;

  setIsSubmittingOnboarding(true);
  try {
    let logoUrl = onboardingData.logo_url;

    if (logoFile) {
      console.log('Uploading logo...');
      const randomId = crypto.randomUUID();
      const path = `${merchantId}/${randomId}.jpg`;
      logoUrl = await uploadImageToSupabase(logoFile, 'merchant-logos', path);
      console.log('Logo uploaded:', logoUrl);
    }

    const { error: updateError } = await supabase
      .from('merchants')
      .update({
        company_name: onboardingData.company_name,
        phone: onboardingData.phone,
        street: onboardingData.street,
        city: onboardingData.city,
        postal_code: onboardingData.postal_code,
        logo_url: logoUrl,
        onboarding_completed: true
      })
      .eq('id', merchantId);

    if (updateError) throw updateError;

    console.log('✅ Profil marchand complété avec succès');
    setToast({ message: '✅ Profil complété avec succès', type: 'success' });
    setShowOnboardingModal(false);

    const { data: updatedMerchant } = await supabase
      .from('merchants')
      .select('id, profile_id, company_name, phone, street, city, postal_code, logo_url, onboarding_completed')
      .eq('id', merchantId)
      .single();

    if (updatedMerchant) {
      setMerchantProfile(updatedMerchant);
    }
  } catch (error: any) {
    console.error('❌ Erreur lors de la mise à jour du profil:', error);
    setToast({ message: error.message || 'Erreur lors de la mise à jour', type: 'error' });
  } finally {
    setIsSubmittingOnboarding(false);
  }
};

const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (file) {
    setLogoFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setOnboardingData({ ...onboardingData, logo_url: reader.result as string });
    };
    reader.readAsDataURL(file);
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

      {showOnboardingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9998] p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Complétez votre profil marchand</h2>
                    <p className="text-sm text-gray-600 mt-1">Finalisez votre inscription pour publier des offres</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowOnboardingModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  disabled={isSubmittingOnboarding}
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>

            <form onSubmit={handleOnboardingSubmit} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom de l'entreprise *
                </label>
                <input
                  type="text"
                  value={onboardingData.company_name}
                  onChange={(e) => setOnboardingData({ ...onboardingData, company_name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Ex: Boulangerie Martin"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Téléphone *
                </label>
                <input
                  type="tel"
                  value={onboardingData.phone}
                  onChange={(e) => setOnboardingData({ ...onboardingData, phone: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Ex: 06 12 34 56 78"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Adresse *
                </label>
                <input
                  type="text"
                  value={onboardingData.street}
                  onChange={(e) => setOnboardingData({ ...onboardingData, street: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Ex: 123 rue de la République"
                  required
                />
              </div>

              {/* Bouton pour détecter la position manuellement avec meilleure UX */}
<div className="mt-3">
  <button
    type="button"
    disabled={isSubmittingOnboarding}
    onClick={async () => {
      if (!merchantId) {
        setToast({ message: '⚠️ Profil marchand introuvable.', type: 'error' });
        return;
      }

      if (!navigator.geolocation) {
        setToast({ message: 'La géolocalisation n’est pas supportée par ce navigateur.', type: 'error' });
        return;
      }

      setIsSubmittingOnboarding(true);
      setToast({ message: '📍 Détection de la position en cours...', type: 'success' });

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          console.log('✅ Position détectée manuellement :', { latitude, longitude });

          try {
            const { error: updateError } = await supabase.rpc('update_merchant_location', {
              p_merchant_id: merchantId,
              p_latitude: latitude,
              p_longitude: longitude,
            });

            if (updateError) {
              console.error('❌ Erreur RPC update_merchant_location:', updateError);
              setToast({ message: '❌ Erreur lors de la mise à jour de la position.', type: 'error' });
            } else {
              console.log('✅ Position mise à jour avec succès');
              setToast({ message: '✅ Position mise à jour avec succès !', type: 'success' });
            }
          } catch (err) {
            console.error('❌ Erreur RPC:', err);
            setToast({ message: '❌ Erreur lors de la détection de la position.', type: 'error' });
          } finally {
            setIsSubmittingOnboarding(false);
          }
        },
        (error) => {
          console.warn('⚠️ Impossible de récupérer la position :', error.message);
          setToast({ message: '⚠️ ' + error.message, type: 'error' });
          setIsSubmittingOnboarding(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    }}
    className={`w-full flex items-center justify-center px-4 py-2 rounded-lg font-medium transition-colors ${
      isSubmittingOnboarding
        ? 'bg-gray-200 text-gray-400 cursor-wait'
        : 'bg-blue-50 hover:bg-blue-100 text-blue-700'
    }`}
  >
    {isSubmittingOnboarding ? (
      <>
        <div className="w-4 h-4 mr-2 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
        Détection en cours...
      </>
    ) : (
      <>
        <span role="img" aria-label="pin">📍</span>
        <span className="ml-2">Détecter ma position actuelle</span>
      </>
    )}
  </button>
</div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ville *
                  </label>
                  <input
                    type="text"
                    value={onboardingData.city}
                    onChange={(e) => setOnboardingData({ ...onboardingData, city: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Ex: Paris"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Code postal *
                  </label>
                  <input
                    type="text"
                    value={onboardingData.postal_code}
                    onChange={(e) => setOnboardingData({ ...onboardingData, postal_code: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Ex: 75001"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Logo de l'entreprise *
                </label>
                <div className="flex items-center gap-4">
                  {onboardingData.logo_url && (
                    <img
                      src={onboardingData.logo_url}
                      alt="Logo preview"
                      className="w-20 h-20 object-cover rounded-lg border border-gray-300"
                    />
                  )}
                  <label className="flex-1 flex items-center justify-center px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-green-500 transition-colors">
                    <Upload className="w-5 h-5 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-600">
                      {logoFile ? logoFile.name : 'Choisir un logo'}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoChange}
                      className="hidden"
                      required={!onboardingData.logo_url}
                    />
                  </label>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={isSubmittingOnboarding}
                  className="flex-1 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmittingOnboarding ? 'Enregistrement...' : 'Enregistrer'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowOnboardingModal(false)}
                  disabled={isSubmittingOnboarding}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Fermer
                </button>
              </div>
            </form>
          </div>
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
                    {status === 'paused' ? 'En pause' : status === 'active' ? 'Active' : 'Expirée'}
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
                          : offer.is_active
                            ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            : 'bg-green-100 text-green-700 hover:bg-green-200')}
                      disabled={togglingOfferId === offer.id}
                    >
                      {togglingOfferId === offer.id ? (
                        <>
                          <div className="w-4 h-4 mr-1 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                          {offer.is_active ? 'Pausing...' : 'Activating...'}
                        </>
                      ) : offer.is_active ? (
                        <>
                          <Pause className="w-4 h-4 mr-1" /> Pause
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 mr-1" /> Activate
                        </>
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
        <OfferForm
          mode="create"
          onSubmit={handlePublish}
          onCancel={closeAddProductModal}
          isSubmitting={isPublishing}
        />
      )}

      {showEditModal && editingOffer && (
        <OfferForm
          mode="edit"
          initialData={editingOffer}
          onSubmit={handleUpdateOffer}
          onCancel={closeEditModal}
          isSubmitting={isPublishing}
        />
      )}
    </div>
  );
};

export default MerchantDashboardPage;
