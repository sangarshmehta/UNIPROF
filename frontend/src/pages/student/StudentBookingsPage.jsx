import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppShell from "../../components/layout/AppShell.jsx";
import EmptyState from "../../components/ui/EmptyState.jsx";
import Alert from "../../components/ui/Alert.jsx";
import { getMyBookings } from "../../services/bookingService";

export default function StudentBookingsPage() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError("");
        const data = await getMyBookings();
        setBookings(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.message || "Failed to load bookings");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <AppShell title="My Bookings">
      <div className="max-w-5xl mx-auto space-y-8 fade-in">
        <Alert message={error} />

        {loading ? (
          <EmptyState text="Fetching your sessions..." loading />
        ) : bookings.length === 0 ? (
          <EmptyState 
            text="You have no bookings yet." 
            actionText="Book a Session" 
            onAction={() => navigate("/student")} 
          />
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <div key={booking.id} className="glass-card p-8 flex flex-col md:flex-row justify-between items-center gap-6 group hover:border-blue-500/30">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 rounded-3xl bg-blue-50 flex items-center justify-center text-3xl">
                     {booking.teacher?.name?.charAt(0) || '👨‍🏫'}
                  </div>
                  <div>
                    <h4 className="font-bold text-xl">{booking.teacher?.name}</h4>
                    <p className="text-[var(--text-muted)] font-medium">📅 {booking.time_slot}</p>
                    <div className="flex gap-2 mt-2">
                       <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${
                         booking.status === 'completed' ? 'bg-green-100 text-green-700' :
                         booking.status === 'accepted' ? 'bg-blue-100 text-blue-700' :
                         booking.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-700'
                       }`}>
                         {booking.status}
                       </span>
                    </div>
                  </div>
                </div>
                
                {booking.status === 'completed' && (
                   <button 
                    onClick={() => navigate(`/teachers/${booking.teacher_id}`)}
                    className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all"
                   >
                     Rate Session
                   </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
