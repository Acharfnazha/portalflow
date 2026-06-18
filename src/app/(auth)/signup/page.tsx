"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signUp } from "@/lib/supabase/actions";

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 12.5,
  fontWeight: 500,
  color: "var(--pf-text-2)",
  marginBottom: 5,
};

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

export default function SignupPage() {
  const [state, action, pending] = useActionState(signUp, null);

  return (
    <div style={{ width: "100%", maxWidth: 420 }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: "var(--pf-text)", margin: "0 0 6px", letterSpacing: "-.4px" }}>
          Start your free trial
        </h1>
        <p style={{ fontSize: 13.5, color: "var(--pf-text-2)", margin: 0 }}>
          14 days free, no credit card required.
        </p>
      </div>

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

      <form action={action} style={{ display: "flex", flexDirection: "column", gap: 13 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <div>
            <label htmlFor="firstName" style={labelStyle}>First name</label>
            <input id="firstName" name="firstName" type="text" autoComplete="given-name" required style={inputStyle} />
          </div>
          <div>
            <label htmlFor="lastName" style={labelStyle}>Last name</label>
            <input id="lastName" name="lastName" type="text" autoComplete="family-name" required style={inputStyle} />
          </div>
        </div>

        <div>
          <label htmlFor="email" style={labelStyle}>Work email</label>
          <input id="email" name="email" type="email" autoComplete="email" required placeholder="you@agency.com" style={inputStyle} />
        </div>

        <div>
          <label htmlFor="orgName" style={labelStyle}>Agency / company name</label>
          <input id="orgName" name="orgName" type="text" required placeholder="Acme Studio" style={inputStyle} />
        </div>

        <div>
          <label htmlFor="password" style={labelStyle}>Password</label>
          <input id="password" name="password" type="password" autoComplete="new-password" required placeholder="Min. 8 characters" style={inputStyle} />
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
          {pending ? "Creating account…" : "Create account"}
        </button>

        <p style={{ fontSize: 11.5, color: "var(--pf-text-3)", textAlign: "center", margin: 0 }}>
          By signing up you agree to our{" "}
          <a href="/terms" style={{ color: "#4f46e5", textDecoration: "none" }}>Terms of Service</a>{" "}
          and <a href="/privacy" style={{ color: "#4f46e5", textDecoration: "none" }}>Privacy Policy</a>.
        </p>
      </form>

      <p style={{ textAlign: "center", fontSize: 13, color: "var(--pf-text-3)", marginTop: 20 }}>
        Already have an account?{" "}
        <Link href="/login" style={{ color: "#4f46e5", fontWeight: 500, textDecoration: "none" }}>Sign in</Link>
      </p>
    </div>
  );
}
