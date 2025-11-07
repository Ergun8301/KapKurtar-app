import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { useNotificationSound } from "./useNotificationSound";

interface Notification {
  id: string;
  recipient_id: string;
  type:
    | "offer"
    | "offer_nearby"
    | "reservation"
    | "system"
    | "offer_expired"
    | "stock_empty";
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

  // 🧩 Étape 1 – Récupérer le vrai profile.id du client connecté
  useEffect(() => {
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setUserId(null);
        return;
      }

      // 🔥 CORRECTION : on cherche le profil lié à ce user.auth_id
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("id")
        .eq("auth_id", user.id)
        .eq("role", "client")
        .maybeSingle();

      if (error) {
        console.error("❌ Erreur récupération profil:", error);
        return;
      }

      if (profile) {
        console.log("👤 Client connecté (profile.id):", profile.id);
        setUserId(profile.id);
      } else {
        console.warn("⚠️ Aucun profil client trouvé pour cet utilisateur.");
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

    console.log("⚡ Initialisation canal Realtime client:", userId);

    const channel: RealtimeChannel = supabase
      .channel(`notifications:client:${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `recipient_id=eq.${userId}`,
        },
        (payload) => {
          console.log("📨 Nouvelle donnée reçue:", payload);

          const newNotif = payload.new as Notification;
          const clientTypes = ["offer", "offer_nearby", "system"];
          if (!clientTypes.includes(newNotif.type)) return;

          console.log("🟢 Nouvelle notification CLIENT:", newNotif.title);
          play();

          setNotifications((prev) => [newNotif, ...prev]);
          if (!newNotif.is_read) setUnreadCount((c) => c + 1);
        }
      )
      .subscribe((status) => {
        console.log("📡 Statut canal CLIENT:", status);
        if (status === "CHANNEL_ERROR") console.error("❌ Erreur Realtime CLIENT");
        if (status === "CLOSED") console.warn("⚠️ Canal CLIENT fermé");
      });

    return () => {
      console.log("🔌 Déconnexion canal CLIENT");
      supabase.removeChannel(channel);
    };
  }, [userId]);

  return { notifications, unreadCount };
}
