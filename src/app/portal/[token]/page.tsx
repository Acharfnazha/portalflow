import { use } from "react";

export default function PortalHomePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token: _token } = use(params);

  const stats = [
    { icon: "ti-briefcase",  label: "Active projects",  value: "3",      color: "#4f46e5", bg: "#eef2ff" },
    { icon: "ti-receipt",    label: "Open invoices",    value: "2",      color: "#d97706", bg: "#fffbeb" },
    { icon: "ti-folder",     label: "Documents",        value: "14",     color: "#16a34a", bg: "#f0fdf4" },
    { icon: "ti-check",      label: "Completed projects",value: "7",     color: "#0f766e", bg: "#f0fdfa" },
  ];

  return (
    <div style={{ padding: 28 }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--pf-text)", margin: "0 0 4px", letterSpacing: "-.4px" }}>
          Welcome back, Nexus Digital
        </h1>
        <p style={{ margin: 0, fontSize: 13.5, color: "var(--pf-text-2)" }}>
          Here&apos;s an overview of your current work with Antigravity Studio.
        </p>
      </div>

      {/* KPI cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 24 }}>
        {stats.map(s => (
          <div
            key={s.label}
            style={{
              background: "#fff",
              border: "1px solid var(--pf-line)",
              borderRadius: 12,
              padding: "18px 20px",
              display: "flex",
              alignItems: "flex-start",
              gap: 14,
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                background: s.bg,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <i className={`ti ${s.icon}`} aria-hidden style={{ fontSize: 19, color: s.color }} />
            </div>
            <div>
              <p style={{ margin: "0 0 2px", fontSize: 12, color: "var(--pf-text-3)" }}>{s.label}</p>
              <p style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "var(--pf-text)", lineHeight: 1.1, fontFamily: "var(--font-inter-tight)" }}>
                {s.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Recent activity */}
      <div
        style={{
          background: "#fff",
          border: "1px solid var(--pf-line)",
          borderRadius: 12,
          overflow: "hidden",
        }}
      >
        <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--pf-line)" }}>
          <h2 style={{ fontSize: 15, fontWeight: 600, color: "var(--pf-text)", margin: 0 }}>Recent updates</h2>
        </div>
        {[
          { icon: "ti-briefcase", color: "#4f46e5", bg: "#eef2ff", text: "Brand Refresh project moved to In Review", time: "2h ago" },
          { icon: "ti-receipt",   color: "#d97706", bg: "#fffbeb", text: "Invoice INV-0003 sent — $5,120 due Feb 15", time: "1d ago" },
          { icon: "ti-folder",    color: "#16a34a", bg: "#f0fdf4", text: "3 new documents uploaded to Brand Refresh", time: "2d ago" },
        ].map((item, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 13,
              padding: "13px 20px",
              borderBottom: i < 2 ? "1px solid var(--pf-line)" : "none",
            }}
          >
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 9,
                background: item.bg,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <i className={`ti ${item.icon}`} aria-hidden style={{ fontSize: 15, color: item.color }} />
            </div>
            <p style={{ margin: 0, fontSize: 13.5, color: "var(--pf-text)", flex: 1 }}>{item.text}</p>
            <span style={{ fontSize: 12, color: "var(--pf-text-3)", flexShrink: 0 }}>{item.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
