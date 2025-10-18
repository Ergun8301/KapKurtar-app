import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';

export interface DynamicOffer {
  offer_id: string;
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
  distance_meters: number;
  offer_lat: number;
  offer_lng: number;
  created_at: string;
}

interface UseDynamicOffersOptions {
  clientId: string | null;
  radiusMeters?: number;
  enabled?: boolean;
  autoRefresh?: boolean;
}

interface UseDynamicOffersReturn {
  offers: DynamicOffer[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook to fetch nearby offers using the get_offers_nearby_dynamic_v2 function
 * This provides real-time offer data with distance calculations using merchant coordinates
 */
export function useDynamicOffers({
  clientId,
  radiusMeters = 5000,
  enabled = true,
  autoRefresh = true
}: UseDynamicOffersOptions): UseDynamicOffersReturn {
  const [offers, setOffers] = useState<DynamicOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOffers = useCallback(async () => {
    if (!clientId || !enabled) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log('Fetching offers with get_offers_nearby_dynamic_v2:', {
        clientId,
        radiusMeters
      });

      const { data, error: rpcError } = await supabase.rpc('get_offers_nearby_dynamic_v2', {
        client_id: clientId,
        radius_meters: radiusMeters
      });

      if (rpcError) {
        console.error('RPC Error (get_offers_nearby_dynamic_v2):', rpcError);
        setError(`Erreur: ${rpcError.message}`);
        setOffers([]);
      } else {
        console.log(`Loaded ${data?.length || 0} offers from get_offers_nearby_dynamic_v2`);
        console.log('Sample offer from v2:', data?.[0]);

        // Map v2 response to DynamicOffer interface
        const mappedOffers: DynamicOffer[] = (data || []).map((offer: any) => ({
          offer_id: offer.offer_id,
          merchant_id: offer.merchant_id,
          merchant_name: offer.company_name,
          merchant_street: offer.merchant_street,
          merchant_city: offer.merchant_city,
          merchant_postal_code: offer.merchant_postal_code,
          title: offer.title,
          description: offer.description || '',
          image_url: offer.image_url,
          price_before: parseFloat(offer.price_before),
          price_after: parseFloat(offer.price_after),
          discount_percent: Math.round((1 - parseFloat(offer.price_after) / parseFloat(offer.price_before)) * 100),
          available_from: offer.available_from,
          available_until: offer.available_until,
          quantity: offer.quantity,
          distance_meters: offer.distance_meters,
          offer_lat: offer.merchant_lat,
          offer_lng: offer.merchant_lng,
          created_at: offer.created_at
        }));

        setOffers(mappedOffers);
      }
    } catch (err) {
      console.error('Error fetching dynamic offers:', err);
      setError('Impossible de charger les offres');
    } finally {
      setLoading(false);
    }
  }, [clientId, radiusMeters, enabled]);

  useEffect(() => {
    if (!clientId || !enabled) {
      setLoading(false);
      return;
    }

    fetchOffers();
  }, [clientId, radiusMeters, enabled]);

  return {
    offers,
    loading,
    error,
    refetch: fetchOffers
  };
}
