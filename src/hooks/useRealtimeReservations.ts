import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Reservation, getClientReservations, getMerchantReservations } from '../api/reservations';

interface UseRealtimeReservationsOptions {
  userType: 'client' | 'merchant';
  userId: string | null;
}

export function useRealtimeReservations({ userType, userId }: UseRealtimeReservationsOptions) {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    fetchReservations();
    const unsubscribe = subscribeToChanges();

    return () => {
      unsubscribe();
    };
  }, [userId, userType]);

  const fetchReservations = async () => {
    try {
      setLoading(true);
      setError(null);

      const result = userType === 'client'
        ? await getClientReservations()
        : await getMerchantReservations();

      if (result.success) {
        setReservations(result.data);
      } else {
        setError(result.error || 'Failed to fetch reservations');
      }
    } catch (err: any) {
      console.error('Error fetching reservations:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const subscribeToChanges = () => {
    if (!userId) return () => {};

    const filterColumn = userType === 'client' ? 'client_id' : 'merchant_id';

    const channel = supabase
      .channel('reservations')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'reservations',
          filter: `${filterColumn}=eq.${userId}`
        },
        (payload) => {
          console.log('Reservation change detected:', payload);
          fetchReservations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  return {
    reservations,
    loading,
    error,
    refetch: fetchReservations
  };
}
