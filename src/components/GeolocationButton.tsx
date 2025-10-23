// src/components/GeolocationButton.tsx
import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';

interface Props {
  userId: string | null;
}

const GeolocationButton: React.FC<Props> = ({ userId }) => {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const handleGeolocate = async () => {
    if (!userId) {
      setStatus('⚠️ Utilisateur non connecté.');
      return;
    }

    setLoading(true);
    setStatus('Obtention de la position...');

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject)
      );

      const { latitude, longitude } = position.coords;
      console.log('[GEO] Position navigateur:', { latitude, longitude });

      // ✅ On récupère le profil via maybeSingle() pour éviter 406
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('auth_id', userId)
        .maybeSingle();

      if (profileError) {
        console.warn('[GEO] Erreur recherche profil:', profileError);
      }

      if (!profile) {
        console.warn('[GEO] Aucun profil trouvé pour cet utilisateur.');
        setStatus('⚠️ Aucun profil trouvé.');
        return;
      }

      const { id: profileId } = profile;

      // ✅ Mise à jour de la colonne location (type geography(Point))
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          location: `SRID=4326;POINT(${longitude} ${latitude})`,
        })
        .eq('id', profileId);

      if (updateError) throw updateError;

      setStatus('✅ Localisation enregistrée avec succès.');
      console.log('[GEO] Localisation enregistrée pour profil:', profileId);
    } catch (err) {
      console.error('[GEO] Erreur géolocalisation:', err);
      setStatus('Erreur lors de la géolocalisation.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="text-center space-y-3">
      <button
        onClick={handleGeolocate}
        disabled={loading}
        className="bg-[#FF6B35] hover:bg-[#e55a28] text-white px-6 py-3 rounded-xl font-semibold transition-all disabled:bg-gray-400"
      >
        {loading ? '📍 Localisation...' : '📍 Activer ma géolocalisation'}
      </button>
      {status && <p className="text-sm text-gray-600">{status}</p>}
    </div>
  );
};

export default GeolocationButton;
