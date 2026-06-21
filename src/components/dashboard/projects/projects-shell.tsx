"use client";

import { useState, useTransition, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import type { Project, ProjectStatus } from "@/types/app.types";
import { PROJECT_STATUS_CONFIG, PROJECT_STATUSES } from "@/lib/project-config";
import ProjectCard from "./project-card";
import { deleteProjectAction } from "@/lib/supabase/project-actions";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { useToast } from "@/stores/ui.store";

interface Props {
  projects: Project[];
  clientNames: Record<string, string>;
  clients: { id: string; name: string }[];
  kpis: { total: number; active: number; completed: number; overdue: number };
  role: string;
  initialSearch: string;
  initialStatus: string;
}

const TABS: { key: string; label: string }[] = [
  { key: "all", label: "All" },
  ...PROJECT_STATUSES.map((s) => ({
    key: s,
    label: PROJECT_STATUS_CONFIG[s].label,
  })),
];

export default function ProjectsShell({
  projects,
  clientNames,
  kpis,
  role,
  initialSearch,
  initialStatus,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { success, error: toastError } = useToast();
  const [isPending, startTransition] = useTransition();

  const [search, setSearch] = useState(initialSearch);
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null);
  const [deleting, setDeleting] = useState(false);

  const activeStatus = searchParams.get("status") ?? initialStatus;

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return projects.filter((p) => {
      const matchSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        (clientNames[p.clientId] ?? "").toLowerCase().includes(q);
      return matchSearch;
    });
  }, [projects, search, clientNames]);

  const counts = useMemo(() => {
    const base: Record<string, number> = { all: projects.length };
    PROJECT_STATUSES.forEach((s) => {
      base[s] = projects.filter((p) => p.status === s).length;
    });
    return base;
  }, [projects]);

  function setStatusFilter(status: string) {
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (!status || status === "all") {
        params.delete("status");
      } else {
        params.set("status", status);
      }
      router.replace(`/dashboard/projects?${params.toString()}`);
    });
  }

  function handleSearchChange(val: string) {
    setSearch(val);
    const params = new URLSearchParams(searchParams.toString());
    if (val) {
      params.set("q", val);
    } else {
      params.delete("q");
    }
    router.replace(`/dashboard/projects?${params.toString()}`);
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    const fd = new FormData();
    fd.append("id", deleteTarget.id);
    const result = await deleteProjectAction(null, fd);
    setDeleting(false);
    setDeleteTarget(null);
    if (result?.error) {
      toastError("Delete failed", result.error);
    } else {
      success("Project deleted");
    }
  }

  const canManage = ["owner", "admin", "manager"].includes(role);
  const avgProgress =
    filtered.length > 0
      ? Math.round(filtered.reduce((s, p) => s + p.progress, 0) / filtered.length)
      : 0;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "calc(100vh - 57px)",
        background: "var(--pf-surface)",
      }}
    >
      {/* Header */}
      <div
        style={{
          background: "#fff",
          borderBottom: "1px solid var(--pf-line)",
          padding: "20px 24px 0",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            marginBottom: 16,
          }}
        >
          <div>
            <h1
              style={{
                fontFamily: "var(--font-inter-tight)",
                fontSize: 20,
                fontWeight: 700,
                color: "var(--pf-text)",
                margin: 0,
              }}
            >
              Projects
            </h1>
            <p style={{ fontSize: 13, color: "var(--pf-text-2)", margin: "4px 0 0" }}>
              {kpis.active} active
              {kpis.overdue > 0 ? ` · ${kpis.overdue} overdue` : ""}
              {" · "}
              {kpis.completed} completed
            </p>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 7,
                background: "var(--pf-surface)",
                border: "1px solid var(--pf-line)",
                borderRadius: 8,
                padding: "7px 11px",
              }}
            >
              <i
                className="ti ti-search"
                aria-hidden
                style={{ fontSize: 14, color: "var(--pf-text-3)" }}
              />
              <input
                type="search"
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Search projects…"
                style={{
                  border: "none",
                  background: "transparent",
                  fontSize: 13,
                  color: "var(--pf-text)",
                  outline: "none",
                  width: 170,
                  fontFamily: "var(--font-inter)",
                }}
              />
            </div>
            {canManage && (
              <Link
                href="/dashboard/projects/new"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "7px 14px",
                  borderRadius: 8,
                  border: "none",
                  background: "#4f46e5",
                  fontSize: 13,
                  fontWeight: 500,
                  color: "#fff",
                  textDecoration: "none",
                  fontFamily: "var(--font-inter)",
                }}
              >
                <i className="ti ti-plus" aria-hidden style={{ fontSize: 15 }} /> New project
              </Link>
            )}
          </div>
        </div>

        {/* KPI bar */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4,1fr)",
            gap: 12,
            paddingBottom: 16,
          }}
        >
          {[
            {
              label: "Total",
              value: kpis.total,
              icon: "ti-layout-kanban",
              color: "#4f46e5",
            },
            {
              label: "Active",
              value: kpis.active,
              icon: "ti-player-play",
              color: "#22c55e",
            },
            {
              label: "Avg. progress",
              value: `${avgProgress}%`,
              icon: "ti-trending-up",
              color: "#3b82f6",
            },
            {
              label: "Overdue",
              value: kpis.overdue,
              icon: "ti-clock-exclamation",
              color: kpis.overdue > 0 ? "#ef4444" : "#94a3b8",
            },
          ].map((s) => (
            <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 9,
                  background: s.color + "16",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <i
                  className={`ti ${s.icon}`}
                  aria-hidden
                  style={{ fontSize: 17, color: s.color }}
                />
              </div>
              <div>
                <div style={{ fontSize: 11, color: "var(--pf-text-3)" }}>{s.label}</div>
                <div
                  style={{
                    fontFamily: "var(--font-inter-tight)",
                    fontSize: 18,
                    fontWeight: 700,
                    color: "var(--pf-text)",
                  }}
                >
                  {s.value}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Filter tabs */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 4,
            flexWrap: "wrap",
            marginTop: 4,
          }}
        >
          {TABS.map((t) => {
            const isActive = (activeStatus || "all") === t.key;
            const sc =
              t.key !== "all"
                ? PROJECT_STATUS_CONFIG[t.key as ProjectStatus]
                : null;
            return (
              <button
                key={t.key}
                type="button"
                onClick={() => setStatusFilter(t.key)}
                disabled={isPending}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "6px 12px",
                  marginBottom: -1,
                  borderRadius: "7px 7px 0 0",
                  cursor: "pointer",
                  border: isActive
                    ? "1px solid var(--pf-line)"
                    : "1px solid transparent",
                  borderBottom: isActive
                    ? "1px solid #fff"
                    : "1px solid transparent",
                  background: isActive ? "#fff" : "transparent",
                  fontSize: 12.5,
                  color: isActive ? "var(--pf-text)" : "var(--pf-text-2)",
                  fontFamily: "var(--font-inter)",
                  fontWeight: isActive ? 500 : 400,
                  transition: "all .12s",
                }}
              >
                {sc && (
                  <span
                    aria-hidden
                    style={{
                      width: 7,
                      height: 7,
                      borderRadius: "50%",
                      background: sc.dotColor,
                    }}
                  />
                )}
                {t.label}
                <span
                  style={{
                    fontSize: 11,
                    padding: "1px 6px",
                    borderRadius: 99,
                    background: isActive ? "#4f46e5" : "var(--pf-surface-2)",
                    color: isActive ? "#fff" : "var(--pf-text-3)",
                  }}
                >
                  {counts[t.key] ?? 0}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid */}
      <div style={{ flex: 1, padding: 24 }}>
        {filtered.length === 0 ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "80px 0",
              gap: 12,
              color: "var(--pf-text-3)",
            }}
          >
            <i
              className="ti ti-layout-kanban"
              aria-hidden
              style={{ fontSize: 40, opacity: 0.3 }}
            />
            <p style={{ fontSize: 14, margin: 0 }}>
              {search || activeStatus
                ? "No projects match your filter."
                : "No projects yet. Create your first project!"}
            </p>
            {canManage && !search && !activeStatus && (
              <Link
                href="/dashboard/projects/new"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  marginTop: 4,
                  padding: "8px 16px",
                  borderRadius: 8,
                  background: "#4f46e5",
                  color: "#fff",
                  fontSize: 13,
                  fontWeight: 500,
                  textDecoration: "none",
                }}
              >
                <i className="ti ti-plus" aria-hidden /> New project
              </Link>
            )}
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
              gap: 14,
            }}
          >
            <AnimatePresence>
              {filtered.map((project, i) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.2, delay: i * 0.03 }}
                >
                  <ProjectCard
                    project={project}
                    clientName={clientNames[project.clientId]}
                    canManage={canManage}
                    onDelete={() => setDeleteTarget(project)}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete project"
        description={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        confirmLabel={deleting ? "Deleting…" : "Delete project"}
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
