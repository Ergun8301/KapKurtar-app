import React from 'react';
import { X, MapPin, Navigation, Clock, Tag } from 'lucide-react';
import { getPublicImageUrl } from '../lib/supabasePublic';

interface OfferDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReserve: () => void;
  offer: {
    id: string;
    title: string;
    description?: string;
    image_url?: string;
    price_before?: number;
    price_after: number;
    quantity?: number;
    available_until: string;
    category?: string;
    distance_km?: number;
    merchant_address?: string;
    merchant_street?: string;
    merchant_city?: string;
    merchant_postal_code?: string;
    merchant_lat?: number;
    merchant_lng?: number;
  };
  onViewMap?: () => void;
}

export const OfferDetailsModal: React.FC<OfferDetailsModalProps> = ({
  isOpen,
  onClose,
  onReserve,
  offer,
  onViewMap
}) => {
  if (!isOpen) return null;

  const calculateDiscount = (priceBefore: number, priceAfter: number): number => {
    return Math.round(100 * (1 - priceAfter / priceBefore));
  };

  const discount = offer.price_before ? calculateDiscount(offer.price_before, offer.price_after) : 0;

  const formatDistance = (distanceKm?: number): string => {
    if (!distanceKm) return '';
    if (distanceKm < 1) {
      return `${Math.round(distanceKm * 1000)}m`;
    }
    return `${distanceKm.toFixed(1)}km`;
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

  const formatTimeRemaining = (availableUntil: string): string => {
    const now = new Date();
    const until = new Date(availableUntil);
    const diffMs = until.getTime() - now.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    if (diffHours > 24) {
      const diffDays = Math.floor(diffHours / 24);
      return `${diffDays}j`;
    }
    if (diffHours > 0) {
      return `${diffHours}h ${diffMinutes}m`;
    }
    return `${diffMinutes}m`;
  };

  const fullAddress = formatAddress();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-60">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="relative">
          {offer.image_url ? (
            <img
              src={getPublicImageUrl(offer.image_url)}
              alt={offer.title}
              className="w-full h-80 object-cover rounded-t-2xl bg-gray-100"
              referrerPolicy="no-referrer"
              crossOrigin="anonymous"
              onError={(e) => {
                console.error('❌ Modal image load failed for:', offer.title, '| URL:', offer.image_url);
                (e.currentTarget as HTMLImageElement).classList.add('hidden');
              }}
            />
          ) : (
            <div className="w-full h-80 bg-gradient-to-br from-green-400 to-green-600 rounded-t-2xl flex items-center justify-center">
              <span className="text-white text-6xl font-bold opacity-30">
                {offer.title.charAt(0)}
              </span>
            </div>
          )}

          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>

          {discount > 0 && (
            <div className="absolute top-4 left-4 bg-red-500 text-white px-4 py-2 rounded-full font-bold text-lg shadow-lg">
              -{discount}%
            </div>
          )}

          {offer.category && (
            <div className="absolute bottom-4 left-4 bg-white bg-opacity-95 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium text-gray-700 shadow-md flex items-center gap-1">
              <Tag className="w-4 h-4" />
              {offer.category}
            </div>
          )}
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

          <div className="space-y-4 mb-6">
            <div className="flex items-center text-gray-700">
              <Clock className="w-5 h-5 text-green-600 mr-3" />
              <span className="font-medium">Disponible pendant</span>
              <span className="ml-2 text-green-600 font-semibold">
                {formatTimeRemaining(offer.available_until)}
              </span>
            </div>

            {offer.distance_km !== undefined && (
              <div className="flex items-center text-gray-700">
                <Navigation className="w-5 h-5 text-blue-600 mr-3" />
                <span className="font-medium">Distance</span>
                <span className="ml-2 text-blue-600 font-semibold">
                  {formatDistance(offer.distance_km)}
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

            {onViewMap && (
              <button
                onClick={onViewMap}
                className="ml-8 text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2 transition-colors"
              >
                <MapPin className="w-4 h-4" />
                Voir sur la carte
              </button>
            )}
          </div>

          <div className="border-t border-gray-200 pt-6 mb-6">
            <div className="flex items-end justify-between">
              <div>
                {offer.price_before && (
                  <div className="text-gray-400 line-through text-lg mb-1">
                    ${offer.price_before.toFixed(2)}
                  </div>
                )}
                <div className="text-4xl font-bold text-green-600">
                  ${offer.price_after.toFixed(2)}
                </div>
              </div>

              {offer.quantity !== undefined && (
                <div className="text-right">
                  <div className="text-sm text-gray-500 mb-1">Stock disponible</div>
                  <div className="text-2xl font-semibold text-gray-900">
                    {offer.quantity} unité{offer.quantity !== 1 ? 's' : ''}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-4 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
            >
              Fermer
            </button>
            <button
              onClick={onReserve}
              disabled={offer.quantity === 0}
              className="flex-1 px-6 py-4 bg-green-500 text-white rounded-xl font-semibold hover:bg-green-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
            >
              Réserver maintenant
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
