"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const ease = [0.16, 1, 0.3, 1] as const;

const steps = [
  {
    num: "STEP 01",
    title: "Create a portal",
    desc: "Spin up a branded portal, drop in your logo and pick your domain.",
  },
  {
    num: "STEP 02",
    title: "Invite your client",
    desc: "One magic link gives them projects, files, invoices and messages.",
  },
  {
    num: "STEP 03",
    title: "Get paid & signed",
    desc: "Collect payments and signatures without a single follow-up email.",
  },
];

export function Workflow() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section style={{ padding: "60px 24px 96px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", textAlign: "center" }}>
        <motion.div
          ref={ref}
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
            How it works
          </span>
          <h2
            style={{
              fontFamily: "var(--font-inter-tight)",
              fontWeight: 600,
              fontSize: "clamp(30px, 4.4vw, 46px)",
              letterSpacing: "-.03em",
              lineHeight: 1.08,
              margin: "14px auto 0",
              maxWidth: 600,
              color: "var(--pf-text)",
            }}
          >
            Live in minutes, not weeks.
          </h2>
        </motion.div>
      </div>

      <div
        style={{
          maxWidth: 1000,
          margin: "46px auto 0",
          display: "grid",
          gridTemplateColumns: "repeat(3,1fr)",
          gap: 20,
        }}
      >
        {steps.map((s, i) => (
          <motion.div
            key={s.num}
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, ease, delay: 0.08 + i * 0.06 }}
            style={{
              border: "1px solid var(--pf-line)",
              borderRadius: 18,
              padding: 28,
              background: "#fff",
            }}
          >
            <div
              style={{
                fontFamily: "var(--font-jetbrains-mono)",
                fontSize: 13,
                fontWeight: 600,
                color: "var(--pf-accent)",
              }}
            >
              {s.num}
            </div>
            <h3
              style={{
                fontFamily: "var(--font-inter-tight)",
                fontWeight: 600,
                fontSize: 20,
                letterSpacing: "-.01em",
                margin: "12px 0 7px",
                color: "var(--pf-text)",
              }}
            >
              {s.title}
            </h3>
            <p
              style={{
                margin: 0,
                fontSize: "14.5px",
                lineHeight: 1.55,
                color: "var(--pf-text-2)",
              }}
            >
              {s.desc}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
