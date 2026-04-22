import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-slate-100 grid place-items-center px-4">
      <div className="max-w-md w-full rounded-2xl border border-slate-200 bg-white p-6 text-center">
        <h1 className="text-2xl font-semibold">Page not found</h1>
        <p className="text-sm text-slate-600 mt-2">The page you are looking for does not exist.</p>
        <Link to="/dashboard" className="inline-block mt-4 rounded-xl bg-slate-900 px-4 py-2 text-sm text-white">
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}
