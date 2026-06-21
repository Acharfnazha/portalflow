import type { Metadata } from "next";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        background: "var(--pf-surface)",
      }}
    >
      {/* Left brand panel */}
      <div
        style={{
          width: 480,
          flexShrink: 0,
          background: "linear-gradient(160deg, #4f46e5 0%, #7c3aed 100%)",
          padding: "48px 48px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          color: "#fff",
        }}
        aria-hidden
        className="auth-brand-panel"
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 60 }}>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 9,
                background: "rgba(255,255,255,.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <i className="ti ti-bolt" style={{ fontSize: 18, color: "#fff" }} />
            </div>
            <span style={{ fontSize: 18, fontWeight: 700, letterSpacing: "-.3px" }}>PortalFlow</span>
          </div>

          <h2
            style={{
              fontSize: 28,
              fontWeight: 700,
              lineHeight: 1.25,
              margin: "0 0 16px",
              letterSpacing: "-.5px",
            }}
          >
            The client portal platform agencies trust.
          </h2>
          <p style={{ fontSize: 14, opacity: .8, lineHeight: 1.6, margin: 0 }}>
            Manage clients, track projects, send invoices, and share progress — all in one premium workspace.
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {[
            { icon: "ti-building", text: "Centralized client management" },
            { icon: "ti-receipt",  text: "Professional invoicing & payments" },
            { icon: "ti-share",    text: "Branded client portals" },
          ].map(f => (
            <div key={f.text} style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  background: "rgba(255,255,255,.15)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <i className={`ti ${f.icon}`} style={{ fontSize: 15 }} />
              </div>
              <span style={{ fontSize: 13.5, opacity: .9 }}>{f.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right form area */}
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "32px 24px",
        }}
      >
        {children}
      </div>

      <style>{`
        @media (max-width: 900px) {
          .auth-brand-panel { display: none !important; }
        }
      `}</style>
    </div>
  );
}
