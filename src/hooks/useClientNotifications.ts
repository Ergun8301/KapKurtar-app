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
  data?: { offer_id?: string; merchant_id?: string; [key: string]: any };
  is_read: boolean;
  created_at: string;
}

export function useClientNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [userId, setUserId] = useState<string | null>(null);
  const { play } = useNotificationSound();

  // ✅ Récupérer auth.uid() directement
  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.log("❌ Aucun utilisateur connecté");
        setUserId(null);
        return;
      }

      console.log("👤 Client connecté (auth.uid()):", user.id);
      setUserId(user.id);
    })();
  }, []);

  // ✅ Charger les notifications existantes
  useEffect(() => {
    if (!userId) return;

    (async () => {
      console.log("📥 Chargement des notifications pour:", userId);
      
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

  // ✅ Realtime : écouter les nouvelles notifications
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
        (payload) => {
          const newNotif = payload.new as Notification;
          const clientTypes = ["offer", "offer_nearby", "system"];
          
          if (!clientTypes.includes(newNotif.type)) {
            console.log("⚠️ Type ignoré:", newNotif.type);
            return;
          }

          console.log("🟢 Nouvelle notification CLIENT:", newNotif.title);
          console.log("📦 Payload complet:", newNotif);
          
          // 🔊 Jouer le son
          try {
            play();
          } catch (err) {
            console.warn("🔇 Son bloqué:", err);
          }
          
          // 📝 Ajouter à la liste
          setNotifications((prev) => [newNotif, ...prev]);
          if (!newNotif.is_read) {
            setUnreadCount((c) => c + 1);
          }
        }
      )
      .subscribe((status) => {
        console.log("📡 Statut canal CLIENT:", status);
        
        if (status === "SUBSCRIBED") {
          console.log("✅ Canal Realtime CLIENT actif");
        } else if (status === "CHANNEL_ERROR") {
          console.error("❌ Erreur Realtime CLIENT");
        } else if (status === "CLOSED") {
          console.warn("⚠️ Canal CLIENT fermé");
        } else if (status === "TIMED_OUT") {
          console.error("⏱️ Timeout canal CLIENT");
        }
      });

    return () => {
      console.log("🔌 Déconnexion canal CLIENT");
      supabase.removeChannel(channel);
    };
  }, [userId]); // ✅ CORRECTION : Enlevé 'play' des dépendances

  // ✅ Fonction pour marquer comme lu
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
    } else {
      console.error("❌ Erreur markAsRead:", error);
    }
  };

  // ✅ Fonction pour tout marquer comme lu
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
    } else {
      console.error("❌ Erreur markAllAsRead:", error);
    }
  };

  return { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead 
  };
}