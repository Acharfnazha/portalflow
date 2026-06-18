"use client";

import { useActionState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { forgotPassword } from "@/lib/supabase/actions";

function ForgotPasswordForm() {
  const [state, action, pending] = useActionState(forgotPassword, null);
  const searchParams = useSearchParams();
  const sent = searchParams.get("sent") === "1";

  if (sent) {
    return (
      <div style={{ width: "100%", maxWidth: 380 }}>
        <div
          style={{
            padding: "24px 20px",
            borderRadius: 12,
            background: "#f0fdf4",
            border: "1px solid #bbf7d0",
            textAlign: "center",
            marginBottom: 24,
          }}
        >
          <i className="ti ti-circle-check" style={{ fontSize: 32, color: "#16a34a", display: "block", marginBottom: 10 }} />
          <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "#15803d" }}>Reset link sent!</p>
          <p style={{ margin: "6px 0 0", fontSize: 13, color: "#166534" }}>
            Check your email for a link to reset your password.
          </p>
        </div>
        <Link
          href="/login"
          style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, fontSize: 13.5, color: "#4f46e5", textDecoration: "none", fontWeight: 500 }}
        >
          <i className="ti ti-arrow-left" style={{ fontSize: 14 }} />
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <div style={{ width: "100%", maxWidth: 380 }}>
      <Link
        href="/login"
        style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 13, color: "var(--pf-text-3)", textDecoration: "none", marginBottom: 28 }}
      >
        <i className="ti ti-arrow-left" aria-hidden style={{ fontSize: 14 }} />
        Back to sign in
      </Link>

      <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--pf-text)", margin: "0 0 6px", letterSpacing: "-.4px" }}>
        Reset your password
      </h1>
      <p style={{ fontSize: 13.5, color: "var(--pf-text-2)", margin: "0 0 28px" }}>
        Enter your email and we&apos;ll send a reset link.
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
          <label htmlFor="email" style={{ display: "block", fontSize: 12.5, fontWeight: 500, color: "var(--pf-text-2)", marginBottom: 5 }}>
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="you@agency.com"
            style={{
              width: "100%",
              padding: "9px 12px",
              borderRadius: 8,
              border: "1px solid var(--pf-line-strong)",
              fontSize: 13.5,
              color: "var(--pf-text)",
              outline: "none",
              background: "#fff",
              fontFamily: "var(--font-inter)",
              boxSizing: "border-box",
            }}
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
          {pending ? "Sending…" : "Send reset link"}
        </button>
      </form>
    </div>
  );
}

export default function ForgotPasswordPage() {
  return (
    <Suspense>
      <ForgotPasswordForm />
    </Suspense>
  );
}
