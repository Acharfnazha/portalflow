import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Check your email — PortalFlow" };

export default function CheckEmailPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--pf-bg)",
        fontFamily: "var(--font-inter)",
      }}
    >
      <div
        style={{
          maxWidth: 400,
          width: "100%",
          margin: "0 auto",
          padding: "48px 32px",
          background: "#fff",
          borderRadius: 16,
          border: "1px solid var(--pf-line)",
          textAlign: "center",
        }}
      >
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: 16,
            background: "#eef2ff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 20px",
          }}
        >
          <i className="ti ti-mail-check" style={{ fontSize: 28, color: "#4f46e5" }} />
        </div>
        <h1
          style={{
            fontSize: 22,
            fontWeight: 700,
            color: "var(--pf-text)",
            margin: "0 0 10px",
            letterSpacing: "-.3px",
          }}
        >
          Check your email
        </h1>
        <p style={{ fontSize: 14, color: "var(--pf-text-2)", margin: "0 0 28px", lineHeight: 1.6 }}>
          We sent a confirmation link to your email address. Click it to activate your account.
        </p>
        <p style={{ fontSize: 12.5, color: "var(--pf-text-3)", margin: "0 0 20px" }}>
          Didn&apos;t receive it? Check your spam folder or{" "}
          <Link href="/signup" style={{ color: "#4f46e5", textDecoration: "none" }}>
            try again
          </Link>
          .
        </p>
        <Link
          href="/login"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            fontSize: 13.5,
            color: "#4f46e5",
            textDecoration: "none",
            fontWeight: 500,
          }}
        >
          <i className="ti ti-arrow-left" style={{ fontSize: 14 }} />
          Back to sign in
        </Link>
      </div>
    </div>
  );
}
