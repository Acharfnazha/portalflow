"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface PortalNavProps {
  token: string;
  clientName: string;
  agencyName: string;
  agencyLogoUrl?: string;
}

const NAV_ITEMS = [
  { label: "Overview",  path: "",          icon: "ti-home-2"   },
  { label: "Projects",  path: "/projects",  icon: "ti-briefcase" },
  { label: "Invoices",  path: "/invoices",  icon: "ti-receipt"  },
  { label: "Documents", path: "/documents", icon: "ti-folder"   },
] as const;

export function PortalNav({ token, clientName, agencyName, agencyLogoUrl }: PortalNavProps) {
  const pathname = usePathname();
  const base = `/portal/${token}`;

  return (
    <header
      style={{
        background: "#fff",
        borderBottom: "1px solid var(--pf-line)",
        padding: "0 24px",
        display: "flex",
        alignItems: "center",
        height: 56,
        position: "sticky",
        top: 0,
        zIndex: 100,
      }}
    >
      {/* Agency brand */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginRight: 32 }}>
        {agencyLogoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={agencyLogoUrl} alt={agencyName} style={{ height: 26, objectFit: "contain" }} />
        ) : (
          <div
            style={{
              height: 28,
              padding: "0 10px",
              background: "#eef2ff",
              borderRadius: 6,
              display: "flex",
              alignItems: "center",
              fontSize: 13,
              fontWeight: 700,
              color: "#4f46e5",
            }}
          >
            {agencyName}
          </div>
        )}
      </div>

      {/* Nav items */}
      <nav aria-label="Client portal" style={{ display: "flex", gap: 2, flex: 1 }}>
        {NAV_ITEMS.map(item => {
          const href = base + item.path;
          const active = pathname === href;
          return (
            <Link
              key={item.label}
              href={href}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "8px 12px",
                borderRadius: 7,
                fontSize: 13,
                fontWeight: active ? 500 : 400,
                color: active ? "#4f46e5" : "var(--pf-text-2)",
                background: active ? "#eef2ff" : "transparent",
                textDecoration: "none",
                transition: "all .12s",
              }}
            >
              <i className={`ti ${item.icon}`} aria-hidden style={{ fontSize: 15 }} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Client info */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "5px 10px",
          borderRadius: 7,
          background: "var(--pf-surface)",
          border: "1px solid var(--pf-line)",
        }}
      >
        <div
          style={{
            width: 24,
            height: 24,
            borderRadius: 6,
            background: "#eef2ff",
            color: "#4f46e5",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 11,
            fontWeight: 700,
          }}
        >
          {clientName[0]}
        </div>
        <span style={{ fontSize: 12.5, fontWeight: 500, color: "var(--pf-text)" }}>
          {clientName}
        </span>
      </div>
    </header>
  );
}
