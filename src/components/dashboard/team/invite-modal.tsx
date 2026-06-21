"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { inviteMember } from "@/lib/supabase/org-actions";
import type { InviteState } from "@/lib/supabase/org-actions";
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
  const [state, action, pending] = useActionState<InviteState, FormData>(inviteMember, null);
  const formRef = useRef<HTMLFormElement>(null);
  const roles = assignableRoles(userRole);
  const [submitted, setSubmitted] = useState(false);
  const [copied, setCopied] = useState(false);

  // Detect success: state becomes null after a real submission
  useEffect(() => {
    if (submitted && !pending && state === null) {
      formRef.current?.reset();
      setSubmitted(false);
      onClose();
    }
  }, [state, pending, submitted, onClose]);

  // Reset local state when modal closes/opens
  useEffect(() => {
    if (!open) {
      setSubmitted(false);
      setCopied(false);
    }
  }, [open]);

  const handleSubmit = (formData: FormData) => {
    setSubmitted(true);
    action(formData);
  };

  const inviteUrl = state && "inviteUrl" in state ? state.inviteUrl : null;

  const handleCopy = () => {
    if (!inviteUrl) return;
    navigator.clipboard.writeText(inviteUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
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

          {/* Centering wrapper — not animated, just positions the modal */}
          <div
            style={{
              position: "fixed",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "20px",
              zIndex: 101,
              pointerEvents: "none",
            }}
          >
            {/* Modal — animated without transform conflicts */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              transition={{ duration: 0.15 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                width: 440,
                maxWidth: "100%",
                maxHeight: "calc(100vh - 80px)",
                background: "#fff",
                borderRadius: 16,
                boxShadow: "0 24px 64px rgba(0,0,0,.18)",
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
                pointerEvents: "auto",
              }}
            >
              {/* Header — always visible */}
              <div style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "20px 24px",
                borderBottom: "1px solid var(--pf-line)",
                flexShrink: 0,
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
                  aria-label="Close"
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
                    flexShrink: 0,
                  }}
                >
                  <i className="ti ti-x" aria-hidden style={{ fontSize: 15 }} />
                </button>
              </div>

              {/* Form */}
              <form
                ref={formRef}
                action={handleSubmit}
                style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden", minHeight: 0 }}
              >
                {/* Scrollable body */}
                <div style={{ overflowY: "auto", flex: 1, padding: "24px 24px 0" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 16, paddingBottom: 24 }}>
                    {/* Error banner */}
                    {state && "error" in state && (
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

                    {/* Invite link fallback (email not configured) */}
                    {inviteUrl && (
                      <div style={{
                        padding: "12px 14px",
                        borderRadius: 8,
                        background: "#f0fdf4",
                        border: "1px solid #bbf7d0",
                        fontSize: 13,
                        color: "#166534",
                        display: "flex",
                        flexDirection: "column",
                        gap: 8,
                      }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <i className="ti ti-check" style={{ fontSize: 15, flexShrink: 0 }} />
                          <span style={{ fontWeight: 500 }}>Invitation created.</span>
                          <span style={{ color: "#15803d" }}>Email sending is not configured — share this link manually:</span>
                        </div>
                        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                          <input
                            readOnly
                            value={inviteUrl}
                            style={{
                              ...inputStyle,
                              fontSize: 11.5,
                              background: "#f0fdf4",
                              border: "1px solid #bbf7d0",
                              color: "#166534",
                              flex: 1,
                            }}
                            onFocus={(e) => e.target.select()}
                          />
                          <button
                            type="button"
                            onClick={handleCopy}
                            style={{
                              padding: "8px 12px",
                              borderRadius: 7,
                              border: "1px solid #bbf7d0",
                              background: copied ? "#dcfce7" : "#fff",
                              color: "#166534",
                              fontSize: 12,
                              cursor: "pointer",
                              fontFamily: "var(--font-inter)",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {copied ? "Copied!" : "Copy"}
                          </button>
                        </div>
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

                      <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 6 }}>
                        {INVITABLE_ROLES.filter((r) => roles.includes(r.value)).map((r) => (
                          <div key={r.value} style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 12, color: "var(--pf-text-3)" }}>
                            <span style={{ fontWeight: 600, color: "var(--pf-text-2)", minWidth: 56 }}>{r.label}:</span>
                            {r.description}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer — always visible at bottom */}
                <div style={{
                  display: "flex",
                  gap: 10,
                  justifyContent: "flex-end",
                  padding: "16px 24px",
                  borderTop: "1px solid var(--pf-line)",
                  flexShrink: 0,
                  background: "#fff",
                }}>
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
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
