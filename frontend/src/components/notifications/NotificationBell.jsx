import { useEffect, useState } from "react";
import {
  getNotifications,
  getUnreadNotificationCount,
  markAllNotificationsRead,
  markNotificationRead,
} from "../../services/notificationService";

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [count, setCount] = useState(0);
  const [notifications, setNotifications] = useState([]);

  async function refreshCount() {
    try {
      const result = await getUnreadNotificationCount();
      setCount(Number(result?.count) || 0);
    } catch (_error) {
      setCount(0);
    }
  }

  useEffect(() => {
    refreshCount();
    const timer = setInterval(refreshCount, 30000);
    return () => clearInterval(timer);
  }, []);

  async function toggleOpen() {
    const next = !open;
    setOpen(next);
    if (!next) return;
    try {
      setLoading(true);
      const list = await getNotifications();
      setNotifications(Array.isArray(list) ? list : []);
    } finally {
      setLoading(false);
    }
  }

  async function onRead(item) {
    await markNotificationRead(item.id);
    setNotifications((prev) => prev.map((n) => (n.id === item.id ? { ...n, is_read: true } : n)));
    setCount((prev) => Math.max(0, prev - 1));
  }

  async function onReadAll() {
    await markAllNotificationsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setCount(0);
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={toggleOpen}
        className="relative rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm hover:bg-slate-50 transition"
      >
        Bell
        {count > 0 ? (
          <span className="absolute -top-2 -right-2 inline-flex min-w-5 justify-center rounded-full bg-red-600 px-1 text-[10px] text-white">
            {count}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="absolute right-0 z-30 mt-2 w-80 rounded-xl border border-slate-200 bg-white p-3 shadow-xl">
          <div className="mb-2 flex items-center justify-between">
            <h4 className="text-sm font-semibold">Notifications</h4>
            <button
              type="button"
              onClick={onReadAll}
              className="rounded-md border border-slate-200 px-2 py-1 text-xs text-slate-600 hover:bg-slate-50"
            >
              Mark all read
            </button>
          </div>
          {loading ? <p className="text-xs text-slate-500">Loading...</p> : null}
          {!loading && !notifications.length ? <p className="text-xs text-slate-500">No notifications.</p> : null}
          <ul className="max-h-64 space-y-2 overflow-y-auto">
            {notifications.map((item) => (
              <li key={item.id} className={`rounded-lg border p-2 ${item.is_read ? "border-slate-200" : "border-indigo-200 bg-indigo-50/50"}`}>
                <p className="text-xs font-semibold text-slate-800">{item.title}</p>
                <p className="text-xs text-slate-600">{item.message}</p>
                {!item.is_read ? (
                  <button
                    type="button"
                    onClick={() => onRead(item)}
                    className="mt-1 rounded-md border border-slate-200 px-2 py-1 text-[11px] text-slate-700 hover:bg-slate-50"
                  >
                    Mark read
                  </button>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
