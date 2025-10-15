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
 * Hook to fetch nearby offers using the get_offers_nearby_dynamic function
 * This provides real-time offer data with distance calculations
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

      console.log('Fetching offers with get_offers_nearby_dynamic:', {
        clientId,
        radiusMeters
      });

      const { data, error: rpcError } = await supabase.rpc('get_offers_nearby_dynamic', {
        p_client_id: clientId,
        p_radius_meters: radiusMeters
      });

      if (rpcError) {
        console.error('RPC Error (get_offers_nearby_dynamic):', rpcError);
        setError(`Erreur: ${rpcError.message}`);
        setOffers([]);
      } else {
        console.log(`Loaded ${data?.length || 0} offers from get_offers_nearby_dynamic`);
        setOffers(data || []);
      }
    } catch (err) {
      console.error('Error fetching dynamic offers:', err);
      setError('Impossible de charger les offres');
    } finally {
      setLoading(false);
    }
  }, [clientId, radiusMeters, enabled]);

  useEffect(() => {
    fetchOffers();

    if (!autoRefresh || !clientId || !enabled) {
      return;
    }

    // Subscribe to realtime updates on offers table
    console.log('Setting up realtime subscription for offers...');
    const channel = supabase
      .channel('dynamic-offers-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'offers'
        },
        (payload) => {
          console.log('Offers table changed (dynamic):', payload);
          fetchOffers();
        }
      )
      .subscribe();

    return () => {
      console.log('Cleaning up realtime subscription...');
      supabase.removeChannel(channel);
    };
  }, [fetchOffers, clientId, enabled, autoRefresh]);

  return {
    offers,
    loading,
    error,
    refetch: fetchOffers
  };
}
