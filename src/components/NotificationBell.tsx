import React, { useState, useEffect, useCallback } from "react";
import {
  Bell,
  Check,
  ShoppingCart,
  Star,
  AlertCircle,
  TrendingUp,
  Package,
} from "lucide-react";
import { useRealtimeNotifications } from "../hooks/useRealtimeNotifications";
import {
  markNotificationAsRead,
  markAllNotificationsAsRead,
  Notification,
} from "../api/notifications";
import { useAuth } from "../hooks/useAuth";

/**
 * Composant NotificationBell
 * - Affiche la cloche + compteur
 * - Menu déroulant stylé
 * - Toast pour nouvelles notifications
 * - Aucune boucle de requêtes Supabase (optimisé)
 */
export const NotificationBell: React.FC = () => {
  const { user } = useAuth();
  const {
    notifications,
    unreadCount,
    refetch,
    markAsRead,
  } = useRealtimeNotifications(user?.id || null);

  const [isOpen, setIsOpen] = useState(false);
  const [toast, setToast] = useState<Notification | null>(null);

  const [lastToastId, setLastToastId] = React.useRef<string | null>(null);

  useEffect(() => {
    if (notifications.length > 0 && !notifications[0].is_read) {
      const latest = notifications[0];
      if (lastToastId.current !== latest.id) {
        setToast(latest);
        lastToastId.current = latest.id;

        const timer = setTimeout(() => setToast(null), 5000);
        return () => clearTimeout(timer);
      }
    }
  }, [notifications]);

  // --- Gestion marquage ---
  const handleMarkAsRead = useCallback(
    async (id: string) => {
      markAsRead(id);
      await markNotificationAsRead(id);
    },
    [markAsRead]
  );

  const handleMarkAllAsRead = useCallback(async () => {
    await markAllNotificationsAsRead();
    notifications.forEach((n) => markAsRead(n.id));
  }, [notifications, markAsRead]);

  const getTypeStyles = (type: string) => {
    switch (type) {
      case "reservation":
        return {
          color: "text-yellow-600",
          bgColor: "bg-yellow-50",
          icon: ShoppingCart,
          badge: "🟡",
        };
      case "review":
        return {
          color: "text-purple-600",
          bgColor: "bg-purple-50",
          icon: Star,
          badge: "💬",
        };
      case "stock_empty":
        return {
          color: "text-red-600",
          bgColor: "bg-red-50",
          icon: AlertCircle,
          badge: "🔴",
        };
      case "daily_summary":
        return {
          color: "text-green-600",
          bgColor: "bg-green-50",
          icon: TrendingUp,
          badge: "🟢",
        };
      case "offer":
        return {
          color: "text-blue-600",
          bgColor: "bg-blue-50",
          icon: Package,
          badge: "🔵",
        };
      default:
        return {
          color: "text-gray-600",
          bgColor: "bg-gray-50",
          icon: Bell,
          badge: "⚪",
        };
    }
  };

  if (!user) return null;

  return (
    <div className="relative select-none">
      {/* --- Icône principale --- */}
      <button
        onClick={() => setIsOpen((o) => !o)}
        className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* --- Menu déroulant --- */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl z-50 max-h-[600px] overflow-hidden flex flex-col border border-gray-100">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                Notifications
                {unreadCount > 0 && (
                  <span className="ml-1 text-sm text-gray-500">
                    ({unreadCount})
                  </span>
                )}
              </h3>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Tout marquer lu
                </button>
              )}
            </div>

            <div className="overflow-y-auto flex-1">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  Aucune notification
                </div>
              ) : (
                notifications.map((n) => {
                  const s = getTypeStyles(n.type);
                  const Icon = s.icon;
                  return (
                    <div
                      key={n.id}
                      className={`p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                        !n.is_read ? s.bgColor : ""
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-full ${s.bgColor}`}>
                          <Icon className={`w-5 h-5 ${s.color}`} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <h4 className={`font-semibold ${s.color}`}>
                              {s.badge} {n.title}
                            </h4>
                            {!n.is_read && (
                              <button
                                onClick={() => handleMarkAsRead(n.id)}
                                className="ml-2 p-1 text-gray-400 hover:text-green-600 transition-colors"
                                title="Marquer comme lu"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            {n.message}
                          </p>
                          <p className="text-xs text-gray-400 mt-2">
                            {new Date(n.created_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </>
      )}

      {/* --- Toast notification --- */}
      {toast && !isOpen && (
        <div className="fixed top-20 right-4 z-50 animate-slide-down">
          <div
            className={`${getTypeStyles(toast.type).bgColor} border-l-4 ${
              getTypeStyles(toast.type).color.replace("text", "border")
            } rounded-lg shadow-lg p-4 max-w-sm cursor-pointer hover:shadow-xl transition-shadow`}
            onClick={() => {
              setIsOpen(true);
              setToast(null);
            }}
          >
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-full bg-white">
                {React.createElement(getTypeStyles(toast.type).icon, {
                  className: `w-5 h-5 ${getTypeStyles(toast.type).color}`,
                })}
              </div>
              <div className="flex-1">
                <h4
                  className={`font-semibold ${getTypeStyles(toast.type).color} flex items-center gap-2`}
                >
                  <span>{getTypeStyles(toast.type).badge}</span>
                  {toast.title}
                </h4>
                <p className="text-sm text-gray-700 mt-1">{toast.message}</p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setToast(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <Check className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
