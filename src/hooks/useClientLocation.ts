import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

interface UseClientLocationReturn {
  location: string | null;
  loading: boolean;
  error: string | null;
  requestGeolocation: () => Promise<void>;
  hasLocation: boolean;
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
        .from('client_locations_view')
        .select('location_text')
        .eq('id', clientId)
        .maybeSingle();

      if (fetchError) {
        console.error('Error fetching client location:', fetchError);
        setError('Impossible de récupérer votre position');
        return;
      }

      if (data?.location_text) {
        setLocation(data.location_text);
      }
    } catch (err) {
      console.error('Error in fetchClientLocation:', err);
      setError('Erreur lors de la récupération de votre position');
    } finally {
      setLoading(false);
    }
  };

  const requestGeolocation = async (): Promise<void> => {
    if (!clientId) {
      setError('Vous devez être connecté pour utiliser la géolocalisation');
      return;
    }

    if (!navigator.geolocation) {
      setError('La géolocalisation n\'est pas supportée par votre navigateur');
      return;
    }

    return new Promise((resolve, reject) => {
      setLoading(true);
      setError(null);

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;

          try {
            const { error: updateError } = await supabase.rpc('update_client_location', {
              client_id: clientId,
              longitude: longitude,
              latitude: latitude,
              status: 'success'
            });

            if (updateError) {
              console.error('Error updating client location:', updateError);
              setError('Impossible de sauvegarder votre position');
              reject(updateError);
            } else {
              setLocation(`POINT(${longitude} ${latitude})`);
              resolve();
            }
          } catch (err) {
            console.error('Error saving location:', err);
            setError('Erreur lors de la sauvegarde de votre position');
            reject(err);
          } finally {
            setLoading(false);
          }
        },
        (err) => {
          console.error('Geolocation error:', err);
          let errorMessage = 'Impossible d\'obtenir votre position';

          switch (err.code) {
            case err.PERMISSION_DENIED:
              errorMessage = 'Vous avez refusé l\'accès à votre position';
              break;
            case err.POSITION_UNAVAILABLE:
              errorMessage = 'Votre position n\'est pas disponible';
              break;
            case err.TIMEOUT:
              errorMessage = 'La demande de position a expiré';
              break;
          }

          setError(errorMessage);
          setLoading(false);
          reject(err);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    });
  };

  return {
    location,
    loading,
    error,
    requestGeolocation,
    hasLocation: location !== null
  };
}
