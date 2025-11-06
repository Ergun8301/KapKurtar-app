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

      // 🧪 TEST : Sans filtre côté serveur
      channel = supabase
        .channel(`notifications-test-${Date.now()}`) // Nom unique
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications'
            // ⚠️ PAS de filter pour ce test
          },
          (payload) => {
            console.log('🔔 Notification reçue (SANS FILTRE):', payload)
            const newNotif = payload.new as Notification
            
            // Filtre côté client seulement
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
```

---

## 🧪 Teste maintenant

1. **Sauvegarde le fichier**
2. **Recharge la page** (Ctrl+Shift+R)
3. **Ouvre la console** (F12)

**Tu devrais voir :**
```
🔌 TEST SANS FILTRE pour auth_id: fc215a2b-...
📡 Statut canal (SANS FILTRE): SUBSCRIBED
✅✅✅ Canal CONNECTÉ SANS FILTRE!