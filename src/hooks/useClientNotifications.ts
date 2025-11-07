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
  const [profileId, setProfileId] = useState<string | null>(null);
  const { play } = useNotificationSound();

  // 🧩 Étape 1 – récupérer le vrai profile.id (et pas auth.id)
  useEffect(() => {
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setProfileId(null);
        return;
      }

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
        setProfileId(profile.id);
      } else {
        console.warn("⚠️ Aucun profil client trouvé pour cet utilisateur.");
      }
    })();
  }, []);

  // 🧩 Étape 2 – Charger les notifications existantes
  useEffect(() => {
    if (!profileId) return;

    (async () => {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("recipient_id", profileId)
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
  }, [profileId]);

  // 🧩 Étape 3 – Écoute Realtime
  useEffect(() => {
    if (!profileId) return;

    console.log("⚡ Initialisation canal Realtime client:", profileId);

    const channel: RealtimeChannel = supabase
      .channel(`realtime:client:${profileId}`, {
        config: { broadcast: { ack: false } },
      })
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `recipient_id=eq.${profileId}`,
        },
        (payload) => {
          console.log("📨 Nouvelle notification Realtime:", payload.new);
          const newNotif = payload.new as Notification;
          const allowedTypes = ["offer", "offer_nearby", "system"];
          if (!allowedTypes.includes(newNotif.type)) return;

          play();
          setNotifications((prev) => [newNotif, ...prev]);
          if (!newNotif.is_read) setUnreadCount((c) => c + 1);
        }
      )
      .subscribe((status) => console.log("📡 Statut canal CLIENT:", status));

    return () => {
      console.log("🔌 Déconnexion canal CLIENT");
      supabase.removeChannel(channel);
    };
  }, [profileId]);

  return { notifications, unreadCount };
}
