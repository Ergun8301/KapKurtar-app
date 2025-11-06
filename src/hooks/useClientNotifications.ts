// src/hooks/useClientNotifications.ts
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import type { RealtimeChannel } from "@supabase/supabase-js";

interface Notification {
  id: string;
  recipient_id: string;
  type: "offer" | "offer_nearby" | "reservation" | "system" | "offer_expired" | "stock_empty";
  title: string;
  message: string;
  data?: {
    offer_id?: string;
    merchant_id?: string;
    [key: string]: any;
  };
  is_read: boolean;
  created_at: string;
}

export function useClientNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  // 🔐 Récupérer l'utilisateur connecté
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
      }
    };
    getUser();
  }, []);

  // 🧠 Charger les notifications initiales
  useEffect(() => {
    if (!userId) return;

    const fetchInitial = async () => {
      try {
        const { data, error } = await supabase
          .from("notifications")
          .select("*")
          .eq("recipient_id", userId)
          .in("type", ["offer", "offer_nearby", "system"]) // Filtrer les types pertinents pour clients
          .order("created_at", { ascending: false })
          .limit(50); // Limiter à 50 dernières notifications

        if (error) {
          console.error("❌ Erreur chargement notifications:", error);
        } else if (data) {
          console.log("✅ Notifications chargées:", data.length);
          setNotifications(data);
          setUnreadCount(data.filter((n) => !n.is_read).length);
        }
      } catch (error) {
        console.error("❌ Erreur fetch notifications:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitial();
  }, [userId]);

  // 🔔 Écoute Realtime des nouvelles notifications
  useEffect(() => {
    if (!userId) return;

    console.log("🔌 Connexion au canal Realtime pour client:", userId);

    const channel = supabase
      .channel(`client_notifications_${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `recipient_id=eq.${userId}`,
        },
        (payload) => {
          const newNotif = payload.new as Notification;

          // Filtrer uniquement les types pertinents pour clients
          const clientTypes = ["offer", "offer_nearby", "system"];
          if (!clientTypes.includes(newNotif.type)) {
            console.log("⚠️ Type de notification ignoré (non-client):", newNotif.type);
            return;
          }

          console.log("🔔 Nouvelle notification reçue:", newNotif);

          setNotifications((prev) => [newNotif, ...prev]);
          if (!newNotif.is_read) {
            setUnreadCount((count) => count + 1);
          }

          // 🔊 Notification navigateur (si permission accordée)
          if ("Notification" in window && Notification.permission === "granted") {
            new Notification(newNotif.title || "Nouvelle offre près de vous !", {
              body: newNotif.message,
              icon: "/logo-tilkapp.png",
              badge: "/logo-tilkapp.png",
            });
          }
        }
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          console.log("✅ Canal Realtime client actif");
        } else if (status === "CHANNEL_ERROR") {
          console.error("❌ Erreur canal Realtime");
        }
      });

    // 🧹 Nettoyage à la déconnexion
    return () => {
      console.log("🔌 Déconnexion du canal Realtime");
      supabase.removeChannel(channel);
    };
  }, [userId]);

  // ✅ Marquer une notification comme lue
  const markAsRead = async (id: string) => {
    if (!userId) return;

    try {
      const { error } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("id", id)
        .eq("recipient_id", userId);

      if (error) {
        console.error("❌ Erreur markAsRead:", error);
      } else {
        console.log("✅ Notification marquée comme lue:", id);
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
        );
        setUnreadCount((count) => Math.max(0, count - 1));
      }
    } catch (error) {
      console.error("❌ Erreur markAsRead:", error);
    }
  };

  // ✅ Marquer toutes les notifications comme lues
  const markAllAsRead = async () => {
    if (!userId) return;

    try {
      const { error } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("recipient_id", userId)
        .eq("is_read", false);

      if (error) {
        console.error("❌ Erreur markAllAsRead:", error);
      } else {
        console.log("✅ Toutes les notifications marquées comme lues");
        setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
        setUnreadCount(0);
      }
    } catch (error) {
      console.error("❌ Erreur markAllAsRead:", error);
    }
  };

  return {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
  };
}