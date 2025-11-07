import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import type { Notification } from "../api/notifications";
import { useNotificationSound } from "./useNotificationSound"; // ✅ ajout

interface UseMerchantNotificationsOptions {
  merchantId: string | null;
}

export function useMerchantNotifications({
  merchantId,
}: UseMerchantNotificationsOptions) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { play } = useNotificationSound(); // ✅ ajout du hook pour le son

  useEffect(() => {
    if (!merchantId) {
      setLoading(false);
      return;
    }

    let mounted = true;

    const fetchNotifications = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data, error: fetchError } = await supabase
          .from("notifications")
          .select("*")
          .eq("recipient_id", merchantId)
          .order("created_at", { ascending: false })
          .limit(50);

        if (fetchError) throw fetchError;

        if (mounted) {
          setNotifications(data || []);
          const count = (data || []).filter((n: Notification) => !n.is_read).length;
          setUnreadCount(count);
        }
      } catch (err) {
        const error = err as Error;
        if (mounted) {
          setError(error.message);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchNotifications();

    // 🧩 Realtime : écoute les nouvelles notifications
    const channel = supabase
      .channel(`notifications:merchant:${merchantId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `recipient_id=eq.${merchantId}`,
        },
        (payload) => {
          if (!mounted) return;
          const newNotification = payload.new as Notification;

          // ✅ Joue le son à chaque nouvelle notification Realtime
          play();

          setNotifications((prev) => [newNotification, ...prev]);
          setUnreadCount((prev) => prev + 1);
        }
      )
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, [merchantId, play]);

  // 🟩 Marquer une notification comme lue
  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("id", notificationId);

      if (error) throw error;

      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, is_read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      const error = err as Error;
      setError(error.message);
    }
  };

  // 🟩 Marquer toutes les notifications comme lues
  const markAllAsRead = async () => {
    if (!merchantId) return;

    try {
      const { error } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("recipient_id", merchantId)
        .eq("is_read", false);

      if (error) throw error;

      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (err) {
      const error = err as Error;
      setError(error.message);
    }
  };

  return {
    notifications,
    unreadCount,
    loading,
    error,
    markAsRead,
    markAllAsRead,
  };
}
