"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SETTINGS_NAV } from "@/lib/constants";

export function SettingsNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Settings sections"
      style={{
        width: 200,
        flexShrink: 0,
        background: "#fff",
        border: "1px solid var(--pf-line)",
        borderRadius: 12,
        padding: "8px 6px",
        position: "sticky",
        top: 20,
      }}
    >
      {SETTINGS_NAV.map((item) => {
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 10px",
              borderRadius: 7,
              fontSize: 13,
              fontWeight: active ? 500 : 400,
              color: active ? "#4f46e5" : "var(--pf-text-2)",
              background: active ? "#eef2ff" : "transparent",
              textDecoration: "none",
            }}
          >
            <i className={`ti ${item.icon}`} aria-hidden style={{ fontSize: 15, flexShrink: 0 }} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
