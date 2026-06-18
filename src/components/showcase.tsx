"use client";

import { useState } from "react";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const ease = [0.16, 1, 0.3, 1] as const;

const tabs = ["Overview", "Clients", "Revenue", "Activity"] as const;
type Tab = (typeof tabs)[number];

export function Showcase() {
  const [active, setActive] = useState<Tab>("Overview");
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section
      id="showcase"
      style={{
        padding: "96px 24px",
        background: "linear-gradient(180deg,#fff,var(--pf-surface))",
        borderTop: "1px solid var(--pf-line)",
        borderBottom: "1px solid var(--pf-line)",
      }}
    >
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
            The operator view
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
            Run your whole book of business from one dashboard.
          </h2>
        </motion.div>
      </div>

      {/* Tab switcher */}
      <div style={{ maxWidth: 1000, margin: "36px auto 0", display: "flex", justifyContent: "center" }}>
        <div
          style={{
            display: "inline-flex",
            gap: 4,
            padding: 5,
            background: "var(--pf-surface-2)",
            borderRadius: 14,
            border: "1px solid var(--pf-line)",
          }}
        >
          {tabs.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setActive(t)}
              style={{
                appearance: "none",
                border: "none",
                cursor: "pointer",
                fontFamily: "var(--font-inter)",
                fontWeight: 600,
                fontSize: 14,
                padding: "9px 18px",
                borderRadius: 10,
                transition: "all .25s cubic-bezier(.16,1,.3,1)",
                background: active === t ? "#fff" : "transparent",
                color: active === t ? "var(--pf-text)" : "var(--pf-text-3)",
                boxShadow:
                  active === t
                    ? "0 1px 2px rgba(11,13,18,.06), 0 3px 10px rgba(11,13,18,.07)"
                    : "none",
              }}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Panel container */}
      <div
        style={{
          position: "relative",
          maxWidth: 1000,
          margin: "26px auto 0",
          borderRadius: 18,
          border: "1px solid var(--pf-line)",
          background: "#fff",
          boxShadow: "0 30px 70px -28px rgba(11,13,18,.26)",
          minHeight: 420,
          overflow: "hidden",
        }}
      >
        <Panel visible={active === "Overview"}>
          <OverviewPanel />
        </Panel>
        <Panel visible={active === "Clients"}>
          <ClientsPanel />
        </Panel>
        <Panel visible={active === "Revenue"}>
          <RevenuePanel />
        </Panel>
        <Panel visible={active === "Activity"}>
          <ActivityPanel />
        </Panel>
      </div>
    </section>
  );
}

function Panel({ visible, children }: { visible: boolean; children: React.ReactNode }) {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        padding: 28,
        transition: "opacity .45s cubic-bezier(.16,1,.3,1), transform .45s cubic-bezier(.16,1,.3,1)",
        opacity: visible ? 1 : 0,
        transform: visible ? "none" : "translateY(10px)",
        pointerEvents: visible ? "auto" : "none",
      }}
    >
      {children}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ border: "1px solid var(--pf-line)", borderRadius: 14, padding: 16 }}>
      <div style={{ fontSize: 12, color: "var(--pf-text-3)" }}>{label}</div>
      <div
        style={{
          fontFamily: "var(--font-inter-tight)",
          fontWeight: 600,
          fontSize: 24,
          marginTop: 5,
        }}
      >
        {value}
      </div>
    </div>
  );
}

function OverviewPanel() {
  return (
    <>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 18 }}>
        <StatCard label="MRR" value="$48.2k" />
        <StatCard label="Active clients" value="42" />
        <StatCard label="Collected" value="96%" />
        <StatCard label="Avg. sign time" value="2.4h" />
      </div>
      <div style={{ border: "1px solid var(--pf-line)", borderRadius: 14, padding: 20 }}>
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 16 }}>Revenue, last 6 months</div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 14, height: 150 }}>
          {[40, 55, 48, 70, 82, 100].map((h, i) => (
            <div
              key={i}
              style={{
                flex: 1,
                height: `${h}%`,
                background:
                  i >= 4
                    ? "linear-gradient(180deg, var(--pf-accent), var(--pf-accent-2))"
                    : "var(--pf-surface-2)",
                borderRadius: "7px 7px 3px 3px",
              }}
            />
          ))}
        </div>
      </div>
    </>
  );
}

const clients = [
  {
    initials: "AC",
    name: "Acme Co",
    sub: "3 projects · $12,400 lifetime",
    status: "Active",
    statusColor: "oklch(0.55 0.14 150)",
    statusBg: "oklch(0.95 0.05 150)",
    avatarBg: "oklch(0.92 0.06 30)",
    avatarColor: "oklch(0.5 0.14 30)",
  },
  {
    initials: "MB",
    name: "Meridian Bank",
    sub: "1 project · $40,000 lifetime",
    status: "Awaiting sign",
    statusColor: "var(--pf-accent)",
    statusBg: "var(--pf-accent-soft)",
    avatarBg: "oklch(0.92 0.06 264)",
    avatarColor: "oklch(0.5 0.14 264)",
  },
  {
    initials: "FB",
    name: "Foundry & Bloom",
    sub: "5 projects · $28,900 lifetime",
    status: "Active",
    statusColor: "oklch(0.55 0.14 150)",
    statusBg: "oklch(0.95 0.05 150)",
    avatarBg: "oklch(0.92 0.06 150)",
    avatarColor: "oklch(0.5 0.14 150)",
  },
  {
    initials: "QT",
    name: "Quanta",
    sub: "2 projects · $9,100 lifetime",
    status: "Invited",
    statusColor: "var(--pf-text-3)",
    statusBg: "var(--pf-surface-2)",
    avatarBg: "oklch(0.92 0.06 90)",
    avatarColor: "oklch(0.48 0.12 90)",
  },
];

