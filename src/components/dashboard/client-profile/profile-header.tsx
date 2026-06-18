"use client";

import Link from "next/link";
import type { Client } from "@/types/app.types";
import { StatusBadge } from "@/components/dashboard/clients/status-badge";
import { formatCurrency, formatRelative, getAvatarColors, getInitials } from "@/lib/format";

interface Props {
  client: Client & { ownerName?: string };
  onEdit: () => void;
}

export function ProfileHeader({ client, onEdit }: Props) {
  const { bg, color } = getAvatarColors(client.name);
  const initials = getInitials(client.name);
  const firstTag = client.tags?.[0];

  return (
    <div style={{ background: "#fff", borderBottom: "1px solid var(--pf-line)" }}>
      {/* Breadcrumb */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 24px 0" }}>
        <Link href="/dashboard/clients" style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 13, color: "var(--pf-text-2)", textDecoration: "none" }}>
          <i className="ti ti-arrow-left" aria-hidden="true" style={{ fontSize: 14 }} />
          Back to Clients
        </Link>

        <div style={{ display: "flex", gap: 6 }}>
          <button type="button" onClick={onEdit} style={btnStyle("ghost")}>
            <i className="ti ti-pencil" aria-hidden="true" style={{ fontSize: 14 }} /> Edit
          </button>
          {client.website && (
            <a href={client.website} target="_blank" rel="noopener noreferrer" style={{ ...btnStyle("ghost"), textDecoration: "none" }}>
              <i className="ti ti-external-link" aria-hidden="true" style={{ fontSize: 14 }} /> Website
            </a>
          )}
        </div>
      </div>

      {/* Hero */}
      <div style={{ display: "flex", alignItems: "flex-end", gap: 16, padding: "16px 24px 18px" }}>
        <div
          aria-hidden="true"
          style={{
            width: 56, height: 56, borderRadius: 14,
            background: bg, color,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 18, fontWeight: 600, flexShrink: 0,
            fontFamily: "var(--font-inter-tight)",
            border: "1px solid var(--pf-line)",
          }}
        >
          {initials}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <h1 style={{ fontFamily: "var(--font-inter-tight)", fontSize: 22, fontWeight: 700, color: "var(--pf-text)", margin: 0 }}>
              {client.name}
            </h1>
            <StatusBadge status={client.status} />
            {firstTag && (
              <span style={{ fontSize: 12, color: "var(--pf-text-3)", background: "var(--pf-surface-2)", border: "1px solid var(--pf-line)", padding: "2px 9px", borderRadius: 99 }}>
                {firstTag}
              </span>
            )}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 5, flexWrap: "wrap" }}>
            {(client.domain ?? client.website) && (
              <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 13, color: "var(--pf-text-2)" }}>
                <i className="ti ti-globe" aria-hidden="true" style={{ fontSize: 13, color: "var(--pf-text-3)" }} />
                {client.domain ?? client.website}
              </span>
            )}
            {client.ownerName && (
              <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 13, color: "var(--pf-text-2)" }}>
                <i className="ti ti-user" aria-hidden="true" style={{ fontSize: 13, color: "var(--pf-text-3)" }} />
                {client.ownerName}
              </span>
            )}
            <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 13, color: "var(--pf-text-2)" }}>
              <i className="ti ti-clock" aria-hidden="true" style={{ fontSize: 13, color: "var(--pf-text-3)" }} />
              Updated {formatRelative(client.updatedAt)}
            </span>
          </div>
        </div>

        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <div style={{ fontSize: 11, color: "var(--pf-text-3)", textTransform: "uppercase", letterSpacing: ".05em" }}>MRR</div>
          <div style={{ fontFamily: "var(--font-inter-tight)", fontSize: 22, fontWeight: 700, color: "var(--pf-text)" }}>
            {client.mrrCents > 0 ? formatCurrency(client.mrrCents) : "—"}
          </div>
        </div>
      </div>
    </div>
  );
}

function btnStyle(variant: "ghost" | "primary"): React.CSSProperties {
  return {
    display: "flex", alignItems: "center", gap: 6,
    padding: "7px 13px", borderRadius: 8, cursor: "pointer",
    fontFamily: "var(--font-inter)", fontSize: 13,
    ...(variant === "primary"
      ? { background: "#4f46e5", color: "#fff", border: "none", fontWeight: 500 }
      : { background: "#fff", color: "var(--pf-text)", border: "1px solid var(--pf-line)" }),
  };
}
