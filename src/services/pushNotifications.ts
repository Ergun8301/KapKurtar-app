import { Capacitor } from '@capacitor/core';
import { PushNotifications, Token, PushNotificationSchema, ActionPerformed } from '@capacitor/push-notifications';
import { supabase } from '../lib/supabaseClient';

/**
 * Service de gestion des Push Notifications
 * - Demande la permission
 * - Récupère et enregistre le token FCM
 * - Gère les notifications reçues
 */

// Variable pour éviter les initialisations multiples
let isInitialized = false;

// Variable pour stocker le dernier token (pour debug)
let lastToken: string | null = null;

// Variable pour stocker les logs de debug
const debugLogs: string[] = [];

/**
 * Ajoute un log de debug et affiche une alerte visuelle
 */
function debugLog(message: string, showAlert = true): void {
  const timestamp = new Date().toLocaleTimeString();
  const logMessage = `[${timestamp}] ${message}`;
  debugLogs.push(logMessage);
  console.log(`🔔 PUSH DEBUG: ${logMessage}`);

  if (showAlert && Capacitor.isNativePlatform()) {
    // Utilise alert pour être visible sur le téléphone
    window.alert(`PUSH DEBUG:\n${message}`);
  }
}

/**
 * Récupère tous les logs de debug
 */
export function getDebugLogs(): string[] {
  return [...debugLogs];
}

/**
 * Récupère le dernier token connu
 */
export function getLastToken(): string | null {
  return lastToken;
}

/**
 * Récupère le profile_id de l'utilisateur connecté
 */
async function getProfileId(authId: string): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .eq('auth_id', authId)
      .single();

    if (error) {
      debugLog(`Erreur récupération profile_id: ${error.message}`, false);
      return null;
    }

    return data?.id || null;
  } catch (error) {
    debugLog(`Exception récupération profile_id: ${error}`, false);
    return null;
  }
}

/**
 * Enregistre ou met à jour le token FCM dans Supabase
 */
async function saveTokenToSupabase(token: string): Promise<boolean> {
  debugLog(`Tentative sauvegarde token...`, false);

  try {
    // Récupérer l'utilisateur connecté
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      debugLog(`Utilisateur non connecté: ${authError?.message || 'no user'}`, true);
      return false;
    }

    const authId = user.id;
    debugLog(`User auth_id: ${authId.substring(0, 8)}...`, false);

    const profileId = await getProfileId(authId);

    if (!profileId) {
      debugLog(`Profile_id non trouvé pour auth_id`, true);
      return false;
    }

    debugLog(`Profile_id: ${profileId.substring(0, 8)}...`, false);

    // Déterminer la plateforme
    const platform = Capacitor.getPlatform() as 'android' | 'ios';

    // Upsert le token (insert ou update si déjà existant)
    const { error } = await supabase
      .from('device_push_tokens')
      .upsert(
        {
          profile_id: profileId,
          auth_id: authId,
          token: token,
          platform: platform,
          is_active: true,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: 'token', // Évite les doublons
        }
      );

    if (error) {
      debugLog(`ERREUR Supabase: ${error.message}\nCode: ${error.code}`, true);
      return false;
    }

    debugLog(`TOKEN SAUVEGARDÉ AVEC SUCCÈS !`, true);
    return true;
  } catch (error) {
    debugLog(`EXCEPTION sauvegarde: ${error}`, true);
    return false;
  }
}

/**
 * Désactive le token push pour l'utilisateur (à appeler lors de la déconnexion)
 */
export async function deactivatePushToken(): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return;

    await supabase
      .from('device_push_tokens')
      .update({ is_active: false })
      .eq('auth_id', user.id);

    console.log('✅ Token push désactivé');
  } catch (error) {
    console.error('❌ Erreur désactivation token:', error);
  }
}

/**
 * Gère une notification reçue quand l'app est ouverte
 */
function handleNotificationReceived(notification: PushNotificationSchema): void {
  console.log('📬 Notification reçue (app ouverte):', notification);
  debugLog(`Notification reçue: ${notification.title}`, true);

  const { title, body, data } = notification;
  console.log('📬 Titre:', title);
  console.log('📬 Corps:', body);
  console.log('📬 Données:', data);
}

/**
 * Gère le tap sur une notification
 */
function handleNotificationAction(action: ActionPerformed): void {
  console.log('👆 Notification tapée:', action);
  debugLog(`Notification tapée: ${action.notification.title}`, false);

  const data = action.notification.data;

  // Navigation basée sur le type de notification
  if (data?.type === 'offer' || data?.type === 'offer_nearby') {
    window.location.href = '/offers';
  } else if (data?.type === 'reservation') {
    window.location.href = '/merchant/dashboard';
  } else if (data?.offer_id) {
    window.location.href = '/offers';
  }
}

/**
 * Initialise les push notifications
 * Doit être appelé après la connexion de l'utilisateur
 */
