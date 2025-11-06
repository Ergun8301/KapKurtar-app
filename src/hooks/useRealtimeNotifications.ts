import { useEffect, useRef, useState } from 'react'
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

  // 🔒 Références pour éviter les boucles et conserver le même canal
  const channelRef = useRef<RealtimeChannel | null>(null)
  const reconnectAttempts = useRef(0)
  const reconnectTimeout = useRef<NodeJS.Timeout | null>(null)
  const MAX_RECONNECT_ATTEMPTS = 5

  useEffect(() => {
    const setupRealtime = async () => {
      // 🧹 Évite de créer plusieurs canaux simultanément
      if (channelRef.current) {
        console.warn('⚠️ Canal déjà actif, on annule la recréation.')
        return
      }

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        console.log('⚠️ Aucun utilisateur connecté')
        return
      }

      console.log('🔌 Connexion Realtime pour auth_id:', user.id)

      const channel = supabase
        .channel(`notifications:${user.id}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications'
          },
          async (payload) => {
            const newNotif = payload.new as Notification

            if (newNotif.recipient_id === user.id) {
              console.log('🔔 Nouvelle notification reçue:', payload)
              setNotifications(prev => [newNotif, ...prev])
              setHasNewNotification(true)

              // 🎵 Lecture du son
              try {
                // ✅ URL stable (aucune restriction CORS, HTTPS ok)
                const audio = new Audio('https://cdn.jsdelivr.net/gh/naptha/talkify-tts-voices@master/sounds/notification.mp3')
                audio.volume = 0.5
                await audio.play()
                console.log('🔊 Son joué avec succès')
              } catch (err) {
                console.warn('🔇 Lecture audio bloquée ou refusée:', err)
              }
            }
          }
        )
        .subscribe((status) => {
          console.log('📡 Statut canal:', status)

          if (status === 'SUBSCRIBED') {
            console.log('✅ Canal Realtime connecté')
            setIsConnected(true)
            reconnectAttempts.current = 0
          } 
          else if (status === 'CHANNEL_ERROR' || status === 'CLOSED') {
            console.warn('⚠️ Connexion perdue')
            setIsConnected(false)

            // 🔄 Reconnexion avec "exponential backoff"
            if (reconnectAttempts.current < MAX_RECONNECT_ATTEMPTS) {
              const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000)
              reconnectAttempts.current++
              console.log(`🔄 Reconnexion dans ${delay / 1000}s... (tentative ${reconnectAttempts.current}/${MAX_RECONNECT_ATTEMPTS})`)

              reconnectTimeout.current = setTimeout(() => {
                if (channelRef.current) {
                  supabase.removeChannel(channelRef.current)
                  channelRef.current = null
                }
                setupRealtime()
              }, delay)
            } else {
              console.error('❌ Trop de tentatives de reconnexion échouées')
            }
          }
        })

      channelRef.current = channel
    }

    setupRealtime()

    // 🧹 Nettoyage propre au démontage du composant
    return () => {
      if (channelRef.current) {
        console.log('🧹 Nettoyage: suppression du canal')
        supabase.removeChannel(channelRef.current)
        channelRef.current = null
      }
      if (reconnectTimeout.current) clearTimeout(reconnectTimeout.current)
    }
  }, [])

  return { 
    notifications,
    hasNewNotification,
    setHasNewNotification,
    isConnected
  }
}
