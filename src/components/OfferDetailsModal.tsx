import React, { useState, useEffect } from 'react';
import { X, MapPin, Phone, Navigation, Clock, Package, Star } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../hooks/useAuth';

interface Offer {
  offer_id: string;
  merchant_id?: string;
  title: string;
  description?: string;
  price_before: number;
  price_after: number;
  discount_percent?: number;
  quantity?: number;
  merchant_name: string;
  merchant_logo_url?: string;
  merchant_phone?: string;
  merchant_street?: string;
  merchant_city?: string;
  merchant_postal_code?: string;
  distance_meters: number;
  offer_lat: number;
  offer_lng: number;
  image_url: string;
  available_from?: string;
  available_until?: string;
  expired_at?: string | null;
  is_active?: boolean;
}

interface OfferDetailsModalProps {
  offer: Offer | null;
  onClose: () => void;
}

export const OfferDetailsModal: React.FC<OfferDetailsModalProps> = ({ offer, onClose }) => {
  const { user } = useAuth();
  const [isReserving, setIsReserving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [merchantOffers, setMerchantOffers] = useState<Offer[]>([]);
  const [loadingOtherOffers, setLoadingOtherOffers] = useState(false);

  useEffect(() => {
    if (offer && offer.merchant_id) {
      loadMerchantOffers();
    }
  }, [offer]);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  if (!offer) return null;

  const loadMerchantOffers = async () => {
    if (!offer.merchant_id) return;
    
    setLoadingOtherOffers(true);
    try {
      const { data, error } = await supabase.rpc('get_offers_nearby_public', {
        user_lng: offer.offer_lng,
        user_lat: offer.offer_lat,
        radius_meters: 100, // Very small radius to get only this merchant
      });

      if (error) throw error;

      // Filter to get only this merchant's offers, excluding the current one
      const otherOffers = (data || []).filter(
        (o: Offer) => o.merchant_id === offer.merchant_id && o.offer_id !== offer.offer_id
      );

      setMerchantOffers(otherOffers);
    } catch (error) {
      console.error('Erreur chargement autres offres:', error);
    } finally {
      setLoadingOtherOffers(false);
    }
  };

  const getDiscountPercent = (before: number, after: number) => {
    if (!before || before === 0) return 0;
    return Math.round(((before - after) / before) * 100);
  };

  const getTimeRemaining = (until?: string) => {
    if (!until) return '';
    const diff = new Date(until).getTime() - Date.now();
    if (diff <= 0) return 'Expirée';
    const h = Math.floor(diff / 1000 / 60 / 60);
    const m = Math.floor((diff / 1000 / 60) % 60);
    return h > 0 ? `${h}h ${m}min restantes` : `${m} minutes restantes`;
  };

  const getProgressPercent = () => {
    if (!offer.available_from || !offer.available_until) return 0;
    
    const now = new Date();
    const start = new Date(offer.available_from);
    const end = new Date(offer.available_until);
    
    const total = end.getTime() - start.getTime();
    const remaining = end.getTime() - now.getTime();
    
    if (remaining <= 0) return 0;
    if (remaining >= total) return 100;
    
    return Math.max(0, Math.min(100, (remaining / total) * 100));
  };

  const progressPercent = getProgressPercent();
  
  let progressColor = '#16a34a'; // green
  if (progressPercent < 60) progressColor = '#facc15'; // yellow
  if (progressPercent < 30) progressColor = '#ef4444'; // red

  const handleGetDirections = () => {
    if (offer.offer_lng && offer.offer_lat) {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${offer.offer_lat},${offer.offer_lng}`;
      window.open(url, '_blank');
    }
  };

  const handleReserve = async () => {
    if (!user) {
      setToast({ message: '⚠️ Connectez-vous pour réserver', type: 'error' });
      return;
    }

    setIsReserving(true);

    try {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('auth_id', user.id)
        .eq('role', 'client')
        .maybeSingle();

      if (profileError || !profileData) {
        setToast({ message: '❌ Profil client introuvable', type: 'error' });
        setIsReserving(false);
        return;
      }

      const { data: reservation, error: reservationError } = await supabase
        .from('reservations')
        .insert([
          {
            offer_id: offer.offer_id,
            client_id: profileData.id,
            status: 'pending',
          },
        ])
        .select()
        .single();

      if (reservationError) throw reservationError;

      setToast({ message: '✅ Réservation confirmée !', type: 'success' });

      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error: any) {
      console.error('❌ Erreur réservation:', error);
      setToast({ message: error.message || '❌ Erreur lors de la réservation', type: 'error' });
    } finally {
      setIsReserving(false);
    }
  };

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-[2000] flex items-center justify-center p-4"
        onClick={onClose}
      >
        {/* Modal */}
        <div
          className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[95vh] overflow-y-auto relative"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Toast */}
          {toast && (
            <div
              className={`fixed top-4 right-4 z-[9999] px-6 py-3 rounded-lg shadow-lg ${
                toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
              } text-white`}
            >
              {toast.message}
            </div>
          )}

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>

          {/* ZONE 1 & 2 : Infos Marchand + Produit Principal */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 md:p-8">
            {/* ZONE 1 : Infos Marchand (Gauche sur desktop, haut sur mobile) */}
            <div className="space-y-4">
              {/* Logo + Nom */}
              <div className="flex items-center gap-4">
                {offer.merchant_logo_url ? (
                  <img
                    src={offer.merchant_logo_url}
                    alt={offer.merchant_name}
                    className="w-20 h-20 rounded-full object-cover border-4 border-green-200 shadow-lg flex-shrink-0"
                    crossOrigin="anonymous"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-3xl flex-shrink-0 shadow-lg">
                    🏪
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h2 className="text-2xl font-bold text-gray-900 mb-1">{offer.merchant_name}</h2>
                  
                  {/* 🆕 Emplacement Avis (Visuel uniquement) */}
                  <div className="flex items-center gap-1 text-sm text-gray-500 mb-2">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} className="w-4 h-4 fill-gray-300 text-gray-300" />
                      ))}
                    </div>
                    <span className="ml-1">Bientôt disponible</span>
                  </div>
                </div>
              </div>

              {/* Adresse */}
              {offer.merchant_street && (
                <div className="flex items-start gap-3 text-gray-700 bg-gray-50 rounded-lg p-3">
                  <MapPin className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{offer.merchant_street}</p>
                    {offer.merchant_city && (
                      <p className="text-sm text-gray-600">
                        {offer.merchant_postal_code} {offer.merchant_city}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Téléphone */}
              {offer.merchant_phone && (
                <a
                  href={`tel:${offer.merchant_phone}`}
                  className="flex items-center gap-3 text-green-600 hover:text-green-700 bg-green-50 rounded-lg p-3 transition-colors"
                >
                  <Phone className="w-5 h-5 flex-shrink-0" />
                  <span className="font-semibold">{offer.merchant_phone}</span>
                </a>
              )}

              {/* Bouton Itinéraire */}
              <button
                onClick={handleGetDirections}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition-colors shadow-md"
              >
                <Navigation className="w-5 h-5" />
                Voir l'itinéraire
              </button>

              {/* Distance (si disponible) */}
              {offer.distance_meters > 0 && (
                <div className="text-center text-sm text-gray-600 bg-gray-50 rounded-lg p-2">
                  📍 À {(offer.distance_meters / 1000).toFixed(1)} km de vous
                </div>
              )}
            </div>

            {/* ZONE 2 : Produit Principal (Droite sur desktop, bas sur mobile) */}
            <div className="space-y-4">
              {/* Image Produit */}
              {offer.image_url && (
                <div className="relative rounded-xl overflow-hidden shadow-lg">
                  <img
                    src={offer.image_url}
                    alt={offer.title}
                    className="w-full h-64 md:h-80 object-cover"
                    crossOrigin="anonymous"
                    referrerPolicy="no-referrer"
                  />
                  {/* Badge réduction */}
                  <div className="absolute top-4 right-4 bg-red-600 text-white px-4 py-2 rounded-lg font-bold text-lg shadow-lg">
                    -{getDiscountPercent(offer.price_before, offer.price_after)}%
                  </div>
                </div>
              )}

              {/* Titre */}
              <h3 className="text-2xl md:text-3xl font-bold text-gray-900">{offer.title}</h3>

              {/* Description */}
              {offer.description && (
                <p className="text-gray-600 text-sm md:text-base leading-relaxed">{offer.description}</p>
              )}

              {/* Prix */}
              <div className="flex items-baseline gap-3 bg-green-50 rounded-lg p-4">
                <span className="text-4xl font-bold text-green-600">
                  {offer.price_after.toFixed(2)}€
                </span>
                <span className="text-xl text-gray-400 line-through">
                  {offer.price_before.toFixed(2)}€
                </span>
              </div>

              {/* Timer + Barre de progression */}
              {offer.available_until && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-gray-700">
                      <Clock className="w-4 h-4" />
                      <span className="font-semibold">{getTimeRemaining(offer.available_until)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-700">
                      <Package className="w-4 h-4" />
                      <span className="font-semibold">Stock: {offer.quantity}</span>
                    </div>
                  </div>

                  {/* Barre de progression */}
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full transition-all duration-300 rounded-full"
                      style={{
                        width: `${progressPercent}%`,
                        backgroundColor: progressColor,
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Bouton Réserver */}
              <button
                onClick={handleReserve}
                disabled={isReserving || (offer.quantity && offer.quantity <= 0)}
                className={`w-full py-4 rounded-lg font-bold text-lg shadow-lg transition-all ${
                  isReserving || (offer.quantity && offer.quantity <= 0)
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-green-500 hover:bg-green-600 text-white hover:shadow-xl'
                }`}
              >
                {isReserving ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Réservation en cours...
                  </div>
                ) : offer.quantity && offer.quantity <= 0 ? (
                  'Rupture de stock'
                ) : (
                  '🛒 Réserver maintenant'
                )}
              </button>
            </div>
          </div>

          {/* ZONE 3 : Autres produits du marchand */}
          {merchantOffers.length > 0 && (
            <div className="border-t border-gray-200 px-6 md:px-8 py-6 bg-gray-50">
              <h4 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Package className="w-5 h-5 text-green-600" />
                Autres produits disponibles
              </h4>

              {/* Scroll horizontal sur desktop, vertical sur mobile */}
              <div className="overflow-x-auto md:overflow-x-scroll pb-2">
                <div className="flex md:flex-row flex-col gap-4 md:w-max">
                  {merchantOffers.map((otherOffer) => (
                    <div
                      key={otherOffer.offer_id}
                      onClick={() => {
                        onClose();
                        setTimeout(() => {
                          // Simuler un clic sur cette offre
                          window.dispatchEvent(
                            new CustomEvent('openOfferDetails', { detail: otherOffer })
                          );
                        }, 300);
                      }}
                      className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all cursor-pointer overflow-hidden border border-gray-200 md:w-64 w-full flex-shrink-0"
                    >
                      {/* Image */}
                      {otherOffer.image_url && (
                        <img
                          src={otherOffer.image_url}
                          alt={otherOffer.title}
                          className="w-full h-40 object-cover"
                          crossOrigin="anonymous"
                          referrerPolicy="no-referrer"
                        />
                      )}

                      {/* Info */}
                      <div className="p-3">
                        <h5 className="font-bold text-gray-900 text-sm mb-2 line-clamp-2">
                          {otherOffer.title}
                        </h5>

                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-bold text-green-600 text-lg">
                            {otherOffer.price_after.toFixed(2)}€
                          </span>
                          <span className="line-through text-gray-400 text-xs">
                            {otherOffer.price_before.toFixed(2)}€
                          </span>
                          <span className="text-xs text-red-600 font-semibold bg-red-50 px-1.5 py-0.5 rounded">
                            -{getDiscountPercent(otherOffer.price_before, otherOffer.price_after)}%
                          </span>
                        </div>

                        <div className="text-xs text-gray-600 flex items-center justify-between">
                          {otherOffer.available_until && (
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {getTimeRemaining(otherOffer.available_until)}
                            </span>
                          )}
                          <span>Stock: {otherOffer.quantity}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {loadingOtherOffers && (
            <div className="border-t border-gray-200 px-6 md:px-8 py-6 bg-gray-50 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto"></div>
              <p className="text-sm text-gray-600 mt-2">Chargement des autres produits...</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};