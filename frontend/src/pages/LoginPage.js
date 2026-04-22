import { useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { setAuthSession } from "../utils/auth";

function getEmailRole(email) {
  const value = String(email || "").trim().toLowerCase();
  const teacherRegex = /^[a-zA-Z0-9._%+-]+@cumail\.in$/;
  const studentRegex = /^[a-zA-Z0-9._%+-]+@cuchd\.in$/;
  if (teacherRegex.test(value)) return "teacher";
  if (studentRegex.test(value)) return "student";
  return "";
}

export default function LoginPage() {
  const navigate = useNavigate();
  const apiBaseUrl = useMemo(() => process.env.REACT_APP_API_BASE_URL || "http://localhost:5000", []);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successRole, setSuccessRole] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccessRole("");

    if (!email.trim() || !password) {
      setError("Please enter email and password.");
      return;
    }

    const matchedRole = getEmailRole(email);
    if (!matchedRole) {
      setError("Use university email only");
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post(`${apiBaseUrl}/api/login`, {
        email: email.trim(),
        password,
      });
      const role = res.data?.role || matchedRole;
      setAuthSession({ token: res.data?.token, role });
      setSuccessRole(role);
      setTimeout(() => {
        navigate("/", { replace: true });
      }, 900);
    } catch (err) {
      setError(err?.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
        <h1 className="text-2xl font-semibold text-slate-900">Welcome back</h1>
        <p className="text-sm text-slate-500 mt-1">Sign in to continue.</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              placeholder="you@cuchd.in or you@cumail.in"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              placeholder="Enter your password"
            />
          </div>

          {error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 text-red-700 text-sm px-3 py-2">
              {error}
            </div>
          ) : null}

          {successRole ? (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-800 text-sm px-3 py-2">
              Logged in as: <span className="font-semibold capitalize">{successRole}</span>
            </div>
          ) : null}

          <button
            type="submit"
            disabled={loading || Boolean(successRole)}
            className="w-full rounded-xl bg-slate-900 text-white py-2.5 text-sm font-medium hover:bg-slate-800 disabled:opacity-60 disabled:cursor-not-allowed transition"
          >
            {loading ? "Signing in..." : successRole ? "Redirecting..." : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}

