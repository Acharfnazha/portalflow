"use client";

import { useState } from "react";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const ease = [0.16, 1, 0.3, 1] as const;

const starterFeatures = [
  { text: "Up to 2 client portals", included: true },
  { text: "Projects, files & messaging", included: true },
  { text: "Invoices & payments", included: true },
  { text: "PortalFlow branding", included: false },
];

const studioFeatures = [
  { text: "Unlimited client portals", bold: true },
  { text: "Contracts & e-signatures" },
  { text: "Remove PortalFlow branding" },
  { text: "Up to 5 team members" },
];

const agencyFeatures = [
  { text: "Custom domain white-label", bold: true },
  { text: "Unlimited team members" },
  { text: "SSO, roles & audit log" },
  { text: "Priority support & onboarding" },
];

export function Pricing() {
  const [annual, setAnnual] = useState(true);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  const studio = annual ? "23" : "29";
  const agency = annual ? "79" : "99";
  const period = annual ? "/mo, billed yearly" : "/mo";

  const segBase: React.CSSProperties = {
    appearance: "none",
    border: "none",
    cursor: "pointer",
    fontFamily: "var(--font-inter)",
    fontWeight: 600,
    fontSize: 14,
    padding: "8px 16px",
    borderRadius: 9,
    transition: "all .25s cubic-bezier(.16,1,.3,1)",
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
  };

  return (
    <section id="pricing" style={{ padding: "96px 24px" }}>
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
            Pricing
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
            Simple pricing that scales with your clients.
          </h2>

          {/* Toggle */}
          <div
            style={{
              display: "inline-flex",
              gap: 4,
              padding: 5,
              background: "var(--pf-surface-2)",
              borderRadius: 12,
              border: "1px solid var(--pf-line)",
              marginTop: 26,
            }}
          >
            <button
              type="button"
              onClick={() => setAnnual(false)}
              style={{
                ...segBase,
                background: !annual ? "#fff" : "transparent",
                color: !annual ? "var(--pf-text)" : "var(--pf-text-3)",
                boxShadow: !annual
                  ? "0 1px 2px rgba(11,13,18,.06), 0 2px 8px rgba(11,13,18,.06)"
                  : "none",
              }}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => setAnnual(true)}
              style={{
                ...segBase,
                background: annual ? "#fff" : "transparent",
                color: annual ? "var(--pf-text)" : "var(--pf-text-3)",
                boxShadow: annual
                  ? "0 1px 2px rgba(11,13,18,.06), 0 2px 8px rgba(11,13,18,.06)"
                  : "none",
              }}
            >
              Yearly{" "}
              <span style={{ fontSize: 11, color: "var(--pf-accent)", fontWeight: 700 }}>−20%</span>
            </button>
          </div>
        </motion.div>
      </div>

      <div
        style={{
          maxWidth: 1080,
          margin: "40px auto 0",
          display: "grid",
          gridTemplateColumns: "repeat(3,1fr)",
          gap: 20,
          alignItems: "start",
        }}
      >
        {/* Starter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease, delay: 0.06 }}
          style={{
            border: "1px solid var(--pf-line)",
            borderRadius: 20,
            padding: 30,
            background: "#fff",
          }}
        >
          <div
            style={{
              fontFamily: "var(--font-inter-tight)",
              fontWeight: 600,
              fontSize: 18,
            }}
          >
            Starter
          </div>
          <div style={{ fontSize: "13.5px", color: "var(--pf-text-2)", marginTop: 5 }}>
            For solo freelancers getting started.
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: 4,
              margin: "22px 0 2px",
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-inter-tight)",
                fontWeight: 600,
                fontSize: 42,
                letterSpacing: "-.02em",
              }}
            >
              $0
            </span>
            <span style={{ fontSize: 14, color: "var(--pf-text-3)" }}>/forever</span>
          </div>
          <PricingCta href="#final" variant="outline">
            Start free
          </PricingCta>
          <FeatureList
            items={starterFeatures.map((f) => ({
              text: f.text,
              included: f.included,
            }))}
          />
        </motion.div>

        {/* Studio */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease, delay: 0.1 }}
          style={{
            position: "relative",
            border: "1.5px solid var(--pf-accent-ring)",
            borderRadius: 20,
            padding: 30,
            background: "linear-gradient(180deg, var(--pf-accent-soft), #fff)",
            boxShadow: "0 30px 70px -28px var(--pf-accent-ring)",
          }}
        >
          <span
            style={{
              position: "absolute",
              top: -12,
              left: "50%",
              transform: "translateX(-50%)",
              fontSize: "11.5px",
              fontWeight: 700,
              letterSpacing: ".04em",
              color: "#fff",
              background:
                "linear-gradient(140deg, var(--pf-accent), var(--pf-accent-2))",
              padding: "5px 14px",
              borderRadius: 99,
              boxShadow: "0 6px 16px var(--pf-accent-ring)",
              whiteSpace: "nowrap",
            }}
          >
            MOST POPULAR
          </span>
          <div
            style={{
              fontFamily: "var(--font-inter-tight)",
              fontWeight: 600,
              fontSize: 18,
            }}
          >
            Studio
          </div>
          <div style={{ fontSize: "13.5px", color: "var(--pf-text-2)", marginTop: 5 }}>
            For growing studios &amp; small teams.
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: 4,
              margin: "22px 0 2px",
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-inter-tight)",
                fontWeight: 600,
                fontSize: 42,
                letterSpacing: "-.02em",
              }}
            >
              ${studio}
            </span>
            <span style={{ fontSize: 14, color: "var(--pf-text-3)" }}>{period}</span>
          </div>
          <PricingCta href="#final" variant="primary">
            Start free trial
          </PricingCta>
          <FeatureList
            items={studioFeatures.map((f) => ({
              text: f.text,
              bold: f.bold,
              included: true,
            }))}
          />
        </motion.div>

        {/* Agency */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease, delay: 0.14 }}
          style={{
            border: "1px solid var(--pf-line)",
            borderRadius: 20,
            padding: 30,
            background: "#fff",
          }}
        >
          <div
            style={{
              fontFamily: "var(--font-inter-tight)",
              fontWeight: 600,
              fontSize: 18,
            }}
          >
            Agency
          </div>
          <div style={{ fontSize: "13.5px", color: "var(--pf-text-2)", marginTop: 5 }}>
            White-label for agencies &amp; firms.
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: 4,
              margin: "22px 0 2px",
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-inter-tight)",
                fontWeight: 600,
                fontSize: 42,
                letterSpacing: "-.02em",
              }}
            >
              ${agency}
            </span>
            <span style={{ fontSize: 14, color: "var(--pf-text-3)" }}>{period}</span>
          </div>
          <PricingCta href="#final" variant="outline">
            Talk to sales
          </PricingCta>
          <FeatureList
            items={agencyFeatures.map((f) => ({
              text: f.text,
              bold: f.bold,
              included: true,
            }))}
          />
        </motion.div>
      </div>
    </section>
  );
}

