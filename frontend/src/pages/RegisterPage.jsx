import { useState } from "react";
import { Link } from "react-router-dom";
import Alert from "../components/ui/Alert.jsx";
import { useAuth } from "../context/AuthContext.jsx";

export default function RegisterPage() {
  const { register } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSuccess("");
    try {
      setLoading(true);
      const result = await register(form.email.trim(), form.password);
      setSuccess(result?.message || "Registered successfully. Please verify your email.");
      setForm({ email: "", password: "" });
    } catch (requestError) {
      setError(requestError.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 p-7 shadow-sm">
        <h1 className="text-2xl font-semibold">Create account</h1>
        <p className="text-sm text-slate-500 mt-1">Student: @cuchd.in | Teacher: @cumail.in</p>
        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="University email"
            className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm"
            value={form.email}
            onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
            required
          />
          <input
            type="password"
            minLength={6}
            placeholder="Minimum 6 characters"
            className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm"
            value={form.password}
            onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
            required
          />
          <Alert message={error} />
          <Alert type="success" message={success} />
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-slate-900 py-2.5 text-sm font-medium text-white disabled:opacity-60"
          >
            {loading ? "Creating..." : "Create account"}
          </button>
          <p className="text-sm text-slate-600 text-center">
            Already registered?{" "}
            <Link className="text-slate-900 font-medium underline" to="/login">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
