import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import BookingList from "../../components/bookings/BookingList.jsx";
import AppShell from "../../components/layout/AppShell.jsx";
import Alert from "../../components/ui/Alert.jsx";
import EmptyState from "../../components/ui/EmptyState.jsx";
import { acceptBooking, getTeacherBookings } from "../../services/teacherService";

export default function TeacherDashboard() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [acceptingId, setAcceptingId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function loadData() {
    const bookingData = await getTeacherBookings();
    setBookings(Array.isArray(bookingData) ? bookingData : []);
  }

  const totalBookings = bookings.length;
  const acceptedBookings = bookings.filter((booking) => booking.status === "accepted").length;
  const pendingBookings = bookings.filter((booking) => booking.status === "pending").length;

  useEffect(() => {
    async function bootstrap() {
      try {
        setLoading(true);
        await loadData();
      } catch (requestError) {
        setError(requestError.message || "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    }
    bootstrap();
  }, []);

  async function handleAcceptBooking(bookingId) {
    setError("");
    setSuccess("");
    try {
      setAcceptingId(bookingId);
      await acceptBooking(bookingId);
      setSuccess("Booking accepted.");
      await loadData();
    } catch (requestError) {
      setError(requestError.message || "Failed to accept booking");
    } finally {
      setAcceptingId(null);
    }
  }

  return (
    <AppShell title="Teacher Dashboard" subtitle="Track and manage student booking requests.">
      <div className="mb-6 flex justify-end slide-up">
        <Link
          to="/teacher/profile/edit"
          className="btn-primary inline-flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
          Edit Profile
        </Link>
      </div>

      <Alert message={error} />
      <Alert type="success" message={success} />
      
      {loading ? <EmptyState text="Loading dashboard..." loading /> : null}

      {!loading && (
        <>
          <section className="grid grid-cols-1 gap-4 md:grid-cols-3 mb-8 slide-up" style={{ animationDelay: "100ms" }}>
            <div className="glass-card p-6 bg-[var(--card-light)] border border-[var(--border-color)]">
              <p className="text-sm font-medium text-[var(--text-muted)] mb-1">Total Bookings</p>
              <h3 className="text-3xl font-bold text-[var(--text-main)]">{totalBookings}</h3>
            </div>
            <div className="glass-card p-6 bg-[var(--card-light)] border border-[var(--border-color)]">
              <p className="text-sm font-medium text-[var(--text-muted)] mb-1">Accepted</p>
              <h3 className="text-3xl font-bold text-[var(--success)]">{acceptedBookings}</h3>
            </div>
            <div className="glass-card p-6 bg-[var(--card-light)] border border-blue-200 dark:border-blue-800">
              <p className="text-sm font-medium text-[var(--text-muted)] mb-1">Pending Requests</p>
              <h3 className="text-3xl font-bold text-blue-600 dark:text-blue-400">{pendingBookings}</h3>
            </div>
          </section>

          <section className="slide-up" style={{ animationDelay: "200ms" }}>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-[var(--text-main)]">Booking Requests</h2>
            </div>
            
            <div className="glass-card bg-[var(--card-light)] border border-[var(--border-color)] overflow-hidden">
              {!bookings.length ? (
                <div className="p-8">
                  <EmptyState text="No bookings yet." />
                </div>
              ) : (
                <div className="p-2 sm:p-4">
                  <BookingList bookings={bookings} onAccept={handleAcceptBooking} acceptingId={acceptingId} />
                </div>
              )}
            </div>
          </section>
        </>
      )}
    </AppShell>
  );
}
