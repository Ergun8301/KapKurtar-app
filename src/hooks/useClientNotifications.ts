import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { useNotificationSound } from "./useNotificationSound";

interface Notification {
  id: string;
  recipient_id: string;
  type: "offer" | "offer_nearby" | "reservation" | "system" | "offer_expired" | "stock_empty";
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export function useClientNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [userId, setUserId] = useState<string | null>(null);
  const { play } = useNotificationSound();

  // ✅ CORRECTION : Utiliser directement user.id (qui est auth.uid())
  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setUserId(null);
        return;
      }

      // ✅ user.id = auth.uid() = profiles.auth_id (ce que les RLS attendent)
      console.log("👤 Client connecté (auth.uid()):", user.id);
      setUserId(user.id);
    })();
  }, []);

  // Charger les notifications existantes
  useEffect(() => {
    if (!userId) return;

    (async () => {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("recipient_id", userId)  // ✅ Maintenant userId = auth.uid()
        .in("type", ["offer", "offer_nearby", "system"])
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) {
        console.error("❌ Erreur chargement notifications:", error);
      } else {
        console.log(`✅ Notifications client chargées: ${data.length}`);
        setNotifications(data);
        setUnreadCount(data.filter((n) => !n.is_read).length);
      }
    })();
  }, [userId]);

  // Realtime : écouter les nouvelles notifications
  useEffect(() => {
    if (!userId) return;

    console.log("🔌 Connexion Realtime CLIENT:", userId);

    const channel: RealtimeChannel = supabase
      .channel(`client_notifications_${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `recipient_id=eq.${userId}`,  // ✅ Maintenant userId = auth.uid()
        },
        (payload) => {
          const newNotif = payload.new as Notification;
          const clientTypes = ["offer", "offer_nearby", "system"];
          
          if (!clientTypes.includes(newNotif.type)) {
            console.log("⚠️ Type ignoré:", newNotif.type);
            return;
          }

          console.log("🟢 Nouvelle notification CLIENT:", newNotif.title);
          play();
          setNotifications((prev) => [newNotif, ...prev]);
          if (!newNotif.is_read) setUnreadCount((c) => c + 1);
        }
      )
      .subscribe((status) => {
        console.log("📡 Statut canal CLIENT:", status);
        if (status === "SUBSCRIBED") {
          console.log("✅ Canal Realtime CLIENT actif");
        } else if (status === "CHANNEL_ERROR") {
          console.error("❌ Erreur Realtime CLIENT");
        }
      });

    return () => {
      console.log("🔌 Déconnexion canal CLIENT");
      supabase.removeChannel(channel);
    };
  }, [userId, play]);

  // Fonctions utilitaires
  const markAsRead = async (id: string) => {
    if (!userId) return;
    
    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("id", id)
      .eq("recipient_id", userId);

    if (!error) {
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
      setUnreadCount((count) => Math.max(0, count - 1));
    }
  };

  const markAllAsRead = async () => {
    if (!userId) return;
    
    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("recipient_id", userId)
      .eq("is_read", false);

    if (!error) {
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    }
  };

  return { notifications, unreadCount, markAsRead, markAllAsRead };
}