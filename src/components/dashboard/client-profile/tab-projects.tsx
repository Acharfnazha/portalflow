"use client";

import { motion } from "framer-motion";
import { PROJECT_STATUS_CONFIG, PRIORITY_CONFIG } from "@/lib/projects-data";

// Mock data retained until Projects Module sprint
const PROJECTS: { clientId: string; id: string; name: string; status: string; priority: string; progress: number; deadline: string; tasks: { done: number; total: number }; team: { name: string; color: string; initials: string }[] }[] = [];

interface Props { clientId: string }

function fmt(date: string) {
  return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}
function isOverdue(date: string) {
  return new Date(date) < new Date();
}

export function TabProjects({ clientId }: Props) {
  const projects = PROJECTS.filter(p => p.clientId === clientId);

  return (
    <div>
      {/* Subheader */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <span style={{ fontSize: 13, color: "var(--pf-text-2)" }}>{projects.length} project{projects.length !== 1 ? "s" : ""}</span>
        <button type="button" style={addBtn}>
          <i className="ti ti-plus" aria-hidden="true" style={{ fontSize: 14 }} /> New project
        </button>
      </div>

      {projects.length === 0 && (
        <Empty icon="ti-layout-kanban" text="No projects yet for this client." />
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {projects.map((p, i) => {
          const sc = PROJECT_STATUS_CONFIG[p.status as keyof typeof PROJECT_STATUS_CONFIG] ?? { label: "Unknown", dotColor: "#94a3b8", badgeBg: "#f8fafc", badgeColor: "#475569" };
          const pc = PRIORITY_CONFIG[p.priority as keyof typeof PRIORITY_CONFIG] ?? { label: "—", color: "#94a3b8", icon: "ti-minus" };
          const overdue = p.status !== "completed" && isOverdue(p.deadline);

          return (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.22, delay: i * 0.05 }}
              style={{
                background: "#fff",
                border: "1px solid var(--pf-line)",
                borderRadius: 10,
                padding: "14px 16px",
                cursor: "pointer",
              }}
            >
              {/* Row 1: name + status + priority */}
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                <span style={{ fontFamily: "var(--font-inter-tight)", fontSize: 14, fontWeight: 600, color: "var(--pf-text)", flex: 1 }}>
                  {p.name}
                </span>
                {/* Priority */}
                <span style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 11, color: pc.color }}>
                  <i className={`ti ${pc.icon}`} aria-hidden="true" style={{ fontSize: 12 }} />
                  {pc.label}
                </span>
                {/* Status badge */}
                <span style={{ fontSize: 11, fontWeight: 500, padding: "2px 8px", borderRadius: 99, background: sc.badgeBg, color: sc.badgeColor }}>
                  {sc.label}
                </span>
              </div>

              {/* Row 2: progress bar */}
              <div style={{ marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontSize: 11, color: "var(--pf-text-3)" }}>Progress</span>
                  <span style={{ fontSize: 11, fontWeight: 500, color: "var(--pf-text-2)" }}>{p.progress}%</span>
                </div>
                <div style={{ height: 5, background: "var(--pf-surface-2)", borderRadius: 99, overflow: "hidden" }}>
                  <div
                    style={{
                      height: "100%",
                      width: `${p.progress}%`,
                      background: p.status === "completed" ? "#6366f1" : p.progress >= 70 ? "#22c55e" : p.progress >= 40 ? "#f59e0b" : "#3b82f6",
                      borderRadius: 99,
                      transition: "width .6s ease",
                    }}
                  />
                </div>
              </div>

              {/* Row 3: deadline + tasks + team */}
              <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" as const }}>
                <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: overdue ? "#dc2626" : "var(--pf-text-2)" }}>
                  <i className={`ti ${overdue ? "ti-alert-circle" : "ti-calendar"}`} aria-hidden="true" style={{ fontSize: 13 }} />
                  {fmt(p.deadline)}
                  {overdue && <span style={{ fontWeight: 500 }}>(overdue)</span>}
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "var(--pf-text-2)" }}>
                  <i className="ti ti-circle-check" aria-hidden="true" style={{ fontSize: 13 }} />
                  {p.tasks.done}/{p.tasks.total} tasks
                </span>
                {/* Team avatars */}
                <div style={{ display: "flex", marginLeft: "auto" }}>
                  {(p.team as { name: string; color: string; initials: string }[]).slice(0, 3).map((m, ti: number) => (
                    <div
                      key={ti}
                      title={m.name}
                      style={{
                        width: 22, height: 22, borderRadius: "50%",
                        background: m.color, fontSize: 9, fontWeight: 600,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        border: "2px solid #fff",
                        marginLeft: ti > 0 ? -6 : 0,
                        color: "var(--pf-text)",
                      }}
                    >
                      {m.initials}
                    </div>
                  ))}
                  {p.team.length > 3 && (
                    <div
                      style={{
                        width: 22, height: 22, borderRadius: "50%",
                        background: "var(--pf-surface-2)", fontSize: 9, fontWeight: 500,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        border: "2px solid #fff", marginLeft: -6,
                        color: "var(--pf-text-2)",
                      }}
                    >
                      +{p.team.length - 3}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

const addBtn: React.CSSProperties = {
  display: "flex", alignItems: "center", gap: 6,
  padding: "6px 13px", borderRadius: 8,
  border: "none", background: "#4f46e5",
  color: "#fff", fontSize: 13, fontWeight: 500,
  cursor: "pointer", fontFamily: "var(--font-inter)",
};

function Empty({ icon, text }: { icon: string; text: string }) {
  return (
    <div style={{ textAlign: "center", padding: "40px 0", color: "var(--pf-text-3)" }}>
      <i className={`ti ${icon}`} aria-hidden="true" style={{ fontSize: 32, opacity: 0.35 }} />
      <p style={{ marginTop: 8, fontSize: 13 }}>{text}</p>
    </div>
  );
}
