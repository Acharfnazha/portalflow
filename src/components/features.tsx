"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";

function AnimateIn({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
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

const features = [
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
        <rect x="3" y="4" width="5" height="16" rx="1.5" />
        <rect x="10" y="4" width="5" height="11" rx="1.5" />
        <rect x="17" y="4" width="4" height="16" rx="1.5" />
      </svg>
    ),
    title: "Projects & tasks",
    desc: "Share milestones, timelines and progress so clients always know what's next.",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
        <rect x="4" y="3" width="16" height="18" rx="2" />
        <path d="M8 8h8M8 12h8M8 16h5" />
      </svg>
    ),
    title: "Invoices",
    desc: "Send branded invoices, track status and get paid — all inside the portal.",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
        <path d="M7 3h7l4 4v14a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" />
        <path d="M14 3v4h4" />
      </svg>
    ),
    title: "Documents & files",
    desc: "A single source of truth for deliverables, assets and shared files.",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
        <path d="M4 17c3-4 5 2 8-1s4-7 8-4" />
        <path d="M5 21h14" />
      </svg>
    ),
    title: "Contracts & e-sign",
    desc: "Legally-binding signatures collected in seconds, with a full audit trail.",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
        <rect x="3" y="5" width="18" height="14" rx="2.5" />
        <path d="M3 10h18" />
      </svg>
    ),
    title: "Payments",
    desc: "Card, ACH and subscriptions powered by Stripe — payouts straight to you.",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
        <path d="M4 5h16v11H9l-4 4z" strokeLinejoin="round" />
      </svg>
    ),
    title: "Messaging",
    desc: "Threaded, on-the-record conversations — no more lost email chains.",
  },
];

export function Features() {
  return (
    <section id="features" style={{ padding: "36px 24px 96px" }}>
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
            Everything in one portal
          </span>
          <h2
            style={{
              fontFamily: "var(--font-inter-tight)",
              fontWeight: 600,
              fontSize: "clamp(30px, 4.4vw, 46px)",
              letterSpacing: "-.03em",
              lineHeight: 1.08,
              margin: "14px auto 0",
              maxWidth: 680,
              color: "var(--pf-text)",
            }}
          >
            One secure home for the entire client relationship.
          </h2>
        </AnimateIn>
      </div>

      <div
        style={{
          maxWidth: 1100,
          margin: "48px auto 0",
          display: "grid",
          gridTemplateColumns: "repeat(3,1fr)",
          gap: 18,
        }}
      >
        {features.map((f, i) => (
          <AnimateIn key={f.title} delay={i * 0.04}>
            <FeatureCard {...f} />
          </AnimateIn>
        ))}
      </div>
    </section>
  );
}

function FeatureCard({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  const [hovered, setHovered] = useHoverState();
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        border: "1px solid var(--pf-line)",
        borderRadius: 18,
        padding: 26,
        background: "#fff",
        transition: "transform .25s cubic-bezier(.16,1,.3,1), box-shadow .25s, border-color .25s",
        transform: hovered ? "translateY(-4px)" : "none",
        boxShadow: hovered ? "0 18px 44px -18px rgba(11,13,18,.2)" : "none",
        borderColor: hovered ? "var(--pf-line-strong)" : "var(--pf-line)",
      }}
    >
      <span
        style={{
          display: "inline-flex",
          width: 44,
          height: 44,
          borderRadius: 12,
          background: "var(--pf-accent-soft)",
          color: "var(--pf-accent)",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 18,
        }}
      >
        {icon}
      </span>
      <h3
        style={{
          fontFamily: "var(--font-inter-tight)",
          fontWeight: 600,
          fontSize: 18,
          letterSpacing: "-.01em",
          margin: "0 0 7px",
          color: "var(--pf-text)",
        }}
      >
        {title}
      </h3>
      <p
        style={{
          margin: 0,
          fontSize: "14.5px",
          lineHeight: 1.55,
          color: "var(--pf-text-2)",
        }}
      >
        {desc}
      </p>
    </div>
  );
}

function useHoverState(): [boolean, (v: boolean) => void] {
  return useState(false);
}
