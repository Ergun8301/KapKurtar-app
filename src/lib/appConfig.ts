import { Capacitor } from '@capacitor/core';

/**
 * URL de base de l'application web
 * Utilisé pour les redirections OAuth et les emails de confirmation
 */
const APP_URL = 'https://kapkurtar.com';

/**
 * Génère une URL de redirection compatible avec l'environnement d'exécution
 *
 * Sur mobile natif (Capacitor), window.location.origin retourne "capacitor://localhost"
 * ce qui ne fonctionne pas pour les emails de confirmation Supabase.
 * Cette fonction retourne l'URL web correcte sur mobile.
 *
 * @param path - Le chemin de redirection (ex: '/auth/callback?role=client')
 * @returns L'URL complète de redirection
 */
export const getRedirectUrl = (path: string): string => {
  if (Capacitor.isNativePlatform()) {
    // Sur mobile natif, utiliser l'URL web pour que les emails fonctionnent
    return `${APP_URL}${path}`;
  }
  // Sur web, utiliser l'origine actuelle
  return `${window.location.origin}${path}`;
};

/**
 * Vérifie si l'app tourne sur une plateforme native (Android/iOS)
 */
export const isNativePlatform = (): boolean => {
  return Capacitor.isNativePlatform();
};

/**
 * URL de base de l'application
 */
export const APP_BASE_URL = APP_URL;
