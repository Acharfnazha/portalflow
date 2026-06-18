"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import type { Client } from "@/types/app.types";
import { StatusBadge } from "./status-badge";
import { HealthBar } from "./health-bar";
import { getAvatarColors, getInitials, formatCurrency, formatRelative } from "@/lib/format";

interface Props {
  clients: Client[];
  selected: Set<string>;
  onToggle: (id: string) => void;
  onToggleAll: (ids: string[]) => void;
  onEdit: (client: Client) => void;
  onDelete: (client: Client) => void;
}

type SortKey = "name" | "mrr" | "health" | "updated_at";
type SortDir = "asc" | "desc";

const COL_WIDTHS = { chk: 36, client: 220, status: 112, owner: 110, contact: 160, mrr: 96, health: 112, activity: 110, actions: 130 };

function SortIcon({ col, sort }: { col: SortKey; sort: { key: SortKey; dir: SortDir } }) {
  if (sort.key !== col) return <i className="ti ti-selector" aria-hidden="true" style={{ fontSize: 12, marginLeft: 3, opacity: 0.4 }} />;
  return <i className={`ti ti-chevron-${sort.dir === "asc" ? "up" : "down"}`} aria-hidden="true" style={{ fontSize: 12, marginLeft: 3, color: "#4f46e5" }} />;
}

