import React, { useEffect, useRef, useState } from 'react';
import { X, MapPin, Phone, Navigation } from 'lucide-react';

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

interface MerchantBottomSheetProps {
  merchantId: string | null;
  offers: Offer[];
  onClose: () => void;
  onOfferClick: (offer: Offer) => void;
}

export const MerchantBottomSheet: React.FC<MerchantBottomSheetProps> = ({
  merchantId,
  offers,
  onClose,
  onOfferClick,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const sheetRef = useRef<HTMLDivElement>(null);
  const [startY, setStartY] = useState(0);
  const [currentY, setCurrentY] = useState(0);

  useEffect(() => {
    if (merchantId) {
      setTimeout(() => setIsVisible(true), 10);
    }
  }, [merchantId]);

  if (!merchantId || offers.length === 0) return null;

  const merchantInfo = offers[0];

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  const getDiscountPercent = (before: number, after: number) => {
    if (!before || before === 0) return 0;
    return Math.round(((before - after) / before) * 100);
  };

  const getTimeRemaining = (until?: string) => {
    if (!until) return '';
    const diff = new Date(until).getTime() - Date.now();
    if (diff <= 0) return '⏰ Expirée';
    const h = Math.floor(diff / 1000 / 60 / 60);
    const m = Math.floor((diff / 1000 / 60) % 60);
    return h > 0 ? `⏰ ${h}h ${m}min` : `⏰ ${m} min`;
  };

  const handleGetDirections = () => {
    if (merchantInfo.offer_lng && merchantInfo.offer_lat) {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${merchantInfo.offer_lat},${merchantInfo.offer_lng}`;
      window.open(url, '_blank');
    }
  };

  // Swipe gesture handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    setStartY(e.touches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const currentTouch = e.touches[0].clientY;
    const diff = currentTouch - startY;
    
    // Only allow downward swipes
    if (diff > 0) {
      setCurrentY(diff);
    }
  };

  const handleTouchEnd = () => {
    // If swiped down more than 100px, close the sheet
    if (currentY > 100) {
      handleClose();
    }
    setCurrentY(0);
  };

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black transition-opacity duration-300 z-[1400] ${
          isVisible ? 'opacity-50' : 'opacity-0'
        }`}
        onClick={handleClose}
      />

      {/* Bottom Sheet / Side Panel */}
      <div
        ref={sheetRef}
        className={`fixed bg-white shadow-2xl z-[1500] transition-transform duration-300 ease-out
          md:right-0 md:top-0 md:bottom-0 md:w-[40vw] md:max-w-lg md:rounded-l-3xl
          bottom-0 left-0 right-0 rounded-t-3xl max-h-[85vh] md:max-h-full
          ${isVisible ? 'md:translate-x-0 translate-y-0' : 'md:translate-x-full translate-y-full'}
        `}
        style={{
          transform: currentY > 0 ? `translateY(${currentY}px)` : undefined,
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Drag Handle (Mobile only) */}
        <div className="md:hidden flex justify-center pt-3 pb-2 cursor-pointer" onClick={handleClose}>
          <div className="w-14 h-1.5 bg-gray-400 rounded-full"></div>
        </div>

        {/* Header with Merchant Info */}
        <div className="sticky top-0 bg-white z-10 border-b border-gray-200 px-4 md:px-6 py-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3 flex-1">
              {/* Logo */}
              {merchantInfo.merchant_logo_url ? (
                <img
                  src={merchantInfo.merchant_logo_url}
                  alt={merchantInfo.merchant_name}
                  className="w-14 h-14 md:w-16 md:h-16 rounded-full object-cover border-2 border-green-200 shadow flex-shrink-0"
                  crossOrigin="anonymous"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    const target = e.currentTarget as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
              ) : (
                <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-2xl flex-shrink-0">
                  🏪
                </div>
              )}

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-gray-900 text-lg md:text-xl mb-1 truncate">
                  {merchantInfo.merchant_name}
                </h3>
                
                {/* Address */}
                {merchantInfo.merchant_street && (
                  <p className="text-xs md:text-sm text-gray-600 flex items-start gap-1 mb-1">
                    <MapPin className="w-3 h-3 md:w-4 md:h-4 mt-0.5 flex-shrink-0" />
                    <span className="line-clamp-2">
                      {merchantInfo.merchant_street}
                      {merchantInfo.merchant_city && `, ${merchantInfo.merchant_city}`}
                    </span>
                  </p>
                )}

                {/* Phone */}
                {merchantInfo.merchant_phone && (
                  <a
                    href={`tel:${merchantInfo.merchant_phone}`}
                    className="text-xs md:text-sm text-green-600 hover:text-green-700 flex items-center gap-1 font-medium"
                  >
                    <Phone className="w-3 h-3 md:w-4 md:h-4" />
                    {merchantInfo.merchant_phone}
                  </a>
                )}

                {/* Badge nombre d'offres */}
                <div className="mt-2">
                  <span className="inline-block bg-green-100 text-green-800 px-2 py-0.5 rounded-full text-xs font-semibold">
                    {offers.length} offre{offers.length > 1 ? 's' : ''} disponible{offers.length > 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            </div>

            {/* Close button (Desktop) */}
            <button
              onClick={handleClose}
              className="hidden md:flex ml-2 p-2 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0"
              title="Fermer"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Directions Button */}
          <button
            onClick={handleGetDirections}
            className="w-full mt-3 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors text-sm"
          >
            <Navigation className="w-4 h-4" />
            Itinéraire
          </button>
        </div>

        {/* Offers List */}
        <div className="overflow-y-auto px-4 md:px-6 py-4 max-h-[calc(85vh-200px)] md:max-h-[calc(100vh-250px)]">
          <div className="space-y-3">
            {offers.map((offer) => (
              <div
                key={offer.offer_id}
                onClick={() => onOfferClick(offer)}
                className="flex bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all cursor-pointer overflow-hidden h-28"
              >
                {/* Image */}
                {offer.image_url && (
                  <img
                    src={offer.image_url}
                    alt={offer.title}
                    className="w-28 h-28 object-cover flex-shrink-0"
                    crossOrigin="anonymous"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).style.display = 'none';
                    }}
                  />
                )}

                {/* Info */}
                <div className="flex-1 p-3 flex flex-col justify-between min-w-0">
                  {/* Title */}
                  <h4 className="font-bold text-gray-900 text-sm line-clamp-1">
                    {offer.title}
                  </h4>

                  {/* Price + Discount */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-green-600 text-base">
                      {offer.price_after.toFixed(2)}€
                    </span>
                    <span className="line-through text-gray-400 text-xs">
                      {offer.price_before.toFixed(2)}€
                    </span>
                    <span className="text-xs text-red-600 font-semibold bg-red-50 px-1.5 py-0.5 rounded">
                      -{getDiscountPercent(offer.price_before, offer.price_after)}%
                    </span>
                  </div>

                  {/* Timer + Stock */}
                  <div className="flex items-center justify-between text-xs">
                    {offer.available_until && (
                      <span className="text-gray-600 font-medium">
                        {getTimeRemaining(offer.available_until)}
                      </span>
                    )}
                    <span className="text-gray-600">
                      Stock: <span className="font-semibold">{offer.quantity}</span>
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};