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

      console.log('🔌 TEST SANS FILTRE pour auth_id:', user.id)

      channel = supabase
        .channel(`notifications-test-${Date.now()}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications'
          },
          (payload) => {
            console.log('🔔 Notification reçue (SANS FILTRE):', payload)
            const newNotif = payload.new as Notification
            
            if (newNotif.recipient_id === user.id) {
              console.log('✅ Notification pour moi!')
              setNotifications(prev => [newNotif, ...prev])
              setHasNewNotification(true)
              
              try {
                const audio = new Audio('/notification.mp3')
                audio.volume = 0.5
                audio.play().catch(() => {})
              } catch {}
            } else {
              console.log('⚠️ Notification pour quelqu\'un d\'autre:', newNotif.recipient_id)
            }
          }
        )
        .subscribe((status) => {
          console.log('📡 Statut canal (SANS FILTRE):', status)
          
          if (status === 'SUBSCRIBED') {
            console.log('✅✅✅ Canal CONNECTÉ SANS FILTRE!')
            setIsConnected(true)
          } else if (status === 'CHANNEL_ERROR') {
            console.error('❌ CHANNEL_ERROR même sans filtre')
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