export function ClientsTable({ clients, selected, onToggle, onToggleAll, onEdit, onDelete }: Props) {
  const [sort, setSort] = useState<{ key: SortKey; dir: SortDir }>({ key: "mrr", dir: "desc" });
  const [hovered, setHovered] = useState<string | null>(null);

  function toggleSort(key: SortKey) {
    setSort(s => ({ key, dir: s.key === key && s.dir === "asc" ? "desc" : "asc" }));
  }

  const sorted = [...clients].sort((a, b) => {
    const mul = sort.dir === "asc" ? 1 : -1;
    if (sort.key === "name")       return mul * a.name.localeCompare(b.name);
    if (sort.key === "mrr")        return mul * (a.mrrCents - b.mrrCents);
    if (sort.key === "health")     return mul * (a.healthScore - b.healthScore);
    if (sort.key === "updated_at") return mul * a.updatedAt.localeCompare(b.updatedAt);
    return 0;
  });

  const allSelected = clients.length > 0 && clients.every(c => selected.has(c.id));

  const thStyle: React.CSSProperties = {
    textAlign: "left", fontSize: "11.5px", fontWeight: 500, color: "var(--pf-text-3)",
    padding: "9px 12px", borderBottom: "1px solid var(--pf-line)",
    whiteSpace: "nowrap", cursor: "pointer", userSelect: "none",
  };
  const tdStyle: React.CSSProperties = {
    padding: "11px 12px", color: "var(--pf-text)", verticalAlign: "middle",
    whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", fontSize: 13,
  };

  return (
    <div style={{ padding: "0 20px", overflowX: "auto" }}>
      <table aria-label="Clients" style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
        <colgroup>
          {Object.values(COL_WIDTHS).map((w, i) => <col key={i} style={{ width: w }} />)}
        </colgroup>
        <thead>
          <tr>
            <th style={{ ...thStyle, cursor: "default" }}>
              <input type="checkbox" checked={allSelected} onChange={() => onToggleAll(clients.map(c => c.id))} aria-label="Select all" style={{ width: 14, height: 14, accentColor: "#4f46e5", cursor: "pointer" }} />
            </th>
            <th style={thStyle} onClick={() => toggleSort("name")}>Client <SortIcon col="name" sort={sort} /></th>
            <th style={{ ...thStyle, cursor: "default" }}>Status</th>
            <th style={{ ...thStyle, cursor: "default" }}>Owner</th>
            <th style={{ ...thStyle, cursor: "default" }}>Contact</th>
            <th style={thStyle} onClick={() => toggleSort("mrr")}>MRR <SortIcon col="mrr" sort={sort} /></th>
            <th style={thStyle} onClick={() => toggleSort("health")}>Health <SortIcon col="health" sort={sort} /></th>
            <th style={thStyle} onClick={() => toggleSort("updated_at")}>Last update <SortIcon col="updated_at" sort={sort} /></th>
            <th style={{ ...thStyle, cursor: "default" }} />
          </tr>
        </thead>
        <tbody>
          {sorted.map((client, idx) => {
            const { bg, color } = getAvatarColors(client.name);
            const initials = getInitials(client.name);
            return (
              <motion.tr
                key={client.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: idx * 0.03 }}
                onMouseEnter={() => setHovered(client.id)}
                onMouseLeave={() => setHovered(null)}
                style={{
                  borderBottom: "1px solid var(--pf-line)",
                  background: hovered === client.id ? "var(--pf-surface)" : "#fff",
                  transition: "background .1s",
                }}
              >
                <td style={tdStyle}>
                  <input type="checkbox" checked={selected.has(client.id)} onChange={() => onToggle(client.id)} aria-label={`Select ${client.name}`} onClick={e => e.stopPropagation()} style={{ width: 14, height: 14, accentColor: "#4f46e5", cursor: "pointer" }} />
                </td>

                <td style={tdStyle}>
                  <Link href={`/dashboard/clients/${client.id}`} style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 30, height: 30, borderRadius: 8, background: bg, color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 600, flexShrink: 0 }}>
                      {initials}
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 500, color: "var(--pf-text)" }}>{client.name}</div>
                      <div style={{ fontSize: "11.5px", color: "var(--pf-text-3)" }}>{client.domain ?? client.website ?? "—"}</div>
                    </div>
                  </Link>
                </td>

                <td style={tdStyle}><StatusBadge status={client.status} /></td>

                <td style={{ ...tdStyle, color: "var(--pf-text-2)", fontSize: "12.5px" }}>
                  {(client as Client & { ownerName?: string }).ownerName ?? "—"}
                </td>

                <td style={{ ...tdStyle, color: "var(--pf-text-2)", fontSize: "12.5px" }}>{client.email ?? "—"}</td>

                <td style={{ ...tdStyle, fontWeight: 500 }}>
                  {client.mrrCents > 0 ? formatCurrency(client.mrrCents) : "—"}
                </td>

                <td style={tdStyle}><HealthBar score={client.healthScore} /></td>

                <td style={{ ...tdStyle, color: "var(--pf-text-3)", fontSize: "12.5px" }}>
                  {formatRelative(client.updatedAt)}
                </td>

                <td style={tdStyle}>
                  <div style={{ display: "flex", gap: 5, alignItems: "center", opacity: hovered === client.id ? 1 : 0, transition: "opacity .15s" }}>
                    <button
                      type="button"
                      aria-label={`Edit ${client.name}`}
                      onClick={e => { e.stopPropagation(); onEdit(client); }}
                      style={actionBtn}
                    >
                      <i className="ti ti-pencil" aria-hidden="true" style={{ fontSize: 13 }} />
                      Edit
                    </button>
                    <button
                      type="button"
                      aria-label={`Delete ${client.name}`}
                      onClick={e => { e.stopPropagation(); onDelete(client); }}
                      style={{ ...actionBtn, color: "#dc2626", borderColor: "#fecaca" }}
                    >
                      <i className="ti ti-trash" aria-hidden="true" style={{ fontSize: 13 }} />
                    </button>
                  </div>
                </td>
              </motion.tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

const actionBtn: React.CSSProperties = {
  display: "flex", alignItems: "center", gap: 4,
  padding: "4px 9px", borderRadius: 6,
  border: "1px solid var(--pf-line)", background: "#fff",
  fontSize: 12, color: "var(--pf-text-2)", cursor: "pointer",
  fontFamily: "var(--font-inter)", whiteSpace: "nowrap",
};
