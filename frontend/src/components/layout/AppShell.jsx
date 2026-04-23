import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import NotificationBell from "../notifications/NotificationBell.jsx";

export default function AppShell({ title, children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { role, logout, user, isAuthenticated } = useAuth();
  const homePath = isAuthenticated
    ? role === "teacher"
      ? "/teacher"
      : role === "admin"
        ? "/admin"
        : "/student"
    : "/login";


  const [drawerOpen, setDrawerOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem("theme") === "dark";
  });

  useEffect(() => {
    const theme = isDarkMode ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [isDarkMode]);

  const navLinks = [
    { label: "Dashboard", path: role === "teacher" ? "/teacher" : role === "admin" ? "/admin" : "/student", icon: "📊" },
    { label: "Search Teachers", path: "/student", icon: "🔍", roles: ["student"] },
    { label: "Bookings", path: role === "teacher" ? "/teacher/bookings" : "/student/bookings", icon: "📅" },
    { label: "Wishlist", path: "/student/wishlist", icon: "❤️", roles: ["student"] },
    { label: "Settings", path: role === "teacher" ? "/teacher/profile/edit" : "/student/profile", icon: "⚙️" },
  ].filter(link => !link.roles || link.roles.includes(role));

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  return (
    <div className="app-container">
      {/* --- Sticky Navbar --- */}
      <nav className="navbar-sticky px-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Hamburger (visible on mobile, toggle drawer) */}
          <button 
            onClick={() => setDrawerOpen(!drawerOpen)}
            className="p-2 hover:bg-[var(--border-color)] rounded-lg transition-colors"
          >
            <span className="text-xl">☰</span>
          </button>
          <Link to={homePath} className="text-2xl font-bold text-blue-600 tracking-tight">
            UniProf
          </Link>
        </div>

        {/* Center Title */}
        <div className="hidden sm:block text-lg font-semibold text-[var(--text-main)]">
          {title || "Dashboard"}
        </div>

        <div className="flex items-center gap-4">
          <NotificationBell />
          
          {/* Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="w-10 h-10 rounded-full bg-[var(--bg-light)] border border-[var(--border-color)] flex items-center justify-center text-[var(--text-main)] font-bold hover:ring-2 hover:ring-blue-400 transition-all overflow-hidden"
            >
              {user?.profile_image ? (
                <img src={user.profile_image} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                role.charAt(0).toUpperCase()
              )}
            </button>

            {dropdownOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)}></div>
                <div className="absolute right-0 mt-3 w-48 glass-card p-2 z-50 slide-up">
                  <div className="px-3 py-2 text-xs font-semibold text-[var(--text-muted)] uppercase">Theme</div>
                  <button
                    onClick={() => { setIsDarkMode(!isDarkMode); setDropdownOpen(false); }}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-[var(--bg-light)] rounded-lg flex items-center justify-between"
                  >
                    {isDarkMode ? "🌙 Dark Mode" : "☀️ Light Mode"}
                  </button>
                  <div className="h-px bg-[var(--border-color)] my-2"></div>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-3 py-2 text-sm text-red-500 hover:bg-[var(--bg-light)] font-medium rounded-lg"
                  >
                    Logout
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </nav>

      <div className="flex flex-1">
        {/* --- Drawer Sidebar --- */}
        <aside 
          className={`fixed md:sticky top-[var(--nav-height)] left-0 z-40 h-[calc(100vh-var(--nav-height))] w-64 glass-card sidebar-surface rounded-none border-r border-t-0 transition-transform duration-300 ease-in-out ${drawerOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
        >
          <div className="flex flex-col h-full p-4 gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setDrawerOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  location.pathname === link.path 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' 
                  : 'hover:bg-[var(--bg-light)] text-[var(--text-main)] border border-transparent hover:border-[var(--border-color)]'
                }`}
              >
                <span className="text-lg">{link.icon}</span>
                <span className="font-medium">{link.label}</span>
              </Link>
            ))}
            
            <div className="mt-auto">
               <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-[var(--bg-light)] border border-transparent hover:border-[var(--border-color)] transition-all font-medium"
                >
                  <span className="text-lg">🚪</span>
                  <span>Logout</span>
                </button>
            </div>
          </div>
        </aside>

        {/* Overlay for mobile drawer */}
        {drawerOpen && (
          <div 
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 md:hidden"
            onClick={() => setDrawerOpen(false)}
          ></div>
        )}

        {/* --- Main Content --- */}
        <main className="main-content fade-in">
          {children}
        </main>
      </div>
    </div>
  );
}
