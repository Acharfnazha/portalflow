"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import type { Project } from "@/types/app.types";
import { PROJECT_STATUS_CONFIG, PRIORITY_CONFIG } from "@/lib/project-config";
import { deleteProjectAction } from "@/lib/supabase/project-actions";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { TabDocuments } from "@/components/dashboard/client-profile/tab-documents";
import { useToast } from "@/stores/ui.store";

type Tab = "overview" | "activity" | "documents";

interface ActivityRow {
  id: string;
  action: string;
  description?: string;
  created_at: string;
  actor_name?: string;
  actor_avatar_url?: string;
}

interface Props {
  project:  Project;
  client:   { id: string; name: string; email?: string; company?: string } | null;
  activity: ActivityRow[];
  role:     string;
  orgId:    string;
}

function fmtDate(s?: string) {
  if (!s) return "—";
  return new Date(s).toLocaleDateString("en-US", {
    month: "short",
    day:   "numeric",
    year:  "numeric",
  });
}

function fmtMoney(cents: number) {
  if (!cents) return "$0";
  const dollars = cents / 100;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(dollars);
}

function timeAgo(s: string) {
  const diff = Date.now() - new Date(s).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

const TABS: { key: Tab; label: string; icon: string }[] = [
  { key: "overview",   label: "Overview",   icon: "ti-layout-list" },
  { key: "activity",   label: "Activity",   icon: "ti-activity"    },
  { key: "documents",  label: "Documents",  icon: "ti-file-text"   },
];

export default function ProjectDetailShell({ project, client, activity, role, orgId }: Props) {
  const router = useRouter();
  const { success, error: toastError } = useToast();
  const [activeTab,   setActiveTab]   = useState<Tab>("overview");
  const [deleteOpen,  setDeleteOpen]  = useState(false);
  const [deleting,    setDeleting]    = useState(false);

  const canManage = ["owner", "admin", "manager"].includes(role);
  const sc        = PROJECT_STATUS_CONFIG[project.status];
  const pc        = PRIORITY_CONFIG[project.priority];
  const isOverdue =
    project.deadline &&
    project.status !== "completed" &&
    project.status !== "canceled" &&
    new Date(project.deadline) < new Date();

  const budgetPct =
    project.budgetCents > 0
      ? Math.min(100, Math.round((project.spentCents / project.budgetCents) * 100))
      : 0;

  const progressColor =
    project.status === "completed"
      ? "#6366f1"
      : project.progress >= 70
      ? "#22c55e"
      : project.progress >= 40
      ? "#f59e0b"
      : "#3b82f6";

  async function handleDelete() {
    setDeleting(true);
    const fd = new FormData();
    fd.append("id", project.id);
    const result = await deleteProjectAction(null, fd);
    setDeleting(false);
    if (result?.error) {
      toastError("Delete failed", result.error);
    } else {
      success("Project deleted");
      router.push("/dashboard/projects");
    }
  }

  return (
    <div style={{ minHeight: "calc(100vh - 57px)", background: "var(--pf-surface)" }}>
      {/* Header */}
      <div
        style={{
          background:   "#fff",
          borderBottom: "1px solid var(--pf-line)",
          padding:      "20px 24px 0",
        }}
      >
        {/* Breadcrumb */}
        <div
          style={{
            display:     "flex",
            alignItems:  "center",
            gap:         6,
            fontSize:    12.5,
            color:       "var(--pf-text-3)",
            marginBottom: 14,
          }}
        >
          <Link href="/dashboard/projects" style={{ color: "var(--pf-text-3)", textDecoration: "none" }}>
            Projects
          </Link>
          <i className="ti ti-chevron-right" aria-hidden style={{ fontSize: 11 }} />
          <span style={{ color: "var(--pf-text-2)" }}>{project.name}</span>
        </div>

        {/* Title row */}
        <div
          style={{
            display:        "flex",
            alignItems:     "flex-start",
            justifyContent: "space-between",
            marginBottom:   16,
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
              <h1
                style={{
                  fontFamily: "var(--font-inter-tight)",
                  fontSize:   21,
                  fontWeight: 700,
                  color:      "var(--pf-text)",
                  margin:     0,
                }}
              >
                {project.name}
              </h1>
              <span
                style={{
                  fontSize:    11.5,
                  fontWeight:  500,
                  padding:     "3px 10px",
                  borderRadius: 99,
                  background:  sc.badgeBg,
                  color:       sc.badgeColor,
                  display:     "flex",
                  alignItems:  "center",
                  gap:         5,
                }}
              >
                <span
                  aria-hidden
                  style={{ width: 6, height: 6, borderRadius: "50%", background: sc.dotColor }}
                />
                {sc.label}
              </span>
            </div>
            {client && (
              <Link
                href={`/dashboard/clients/${client.id}`}
                style={{
                  fontSize:    13,
                  color:       "#4f46e5",
                  fontWeight:  500,
                  textDecoration: "none",
                  display:     "flex",
                  alignItems:  "center",
                  gap:         5,
                }}
              >
                <i className="ti ti-building" aria-hidden style={{ fontSize: 13 }} />
                {client.name}
              </Link>
            )}
          </div>

          {canManage && (
            <div style={{ display: "flex", gap: 8 }}>
              <Link
                href={`/dashboard/projects/${project.id}/edit`}
                style={{
                  display:     "flex",
                  alignItems:  "center",
                  gap:         6,
                  padding:     "8px 14px",
                  borderRadius: 8,
                  border:      "1px solid var(--pf-line)",
                  background:  "#fff",
                  fontSize:    13,
                  color:       "var(--pf-text)",
                  textDecoration: "none",
                  fontWeight:  500,
                }}
              >
                <i className="ti ti-edit" aria-hidden style={{ fontSize: 14 }} /> Edit
              </Link>
              <button
                type="button"
                onClick={() => setDeleteOpen(true)}
                style={{
                  display:     "flex",
                  alignItems:  "center",
                  gap:         6,
                  padding:     "8px 14px",
                  borderRadius: 8,
                  border:      "1px solid #fecaca",
                  background:  "#fef2f2",
                  fontSize:    13,
                  color:       "#dc2626",
                  cursor:      "pointer",
                  fontFamily:  "var(--font-inter)",
                  fontWeight:  500,
                }}
              >
                <i className="ti ti-trash" aria-hidden style={{ fontSize: 14 }} /> Delete
              </button>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 2 }}>
          {TABS.map((t) => {
            const isActive = activeTab === t.key;
            return (
              <button
                key={t.key}
                type="button"
                onClick={() => setActiveTab(t.key)}
                style={{
                  display:     "flex",
                  alignItems:  "center",
                  gap:         6,
                  padding:     "9px 14px",
                  marginBottom: -1,
                  borderRadius: "7px 7px 0 0",
                  border:      isActive ? "1px solid var(--pf-line)" : "1px solid transparent",
                  borderBottom: isActive ? "1px solid #fff" : "1px solid transparent",
                  background:  isActive ? "#fff" : "transparent",
                  fontSize:    13,
                  color:       isActive ? "var(--pf-text)" : "var(--pf-text-2)",
                  fontFamily:  "var(--font-inter)",
                  fontWeight:  isActive ? 500 : 400,
                  cursor:      "pointer",
                  transition:  "all .12s",
                }}
              >
                <i className={`ti ${t.icon}`} aria-hidden style={{ fontSize: 14 }} />
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab body */}
      <div style={{ padding: 24 }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
          >
            {activeTab === "overview" && (
              <div
                style={{
                  display:              "grid",
                  gridTemplateColumns:  "1fr 300px",
                  gap:                  20,
                  alignItems:           "start",
                }}
              >
                {/* Left: main details */}
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  {project.description && (
                    <div
                      style={{
                        background:   "#fff",
                        border:       "1px solid var(--pf-line)",
                        borderRadius: 12,
                        padding:      "18px 20px",
                      }}
                    >
                      <h3
                        style={{
                          fontSize:      13,
                          fontWeight:    600,
                          color:         "var(--pf-text-2)",
                          margin:        "0 0 8px",
                          textTransform: "uppercase",
                          letterSpacing: "0.04em",
                        }}
                      >
                        Description
                      </h3>
                      <p style={{ fontSize: 13.5, color: "var(--pf-text)", lineHeight: 1.7, margin: 0 }}>
                        {project.description}
                      </p>
                    </div>
                  )}

                  {/* Progress */}
                  <div
                    style={{
                      background:   "#fff",
                      border:       "1px solid var(--pf-line)",
                      borderRadius: 12,
                      padding:      "18px 20px",
                    }}
                  >
                    <div
                      style={{
                        display:        "flex",
                        justifyContent: "space-between",
                        alignItems:     "center",
                        marginBottom:   10,
                      }}
                    >
                      <h3
                        style={{
                          fontSize:      13,
                          fontWeight:    600,
                          color:         "var(--pf-text-2)",
                          margin:        0,
                          textTransform: "uppercase",
                          letterSpacing: "0.04em",
                        }}
                      >
                        Progress
                      </h3>
                      <span
                        style={{
                          fontFamily: "var(--font-inter-tight)",
                          fontSize:   22,
                          fontWeight: 700,
                          color:      progressColor,
                        }}
                      >
                        {project.progress}%
                      </span>
                    </div>
                    <div
                      style={{
                        height:       8,
                        background:   "var(--pf-surface-2)",
                        borderRadius: 99,
                        overflow:     "hidden",
                      }}
                    >
                      <div
                        style={{
                          height:     "100%",
                          width:      `${project.progress}%`,
                          background: progressColor,
                          borderRadius: 99,
                          transition: "width .8s ease",
                        }}
                      />
                    </div>
                  </div>

                  {/* Budget */}
                  {project.budgetCents > 0 && (
                    <div
                      style={{
                        background:   "#fff",
                        border:       "1px solid var(--pf-line)",
                        borderRadius: 12,
                        padding:      "18px 20px",
                      }}
                    >
                      <h3
                        style={{
                          fontSize:      13,
                          fontWeight:    600,
                          color:         "var(--pf-text-2)",
                          margin:        "0 0 14px",
                          textTransform: "uppercase",
                          letterSpacing: "0.04em",
                        }}
                      >
                        Budget
                      </h3>
                      <div
                        style={{
                          display:             "grid",
                          gridTemplateColumns: "1fr 1fr 1fr",
                          gap:                 16,
                          marginBottom:        14,
                        }}
                      >
                        {[
                          { label: "Total",     value: fmtMoney(project.budgetCents),                        color: "var(--pf-text)" },
                          { label: "Spent",     value: fmtMoney(project.spentCents),                         color: budgetPct >= 90 ? "#dc2626" : "var(--pf-text)" },
                          { label: "Remaining", value: fmtMoney(project.budgetCents - project.spentCents),   color: "var(--pf-text)" },
                        ].map((s) => (
                          <div key={s.label}>
                            <div style={{ fontSize: 11.5, color: "var(--pf-text-3)", marginBottom: 3 }}>
                              {s.label}
                            </div>
                            <div
                              style={{
                                fontFamily: "var(--font-inter-tight)",
                                fontSize:   18,
                                fontWeight: 700,
                                color:      s.color,
                              }}
                            >
                              {s.value}
                            </div>
                          </div>
                        ))}
                      </div>
                      <div
                        style={{
                          height:       6,
                          background:   "var(--pf-surface-2)",
                          borderRadius: 99,
                          overflow:     "hidden",
                        }}
                      >
                        <div
                          style={{
                            height:     "100%",
                            width:      `${budgetPct}%`,
                            background: budgetPct >= 90 ? "#ef4444" : budgetPct >= 70 ? "#f59e0b" : "#22c55e",
                            borderRadius: 99,
                          }}
                        />
                      </div>
                      <div style={{ fontSize: 11.5, color: "var(--pf-text-3)", marginTop: 6 }}>
                        {budgetPct}% of budget used
                      </div>
                    </div>
                  )}
                </div>

                {/* Right: sidebar */}
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <div
                    style={{
                      background:    "#fff",
                      border:        "1px solid var(--pf-line)",
                      borderRadius:  12,
                      padding:       "18px 20px",
                      display:       "flex",
                      flexDirection: "column",
                      gap:           14,
                    }}
                  >
                    {[
                      {
                        label: "Priority",
                        content: (
                          <span
                            style={{
                              display:    "flex",
                              alignItems: "center",
                              gap:        5,
                              fontSize:   13,
                              color:      pc.color,
                              fontWeight: 500,
                            }}
                          >
                            <i className={`ti ${pc.icon}`} aria-hidden style={{ fontSize: 14 }} />
                            {pc.label}
                          </span>
                        ),
                      },
                      {
                        label: "Start date",
                        content: <span style={{ fontSize: 13, color: "var(--pf-text)" }}>{fmtDate(project.startDate)}</span>,
                      },
                      {
                        label: "Deadline",
                        content: (
                          <span
                            style={{
                              fontSize:   13,
                              color:      isOverdue ? "#dc2626" : "var(--pf-text)",
                              fontWeight: isOverdue ? 500 : 400,
                              display:    "flex",
                              alignItems: "center",
                              gap:        5,
                            }}
                          >
                            {isOverdue && (
                              <i className="ti ti-alert-triangle" aria-hidden style={{ fontSize: 13 }} />
                            )}
                            {fmtDate(project.deadline)}
                          </span>
                        ),
                      },
                      {
                        label: "Client portal",
                        content: (
                          <span
                            style={{
                              fontSize:   12.5,
                              fontWeight: 500,
                              color:      project.visibleToClient ? "#16a34a" : "var(--pf-text-3)",
                              display:    "flex",
                              alignItems: "center",
                              gap:        5,
                            }}
                          >
                            <i
                              className={`ti ${project.visibleToClient ? "ti-eye" : "ti-eye-off"}`}
                              aria-hidden
                              style={{ fontSize: 13 }}
                            />
                            {project.visibleToClient ? "Visible" : "Hidden"}
                          </span>
                        ),
                      },
                      {
                        label: "Created",
                        content: <span style={{ fontSize: 13, color: "var(--pf-text-2)" }}>{fmtDate(project.createdAt)}</span>,
                      },
                    ].map(({ label, content }) => (
                      <div key={label}>
                        <div
                          style={{
                            fontSize:      11,
                            fontWeight:    600,
                            color:         "var(--pf-text-3)",
                            textTransform: "uppercase",
                            letterSpacing: "0.05em",
                            marginBottom:  4,
                          }}
                        >
                          {label}
                        </div>
                        {content}
                      </div>
                    ))}

                    {project.tags.length > 0 && (
                      <div>
                        <div
                          style={{
                            fontSize:      11,
                            fontWeight:    600,
                            color:         "var(--pf-text-3)",
                            textTransform: "uppercase",
                            letterSpacing: "0.05em",
                            marginBottom:  6,
                          }}
                        >
                          Tags
                        </div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                          {project.tags.map((t) => (
                            <span
                              key={t}
                              style={{
                                fontSize:    11,
                                padding:     "2px 8px",
                                borderRadius: 99,
                                background:  "var(--pf-surface-2)",
                                color:       "var(--pf-text-2)",
                                border:      "1px solid var(--pf-line)",
                              }}
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {client && (
                    <div
                      style={{
                        background:   "#fff",
                        border:       "1px solid var(--pf-line)",
                        borderRadius: 12,
                        padding:      "18px 20px",
                      }}
                    >
                      <h3
                        style={{
                          fontSize:      11,
                          fontWeight:    600,
                          color:         "var(--pf-text-3)",
                          margin:        "0 0 10px",
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                        }}
                      >
                        Client
                      </h3>
                      <div style={{ fontSize: 13.5, fontWeight: 600, color: "var(--pf-text)" }}>
                        {client.name}
                      </div>
                      {client.company && (
                        <div style={{ fontSize: 12.5, color: "var(--pf-text-2)", marginTop: 3 }}>
                          {client.company}
                        </div>
                      )}
                      <Link
                        href={`/dashboard/clients/${client.id}`}
                        style={{
                          display:    "inline-flex",
                          alignItems: "center",
                          gap:        5,
                          marginTop:  10,
                          fontSize:   12.5,
                          color:      "#4f46e5",
                          textDecoration: "none",
                          fontWeight: 500,
                        }}
                      >
                        View profile
                        <i className="ti ti-arrow-right" aria-hidden style={{ fontSize: 12 }} />
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === "activity" && (
              <div style={{ maxWidth: 680 }}>
                {activity.length === 0 ? (
                  <div
                    style={{
                      display:       "flex",
                      flexDirection: "column",
                      alignItems:    "center",
                      padding:       "64px 0",
                      gap:           10,
                      color:         "var(--pf-text-3)",
                    }}
                  >
                    <i className="ti ti-activity" aria-hidden style={{ fontSize: 36, opacity: 0.3 }} />
                    <p style={{ fontSize: 13.5, margin: 0 }}>No activity yet.</p>
                  </div>
                ) : (
                  <div
                    style={{
                      background:   "#fff",
                      border:       "1px solid var(--pf-line)",
                      borderRadius: 12,
                      overflow:     "hidden",
                    }}
                  >
                    {activity.map((ev, i) => (
                      <div
                        key={ev.id}
                        style={{
                          display:      "flex",
                          gap:          12,
                          padding:      "14px 18px",
                          borderBottom: i < activity.length - 1 ? "1px solid var(--pf-line)" : "none",
                        }}
                      >
                        <div
                          style={{
                            width:          30,
                            height:         30,
                            borderRadius:   "50%",
                            background:     "#eef2ff",
                            display:        "flex",
                            alignItems:     "center",
                            justifyContent: "center",
                            flexShrink:     0,
                          }}
                        >
                          <i className="ti ti-activity" aria-hidden style={{ fontSize: 14, color: "#4f46e5" }} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 13, color: "var(--pf-text)" }}>
                            {ev.description ?? ev.action}
                          </div>
                          <div
                            style={{
                              fontSize:  11.5,
                              color:     "var(--pf-text-3)",
                              marginTop: 3,
                              display:   "flex",
                              gap:       6,
                            }}
                          >
                            {ev.actor_name && <span>{ev.actor_name}</span>}
                            <span>·</span>
                            <span>{timeAgo(ev.created_at)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "documents" && (
              <div style={{ maxWidth: 820 }}>
                <TabDocuments
                  clientId={client?.id ?? ""}
                  projectId={project.id}
                  orgId={orgId}
                  canManage={canManage}
                />
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <ConfirmDialog
        open={deleteOpen}
        title="Delete project"
        description={`Are you sure you want to delete "${project.name}"? This action cannot be undone.`}
        confirmLabel={deleting ? "Deleting…" : "Delete project"}
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteOpen(false)}
      />
    </div>
  );
}
