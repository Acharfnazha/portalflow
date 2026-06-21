"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { PROJECT_STATUS_CONFIG, PRIORITY_CONFIG } from "@/lib/project-config";
import type { ProjectStatus, ProjectPriority } from "@/types/app.types";

interface ProjectRow {
  id: string;
  name: string;
  status: ProjectStatus;
  priority: ProjectPriority;
  progress: number;
  deadline?: string;
}

interface Props {
  clientId: string;
  canManage?: boolean;
}

function fmt(date: string) {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function TabProjects({ clientId, canManage }: Props) {
  const [projects, setProjects] = useState<ProjectRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("projects")
      .select("id, name, status, priority, progress, deadline")
      .eq("client_id", clientId)
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .then(({ data, error: err }) => {
        if (err) setError(err.message);
        else setProjects((data ?? []) as ProjectRow[]);
        setLoading(false);
      });
  }, [clientId]);

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          padding: "40px 0",
          color: "var(--pf-text-3)",
        }}
      >
        <i className="ti ti-loader-2" aria-hidden style={{ fontSize: 24, opacity: 0.5 }} />
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          textAlign: "center",
          padding: "32px 0",
          fontSize: 13.5,
          color: "#dc2626",
        }}
      >
        Failed to load projects: {error}
      </div>
    );
  }

  return (
    <div>
      {/* Subheader */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 16,
        }}
      >
        <span style={{ fontSize: 13, color: "var(--pf-text-2)" }}>
          {projects.length} project{projects.length !== 1 ? "s" : ""}
        </span>
        {canManage && (
          <Link
            href={`/dashboard/projects/new?client_id=${clientId}`}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "6px 13px",
              borderRadius: 8,
              border: "none",
              background: "#4f46e5",
              color: "#fff",
              fontSize: 13,
              fontWeight: 500,
              textDecoration: "none",
              fontFamily: "var(--font-inter)",
            }}
          >
            <i className="ti ti-plus" aria-hidden style={{ fontSize: 14 }} /> New project
          </Link>
        )}
      </div>

      {projects.length === 0 && (
        <div
          style={{ textAlign: "center", padding: "40px 0", color: "var(--pf-text-3)" }}
        >
          <i
            className="ti ti-layout-kanban"
            aria-hidden
            style={{ fontSize: 32, opacity: 0.35 }}
          />
          <p style={{ marginTop: 8, fontSize: 13 }}>No projects yet for this client.</p>
          {canManage && (
            <Link
              href={`/dashboard/projects/new?client_id=${clientId}`}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                marginTop: 10,
                padding: "7px 15px",
                borderRadius: 8,
                background: "#4f46e5",
                color: "#fff",
                fontSize: 13,
                fontWeight: 500,
                textDecoration: "none",
              }}
            >
              <i className="ti ti-plus" aria-hidden /> Create first project
            </Link>
          )}
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {projects.map((p, i) => {
          const sc = PROJECT_STATUS_CONFIG[p.status];
          const pc = PRIORITY_CONFIG[p.priority];
          const isOverdue =
            p.deadline &&
            p.status !== "completed" &&
            p.status !== "canceled" &&
            new Date(p.deadline) < new Date();

          const progressColor =
            p.status === "completed"
              ? "#6366f1"
              : p.progress >= 70
              ? "#22c55e"
              : p.progress >= 40
              ? "#f59e0b"
              : "#3b82f6";

          return (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: i * 0.04 }}
            >
              <Link
                href={`/dashboard/projects/${p.id}`}
                style={{ textDecoration: "none" }}
              >
                <div
                  style={{
                    background: "#fff",
                    border: "1px solid var(--pf-line)",
                    borderRadius: 10,
                    padding: "14px 16px",
                    transition: "border-color .15s",
                  }}
                  onMouseEnter={(e) =>
                    ((e.currentTarget as HTMLDivElement).style.borderColor = "#c7d2fe")
                  }
                  onMouseLeave={(e) =>
                    ((e.currentTarget as HTMLDivElement).style.borderColor = "var(--pf-line)")
                  }
                >
                  {/* Row 1: name + priority + status */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      marginBottom: 10,
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "var(--font-inter-tight)",
                        fontSize: 14,
                        fontWeight: 600,
                        color: "var(--pf-text)",
                        flex: 1,
                      }}
                    >
                      {p.name}
                    </span>
                    <span
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 3,
                        fontSize: 11,
                        color: pc.color,
                        fontWeight: 500,
                      }}
                    >
                      <i className={`ti ${pc.icon}`} aria-hidden style={{ fontSize: 12 }} />
                      {pc.label}
                    </span>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 500,
                        padding: "2px 8px",
                        borderRadius: 99,
                        background: sc.badgeBg,
                        color: sc.badgeColor,
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                      }}
                    >
                      <span
                        aria-hidden
                        style={{
                          width: 5,
                          height: 5,
                          borderRadius: "50%",
                          background: sc.dotColor,
                        }}
                      />
                      {sc.label}
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div style={{ marginBottom: p.deadline ? 10 : 0 }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: 4,
                      }}
                    >
                      <span style={{ fontSize: 11, color: "var(--pf-text-3)" }}>
                        Progress
                      </span>
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 500,
                          color: "var(--pf-text-2)",
                        }}
                      >
                        {p.progress}%
                      </span>
                    </div>
                    <div
                      style={{
                        height: 5,
                        background: "var(--pf-surface-2)",
                        borderRadius: 99,
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          height: "100%",
                          width: `${p.progress}%`,
                          background: progressColor,
                          borderRadius: 99,
                          transition: "width .6s ease",
                        }}
                      />
                    </div>
                  </div>

                  {/* Deadline */}
                  {p.deadline && (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 5,
                        fontSize: 12,
                        color: isOverdue ? "#dc2626" : "var(--pf-text-3)",
                        fontWeight: isOverdue ? 500 : 400,
                      }}
                    >
                      <i
                        className={`ti ${isOverdue ? "ti-alert-triangle" : "ti-calendar-event"}`}
                        aria-hidden
                        style={{ fontSize: 13 }}
                      />
                      {fmt(p.deadline)}
                      {isOverdue && <span>· overdue</span>}
                    </div>
                  )}
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
