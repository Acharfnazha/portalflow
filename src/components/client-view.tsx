"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const ease = [0.16, 1, 0.3, 1] as const;

export function ClientView() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section style={{ padding: "96px 24px" }}>
      <div
        ref={ref}
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "1fr 1.05fr",
          gap: 54,
          alignItems: "center",
        }}
      >
        {/* Copy */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease }}
        >
          <span
            style={{
              fontSize: "12.5px",
              letterSpacing: ".08em",
              textTransform: "uppercase",
              color: "var(--pf-accent)",
              fontWeight: 700,
              fontFamily: "var(--font-jetbrains-mono)",
            }}
          >
            The client view
          </span>
          <h2
            style={{
              fontFamily: "var(--font-inter-tight)",
              fontWeight: 600,
              fontSize: "clamp(30px, 4.2vw, 44px)",
              letterSpacing: "-.03em",
              lineHeight: 1.1,
              margin: "14px 0 0",
              color: "var(--pf-text)",
            }}
          >
            Your logo. Your domain.
            <br />
            Your brand — not ours.
          </h2>
          <p
            style={{
              fontSize: "16.5px",
              lineHeight: 1.6,
              color: "var(--pf-text-2)",
              margin: "18px 0 0",
              maxWidth: 440,
            }}
          >
            Clients open a portal that looks like it was built by your team. Fully white-labeled, on
            your own domain, with zero PortalFlow branding.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 26 }}>
            {[
              ["Custom domain", "portal.youragency.com"],
              ["No-login magic links", "clients don't resent"],
              ["Your colors & logo", "on every page and email"],
            ].map(([bold, rest]) => (
              <div key={bold} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                <span
                  style={{ color: "var(--pf-accent)", fontSize: 18, lineHeight: 1.4 }}
                >
                  ✓
                </span>
                <span style={{ fontSize: 15, color: "var(--pf-text-2)" }}>
                  <b style={{ color: "var(--pf-text)" }}>{bold}</b> — {rest}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Portal preview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease, delay: 0.1 }}
          style={{ position: "relative" }}
        >
          <div
            style={{
              borderRadius: 20,
              border: "1px solid var(--pf-line)",
              background: "#fff",
              boxShadow: "0 30px 70px -26px rgba(11,13,18,.26)",
              overflow: "hidden",
            }}
          >
            {/* Portal header */}
            <div
              style={{
                padding: "16px 22px",
                background: "linear-gradient(120deg, oklch(0.32 0.05 264), oklch(0.26 0.04 264))",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: 8,
                    background: "#fff",
                    opacity: 0.95,
                  }}
                />
                <span
                  style={{
                    color: "#fff",
                    fontWeight: 600,
                    fontSize: 15,
                    fontFamily: "var(--font-inter-tight)",
                  }}
                >
                  Northwind Studio
                </span>
              </div>
              <span style={{ color: "rgba(255,255,255,.7)", fontSize: 12 }}>Welcome, Acme →</span>
            </div>

            <div style={{ padding: 22 }}>
              <div
                style={{
                  fontFamily: "var(--font-inter-tight)",
                  fontWeight: 600,
                  fontSize: 19,
                  letterSpacing: "-.01em",
                }}
              >
                Q3 Brand Refresh
              </div>
              <div style={{ fontSize: 13, color: "var(--pf-text-3)", marginTop: 3 }}>
                On track · 68% complete
              </div>
              <div
                style={{
                  height: 8,
                  borderRadius: 99,
                  background: "var(--pf-surface-2)",
                  marginTop: 14,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: "68%",
                    height: "100%",
                    background: "linear-gradient(90deg, var(--pf-accent), var(--pf-accent-2))",
                    borderRadius: 99,
                  }}
                />
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 12,
                  marginTop: 18,
                }}
              >
                <div
                  style={{
                    border: "1px solid var(--pf-line)",
                    borderRadius: 13,
                    padding: 15,
                  }}
                >
                  <div style={{ fontSize: 12, color: "var(--pf-text-3)" }}>Next invoice</div>
                  <div style={{ fontWeight: 600, fontSize: 16, marginTop: 4 }}>$3,200 due</div>
                  <div
                    style={{
                      marginTop: 10,
                      fontSize: "12.5px",
                      fontWeight: 600,
                      color: "#fff",
                      background:
                        "linear-gradient(140deg, var(--pf-accent), var(--pf-accent-2))",
                      padding: "8px 0",
                      borderRadius: 9,
                      textAlign: "center",
                    }}
                  >
                    Pay now
                  </div>
                </div>
                <div
                  style={{
                    border: "1px solid var(--pf-line)",
                    borderRadius: 13,
                    padding: 15,
                  }}
                >
                  <div style={{ fontSize: 12, color: "var(--pf-text-3)" }}>Awaiting you</div>
                  <div style={{ fontWeight: 600, fontSize: 16, marginTop: 4 }}>Sign MSA</div>
                  <div
                    style={{
                      marginTop: 10,
                      fontSize: "12.5px",
                      fontWeight: 600,
                      color: "var(--pf-accent)",
                      border: "1px solid var(--pf-accent-ring)",
                      padding: "8px 0",
                      borderRadius: 9,
                      textAlign: "center",
                    }}
                  >
                    Review & sign
                  </div>
                </div>
              </div>

              <div
                style={{
                  marginTop: 14,
                  border: "1px solid var(--pf-line)",
                  borderRadius: 13,
                  padding: "14px 15px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <span style={{ fontSize: "13.5px", color: "var(--pf-text-2)" }}>
                  3 new files in Brand Kit
                </span>
                <span style={{ fontSize: "12.5px", color: "var(--pf-accent)", fontWeight: 600 }}>
                  View →
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
