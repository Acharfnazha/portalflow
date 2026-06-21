"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { Project } from "@/types/app.types";
import {
  createProjectAction,
  updateProjectAction,
  type ProjectActionState,
} from "@/lib/supabase/project-actions";
import { PROJECT_STATUSES, PROJECT_PRIORITIES, PROJECT_STATUS_CONFIG, PRIORITY_CONFIG } from "@/lib/project-config";
import { useToast } from "@/stores/ui.store";

interface Props {
  project?: Project;
  clients: { id: string; name: string }[];
  defaultClientId?: string;
}

export default function ProjectForm({ project, clients, defaultClientId }: Props) {
  const router = useRouter();
  const { success, error: toastError } = useToast();
  const isEdit = !!project;
  const action = isEdit ? updateProjectAction : createProjectAction;

  const [state, formAction, isPending] = useActionState<ProjectActionState, FormData>(
    action,
    null
  );

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!state) return;
    if (state.error) {
      toastError("Failed to save project", state.error);
    }
  }, [state]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (state === null && isEdit) {
      success("Project updated");
      router.push(`/dashboard/projects/${project!.id}`);
    }
  }, [state]);

  const fe = (state as { fieldErrors?: Record<string, string> } | null)?.fieldErrors;

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "9px 12px",
    borderRadius: 8,
    border: "1px solid var(--pf-line)",
    fontSize: 13.5,
    color: "var(--pf-text)",
    background: "#fff",
    fontFamily: "var(--font-inter)",
    outline: "none",
    boxSizing: "border-box",
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: 12.5,
    fontWeight: 500,
    color: "var(--pf-text-2)",
    marginBottom: 6,
  };

  const errStyle: React.CSSProperties = {
    fontSize: 11.5,
    color: "#dc2626",
    marginTop: 4,
  };

  return (
    <div
      style={{
        minHeight: "calc(100vh - 57px)",
        background: "var(--pf-surface)",
        padding: 24,
      }}
    >
      <div style={{ maxWidth: 700, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
          <Link
            href={isEdit ? `/dashboard/projects/${project!.id}` : "/dashboard/projects"}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 34,
              height: 34,
              borderRadius: 8,
              border: "1px solid var(--pf-line)",
              background: "#fff",
              color: "var(--pf-text-2)",
              textDecoration: "none",
            }}
          >
            <i className="ti ti-arrow-left" aria-hidden style={{ fontSize: 16 }} />
          </Link>
          <div>
            <h1
              style={{
                fontFamily: "var(--font-inter-tight)",
                fontSize: 19,
                fontWeight: 700,
                color: "var(--pf-text)",
                margin: 0,
              }}
            >
              {isEdit ? "Edit project" : "New project"}
            </h1>
            <p style={{ fontSize: 12.5, color: "var(--pf-text-3)", margin: "2px 0 0" }}>
              {isEdit ? "Update the project details below." : "Fill in the details to create a new project."}
            </p>
          </div>
        </div>

        <form action={formAction}>
          {isEdit && <input type="hidden" name="id" value={project!.id} />}

          {/* Card */}
          <div
            style={{
              background: "#fff",
              border: "1px solid var(--pf-line)",
              borderRadius: 12,
              padding: 24,
              display: "flex",
              flexDirection: "column",
              gap: 20,
            }}
          >
            {/* Name */}
            <div>
              <label htmlFor="name" style={labelStyle}>
                Project name <span style={{ color: "#dc2626" }}>*</span>
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                defaultValue={project?.name ?? ""}
                placeholder="e.g. Website Redesign"
                style={inputStyle}
              />
              {fe?.name && <p style={errStyle}>{fe.name}</p>}
            </div>

            {/* Client */}
            <div>
              <label htmlFor="client_id" style={labelStyle}>
                Client <span style={{ color: "#dc2626" }}>*</span>
              </label>
              <select
                id="client_id"
                name="client_id"
                required
                defaultValue={project?.clientId ?? defaultClientId ?? ""}
                style={{ ...inputStyle, cursor: "pointer" }}
              >
                <option value="">Select a client…</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              {fe?.client_id && <p style={errStyle}>{fe.client_id}</p>}
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" style={labelStyle}>
                Description
              </label>
              <textarea
                id="description"
                name="description"
                rows={3}
                defaultValue={project?.description ?? ""}
                placeholder="Brief description of the project scope…"
                style={{ ...inputStyle, resize: "vertical" as const, lineHeight: 1.6 }}
              />
            </div>

            {/* Status + Priority row */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div>
                <label htmlFor="status" style={labelStyle}>
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  defaultValue={project?.status ?? "planning"}
                  style={{ ...inputStyle, cursor: "pointer" }}
                >
                  {PROJECT_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {PROJECT_STATUS_CONFIG[s].label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="priority" style={labelStyle}>
                  Priority
                </label>
                <select
                  id="priority"
                  name="priority"
                  defaultValue={project?.priority ?? "medium"}
                  style={{ ...inputStyle, cursor: "pointer" }}
                >
                  {PROJECT_PRIORITIES.map((pr) => (
                    <option key={pr} value={pr}>
                      {PRIORITY_CONFIG[pr].label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Progress */}
            <div>
              <label htmlFor="progress" style={labelStyle}>
                Progress (%)
              </label>
              <input
                id="progress"
                name="progress"
                type="number"
                min={0}
                max={100}
                defaultValue={project?.progress ?? 0}
                style={inputStyle}
              />
            </div>

            {/* Dates row */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div>
                <label htmlFor="start_date" style={labelStyle}>
                  Start date
                </label>
                <input
                  id="start_date"
                  name="start_date"
                  type="date"
                  defaultValue={project?.startDate?.split("T")[0] ?? ""}
                  style={inputStyle}
                />
              </div>
              <div>
                <label htmlFor="deadline" style={labelStyle}>
                  Deadline
                </label>
                <input
                  id="deadline"
                  name="deadline"
                  type="date"
                  defaultValue={project?.deadline?.split("T")[0] ?? ""}
                  style={inputStyle}
                />
              </div>
            </div>

            {/* Budget row */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div>
                <label htmlFor="budget" style={labelStyle}>
                  Budget ($)
                </label>
                <input
                  id="budget"
                  name="budget"
                  type="number"
                  min={0}
                  step="0.01"
                  defaultValue={project ? (project.budgetCents / 100).toFixed(2) : ""}
                  placeholder="0.00"
                  style={inputStyle}
                />
              </div>
              {isEdit && (
                <div>
                  <label htmlFor="spent" style={labelStyle}>
                    Spent ($)
                  </label>
                  <input
                    id="spent"
                    name="spent"
                    type="number"
                    min={0}
                    step="0.01"
                    defaultValue={project ? (project.spentCents / 100).toFixed(2) : ""}
                    placeholder="0.00"
                    style={inputStyle}
                  />
                </div>
              )}
            </div>

            {/* Visible to client */}
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <input
                id="visible_to_client"
                name="visible_to_client"
                type="checkbox"
                value="true"
                defaultChecked={project?.visibleToClient ?? false}
                style={{ width: 16, height: 16, cursor: "pointer" }}
              />
              <label
                htmlFor="visible_to_client"
                style={{ ...labelStyle, margin: 0, cursor: "pointer" }}
              >
                Visible to client in portal
              </label>
            </div>

            {/* Error */}
            {(state as { error?: string } | null)?.error && (
              <div
                style={{
                  padding: "10px 14px",
                  borderRadius: 8,
                  background: "#fef2f2",
                  border: "1px solid #fecaca",
                  fontSize: 13,
                  color: "#dc2626",
                }}
              >
                {(state as { error: string }).error}
              </div>
            )}
          </div>

          {/* Actions */}
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: 10,
              marginTop: 20,
            }}
          >
            <Link
              href={isEdit ? `/dashboard/projects/${project!.id}` : "/dashboard/projects"}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "9px 18px",
                borderRadius: 8,
                border: "1px solid var(--pf-line)",
                background: "#fff",
                fontSize: 13.5,
                color: "var(--pf-text)",
                textDecoration: "none",
                fontWeight: 500,
              }}
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isPending}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "9px 20px",
                borderRadius: 8,
                border: "none",
                background: isPending ? "#a5b4fc" : "#4f46e5",
                fontSize: 13.5,
                color: "#fff",
                fontWeight: 500,
                cursor: isPending ? "not-allowed" : "pointer",
                fontFamily: "var(--font-inter)",
                transition: "background .15s",
              }}
            >
              {isPending ? (
                <>
                  <i className="ti ti-loader-2" aria-hidden style={{ fontSize: 15 }} />
                  Saving…
                </>
              ) : isEdit ? (
                "Save changes"
              ) : (
                "Create project"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
