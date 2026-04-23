export default function EmptyState({ text, loading = false, actionText = "", onAction = null }) {
  return (
    <div className="glass-card rounded-xl border border-[var(--border-color)] px-4 py-3 text-sm text-[var(--text-muted)] shadow-sm">
      <div className="flex flex-col gap-3">
        <span className={loading ? "animate-pulse" : ""}>{text}</span>
        {actionText && typeof onAction === "function" ? (
          <button type="button" onClick={onAction} className="btn-primary w-fit text-xs">
            {actionText}
          </button>
        ) : null}
      </div>
    </div>
  );
}
