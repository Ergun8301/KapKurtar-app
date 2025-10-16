import React, { useState } from 'react';
import { Navigation, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { flyToLocation } from './OffersMap';
import { updateClientLocationAndFetchOffers } from '../utils/locationUpdate';

interface GeolocationButtonProps {
  userRole: 'client' | 'merchant';
  userId: string;
  onSuccess?: (coords: { lat: number; lng: number }, offers?: any[]) => void;
  className?: string;
  radiusMeters?: number;
}

export const GeolocationButton: React.FC<GeolocationButtonProps> = ({
  userRole,
  userId,
  onSuccess,
  className = '',
  radiusMeters = 20000
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

    try {
      console.log('[GEO] Starting geolocation with utility function');

      const result = await updateClientLocationAndFetchOffers(userId, radiusMeters);

      if (result.success) {
        console.log('[GEO] Success:', result.info);
        console.log('[GEO] Offers fetched:', result.data.length);

        if (result.data.length > 0 && result.data[0]?.merchant_lat && result.data[0]?.merchant_lng) {
          const firstOffer = result.data[0];
          flyToLocation(firstOffer.merchant_lat, firstOffer.merchant_lng, 14);
        }

        if (onSuccess) {
          const coords = { lat: 0, lng: 0 };
          navigator.geolocation.getCurrentPosition((pos) => {
            coords.lat = pos.coords.latitude;
            coords.lng = pos.coords.longitude;
            flyToLocation(coords.lat, coords.lng, 14);
            onSuccess(coords, result.data);
          });
        }

        setSuccess(true);
      } else {
        console.error('[GEO] Error:', result.info);
        setError(result.info);
      }
    } catch (err: any) {
      console.error('[GEO] Exception:', err);
      setError(err?.message || 'Une erreur est survenue');
    } finally {
      setIsUpdating(false);
    }
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
