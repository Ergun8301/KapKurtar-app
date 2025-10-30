import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import type { GetOffersNearbyDynamicResponse } from '../types/supabase';

export interface NearbyOffer {
  id: string;
  merchant_id: string;
  merchant_name: string;
  merchant_street?: string;
  merchant_city?: string;
  merchant_postal_code?: string;
  title: string;
  description: string;
  image_url: string | null;
  price_before: number;
  price_after: number;
  discount_percent: number;
  available_from: string;
  available_until: string;
  quantity: number;
  distance_m: number;
  offer_lat?: number;
  offer_lng?: number;
  created_at?: string;
}

interface UseNearbyOffersOptions {
  clientId: string | null;
  radiusKm: number;
  enabled?: boolean;
}

interface UseNearbyOffersReturn {
  offers: NearbyOffer[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useNearbyOffers({
  clientId,
  radiusKm,
  enabled = true
}: UseNearbyOffersOptions): UseNearbyOffersReturn {
  const [offers, setOffers] = useState<NearbyOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOffers = async () => {
    if (!clientId || !enabled) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const radiusMeters = Math.round(radiusKm * 1000);

      // ✅ On passe à la fonction sécurisée
      const { data, error: rpcError } = await supabase.rpc('get_offers_nearby_dynamic_secure', {
        client_id: clientId,
        radius_meters: radiusMeters
      });

      if (rpcError) {
        console.error('Erreur RPC Supabase:', rpcError);
        setError('Impossible de charger les offres à proximité');
        setOffers([]);
        return;
      }

      if (!data || data.length === 0) {
        setOffers([]);
        return;
      }

      // 🖼️ On génère l’URL publique des images (pour éviter les blocages RLS)
      const offersWithImages = data.map((offer: any) => {
        if (!offer.image_url) return offer;
        const { data: publicUrlData } = supabase.storage
          .from('product-images')
          .getPublicUrl(offer.image_url);
        return {
          ...offer,
          image_url: publicUrlData?.publicUrl || null,
        };
      });

      // ✅ Conversion typée propre
      const mappedOffers: NearbyOffer[] = offersWithImages.map((offer: any) => ({
        id: offer.offer_id || offer.id,
        merchant_id: offer.merchant_id,
        merchant_name: offer.merchant_name || '',
        title: offer.title,
        description: offer.description || '',
        image_url: offer.image_url || null,
        price_before: parseFloat(offer.price_before),
        price_after: parseFloat(offer.price_after),
        discount_percent: offer.discount_percent ?? 0,
        available_from: offer.available_from || '',
        available_until: offer.available_until || '',
        quantity: offer.quantity ?? 0,
        distance_m: Math.round(offer.distance_meters ?? 0),
        created_at: offer.created_at || ''
      }));

      setOffers(mappedOffers);
    } catch (err) {
      console.error('Erreur JS côté client:', err);
      setError('Impossible de charger les offres à proximité');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!clientId || !enabled) {
      setLoading(false);
      return;
    }

    fetchOffers();
  }, [clientId, radiusKm, enabled]);

  return {
    offers,
    loading,
    error,
    refetch: fetchOffers
  };
}
