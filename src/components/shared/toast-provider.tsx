"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useUiStore } from "@/stores/ui.store";

const VARIANT_STYLES = {
  default: { bg: "#fff",     border: "var(--pf-line)", icon: "ti-info-circle",    iconColor: "#4f46e5" },
  success: { bg: "#f0fdf4",  border: "#bbf7d0",        icon: "ti-circle-check",   iconColor: "#16a34a" },
  error:   { bg: "#fef2f2",  border: "#fecaca",        icon: "ti-alert-circle",   iconColor: "#dc2626" },
  warning: { bg: "#fffbeb",  border: "#fde68a",        icon: "ti-alert-triangle", iconColor: "#d97706" },
};

export function ToastProvider() {
  const toasts     = useUiStore(s => s.toasts);
  const removeToast = useUiStore(s => s.removeToast);

  return (
    <div
      aria-live="polite"
      aria-atomic="false"
      style={{
        position: "fixed",
        bottom: 20,
        right: 20,
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        gap: 8,
        pointerEvents: "none",
      }}
    >
      <AnimatePresence mode="popLayout">
        {toasts.map((t) => {
          const s = VARIANT_STYLES[t.variant ?? "default"];
          return (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, y: 16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.96 }}
              transition={{ duration: 0.2 }}
              role="status"
              style={{
                background: s.bg,
                border: `1px solid ${s.border}`,
                borderRadius: 10,
                padding: "12px 14px",
                boxShadow: "0 4px 20px rgba(0,0,0,.1)",
                display: "flex",
                alignItems: "flex-start",
                gap: 10,
                minWidth: 280,
                maxWidth: 380,
                pointerEvents: "auto",
              }}
            >
              <i
                className={`ti ${s.icon}`}
                aria-hidden
                style={{ fontSize: 18, color: s.iconColor, flexShrink: 0, marginTop: 1 }}
              />
              <div style={{ flex: 1 }}>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "var(--pf-text)" }}>
                  {t.title}
                </p>
                {t.description && (
                  <p style={{ margin: "2px 0 0", fontSize: 12, color: "var(--pf-text-2)" }}>
                    {t.description}
                  </p>
                )}
              </div>
              <button
                type="button"
                aria-label="Dismiss"
                onClick={() => removeToast(t.id)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--pf-text-3)",
                  padding: 0,
                  display: "flex",
                  flexShrink: 0,
                }}
              >
                <i className="ti ti-x" aria-hidden style={{ fontSize: 14 }} />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
