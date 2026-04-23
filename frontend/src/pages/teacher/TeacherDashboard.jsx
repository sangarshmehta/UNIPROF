import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Alert from "../../components/ui/Alert.jsx";
import EmptyState from "../../components/ui/EmptyState.jsx";
import { acceptBooking, rejectBooking, getTeacherBookings } from "../../services/teacherService";

export default function TeacherDashboard() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function loadData() {
    const data = await getTeacherBookings();
    setBookings(Array.isArray(data) ? data : []);
  }

  useEffect(() => {
    async function init() {
      try {
        setLoading(true);
        await loadData();
      } catch (err) {
        setError("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  const stats = {
    total: bookings.length,
    completed: bookings.filter(b => b.status === 'completed').length,
    pending: bookings.filter(b => b.status === 'pending').length,
    avgRating: 4.8 // Mock or fetch from teacher profile
  };

  async function handleAction(id, action) {
    try {
      setProcessingId(id);
      if (action === 'accept') await acceptBooking(id);
      else await rejectBooking(id);
      setSuccess(`Booking ${action}ed successfully`);
      await loadData();
    } catch (err) {
      setError(`Failed to ${action} booking`);
    } finally {
      setProcessingId(null);
    }
  }

  return (
      <div className="space-y-10 fade-in">
        
        {/* --- Stats Panel --- */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { label: "Total Bookings", value: stats.total, color: "blue", icon: "📅" },
            { label: "Completed", value: stats.completed, color: "green", icon: "✅" },
            { label: "Pending Requests", value: stats.pending, color: "amber", icon: "⏳" },
            { label: "Avg Rating", value: stats.avgRating, color: "yellow", icon: "⭐" },
          ].map((stat) => (
            <div key={stat.label} className="glass-card p-6 flex items-center gap-5 border-none shadow-xl">
              <div className={`w-12 h-12 rounded-2xl bg-${stat.color}-500/10 flex items-center justify-center text-2xl`}>
                {stat.icon}
              </div>
              <div>
                <div className="text-3xl font-black">{stat.value}</div>
                <div className="text-[10px] font-bold uppercase tracking-widest opacity-60">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          
          {/* Left: Booking Requests */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-black">Booking Requests</h2>
              <span className="bg-blue-600 text-white text-[10px] font-bold px-3 py-1 rounded-full">
                {stats.pending} New
              </span>
            </div>

            <Alert message={error} />
            <Alert type="success" message={success} />

            {loading ? (
              <EmptyState text="Fetching requests..." loading />
            ) : bookings.length === 0 ? (
              <EmptyState text="No booking requests yet." />
            ) : (
              <div className="space-y-4">
                {bookings.map((booking) => (
                  <div key={booking.id} className="glass-card p-6 flex flex-col md:flex-row justify-between items-center gap-6 group hover:border-blue-500/30">
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 rounded-2xl bg-[var(--bg-light)] border border-[var(--border-color)] flex items-center justify-center text-blue-600 font-black text-xl">
                        {booking.student_name?.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-bold text-lg">{booking.student_name}</h4>
                        <p className="text-sm text-[var(--text-muted)] font-medium">
                          📅 {booking.time_slot}
                        </p>
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full mt-1 inline-block ${
                          booking.status === 'pending' ? 'bg-amber-500/10 text-amber-700 border border-amber-500/20' :
                          booking.status === 'accepted' ? 'bg-green-500/10 text-green-700 border border-green-500/20' : 'bg-slate-500/10 text-slate-600 border border-slate-500/20'
                        }`}>
                          {booking.status}
                        </span>
                      </div>
                    </div>

                    {booking.status === 'pending' && (
                      <div className="flex gap-3">
                        <button 
                          onClick={() => handleAction(booking.id, 'reject')}
                          disabled={processingId === booking.id}
                          className="px-6 py-2.5 rounded-xl border-2 border-red-500/20 text-red-500 font-bold text-xs hover:bg-[var(--bg-light)] transition-all"
                        >
                          Reject
                        </button>
                        <button 
                          onClick={() => handleAction(booking.id, 'accept')}
                          disabled={processingId === booking.id}
                          className="px-6 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20"
                        >
                          Accept Request
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right: Quick Actions */}
          <div className="space-y-6">
            <h2 className="text-2xl font-black">Quick Controls</h2>
            <div className="glass-card p-8 space-y-4">
               <Link to="/teacher/schedule" className="w-full btn-primary py-4 rounded-2xl">
                 ⚙️ Manage Schedule
               </Link>
               <Link to="/teacher/profile/edit" className="w-full block text-center py-4 rounded-2xl border-2 border-[var(--border-color)] font-bold text-sm hover:bg-[var(--bg-light)] transition-all">
                 👤 Edit Profile
               </Link>
            </div>
            
            <div className="glass-card p-8 bg-indigo-600 text-white border-none shadow-xl shadow-indigo-500/20">
               <h3 className="font-bold text-lg mb-2">Mentor Tip</h3>
               <p className="text-sm opacity-80 leading-relaxed font-medium">
                 Keep your weekly schedule updated to help students find the best time to connect with you.
               </p>
            </div>
          </div>
        </div>
      </div>
  );
}
