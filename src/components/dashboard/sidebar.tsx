"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/dashboard",          icon: "ti-layout-dashboard", label: "Dashboard" },
  { href: "/dashboard/clients",  icon: "ti-users",            label: "Clients",   badge: 42 },
  { href: "/dashboard/projects", icon: "ti-layout-kanban",    label: "Projects" },
  { href: "/dashboard/documents",icon: "ti-file-text",        label: "Documents" },
];

const FINANCE = [
  { href: "/dashboard/invoices", icon: "ti-receipt",      label: "Invoices", badge: 3 },
  { href: "/dashboard/payments", icon: "ti-credit-card",  label: "Payments" },
];

const WORKSPACE = [
  { href: "/dashboard/team",     icon: "ti-users-group", label: "Team" },
  { href: "/dashboard/settings", icon: "ti-settings",    label: "Settings" },
];

function NavItem({ href, icon, label, badge }: { href: string; icon: string; label: string; badge?: number }) {
  const pathname = usePathname();
  const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
  return (
    <Link
      href={href}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 9,
        padding: "7px 9px",
        borderRadius: 7,
        fontSize: "13.5px",
        color: active ? "var(--pf-text)" : "var(--pf-text-2)",
        background: active ? "#fff" : "transparent",
        fontWeight: active ? 500 : 400,
        textDecoration: "none",
        transition: "background .15s, color .15s",
      }}
    >
      <i className={`ti ${icon}`} aria-hidden="true" style={{ fontSize: 16 }} />
      <span style={{ flex: 1 }}>{label}</span>
      {badge !== undefined && (
        <span style={{ fontSize: 11, background: "#4f46e5", color: "#fff", padding: "1px 7px", borderRadius: 99 }}>
          {badge}
        </span>
      )}
    </Link>
  );
}

function NavGroup({ label, items }: { label?: string; items: typeof NAV }) {
  return (
    <div style={{ padding: "8px 10px 4px" }}>
      {label && (
        <div style={{ fontSize: 11, color: "var(--pf-text-3)", padding: "4px 8px 3px", letterSpacing: ".04em", textTransform: "uppercase" as const }}>
          {label}
        </div>
      )}
      {items.map(i => <NavItem key={i.href} {...i} />)}
    </div>
  );
}

export function Sidebar() {
  return (
    <aside
      style={{
        width: 220,
        background: "var(--pf-surface)",
        borderRight: "1px solid var(--pf-line)",
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        position: "sticky",
        top: 0,
        flexShrink: 0,
      }}
    >
      {/* Brand */}
      <div style={{ padding: "18px 16px 14px", borderBottom: "1px solid var(--pf-line)", display: "flex", alignItems: "center", gap: 9 }}>
        <div style={{ width: 26, height: 26, background: "#4f46e5", borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <svg width="14" height="14" viewBox="0 0 48 48" fill="none" stroke="#fff" strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M8 13 C22 13,27 24,37 24" /><path d="M8 35 C22 35,27 24,37 24" /><path d="M8 24 H37" />
            <circle cx="37" cy="24" r="3.5" fill="#a5b4fc" stroke="none" />
          </svg>
        </div>
        <span style={{ fontFamily: "var(--font-inter-tight)", fontWeight: 600, fontSize: 15, color: "var(--pf-text)" }}>
          Portal<span style={{ color: "#4f46e5" }}>Flow</span>
        </span>
      </div>

      {/* Nav */}
      <div style={{ flex: 1, overflowY: "auto" }}>
        <NavGroup items={NAV} />
        <NavGroup label="Finance" items={FINANCE} />
        <NavGroup label="Workspace" items={WORKSPACE} />
      </div>

      {/* User */}
      <div style={{ padding: "12px 10px", borderTop: "1px solid var(--pf-line)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9, padding: "7px 9px", borderRadius: 7, cursor: "pointer" }}>
          <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#e0e7ff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 500, color: "#4f46e5", flexShrink: 0 }}>
            AN
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 500, color: "var(--pf-text)" }}>Ali N.</div>
            <div style={{ fontSize: 11, color: "var(--pf-text-3)" }}>Agency plan</div>
          </div>
          <i className="ti ti-selector" aria-hidden="true" style={{ fontSize: 14, color: "var(--pf-text-3)" }} />
        </div>
      </div>
    </aside>
  );
}
