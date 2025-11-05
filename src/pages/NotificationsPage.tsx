import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Check, CheckCheck, Trash2, ShoppingCart, Star, AlertCircle, TrendingUp, Package, ArrowLeft } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useRealtimeNotifications } from '../hooks/useRealtimeNotifications';
import { markNotificationAsRead, markAllNotificationsAsRead, Notification } from '../api/notifications';

const NotificationsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { notifications, unreadCount, markAsRead } = useRealtimeNotifications(user?.id || null);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const handleMarkAsRead = async (notificationId: string) => {
    markAsRead(notificationId);
    await markNotificationAsRead(notificationId);
  };

  const handleMarkAllAsRead = async () => {
    notifications.forEach((n) => markAsRead(n.id));
    await markAllNotificationsAsRead();
  };

  const getTypeStyles = (type: string) => {
    switch (type) {
      case 'reservation':
        return {
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          icon: ShoppingCart,
          badge: '🟡'
        };
      case 'review':
        return {
          color: 'text-purple-600',
          bgColor: 'bg-purple-50',
          borderColor: 'border-purple-200',
          icon: Star,
          badge: '💬'
        };
      case 'stock_empty':
        return {
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          icon: AlertCircle,
          badge: '🔴'
        };
      case 'daily_summary':
        return {
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          icon: TrendingUp,
          badge: '🟢'
        };
      case 'offer':
        return {
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          icon: Package,
          badge: '🔵'
        };
      default:
        return {
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          icon: Bell,
          badge: '⚪'
        };
    }
  };

  const filteredNotifications = filter === 'all'
    ? notifications
    : notifications.filter(n => !n.is_read);

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
          <Bell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Sign In Required</h2>
          <p className="text-gray-600 mb-6">
            Please sign in to view your notifications.
          </p>
          <button
            onClick={() => navigate('/customer/auth')}
            className="w-full bg-green-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-600 transition-colors"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </button>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Bell className="w-8 h-8 text-green-600" />
                Notifications
              </h1>
              {unreadCount > 0 && (
                <p className="text-gray-600 mt-2">
                  You have {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
                </p>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-600 transition-colors"
              >
                <CheckCheck className="w-5 h-5" />
                Mark All Read
              </button>
            )}
          </div>
        </div>

        <div className="mb-6 flex gap-3">
          <button
            onClick={() => setFilter('all')}
            className={`px-6 py-2 rounded-lg font-medium transition-all ${
              filter === 'all'
                ? 'bg-green-500 text-white shadow-md'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            All ({notifications.length})
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`px-6 py-2 rounded-lg font-medium transition-all ${
              filter === 'unread'
                ? 'bg-green-500 text-white shadow-md'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Unread ({unreadCount})
          </button>
        </div>

        <div className="space-y-4">
          {filteredNotifications.length === 0 ? (
            <div className="bg-white rounded-xl shadow-md p-12 text-center">
              <Bell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
              </h3>
              <p className="text-gray-600">
                {filter === 'unread'
                  ? 'All caught up! You have no unread notifications.'
                  : 'You will be notified here when there are updates.'}
              </p>
            </div>
          ) : (
            filteredNotifications.map((notification) => {
              const styles = getTypeStyles(notification.type);
              const Icon = styles.icon;

              return (
                <div
                  key={notification.id}
                  className={`bg-white rounded-xl shadow-md overflow-hidden border-l-4 ${styles.borderColor} transition-all hover:shadow-lg ${
                    !notification.is_read ? styles.bgColor : ''
                  }`}
                >
                  <div className="p-6">
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-full ${styles.bgColor}`}>
                        <Icon className={`w-6 h-6 ${styles.color}`} />
                      </div>

                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className={`font-bold text-lg ${styles.color} flex items-center gap-2`}>
                            <span>{styles.badge}</span>
                            {notification.title}
                          </h3>

                          {!notification.is_read && (
                            <button
                              onClick={() => handleMarkAsRead(notification.id)}
                              className={`ml-4 p-2 rounded-lg ${styles.bgColor} ${styles.color} hover:opacity-75 transition-opacity`}
                              title="Mark as read"
                            >
                              <Check className="w-5 h-5" />
                            </button>
                          )}
                        </div>

                        <p className="text-gray-700 mb-3">
                          {notification.message}
                        </p>

                        <div className="flex items-center justify-between">
                          <p className="text-sm text-gray-500">
                            {new Date(notification.created_at).toLocaleString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>

                          {!notification.is_read && (
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${styles.bgColor} ${styles.color}`}>
                              New
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;
