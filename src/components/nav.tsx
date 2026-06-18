"use client";

import { useEffect, useState } from "react";
import { LogoWordmark } from "./logo";

export function Nav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setScrolled((window.scrollY || document.documentElement.scrollTop) > 24);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      style={{
        position: "sticky",
        top: 0,
        zIndex: 60,
        backdropFilter: "blur(18px)",
        WebkitBackdropFilter: "blur(18px)",
        transition: "background 0.35s cubic-bezier(.16,1,.3,1), box-shadow 0.35s cubic-bezier(.16,1,.3,1)",
        background: scrolled ? "rgba(255,255,255,.82)" : "rgba(255,255,255,.45)",
        boxShadow: scrolled
          ? "0 1px 0 rgba(15,17,23,.07), 0 10px 30px -10px rgba(11,13,18,.08)"
          : "0 1px 0 rgba(15,17,23,0)",
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "14px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 24,
        }}
      >
        <LogoWordmark />

        <div style={{ display: "flex", alignItems: "center", gap: 30 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 28,
              fontSize: "14.5px",
              color: "var(--pf-text-2)",
              fontWeight: 500,
            }}
          >
            {(["Product", "Showcase", "Pricing", "FAQ"] as const).map((label) => (
              <a
                key={label}
                href={`#${label.toLowerCase()}`}
                style={{
                  textDecoration: "none",
                  color: "inherit",
                  transition: "color .2s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "var(--pf-text)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "var(--pf-text-2)")}
              >
                {label}
              </a>
            ))}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <a
              href="/login"
              style={{
                textDecoration: "none",
                color: "var(--pf-text-2)",
                fontSize: "14.5px",
                fontWeight: 500,
                transition: "color .2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--pf-text)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--pf-text-2)")}
            >
              Sign in
            </a>
            <a
              href="/signup"
              style={{
                textDecoration: "none",
                fontSize: "14.5px",
                fontWeight: 600,
                color: "#fff",
                background: "linear-gradient(140deg, var(--pf-accent), var(--pf-accent-2))",
                padding: "9px 18px",
                borderRadius: 11,
                boxShadow: "0 4px 14px var(--pf-accent-ring)",
                transition: "transform .2s cubic-bezier(.16,1,.3,1), box-shadow .2s cubic-bezier(.16,1,.3,1)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-1px)";
                e.currentTarget.style.boxShadow = "0 8px 22px var(--pf-accent-ring)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "none";
                e.currentTarget.style.boxShadow = "0 4px 14px var(--pf-accent-ring)";
              }}
            >
              Start free
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
}