export async function initPushNotifications(): Promise<boolean> {
  debugLog(`=== INIT PUSH START ===`, true);
  debugLog(`Platform: ${Capacitor.getPlatform()}`, false);
  debugLog(`isNative: ${Capacitor.isNativePlatform()}`, false);

  // Ne pas initialiser sur web
  if (!Capacitor.isNativePlatform()) {
    debugLog(`NON NATIF - Abandon`, true);
    return false;
  }

  // Éviter les initialisations multiples
  if (isInitialized) {
    debugLog(`Déjà initialisé - Token: ${lastToken?.substring(0, 20)}...`, true);
    return true;
  }

  try {
    // Vérifier si l'utilisateur est connecté
    debugLog(`Vérification utilisateur...`, false);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      debugLog(`UTILISATEUR NON CONNECTÉ`, true);
      return false;
    }
    debugLog(`User OK: ${user.email}`, false);

    // Vérifier la permission actuelle
    debugLog(`Check permissions...`, false);
    let permStatus = await PushNotifications.checkPermissions();
    debugLog(`Permission actuelle: ${permStatus.receive}`, true);

    // Demander la permission si nécessaire
    if (permStatus.receive === 'prompt') {
      debugLog(`Demande permission...`, false);
      permStatus = await PushNotifications.requestPermissions();
      debugLog(`Résultat demande: ${permStatus.receive}`, true);
    }

    if (permStatus.receive !== 'granted') {
      debugLog(`PERMISSION REFUSÉE: ${permStatus.receive}`, true);
      return false;
    }

    debugLog(`Permission ACCORDÉE`, false);

    // Configurer les listeners AVANT de s'enregistrer
    debugLog(`Configuration listeners...`, false);

    // Quand on reçoit le token
    await PushNotifications.addListener('registration', async (token: Token) => {
      lastToken = token.value;
      debugLog(`TOKEN REÇU: ${token.value.substring(0, 30)}...`, true);
      const saved = await saveTokenToSupabase(token.value);
      debugLog(`Sauvegarde: ${saved ? 'OK' : 'ÉCHEC'}`, true);
    });

    // En cas d'erreur d'enregistrement
    await PushNotifications.addListener('registrationError', (error) => {
      debugLog(`ERREUR REGISTRATION: ${JSON.stringify(error)}`, true);
    });

    // Notification reçue (app au premier plan)
    await PushNotifications.addListener('pushNotificationReceived', (notification) => {
      handleNotificationReceived(notification);
    });

    // Tap sur notification (app en arrière-plan ou fermée)
    await PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
      handleNotificationAction(action);
    });

    // S'enregistrer pour recevoir les notifications
    debugLog(`Appel PushNotifications.register()...`, false);
    await PushNotifications.register();
    debugLog(`register() appelé - attente token...`, true);

    isInitialized = true;
    debugLog(`=== INIT PUSH TERMINÉ ===`, false);
    return true;
  } catch (error) {
    debugLog(`EXCEPTION: ${error}`, true);
    return false;
  }
}

/**
 * Version de test avec alertes forcées - pour diagnostic manuel
 */
export async function testPushNotifications(): Promise<{
  success: boolean;
  platform: string;
  isNative: boolean;
  token: string | null;
  logs: string[];
  error?: string;
}> {
  const result = {
    success: false,
    platform: Capacitor.getPlatform(),
    isNative: Capacitor.isNativePlatform(),
    token: lastToken,
    logs: [] as string[],
    error: undefined as string | undefined,
  };

  try {
    // Reset pour forcer une nouvelle tentative
    isInitialized = false;
    debugLogs.length = 0;

    result.logs.push(`Platform: ${result.platform}`);
    result.logs.push(`isNative: ${result.isNative}`);

    if (!result.isNative) {
      result.error = 'Non native platform';
      result.logs.push('ERREUR: Pas sur plateforme native');
      return result;
    }

    // Vérifier l'utilisateur
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      result.error = 'User not logged in';
      result.logs.push('ERREUR: Utilisateur non connecté');
      return result;
    }
    result.logs.push(`User: ${user.email}`);

    // Vérifier permissions
    const permStatus = await PushNotifications.checkPermissions();
    result.logs.push(`Permission: ${permStatus.receive}`);

    if (permStatus.receive === 'prompt') {
      const newPerm = await PushNotifications.requestPermissions();
      result.logs.push(`Nouvelle permission: ${newPerm.receive}`);
    }

    // Tenter l'initialisation
    const initResult = await initPushNotifications();
    result.success = initResult;
    result.token = lastToken;
    result.logs.push(`Init result: ${initResult}`);
    result.logs.push(`Token: ${lastToken ? lastToken.substring(0, 30) + '...' : 'null'}`);

    // Attendre un peu pour le token
    if (!lastToken) {
      result.logs.push('Attente 3s pour token...');
      await new Promise(resolve => setTimeout(resolve, 3000));
      result.token = lastToken;
      result.logs.push(`Token après attente: ${lastToken ? 'OUI' : 'NON'}`);
    }

    result.logs = [...result.logs, ...debugLogs];

  } catch (error) {
    result.error = String(error);
    result.logs.push(`EXCEPTION: ${error}`);
  }

  return result;
}

/**
 * Nettoie les listeners (à appeler lors de la déconnexion si nécessaire)
 */
export async function cleanupPushNotifications(): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;

  try {
    await PushNotifications.removeAllListeners();
    isInitialized = false;
    console.log('✅ Listeners push notifications nettoyés');
  } catch (error) {
    console.error('❌ Erreur nettoyage listeners:', error);
  }
}
