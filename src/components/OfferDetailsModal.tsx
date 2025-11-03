import React, { useState, useEffect } from 'react';
import { X, MapPin, Navigation, Clock, Tag, Star } from 'lucide-react';
import { getPublicImageUrl } from '../lib/supabasePublic';
import { supabase } from '../lib/supabaseClient';

interface OfferDetailsModalProps {
  offer: {
    offer_id: string;
    merchant_id?: string;
    merchant_name: string;
    title: string;
    description?: string;
    image_url: string;
    price_before: number;
    price_after: number;
    quantity?: number;
    available_until?: string;
    available_from?: string;
    category?: string;
    distance_meters?: number;
    merchant_street?: string;
    merchant_city?: string;
    merchant_postal_code?: string;
    offer_lat: number;
    offer_lng: number;
  } | null;
  onClose: () => void;
}

interface MerchantOffer {
  offer_id: string;
  title: string;
  image_url: string;
  price_after: number;
  price_before: number;
}

export const OfferDetailsModal: React.FC<OfferDetailsModalProps> = ({ offer, onClose }) => {
  const [merchantOffers, setMerchantOffers] = useState<MerchantOffer[]>([]);
  const [averageRating] = useState<number>(4.6);
  const [totalReviews] = useState<number>(32);

  if (!offer) return null;

  useEffect(() => {
    const fetchMerchantOffers = async () => {
      if (!offer.merchant_id) return;

      const { data, error } = await supabase
        .from('offers')
        .select('id, title, image_url, price_after, price_before')
        .eq('merchant_id', offer.merchant_id)
        .eq('is_active', true)
        .neq('id', offer.offer_id)
        .limit(4);

      if (!error && data) {
        setMerchantOffers(data.map(o => ({
          offer_id: o.id,
          title: o.title,
          image_url: o.image_url,
          price_after: o.price_after,
          price_before: o.price_before
        })));
      }
    };

    fetchMerchantOffers();
  }, [offer.merchant_id, offer.offer_id]);

  const calculateDiscount = (priceBefore: number, priceAfter: number): number => {
    return Math.round(100 * (1 - priceAfter / priceBefore));
  };

  const discount = calculateDiscount(offer.price_before, offer.price_after);

  const openGPS = (lat: number, lng: number) => {
    const userAgent = navigator.userAgent.toLowerCase();
    let url = "";
    if (/iphone|ipad|ipod/.test(userAgent)) {
      url = `http://maps.apple.com/?daddr=${lat},${lng}`;
    } else {
      url = `https://www.google.com/maps?q=${lat},${lng}`;
    }
    window.open(url, "_blank");
  };

  const formatDistance = (distanceMeters?: number): string => {
    if (!distanceMeters) return '';
    if (distanceMeters < 1000) {
      return `${Math.round(distanceMeters)}m`;
    }
    return `${(distanceMeters / 1000).toFixed(1)}km`;
  };

  const formatAddress = (): string => {
    const parts = [];
    if (offer.merchant_street) parts.push(offer.merchant_street);
    if (offer.merchant_city) parts.push(offer.merchant_city);
    if (offer.merchant_postal_code) parts.push(offer.merchant_postal_code);

    if (parts.length === 0 && offer.merchant_address) {
      return offer.merchant_address;
    }

    return parts.join(', ') || 'Adresse non disponible';
  };

  const formatTimeRemaining = (availableUntil?: string): { text: string; percent: number; color: string } => {
    if (!availableUntil) return { text: 'Non spécifié', percent: 0, color: '#9ca3af' };

    const now = new Date();
    const until = new Date(availableUntil);
    const from = new Date(offer.available_from || now);

    const total = until.getTime() - from.getTime();
    const remaining = until.getTime() - now.getTime();
    const diffHours = Math.floor(remaining / (1000 * 60 * 60));
    const diffMinutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));

    const percent = total > 0 ? Math.max(0, Math.min(100, (remaining / total) * 100)) : 0;

    let color = '#16a34a';
    if (percent < 60) color = '#facc15';
    if (percent < 30) color = '#ef4444';

    let text = '';
    if (remaining <= 0) {
      text = 'Expirée';
    } else if (diffHours > 24) {
      const diffDays = Math.floor(diffHours / 24);
      text = `${diffDays}j ${diffHours % 24}h`;
    } else if (diffHours > 0) {
      text = `${diffHours}h ${diffMinutes}min`;
    } else {
      text = `${diffMinutes}min`;
    }

    return { text, percent, color };
  };

  const timeData = formatTimeRemaining(offer.available_until);

  const fullAddress = formatAddress();

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black bg-opacity-60" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="relative">
          <img
            src={getPublicImageUrl(offer.image_url)}
            alt={offer.title}
            className="w-full h-80 object-cover rounded-t-2xl bg-gray-100"
            referrerPolicy="no-referrer"
            crossOrigin="anonymous"
            onError={(e) => {
              console.error('Image load failed for:', offer.title);
              (e.currentTarget as HTMLImageElement).src = 'https://via.placeholder.com/800x400?text=Image+non+disponible';
            }}
          />

          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>

          <div className="absolute top-4 left-4 bg-red-500 text-white px-4 py-2 rounded-full font-bold text-lg shadow-lg">
            -{discount}%
          </div>

          <div className="absolute bottom-4 left-4 bg-white bg-opacity-95 backdrop-blur-sm px-4 py-2 rounded-xl shadow-md">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-green-500 text-white flex items-center justify-center font-bold text-lg">
                {offer.merchant_name.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="font-semibold text-gray-800">{offer.merchant_name}</div>
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">{averageRating}</span>
                  <span className="text-gray-400">({totalReviews} avis)</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            {offer.title}
          </h2>

          {offer.description && (
            <p className="text-gray-600 text-base leading-relaxed mb-6">
              {offer.description}
            </p>
          )}

          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-gray-700">
                <Clock className="w-5 h-5 text-green-600" />
                <span className="font-medium">Temps restant</span>
              </div>
              <span className="font-semibold" style={{ color: timeData.color }}>
                {timeData.text}
              </span>
            </div>
            <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full transition-all duration-300 rounded-full"
                style={{
                  width: `${timeData.percent}%`,
                  backgroundColor: timeData.color
                }}
              />
            </div>
          </div>

          <div className="space-y-3 mb-6">
            {offer.distance_meters !== undefined && (
              <div className="flex items-center text-gray-700">
                <Navigation className="w-5 h-5 text-blue-600 mr-3" />
                <span className="font-medium">Distance</span>
                <span className="ml-2 text-blue-600 font-semibold">
                  {formatDistance(offer.distance_meters)}
                </span>
              </div>
            )}

            <div className="flex items-start text-gray-700">
              <MapPin className="w-5 h-5 text-orange-600 mr-3 mt-0.5" />
              <div className="flex-1">
                <span className="font-medium block mb-1">Adresse</span>
                <span className="text-gray-600">
                  {fullAddress}
                </span>
              </div>
            </div>

            <button
              onClick={() => openGPS(offer.offer_lat, offer.offer_lng)}
              className="ml-8 bg-blue-500 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 hover:bg-blue-600 transition-colors"
            >
              <Navigation className="w-4 h-4" />
              Itinéraire
            </button>
          </div>

          <div className="border-t border-gray-200 pt-6 mb-6">
            <div className="flex items-end justify-between">
              <div>
                <div className="text-gray-400 line-through text-lg mb-1">
                  {offer.price_before.toFixed(2)} €
                </div>
                <div className="text-4xl font-bold text-green-600">
                  {offer.price_after.toFixed(2)} €
                </div>
              </div>

              {offer.quantity !== undefined && (
                <div className="text-right">
                  <div className="text-sm text-gray-500 mb-1">Quantité restante</div>
                  <div className="text-2xl font-semibold text-gray-900">
                    {offer.quantity}
                  </div>
                </div>
              )}
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={offer.quantity === 0}
            className="w-full px-6 py-4 bg-green-500 text-white rounded-xl font-semibold hover:bg-green-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed shadow-lg hover:shadow-xl mb-6"
          >
            Réserver maintenant
          </button>

          {merchantOffers.length > 0 && (
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Autres produits du même commerçant</h3>
              <div className="grid grid-cols-2 gap-3">
                {merchantOffers.map((merchantOffer) => (
                  <div key={merchantOffer.offer_id} className="bg-gray-50 rounded-lg overflow-hidden hover:shadow-md transition-shadow cursor-pointer">
                    <img
                      src={getPublicImageUrl(merchantOffer.image_url)}
                      alt={merchantOffer.title}
                      className="w-full h-24 object-cover"
                      referrerPolicy="no-referrer"
                      crossOrigin="anonymous"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = 'https://via.placeholder.com/200x120?text=Image';
                      }}
                    />
                    <div className="p-2">
                      <h4 className="text-sm font-semibold text-gray-800 truncate">{merchantOffer.title}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-green-600 font-bold text-sm">{merchantOffer.price_after.toFixed(2)} €</span>
                        <span className="text-gray-400 line-through text-xs">{merchantOffer.price_before.toFixed(2)} €</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
