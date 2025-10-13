import React, { useState } from 'react';
import { Navigation, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

interface GeolocationButtonProps {
  userRole: 'client' | 'merchant';
  userId: string;
  onSuccess?: () => void;
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
        const { latitude, longitude } = position.coords;
        const point = `POINT(${longitude} ${latitude})`;

        console.log('Updating location:', { userRole, userId, latitude, longitude });

        try {
          const tableName = userRole === 'merchant' ? 'merchants' : 'clients';
          const { data, error: updateError } = await supabase
            .from(tableName)
            .update({ location: point })
            .eq('auth_id', userId)
            .select();

          if (updateError) {
            console.error('Erreur géolocalisation Supabase:', {
              message: updateError.message,
              details: updateError.details,
              hint: updateError.hint,
              code: updateError.code
            });
            setError(`Impossible de mettre à jour votre position: ${updateError.message}`);
            setIsUpdating(false);
            return;
          }

          console.log('Location updated successfully:', data);
          setSuccess(true);
          setIsUpdating(false);

          if (onSuccess) {
            setTimeout(() => {
              onSuccess();
            }, 1500);
          }

        } catch (err) {
          console.error('Erreur générale:', err);
          setError('Une erreur est survenue lors de la mise à jour.');
          setIsUpdating(false);
        }
      },
      (geoError) => {
        console.error('Geolocation error:', geoError);
        let errorMessage = 'Impossible d\'obtenir votre position';

        switch (geoError.code) {
          case geoError.PERMISSION_DENIED:
            errorMessage = 'Géolocalisation refusée. Veuillez autoriser l\'accès dans les paramètres de votre navigateur.';
            break;
          case geoError.POSITION_UNAVAILABLE:
            errorMessage = 'Votre position n\'est pas disponible actuellement.';
            break;
          case geoError.TIMEOUT:
            errorMessage = 'La demande de position a expiré.';
            break;
        }

        setError(errorMessage);
        setIsUpdating(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
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
        <span>
          {isUpdating ? 'Mise à jour en cours...' : '📍 Activer ma géolocalisation'}
        </span>
      </button>

      {error && (
        <div className="mt-2 text-sm text-red-600 bg-red-50 px-3 py-2 rounded">
          {error}
        </div>
      )}
    </div>
  );
};
