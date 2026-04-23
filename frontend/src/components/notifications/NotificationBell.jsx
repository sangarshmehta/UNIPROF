import { useState, useEffect } from "react";
import { apiRequest } from "../../services/apiClient";

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  async function loadNotifications() {
    try {
      const data = await apiRequest("/api/notifications");
      setNotifications(Array.isArray(data) ? data : []);
      setUnreadCount(data.filter(n => !n.is_read).length);
    } catch (err) {
      console.error("Failed to load notifications");
    }
  }

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, []);

  async function markAsRead(id) {
    try {
      await apiRequest(`/api/notifications/${id}/read`, { method: "PUT" });
      loadNotifications();
    } catch (err) {
      console.error("Failed to mark as read");
    }
  }

  return (
    <div className="relative">
      <button 
        onClick={() => setOpen(!open)}
        className="w-10 h-10 rounded-xl bg-[var(--bg-light)] border border-[var(--border-color)] flex items-center justify-center text-xl hover:bg-blue-50 hover:border-blue-200 transition-all relative"
      >
        🔔
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white shadow-sm">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)}></div>
          <div className="absolute right-0 mt-3 w-80 glass-card p-4 z-50 shadow-2xl slide-up max-h-[400px] overflow-y-auto">
            <div className="flex justify-between items-center mb-4 px-2">
               <h4 className="text-sm font-black uppercase tracking-widest opacity-60">Notifications</h4>
               {unreadCount > 0 && <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">{unreadCount} New</span>}
            </div>

            <div className="space-y-2">
              {notifications.length === 0 ? (
                <div className="py-8 text-center text-[var(--text-muted)] text-sm font-medium italic">
                  All caught up!
                </div>
              ) : (
                notifications.map(n => (
                  <div 
                    key={n.id} 
                    onClick={() => markAsRead(n.id)}
                    className={`p-3 rounded-xl cursor-pointer transition-all border ${n.is_read ? 'bg-transparent border-transparent opacity-60' : 'bg-blue-50/50 border-blue-100 hover:bg-blue-50 shadow-sm'}`}
                  >
                    <div className="font-bold text-xs mb-1">{n.title}</div>
                    <div className="text-[11px] text-[var(--text-muted)] leading-tight">{n.message}</div>
                    <div className="text-[9px] mt-2 opacity-40 font-bold uppercase">{new Date(n.created_at).toLocaleTimeString()}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