function ClientsPanel() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {clients.map((c) => (
        <div
          key={c.name}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "15px 18px",
            border: "1px solid var(--pf-line)",
            borderRadius: 13,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: c.avatarBg,
                color: c.avatarColor,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 700,
                fontSize: 14,
              }}
            >
              {c.initials}
            </span>
            <div>
              <div style={{ fontWeight: 600, fontSize: "14.5px" }}>{c.name}</div>
              <div style={{ fontSize: 12, color: "var(--pf-text-3)" }}>{c.sub}</div>
            </div>
          </div>
          <span
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: c.statusColor,
              background: c.statusBg,
              padding: "5px 11px",
              borderRadius: 8,
            }}
          >
            {c.status}
          </span>
        </div>
      ))}
    </div>
  );
}

function RevenuePanel() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 16, height: "100%" }}>
      <div style={{ border: "1px solid var(--pf-line)", borderRadius: 14, padding: 20 }}>
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Collected this quarter</div>
        <div
          style={{
            fontFamily: "var(--font-inter-tight)",
            fontWeight: 600,
            fontSize: 34,
            letterSpacing: "-.02em",
          }}
        >
          $142,800
        </div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 9, height: 130, marginTop: 24 }}>
          {[55, 72, 60, 88, 76, 96].map((h, i) => (
            <div
              key={i}
              style={{
                flex: 1,
                height: `${h}%`,
                background:
                  i === 3 || i === 5
                    ? "linear-gradient(180deg, var(--pf-accent), var(--pf-accent-2))"
                    : "var(--pf-surface-2)",
                borderRadius: 6,
              }}
            />
          ))}
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ border: "1px solid var(--pf-line)", borderRadius: 14, padding: 16 }}>
          <div style={{ fontSize: 12, color: "var(--pf-text-3)" }}>Outstanding</div>
          <div
            style={{
              fontFamily: "var(--font-inter-tight)",
              fontWeight: 600,
              fontSize: 22,
              marginTop: 5,
            }}
          >
            $8,250
          </div>
        </div>
        <div style={{ border: "1px solid var(--pf-line)", borderRadius: 14, padding: 16 }}>
          <div style={{ fontSize: 12, color: "var(--pf-text-3)" }}>Avg. days to pay</div>
          <div
            style={{
              fontFamily: "var(--font-inter-tight)",
              fontWeight: 600,
              fontSize: 22,
              marginTop: 5,
            }}
          >
            3.1
          </div>
        </div>
        <div
          style={{
            border: "1px solid var(--pf-accent-ring)",
            borderRadius: 14,
            padding: 16,
            background: "var(--pf-accent-soft)",
          }}
        >
          <div style={{ fontSize: 12, color: "var(--pf-accent)", fontWeight: 600 }}>Payout next</div>
          <div
            style={{
              fontFamily: "var(--font-inter-tight)",
              fontWeight: 600,
              fontSize: 22,
              marginTop: 5,
            }}
          >
            $15,400
          </div>
        </div>
      </div>
    </div>
  );
}

const activity = [
  {
    dot: "var(--pf-accent)",
    text: (
      <>
        <b>Acme Co</b> paid invoice #1043 — $3,200
      </>
    ),
    time: "2 min ago",
  },
  {
    dot: "oklch(0.6 0.14 150)",
    text: (
      <>
        <b>Meridian Bank</b> signed the MSA contract
      </>
    ),
    time: "1 hr ago",
  },
  {
    dot: "var(--pf-text-3)",
    text: (
      <>
        <b>Foundry & Bloom</b> uploaded 6 files to Brand Kit
      </>
    ),
    time: "3 hr ago",
  },
  {
    dot: "var(--pf-text-3)",
    text: (
      <>
        You sent a new proposal to <b>Quanta</b>
      </>
    ),
    time: "Yesterday",
  },
  {
    dot: "var(--pf-text-3)",
    text: (
      <>
        <b>Halcyon</b> left a comment on Homepage v3
      </>
    ),
    time: "Yesterday",
  },
];

function ActivityPanel() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {activity.map((a, i) => (
        <div
          key={i}
          style={{
            display: "flex",
            gap: 14,
            padding: "14px 6px",
            borderBottom: i < activity.length - 1 ? "1px solid var(--pf-line)" : "none",
          }}
        >
          <span
            style={{
              width: 9,
              height: 9,
              borderRadius: "50%",
              background: a.dot,
              marginTop: 5,
              flex: "none",
            }}
          />
          <div>
            <div style={{ fontSize: 14 }}>{a.text}</div>
            <div
              style={{
                fontSize: 12,
                color: "var(--pf-text-3)",
                fontFamily: "var(--font-jetbrains-mono)",
              }}
            >
              {a.time}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
