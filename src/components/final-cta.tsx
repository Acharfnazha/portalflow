"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";

const ease = [0.16, 1, 0.3, 1] as const;

export function FinalCTA() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const [hov1, setHov1] = useState(false);
  const [hov2, setHov2] = useState(false);

  return (
    <section id="final" style={{ padding: "40px 24px 100px" }}>
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8, ease }}
        style={{
          maxWidth: 1000,
          margin: "0 auto",
          position: "relative",
          borderRadius: 28,
          overflow: "hidden",
          padding: "70px 32px",
          textAlign: "center",
          background:
            "linear-gradient(135deg, oklch(0.34 0.07 274), oklch(0.28 0.06 296))",
          boxShadow: "0 40px 90px -30px var(--pf-accent-ring)",
        }}
      >
        {/* Radial overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(60% 100% at 80% 0%, oklch(0.62 0.17 296 / .5), transparent 60%)",
            pointerEvents: "none",
          }}
        />

        <div style={{ position: "relative" }}>
          <h2
            style={{
              fontFamily: "var(--font-inter-tight)",
              fontWeight: 600,
              fontSize: "clamp(30px, 4.6vw, 50px)",
              letterSpacing: "-.03em",
              lineHeight: 1.06,
              color: "#fff",
              margin: "0 auto",
              maxWidth: 640,
            }}
          >
            Give your clients the experience
            <br />
            they expect from you.
          </h2>
          <p
            style={{
              color: "rgba(255,255,255,.72)",
              fontSize: 17,
              margin: "18px auto 0",
              maxWidth: 480,
              lineHeight: 1.55,
            }}
          >
            Launch your first branded client portal today. Free forever — no credit card required.
          </p>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 12,
              justifyContent: "center",
              marginTop: 32,
            }}
          >
            <a
              href="/signup"
              onMouseEnter={() => setHov1(true)}
              onMouseLeave={() => setHov1(false)}
              style={{
                textDecoration: "none",
                fontSize: 15,
                fontWeight: 600,
                color: "var(--pf-text)",
                background: "#fff",
                padding: "15px 30px",
                borderRadius: 13,
                boxShadow: "0 10px 28px rgba(0,0,0,.25)",
                transition: "transform .2s cubic-bezier(.16,1,.3,1)",
                transform: hov1 ? "translateY(-2px)" : "none",
              }}
            >
              Start free
            </a>
            <a
              href="mailto:support@portalflow.com"
              onMouseEnter={() => setHov2(true)}
              onMouseLeave={() => setHov2(false)}
              style={{
                textDecoration: "none",
                fontSize: 15,
                fontWeight: 600,
                color: "#fff",
                background: hov2 ? "rgba(255,255,255,.2)" : "rgba(255,255,255,.12)",
                border: "1px solid rgba(255,255,255,.25)",
                padding: "15px 28px",
                borderRadius: 13,
                backdropFilter: "blur(8px)",
                transition: "background .2s",
              }}
            >
              Talk to sales
            </a>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
