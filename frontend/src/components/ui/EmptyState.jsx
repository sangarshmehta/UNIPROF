export default function EmptyState({ text, loading = false }) {
  return (
    <div className="glass-card rounded-xl border border-white/70 px-4 py-3 text-sm text-slate-600 shadow-sm">
      <span className={loading ? "animate-pulse" : ""}>{text}</span>
    </div>
  );
}
