"use client";

import { useActionState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { inviteMember } from "@/lib/supabase/org-actions";
import { INVITABLE_ROLES, type Role, assignableRoles } from "@/lib/permissions";

interface InviteModalProps {
  open: boolean;
  onClose: () => void;
  userRole: Role;
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "9px 12px",
  borderRadius: 8,
  border: "1px solid var(--pf-line-strong)",
  fontSize: 13.5,
  color: "var(--pf-text)",
  background: "#fff",
  outline: "none",
  fontFamily: "var(--font-inter)",
  boxSizing: "border-box",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 12.5,
  fontWeight: 500,
  color: "var(--pf-text-2)",
  marginBottom: 5,
};

export function InviteModal({ open, onClose, userRole }: InviteModalProps) {
  const [state, action, pending] = useActionState(inviteMember, null);
  const formRef = useRef<HTMLFormElement>(null);
  const roles = assignableRoles(userRole);

  // Close on success (state becomes null after a successful send)
  useEffect(() => {
    if (!pending && state === null && formRef.current) {
      // Only close if form was actually submitted (has data)
      const email = new FormData(formRef.current).get("email");
      if (email) {
        formRef.current.reset();
        onClose();
      }
    }
  }, [state, pending, onClose]);

  const handleSubmit = (formData: FormData) => {
    action(formData);
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={onClose}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,.45)",
              zIndex: 100,
            }}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.15 }}
            style={{
              position: "fixed",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: 440,
              maxWidth: "calc(100vw - 40px)",
              background: "#fff",
              borderRadius: 16,
              boxShadow: "0 24px 64px rgba(0,0,0,.18)",
              zIndex: 101,
              overflow: "hidden",
            }}
          >
            {/* Header */}
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "20px 24px",
              borderBottom: "1px solid var(--pf-line)",
            }}>
              <div>
                <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--pf-text)", margin: 0, letterSpacing: "-.2px" }}>
                  Invite team member
                </h2>
                <p style={{ margin: "3px 0 0", fontSize: 12.5, color: "var(--pf-text-3)" }}>
                  They&apos;ll receive an email with a link to join.
                </p>
              </div>
              <button
                onClick={onClose}
                type="button"
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 8,
                  border: "1px solid var(--pf-line)",
                  background: "#fff",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--pf-text-3)",
                }}
              >
                <i className="ti ti-x" aria-hidden style={{ fontSize: 15 }} />
              </button>
            </div>

            {/* Form */}
            <form ref={formRef} action={handleSubmit} style={{ padding: "24px", display: "flex", flexDirection: "column", gap: 16 }}>
              {state?.error && (
                <div style={{
                  padding: "10px 14px",
                  borderRadius: 8,
                  background: "#fef2f2",
                  border: "1px solid #fecaca",
                  fontSize: 13,
                  color: "#dc2626",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}>
                  <i className="ti ti-alert-circle" style={{ fontSize: 15, flexShrink: 0 }} />
                  {state.error}
                </div>
              )}

              <div>
                <label htmlFor="invite-email" style={labelStyle}>Email address</label>
                <input
                  id="invite-email"
                  name="email"
                  type="email"
                  required
                  placeholder="colleague@company.com"
                  style={inputStyle}
                />
              </div>

              <div>
                <label htmlFor="invite-role" style={labelStyle}>Role</label>
                <select
                  id="invite-role"
                  name="role"
                  defaultValue="staff"
                  style={{ ...inputStyle, cursor: "pointer" }}
                >
                  {INVITABLE_ROLES.filter((r) => roles.includes(r.value)).map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>

                {/* Role descriptions */}
                <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 6 }}>
                  {INVITABLE_ROLES.filter((r) => roles.includes(r.value)).map((r) => (
                    <div key={r.value} style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 12, color: "var(--pf-text-3)" }}>
                      <span style={{ fontWeight: 600, color: "var(--pf-text-2)", minWidth: 56 }}>{r.label}:</span>
                      {r.description}
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", paddingTop: 8, borderTop: "1px solid var(--pf-line)" }}>
                <button
                  type="button"
                  onClick={onClose}
                  style={{
                    padding: "8px 16px",
                    borderRadius: 8,
                    border: "1px solid var(--pf-line-strong)",
                    background: "#fff",
                    fontSize: 13.5,
                    color: "var(--pf-text-2)",
                    cursor: "pointer",
                    fontFamily: "var(--font-inter)",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={pending}
                  style={{
                    padding: "8px 18px",
                    borderRadius: 8,
                    border: "none",
                    background: pending ? "#818cf8" : "#4f46e5",
                    color: "#fff",
                    fontSize: 13.5,
                    fontWeight: 500,
                    cursor: pending ? "not-allowed" : "pointer",
                    fontFamily: "var(--font-inter)",
                    display: "flex",
                    alignItems: "center",
                    gap: 7,
                  }}
                >
                  {pending && (
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden style={{ animation: "pf-spin .7s linear infinite" }}>
                      <circle cx="8" cy="8" r="6" stroke="rgba(255,255,255,.35)" strokeWidth="2" />
                      <path d="M14 8a6 6 0 0 0-6-6" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  )}
                  {pending ? "Sending…" : "Send invite"}
                </button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
