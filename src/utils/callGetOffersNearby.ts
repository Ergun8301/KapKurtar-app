import { supabase } from "../lib/supabaseClient";

/**
 * Appelle la fonction Supabase get_offers_nearby_dynamic de manière sûre.
 * - Convertit le rayon en entier (mètres)
 * - Logge la requête et la réponse
 */
export async function callGetOffersNearby(clientId: string, radiusKm: number) {
  if (!clientId) throw new Error("clientId manquant");
  if (typeof radiusKm !== "number" || radiusKm <= 0)
    throw new Error("radiusKm doit être un nombre positif");

  // ✅ Conversion du rayon en mètres, forcée à integer
  const radiusMeters = Math.round(radiusKm * 1000);

  console.debug("[RPC] Appel Supabase → get_offers_nearby_dynamic :", {
    p_client_id: clientId,
    p_radius_meters: radiusMeters,
  });

  const { data, error } = await supabase.rpc("get_offers_nearby_dynamic", {
    p_client_id: clientId,
    p_radius_meters: radiusMeters,
  });

  if (error) {
    console.error("[RPC] Erreur :", error);
    throw error;
  }

  console.debug("[RPC] Données reçues :", data);
  return data || [];
}
