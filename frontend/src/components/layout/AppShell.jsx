import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import NotificationBell from "../notifications/NotificationBell.jsx";

export default function AppShell({ title, subtitle, children }) {
  const navigate = useNavigate();
  const { role, logout } = useAuth();

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  return (
    <div className="min-h-screen text-slate-900">
      <div className="max-w-6xl mx-auto px-4 py-8 sm:px-6">
        <header className="glass-card rounded-2xl border border-white/60 shadow-sm px-4 py-4 sm:px-6 sm:py-5 flex flex-wrap items-center justify-between gap-3 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">{title}</h1>
            {subtitle ? <p className="text-sm text-slate-500 mt-1">{subtitle}</p> : null}
          </div>
          <div className="flex items-center gap-2">
            {role === "student" ? (
              <>
                <Link className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm hover:bg-slate-50 transition" to="/student">
                  Dashboard
                </Link>
                <Link
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm hover:bg-slate-50 transition"
                  to="/student/profile"
                >
                  My Profile
                </Link>
              </>
            ) : role === "teacher" ? (
              <Link className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm hover:bg-slate-50 transition" to="/teacher">
                Dashboard
              </Link>
            ) : (
              <Link className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm hover:bg-slate-50 transition" to="/admin">
                Admin
              </Link>
            )}
            <NotificationBell />
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 transition"
            >
              Logout
            </button>
          </div>
        </header>
        {children}
      </div>
    </div>
  );
}
