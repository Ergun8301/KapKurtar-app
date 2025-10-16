import { supabase } from '../lib/supabaseClient';

export interface LocationUpdateResult {
  data: any[];
  info: string;
  success: boolean;
  coords?: { lat: number; lng: number };
}

interface NominatimResult {
  lat: string;
  lon: string;
  display_name: string;
}

async function geocodeAddress(address: string): Promise<{ lat: number; lng: number } | null> {
  try {
    const enrichedAddress = address.includes('France') ? address : `${address}, France`;
    console.log('[NOMINATIM] Geocoding address:', enrichedAddress);

    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(enrichedAddress)}&format=json&limit=1`;
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'ResQFood/1.0'
      }
    });

    if (!response.ok) {
      console.error('[NOMINATIM] HTTP error:', response.status);
      return null;
    }

    const results: NominatimResult[] = await response.json();

    if (results.length === 0) {
      console.warn('[NOMINATIM] No results found for:', enrichedAddress);
      return null;
    }

    const coords = {
      lat: parseFloat(results[0].lat),
      lng: parseFloat(results[0].lon)
    };

    console.log('[NOMINATIM] Geocoded to:', coords);
    console.log('[NOMINATIM] Display name:', results[0].display_name);

    return coords;
  } catch (err) {
    console.error('[NOMINATIM] Geocoding error:', err);
    return null;
  }
}

export async function updateClientLocationAndFetchOffers(
  clientId: string,
  radiusMeters: number,
  addressInput?: string
): Promise<LocationUpdateResult> {
  try {
    let latitude: number;
    let longitude: number;

    if (addressInput && addressInput.trim() !== '') {
      console.log('[LOCATION] Manual address mode:', addressInput);

      const coords = await geocodeAddress(addressInput);
      if (!coords) {
        return {
          data: [],
          info: 'Impossible de géocoder cette adresse. Veuillez vérifier et réessayer.',
          success: false
        };
      }

      latitude = coords.lat;
      longitude = coords.lng;
      console.log('[LOCATION] Address geocoded to:', { latitude, longitude });
    } else {
      console.log('[LOCATION] GPS geolocation mode');

      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        });
      });

      latitude = position.coords.latitude;
      longitude = position.coords.longitude;
      console.log('[LOCATION] GPS position retrieved:', { latitude, longitude });
      console.log('[LOCATION] GPS accuracy:', position.coords.accuracy, 'meters');
    }

    // Update client location directly in Supabase
    console.log('[LOCATION] Updating Supabase clients table...');
    const { error: updateError } = await supabase
      .from('clients')
      .update({
        location: `POINT(${longitude} ${latitude})`,
        geocode_status: 'done',
        geocoded_at: new Date().toISOString()
      })
      .eq('auth_id', clientId);

    if (updateError) {
      console.error('[LOCATION] Supabase update error:', updateError);
      throw updateError;
    }

    console.log('[LOCATION] Location updated in Supabase ✅');

    // Fetch nearby offers
    const { data: offers, error: offersError } = await supabase.rpc('get_offers_nearby_dynamic_v2', {
      client_id: clientId,
      radius_meters: radiusMeters
    });

    if (offersError) {
      console.error('[LOCATION] Fetch offers error:', offersError);
      throw offersError;
    }

    console.log(`[LOCATION] Offers fetched: ${offers?.length || 0}`);

    return {
      data: offers || [],
      info: `Position mise à jour et ${offers?.length || 0} offre(s) trouvée(s)`,
      success: true,
      coords: { lat: latitude, lng: longitude }
    };

  } catch (err: any) {
    console.error('[LOCATION] Error:', err);

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
