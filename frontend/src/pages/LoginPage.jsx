import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Alert from "../components/ui/Alert.jsx";
import { useAuth } from "../context/AuthContext.jsx";

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [form, setForm] = useState({ email: "", password: "" });
  const [fieldErrors, setFieldErrors] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setFieldErrors({ email: "", password: "" });

    const email = form.email.trim().toLowerCase();
    const nextFieldErrors = {
      email: email ? "" : "Email is required.",
      password: form.password ? "" : "Password is required.",
    };
    if (!nextFieldErrors.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      nextFieldErrors.email = "Enter a valid email address.";
    }
    if (nextFieldErrors.email || nextFieldErrors.password) {
      setFieldErrors(nextFieldErrors);
      return;
    }

    try {
      setLoading(true);
      const result = await login(email, form.password);
      const role = result?.role || "";
      if (!role) throw new Error("Login succeeded but role is missing.");

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
    <div className="min-h-screen flex items-center justify-center animated-bg px-4 py-8 overflow-hidden">
      <div className={`w-full max-w-md transition-all duration-1000 transform ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}`}>
        <div className="text-center mb-8 text-white drop-shadow-lg">
          <h1 className="text-6xl font-black tracking-tighter mb-2">UniProf</h1>
          <p className="text-lg font-medium opacity-90">University Mentorship Redefined</p>
        </div>

        <div className="glass-card p-8 md:p-10 bg-white/95 dark:bg-slate-900/85 border-slate-200 dark:border-slate-700">
          <h2 className="text-2xl font-bold mb-8 text-center text-slate-900 dark:text-slate-100">Welcome back</h2>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">Email address</label>
              <input
                id="login-email"
                type="email"
                autoComplete="email"
                placeholder="you@cuchd.in"
                className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-2xl px-5 py-4 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:ring-2 focus:ring-blue-400 transition-all"
                value={form.email}
                onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                required
              />
              {fieldErrors.email ? <p className="input-error-text">{fieldErrors.email}</p> : null}
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">Password</label>
              <input
                id="login-password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-2xl px-5 py-4 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:ring-2 focus:ring-blue-400 transition-all"
                value={form.password}
                onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
                required
              />
              {fieldErrors.password ? <p className="input-error-text">{fieldErrors.password}</p> : null}
            </div>

            {error && <Alert message={error} />}

            <button
              id="login-submit"
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-2xl bg-blue-600 text-white font-bold text-lg hover:bg-blue-700 active:scale-95 transition-all shadow-xl disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : "Sign In"}
            </button>

            <p className="text-sm text-center text-slate-600 dark:text-slate-300">
              New user?{" "}
              <Link to="/register" className="font-semibold text-blue-600 dark:text-blue-400 hover:underline">
                Register
              </Link>
            </p>
          </form>
        </div>
        
        <p className="mt-8 text-center text-white/60 text-sm font-medium">
          © {new Date().getFullYear()} UniProf SaaS. All rights reserved.
        </p>
      </div>
    </div>
  );
}
