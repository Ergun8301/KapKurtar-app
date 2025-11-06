import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { type Notification } from '../api/notifications';

export function useRealtimeNotifications(userId: string | null) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!userId) return;

    const loadNotifications = async () => {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('recipient_id', userId)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setNotifications(data);
        setUnreadCount(data.filter((n) => !n.is_read).length);
      }
    };

    loadNotifications();

    // ✅ Canal Realtime standard (plus fiable)
    const channel = supabase
  .channel('public:notifications') // ✅ canal standard sans "realtime:"
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `recipient_id=eq.${userId}`,
        },
        (payload) => {
          console.log('✅ Nouvelle notification reçue:', payload);
          const newNotif = payload.new as Notification;
          setNotifications((prev) => [newNotif, ...prev]);
          setUnreadCount((prev) => prev + 1);

          // 🔔 Son à la réception (désactivable dans localStorage)
          if (window.localStorage.getItem('sound_enabled') === 'false') return;
          const audio = new Audio(
            'https://cdn.pixabay.com/audio/2022/03/15/audio_37a938c87d.mp3'
          );
          audio.volume = 0.5;
          audio.play().catch(() => {});
        }
      )
      .subscribe((status) => {
        console.log('📡 Canal Supabase notifications:', status);
      });

    // ✅ Canal Realtime pour les offres (mise à jour stock auto)
    const offersChannel = supabase
      .channel('realtime:public:offers')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'offers' },
        (payload) => {
          console.log('🔄 Offre mise à jour:', payload);
          // ici on ne touche pas à la liste de notif,
          // c’est juste pour que le dashboard réagisse sans reload
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      supabase.removeChannel(offersChannel);
    };
  }, [userId]);

  // ✅ Marquer une notif comme lue
  const markAsRead = async (id: string) => {
    await supabase.from('notifications').update({ is_read: true }).eq('id', id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
    setUnreadCount((prev) => Math.max(prev - 1, 0));
  };

  // ✅ Tout marquer lu
  const markAllAsRead = async () => {
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('recipient_id', userId);
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setUnreadCount(0);
  };

  return { notifications, unreadCount, markAsRead, markAllAsRead };
}
