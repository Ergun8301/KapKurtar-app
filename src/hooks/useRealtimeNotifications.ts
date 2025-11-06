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
        console.log('⚠️ Aucun utilisateur authentifié — pas de Realtime')
        return
      }

      console.log('🔌 Connexion Realtime pour auth_id:', user.id)

      // ✅ Syntaxe correcte avec parenthèses
      channel = supabase
        .channel(`notifications:${user.id}`) // ⚡ Parenthèses, pas backticks seuls
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `recipient_id=eq.${user.id}`,
          },
          (payload) => {
            console.log('🔔 Nouvelle notification reçue:', payload)
            const newNotif = payload.new as Notification
            
            setNotifications(prev => [newNotif, ...prev])
            setHasNewNotification(true) // ⚡ Active le point rouge
            
            // Son de notification (local ou externe)
            try {
              const audio = new Audio('/notification.mp3') // Ou ton URL préférée
              audio.volume = 0.5
              audio.play().catch(err => console.warn('Son non joué:', err))
            } catch (e) {
              console.warn('Erreur audio:', e)
            }
          }
        )
        .subscribe((status) => {
          console.log('📡 Statut canal:', status)
          
          if (status === 'SUBSCRIBED') {
            console.log('✅ Canal Realtime CONNECTÉ')
            setIsConnected(true)
          } else if (status === 'CHANNEL_ERROR') {
            console.error('❌ CHANNEL_ERROR — Vérifier RLS policies')
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
        console.log('🔌 Déconnexion du canal Realtime')
        supabase.removeChannel(channel)
      }
    }
  }, [])

  return { 
    notifications, 
    hasNewNotification, 
    setHasNewNotification, // Pour réinitialiser le point rouge
    isConnected 
  }
}