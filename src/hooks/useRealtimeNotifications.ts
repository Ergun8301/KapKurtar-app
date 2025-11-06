import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import type { RealtimeChannel } from '@supabase/supabase-js'

interface Notification {
  id: string
  recipient_id: string
  message: string
  type?: string
  created_at: string
}

export function useRealtimeNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [hasNewNotification, setHasNewNotification] = useState(false)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    let channel: RealtimeChannel | null = null

    const setupRealtime = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        console.log('⚠️ Pas d\'utilisateur authentifié')
        return
      }

      console.log('🔌 Connexion Realtime pour auth_id:', user.id)

      channel = supabase
        .channel(`notifications:${user.id}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications'
          },
          (payload) => {
            const newNotif = payload.new as Notification
            
            if (newNotif.recipient_id === user.id) {
              console.log('🔔 Nouvelle notification reçue:', payload)
              setNotifications(prev => [newNotif, ...prev])
              setHasNewNotification(true)
              
              try {
                const audio = new Audio('/notification.mp3')
                audio.volume = 0.5
                audio.play().catch(() => {})
              } catch {}
            }
          }
        )
        .subscribe((status) => {
          console.log('📡 Statut canal:', status)
          
          if (status === 'SUBSCRIBED') {
            console.log('✅ Canal Realtime connecté')
            setIsConnected(true)
          } else if (status === 'CHANNEL_ERROR') {
            console.error('❌ CHANNEL_ERROR')
            setIsConnected(false)
          } else if (status === 'CLOSED') {
            console.warn('⚠️ Canal fermé')
            setIsConnected(false)
          }
        })
    }

    setupRealtime()

    return () => {
      if (channel) {
        console.log('🔌 Déconnexion du canal')
        supabase.removeChannel(channel)
      }
    }
  }, [])

  return { 
    notifications, 
    hasNewNotification, 
    setHasNewNotification,
    isConnected 
  }
}