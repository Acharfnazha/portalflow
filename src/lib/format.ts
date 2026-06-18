// ============================================================
//  PortalFlow — Formatting Utilities
// ============================================================

/** Format cents to "$1,234.56" */
export function formatCurrency(
  cents: number,
  currency = "USD",
  opts?: { compact?: boolean },
): string {
  const amount = cents / 100;
  if (opts?.compact && amount >= 1000) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(amount);
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/** Format cents to "$12k" */
export function formatCurrencyCompact(cents: number): string {
  return formatCurrency(cents, "USD", { compact: true });
}

/** Format ISO date string to "Jan 12, 2025" */
export function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/** Format ISO date string to "Jan 12" */
export function formatDateShort(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

/** Format ISO date to relative "3 days ago" / "in 2 days" */
export function formatRelative(iso: string | null | undefined): string {
  if (!iso) return "—";
  const diff = Date.now() - new Date(iso).getTime();
  const abs  = Math.abs(diff);
  const mins  = Math.floor(abs / 60000);
  const hours = Math.floor(abs / 3600000);
  const days  = Math.floor(abs / 86400000);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);

  const label =
    months >= 1  ? `${months}mo`  :
    weeks  >= 1  ? `${weeks}w`    :
    days   >= 1  ? `${days}d`     :
    hours  >= 1  ? `${hours}h`    :
    mins   >= 1  ? `${mins}m`     : "just now";

  if (label === "just now") return label;
  return diff > 0 ? `${label} ago` : `in ${label}`;
}

/** Format bytes to "2.3 MB" */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

/** Clamp a number between min and max */
export function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

/** Get initials from a full name: "Alex Rivera" → "AR" */
export function getInitials(name: string, max = 2): string {
  return name
    .split(/\s+/)
    .slice(0, max)
    .map(w => w[0]?.toUpperCase() ?? "")
    .join("");
}

/** Deterministic background color from a string (for avatars) */
const AVATAR_COLORS: [string, string][] = [
  ["#eef2ff", "#4f46e5"],
  ["#f0fdf4", "#16a34a"],
  ["#fffbeb", "#b45309"],
  ["#fef2f2", "#dc2626"],
  ["#eff6ff", "#1d4ed8"],
  ["#fdf4ff", "#7e22ce"],
  ["#fff7ed", "#c2410c"],
  ["#f0fdfa", "#0f766e"],
];

export function getAvatarColors(name: string): { bg: string; color: string } {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  const [bg, color] = AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
  return { bg, color };
}

/** Check if a date string is in the past */
export function isPast(iso: string | null | undefined): boolean {
  if (!iso) return false;
  return new Date(iso).getTime() < Date.now();
}

/** Pluralise: "1 client" / "3 clients" */
export function pluralise(n: number, singular: string, plural?: string): string {
  return `${n} ${n === 1 ? singular : (plural ?? singular + "s")}`;
}

/** Truncate text with ellipsis */
export function truncate(str: string, max: number): string {
  return str.length <= max ? str : str.slice(0, max - 1) + "…";
}
