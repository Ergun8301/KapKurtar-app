import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

interface UseClientLocationReturn {
  location: string | null;
  loading: boolean;
  error: string | null;
  hasLocation: boolean;
  refetch: () => Promise<void>;
}

export function useClientLocation(clientId: string | null): UseClientLocationReturn {
  const [location, setLocation] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!clientId) {
      setLoading(false);
      return;
    }

    fetchClientLocation();
  }, [clientId]);

  const fetchClientLocation = async () => {
    if (!clientId) return;

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('clients')
        .select('location, geocode_status, geocoded_at')
        .eq('auth_id', clientId)
        .maybeSingle();

      if (fetchError) {
        console.error('Error fetching client location:', fetchError);
        setError('Impossible de récupérer votre position');
        return;
      }

      if (data?.location) {
        const locationStr = typeof data.location === 'string'
          ? data.location
          : `POINT(${(data.location as any).coordinates?.[0]} ${(data.location as any).coordinates?.[1]})`;
        setLocation(locationStr);
        console.log('[LOCATION] Location fetched:', locationStr);
      }
    } catch (err) {
      console.error('Error in fetchClientLocation:', err);
      setError('Erreur lors de la récupération de votre position');
    } finally {
      setLoading(false);
    }
  };


  return {
    location,
    loading,
    error,
    hasLocation: location !== null,
    refetch: fetchClientLocation
  };
}
