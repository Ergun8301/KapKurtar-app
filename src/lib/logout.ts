import { supabase } from './supabaseClient';
import { deactivatePushToken, cleanupPushNotifications } from '../services/pushNotifications';

/**
 * Déconnexion complète avec redirection (pour les composants React avec navigate)
 */
export async function logoutUser(navigate: (to: string) => void) {
  try {
    // 0️⃣ Désactiver le token push avant la déconnexion
    await deactivatePushToken();
    await cleanupPushNotifications();

    // 1️⃣ Détruit la session active
    await supabase.auth.signOut();
  } catch (err) {
    console.warn('⚠️ Erreur Supabase lors du signOut (ignorée) :', err);
  }

  // 2️⃣ Nettoie les caches locaux
  try { localStorage.clear(); } catch {}
  try { sessionStorage.clear(); } catch {}

  // 3️⃣ Redirige vers la page d'accueil
  try {
    navigate('/');
  } catch {
    // fallback au cas où navigate ne soit pas dispo
    window.location.assign('/');
  }
}

/**
 * Variante sans navigation (utile pour les hooks ou stores)
 */
export async function logoutNoNav() {
  try {
    // Désactiver le token push avant la déconnexion
    await deactivatePushToken();
    await cleanupPushNotifications();

    await supabase.auth.signOut();
  } catch (err) {
    console.warn('⚠️ Erreur Supabase lors du signOut (ignorée) :', err);
  }

  try { localStorage.clear(); } catch {}
  try { sessionStorage.clear(); } catch {}

  // pas de navigate ici, on laisse le composant parent gérer la redirection
}
