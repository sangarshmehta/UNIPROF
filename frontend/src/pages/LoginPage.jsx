import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Alert from "../components/ui/Alert.jsx";
import { useAuth } from "../context/AuthContext.jsx";

function getRoleFromEmail(email) {
  const normalizedEmail = String(email || "").trim().toLowerCase();
  if (normalizedEmail.endsWith("@cuchd.in")) return "student";
  if (normalizedEmail.endsWith("@cumail.in")) return "teacher";
  return "";
}

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register } = useAuth();
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({
    name: "",
    gender: "Male",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);

  function routeByRole(role) {
    return role === "teacher" ? "/teacher" : role === "admin" ? "/admin" : "/student";
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setFieldErrors({});
    const email = form.email.trim().toLowerCase();
    const roleByEmail = getRoleFromEmail(email);
    const nextErrors = {};
    if (!email) nextErrors.email = "Email is required.";
    if (!form.password) nextErrors.password = "Password is required.";
    if (mode === "register" && !form.name.trim()) {
      nextErrors.name = "Full Name is required.";
    }
    if (Object.keys(nextErrors).length) {
      setFieldErrors(nextErrors);
      return;
    }
    if (!roleByEmail) {
      setFieldErrors({ email: "Use @cuchd.in for student or @cumail.in for teacher." });
      return;
    }

    try {
      setLoading(true);
      let role = roleByEmail;
      if (mode === "login") {
        const result = await login(email, form.password);
        role = result?.role || roleByEmail;
      } else {
        await register({
          name: form.name.trim(),
          gender: form.gender,
          email,
          password: form.password,
        });
      }

      const fallback = routeByRole(role);
      const next = location.state?.from?.pathname || fallback;
      navigate(next, { replace: true });
    } catch (requestError) {
      setError(requestError.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 sm:py-12">
      <div className="w-full max-w-md glass-card rounded-2xl border border-white/70 p-7 shadow-xl shadow-indigo-100/50">
        <h1 className="text-2xl font-semibold">University Teacher Booking</h1>
        <p className="text-sm text-slate-500 mt-1">Login or register with your university email.</p>

        <div className="mt-4 grid grid-cols-2 rounded-xl border border-slate-200 bg-slate-50 p-1">
          <button
            type="button"
            onClick={() => setMode("login")}
            className={`rounded-lg px-3 py-2 text-sm font-medium ${mode === "login" ? "bg-white shadow-sm" : "text-slate-600"}`}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => setMode("register")}
            className={`rounded-lg px-3 py-2 text-sm font-medium ${mode === "register" ? "bg-white shadow-sm" : "text-slate-600"}`}
          >
            Register
          </button>
        </div>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          {mode === "register" ? (
            <>
              <input
                type="text"
                placeholder="Full Name"
                className={`w-full rounded-xl border px-3 py-2.5 text-sm outline-none transition focus:ring-4 focus:ring-indigo-100 ${
                  fieldErrors.name ? "border-red-400" : "border-slate-300 focus:border-indigo-400"
                }`}
                value={form.name}
                onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                required
              />
              {fieldErrors.name ? <p className="input-error-text">{fieldErrors.name}</p> : null}
              <select
                className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
                value={form.gender}
                onChange={(event) => setForm((prev) => ({ ...prev, gender: event.target.value }))}
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </>
          ) : null}
          <input
            type="email"
            placeholder="you@cuchd.in or you@cumail.in"
            className={`w-full rounded-xl border px-3 py-2.5 text-sm outline-none transition focus:ring-4 focus:ring-indigo-100 ${
              fieldErrors.email ? "border-red-400" : "border-slate-300 focus:border-indigo-400"
            }`}
            value={form.email}
            onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
            required
          />
          {fieldErrors.email ? <p className="input-error-text">{fieldErrors.email}</p> : null}
          <input
            type="password"
            placeholder="Password"
            className={`w-full rounded-xl border px-3 py-2.5 text-sm outline-none transition focus:ring-4 focus:ring-indigo-100 ${
              fieldErrors.password ? "border-red-400" : "border-slate-300 focus:border-indigo-400"
            }`}
            value={form.password}
            onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
            required
          />
          {fieldErrors.password ? <p className="input-error-text">{fieldErrors.password}</p> : null}
          <Alert message={error} />
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-slate-900 py-2.5 text-sm font-medium text-white disabled:opacity-60 hover:bg-slate-800 transition"
          >
            {loading ? "Please wait..." : mode === "login" ? "Login" : "Register"}
          </button>
        </form>
      </div>
    </div>
  );
}

