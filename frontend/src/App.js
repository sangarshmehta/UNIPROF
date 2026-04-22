import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { BrowserRouter, Link, Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import TeacherProfile from "./pages/TeacherProfile";
import LoginPage from "./pages/LoginPage";
import { clearAuthSession, getAuthRole, isAuthenticated } from "./utils/auth";

function initials(name) {
  return String(name || "")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

function defaultAvatarDataUri(name) {
  const text = initials(name) || "T";
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#61dafb" stop-opacity="0.7"/>
      <stop offset="1" stop-color="#8b5cf6" stop-opacity="0.7"/>
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" rx="18" fill="url(#g)"/>
  <text x="50%" y="54%" text-anchor="middle" font-family="Arial, sans-serif" font-size="30" fill="#0b1020" font-weight="700">${text}</text>
</svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function TeacherAvatar({ teacher }) {
  const fallback = defaultAvatarDataUri(teacher?.name);
  const src = teacher?.profile_image ? teacher.profile_image : fallback;
  return (
    <img
      className="h-12 w-12 rounded-full object-cover border border-slate-200 bg-slate-100"
      src={src}
      alt={teacher?.name ? `${teacher.name} avatar` : "Teacher avatar"}
      loading="lazy"
      onError={(e) => {
        if (e.currentTarget.src !== fallback) e.currentTarget.src = fallback;
      }}
    />
  );
}

function RequireAuth({ children }) {
  const location = useLocation();
  if (!isAuthenticated()) return <Navigate to="/login" state={{ from: location }} replace />;
  return children;
}

function TeacherListPage() {
  const navigate = useNavigate();
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const apiBaseUrl = useMemo(() => {
    return process.env.REACT_APP_API_BASE_URL || "http://localhost:5000";
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadTeachers() {
      try {
        setLoading(true);
        setError("");
        const res = await axios.get(`${apiBaseUrl}/api/teachers`);
        if (cancelled) return;
        setTeachers(Array.isArray(res.data) ? res.data : []);
      } catch (e) {
        if (cancelled) return;
        setError("Failed to load teachers. Is the backend running on port 5000?");
      } finally {
        if (cancelled) return;
        setLoading(false);
      }
    }

    loadTeachers();
    return () => {
      cancelled = true;
    };
  }, [apiBaseUrl]);

  function onLogout() {
    clearAuthSession();
    navigate("/login", { replace: true });
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <div className="max-w-6xl mx-auto px-4 py-8 sm:px-6">
        <header className="flex items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">Teachers</h1>
            <p className="text-sm text-slate-500 mt-1">
              Browse faculty profiles {getAuthRole() ? `(${getAuthRole()})` : ""}
            </p>
          </div>
          <button
            type="button"
            onClick={onLogout}
            className="inline-flex items-center rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
          >
            Logout
          </button>
        </header>

        {loading ? (
          <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
            Loading...
          </div>
        ) : null}
        {error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mt-4">
          {teachers.map((t) => (
            <div
              key={t.id}
              className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition"
            >
              <div className="flex items-start gap-3">
                <TeacherAvatar teacher={t} />
                <div className="min-w-0 flex-1">
                  <h2 className="text-lg font-semibold text-slate-900 truncate">{t.name}</h2>
                  <div className="mt-2 flex flex-wrap gap-2 text-xs">
                    <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-slate-700">
                      {Array.isArray(t.subjects) && t.subjects.length ? t.subjects[0] : "No subject"}
                    </span>
                    <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-slate-700">
                      Room {t.room_number || "-"}
                    </span>
                    <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-slate-700">
                      {typeof t.rating === "number" ? t.rating.toFixed(1) : "-"} ({t.total_reviews ?? 0})
                    </span>
                  </div>
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <Link
                  className="inline-flex items-center rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 transition"
                  to={`/teachers/${t.id}`}
                >
                  View Profile
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={isAuthenticated() ? <Navigate to="/" replace /> : <LoginPage />} />
        <Route
          path="/"
          element={
            <RequireAuth>
              <TeacherListPage />
            </RequireAuth>
          }
        />
        <Route
          path="/teachers/:id"
          element={
            <RequireAuth>
              <TeacherProfile />
            </RequireAuth>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
