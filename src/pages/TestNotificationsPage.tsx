import { useClientNotifications } from "../hooks/useClientNotifications";

export default function TestNotificationsPage() {
  const { notifications } = useClientNotifications();

  return (
    <div className="p-4">
      <h2 className="text-lg font-bold mb-2">🔔 Notifications Realtime</h2>
      <ul>
        {notifications.map((n) => (
          <li key={n.id} className="border-b py-1">
            <b>{n.title}</b> <span className="text-gray-500">({n.type})</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
