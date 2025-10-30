import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export interface NearbyOffer {
  offer_id: string;
  title: string;
  merchant_name: string;
  price_before: number;
  price_after: number;
  discount_percent: number;
  distance_meters: number;
  image_url: string | null;
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
  enabled = true,
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

      // ✅ On utilise maintenant la fonction sécurisée
      const { data, error: rpcError } = await supabase.rpc(
        'get_offers_nearby_dynamic_secure',
        {
          client_id: clientId,
          radius_meters: radiusMeters,
        }
      );

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

      setOffers(
        data.map((offer: any) => ({
          offer_id: offer.offer_id,
          title: offer.title,
          merchant_name: offer.merchant_name,
          price_before: parseFloat(offer.price_before),
          price_after: parseFloat(offer.price_after),
          discount_percent: offer.discount_percent,
          distance_meters: offer.distance_meters,
          image_url: offer.image_url || null,
        }))
      );
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

  return { offers, loading, error, refetch: fetchOffers };
}
