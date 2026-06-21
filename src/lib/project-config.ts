import type { ProjectStatus, ProjectPriority } from "@/types/app.types";

export const PROJECT_STATUS_CONFIG: Record<
  ProjectStatus,
  { label: string; dotColor: string; badgeBg: string; badgeColor: string }
> = {
  planning:  { label: "Planning",   dotColor: "#94a3b8", badgeBg: "#f8fafc", badgeColor: "#475569" },
  active:    { label: "Active",     dotColor: "#22c55e", badgeBg: "#f0fdf4", badgeColor: "#16a34a" },
  in_review: { label: "In Review",  dotColor: "#a855f7", badgeBg: "#faf5ff", badgeColor: "#7e22ce" },
  on_hold:   { label: "On Hold",    dotColor: "#f59e0b", badgeBg: "#fffbeb", badgeColor: "#d97706" },
  completed: { label: "Completed",  dotColor: "#6366f1", badgeBg: "#eef2ff", badgeColor: "#4338ca" },
  canceled:  { label: "Canceled",   dotColor: "#ef4444", badgeBg: "#fef2f2", badgeColor: "#dc2626" },
};

export const PRIORITY_CONFIG: Record<
  ProjectPriority,
  { label: string; color: string; icon: string }
> = {
  high:   { label: "High",   color: "#ef4444", icon: "ti-arrow-up"   },
  medium: { label: "Medium", color: "#f59e0b", icon: "ti-minus"      },
  low:    { label: "Low",    color: "#22c55e", icon: "ti-arrow-down" },
};

export const PROJECT_STATUSES: ProjectStatus[] = [
  "planning", "active", "in_review", "on_hold", "completed", "canceled",
];

export const PROJECT_PRIORITIES: ProjectPriority[] = ["high", "medium", "low"];
