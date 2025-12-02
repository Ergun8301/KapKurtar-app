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
  if (isNativePlatform()) {
    // Sur mobile natif, utiliser l'URL web pour que les emails fonctionnent
    return `${APP_URL}${path}`;
  }
  // Sur web, utiliser l'origine actuelle
  return `${window.location.origin}${path}`;
};

/**
 * Vérifie si l'app tourne sur une plateforme native (Android/iOS)
 * Utilise plusieurs méthodes de détection pour plus de fiabilité en release
 */
export const isNativePlatform = (): boolean => {
  // Méthode 1: Capacitor officiel
  const capacitorNative = Capacitor.isNativePlatform();

  // Méthode 2: Vérifier le platform directement
  const platform = Capacitor.getPlatform();
  const platformIsNative = platform === 'android' || platform === 'ios';

  // Méthode 3: Vérifier window.Capacitor (backup)
  const windowCapacitor = typeof (window as unknown as { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor !== 'undefined';

  // Méthode 4: Vérifier l'origine (capacitor:// sur mobile)
  const originIsCapacitor = window.location.origin.includes('capacitor://') ||
                            window.location.origin.includes('localhost');

  // Méthode 5: Vérifier androidBridge directement
  const hasAndroidBridge = typeof (window as unknown as { androidBridge?: unknown }).androidBridge !== 'undefined';

  // Log diagnostic pour debug
  console.log('🔍 [Platform Detection]', {
    capacitorNative,
    platform,
    platformIsNative,
    windowCapacitor,
    originIsCapacitor,
    hasAndroidBridge,
    userAgent: navigator.userAgent,
    origin: window.location.origin
  });

  // Retourner true si AU MOINS UNE méthode indique native
  // Priorité à platformIsNative car plus fiable
  return platformIsNative || capacitorNative || hasAndroidBridge;
};

/**
 * URL de base de l'application
 */
export const APP_BASE_URL = APP_URL;

/**
 * Custom URL scheme pour les deep links OAuth sur mobile natif
 */
export const CUSTOM_URL_SCHEME = 'com.kapkurtar.app';

/**
 * Génère une URL de redirection OAuth spécifique pour mobile natif
 * Utilise le custom URL scheme pour permettre le retour dans l'app
 *
 * Note: On force toujours le custom scheme car cette fonction n'est appelée
 * que depuis le code mobile (après vérification isNativePlatform dans les pages auth)
 *
 * @param path - Le chemin de redirection (ex: '/auth/callback?role=client')
 * @returns L'URL avec custom scheme pour mobile
 */
export const getOAuthRedirectUrl = (path: string): string => {
  // Toujours utiliser le custom scheme pour OAuth mobile
  // Cette fonction n'est appelée que si isNativePlatform() est true dans les pages auth
  return `${CUSTOM_URL_SCHEME}:/${path}`;
};
