"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  PROJECTS, PROJECT_STATUS_CONFIG,
  ProjectStatus,
} from "@/lib/projects-data";
import { ProjectCard } from "@/components/dashboard/projects/project-card";

type FilterTab = "all" | ProjectStatus;

const TABS: { key: FilterTab; label: string }[] = [
  { key: "all",       label: "All"       },
  { key: "active",    label: "Active"    },
  { key: "review",    label: "In Review" },
  { key: "planning",  label: "Planning"  },
  { key: "hold",      label: "On Hold"   },
  { key: "completed", label: "Completed" },
];

export default function ProjectsPage() {
  const [query,  setQuery]  = useState("");
  const [filter, setFilter] = useState<FilterTab>("all");

  /* ── Counts per tab ─────────────────────────── */
  const counts = useMemo((): Record<FilterTab, number> => ({
    all:       PROJECTS.length,
    active:    PROJECTS.filter(p => p.status === "active").length,
    review:    PROJECTS.filter(p => p.status === "review").length,
    planning:  PROJECTS.filter(p => p.status === "planning").length,
    hold:      PROJECTS.filter(p => p.status === "hold").length,
    completed: PROJECTS.filter(p => p.status === "completed").length,
  }), []);

  /* ── KPI stats ───────────────────────────────── */
  const totalBudget  = PROJECTS.reduce((s, p) => s + p.budget, 0);
  const totalSpent   = PROJECTS.reduce((s, p) => s + p.spent, 0);
  const avgProgress  = Math.round(PROJECTS.reduce((s, p) => s + p.progress, 0) / PROJECTS.length);
  const overdueCount = PROJECTS.filter(p => p.status !== "completed" && new Date(p.deadline) < new Date()).length;

  /* ── Filtered list ───────────────────────────── */
  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return PROJECTS.filter(p => {
      const matchQ = !q || p.name.toLowerCase().includes(q) || p.client.toLowerCase().includes(q) || p.tags.some(t => t.toLowerCase().includes(q));
      const matchF = filter === "all" || p.status === filter;
      return matchQ && matchF;
    });
  }, [query, filter]);

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "calc(100vh - 57px)", background: "var(--pf-surface)" }}>

      {/* ── Page header ──────────────────────────── */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", padding: "20px 20px 0", background: "#fff", borderBottom: "1px solid var(--pf-line)" }}>
        <div>
          <h1 style={{ fontFamily: "var(--font-inter-tight)", fontSize: 20, fontWeight: 700, color: "var(--pf-text)", margin: 0 }}>
            Projects
          </h1>
          <p style={{ fontSize: 13, color: "var(--pf-text-2)", margin: "4px 0 16px" }}>
            {counts.active} active · {counts.review} in review · {overdueCount > 0 ? `${overdueCount} overdue ·` : ""} {counts.completed} completed
          </p>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {/* Search */}
          <div style={{ display: "flex", alignItems: "center", gap: 7, background: "var(--pf-surface)", border: "1px solid var(--pf-line)", borderRadius: 8, padding: "7px 11px" }}>
            <i className="ti ti-search" aria-hidden="true" style={{ fontSize: 14, color: "var(--pf-text-3)" }} />
            <input
              type="search"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search projects…"
              aria-label="Search projects"
              style={{ border: "none", background: "transparent", fontSize: 13, color: "var(--pf-text)", outline: "none", width: 170, fontFamily: "var(--font-inter)" }}
            />
          </div>
          <button type="button" style={ghostBtn}>
            <i className="ti ti-adjustments-horizontal" aria-hidden="true" style={{ fontSize: 15 }} /> Filter
          </button>
          <button type="button" style={primaryBtn}>
            <i className="ti ti-plus" aria-hidden="true" style={{ fontSize: 15 }} /> New project
          </button>
        </div>
      </div>

      {/* ── KPI bar ──────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, padding: "16px 20px 0", background: "#fff", borderBottom: "1px solid var(--pf-line)", paddingBottom: 16 }}>
        {[
          { label: "Total projects",    value: PROJECTS.length,              icon: "ti-layout-kanban",  color: "#4f46e5" },
          { label: "Avg. progress",     value: `${avgProgress}%`,            icon: "ti-trending-up",    color: "#22c55e" },
          { label: "Total budget",      value: `$${(totalBudget/1000).toFixed(0)}k`, icon: "ti-coins", color: "#f59e0b" },
          { label: "Budget consumed",   value: `$${(totalSpent/1000).toFixed(0)}k · ${Math.round(totalSpent/totalBudget*100)}%`, icon: "ti-chart-pie", color: "#3b82f6" },
        ].map(s => (
          <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 9, background: s.color + "14", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <i className={`ti ${s.icon}`} aria-hidden="true" style={{ fontSize: 18, color: s.color }} />
            </div>
            <div>
              <div style={{ fontSize: 11, color: "var(--pf-text-3)" }}>{s.label}</div>
              <div style={{ fontFamily: "var(--font-inter-tight)", fontSize: 17, fontWeight: 700, color: "var(--pf-text)" }}>{s.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Filter tabs ──────────────────────────── */}
      <div style={{ display: "flex", alignItems: "center", gap: 4, padding: "12px 20px", background: "#fff", borderBottom: "1px solid var(--pf-line)", flexWrap: "wrap" as const }}>
        {TABS.map(t => {
          const active = filter === t.key;
          const sc = t.key !== "all" ? PROJECT_STATUS_CONFIG[t.key as ProjectStatus] : null;
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => setFilter(t.key)}
              style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "6px 12px", borderRadius: 7, cursor: "pointer",
                border: active ? "1px solid #4f46e5" : "1px solid var(--pf-line)",
                background: active ? "#eef2ff" : "#fff",
                fontSize: "12.5px",
                color: active ? "#4f46e5" : "var(--pf-text-2)",
                fontFamily: "var(--font-inter)",
                transition: "all .15s",
              }}
            >
              {sc && <span aria-hidden="true" style={{ width: 7, height: 7, borderRadius: "50%", background: sc.dotColor }} />}
              {t.label}
              <span style={{ fontSize: 11, padding: "1px 6px", borderRadius: 99, background: active ? "#4f46e5" : "var(--pf-surface-2)", color: active ? "#fff" : "var(--pf-text-3)" }}>
                {counts[t.key]}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Project grid ─────────────────────────── */}
      <div style={{ flex: 1, padding: 20 }}>
        {filtered.length === 0 ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "64px 0", gap: 8, color: "var(--pf-text-3)" }}>
            <i className="ti ti-layout-kanban" aria-hidden="true" style={{ fontSize: 36, opacity: 0.35 }} />
            <p style={{ fontSize: 14 }}>No projects match your search.</p>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
              gap: 14,
            }}
          >
            {filtered.map((project, i) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.22, delay: i * 0.04 }}
              >
                <ProjectCard project={project} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const ghostBtn: React.CSSProperties = {
  display: "flex", alignItems: "center", gap: 6,
  padding: "7px 13px", borderRadius: 8,
  border: "1px solid var(--pf-line)", background: "#fff",
  fontSize: 13, color: "var(--pf-text)", cursor: "pointer",
  fontFamily: "var(--font-inter)",
};

const primaryBtn: React.CSSProperties = {
  display: "flex", alignItems: "center", gap: 6,
  padding: "7px 14px", borderRadius: 8,
  border: "none", background: "#4f46e5",
  fontSize: 13, fontWeight: 500, color: "#fff",
  cursor: "pointer", fontFamily: "var(--font-inter)",
};
