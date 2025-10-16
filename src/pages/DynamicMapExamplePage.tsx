import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabaseClient';
import { DynamicOffersMap } from '../components/DynamicOffersMap';
import { useNavigate } from 'react-router-dom';

/**
 * Example page demonstrating the usage of DynamicOffersMap component
 * This component uses the get_offers_nearby_dynamic_v2 SQL function
 *
 * Features:
 * - Automatically fetches client location from Supabase
 * - Displays offers within configurable radius (stored in localStorage)
 * - Real-time updates when offers change
 * - Dynamic radius adjustment
 * - Distance calculation for each offer
 * - Uses merchant coordinates for map markers
 */
const DynamicMapExamplePage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [clientId, setClientId] = useState<string | null>(null);
  const [selectedOfferId, setSelectedOfferId] = useState<string | null>(null);

  useEffect(() => {
    const fetchClientId = async () => {
      if (!user) {
        navigate('/customer/auth');
        return;
      }

      try {
        const { data, error } = await supabase
          .from('clients')
          .select('id')
          .eq('id', user.id)
          .maybeSingle();

        if (error) {
          console.error('Error fetching client:', error);
          return;
        }

        if (data) {
          setClientId(data.id);
        }
      } catch (err) {
        console.error('Error:', err);
      }
    };

    fetchClientId();
  }, [user, navigate]);

  const handleOfferClick = (offerId: string) => {
    console.log('Offer clicked:', offerId);
    setSelectedOfferId(offerId);
    // Navigate to offer details or open modal
    // navigate(`/customer/offers/${offerId}`);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Veuillez vous connecter pour voir la carte</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Carte dynamique des offres
          </h1>
          <p className="text-gray-600">
            Cette carte utilise la fonction <code className="bg-gray-200 px-2 py-1 rounded">get_offers_nearby_dynamic_v2</code>
            pour afficher les offres à proximité en temps réel avec coordonnées du marchand.
          </p>
        </div>

        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-gray-900 mb-2">Fonctionnalités :</h3>
          <ul className="list-disc list-inside text-gray-700 space-y-1 text-sm">
            <li>Centrage automatique sur votre position</li>
            <li>Cercle de recherche configurable (2-20 km)</li>
            <li>Marqueurs verts pour les offres actives</li>
            <li>Marqueur bleu pour votre position</li>
            <li>Popup avec détails : nom, distance, prix, réduction</li>
            <li>Mise à jour en temps réel via Supabase Realtime</li>
            <li>Synchronisation avec localStorage (clé: "searchRadius")</li>
            <li>Écoute des changements de rayon depuis d'autres onglets</li>
          </ul>
        </div>

        <DynamicOffersMap
          clientId={clientId}
          onOfferClick={handleOfferClick}
        />

        {selectedOfferId && (
          <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-green-800">
              Offre sélectionnée : <strong>{selectedOfferId}</strong>
            </p>
          </div>
        )}

        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Utilisation de l'API
          </h3>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-800 mb-2">1. Fonction SQL</h4>
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
{`-- Appel de la fonction v2
SELECT * FROM get_offers_nearby_dynamic_v2(
  client_id := 'uuid-du-client',
  radius_meters := 5000
);`}
              </pre>
            </div>

            <div>
              <h4 className="font-medium text-gray-800 mb-2">2. Depuis TypeScript/React</h4>
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
{`const { data, error } = await supabase.rpc('get_offers_nearby_dynamic_v2', {
  client_id: clientId,
  radius_meters: 5000
});

// data contient un tableau d'offres avec distance calculée
// [{ offer_id, merchant_id, company_name, title,
//    distance_meters, merchant_lat, merchant_lng, ... }]`}
              </pre>
            </div>

            <div>
              <h4 className="font-medium text-gray-800 mb-2">3. Hook personnalisé</h4>
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
{`import { useDynamicOffers } from '../hooks/useDynamicOffers';

const { offers, loading, error, refetch } = useDynamicOffers({
  clientId: 'uuid-du-client',
  radiusMeters: 5000,
  enabled: true,
  autoRefresh: true
});`}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DynamicMapExamplePage;
