// src/hooks/useClientNotifications.ts
import { useEffect, useState } from "react"
import { supabase } from "@/utils/supabaseClient"
import { RealtimeChannel } from "@supabase/supabase-js"

interface Notification {
  id: string
  type: string
  title: string
  message: string
  offer_id?: string
  is_read: boolean
  created_at: string
}

export function useClientNotifications(userId?: string) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [channel, setChannel] = useState<RealtimeChannel | null>(null)

  // 🧠 Charger les notifications initiales
  useEffect(() => {
    if (!userId) return

    const fetchInitial = async () => {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("recipient_id", userId)
        .order("created_at", { ascending: false })

      if (!error && data) {
        setNotifications(data)
        setUnreadCount(data.filter((n) => !n.is_read).length)
      }
    }

    fetchInitial()
  }, [userId])

  // 🔔 Écoute Realtime
  useEffect(() => {
    if (!userId) return

    const newChannel = supabase
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
          const newNotif = payload.new as Notification
          setNotifications((prev) => [newNotif, ...prev])
          setUnreadCount((count) => count + 1)
        }
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          console.log("✅ Client notifications subscribed:", userId)
        }
      })

    setChannel(newChannel)

    return () => {
      if (channel) supabase.removeChannel(channel)
      supabase.removeChannel(newChannel)
    }
  }, [userId])

  // ✅ Marquer une notification comme lue
  const markAsRead = async (id: string) => {
    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("id", id)
      .eq("recipient_id", userId)

    if (!error) {
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      )
      setUnreadCount((count) => Math.max(0, count - 1))
    }
  }

  return {
    notifications,
    unreadCount,
    markAsRead,
  }
}
