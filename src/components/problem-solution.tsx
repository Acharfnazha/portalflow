"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";

function AnimateIn({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay }}
    >
      {children}
    </motion.div>
  );
}

const before = [
  '"Did you get my invoice?" — 4th email',
  "Files lost in WhatsApp & Drive links",
  "Contracts chased over signatures",
  "Payments late, status unclear",
];

const after = [
  "One branded link clients actually use",
  "Every file, project & doc in one place",
  "Sign & pay without leaving the portal",
  "Real-time status, zero status calls",
];

export function ProblemSolution() {
  return (
    <section style={{ padding: "96px 24px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", textAlign: "center" }}>
        <AnimateIn>
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
            The problem
          </span>
          <h2
            style={{
              fontFamily: "var(--font-inter-tight)",
              fontWeight: 600,
              fontSize: "clamp(30px, 4.4vw, 46px)",
              letterSpacing: "-.03em",
              lineHeight: 1.08,
              margin: "14px auto 0",
              maxWidth: 720,
              color: "var(--pf-text)",
            }}
          >
            Your client experience is scattered across ten tools.
          </h2>
        </AnimateIn>
      </div>

      <div
        style={{
          maxWidth: 1100,
          margin: "46px auto 0",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 24,
          alignItems: "stretch",
        }}
      >
        {/* Before */}
        <AnimateIn delay={0.05}>
          <div
            style={{
              border: "1px solid var(--pf-line)",
              borderRadius: 20,
              padding: 30,
              background: "var(--pf-surface)",
            }}
          >
            <div
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: "var(--pf-text-3)",
                letterSpacing: ".04em",
                textTransform: "uppercase",
                marginBottom: 18,
              }}
            >
              Before PortalFlow
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
              {before.map((item) => (
                <div
                  key={item}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 11,
                    padding: "13px 15px",
                    background: "#fff",
                    border: "1px solid var(--pf-line)",
                    borderRadius: 12,
                    color: "var(--pf-text-2)",
                    fontSize: "14.5px",
                  }}
                >
                  <span style={{ color: "#d14" }}>⚠</span> {item}
                </div>
              ))}
            </div>
          </div>
        </AnimateIn>

        {/* After */}
        <AnimateIn delay={0.1}>
          <div
            style={{
              position: "relative",
              border: "1px solid var(--pf-accent-ring)",
              borderRadius: 20,
              padding: 30,
              background: "linear-gradient(180deg, var(--pf-accent-soft), #fff)",
              boxShadow: "0 24px 60px -22px var(--pf-accent-ring)",
            }}
          >
            <div
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: "var(--pf-accent)",
                letterSpacing: ".04em",
                textTransform: "uppercase",
                marginBottom: 18,
              }}
            >
              With PortalFlow
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
              {after.map((item) => (
                <div
                  key={item}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 11,
                    padding: "13px 15px",
                    background: "#fff",
                    border: "1px solid var(--pf-line)",
                    borderRadius: 12,
                    fontSize: "14.5px",
                    fontWeight: 500,
                    color: "var(--pf-text)",
                  }}
                >
                  <span style={{ color: "var(--pf-accent)" }}>✓</span> {item}
                </div>
              ))}
            </div>
          </div>
        </AnimateIn>
      </div>
    </section>
  );
}
