export default function StatCard({ label, value }) {
  return (
    <div className="glass-card rounded-2xl border border-white/70 p-4 shadow-sm hover:shadow-md transition">
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-slate-900">{value}</p>
    </div>
  );
}
