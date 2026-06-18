"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const ease = [0.16, 1, 0.3, 1] as const;

export function Testimonials() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section
      style={{
        padding: "60px 24px 96px",
        background: "var(--pf-surface)",
        borderTop: "1px solid var(--pf-line)",
        borderBottom: "1px solid var(--pf-line)",
      }}
    >
      <div
        ref={ref}
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "1.3fr 1fr",
          gap: 20,
        }}
      >
        {/* Featured */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease }}
          style={{
            gridRow: "span 2",
            border: "1px solid var(--pf-line)",
            borderRadius: 20,
            padding: 36,
            background: "#fff",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            boxShadow: "0 18px 44px -24px rgba(11,13,18,.2)",
          }}
        >
          <p
            style={{
              fontFamily: "var(--font-inter-tight)",
              fontWeight: 500,
              fontSize: "clamp(20px, 2.6vw, 28px)",
              lineHeight: 1.35,
              letterSpacing: "-.015em",
              margin: 0,
              color: "var(--pf-text)",
            }}
          >
            &ldquo;PortalFlow made our 6-person studio look like a 60-person agency. Clients stopped
            emailing and started{" "}
            <span style={{ color: "var(--pf-accent)" }}>paying on time</span>.&rdquo;
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: 13, marginTop: 30 }}>
            <span
              style={{
                width: 46,
                height: 46,
                borderRadius: "50%",
                background: "oklch(0.92 0.06 264)",
                color: "oklch(0.5 0.14 264)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 700,
              }}
            >
              MR
            </span>
            <div>
              <div style={{ fontWeight: 600, fontSize: 15 }}>Maya Rao</div>
              <div style={{ fontSize: 13, color: "var(--pf-text-3)" }}>Founder, Northwind Studio</div>
            </div>
          </div>
        </motion.div>

        {/* Card 2 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease, delay: 0.08 }}
          style={{
            border: "1px solid var(--pf-line)",
            borderRadius: 20,
            padding: 28,
            background: "#fff",
          }}
        >
          <p
            style={{
              fontSize: 16,
              lineHeight: 1.55,
              margin: "0 0 20px",
              color: "var(--pf-text)",
            }}
          >
            &ldquo;We cut our admin time by 40%. Onboarding a client now takes two minutes.&rdquo;
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span
              style={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                background: "oklch(0.92 0.06 30)",
                color: "oklch(0.5 0.14 30)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 700,
                fontSize: 14,
              }}
            >
              JL
            </span>
            <div>
              <div style={{ fontWeight: 600, fontSize: 14 }}>James Liu</div>
              <div style={{ fontSize: "12.5px", color: "var(--pf-text-3)" }}>
                Partner, Meridian Consulting
              </div>
            </div>
          </div>
        </motion.div>

        {/* Card 3 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease, delay: 0.14 }}
          style={{
            border: "1px solid var(--pf-line)",
            borderRadius: 20,
            padding: 28,
            background: "#fff",
          }}
        >
          <p
            style={{
              fontSize: 16,
              lineHeight: 1.55,
              margin: "0 0 20px",
              color: "var(--pf-text)",
            }}
          >
            &ldquo;The white-label portal is the reason we win bigger retainers now.&rdquo;
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span
              style={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                background: "oklch(0.92 0.06 150)",
                color: "oklch(0.5 0.14 150)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 700,
                fontSize: 14,
              }}
            >
              SK
            </span>
            <div>
              <div style={{ fontWeight: 600, fontSize: 14 }}>Sofia Khan</div>
              <div style={{ fontSize: "12.5px", color: "var(--pf-text-3)" }}>
                CEO, Foundry &amp; Bloom
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
