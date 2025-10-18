import { useEffect, useState } from 'react';
import { Notification, getNotifications, subscribeToNotifications } from '../api/notifications';

export function useRealtimeNotifications(userId: string | null) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    fetchNotifications();

    const unsubscribe = subscribeToNotifications(userId, (newNotification) => {
      setNotifications((prev) => [newNotification, ...prev]);
      setUnreadCount((prev) => prev + 1);
    });

    return () => {
      unsubscribe();
    };
  }, [userId]);

  useEffect(() => {
    const count = notifications.filter((n) => !n.is_read).length;
    setUnreadCount(count);
  }, [notifications]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await getNotifications();

      if (result.success) {
        setNotifications(result.data);
      } else {
        setError(result.error || 'Failed to fetch notifications');
      }
    } catch (err) {
      const error = err as Error;
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return {
    notifications,
    unreadCount,
    loading,
    error,
    refetch: fetchNotifications
  };
}
