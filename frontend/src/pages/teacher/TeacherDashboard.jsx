import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import BookingList from "../../components/bookings/BookingList.jsx";
import AppShell from "../../components/layout/AppShell.jsx";
import Alert from "../../components/ui/Alert.jsx";
import EmptyState from "../../components/ui/EmptyState.jsx";
import StatCard from "../../components/ui/StatCard.jsx";
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
      <div className="mb-4">
        <Link
          to="/teacher/profile/edit"
          className="inline-flex items-center rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
        >
          Edit Profile
        </Link>
      </div>
      <Alert message={error} />
      <Alert type="success" message={success} />
      {loading ? <EmptyState text="Loading dashboard..." loading /> : null}

      <section className="grid grid-cols-1 gap-4 md:grid-cols-3 mb-6">
        <StatCard label="Total Bookings" value={totalBookings} />
        <StatCard label="Accepted" value={acceptedBookings} />
        <StatCard label="Pending" value={pendingBookings} />
      </section>

      {!bookings.length && !loading ? (
        <EmptyState text="No bookings yet." />
      ) : (
        <BookingList bookings={bookings} onAccept={handleAcceptBooking} acceptingId={acceptingId} />
      )}
    </AppShell>
  );
}
