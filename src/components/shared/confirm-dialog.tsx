"use client";

import { AnimatePresence, motion } from "framer-motion";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  variant?: "danger" | "default";
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  variant = "default",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const isDanger = variant === "danger";

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={onCancel}
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.45)", zIndex: 200 }}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ duration: 0.15 }}
            style={{
              position: "fixed",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: 380,
              maxWidth: "calc(100vw - 40px)",
              background: "#fff",
              borderRadius: 16,
              boxShadow: "0 24px 64px rgba(0,0,0,.18)",
              zIndex: 201,
              padding: 24,
            }}
          >
            <div style={{
              width: 40, height: 40, borderRadius: 10,
              background: isDanger ? "#fef2f2" : "#eef2ff",
              display: "flex", alignItems: "center", justifyContent: "center",
              marginBottom: 14,
            }}>
              <i
                className={"ti " + (isDanger ? "ti-alert-triangle" : "ti-info-circle")}
                style={{ fontSize: 20, color: isDanger ? "#dc2626" : "#4f46e5" }}
              />
            </div>
            <h3 style={{ margin: "0 0 6px", fontSize: 15, fontWeight: 700, color: "var(--pf-text)", letterSpacing: "-.2px" }}>
              {title}
            </h3>
            <p style={{ margin: "0 0 20px", fontSize: 13.5, color: "var(--pf-text-2)", lineHeight: 1.55 }}>
              {description}
            </p>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button
                onClick={onCancel}
                style={{
                  padding: "8px 16px", borderRadius: 8,
                  border: "1px solid var(--pf-line-strong)", background: "#fff",
                  fontSize: 13.5, color: "var(--pf-text-2)", cursor: "pointer",
                  fontFamily: "var(--font-inter)",
                }}
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                style={{
                  padding: "8px 16px", borderRadius: 8, border: "none",
                  background: isDanger ? "#dc2626" : "#4f46e5",
                  color: "#fff", fontSize: 13.5, fontWeight: 500,
                  cursor: "pointer", fontFamily: "var(--font-inter)",
                }}
              >
                {confirmLabel}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
