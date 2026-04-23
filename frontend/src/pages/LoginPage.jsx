import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Alert from "../components/ui/Alert.jsx";
import { useAuth } from "../context/AuthContext.jsx";

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    const email = form.email.trim().toLowerCase();
    if (!email || !form.password) {
      setError("Email and password are required.");
      return;
    }

    try {
      setLoading(true);
      // login() in AuthContext calls authService.login() → apiClient → VITE_API_URL
      // It also calls saveSession() which stores uniprof_token and uniprof_role.
      const result = await login(email, form.password);

      const role = result?.role || "";
      if (!role) throw new Error("Login succeeded but role is missing from response.");

      // Navigate to role-specific dashboard, or wherever the user was trying to go.
      const defaultPath = role === "teacher" ? "/teacher" : role === "admin" ? "/admin" : "/student";
      const next = location.state?.from?.pathname || defaultPath;
      navigate(next, { replace: true });
    } catch (requestError) {
      setError(requestError.message || "Authentication failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8 bg-[var(--bg-light)] app-page text-[var(--text-main)]">
      <div className="mb-8 text-center slide-up">
        <h1 className="text-4xl font-bold tracking-tight text-blue-600 dark:text-blue-400">UNIPROF</h1>
        <p className="mt-2 text-sm text-[var(--text-muted)] font-medium">University Mentorship Platform</p>
      </div>

      <div className="w-full max-w-md glass-card p-8 slide-up" style={{ animationDelay: "100ms" }}>
        <h2 className="text-xl font-semibold mb-6 text-center">Welcome back</h2>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium mb-1.5 text-[var(--text-muted)]">Email address</label>
            <input
              id="login-email"
              type="email"
              autoComplete="email"
              placeholder="Enter your email"
              className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-light)] px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900"
              value={form.email}
              onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5 text-[var(--text-muted)]">Password</label>
            <input
              id="login-password"
              type="password"
              autoComplete="current-password"
              placeholder="Enter your password"
              className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-light)] px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900"
              value={form.password}
              onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
              required
            />
          </div>

          {error && <Alert message={error} />}

          <button
            id="login-submit"
            type="submit"
            disabled={loading}
            className="w-full btn-primary py-3 text-sm flex justify-center items-center gap-2 mt-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Signing in...
              </>
            ) : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