function PricingCta({
  href,
  variant,
  children,
}: {
  href: string;
  variant: "primary" | "outline";
  children: React.ReactNode;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <a
      href={href}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "block",
        textAlign: "center",
        textDecoration: "none",
        fontSize: "14.5px",
        fontWeight: 600,
        padding: 12,
        borderRadius: 12,
        margin: "22px 0",
        transition: "transform .2s cubic-bezier(.16,1,.3,1), box-shadow .2s",
        ...(variant === "primary"
          ? {
              color: "#fff",
              background:
                "linear-gradient(140deg, var(--pf-accent), var(--pf-accent-2))",
              boxShadow: hovered
                ? "0 14px 34px var(--pf-accent-ring)"
                : "0 8px 22px var(--pf-accent-ring)",
              transform: hovered ? "translateY(-2px)" : "none",
            }
          : {
              color: "var(--pf-text)",
              background: "#fff",
              border: `1px solid ${hovered ? "var(--pf-text-3)" : "var(--pf-line-strong)"}`,
            }),
      }}
    >
      {children}
    </a>
  );
}

function FeatureList({
  items,
}: {
  items: { text: string; bold?: boolean; included?: boolean }[];
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 11, fontSize: 14, color: "var(--pf-text-2)" }}>
      {items.map((f) => (
        <div key={f.text} style={{ display: "flex", gap: 9 }}>
          <span style={{ color: f.included === false ? "var(--pf-text-3)" : "var(--pf-accent)" }}>
            {f.included === false ? "−" : "✓"}
          </span>
          {f.bold ? <b style={{ color: "var(--pf-text)" }}>{f.text}</b> : f.text}
        </div>
      ))}
    </div>
  );
}
