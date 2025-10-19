// src/hooks/useRealtimeNotifications.ts
import { useEffect, useState, useCallback } from "react";
import {
  Notification,
  getNotifications,
  subscribeToNotifications,
} from "../api/notifications";

/**
 * Hook React moderne et robuste pour gérer les notifications en temps réel.
 * Compatible avec Supabase Realtime et ton API existante.
 * Gère : chargement initial, erreurs, mise à jour live, compteur de non-lus.
 */
export function useRealtimeNotifications(userId: string | null) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- Charger les notifications depuis ton API Supabase ---
  const fetchNotifications = useCallback(async () => {
    if (!userId) return;
    try {
      setLoading(true);
      setError(null);

      const result = await getNotifications(userId); // ✅ on passe l'userId
      if (result.success && Array.isArray(result.data)) {
        setNotifications(result.data);
      } else {
        throw new Error(result.error || "Impossible de charger les notifications");
      }
    } catch (err) {
      console.error("Erreur fetchNotifications:", err);
      const e = err as Error;
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // --- Écouter les notifications en temps réel via Supabase ---
  useEffect(() => {
    if (!userId) {
      setNotifications([]);
      setUnreadCount(0);
      setLoading(false);
      return;
    }

    fetchNotifications();

    const unsubscribe = subscribeToNotifications(userId, (newNotification: Notification) => {
      setNotifications((prev) => {
        // éviter les doublons en cas de rafraîchissement
        if (prev.some((n) => n.id === newNotification.id)) return prev;
        return [newNotification, ...prev];
      });
    });

    return () => {
      unsubscribe?.();
    };
  }, [userId, fetchNotifications]);

  // --- Mettre à jour le compteur de non-lus dynamiquement ---
  useEffect(() => {
    const count = notifications.filter((n) => !n.is_read).length;
    setUnreadCount(count);
  }, [notifications]);

  // --- Marquer une notification comme lue ---
  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === id ? { ...n, is_read: true } : n
      )
    );
  }, []);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    refetch: fetchNotifications,
    markAsRead,
  };
}
