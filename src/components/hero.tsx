"use client";

import { motion } from "framer-motion";

const ease = [0.16, 1, 0.3, 1] as const;

function FadeUp({
  children,
  delay = 0,
  style,
}: {
  children: React.ReactNode;
  delay?: number;
  style?: React.CSSProperties;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.9, ease, delay }}
      style={style}
    >
      {children}
    </motion.div>
  );
}

export function Hero() {
  return (
    <header
      id="top"
      style={{
        position: "relative",
        padding: "84px 24px 56px",
        textAlign: "center",
      }}
    >
      <div style={{ maxWidth: 880, margin: "0 auto" }}>
        {/* Badge */}
        <FadeUp delay={0}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 9,
              padding: "6px 14px 6px 8px",
              border: "1px solid var(--pf-line-strong)",
              borderRadius: 999,
              background: "rgba(255,255,255,.7)",
              backdropFilter: "blur(8px)",
              fontSize: 13,
              color: "var(--pf-text-2)",
              fontWeight: 500,
            }}
          >
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                background: "var(--pf-accent-soft)",
                color: "var(--pf-accent)",
                fontWeight: 600,
                fontSize: "11.5px",
                letterSpacing: ".02em",
                padding: "3px 9px",
                borderRadius: 999,
              }}
            >
              NEW
            </span>
            Embedded payments &amp; e-sign are live
            <span style={{ color: "var(--pf-text-3)" }}>→</span>
          </div>
        </FadeUp>

        {/* Headline */}
        <FadeUp delay={0.06}>
          <h1
            style={{
              fontFamily: "var(--font-inter-tight)",
              fontWeight: 600,
              fontSize: "clamp(40px, 6.4vw, 72px)",
              lineHeight: 1.02,
              letterSpacing: "-.035em",
              margin: "22px 0 0",
              color: "var(--pf-text)",
            }}
          >
            Client portals that make
            <br />
            you look{" "}
            <span
              style={{
                background: "linear-gradient(120deg, var(--pf-accent), var(--pf-accent-2))",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
              }}
            >
              enterprise.
            </span>
          </h1>
        </FadeUp>

        {/* Subheading */}
        <FadeUp delay={0.14}>
          <p
            style={{
              maxWidth: 580,
              margin: "22px auto 0",
              fontSize: "clamp(16px, 2vw, 19px)",
              lineHeight: 1.6,
              color: "var(--pf-text-2)",
            }}
          >
            Give every client one secure, beautifully branded place for projects, invoices, documents,
            contracts, payments and messaging. Stop chasing email threads.
          </p>
        </FadeUp>

        {/* CTAs */}
        <FadeUp delay={0.22}>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 12,
              justifyContent: "center",
              marginTop: 30,
            }}
          >
            <a
              href="/signup"
              style={{
                textDecoration: "none",
                fontSize: 15,
                fontWeight: 600,
                color: "#fff",
                background: "linear-gradient(140deg, var(--pf-accent), var(--pf-accent-2))",
                padding: "14px 26px",
                borderRadius: 13,
                boxShadow: "0 8px 24px var(--pf-accent-ring)",
                transition: "transform .2s cubic-bezier(.16,1,.3,1), box-shadow .2s cubic-bezier(.16,1,.3,1)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 14px 34px var(--pf-accent-ring)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "none";
                e.currentTarget.style.boxShadow = "0 8px 24px var(--pf-accent-ring)";
              }}
            >
              Start free
            </a>
            <a
              href="#showcase"
              style={{
                textDecoration: "none",
                fontSize: 15,
                fontWeight: 600,
                color: "var(--pf-text)",
                background: "#fff",
                border: "1px solid var(--pf-line-strong)",
                padding: "14px 24px",
                borderRadius: 13,
                boxShadow: "0 1px 2px rgba(11,13,18,.04)",
                transition: "transform .2s cubic-bezier(.16,1,.3,1), border-color .2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.borderColor = "var(--pf-text-3)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "none";
                e.currentTarget.style.borderColor = "var(--pf-line-strong)";
              }}
            >
              See it live →
            </a>
          </div>
        </FadeUp>

        {/* Fine print */}
        <FadeUp delay={0.3}>
          <p
            style={{
              marginTop: 18,
              fontSize: 13,
              color: "var(--pf-text-3)",
              fontFamily: "var(--font-jetbrains-mono)",
            }}
          >
            No credit card · Free forever plan · Setup in minutes
          </p>
        </FadeUp>
      </div>

      {/* Product Mock */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.1, ease, delay: 0.34 }}
        style={{ position: "relative", maxWidth: 1080, margin: "54px auto 0" }}
      >
        {/* Glow behind mock */}
        <div
          style={{
            position: "absolute",
            inset: "-6% 8% auto",
            height: "60%",
            background: "radial-gradient(60% 100% at 50% 0%, var(--pf-accent-soft), transparent 70%)",
            filter: "blur(20px)",
            zIndex: 0,
          }}
        />

        {/* Browser chrome */}
        <div
          style={{
            position: "relative",
            zIndex: 1,
            borderRadius: 18,
            border: "1px solid var(--pf-line)",
            background: "#fff",
            boxShadow: "0 30px 70px -22px rgba(11,13,18,.28), 0 2px 6px rgba(11,13,18,.05)",
            overflow: "hidden",
          }}
        >
          {/* Window bar */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "13px 16px",
              borderBottom: "1px solid var(--pf-line)",
              background: "var(--pf-surface)",
            }}
          >
            <span style={{ width: 11, height: 11, borderRadius: "50%", background: "#FF5F57" }} />
            <span style={{ width: 11, height: 11, borderRadius: "50%", background: "#FEBC2E" }} />
            <span style={{ width: 11, height: 11, borderRadius: "50%", background: "#28C840" }} />
            <span
              style={{
                marginLeft: 14,
                fontSize: 12,
                fontFamily: "var(--font-jetbrains-mono)",
                color: "var(--pf-text-3)",
                background: "#fff",
                border: "1px solid var(--pf-line)",
                padding: "4px 12px",
                borderRadius: 7,
              }}
            >
              app.portalflow.com/northwind-studio
            </span>
          </div>

          {/* App layout */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "200px 1fr",
              minHeight: 380,
            }}
          >
            {/* Sidebar */}
            <aside
              style={{
                borderRight: "1px solid var(--pf-line)",
                padding: "18px 14px",
                background: "var(--pf-surface)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 18 }}>
                <span
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 7,
                    background: "linear-gradient(140deg, var(--pf-accent), var(--pf-accent-2))",
                  }}
                />
                <span style={{ fontWeight: 600, fontSize: 13 }}>Northwind</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {["Dashboard", "Clients", "Invoices", "Documents", "Messages"].map((item) => (
                  <span
                    key={item}
                    style={{
                      fontSize: 13,
                      fontWeight: item === "Dashboard" ? 600 : undefined,
                      color: item === "Dashboard" ? "var(--pf-accent)" : "var(--pf-text-2)",
                      background: item === "Dashboard" ? "var(--pf-accent-soft)" : undefined,
                      padding: "8px 10px",
                      borderRadius: 9,
                    }}
                  >
                    {item}
                  </span>
                ))}
              </div>
            </aside>

            {/* Main area */}
            <main style={{ padding: 22 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 18,
                }}
              >
                <div>
                  <div
                    style={{
                      fontFamily: "var(--font-inter-tight)",
                      fontWeight: 600,
                      fontSize: 18,
                      letterSpacing: "-.01em",
                    }}
                  >
                    Good morning, Maya
                  </div>
                  <div style={{ fontSize: "12.5px", color: "var(--pf-text-3)" }}>
                    4 active clients · 2 invoices due
                  </div>
                </div>
                <span
                  style={{
                    fontSize: "12.5px",
                    fontWeight: 600,
                    color: "#fff",
                    background: "linear-gradient(140deg, var(--pf-accent), var(--pf-accent-2))",
                    padding: "8px 14px",
                    borderRadius: 10,
                  }}
                >
                  + New portal
                </span>
              </div>

              {/* Stat cards */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3,1fr)",
                  gap: 12,
                  marginBottom: 16,
                }}
              >
                <div
                  style={{
                    border: "1px solid var(--pf-line)",
                    borderRadius: 13,
                    padding: 14,
                    background: "#fff",
                  }}
                >
                  <div style={{ fontSize: "11.5px", color: "var(--pf-text-3)", fontWeight: 500 }}>
                    Revenue (mo)
                  </div>
                  <div
                    style={{
                      fontFamily: "var(--font-inter-tight)",
                      fontWeight: 600,
                      fontSize: 22,
                      marginTop: 4,
                    }}
                  >
                    $48,250
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: "oklch(0.62 0.14 150)",
                      fontWeight: 600,
                      marginTop: 2,
                    }}
                  >
                    ↑ 18%
                  </div>
                </div>
                <div
                  style={{
                    border: "1px solid var(--pf-line)",
                    borderRadius: 13,
                    padding: 14,
                    background: "#fff",
                  }}
                >
                  <div style={{ fontSize: "11.5px", color: "var(--pf-text-3)", fontWeight: 500 }}>
                    Open projects
                  </div>
                  <div
                    style={{
                      fontFamily: "var(--font-inter-tight)",
                      fontWeight: 600,
                      fontSize: 22,
                      marginTop: 4,
                    }}
                  >
                    12
                  </div>
                  <div style={{ fontSize: 11, color: "var(--pf-text-3)", fontWeight: 600, marginTop: 2 }}>
                    3 due this week
                  </div>
                </div>
                <div
                  style={{
                    border: "1px solid var(--pf-line)",
                    borderRadius: 13,
                    padding: 14,
                    background: "#fff",
                  }}
                >
                  <div style={{ fontSize: "11.5px", color: "var(--pf-text-3)", fontWeight: 500 }}>
                    Awaiting sign
                  </div>
                  <div
                    style={{
                      fontFamily: "var(--font-inter-tight)",
                      fontWeight: 600,
                      fontSize: 22,
                      marginTop: 4,
                    }}
                  >
                    3
                  </div>
                  <div style={{ fontSize: 11, color: "var(--pf-accent)", fontWeight: 600, marginTop: 2 }}>
                    2 contracts
                  </div>
                </div>
              </div>

              {/* Bar chart */}
              <div
                style={{
                  border: "1px solid var(--pf-line)",
                  borderRadius: 13,
                  padding: 16,
                  background: "#fff",
                }}
              >
                <div style={{ display: "flex", alignItems: "flex-end", gap: 10, height: 96 }}>
                  {[46, 62, 54, 78, 70, 92].map((h, i) => (
                    <div
                      key={i}
                      style={{
                        flex: 1,
                        height: `${h}%`,
                        background:
                          i >= 4
                            ? "linear-gradient(180deg, var(--pf-accent), var(--pf-accent-2))"
                            : "var(--pf-surface-2)",
                        borderRadius: "6px 6px 3px 3px",
                      }}
                    />
                  ))}
                </div>
              </div>
            </main>
          </div>
        </div>

        {/* Floating pill 1 */}
        <div
          className="animate-floaty"
          style={{
            position: "absolute",
            left: "-3%",
            top: "36%",
            zIndex: 2,
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "11px 15px",
            borderRadius: 14,
            background: "rgba(255,255,255,.72)",
            backdropFilter: "blur(14px)",
            border: "1px solid rgba(255,255,255,.8)",
            boxShadow: "0 16px 40px -10px rgba(11,13,18,.22)",
          }}
        >
          <span
            style={{
              width: 30,
              height: 30,
              borderRadius: 9,
              background: "oklch(0.95 0.05 150)",
              color: "oklch(0.55 0.14 150)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 700,
            }}
          >
            $
          </span>
          <div style={{ textAlign: "left" }}>
            <div style={{ fontSize: "12.5px", fontWeight: 600 }}>Invoice paid</div>
            <div style={{ fontSize: 11, color: "var(--pf-text-3)" }}>$3,200 · just now</div>
          </div>
        </div>

        {/* Floating pill 2 */}
        <div
          className="animate-floaty2"
          style={{
            position: "absolute",
            right: "-2%",
            top: "60%",
            zIndex: 2,
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "11px 15px",
            borderRadius: 14,
            background: "rgba(255,255,255,.72)",
            backdropFilter: "blur(14px)",
            border: "1px solid rgba(255,255,255,.8)",
            boxShadow: "0 16px 40px -10px rgba(11,13,18,.22)",
          }}
        >
          <span
            style={{
              width: 30,
              height: 30,
              borderRadius: 9,
              background: "var(--pf-accent-soft)",
              color: "var(--pf-accent)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 700,
            }}
          >
            ✓
          </span>
          <div style={{ textAlign: "left" }}>
            <div style={{ fontSize: "12.5px", fontWeight: 600 }}>Contract signed</div>
            <div style={{ fontSize: 11, color: "var(--pf-text-3)" }}>MSA · Acme Co</div>
          </div>
        </div>
      </motion.div>
    </header>
  );
}
