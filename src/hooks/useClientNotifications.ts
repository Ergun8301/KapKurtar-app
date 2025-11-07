import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import type { RealtimeChannel } from "@supabase/supabase-js";

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

  // 🧩 Étape 1 – Récupérer l'utilisateur
  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        console.log("👤 Client connecté:", user.id);
        setUserId(user.id);
      }
    })();
  }, []);

  // 🧩 Étape 2 – Charger les notifications existantes
  useEffect(() => {
    if (!userId) return;

    (async () => {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("recipient_id", userId)
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

  // 🧩 Étape 3 – Realtime : écouter les nouvelles notifications
  useEffect(() => {
    if (!userId) return;

    console.log("🔌 Connexion Realtime CLIENT:", userId);

    // ⚠️ Canal corrigé (le vrai canal Realtime Supabase)
    const channel: RealtimeChannel = supabase
      .channel("realtime:public:notifications")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `recipient_id=eq.${userId}`,
        },
        async (payload) => {
          console.log("📨 Nouvelle donnée reçue:", payload);

          const newNotif = payload.new as Notification;
          const clientTypes = ["offer", "offer_nearby", "system"];
          if (!clientTypes.includes(newNotif.type)) return;

          console.log("🟢 Nouvelle notification CLIENT:", newNotif.title);
          setNotifications((prev) => [newNotif, ...prev]);
          if (!newNotif.is_read) setUnreadCount((c) => c + 1);

          // 🔊 Lecture du son (optionnelle)
          try {
            const audio = new Audio(
              "https://cdn.jsdelivr.net/gh/naptha/talkify-tts-voices@master/sounds/notification.mp3"
            );
            audio.volume = 0.5;
            await audio.play();
            console.log("🔊 Son joué");
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

  return { notifications, unreadCount };
}
