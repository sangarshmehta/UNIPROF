import { useState, useEffect } from "react";
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
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

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
    <div className="min-h-screen flex items-center justify-center animated-bg px-4 overflow-hidden">
      <div className={`w-full max-w-md transition-all duration-1000 transform ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}`}>
        <div className="text-center mb-10 text-white drop-shadow-lg">
          <h1 className="text-6xl font-black tracking-tighter mb-2">UniProf</h1>
          <p className="text-lg font-medium opacity-90">University Mentorship Redefined</p>
        </div>

        <div className="glass-card p-10 bg-white/10 border-white/20">
          <h2 className="text-2xl font-bold mb-8 text-center text-white">Welcome back</h2>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-white/80 ml-1">Email address</label>
              <input
                id="login-email"
                type="email"
                autoComplete="email"
                placeholder="mentor@uniprof.edu"
                className="w-full bg-white/10 border border-white/20 rounded-2xl px-5 py-4 text-white placeholder-white/40 outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white/20 transition-all"
                value={form.email}
                onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                required
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-semibold text-white/80 ml-1">Password</label>
              <input
                id="login-password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                className="w-full bg-white/10 border border-white/20 rounded-2xl px-5 py-4 text-white placeholder-white/40 outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white/20 transition-all"
                value={form.password}
                onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
                required
              />
            </div>

            {error && <Alert message={error} className="bg-red-500/20 text-red-100 border-red-500/30" />}

            <button
              id="login-submit"
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-2xl bg-white text-blue-600 font-bold text-lg hover:bg-blue-50 active:scale-95 transition-all shadow-xl disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-6 h-6 border-4 border-blue-600/30 border-t-blue-600 rounded-full animate-spin"></div>
              ) : "Sign In"}
            </button>
          </form>
        </div>
        
        <p className="mt-8 text-center text-white/60 text-sm font-medium">
          © {new Date().getFullYear()} UniProf SaaS. All rights reserved.
        </p>
      </div>
    </div>
  );
}
