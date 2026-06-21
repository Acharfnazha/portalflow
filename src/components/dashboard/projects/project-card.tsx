"use client";

import { useState } from "react";
import Link from "next/link";
import type { Project } from "@/types/app.types";
import { PROJECT_STATUS_CONFIG, PRIORITY_CONFIG } from "@/lib/project-config";

interface Props {
  project: Project;
  clientName?: string;
  canManage?: boolean;
  onDelete?: () => void;
}

function fmtDate(s: string) {
  return new Date(s).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function fmtMoney(cents: number) {
  const dollars = cents / 100;
  if (dollars >= 1000) return `$${(dollars / 1000).toFixed(0)}k`;
  return `$${dollars.toLocaleString()}`;
}

export default function ProjectCard({ project: p, clientName, canManage, onDelete }: Props) {
  const [hovered, setHovered] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const sc = PROJECT_STATUS_CONFIG[p.status];
  const pc = PRIORITY_CONFIG[p.priority];
  const isOverdue =
    p.deadline &&
    p.status !== "completed" &&
    p.status !== "canceled" &&
    new Date(p.deadline) < new Date();

  const budgetPct =
    p.budgetCents > 0 ? Math.min(100, Math.round((p.spentCents / p.budgetCents) * 100)) : 0;

  const progressColor =
    p.status === "completed"
      ? "#6366f1"
      : p.progress >= 70
      ? "#22c55e"
      : p.progress >= 40
      ? "#f59e0b"
      : "#3b82f6";

  return (
    <article
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => {
        setHovered(false);
        setMenuOpen(false);
      }}
      style={{
        background: "#fff",
        border: `1px solid ${hovered ? "#c7d2fe" : "var(--pf-line)"}`,
        borderRadius: 12,
        padding: "16px 18px",
        display: "flex",
        flexDirection: "column",
        gap: 12,
        transition: "border-color .15s, box-shadow .15s",
        boxShadow: hovered ? "0 4px 16px rgba(79,70,229,.08)" : "none",
        position: "relative",
      }}
    >
      {/* Row 1: Priority + Status + Menu */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span
          style={{
            display: "flex",
            alignItems: "center",
            gap: 4,
            fontSize: 11.5,
            color: pc.color,
            fontWeight: 500,
          }}
        >
          <i className={`ti ${pc.icon}`} aria-hidden style={{ fontSize: 13 }} />
          {pc.label} priority
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span
            style={{
              fontSize: 11,
              fontWeight: 500,
              padding: "3px 9px",
              borderRadius: 99,
              background: sc.badgeBg,
              color: sc.badgeColor,
              display: "flex",
              alignItems: "center",
              gap: 5,
            }}
          >
            <span
              aria-hidden
              style={{ width: 5, height: 5, borderRadius: "50%", background: sc.dotColor }}
            />
            {sc.label}
          </span>
          {canManage && (
            <div style={{ position: "relative" }}>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  setMenuOpen((o) => !o);
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 24,
                  height: 24,
                  borderRadius: 6,
                  border: "1px solid var(--pf-line)",
                  background: menuOpen ? "var(--pf-surface)" : "transparent",
                  cursor: "pointer",
                  color: "var(--pf-text-3)",
                  opacity: hovered || menuOpen ? 1 : 0,
                  transition: "opacity .15s",
                }}
              >
                <i className="ti ti-dots" aria-hidden style={{ fontSize: 13 }} />
              </button>
              {menuOpen && (
                <div
                  style={{
                    position: "absolute",
                    top: 28,
                    right: 0,
                    background: "#fff",
                    border: "1px solid var(--pf-line)",
                    borderRadius: 9,
                    boxShadow: "0 8px 24px rgba(0,0,0,.1)",
                    zIndex: 50,
                    minWidth: 140,
                    overflow: "hidden",
                  }}
                >
                  <Link
                    href={`/dashboard/projects/${p.id}/edit`}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "9px 14px",
                      fontSize: 13,
                      color: "var(--pf-text)",
                      textDecoration: "none",
                    }}
                    onClick={() => setMenuOpen(false)}
                  >
                    <i className="ti ti-edit" aria-hidden style={{ fontSize: 14 }} /> Edit
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      onDelete?.();
                    }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "9px 14px",
                      fontSize: 13,
                      color: "#dc2626",
                      background: "transparent",
                      border: "none",
                      width: "100%",
                      cursor: "pointer",
                      textAlign: "left",
                    }}
                  >
                    <i className="ti ti-trash" aria-hidden style={{ fontSize: 14 }} /> Delete
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Row 2: Title + Client - link wraps both */}
      <Link href={`/dashboard/projects/${p.id}`} style={{ textDecoration: "none" }}>
        <h3
          style={{
            fontFamily: "var(--font-inter-tight)",
            fontSize: 15,
            fontWeight: 700,
            color: "var(--pf-text)",
            margin: "0 0 4px",
            lineHeight: 1.3,
          }}
        >
          {p.name}
        </h3>
        {clientName && (
          <span
            style={{
              fontSize: 12,
              color: "#4f46e5",
              fontWeight: 500,
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            <i className="ti ti-building" aria-hidden style={{ fontSize: 12 }} />
            {clientName}
          </span>
        )}
      </Link>

      {/* Description */}
      {p.description && (
        <p
          style={{
            fontSize: 12.5,
            color: "var(--pf-text-2)",
            lineHeight: 1.6,
            margin: 0,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical" as const,
            overflow: "hidden",
          }}
        >
          {p.description}
        </p>
      )}

      {/* Tags */}
      {p.tags.length > 0 && (
        <div style={{ display: "flex", gap: 5, flexWrap: "wrap" as const }}>
          {p.tags.slice(0, 4).map((t) => (
            <span
              key={t}
              style={{
                fontSize: 11,
                padding: "2px 8px",
                borderRadius: 99,
                background: "var(--pf-surface-2)",
                color: "var(--pf-text-2)",
                border: "1px solid var(--pf-line)",
              }}
            >
              {t}
            </span>
          ))}
        </div>
      )}

      {/* Progress */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
          <span style={{ fontSize: 11, color: "var(--pf-text-3)" }}>Progress</span>
          <span style={{ fontSize: 11, fontWeight: 600, color: "var(--pf-text-2)" }}>
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

      <div aria-hidden style={{ height: 1, background: "var(--pf-line)" }} />

      {/* Footer */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        {p.deadline ? (
          <span
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              fontSize: 12,
              color: isOverdue ? "#dc2626" : "var(--pf-text-2)",
              fontWeight: isOverdue ? 500 : 400,
            }}
          >
            <i
              className={`ti ${isOverdue ? "ti-alert-triangle" : "ti-calendar-event"}`}
              aria-hidden
              style={{ fontSize: 13 }}
            />
            {fmtDate(p.deadline)}
            {isOverdue && <span>· overdue</span>}
          </span>
        ) : (
          <span style={{ fontSize: 12, color: "var(--pf-text-3)" }}>No deadline</span>
        )}

        {p.budgetCents > 0 && (
          <div style={{ textAlign: "right" as const }}>
            <div style={{ fontSize: 11, color: "var(--pf-text-3)" }}>
              {fmtMoney(p.spentCents)} / {fmtMoney(p.budgetCents)}
            </div>
            <div
              style={{
                height: 3,
                width: 72,
                background: "var(--pf-surface-2)",
                borderRadius: 99,
                marginTop: 3,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${budgetPct}%`,
                  background:
                    budgetPct >= 90 ? "#ef4444" : budgetPct >= 70 ? "#f59e0b" : "#22c55e",
                  borderRadius: 99,
                }}
              />
            </div>
          </div>
        )}
      </div>
    </article>
  );
}
