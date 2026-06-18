import { use } from "react";
import { PfBadge } from "@/components/ui/pf-badge";
import { PROJECT_STATUS_CONFIG } from "@/lib/projects-data";

export default function PortalProjectsPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token: _token } = use(params);

  const mockProjects = [
    { id: 1, name: "Brand Refresh & Design System", status: "review" as const, progress: 68, deadline: "Feb 28, 2025" },
    { id: 2, name: "E-commerce Platform Migration",  status: "active" as const,   progress: 44, deadline: "Mar 31, 2025" },
    { id: 3, name: "Patient Portal Redesign",         status: "completed" as const,progress: 100, deadline: "Jan 31, 2025" },
  ];

  return (
    <div style={{ padding: 28 }}>
      <h1 style={{ fontSize: 20, fontWeight: 700, color: "var(--pf-text)", margin: "0 0 20px", letterSpacing: "-.3px" }}>
        Your Projects
      </h1>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {mockProjects.map(p => {
          const sc = PROJECT_STATUS_CONFIG[p.status];
          const progressColor =
            p.progress >= 70 ? "#16a34a" : p.progress >= 40 ? "#d97706" : "#4f46e5";
          return (
            <div
              key={p.id}
              style={{
                background: "#fff",
                border: "1px solid var(--pf-line)",
                borderRadius: 12,
                padding: "18px 20px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                <h2 style={{ fontSize: 15, fontWeight: 600, color: "var(--pf-text)", margin: 0 }}>{p.name}</h2>
                <PfBadge dot dotColor={sc.dotColor} style={{ background: sc.badgeBg, color: sc.badgeColor }}>{sc.label}</PfBadge>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ fontSize: 12.5, color: "var(--pf-text-3)" }}>Progress</span>
                <span style={{ fontSize: 12.5, fontWeight: 600, color: progressColor }}>{p.progress}%</span>
              </div>
              <div style={{ height: 6, borderRadius: 99, background: "var(--pf-surface-2)", overflow: "hidden", marginBottom: 10 }}>
                <div style={{ height: "100%", width: `${p.progress}%`, background: progressColor, borderRadius: 99, transition: "width .6s ease" }} />
              </div>
              <span style={{ fontSize: 12, color: "var(--pf-text-3)" }}>
                <i className="ti ti-calendar" aria-hidden style={{ fontSize: 12, marginRight: 4 }} />
                Due {p.deadline}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
