"use client";

import { useState } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { useRef } from "react";

const ease = [0.16, 1, 0.3, 1] as const;

const faqs = [
  {
    q: "Do my clients need to create an account?",
    a: "No. Clients open their portal with a secure magic link — no passwords to manage and nothing to install. They can optionally set a password later if they prefer.",
  },
  {
    q: "Can I use my own brand and domain?",
    a: "Yes. On the Agency plan the portal is fully white-labeled: your logo, your colors, your custom domain (portal.youragency.com) and zero PortalFlow branding anywhere, including emails.",
  },
  {
    q: "How do payments work?",
    a: "Payments are powered by Stripe. Clients pay invoices by card or ACH directly in the portal, and payouts land in your bank account on your normal Stripe schedule.",
  },
  {
    q: "Is it secure and compliant?",
    a: "PortalFlow is SOC 2 Type II, GDPR-ready, and encrypts data in transit and at rest with 256-bit SSL. Agency plans add SSO, granular roles and a full audit log.",
  },
  {
    q: "Can I migrate from another tool?",
    a: "Yes. Import clients and files in bulk, and our team will help you migrate from spreadsheets, Drive or another portal tool during onboarding at no cost.",
  },
  {
    q: "What happens when I cancel?",
    a: "You can cancel anytime, no contracts. Your data stays exportable for 30 days and your clients keep read-only access to anything already shared with them.",
  },
];

export function FAQ() {
  const [open, setOpen] = useState<number | null>(null);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="faq" style={{ padding: "60px 24px 96px" }}>
      <div style={{ maxWidth: 760, margin: "0 auto" }}>
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease }}
          style={{ textAlign: "center" }}
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
            FAQ
          </span>
          <h2
            style={{
              fontFamily: "var(--font-inter-tight)",
              fontWeight: 600,
              fontSize: "clamp(28px, 4vw, 42px)",
              letterSpacing: "-.03em",
              lineHeight: 1.08,
              margin: "14px 0 0",
              color: "var(--pf-text)",
            }}
          >
            Questions, answered.
          </h2>
        </motion.div>

        <div style={{ marginTop: 36, display: "flex", flexDirection: "column", gap: 12 }}>
          {faqs.map((f, i) => (
            <motion.div
              key={f.q}
              initial={{ opacity: 0, y: 16 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, ease, delay: 0.04 + i * 0.04 }}
              style={{
                border: "1px solid var(--pf-line)",
                borderRadius: 14,
                background: "#fff",
                overflow: "hidden",
              }}
            >
              <button
                type="button"
                onClick={() => setOpen(open === i ? null : i)}
                style={{
                  width: "100%",
                  appearance: "none",
                  border: "none",
                  background: "none",
                  font: "inherit",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 16,
                  padding: "18px 20px",
                  textAlign: "left",
                  color: "var(--pf-text)",
                }}
              >
                <span style={{ fontWeight: 600, fontSize: "15.5px" }}>{f.q}</span>
                <span
                  style={{
                    flex: "none",
                    fontSize: 20,
                    color: "var(--pf-accent)",
                    lineHeight: 1,
                    display: "inline-block",
                    transition: "transform .35s cubic-bezier(.16,1,.3,1)",
                    transform: open === i ? "rotate(45deg)" : "none",
                  }}
                >
                  +
                </span>
              </button>
              <AnimatePresence initial={false}>
                {open === i && (
                  <motion.div
                    key="answer"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.42, ease }}
                    style={{ overflow: "hidden" }}
                  >
                    <p
                      style={{
                        margin: 0,
                        padding: "0 20px 18px",
                        fontSize: "14.5px",
                        lineHeight: 1.6,
                        color: "var(--pf-text-2)",
                      }}
                    >
                      {f.a}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
