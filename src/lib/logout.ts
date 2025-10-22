import { supabase } from './supabaseClient';

export async function logoutUser(navigate: (to: string) => void) {
  try {
    // 1) Détruit la session Supabase
    await supabase.auth.signOut();

    // 2) Vide tous les caches potentiels
    try { localStorage.clear(); } catch {}
    try { sessionStorage.clear(); } catch {}

    // 3) Retour à l'accueil
    navigate('/');
  } catch (err) {
    console.error('Erreur lors de la déconnexion :', err);
    alert("Une erreur est survenue lors de la déconnexion.");
  }
}
