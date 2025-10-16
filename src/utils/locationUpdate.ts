import { supabase } from '../lib/supabaseClient';

export interface LocationUpdateResult {
  data: any[];
  info: string;
  success: boolean;
}

function enrichAddress(address: string): string {
  const trimmed = address.trim();

  // Check if address already contains 'France'
  if (trimmed.toLowerCase().includes('france')) {
    console.log('[ADDRESS] Address already contains France:', trimmed);
    return trimmed;
  }

  // Common French city patterns that need enrichment
  const needsEnrichment = !/\d/.test(trimmed) && // No numbers (likely just city name)
                          trimmed.split(',').length < 3; // Not detailed enough

  if (needsEnrichment) {
    // Add France to improve geocoding accuracy
    const enriched = `${trimmed}, France`;
    console.log('[ADDRESS] Enriched address:', enriched);
    return enriched;
  }

  console.log('[ADDRESS] Address is detailed enough:', trimmed);
  return trimmed;
}

export async function updateClientLocationAndFetchOffers(
  clientId: string,
  radiusMeters: number,
  addressInput?: string
): Promise<LocationUpdateResult> {
  try {
    if (addressInput && addressInput.trim() !== '') {
      const enrichedAddress = enrichAddress(addressInput);
      console.log('[LOCATION] Manual address mode (original):', addressInput);
      console.log('[LOCATION] Manual address mode (enriched):', enrichedAddress);

      const { error: geocodeError } = await supabase.rpc('rpc_enqueue_client_geocode', {
        client_uuid: clientId,
        address_text: enrichedAddress
      });

      if (geocodeError) {
        console.error('[LOCATION] Geocode enqueue error:', geocodeError);
        throw geocodeError;
      }

      console.log('[LOCATION] Address sent to Supabase for geocoding');
      return {
        data: [],
        info: 'Adresse envoyée à Supabase pour géocodage. Les offres seront mises à jour après traitement.',
        success: true
      };
    }

    console.log('[LOCATION] Automatic geolocation mode via browser');

    const position = await new Promise<GeolocationPosition>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      });
    });

    const latitude = position.coords.latitude;
    const longitude = position.coords.longitude;

    console.log('[LOCATION] Browser position retrieved:', { latitude, longitude });

    const { error: updateError } = await supabase.rpc('rpc_update_client_location', {
      client_uuid: clientId,
      lon: longitude,
      lat: latitude
    });

    if (updateError) {
      console.error('[LOCATION] Update location error:', updateError);
      throw updateError;
    }

    console.log('[LOCATION] Location updated in Supabase ✅');

    const { data: offers, error: offersError } = await supabase.rpc('get_offers_nearby_dynamic_v2', {
      client_id: clientId,
      radius_meters: radiusMeters
    });

    if (offersError) {
      console.error('[LOCATION] Fetch offers error:', offersError);
      throw offersError;
    }

    console.log(`[LOCATION] Offers fetched (${offers?.length || 0}):`, offers);

    return {
      data: offers || [],
      info: `Position mise à jour et ${offers?.length || 0} offre(s) trouvée(s)`,
      success: true
    };

  } catch (err: any) {
    console.error('[LOCATION] Error in updateClientLocationAndFetchOffers:', err);

    let errorMessage = 'Une erreur est survenue';

    if (err?.code === 1) {
      errorMessage = 'Géolocalisation refusée. Veuillez autoriser l\'accès à votre position.';
    } else if (err?.code === 2) {
      errorMessage = 'Position indisponible. Veuillez réessayer.';
    } else if (err?.code === 3) {
      errorMessage = 'Délai de géolocalisation dépassé.';
    } else if (err?.message) {
      errorMessage = err.message;
    }

    return {
      data: [],
      info: errorMessage,
      success: false
    };
  }
}

export async function getClientOffers(
  clientId: string,
  radiusMeters: number
): Promise<LocationUpdateResult> {
  try {
    console.log('[LOCATION] Fetching offers only:', { clientId, radiusMeters });

    const { data: offers, error: offersError } = await supabase.rpc('get_offers_nearby_dynamic_v2', {
      client_id: clientId,
      radius_meters: radiusMeters
    });

    if (offersError) {
      console.error('[LOCATION] Fetch offers error:', offersError);
      throw offersError;
    }

    console.log(`[LOCATION] Offers fetched (${offers?.length || 0})`);

    return {
      data: offers || [],
      info: `${offers?.length || 0} offre(s) trouvée(s)`,
      success: true
    };

  } catch (err: any) {
    console.error('[LOCATION] Error fetching offers:', err);
    return {
      data: [],
      info: err?.message || 'Erreur lors de la récupération des offres',
      success: false
    };
  }
}
