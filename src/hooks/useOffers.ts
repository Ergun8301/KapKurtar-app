import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';

export type Offer = {
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
};

interface UseOffersOptions {
  clientId: string | null;
  viewMode: "nearby" | "all";
  radiusKm: number;
  center: [number, number];
  enabled?: boolean;
}

interface UseOffersReturn {
  offers: Offer[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useOffers(options: UseOffersOptions): UseOffersReturn {
  const { clientId, viewMode, radiusKm, center, enabled = true } = options;
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOffers = useCallback(async () => {
    if (!enabled) {
      setLoading(false);
      return;
    }

    if (!center || !Number.isFinite(center[0]) || !Number.isFinite(center[1])) {
      console.warn("🧭 fetchOffers skipped: invalid center", center);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let data, fetchError;

      if (viewMode === "all") {
        // MODE TÜMÜ: Toutes les offres triées par date récente
        const [lng, lat] = center;
        const result = await supabase.rpc("get_offers_nearby_public", {
          user_lng: lng,
          user_lat: lat,
          radius_meters: 2000000, // Rayon énorme pour couvrir toute la Turquie
        });
        data = result.data;
        fetchError = result.error;

        // ✅ TRI PAR DATE: Les plus récentes en premier
        if (data && Array.isArray(data)) {
          data = data.sort((a: any, b: any) => {
            const dateA = new Date(a.available_from || a.created_at || 0).getTime();
            const dateB = new Date(b.available_from || b.created_at || 0).getTime();
            return dateB - dateA; // Plus récent = en premier
          });
        }
      } else {
        // MODE YAKINDA: Offres à proximité triées par distance
        if (clientId) {
          const result = await supabase.rpc("get_offers_nearby_dynamic_secure", {
            client_id: clientId,
            radius_meters: radiusKm * 1000,
          });
          data = result.data;
          fetchError = result.error;
          // ✅ Le RPC retourne déjà les offres triées par distance ASC
        } else {
          const [lng, lat] = center;
          const result = await supabase.rpc("get_offers_nearby_public", {
            user_lng: lng,
            user_lat: lat,
            radius_meters: radiusKm * 1000,
          });
          data = result.data;
          fetchError = result.error;
          // ✅ Le RPC retourne déjà les offres triées par distance ASC
        }
      }

      if (fetchError) {
        console.error("❌ Erreur Supabase:", fetchError.message);
        setError(fetchError.message);
      } else {
        console.log("✅ Données reçues depuis Supabase:", data);
        setOffers(data || []);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erreur lors de la récupération des offres";
      console.error("❌", errorMessage, err);
      setError(errorMessage);
      setOffers([]);
    } finally {
      setLoading(false);
    }
  }, [center, clientId, viewMode, radiusKm, enabled]);

  useEffect(() => {
    fetchOffers();
  }, [fetchOffers]);

  // 🔔 Real-time refresh via notifications (only for authenticated clients)
  useEffect(() => {
    if (!clientId || !enabled) return;

    const channel = supabase
      .channel(`client_offers_refresh_${clientId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `recipient_id=eq.${clientId}`,
        },
        (payload: any) => {
          const notification = payload.new;

          // Si notification d'offre, recharger la liste
          if (notification.type === 'offer' || notification.type === 'offer_nearby') {
            console.log('🔔 Nouvelle offre → Refresh automatique');
            fetchOffers();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [clientId, enabled, fetchOffers]);

  return {
    offers,
    loading,
    error,
    refetch: fetchOffers,
  };
}
