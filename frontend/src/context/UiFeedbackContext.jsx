import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { emitEvent, onEvent } from "../services/appEvents";

const UiFeedbackContext = createContext(null);

export function UiFeedbackProvider({ children }) {
  const [loadingCount, setLoadingCount] = useState(0);
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const offStart = onEvent("loading:start", () => {
      setLoadingCount((count) => count + 1);
    });
    const offEnd = onEvent("loading:end", () => {
      setLoadingCount((count) => Math.max(0, count - 1));
    });
    const offToast = onEvent("toast", (payload) => {
      const id = crypto.randomUUID();
      setToasts((prev) => [...prev, { id, type: payload?.type || "info", message: payload?.message || "" }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
      }, 2800);
    });
    return () => {
      offStart();
      offEnd();
      offToast();
    };
  }, []);

  const value = useMemo(
    () => ({
      isGlobalLoading: loadingCount > 0,
      showToast: (type, message) => emitEvent("toast", { type, message }),
    }),
    [loadingCount],
  );

  return (
    <UiFeedbackContext.Provider value={value}>
      {loadingCount > 0 ? (
        <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-slate-200/70">
          <div className="h-1 w-1/3 bg-indigo-600 animate-pulse" />
        </div>
      ) : null}
      <div className="fixed right-4 top-4 z-50 space-y-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`rounded-xl border px-3 py-2 text-sm shadow-lg ${
              toast.type === "error"
                ? "border-red-200 bg-red-50 text-red-700"
                : toast.type === "success"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border-slate-200 bg-white text-slate-700"
            }`}
          >
            {toast.message}
          </div>
        ))}
      </div>
      {children}
    </UiFeedbackContext.Provider>
  );
}

export function useUiFeedback() {
  const context = useContext(UiFeedbackContext);
  if (!context) {
    throw new Error("useUiFeedback must be used within UiFeedbackProvider");
  }
  return context;
}
