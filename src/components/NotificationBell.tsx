import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import {
  getNotifications,
  markAllNotificationsAsRead,
  subscribeToNotifications,
} from "../api/notifications";

export default function NotificationBell({ userId }: { userId: string }) {
  const [open, setOpen] = useState(false);
  const [list, setList] = useState<any[]>([]);
  const [unread, setUnread] = useState(0);

  // 🔹 Initial fetch
  useEffect(() => {
    if (!userId) return;
    getNotifications(userId).then((res) => {
      if (res.success) {
        setList(res.data);
        setUnread(res.data.filter((n: any) => !n.is_read).length);
      }
    });
  }, [userId]);

  // ⚡ Realtime subscription
  useEffect(() => {
    if (!userId) return;
    const unsub = subscribeToNotifications(userId, (notif) => {
      setList((prev) => [notif, ...prev]);
      setUnread((u) => u + 1);
    });
    return () => unsub();
  }, [userId]);

  // 🔔 Toggle + mark all read
  const handleOpen = async () => {
    setOpen(!open);
    if (!open && unread > 0) {
      await markAllNotificationsAsRead(userId);
      setUnread(0);
      setList((prev) => prev.map((n) => ({ ...n, is_read: true })));
    }
  };

  return (
    <div className="relative">
      <button
        onClick={handleOpen}
        className="relative p-2 rounded-full hover:bg-gray-100 transition"
      >
        <Bell className="w-6 h-6 text-gray-700" />
        {unread > 0 && (
          <span className="absolute top-1 right-1 bg-red-500 text-white text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center">
            {unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white shadow-xl rounded-lg p-3 z-50">
          <h3 className="text-sm font-semibold mb-2">Notifications</h3>
          {list.length === 0 ? (
            <p className="text-gray-400 text-sm">Aucune notification</p>
          ) : (
            <ul className="max-h-64 overflow-y-auto divide-y divide-gray-200">
              {list.slice(0, 10).map((n) => (
                <li
                  key={n.id}
                  className={`p-2 text-sm ${
                    n.is_read ? "text-gray-500" : "font-medium text-gray-800"
                  }`}
                >
                  <div>{n.title}</div>
                  <div className="text-xs text-gray-400">
                    {new Date(n.created_at).toLocaleString()}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
