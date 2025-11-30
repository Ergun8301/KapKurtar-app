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
      console.error('❌ Erreur récupération profile_id:', error);
      return null;
    }

    return data?.id || null;
  } catch (error) {
    console.error('❌ Exception récupération profile_id:', error);
    return null;
  }
}

/**
 * Enregistre ou met à jour le token FCM dans Supabase
 */
async function saveTokenToSupabase(token: string): Promise<boolean> {
  try {
    // Récupérer l'utilisateur connecté
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error('❌ Utilisateur non connecté:', authError);
      return false;
    }

    const authId = user.id;
    const profileId = await getProfileId(authId);

    if (!profileId) {
      console.error('❌ Impossible de trouver le profile_id pour auth_id:', authId);
      return false;
    }

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
      console.error('❌ Erreur enregistrement token:', error);
      return false;
    }

    console.log('✅ Token FCM enregistré avec succès');
    return true;
  } catch (error) {
    console.error('❌ Exception enregistrement token:', error);
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

  // Vous pouvez ici afficher un toast ou une alerte in-app
  // Par exemple avec une bibliothèque de notifications UI

  // Les données de la notification sont dans notification.data
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

  const data = action.notification.data;

  // Navigation basée sur le type de notification
  if (data?.type === 'offer' || data?.type === 'offer_nearby') {
    // Rediriger vers les offres
    window.location.href = '/offers';
  } else if (data?.type === 'reservation') {
    // Rediriger vers le dashboard marchand
    window.location.href = '/merchant/dashboard';
  } else if (data?.offer_id) {
    // Si on a un offer_id, aller aux offres
    window.location.href = '/offers';
  }
}

/**
 * Initialise les push notifications
 * Doit être appelé après la connexion de l'utilisateur
 */
export async function initPushNotifications(): Promise<boolean> {
  // Ne pas initialiser sur web
  if (!Capacitor.isNativePlatform()) {
    console.log('ℹ️ Push notifications non disponibles sur web');
    return false;
  }

  // Éviter les initialisations multiples
  if (isInitialized) {
    console.log('ℹ️ Push notifications déjà initialisées');
    return true;
  }

  try {
    // Vérifier si l'utilisateur est connecté
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.log('ℹ️ Utilisateur non connecté, push notifications non initialisées');
      return false;
    }

    // Vérifier la permission actuelle
    let permStatus = await PushNotifications.checkPermissions();
    console.log('📱 Permission push actuelle:', permStatus.receive);

    // Demander la permission si nécessaire
    if (permStatus.receive === 'prompt') {
      permStatus = await PushNotifications.requestPermissions();
    }

    if (permStatus.receive !== 'granted') {
      console.log('❌ Permission push refusée');
      return false;
    }

    console.log('✅ Permission push accordée');

    // Configurer les listeners AVANT de s'enregistrer

    // Quand on reçoit le token
    await PushNotifications.addListener('registration', async (token: Token) => {
      console.log('🔑 Token FCM reçu:', token.value);
      await saveTokenToSupabase(token.value);
    });

    // En cas d'erreur d'enregistrement
    await PushNotifications.addListener('registrationError', (error) => {
      console.error('❌ Erreur enregistrement push:', error);
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
    await PushNotifications.register();

    isInitialized = true;
    console.log('✅ Push notifications initialisées avec succès');
    return true;
  } catch (error) {
    console.error('❌ Erreur initialisation push notifications:', error);
    return false;
  }
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
