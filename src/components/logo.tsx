"use client";

interface LogoProps {
  className?: string;
  size?: number;
}

export function Logo({ size = 28 }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      stroke="var(--pf-text)"
      strokeWidth="5"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ flex: "none" }}
    >
      <path d="M8 13 C22 13,27 24,37 24" />
      <path d="M8 35 C22 35,27 24,37 24" />
      <path d="M8 24 H37" />
      <circle cx="38" cy="24" r="3.6" fill="var(--pf-accent)" stroke="none" />
    </svg>
  );
}

export function LogoWordmark({ size = 28 }: LogoProps) {
  return (
    <a
      href="#top"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        textDecoration: "none",
        color: "var(--pf-text)",
      }}
    >
      <Logo size={size} />
      <span
        style={{
          fontFamily: "var(--font-inter-tight)",
          fontWeight: 600,
          fontSize: 18,
          letterSpacing: "-0.02em",
        }}
      >
        Portal
        <span style={{ color: "var(--pf-accent)" }}>Flow</span>
      </span>
    </a>
  );
}
