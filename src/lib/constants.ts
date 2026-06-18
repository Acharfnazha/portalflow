// ============================================================
//  PortalFlow — App Constants
// ============================================================

export const APP_NAME = "PortalFlow";
export const APP_URL  = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

// ── Plans ────────────────────────────────────────────────────
export const PLAN_LIMITS = {
  studio:     { clients: 25,   users: 5,  storageGb: 5  },
  agency:     { clients: null, users: null, storageGb: 50 },
  enterprise: { clients: null, users: null, storageGb: null },
} as const;

export const PLAN_PRICES = {
  studio: { month: 2900,  year: 27840  }, // cents
  agency: { month: 7900,  year: 75840  },
} as const;

// ── Pagination ────────────────────────────────────────────────
export const DEFAULT_PAGE_SIZE = 10;
export const MAX_PAGE_SIZE     = 100;

// ── File upload ───────────────────────────────────────────────
export const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/zip",
  "text/plain",
  "text/csv",
] as const;

export const MAX_FILE_SIZE_BYTES = {
  studio:     25  * 1024 * 1024,  // 25 MB
  agency:     100 * 1024 * 1024,  // 100 MB
  enterprise: 500 * 1024 * 1024,  // 500 MB
} as const;

// ── Portal ────────────────────────────────────────────────────
export const PORTAL_SESSION_DURATION_DAYS = 30;

// ── Invoice ───────────────────────────────────────────────────
export const INVOICE_DUE_DAYS_DEFAULT = 30;
export const INVOICE_OVERDUE_GRACE_DAYS = 0;

// ── Design tokens (JS) ───────────────────────────────────────
export const COLORS = {
  accent:     "#4f46e5",
  accentSoft: "#eef2ff",
  accentRing: "#c7d2fe",
  green:      "#16a34a",
  greenSoft:  "#f0fdf4",
  amber:      "#b45309",
  amberSoft:  "#fffbeb",
  red:        "#dc2626",
  redSoft:    "#fef2f2",
  blue:       "#1d4ed8",
  blueSoft:   "#eff6ff",
  text:       "#0B0D12",
  text2:      "#5B616E",
  text3:      "#8A909C",
  surface:    "#FBFBFD",
  surface2:   "#F4F5F8",
  line:       "rgba(15,17,23,0.07)",
} as const;

// ── Status configs ───────────────────────────────────────────
export const CLIENT_STATUS_CONFIG = {
  new:      { label: "New",      dot: "#94a3b8", bg: "#f8fafc", color: "#475569" },
  active:   { label: "Active",   dot: "#22c55e", bg: "#f0fdf4", color: "#16a34a" },
  trial:    { label: "Trial",    dot: "#3b82f6", bg: "#eff6ff", color: "#1d4ed8" },
  at_risk:  { label: "At Risk",  dot: "#f59e0b", bg: "#fffbeb", color: "#b45309" },
  churned:  { label: "Churned",  dot: "#ef4444", bg: "#fef2f2", color: "#dc2626" },
} as const;

export const PROJECT_STATUS_CONFIG = {
  planning:   { label: "Planning",   dot: "#94a3b8", bg: "#f8fafc", color: "#475569" },
  active:     { label: "Active",     dot: "#22c55e", bg: "#f0fdf4", color: "#16a34a" },
  in_review:  { label: "In Review",  dot: "#3b82f6", bg: "#eff6ff", color: "#1d4ed8" },
  on_hold:    { label: "On Hold",    dot: "#f59e0b", bg: "#fffbeb", color: "#b45309" },
  completed:  { label: "Completed",  dot: "#4f46e5", bg: "#eef2ff", color: "#4f46e5" },
  canceled:   { label: "Canceled",   dot: "#ef4444", bg: "#fef2f2", color: "#dc2626" },
} as const;

export const INVOICE_STATUS_CONFIG = {
  draft:    { label: "Draft",    dot: "#94a3b8", bg: "#f8fafc", color: "#475569" },
  pending:  { label: "Pending",  dot: "#f59e0b", bg: "#fffbeb", color: "#b45309" },
  paid:     { label: "Paid",     dot: "#22c55e", bg: "#f0fdf4", color: "#16a34a" },
  overdue:  { label: "Overdue",  dot: "#ef4444", bg: "#fef2f2", color: "#dc2626" },
  void:     { label: "Void",     dot: "#94a3b8", bg: "#f8fafc", color: "#475569" },
  refunded: { label: "Refunded", dot: "#6366f1", bg: "#eef2ff", color: "#4f46e5" },
} as const;

export const PRIORITY_CONFIG = {
  high:   { label: "High",   color: "#dc2626", bg: "#fef2f2" },
  medium: { label: "Medium", color: "#d97706", bg: "#fffbeb" },
  low:    { label: "Low",    color: "#64748b", bg: "#f8fafc" },
} as const;

// ── Navigation ────────────────────────────────────────────────
export const DASHBOARD_NAV = [
  { label: "Dashboard",  href: "/dashboard",           icon: "ti-layout-dashboard" },
  { label: "Clients",    href: "/dashboard/clients",   icon: "ti-building" },
  { label: "Projects",   href: "/dashboard/projects",  icon: "ti-briefcase" },
  { label: "Invoices",   href: "/dashboard/invoices",  icon: "ti-receipt" },
  { label: "Documents",  href: "/dashboard/documents", icon: "ti-folder" },
  { label: "Team",       href: "/dashboard/team",      icon: "ti-users" },
] as const;

export const SETTINGS_NAV = [
  { label: "General",      href: "/dashboard/settings",              icon: "ti-settings" },
  { label: "Profile",      href: "/dashboard/settings/profile",      icon: "ti-user-circle" },
  { label: "Billing",      href: "/dashboard/settings/billing",      icon: "ti-credit-card" },
  { label: "Team",         href: "/dashboard/settings/team",         icon: "ti-users" },
  { label: "Integrations", href: "/dashboard/settings/integrations", icon: "ti-plug" },
] as const;
