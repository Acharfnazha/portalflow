"use client";

import { useState } from "react";
import { Project, PROJECT_STATUS_CONFIG, PRIORITY_CONFIG } from "@/lib/projects-data";

interface Props { project: Project }

function fmtDate(s: string) {
  return new Date(s).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function isOverdue(deadline: string, status: Project["status"]) {
  return status !== "completed" && new Date(deadline) < new Date();
}

export function ProjectCard({ project: p }: Props) {
  const [hovered, setHovered] = useState(false);
  const sc = PROJECT_STATUS_CONFIG[p.status];
  const pc = PRIORITY_CONFIG[p.priority];
  const overdue = isOverdue(p.deadline, p.status);
  const budgetPct = Math.min(100, Math.round((p.spent / p.budget) * 100));

  const progressColor =
    p.status === "completed" ? "#6366f1"
    : p.progress >= 70 ? "#22c55e"
    : p.progress >= 40 ? "#f59e0b"
    : "#3b82f6";

  return (
    <article
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "#fff",
        border: `1px solid ${hovered ? "#c7d2fe" : "var(--pf-line)"}`,
        borderRadius: 12,
        padding: "16px 18px",
        display: "flex", flexDirection: "column", gap: 12,
        cursor: "pointer",
        transition: "border-color .15s, box-shadow .15s",
        boxShadow: hovered ? "0 4px 16px rgba(79,70,229,.08)" : "none",
      }}
    >
      {/* Row 1: Priority + Status */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11.5, color: pc.color, fontWeight: 500 }}>
          <i className={`ti ${pc.icon}`} aria-hidden="true" style={{ fontSize: 13 }} />
          {pc.label} priority
        </span>
        <span
          style={{
            fontSize: 11, fontWeight: 500, padding: "3px 9px", borderRadius: 99,
            background: sc.badgeBg, color: sc.badgeColor,
            display: "flex", alignItems: "center", gap: 5,
          }}
        >
          <span aria-hidden="true" style={{ width: 5, height: 5, borderRadius: "50%", background: sc.dotColor }} />
          {sc.label}
        </span>
      </div>

      {/* Row 2: Title + Client */}
      <div>
        <h3 style={{ fontFamily: "var(--font-inter-tight)", fontSize: 15, fontWeight: 700, color: "var(--pf-text)", margin: "0 0 4px" }}>
          {p.name}
        </h3>
        <span style={{ fontSize: 12, color: "#4f46e5", fontWeight: 500, display: "flex", alignItems: "center", gap: 4 }}>
          <i className="ti ti-building" aria-hidden="true" style={{ fontSize: 12 }} />
          {p.client}
        </span>
      </div>

      {/* Description */}
      <p style={{ fontSize: 12.5, color: "var(--pf-text-2)", lineHeight: 1.6, margin: 0, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const, overflow: "hidden" }}>
        {p.description}
      </p>

      {/* Tags */}
      <div style={{ display: "flex", gap: 5, flexWrap: "wrap" as const }}>
        {p.tags.map(t => (
          <span key={t} style={{ fontSize: 11, padding: "2px 8px", borderRadius: 99, background: "var(--pf-surface-2)", color: "var(--pf-text-2)", border: "1px solid var(--pf-line)" }}>
            {t}
          </span>
        ))}
      </div>

      {/* Progress */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
          <span style={{ fontSize: 11, color: "var(--pf-text-3)" }}>Progress</span>
          <span style={{ fontSize: 11, fontWeight: 600, color: "var(--pf-text-2)" }}>{p.progress}%</span>
        </div>
        <div style={{ height: 5, background: "var(--pf-surface-2)", borderRadius: 99, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${p.progress}%`, background: progressColor, borderRadius: 99, transition: "width .6s ease" }} />
        </div>
      </div>

      {/* Divider */}
      <div aria-hidden="true" style={{ height: 1, background: "var(--pf-line)" }} />

      {/* Footer row 1: Deadline + Tasks */}
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: overdue ? "#dc2626" : "var(--pf-text-2)", fontWeight: overdue ? 500 : 400 }}>
          <i className={`ti ${overdue ? "ti-alert-triangle" : "ti-calendar-event"}`} aria-hidden="true" style={{ fontSize: 13 }} />
          {fmtDate(p.deadline)}
          {overdue && <span>· overdue</span>}
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "var(--pf-text-2)" }}>
          <i className="ti ti-circle-check" aria-hidden="true" style={{ fontSize: 13 }} />
          {p.tasks.done}/{p.tasks.total}
        </span>
      </div>

      {/* Footer row 2: Team + Budget */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        {/* Stacked avatars */}
        <div style={{ display: "flex" }}>
          {p.team.slice(0, 4).map((m, i) => (
            <div
              key={i}
              title={m.name}
              style={{
                width: 24, height: 24, borderRadius: "50%",
                background: m.color, fontSize: 9, fontWeight: 600,
                display: "flex", alignItems: "center", justifyContent: "center",
                border: "2px solid #fff",
                marginLeft: i > 0 ? -7 : 0,
                color: "var(--pf-text)",
              }}
            >
              {m.initials}
            </div>
          ))}
          {p.team.length > 4 && (
            <div style={{ width: 24, height: 24, borderRadius: "50%", background: "var(--pf-surface-2)", fontSize: 9, fontWeight: 500, display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid #fff", marginLeft: -7, color: "var(--pf-text-2)" }}>
              +{p.team.length - 4}
            </div>
          )}
        </div>

        {/* Budget */}
        <div style={{ textAlign: "right" as const }}>
          <div style={{ fontSize: 11, color: "var(--pf-text-3)" }}>
            ${p.spent.toLocaleString()} / ${p.budget.toLocaleString()}
          </div>
          <div style={{ height: 3, width: 72, background: "var(--pf-surface-2)", borderRadius: 99, marginTop: 3, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${budgetPct}%`, background: budgetPct >= 90 ? "#ef4444" : budgetPct >= 70 ? "#f59e0b" : "#22c55e", borderRadius: 99 }} />
          </div>
        </div>
      </div>
    </article>
  );
}
