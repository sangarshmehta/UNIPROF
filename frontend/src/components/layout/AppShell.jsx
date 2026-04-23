import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import NotificationBell from "../notifications/NotificationBell.jsx";

export default function AppShell({ title, subtitle, children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { role, logout } = useAuth();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem("theme") === "dark";
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDarkMode]);

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  function handleSearch(e) {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/student?search=${encodeURIComponent(searchQuery)}`);
    }
  }

  return (
    <div className="min-h-screen text-[var(--text-main)] transition-colors duration-200">
      <nav className="glass-card sticky top-0 z-50 border-b border-[var(--border-color)] px-4 py-3 sm:px-6 flex items-center justify-between rounded-none shadow-sm">
        {/* LEFT: Logo */}
        <div className="flex items-center">
          <Link to={role === "teacher" ? "/teacher" : role === "admin" ? "/admin" : "/student"} className="text-2xl font-bold text-blue-600 dark:text-blue-400 tracking-tight">
            UNIPROF
          </Link>
        </div>

        {/* CENTER: Search Bar (Student only or all) */}
        {role === "student" && (
          <form onSubmit={handleSearch} className="hidden md:block flex-1 max-w-md mx-6">
            <div className="relative">
              <input
                type="text"
                placeholder="Search teacher, subject..."
                className="w-full bg-[var(--bg-light)] border border-[var(--border-color)] text-[var(--text-main)] rounded-full px-4 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button type="submit" className="absolute right-3 top-2 text-slate-400 hover:text-blue-500">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
              </button>
            </div>
          </form>
        )}

        {/* RIGHT: Navigation & Profile */}
        <div className="flex items-center gap-3 md:gap-5">
          {role === "student" && (
            <>
              <Link className="hidden md:block text-sm font-medium hover:text-blue-600 transition" to="/student">Teachers</Link>
            </>
          )}
          {role === "teacher" && (
            <Link className="hidden md:block text-sm font-medium hover:text-blue-600 transition" to="/teacher">Dashboard</Link>
          )}
          {role === "admin" && (
            <Link className="hidden md:block text-sm font-medium hover:text-blue-600 transition" to="/admin">Admin</Link>
          )}

          <NotificationBell />

          {/* Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 font-semibold border-2 border-transparent hover:border-blue-400 transition"
            >
              {role.charAt(0).toUpperCase()}
            </button>

            {dropdownOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)}></div>
                <div className="absolute right-0 mt-2 w-48 bg-[var(--card-light)] border border-[var(--border-color)] rounded-xl shadow-lg z-50 py-2 slide-up">
                  {role === "student" && (
                    <Link to="/student/profile" className="block px-4 py-2 text-sm hover:bg-[var(--bg-light)]" onClick={() => setDropdownOpen(false)}>My Profile</Link>
                  )}
                  {role === "teacher" && (
                    <Link to="/teacher/profile/edit" className="block px-4 py-2 text-sm hover:bg-[var(--bg-light)]" onClick={() => setDropdownOpen(false)}>My Profile</Link>
                  )}

                  <button
                    onClick={() => { setIsDarkMode(!isDarkMode); setDropdownOpen(false); }}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-[var(--bg-light)] flex justify-between items-center"
                  >
                    Dark Mode
                    <span className="text-xs bg-[var(--bg-light)] px-2 py-1 rounded-md">{isDarkMode ? "ON" : "OFF"}</span>
                  </button>

                  <div className="h-px bg-[var(--border-color)] my-1"></div>

                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-[var(--danger)] hover:bg-red-50 dark:hover:bg-red-900/20 font-medium"
                  >
                    Logout
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 py-8 sm:px-6">
        {title && (
          <div className="mb-8 slide-up">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{title}</h1>
            {subtitle && <p className="text-sm text-[var(--text-muted)] mt-1">{subtitle}</p>}
          </div>
        )}
        <div className="app-page">
          {children}
        </div>
      </main>
    </div>
  );
}
