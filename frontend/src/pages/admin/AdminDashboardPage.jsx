import { useEffect, useMemo, useState } from "react";
import AppShell from "../../components/layout/AppShell.jsx";
import Alert from "../../components/ui/Alert.jsx";
import EmptyState from "../../components/ui/EmptyState.jsx";
import {
  deleteUser,
  getAdminBookings,
  getAdminUsers,
  setTeacherApproval,
} from "../../services/adminService";

export default function AdminDashboardPage() {
  const [users, setUsers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function loadData() {
    const [usersData, bookingsData] = await Promise.all([getAdminUsers(), getAdminBookings()]);
    setUsers(Array.isArray(usersData) ? usersData : []);
    setBookings(Array.isArray(bookingsData) ? bookingsData : []);
  }

  useEffect(() => {
    async function bootstrap() {
      try {
        setLoading(true);
        await loadData();
      } catch (requestError) {
        setError(requestError.message || "Failed to load admin dashboard");
      } finally {
        setLoading(false);
      }
    }
    bootstrap();
  }, []);

  const teacherUsers = useMemo(() => users.filter((user) => user.role === "teacher"), [users]);

  async function handleApproval(user, approved) {
    setError("");
    setSuccess("");
    if (!user.teacher_id) return;
    try {
      setBusyId(`approve-${user.id}`);
      await setTeacherApproval(user.teacher_id, approved);
      setSuccess(`Teacher ${approved ? "approved" : "rejected"} successfully.`);
      await loadData();
    } catch (requestError) {
      setError(requestError.message || "Failed to update teacher approval");
    } finally {
      setBusyId(null);
    }
  }

  async function handleDeleteUser(userId) {
    setError("");
    setSuccess("");
    try {
      setBusyId(`delete-${userId}`);
      await deleteUser(userId);
      setSuccess("User deleted successfully.");
      await loadData();
    } catch (requestError) {
      setError(requestError.message || "Failed to delete user");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <AppShell title="Admin Dashboard" subtitle="Manage users, teacher approvals, and all bookings.">
      <Alert message={error} />
      <Alert type="success" message={success} />

      {loading ? <EmptyState text="Loading admin data..." loading /> : null}

      <section className="glass-card rounded-2xl border border-white/70 p-5 shadow-sm mb-6">
        <h2 className="text-lg font-semibold mb-3">Teacher Approvals</h2>
        {!teacherUsers.length ? (
          <EmptyState text="No teacher users found." />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500">
                  <th className="py-2 pr-4">Name</th>
                  <th className="py-2 pr-4">Email</th>
                  <th className="py-2 pr-4">Teacher ID</th>
                  <th className="py-2 pr-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {teacherUsers.map((user) => (
                  <tr key={user.id} className="border-t border-slate-200/70">
                    <td className="py-2 pr-4">{user.name || "-"}</td>
                    <td className="py-2 pr-4">{user.email}</td>
                    <td className="py-2 pr-4">{user.teacher_id || "-"}</td>
                    <td className="py-2 pr-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          disabled={busyId === `approve-${user.id}`}
                          onClick={() => handleApproval(user, true)}
                          className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white disabled:opacity-60"
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          disabled={busyId === `approve-${user.id}`}
                          onClick={() => handleApproval(user, false)}
                          className="rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-medium text-white disabled:opacity-60"
                        >
                          Reject
                        </button>
                        <button
                          type="button"
                          disabled={busyId === `delete-${user.id}`}
                          onClick={() => handleDeleteUser(user.id)}
                          className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white disabled:opacity-60"
                        >
                          Delete User
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="glass-card rounded-2xl border border-white/70 p-5 shadow-sm">
        <h2 className="text-lg font-semibold mb-3">All Bookings</h2>
        {!bookings.length ? (
          <EmptyState text="No bookings available." />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500">
                  <th className="py-2 pr-4">Booking ID</th>
                  <th className="py-2 pr-4">Student</th>
                  <th className="py-2 pr-4">Teacher ID</th>
                  <th className="py-2 pr-4">Time Slot</th>
                  <th className="py-2 pr-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking) => (
                  <tr key={booking.id} className="border-t border-slate-200/70">
                    <td className="py-2 pr-4">{booking.id}</td>
                    <td className="py-2 pr-4">{booking.student_name}</td>
                    <td className="py-2 pr-4">{booking.teacher_id}</td>
                    <td className="py-2 pr-4">{booking.time_slot}</td>
                    <td className="py-2 pr-4 capitalize">{booking.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </AppShell>
  );
}
