export default function Alert({ type = "error", message }) {
  if (!message) return null;
  const styles =
    type === "success"
      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700"
      : "border-red-500/30 bg-red-500/10 text-red-600";
  return <div className={`rounded-xl border px-4 py-3 text-sm ${styles}`}>{message}</div>;
}
