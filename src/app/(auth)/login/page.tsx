"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signIn, signInWithGoogle } from "@/lib/supabase/actions";

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

export default function LoginPage() {
  const [state, action, pending] = useActionState(signIn, null);

  return (
    <div style={{ width: "100%", maxWidth: 400 }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: "var(--pf-text)", margin: "0 0 6px", letterSpacing: "-.4px" }}>
          Welcome back
        </h1>
        <p style={{ fontSize: 13.5, color: "var(--pf-text-2)", margin: 0 }}>
          Sign in to your PortalFlow workspace.
        </p>
      </div>

      {/* Google OAuth */}
      <form action={signInWithGoogle}>
        <button
          type="submit"
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            padding: "10px 0",
            borderRadius: 9,
            border: "1px solid var(--pf-line-strong)",
            background: "#fff",
            fontSize: 14,
            fontWeight: 500,
            color: "var(--pf-text)",
            cursor: "pointer",
            marginBottom: 22,
            fontFamily: "var(--font-inter)",
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </button>
      </form>

      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 22 }}>
        <div style={{ flex: 1, height: 1, background: "var(--pf-line)" }} />
        <span style={{ fontSize: 12, color: "var(--pf-text-3)" }}>or</span>
        <div style={{ flex: 1, height: 1, background: "var(--pf-line)" }} />
      </div>

      {/* Error */}
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
          <label htmlFor="email" style={labelStyle}>Email</label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="you@agency.com"
            style={inputStyle}
          />
        </div>

        <div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
            <label htmlFor="password" style={{ ...labelStyle, marginBottom: 0 }}>Password</label>
            <Link href="/forgot-password" style={{ fontSize: 12, color: "#4f46e5", textDecoration: "none" }}>
              Forgot password?
            </Link>
          </div>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
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
          {pending ? "Signing in…" : "Sign in"}
        </button>
      </form>

      <p style={{ textAlign: "center", fontSize: 13, color: "var(--pf-text-3)", marginTop: 22 }}>
        Don&apos;t have an account?{" "}
        <Link href="/signup" style={{ color: "#4f46e5", fontWeight: 500, textDecoration: "none" }}>
          Start free trial
        </Link>
      </p>
    </div>
  );
}
