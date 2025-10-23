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
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          console.log('[GEO] Position navigateur:', { latitude, longitude });

          const { data: profile } = await supabase
            .from('profiles')
            .select('id')
            .eq('auth_id', userId)
            .single();

          if (profile) {
            const { error } = await supabase
              .from('profiles')
              .update({
                location: `SRID=4326;POINT(${longitude} ${latitude})`,
              })
              .eq('id', profile.id);

            if (error) throw error;

            setStatus('✅ Position enregistrée avec succès.');
          } else {
            setStatus('⚠️ Aucun profil correspondant trouvé.');
          }
        },
        (err) => {
          console.error('[GEO] Erreur:', err);
          setStatus('❌ Erreur de géolocalisation.');
        }
      );
    } catch (err) {
      console.error('[GEO] Exception:', err);
      setStatus('❌ Erreur inattendue.');
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
