import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

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
      console.log('[RPC] get_offers_nearby_dynamic args:', { clientId, radiusMeters });

      // Try the new dynamic function first
      const { data: dynamicData, error: dynamicError } = await supabase.rpc('get_offers_nearby_dynamic', {
        p_client_id: clientId,
        p_radius_meters: radiusMeters
      });

      console.log('[RPC] get_offers_nearby_dynamic result:', { dynamicData, dynamicError });

      if (!dynamicError && dynamicData) {
        console.log('[RPC] dynamicData sample:', dynamicData[0]);
        console.log('[RPC] dynamicData count:', dynamicData.length);

        // Map the dynamic response to match our interface
        const mappedOffers: NearbyOffer[] = dynamicData.map((offer: any) => {
          const mapped = {
            id: offer.offer_id,
            merchant_id: offer.merchant_id,
            merchant_name: offer.merchant_name,
            merchant_street: offer.merchant_street,
            merchant_city: offer.merchant_city,
            merchant_postal_code: offer.merchant_postal_code,
            title: offer.title,
            description: offer.description,
            image_url: offer.image_url,
            price_before: parseFloat(offer.price_before),
            price_after: parseFloat(offer.price_after),
            discount_percent: offer.discount_percent,
            available_from: offer.available_from,
            available_until: offer.available_until,
            quantity: offer.quantity,
            distance_m: offer.distance_meters,
            offer_lat: offer.offer_lat,
            offer_lng: offer.offer_lng,
            created_at: offer.created_at
          };

          if (!mapped.offer_lat || !mapped.offer_lng) {
            console.warn('[RPC] Offer missing lat/lng:', offer);
          }

          return mapped;
        });

        console.log('[RPC] mappedOffers sample:', mappedOffers[0]);
        console.log('[RPC] mappedOffers count:', mappedOffers.length);
        setOffers(mappedOffers);
        return;
      }

      // Fallback to old function
      console.log('[RPC] Trying fallback function get_offers_near_client with args:', { clientId, radiusMeters });
      const { data, error: rpcError } = await supabase.rpc('get_offers_near_client', {
        client_id: clientId,
        radius_meters: radiusMeters
      });

      console.log('[RPC] get_offers_near_client result:', { data, rpcError });

      if (rpcError) {
        console.error('RPC Error:', rpcError);
        const fallbackData = await fetchOffersFallback(clientId, radiusMeters);
        setOffers(fallbackData);
      } else {
        setOffers(data || []);
      }
    } catch (err) {
      console.error('Error fetching nearby offers:', err);
      setError('Impossible de charger les offres à proximité');
    } finally {
      setLoading(false);
    }
  };

  const fetchOffersFallback = async (
    clientId: string,
    radiusMeters: number
  ): Promise<NearbyOffer[]> => {
    const { data: clientData, error: clientError } = await supabase
      .from('clients')
      .select('location')
      .eq('id', clientId)
      .maybeSingle();

    if (clientError || !clientData?.location) {
      throw new Error('Client location not found');
    }

    const { data: offersData, error: offersError } = await supabase
      .from('offers')
      .select(`
        id,
        merchant_id,
        title,
        description,
        image_url,
        price_before,
        price_after,
        discount_percent,
        available_from,
        available_until,
        quantity,
        location,
        merchants!inner(company_name)
      `)
      .eq('is_active', true)
      .not('location', 'is', null)
      .gte('available_until', new Date().toISOString())
      .lte('available_from', new Date().toISOString());

    if (offersError) {
      throw offersError;
    }

    const clientMatch = clientData.location.match(/POINT\(([^ ]+) ([^ ]+)\)/);
    if (!clientMatch) {
      throw new Error('Invalid client location format');
    }

    const clientLon = parseFloat(clientMatch[1]);
    const clientLat = parseFloat(clientMatch[2]);

    const offersWithDistance = (offersData || [])
      .map((offer: any) => {
        const offerMatch = offer.location?.match(/POINT\(([^ ]+) ([^ ]+)\)/);
        if (!offerMatch) return null;

        const offerLon = parseFloat(offerMatch[1]);
        const offerLat = parseFloat(offerMatch[2]);

        const distance = calculateDistance(
          clientLat,
          clientLon,
          offerLat,
          offerLon
        );

        if (distance > radiusMeters) return null;

        return {
          id: offer.id,
          merchant_id: offer.merchant_id,
          merchant_name: offer.merchants.company_name,
          title: offer.title,
          description: offer.description,
          image_url: offer.image_url,
          price_before: parseFloat(offer.price_before),
          price_after: parseFloat(offer.price_after),
          discount_percent: offer.discount_percent,
          available_from: offer.available_from,
          available_until: offer.available_until,
          quantity: offer.quantity,
          distance_m: distance,
          offer_lat: offerLat,
          offer_lng: offerLon
        };
      })
      .filter((offer): offer is NearbyOffer => offer !== null)
      .sort((a, b) => a.distance_m - b.distance_m);

    return offersWithDistance;
  };

  const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number => {
    const R = 6371000;
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  };

  useEffect(() => {
    fetchOffers();

    // Subscribe to realtime updates on offers table
    if (!clientId || !enabled) {
      return;
    }

    const channel = supabase
      .channel('offers-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'offers'
        },
        (payload) => {
          console.log('Offers table changed:', payload);
          fetchOffers();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [clientId, radiusKm, enabled]);

  return {
    offers,
    loading,
    error,
    refetch: fetchOffers
  };
}
