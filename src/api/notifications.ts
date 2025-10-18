import { supabase } from '../lib/supabaseClient';

export interface Notification {
  id: string;
  recipient_id: string;
  sender_id?: string;
  title: string;
  message: string;
  type: 'reservation' | 'offer' | 'system' | 'review' | 'stock_empty' | 'daily_summary';
  offer_id: string | null;
  is_read: boolean;
  created_at: string;
}

export const getNotifications = async () => {
  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !session?.user) {
      console.error('Session error:', sessionError);
      return { success: false, error: 'User not authenticated', data: [] };
    }

    const user = session.user;

    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('recipient_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Error fetching notifications:', error);
      return { success: false, error: error.message, data: [] };
    }

    return { success: true, data: data || [] };
  } catch (err: any) {
    console.error('Exception fetching notifications:', err);
    return { success: false, error: err.message, data: [] };
  }
};

export const getUnreadNotifications = async () => {
  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !session?.user) {
      console.error('Session error:', sessionError);
      return { success: false, error: 'User not authenticated', data: [] };
    }

    const user = session.user;

    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('recipient_id', user.id)
      .eq('is_read', false)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching unread notifications:', error);
      return { success: false, error: error.message, data: [] };
    }

    return { success: true, data: data || [] };
  } catch (err: any) {
    console.error('Exception fetching unread notifications:', err);
    return { success: false, error: err.message, data: [] };
  }
};

export const markNotificationAsRead = async (notificationId: string) => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId)
      .select()
      .single();

    if (error) {
      console.error('Error marking notification as read:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (err: any) {
    console.error('Exception marking notification as read:', err);
    return { success: false, error: err.message };
  }
};

export const markAllNotificationsAsRead = async () => {
  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !session?.user) {
      console.error('Session error:', sessionError);
      return { success: false, error: 'User not authenticated' };
    }

    const user = session.user;

    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('recipient_id', user.id)
      .eq('is_read', false);

    if (error) {
      console.error('Error marking all notifications as read:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    console.error('Exception marking all notifications as read:', err);
    return { success: false, error: err.message };
  }
};

export const subscribeToNotifications = (
  userId: string,
  onNotification: (notification: Notification) => void
) => {
  const channel = supabase
    .channel('notifications')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `recipient_id=eq.${userId}`
      },
      (payload) => {
        console.log('New notification received:', payload);
        onNotification(payload.new as Notification);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
};
