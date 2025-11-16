import React, { useState, useEffect } from 'react';
import { Clock, MapPin, Star, Heart, ArrowRight, MapPinOff } from 'lucide-react';
import { getActiveOffers, type Offer } from '../api/offers';
import { useAuth } from '../hooks/useAuth';
import { QuantityModal } from './QuantityModal';
import { createReservation } from '../api/reservations';
import { supabase } from '../lib/supabaseClient';
import { useNearbyOffers } from '../hooks/useNearbyOffers';
import { useClientLocation } from '../hooks/useClientLocation';
import { getPublicImageUrl } from '../lib/supabasePublic';

interface FeaturedOffersProps {
  onOpenDownloadModal?: () => void;
}

const FeaturedOffers: React.FC<FeaturedOffersProps> = ({ onOpenDownloadModal }) => {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
  const [reserving, setReserving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const { user } = useAuth();
  const { location: clientLocation } = useClientLocation(user?.id || null);

  // Use nearby offers for authenticated users, all offers for guests
  const {
    offers: nearbyOffers,
    loading: nearbyLoading
  } = useNearbyOffers({
    clientId: user?.id || null,
    radiusKm: 10,
    enabled: !!user && !!clientLocation
  });

  useEffect(() => {
    // For non-authenticated users, fetch all offers once
    if (!user) {
      fetchOffers();
    } else {
      // For authenticated users, use nearby offers from hook
      setLoading(nearbyLoading);
      if (!nearbyLoading) {
        const formattedOffers = nearbyOffers.map(offer => ({
          id: offer.id,
          title: offer.title,
          description: offer.description,
          original_price: offer.price_before,
          discounted_price: offer.price_after,
          discount_percentage: offer.discount_percent,
          image_url: offer.image_url || 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400',
          quantity: offer.quantity,
          merchant_id: offer.merchant_id,
          merchant: {
            company_name: offer.merchant_name,
            full_address: '',
            street: '',
            city: '',
            avg_rating: 4.5
          },
          available_until: offer.available_until,
          is_active: true
        }));
        setOffers(formattedOffers);
      }
    }
  }, [user, nearbyOffers, nearbyLoading]);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const fetchOffers = async () => {
    try {
      setLoading(true);
      const data = await getActiveOffers();
      setOffers(data.slice(0, 6));
    } catch (error) {
      console.error('Error fetching offers:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTimeLeft = (dateString: string) => {
    const now = new Date();
    const end = new Date(dateString);
    const diff = end.getTime() - now.getTime();

    if (diff <= 0) return 'Süresi Doldu';

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    return `${hours}s ${minutes}dk kalan`;
  };

  const handleReserve = (offer: Offer) => {
    console.log('Reserve button clicked', { user: user?.id, offer: offer.id });

    if (!user) {
      console.log('User not authenticated, cannot reserve');
      setToast({ message: 'Rezervasyon yapmak için lütfen giriş yapın', type: 'error' });
      return;
    }

    if (!clientLocation) {
      console.warn('User location not available yet');
      setToast({ message: 'Konumunuz yüklenirken lütfen bekleyin...', type: 'error' });
      return;
    }

    if (!offer.merchant_id) {
      console.error('Offer missing merchant_id:', offer);
      setToast({ message: 'Geçersiz teklif verisi', type: 'error' });
      return;
    }

    console.log('Opening quantity modal for offer:', offer.id);
    setSelectedOffer(offer);
  };

  const handleConfirmReservation = async (quantity: number) => {
    if (!selectedOffer) {
      console.error('No offer selected');
      return;
    }

    if (!user) {
      console.error('User not authenticated');
      setToast({ message: 'Rezervasyon yapmak için lütfen giriş yapın', type: 'error' });
      setSelectedOffer(null);
      return;
    }

    if (!selectedOffer.merchant_id) {
      console.error('Offer missing merchant_id');
      setToast({ message: 'Geçersiz teklif: işletme bilgisi eksik', type: 'error' });
      setSelectedOffer(null);
      return;
    }

    console.log('Confirming reservation:', {
      offerId: selectedOffer.id,
      merchantId: selectedOffer.merchant_id,
      quantity,
      userId: user.id
    });

    setReserving(true);
    try {
      const result = await createReservation(selectedOffer.id, selectedOffer.merchant_id, quantity);

      if (result.success) {
        console.log('Reservation successful:', result.data);
        setToast({ message: 'Rezervasyon başarıyla oluşturuldu!', type: 'success' });
        setSelectedOffer(null);
        fetchOffers();
      } else {
        console.error('Reservation failed:', result.error);
        setToast({ message: result.error || 'Rezervasyon oluşturulamadı', type: 'error' });
      }
    } catch (error: any) {
      console.error('Exception during reservation:', error);
      setToast({ message: error.message || 'Bir hata oluştu', type: 'error' });
    } finally {
      setReserving(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-gray-200 rounded-lg h-80 animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Öne Çıkan Teklifler</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Yerel restoranlardan inanılmaz fırsatlar keşfedin. Tüm detayları görmek ve favorilerinizi rezerve etmek için kaydolun!
          </p>
        </div>

        {offers.length === 0 ? (
          <div className="text-center py-12">
            {user ? (
              <>
                <MapPinOff className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-xl text-gray-600 mb-6">
                  Bölgenizde teklif bulunmuyor
                </p>
                <p className="text-gray-500 mb-4">
                  Konumunuzun 50km yarıçapında hiçbir teklif bulamadık.
                </p>
                <p className="text-sm text-gray-400">
                  Profilinizden adresinizi değiştirin veya yeni teklifler için daha sonra tekrar kontrol edin.
                </p>
              </>
            ) : (
              <>
                <p className="text-xl text-gray-600 mb-6">
                  Henüz teklif yok. Yakında tekrar kontrol edin!
                </p>
                <p className="text-gray-500">
                  İşletmeler kontrol panellerinden teklif ekleyebilir.
                </p>
              </>
            )}
          </div>
        ) : (
          <>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {offers.map((offer) => (
            <div key={offer.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow group">
              <div className="relative">
                <img
                  src={getPublicImageUrl(offer.image_url)}
                  alt={offer.title}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300 bg-gray-100"
                  referrerPolicy="no-referrer"
                  crossOrigin="anonymous"
                  onError={(e) => {
                    console.error('❌ Featured offer image load failed for:', offer.title, '| URL:', offer.image_url);
                    (e.currentTarget as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23e5e7eb" width="400" height="300"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="18" fill="%239ca3af"%3EImage unavailable%3C/text%3E%3C/svg%3E';
                  }}
                />
                <div className="absolute top-4 left-4 bg-red-500 text-white px-2 py-1 rounded-md text-sm font-bold">
                  -{offer.discount_percentage}%
                </div>
                <button className="absolute top-4 right-4 bg-white bg-opacity-90 p-2 rounded-full hover:bg-opacity-100 transition-all">
                  <Heart className="w-5 h-5 text-gray-600 hover:text-red-500" />
                </button>
              </div>

              <div className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="text-sm text-gray-600">{offer.merchant?.avg_rating || 'N/A'}</span>
                  </div>
                  <div className="flex items-center text-sm text-red-600">
                    <Clock className="w-4 h-4 mr-1" />
                    {formatTimeLeft(offer.available_until)}
                  </div>
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-2">{offer.title}</h3>
                <p className="text-gray-600 mb-3 text-sm">{offer.description}</p>

                <div className="flex items-center text-sm text-gray-500 mb-4">
                  <MapPin className="w-4 h-4 mr-1" />
                  <span>{offer.merchant?.company_name || 'Bilinmeyen İşletme'}</span>
                  {!user && <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">Tam adresi görmek için giriş yapın</span>}
                  {user && offer.merchant?.full_address && (
                    <span className="ml-2 text-xs text-gray-400">• {offer.merchant.full_address}</span>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl font-bold text-[#00A690]">
                      ${offer.discounted_price}
                    </span>
                    <span className="text-lg text-gray-400 line-through">
                      ${offer.original_price}
                    </span>
                  </div>
                  {user ? (
                    <button
                      onClick={() => handleReserve(offer)}
                      disabled={!offer.quantity || offer.quantity <= 0}
                      className="bg-[#00A690] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#F75C00] transition-colors duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      {!offer.quantity || offer.quantity <= 0 ? 'Tükendi' : 'Şimdi Rezerve Et'}
                    </button>
                  ) : (
                    <button
                      onClick={onOpenDownloadModal}
                      className="bg-[#00A690] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#F75C00] transition-colors"
                    >
                      Rezerve Etmek İçin Giriş Yapın
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        </>
        )}
      </div>

      {/* Quantity Modal */}
      {selectedOffer && (
        <QuantityModal
          isOpen={true}
          onClose={() => setSelectedOffer(null)}
          onConfirm={handleConfirmReservation}
          offerTitle={selectedOffer.title}
          availableQuantity={selectedOffer.quantity || 0}
          price={selectedOffer.discounted_price}
          loading={reserving}
        />
      )}

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-4 right-4 z-50 animate-slide-up">
          <div
            className={`px-6 py-3 rounded-lg shadow-lg ${
              toast.type === 'success' ? 'bg-[#00A690]' : 'bg-red-500'
            } text-white font-medium`}
          >
            {toast.message}
          </div>
        </div>
      )}
    </div>
  );
};

export default FeaturedOffers;