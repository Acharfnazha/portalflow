"use client";

import { use, useState } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { PROJECTS, PROJECT_STATUS_CONFIG, PRIORITY_CONFIG } from "@/lib/projects-data";
import { PfBadge } from "@/components/ui/pf-badge";
import { PfAvatarStack } from "@/components/ui/pf-avatar";
import { formatDate, formatCurrency } from "@/lib/format";
import { EmptyState } from "@/components/ui/empty-state";

type Tab = "overview" | "tasks" | "documents" | "activity";

const TABS: { key: Tab; label: string }[] = [
  { key: "overview",   label: "Overview"   },
  { key: "tasks",      label: "Tasks"      },
  { key: "documents",  label: "Documents"  },
  { key: "activity",   label: "Activity"   },
];

export default function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const project = PROJECTS.find(p => p.id === Number(id));
  if (!project) notFound();

  const sc = PROJECT_STATUS_CONFIG[project.status];
  const pc = PRIORITY_CONFIG[project.priority];

  const [activeTab, setActiveTab] = useState<Tab>("overview");

  const progressColor =
    project.progress >= 70 ? "#16a34a" :
    project.progress >= 40 ? "#d97706" : "#4f46e5";

  return (
    <div style={{ minHeight: "calc(100vh - 57px)", background: "var(--pf-surface)" }}>
      {/* Header */}
      <div
        style={{
          background: "#fff",
          borderBottom: "1px solid var(--pf-line)",
          padding: "16px 20px 0",
        }}
      >
        <Link
          href="/dashboard/projects"
          style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 13, color: "var(--pf-text-3)", textDecoration: "none", marginBottom: 12 }}
        >
          <i className="ti ti-arrow-left" aria-hidden style={{ fontSize: 14 }} />
          Back to Projects
        </Link>

        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, paddingBottom: 16 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
              <h1 style={{ fontSize: 20, fontWeight: 700, color: "var(--pf-text)", margin: 0, letterSpacing: "-.3px" }}>
                {project.name}
              </h1>
              <PfBadge dot dotColor={sc.dotColor} style={{ background: sc.badgeBg, color: sc.badgeColor }}>
                {sc.label}
              </PfBadge>
              <PfBadge style={{ color: pc.color }}>{pc.label}</PfBadge>
            </div>
            <p style={{ margin: 0, fontSize: 13, color: "var(--pf-text-2)" }}>
              <i className="ti ti-building" aria-hidden style={{ fontSize: 13, marginRight: 4 }} />
              {project.client}
            </p>
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            <button type="button" style={ghostBtn}>
              <i className="ti ti-share" aria-hidden style={{ fontSize: 14 }} /> Share
            </button>
            <button type="button" style={primaryBtn}>
              <i className="ti ti-pencil" aria-hidden style={{ fontSize: 14 }} /> Edit project
            </button>
          </div>
        </div>

        {/* Tab bar */}
        <div style={{ display: "flex", gap: 2 }} role="tablist">
          {TABS.map(t => {
            const active = activeTab === t.key;
            return (
              <button
                key={t.key}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setActiveTab(t.key)}
                style={{
                  padding: "8px 14px",
                  background: "none",
                  border: "none",
                  borderBottom: `2px solid ${active ? "#4f46e5" : "transparent"}`,
                  fontSize: 13.5,
                  fontWeight: active ? 500 : 400,
                  color: active ? "#4f46e5" : "var(--pf-text-2)",
                  cursor: "pointer",
                  fontFamily: "var(--font-inter)",
                  transition: "all .12s",
                }}
              >
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab panels */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
        >
          {activeTab === "overview" && (
            <div style={{ padding: 20, display: "grid", gridTemplateColumns: "1fr 280px", gap: 16 }}>
              {/* Main */}
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {/* Progress */}
                <div style={{ background: "#fff", border: "1px solid var(--pf-line)", borderRadius: 12, padding: "20px 22px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                    <span style={{ fontSize: 13.5, fontWeight: 600, color: "var(--pf-text)" }}>Progress</span>
                    <span style={{ fontSize: 13.5, fontWeight: 700, color: progressColor }}>{project.progress}%</span>
                  </div>
                  <div style={{ height: 8, borderRadius: 99, background: "var(--pf-surface-2)", overflow: "hidden" }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${project.progress}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                      style={{ height: "100%", background: progressColor, borderRadius: 99 }}
                    />
                  </div>
                </div>

                {/* Description */}
                {project.description && (
                  <div style={{ background: "#fff", border: "1px solid var(--pf-line)", borderRadius: 12, padding: "20px 22px" }}>
                    <h3 style={{ fontSize: 13.5, fontWeight: 600, color: "var(--pf-text)", margin: "0 0 8px" }}>Description</h3>
                    <p style={{ margin: 0, fontSize: 13.5, color: "var(--pf-text-2)", lineHeight: 1.6 }}>{project.description}</p>
                  </div>
                )}

                {/* Budget */}
                <div style={{ background: "#fff", border: "1px solid var(--pf-line)", borderRadius: 12, padding: "20px 22px" }}>
                  <h3 style={{ fontSize: 13.5, fontWeight: 600, color: "var(--pf-text)", margin: "0 0 14px" }}>Budget</h3>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
                    {[
                      { label: "Total budget",  value: formatCurrency(project.budget * 100), color: "var(--pf-text)" },
                      { label: "Spent",         value: formatCurrency(project.spent  * 100), color: "#d97706" },
                      { label: "Remaining",     value: formatCurrency((project.budget - project.spent) * 100), color: "#16a34a" },
                    ].map(s => (
                      <div key={s.label}>
                        <p style={{ margin: "0 0 2px", fontSize: 11.5, color: "var(--pf-text-3)" }}>{s.label}</p>
                        <p style={{ margin: 0, fontSize: 18, fontWeight: 700, color: s.color, fontFamily: "var(--font-inter-tight)" }}>{s.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div style={{ background: "#fff", border: "1px solid var(--pf-line)", borderRadius: 12, padding: "18px 18px" }}>
                  <h3 style={{ fontSize: 13, fontWeight: 600, color: "var(--pf-text)", margin: "0 0 12px" }}>Details</h3>
                  {[
                    { label: "Status",   value: <PfBadge dot dotColor={sc.dotColor} style={{ background: sc.badgeBg, color: sc.badgeColor }}>{sc.label}</PfBadge> },
                    { label: "Priority", value: <PfBadge style={{ color: pc.color }}>{pc.label}</PfBadge> },
                    { label: "Client",   value: project.client },
                    { label: "Start",    value: formatDate(project.startDate) },
                    { label: "Deadline", value: formatDate(project.deadline) },
                  ].map(r => (
                    <div key={r.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "7px 0", borderBottom: "1px solid var(--pf-line)" }}>
                      <span style={{ fontSize: 12.5, color: "var(--pf-text-3)" }}>{r.label}</span>
                      <span style={{ fontSize: 12.5, color: "var(--pf-text)", fontWeight: 500 }}>{r.value}</span>
                    </div>
                  ))}
                </div>

                <div style={{ background: "#fff", border: "1px solid var(--pf-line)", borderRadius: 12, padding: "18px 18px" }}>
                  <h3 style={{ fontSize: 13, fontWeight: 600, color: "var(--pf-text)", margin: "0 0 12px" }}>Team</h3>
                  <PfAvatarStack names={project.team.map(t => t.name)} size={30} />
                </div>
              </div>
            </div>
          )}

          {activeTab === "tasks" && (
            <div style={{ padding: 20 }}>
              <div style={{ background: "#fff", border: "1px solid var(--pf-line)", borderRadius: 12 }}>
                <EmptyState icon="ti-checkbox" title="Task board coming soon" description="Full Kanban board with drag-and-drop is on the roadmap." />
              </div>
            </div>
          )}

          {activeTab === "documents" && (
            <div style={{ padding: 20 }}>
              <div style={{ background: "#fff", border: "1px solid var(--pf-line)", borderRadius: 12 }}>
                <EmptyState icon="ti-folder" title="No documents yet" description="Documents attached to this project will appear here." />
              </div>
            </div>
          )}

          {activeTab === "activity" && (
            <div style={{ padding: 20 }}>
              <div style={{ background: "#fff", border: "1px solid var(--pf-line)", borderRadius: 12 }}>
                <EmptyState icon="ti-clock" title="No activity yet" description="Project events and updates will appear here." />
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

const ghostBtn: React.CSSProperties = {
  display: "flex", alignItems: "center", gap: 6,
  padding: "7px 13px", borderRadius: 8,
  border: "1px solid var(--pf-line)", background: "#fff",
  fontSize: 13, color: "var(--pf-text-2)", cursor: "pointer", fontFamily: "var(--font-inter)",
};

const primaryBtn: React.CSSProperties = {
  display: "flex", alignItems: "center", gap: 6,
  padding: "7px 14px", borderRadius: 8, border: "none",
  background: "#4f46e5", fontSize: 13, fontWeight: 500,
  color: "#fff", cursor: "pointer", fontFamily: "var(--font-inter)",
};
