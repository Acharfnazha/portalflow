"use client";

import { useActionState } from "react";
import { resetPassword } from "@/lib/supabase/actions";

export default function ResetPasswordPage() {
  const [state, action, pending] = useActionState(resetPassword, null);

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

  return (
    <div style={{ width: "100%", maxWidth: 380 }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--pf-text)", margin: "0 0 6px", letterSpacing: "-.4px" }}>
        Set new password
      </h1>
      <p style={{ fontSize: 13.5, color: "var(--pf-text-2)", margin: "0 0 28px" }}>
        Choose a strong password for your account.
      </p>

      {state?.error && (
        <div style={{
          padding: "10px 14px",
          borderRadius: 8,
          background: "#fef2f2",
          border: "1px solid #fecaca",
          marginBottom: 16,
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

      <form action={action} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div>
          <label htmlFor="password" style={labelStyle}>New password</label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            placeholder="Min. 8 characters"
            style={inputStyle}
          />
        </div>
        <div>
          <label htmlFor="confirm" style={labelStyle}>Confirm new password</label>
          <input
            id="confirm"
            name="confirm"
            type="password"
            autoComplete="new-password"
            required
            placeholder="••••••••"
            style={inputStyle}
          />
        </div>
        <button
          type="submit"
          disabled={pending}
          style={{
            padding: "10px 0",
            borderRadius: 9,
            border: "none",
            background: pending ? "#818cf8" : "#4f46e5",
            color: "#fff",
            fontSize: 14,
            fontWeight: 500,
            cursor: pending ? "not-allowed" : "pointer",
            fontFamily: "var(--font-inter)",
            marginTop: 4,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
          }}
        >
          {pending && (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden style={{ animation: "pf-spin .7s linear infinite" }}>
              <circle cx="8" cy="8" r="6" stroke="rgba(255,255,255,.35)" strokeWidth="2" />
              <path d="M14 8a6 6 0 0 0-6-6" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
            </svg>
          )}
          {pending ? "Updating…" : "Update password"}
        </button>
      </form>
    </div>
  );
}
