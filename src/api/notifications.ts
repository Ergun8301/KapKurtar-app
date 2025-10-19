// src/api/notifications.ts
import { supabase } from "../lib/supabaseClient";

// --- Types ---
export interface Notification {
  id: string;
  recipient_id: string;
  sender_id?: string;
  title: string;
  message: string;
  type:
    | "reservation"
    | "offer"
    | "system"
    | "review"
    | "stock_empty"
    | "daily_summary";
  offer_id: string | null;
  is_read: boolean;
  created_at: string;
}

// ---------------------------------------------------------------------------
// 🧠 UTILITAIRES
// ---------------------------------------------------------------------------

async function getCurrentUserId(): Promise<string | null> {
  const { data, error } = await supabase.auth.getSession();
  if (error || !data?.session?.user) return null;
  return data.session.user.id;
}

// ---------------------------------------------------------------------------
// 📬 RÉCUPÉRATION
// ---------------------------------------------------------------------------

/**
 * Récupère les 50 dernières notifications du user connecté.
 * Une seule requête par session.
 */
export const getNotifications = async (userId?: string) => {
  try {
    const uid = userId || (await getCurrentUserId());
    if (!uid) return { success: false, error: "Utilisateur non authentifié", data: [] };

    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("recipient_id", uid)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) throw error;
    return { success: true, data: data || [] };
  } catch (err: any) {
    console.error("getNotifications error:", err);
    return { success: false, error: err.message, data: [] };
  }
};

/**
 * Récupère uniquement les notifications non lues.
 */
export const getUnreadNotifications = async (userId?: string) => {
  try {
    const uid = userId || (await getCurrentUserId());
    if (!uid) return { success: false, error: "Utilisateur non authentifié", data: [] };

    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("recipient_id", uid)
      .eq("is_read", false)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return { success: true, data: data || [] };
  } catch (err: any) {
    console.error("getUnreadNotifications error:", err);
    return { success: false, error: err.message, data: [] };
  }
};

// ---------------------------------------------------------------------------
// ✅ MISE À JOUR D’ÉTAT
// ---------------------------------------------------------------------------

/**
 * Marque une notification comme lue.
 */
export const markNotificationAsRead = async (notificationId: string) => {
  try {
    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("id", notificationId);

    if (error) throw error;
    return { success: true };
  } catch (err: any) {
    console.error("markNotificationAsRead error:", err);
    return { success: false, error: err.message };
  }
};

/**
 * Marque toutes les notifications comme lues pour l'utilisateur connecté.
 */
export const markAllNotificationsAsRead = async (userId?: string) => {
  try {
    const uid = userId || (await getCurrentUserId());
    if (!uid) return { success: false, error: "Utilisateur non authentifié" };

    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("recipient_id", uid)
      .eq("is_read", false);

    if (error) throw error;
    return { success: true };
  } catch (err: any) {
    console.error("markAllNotificationsAsRead error:", err);
    return { success: false, error: err.message };
  }
};

// ---------------------------------------------------------------------------
// 🔔 ABONNEMENT EN TEMPS RÉEL
// ---------------------------------------------------------------------------

/**
 * S’abonne au canal notifications en temps réel (INSERT uniquement).
 * Nettoie automatiquement la connexion.
 */
export const subscribeToNotifications = (
  userId: string,
  onNotification: (notification: Notification) => void
) => {
  if (!userId) {
    console.warn("subscribeToNotifications: userId manquant");
    return () => {};
  }

  // on crée un canal unique par user
  const channelName = `notifications-${userId}`;
  const channel = supabase
    .channel(channelName, { config: { broadcast: { ack: true } } })
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "notifications",
        filter: `recipient_id=eq.${userId}`,
      },
      (payload) => {
        const notif = payload.new as Notification;
        console.debug("Realtime notification:", notif);
        onNotification(notif);
      }
    )
    .subscribe((status) => {
      if (status === "SUBSCRIBED") {
        console.log(`✅ Subscribed to realtime notifications for user ${userId}`);
      }
    });

  // nettoyage complet quand on quitte la page ou qu’on se déconnecte
  const unsubscribe = () => {
    supabase.removeChannel(channel);
    console.log(`🧹 Unsubscribed from notifications (${channelName})`);
  };

  return unsubscribe;
};
