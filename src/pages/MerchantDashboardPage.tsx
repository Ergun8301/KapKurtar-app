import React, { useState, useEffect, useRef } from 'react';
import { Plus, Package, Clock, Pause, Play, Trash2, CreditCard as Edit, Bell, ChevronDown, ChevronUp, Building2 } from 'lucide-react';
import mapboxgl from 'mapbox-gl';
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabaseClient';
import { useAddProduct } from '../contexts/AddProductContext';
import { uploadImageToSupabase } from '../lib/uploadImage';
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
  discount_percent: number | null;
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

const MAPBOX_TOKEN = 'pk.eyJ1Ijoia2lsaWNlcmd1bjAxIiwiYSI6ImNtaGptNTlvMzAxMjUya3F5YXc0Z2hjdngifQ.wgpZMAaxvM3NvGUJqdbvCA';
mapboxgl.accessToken = MAPBOX_TOKEN;

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
  const [onboardingData, setOnboardingData] = useState<{
    company_name: string;
    phone: string;
    street: string;
    city: string;
    postal_code: string;
    logo_url: string;
    latitude: number;
    longitude: number;
  }>({
    company_name: '',
    phone: '',
    street: '',
    city: '',
    postal_code: '',
    logo_url: '',
    latitude: 46.2044,
    longitude: 5.2258
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [isSubmittingOnboarding, setIsSubmittingOnboarding] = useState(false);
  const [isFromSettings, setIsFromSettings] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [modalReady, setModalReady] = useState(false); // 🆕 État pour contrôler l'initialisation

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null);

  useEffect(() => {
    const fetchMerchantProfile = async () => {
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
          console.warn('⚠️ Aucun profil trouvé');
          return;
        }

        const { data: merchantData, error: merchantError } = await supabase
          .from('merchants')
          .select('*')
          .eq('profile_id', profileData.id)
          .maybeSingle();

        if (merchantError) throw merchantError;

        if (merchantData) {
          console.log('✅ Marchand trouvé:', merchantData.id);
          setMerchantId(merchantData.id);
          setMerchantProfile(merchantData);

          const isIncomplete =
            !merchantData.onboarding_completed ||
            !merchantData.company_name?.trim() ||
            !merchantData.phone?.trim() ||
            !merchantData.logo_url?.trim();

          if (isIncomplete && !showOnboardingModal) {
            console.log('⚠️ Profil incomplet → ouverture modale');
            setIsFromSettings(false);
            setShowOnboardingModal(true);
            
            // 🆕 Attendre un instant avant de permettre l'initialisation de la carte
            setTimeout(() => {
              setModalReady(true);
            }, 100);
            
            setOnboardingData({
              company_name: merchantData.company_name || '',
              phone: merchantData.phone || '',
              street: merchantData.street || '',
              city: merchantData.city || '',
              postal_code: merchantData.postal_code || '',
              logo_url: merchantData.logo_url || '',
              latitude: 46.2044,
              longitude: 5.2258
            });
          }
        }
      } catch (error) {
        console.error('❌ Erreur fetch merchant:', error);
      }
    };

    fetchMerchantProfile();
  }, [user, showOnboardingModal]);

  useEffect(() => {
    const handleOpenProfileModal = () => {
      setIsFromSettings(true);
      setShowOnboardingModal(true);
      setModalReady(true); // 🆕 Carte prête immédiatement depuis Settings
      if (merchantProfile) {
        setOnboardingData({
          company_name: merchantProfile.company_name || '',
          phone: merchantProfile.phone || '',
          street: merchantProfile.street || '',
          city: merchantProfile.city || '',
          postal_code: merchantProfile.postal_code || '',
          logo_url: merchantProfile.logo_url || '',
          latitude: 46.2044,
          longitude: 5.2258
        });
      }
    };
    window.addEventListener('openMerchantProfileModal', handleOpenProfileModal);
    return () => window.removeEventListener('openMerchantProfileModal', handleOpenProfileModal);
  }, [merchantProfile]);

  useEffect(() => {
    // 🔥 Attendre que la modale soit prête ET visible
    if (!showOnboardingModal || !modalReady || !mapContainerRef.current) {
      console.log('⏳ En attente:', { showOnboardingModal, modalReady, hasContainer: !!mapContainerRef.current });
      return;
    }

    // 🧹 Nettoyer la carte existante si elle existe
    if (mapRef.current) {
      console.log('🧹 Nettoyage de la carte existante');
      mapRef.current.remove();
      mapRef.current = null;
      markerRef.current = null;
      setMapLoaded(false);
    }

    // ⏱️ Attendre que le DOM soit prêt
    const timer = setTimeout(() => {
      if (!mapContainerRef.current) {
        console.log('❌ Container non disponible');
        return;
      }

      console.log('🗺️ Initialisation Mapbox');

      try {
        const map = new mapboxgl.Map({
          container: mapContainerRef.current,
          style: 'mapbox://styles/mapbox/streets-v12',
          center: [onboardingData.longitude, onboardingData.latitude],
          zoom: 13,
        });

        mapRef.current = map;

        map.on('load', () => {
          console.log('✅ Carte Mapbox chargée');
          setMapLoaded(true);

          // 🪄 Forcer Mapbox à recalculer la taille du conteneur
          setTimeout(() => {
            if (map) {
              map.resize();
              console.log('🧭 Mapbox redimensionné après ouverture de la modale');
            }
          }, 300);
        });

        map.on('error', (e) => {
          console.error('❌ Erreur Mapbox:', e);
          setMapLoaded(false);
        });

        const marker = new mapboxgl.Marker({
          draggable: true,
          color: '#16a34a',
        })
          .setLngLat([onboardingData.longitude, onboardingData.latitude])
          .addTo(map);

        markerRef.current = marker;

        marker.on('dragend', () => {
          const lngLat = marker.getLngLat();
          setOnboardingData((prev) => ({
            ...prev,
            latitude: lngLat.lat,
            longitude: lngLat.lng,
          }));
          console.log('📍 Marqueur déplacé:', lngLat);
        });

        const geocoder = new MapboxGeocoder({
          accessToken: MAPBOX_TOKEN,
          mapboxgl: mapboxgl,
          marker: false,
          placeholder: 'Rechercher une adresse...',
          language: 'fr',
          types: 'address,poi',
        });

        map.addControl(geocoder, 'top-left');

        geocoder.on('result', (e) => {
          const { center, place_name } = e.result;
          marker.setLngLat(center);
          setOnboardingData((prev) => ({
            ...prev,
            latitude: center[1],
            longitude: center[0],
          }));
          console.log('🔍 Adresse sélectionnée:', place_name, center);
        });
      } catch (error) {
        console.error('❌ Erreur initialisation Mapbox:', error);
        setMapLoaded(false);
      }
    }, 500); // 🔥 Augmenté à 500ms pour être sûr

    return () => {
      clearTimeout(timer);
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      markerRef.current = null;
      setMapLoaded(false);
    };
  }, [showOnboardingModal, modalReady]); // 🔥 Dépend maintenant de modalReady aussi

  useEffect(() => {
    const checkExpiredOffers = async () => {
      try {
        await supabase.rpc('auto_expire_offers');
      } catch (error) {
        console.error('Erreur auto_expire_offers:', error);
      }
    };

    checkExpiredOffers();

    if (!merchantId) return;

    loadOffers();

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
        () => loadOffers()
      )
      .subscribe();

    return () => {
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
      const { data, error } = await supabase
        .from('offers')
        .select('*')
        .eq('merchant_id', merchantId)
        .eq('is_deleted', false)
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

  const handlePublish = async (formData: any) => {
    if (!user) {
      setToast({ message: 'Please log in to create an offer', type: 'error' });
      return;
    }

    if (parseFloat(formData.price_after) >= parseFloat(formData.price_before)) {
      setToast({ message: 'Discounted price must be lower than original price', type: 'error' });
      return;
    }

    setIsPublishing(true);
    try {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('auth_id', user.id)
        .maybeSingle();

      if (profileError || !profileData) {
        setToast({ message: 'Erreur : profil introuvable', type: 'error' });
        setIsPublishing(false);
        return;
      }

      const { data: merchantData, error: merchantError } = await supabase
        .from('merchants')
        .select('id, location')
        .eq('profile_id', profileData.id)
        .maybeSingle();

      if (merchantError || !merchantData) {
        setToast({ message: 'Erreur : marchand introuvable', type: 'error' });
        setIsPublishing(false);
        return;
      }

      let imageUrl = null;
      if (formData.image) {
        const randomId = crypto.randomUUID();
        const path = `${user.id}/${randomId}.jpg`;
        imageUrl = await uploadImageToSupabase(formData.image, 'product-images', path);
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
      }

      const { data, error } = await supabase
        .from('offers')
        .insert([offerData])
        .select()
        .single();

      if (error) throw error;

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
    if (!user || togglingOfferId === offerId) return;

    setTogglingOfferId(offerId);

    try {
      const { error } = await supabase.rpc('toggle_offer_status', { p_offer_id: offerId });
      if (error) throw error;
      await loadOffers();
      setToast({ message: currentStatus ? '✅ Offer paused' : '✅ Offer activated', type: 'success' });
    } catch (error: any) {
      setToast({ message: error.message || 'Failed to toggle offer status', type: 'error' });
    } finally {
      setTogglingOfferId(null);
    }
  };

  const deleteOffer = async (offerId: string) => {
    if (!user) return;

    const confirmed = confirm('Are you sure you want to hide this offer?');
    if (!confirmed) return;

    try {
      const { error } = await supabase.rpc('delete_offer_soft', { p_offer_id: offerId });
      if (error) throw error;
      await loadOffers();
      setToast({ message: '🗑️ Offer hidden', type: 'success' });
    } catch (error: any) {
      setToast({ message: error.message || 'Failed to delete offer', type: 'error' });
    }
  };

  const openEditModal = (offer: Offer) => {
    setEditingOffer(offer);
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setEditingOffer(null);
  };

  const handleUpdateOffer = async (formData: any) => {
    if (!user || !editingOffer) return;

    if (parseFloat(formData.price_after) >= parseFloat(formData.price_before)) {
      setToast({ message: 'Discounted price must be lower than original price', type: 'error' });
      return;
    }

    setIsPublishing(true);
    try {
      let imageUrl = editingOffer.image_url;
      if (formData.image) {
        const randomId = crypto.randomUUID();
        const path = `${user.id}/${randomId}.jpg`;
        imageUrl = await uploadImageToSupabase(formData.image, 'product-images', path);
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

      const { error } = await supabase
        .from('offers')
        .update(updateData)
        .eq('id', editingOffer.id);

      if (error) throw error;

      await loadOffers();
      closeEditModal();
      setToast({ message: '✅ Offer updated successfully', type: 'success' });
    } catch (error: any) {
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
        const randomId = crypto.randomUUID();
        const path = `${merchantId}/${randomId}.jpg`;
        logoUrl = await uploadImageToSupabase(logoFile, 'merchant-logos', path);
      }

      const { latitude, longitude } = onboardingData;

      const updatePayload: any = {
        company_name: onboardingData.company_name,
        phone: onboardingData.phone,
        street: onboardingData.street || 'Position GPS',
        city: onboardingData.city || 'À définir',
        postal_code: onboardingData.postal_code || '00000',
        logo_url: logoUrl,
        onboarding_completed: true,
        location: `SRID=4326;POINT(${longitude} ${latitude})`
      };

      console.log('📍 Payload envoyé:', updatePayload);
      console.log('📍 Coordonnées exactes:', { latitude, longitude });

      const { error: updateError } = await supabase
        .from('merchants')
        .update(updatePayload)
        .eq('id', merchantId);

      if (updateError) throw updateError;

      setToast({ message: '✅ Profil complété avec succès', type: 'success' });
      setShowOnboardingModal(false);
      setModalReady(false); // 🆕 Réinitialiser l'état

      const { data: updatedMerchant } = await supabase
        .from('merchants')
        .select('*')
        .eq('id', merchantId)
        .single();

      if (updatedMerchant) {
        setMerchantProfile(updatedMerchant);
      }
    } catch (error: any) {
      console.error('❌ Erreur mise à jour:', error);
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

  const handleGeolocate = () => {
    if (!navigator.geolocation) {
      setToast({ message: 'Géolocalisation non supportée', type: 'error' });
      return;
    }

    setToast({ message: '📍 Détection en cours...', type: 'success' });

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        
        console.log('✅ Position GPS détectée:', { latitude, longitude, accuracy: position.coords.accuracy });

        setOnboardingData((prev) => ({
          ...prev,
          latitude,
          longitude,
        }));

        if (mapRef.current && markerRef.current) {
          mapRef.current.flyTo({ center: [longitude, latitude], zoom: 15 });
          markerRef.current.setLngLat([longitude, latitude]);
        }

        setToast({ message: `✅ Position détectée (précision: ${Math.round(position.coords.accuracy)}m)`, type: 'success' });
      },
      (error) => {
        console.error('❌ Erreur géolocalisation:', error);
        setToast({ message: '⚠️ ' + error.message, type: 'error' });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  // 🪄 Redimensionner la carte quand la modale s'affiche
  useEffect(() => {
    if (showOnboardingModal && mapRef.current) {
      setTimeout(() => {
        mapRef.current?.resize();
        console.log('📐 Redimensionnement de la carte après ouverture de la modale');
      }, 400);
    }
  }, [showOnboardingModal]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
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
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Complétez votre profil marchand</h2>
                  <p className="text-sm text-gray-600 mt-1">Finalisez votre inscription pour publier des offres</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleOnboardingSubmit} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nom de l'entreprise *</label>
                <input
                  type="text"
                  value={onboardingData.company_name}
                  onChange={(e) => setOnboardingData({ ...onboardingData, company_name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder="Ex: Boulangerie Martin"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Téléphone *</label>
                <input
                  type="tel"
                  value={onboardingData.phone}
                  onChange={(e) => setOnboardingData({ ...onboardingData, phone: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder="Ex: 06 12 34 56 78"
                  required
                />
              </div>

              <div className="space-y-4">
                <p className="text-sm font-medium text-gray-700">📍 Définissez votre position sur la carte</p>

                {/* 🗺️ Carte en pleine largeur avec coins arrondis */}
                <div className="relative">
                  {!mapLoaded && (
                    <div className="w-full h-[400px] rounded-xl bg-gray-100 flex items-center justify-center">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto mb-2"></div>
                        <p className="text-sm text-gray-500">Chargement de la carte...</p>
                      </div>
                    </div>
                  )}

                  <div
                    ref={mapContainerRef}
                    className={`w-full h-[400px] rounded-xl shadow-lg overflow-hidden ${!mapLoaded ? 'hidden' : 'block'}`}
                    style={{ position: 'relative' }}
                  ></div>

                  {/* 🎯 Bouton GPS style pro (en bas à droite) */}
                  {mapLoaded && (
                    <button
                      type="button"
                      onClick={handleGeolocate}
                      className="absolute bottom-4 right-4 w-12 h-12 bg-white rounded-full shadow-lg hover:shadow-xl transition-all flex items-center justify-center border border-gray-200 hover:bg-gray-50 z-10"
                      title="Me géolocaliser"
                    >
                      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </button>
                  )}
                </div>

                {/* 📝 Affichage des coordonnées */}
                <div className="text-xs text-gray-400 text-center">
                  Position : {onboardingData.latitude.toFixed(6)}, {onboardingData.longitude.toFixed(6)}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Logo de l'entreprise *</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  className="w-full border-2 border-dashed border-gray-300 rounded-lg p-4 text-sm text-gray-500 cursor-pointer hover:border-green-400"
                  required={!onboardingData.logo_url}
                />
                {onboardingData.logo_url && (
                  <div className="mt-3 flex justify-center">
                    <img src={onboardingData.logo_url} alt="Logo" className="h-16 rounded-md shadow-sm" />
                  </div>
                )}
              </div>

              {isFromSettings ? (
  <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
    <button
      type="button"
      onClick={() => setShowOnboardingModal(false)}
      className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium"
    >
      Annuler
    </button>
    <button
      type="submit"
      disabled={isSubmittingOnboarding}
      className="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white font-medium"
    >
      {isSubmittingOnboarding ? "Enregistrement..." : "Enregistrer"}
    </button>
  </div>
) : (
  <button
    type="submit"
    disabled={isSubmittingOnboarding}
    className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg"
  >
    {isSubmittingOnboarding ? "Enregistrement..." : "Enregistrer"}
  </button>
)}
</form>
</div>
</div>
)}

<>
  {/* --- DÉBUT DU TABLEAU DE BORD --- */}
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div className="mb-6 flex items-center justify-between">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">My Products</h2>
        <p className="text-gray-600 mt-1">{offers.length} total products</p>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={openAddProductModal}
          className="flex items-center px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium shadow-sm"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Product
        </button>
      </div>
    </div>
  </div>
  {/* --- FIN DU TABLEAU DE BORD --- */}
</>

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
                        <span className="text-xs text-gray-500 line-through">{offer.price_before.toFixed(2)} €</span>
                        <span className="text-lg font-bold text-green-600">{offer.price_after.toFixed(2)} €</span>
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