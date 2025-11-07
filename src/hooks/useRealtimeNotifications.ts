import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import type { RealtimeChannel } from "@supabase/supabase-js";

interface Notification {
  id: string;
  recipient_id: string;
  type: "offer" | "offer_nearby" | "reservation" | "system" | "offer_expired" | "stock_empty";
  title: string;
  message: string;
  data?: { offer_id?: string; merchant_id?: string; [key: string]: any };
  is_read: boolean;
  created_at: string;
}

export function useClientNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  // ✅ Auth
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        console.log("👤 Client connecté:", user.id);
        setUserId(user.id);
      }
    };
    getUser();
  }, []);

  // ✅ Realtime reconnexion automatique
  useEffect(() => {
    const reconnectRealtime = async () => {
      try {
        const session = (await supabase.auth.getSession()).data.session;
        const token = session?.access_token || "";
        supabase.realtime.setAuth(token);
        supabase.realtime.connect();
        console.log("📡 Realtime client initialisé");
      } catch (err) {
        console.warn("⚠️ Erreur Realtime client:", err);
      }
    };
    reconnectRealtime();

    const interval = setInterval(() => {
      if (!supabase.realtime.isConnected()) {
        console.warn("🔁 Reconnexion forcée Realtime client...");
        supabase.realtime.connect();
      }
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  // ✅ Récupération initiale
  useEffect(() => {
    if (!userId) return;

    const fetchInitial = async () => {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("recipient_id", userId)
        .in("type", ["offer_nearby", "system", "offer", "reservation"])
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) {
        console.error("❌ Erreur chargement notifications client:", error);
      } else if (data) {
        console.log(`✅ Notifications client chargées: ${data.length}`);
        setNotifications(data);
        setUnreadCount(data.filter((n) => !n.is_read).length);
      }
      setIsLoading(false);
    };

    fetchInitial();
  }, [userId]);

  // ✅ Abonnement Realtime
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
          filter: `recipient_id=eq.${userId}`,
        },
        async (payload) => {
          const newNotif = payload.new as Notification;

          // 🔎 On filtre les types client
          const clientTypes = ["offer_nearby", "system", "offer", "reservation"];
          if (!clientTypes.includes(newNotif.type)) return;

          console.log("🟢 Nouvelle notification CLIENT:", newNotif.title);
          setNotifications((prev) => [newNotif, ...prev]);
          if (!newNotif.is_read) setUnreadCount((count) => count + 1);

          try {
            const audio = new Audio(
              "https://cdn.jsdelivr.net/gh/naptha/talkify-tts-voices@master/sounds/notification.mp3"
            );
            audio.volume = 0.5;
            await audio.play();
          } catch {
            console.warn("🔇 Son bloqué");
          }
        }
      )
      .subscribe((status) => {
        console.log("📡 Statut canal CLIENT:", status);
      });

    return () => {
      console.log("🔌 Déconnexion canal CLIENT");
      supabase.removeChannel(channel);
    };
  }, [userId]);

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

  return { notifications, unreadCount, isLoading, markAsRead, markAllAsRead };
}
