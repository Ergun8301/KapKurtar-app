// src/components/GeolocationButton.tsx
import React, { useState } from 'react';
import { Navigation, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

interface GeolocationButtonProps {
  userRole: 'client' | 'merchant';
  userId: string; // correspond à auth.users.id
  onSuccess?: (coords: { lat: number; lng: number }) => void;
  className?: string;
}

export const GeolocationButton: React.FC<GeolocationButtonProps> = ({
  userRole,
  userId,
  onSuccess,
  className = ''
}) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleActivateGeolocation = async () => {
    if (!('geolocation' in navigator)) {
      setError('Votre navigateur ne supporte pas la géolocalisation.');
      return;
    }

    setIsUpdating(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        console.log('[GEO] Position navigateur:', { lat, lng });

        try {
          const { data, error: updErr } = await supabase
            .from('profiles')
            .update({ location: `POINT(${lng} ${lat})` })
            .eq('auth_id', userId) // ✅ on cible la bonne clé ici
            .select('id, location');

          if (updErr) {
            console.error('[GEO] Erreur Supabase:', updErr);
            setError('Erreur lors de la mise à jour de votre position.');
          } else if (data && data.length > 0) {
            console.log('[GEO] Profil mis à jour:', data[0]);
            setSuccess(true);
            if (onSuccess) onSuccess({ lat, lng });
          } else {
            console.warn('[GEO] Aucun profil trouvé pour cet utilisateur.');
            setError("Aucun profil correspondant trouvé.");
          }
        } catch (err) {
          console.error('[GEO] Exception Supabase:', err);
          setError('Erreur inattendue lors de la mise à jour.');
        }

        setIsUpdating(false);
      },
      (geoError) => {
        console.error('Erreur de géolocalisation:', geoError);
        let msg = 'Impossible d’obtenir votre position.';
        switch (geoError.code) {
          case geoError.PERMISSION_DENIED:
            msg = 'Géolocalisation refusée. Autorisez-la dans les paramètres du navigateur.';
            break;
          case geoError.POSITION_UNAVAILABLE:
            msg = 'Position non disponible.';
            break;
          case geoError.TIMEOUT:
            msg = 'Le délai de géolocalisation a expiré.';
            break;
        }
        setError(msg);
        setIsUpdating(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  if (success) {
    return (
      <div className={`flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg ${className}`}>
        <CheckCircle className="w-5 h-5" />
        <span className="font-medium">Position mise à jour avec succès !</span>
      </div>
    );
  }

  return (
    <div className={className}>
      <button
        onClick={handleActivateGeolocation}
        disabled={isUpdating}
        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed shadow-md"
      >
        <Navigation className={`w-5 h-5 ${isUpdating ? 'animate-pulse' : ''}`} />
        <span>{isUpdating ? 'Mise à jour en cours...' : '📍 Activer ma géolocalisation'}</span>
      </button>

      {error && (
        <div className="mt-2 text-sm text-red-600 bg-red-50 px-3 py-2 rounded">{error}</div>
      )}
    </div>
  );
};
