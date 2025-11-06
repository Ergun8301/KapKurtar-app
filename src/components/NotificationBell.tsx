import React, { useState, useEffect, useRef } from 'react';
import { Bell } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useRealtimeNotifications } from '../hooks/useRealtimeNotifications';
import { supabase } from '../lib/supabaseClient';

interface Notification {
  id: string;
  recipient_id: string;
  message: string;
  title?: string;
  type?: string;
  is_read: boolean;
  created_at: string;
}

export function NotificationBell() {
  const { user } = useAuth();
  const { notifications: realtimeNotifs, hasNewNotification, setHasNewNotification } = useRealtimeNotifications();
  
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [shake, setShake] = useState(false);
  const bellRef = useRef<HTMLDivElement>(null);
  const shakeIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // 🔄 Charger les notifications existantes
  useEffect(() => {
    if (!user) return;

    const loadNotifications = async () => {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('recipient_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (!error && data) {
        setNotifications(data);
        setUnreadCount(data.filter(n => !n.is_read).length);
      }
    };

    loadNotifications();
  }, [user]);

  // 🔔 Ajouter les nouvelles notifications en temps réel
  useEffect(() => {
    if (realtimeNotifs.length > 0) {
      const latestNotif = realtimeNotifs[0];
      
      // Ajoute seulement si elle n'existe pas déjà
      setNotifications(prev => {
        const exists = prev.some(n => n.id === latestNotif.id);
        if (exists) return prev;
        return [{ ...latestNotif, is_read: false } as Notification, ...prev];
      });
      
      setUnreadCount(prev => prev + 1);
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  }, [realtimeNotifs]);

  // 📳 Animation de vibration toutes les 3 secondes si non lu
  useEffect(() => {
    if (unreadCount > 0 && !open) {
      shakeIntervalRef.current = setInterval(() => {
        setShake(true);
        setTimeout(() => setShake(false), 500);
      }, 3000);
    } else {
      if (shakeIntervalRef.current) {
        clearInterval(shakeIntervalRef.current);
        shakeIntervalRef.current = null;
      }
    }

    return () => {
      if (shakeIntervalRef.current) {
        clearInterval(shakeIntervalRef.current);
      }
    };
  }, [unreadCount, open]);

  // ✅ Fermer le popup si on clique à l'extérieur
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (bellRef.current && !bellRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 📝 Marquer comme lu
  const markAsRead = async (notificationId: string) => {
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId);

    setNotifications(prev =>
      prev.map(n => (n.id === notificationId ? { ...n, is_read: true } : n))
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  // 📝 Tout marquer comme lu
  const markAllAsRead = async () => {
    if (!user) return;

    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('recipient_id', user.id)
      .eq('is_read', false);

    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    setUnreadCount(0);
  };

  if (!user) return null;

  return (
    <div ref={bellRef} className="relative select-none">
      {/* 🔔 Cloche principale avec animation */}
      <button
        onClick={() => setOpen(!open)}
        className={`relative p-2 rounded-full hover:bg-gray-100 transition-all ${
          shake ? 'animate-shake' : ''
        }`}
      >
        <Bell className={`w-6 h-6 ${unreadCount > 0 ? 'text-green-600' : 'text-gray-700'}`} />
        
        {/* 🔴 Badge avec nombre */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[20px] h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center px-1.5 border-2 border-white animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* 📋 Menu déroulant */}
      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 overflow-hidden">
          <div className="flex justify-between items-center px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-green-50 to-emerald-50">
            <h3 className="text-sm font-bold text-gray-800">
              Notifications {unreadCount > 0 && `(${unreadCount})`}
            </h3>
            {notifications.length > 0 && unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs text-green-600 hover:text-green-700 font-medium hover:underline"
              >
                Tout marquer lu
              </button>
            )}
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="text-center py-8">
                <Bell className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">Aucune notification</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => markAsRead(n.id)}
                  className={`px-4 py-3 cursor-pointer border-b border-gray-100 last:border-b-0 transition-all hover:bg-gray-50 ${
                    !n.is_read ? 'bg-green-50 border-l-4 border-l-green-500' : 'bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {n.title && (
                        <p className="text-sm font-semibold text-gray-800 mb-1">{n.title}</p>
                      )}
                      <p className="text-sm text-gray-700">{n.message}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(n.created_at).toLocaleString('fr-FR', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    {!n.is_read && (
                      <div className="ml-2 w-2 h-2 bg-green-500 rounded-full flex-shrink-0 mt-1"></div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* 🎨 Styles CSS pour l'animation */}
      <style>{`
        @keyframes shake {
          0%, 100% { transform: rotate(0deg); }
          10%, 30%, 50%, 70%, 90% { transform: rotate(-10deg); }
          20%, 40%, 60%, 80% { transform: rotate(10deg); }
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
}