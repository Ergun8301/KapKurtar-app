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

export const getNotifications = async (userId?: string) => {
  try {
    const uid = userId || (await getCurrentUserId());
    if (!uid)
      return { success: false, error: "Utilisateur non authentifié", data: [] };

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

export const getUnreadNotifications = async (userId?: string) => {
  try {
    const uid = userId || (await getCurrentUserId());
    if (!uid)
      return { success: false, error: "Utilisateur non authentifié", data: [] };

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
 * ✅ Version sécurisée via RPC
 */
export const markNotificationAsRead = async (notificationId: string) => {
  try {
    const { error } = await supabase.rpc("mark_notification_as_read", {
      p_id: notificationId,
    });

    if (error) throw error;
    return { success: true };
  } catch (err: any) {
    console.error("markNotificationAsRead RPC error:", err);
    return { success: false, error: err.message };
  }
};

/**
 * Marque toutes les notifications comme lues (classique)
 */
export const markAllNotificationsAsRead = async (userId?: string) => {
  try {
    const uid = userId || (await getCurrentUserId());
    if (!uid)
      return { success: false, error: "Utilisateur non authentifié" };

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

let activeChannel: ReturnType<typeof supabase.channel> | null = null;
let currentUserId: string | null = null;

/**
 * S'abonne au canal notifications en temps réel (INSERT uniquement)
 * Throttle : max 1 notification toutes les 300ms
 */
export const subscribeToNotifications = (
  userId: string,
  onNotification: (notification: Notification) => void
) => {
  if (!userId) {
    console.warn("subscribeToNotifications: userId manquant");
    return () => {};
  }

  if (activeChannel && currentUserId === userId) {
    console.log(`⚠️ Canal déjà actif pour ${userId}, réutilisation`);
    return () => {};
  }

  if (activeChannel) {
    supabase.removeChannel(activeChannel);
    activeChannel = null;
  }

  currentUserId = userId;
  let lastNotifTime = 0;
  const THROTTLE_MS = 300;

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
        const now = Date.now();
        if (now - lastNotifTime < THROTTLE_MS) {
          console.debug("⏱️ Notification throttled");
          return;
        }
        lastNotifTime = now;

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

  activeChannel = channel;

  const unsubscribe = () => {
    if (activeChannel === channel) {
      supabase.removeChannel(channel);
      activeChannel = null;
      currentUserId = null;
      console.log(`🧹 Unsubscribed from notifications (${channelName})`);
    }
  };

  return unsubscribe;
};
