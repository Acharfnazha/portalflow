"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { InvoiceItem, INVOICE_STATUS_CFG } from "@/lib/invoices-data";

type SortKey = "id" | "client" | "amount" | "date" | "dueDate" | "status";
type SortDir = "asc" | "desc";

interface Props {
  invoices: InvoiceItem[];
  selected: Set<string>;
  onToggle: (id: string) => void;
  onToggleAll: (ids: string[]) => void;
  onExportOne: (invoice: InvoiceItem) => void;
}

function fmtDate(s: string) {
  return new Date(s).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function isOverdue(dueDate: string, status: InvoiceItem["status"]) {
  return status === "overdue" || (status === "pending" && new Date(dueDate) < new Date());
}

const COL: React.CSSProperties = {
  textAlign: "left" as const,
  fontSize: 11.5,
  fontWeight: 500,
  color: "var(--pf-text-3)",
  padding: "9px 14px",
  borderBottom: "1px solid var(--pf-line)",
  whiteSpace: "nowrap" as const,
  userSelect: "none" as const,
  cursor: "pointer",
};

const CELL: React.CSSProperties = {
  padding: "12px 14px",
  verticalAlign: "middle" as const,
  whiteSpace: "nowrap" as const,
  overflow: "hidden",
  textOverflow: "ellipsis",
  fontSize: 13,
  color: "var(--pf-text)",
};

function SortIcon({ col, sort }: { col: SortKey; sort: { key: SortKey; dir: SortDir } }) {
  if (sort.key !== col)
    return (
      <i
        className="ti ti-selector"
        aria-hidden="true"
        style={{ fontSize: 11, marginLeft: 3, opacity: 0.4 }}
      />
    );
  return (
    <i
      className={`ti ti-chevron-${sort.dir === "asc" ? "up" : "down"}`}
      aria-hidden="true"
      style={{ fontSize: 11, marginLeft: 3, color: "#4f46e5" }}
    />
  );
}

export function InvoiceTable({
  invoices,
  selected,
  onToggle,
  onToggleAll,
  onExportOne,
}: Props) {
  const [sort, setSort] = useState<{ key: SortKey; dir: SortDir }>({
    key: "date",
    dir: "desc",
  });
  const [hovered, setHovered] = useState<string | null>(null);

  function toggleSort(key: SortKey) {
    setSort(s => ({
      key,
      dir: s.key === key && s.dir === "desc" ? "asc" : "desc",
    }));
  }

  const sorted = [...invoices].sort((a, b) => {
    const m = sort.dir === "asc" ? 1 : -1;
    switch (sort.key) {
      case "id":      return m * a.id.localeCompare(b.id);
      case "client":  return m * a.client.localeCompare(b.client);
      case "amount":  return m * (a.amount - b.amount);
      case "date":    return m * (new Date(a.date).getTime() - new Date(b.date).getTime());
      case "dueDate": return m * (new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
      case "status":  return m * a.status.localeCompare(b.status);
      default: return 0;
    }
  });

  const allSelected =
    sorted.length > 0 && sorted.every(i => selected.has(i.id));

  if (sorted.length === 0) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "60px 0",
          gap: 8,
          color: "var(--pf-text-3)",
        }}
      >
        <i
          className="ti ti-receipt-off"
          aria-hidden="true"
          style={{ fontSize: 40, opacity: 0.3 }}
        />
        <p style={{ fontSize: 14 }}>No invoices match your search.</p>
      </div>
    );
  }

  return (
    <div style={{ overflowX: "auto" }}>
      <table
        aria-label="Invoices"
        style={{ width: "100%", borderCollapse: "collapse", tableLayout: "auto" }}
      >
        {/* Column widths */}
        <colgroup>
          <col style={{ width: 36 }} />
          <col style={{ width: 130 }} />
          <col style={{ width: 180 }} />
          <col style={{ width: 200 }} />
          <col style={{ width: 120 }} />
          <col style={{ width: 110 }} />
          <col style={{ width: 120 }} />
          <col style={{ width: 120 }} />
          <col style={{ width: 160 }} />
        </colgroup>

        <thead style={{ background: "var(--pf-surface)" }}>
          <tr>
            {/* Checkbox */}
            <th style={{ ...COL, cursor: "default", padding: "9px 14px 9px 20px" }}>
              <input
                type="checkbox"
                checked={allSelected}
                onChange={() => onToggleAll(sorted.map(i => i.id))}
                aria-label="Select all"
                style={{ width: 14, height: 14, accentColor: "#4f46e5", cursor: "pointer" }}
              />
            </th>
            <th style={COL} onClick={() => toggleSort("id")}>
              Invoice <SortIcon col="id" sort={sort} />
            </th>
            <th style={COL} onClick={() => toggleSort("client")}>
              Client <SortIcon col="client" sort={sort} />
            </th>
            <th style={{ ...COL, cursor: "default" }}>Project</th>
            <th
              style={{ ...COL, textAlign: "right" as const }}
              onClick={() => toggleSort("amount")}
            >
              Amount <SortIcon col="amount" sort={sort} />
            </th>
            <th style={COL} onClick={() => toggleSort("status")}>
              Status <SortIcon col="status" sort={sort} />
            </th>
            <th style={COL} onClick={() => toggleSort("date")}>
              Issued <SortIcon col="date" sort={sort} />
            </th>
            <th style={COL} onClick={() => toggleSort("dueDate")}>
              Due date <SortIcon col="dueDate" sort={sort} />
            </th>
            <th style={{ ...COL, cursor: "default" }} />
          </tr>
        </thead>

        <tbody>
          {sorted.map((inv, idx) => {
            const sc     = INVOICE_STATUS_CFG[inv.status];
            const isHov  = hovered === inv.id;
            const isSel  = selected.has(inv.id);
            const pastDue = isOverdue(inv.dueDate, inv.status);

            return (
              <motion.tr
                key={inv.id}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.18, delay: idx * 0.025 }}
                onMouseEnter={() => setHovered(inv.id)}
                onMouseLeave={() => setHovered(null)}
                style={{
                  borderBottom: "1px solid var(--pf-line)",
                  background: isSel
                    ? "#eef2ff"
                    : isHov
                    ? "var(--pf-surface)"
                    : "#fff",
                  transition: "background .1s",
                  cursor: "pointer",
                }}
              >
                {/* Checkbox */}
                <td style={{ ...CELL, padding: "12px 14px 12px 20px" }}>
                  <input
                    type="checkbox"
                    checked={isSel}
                    onChange={() => onToggle(inv.id)}
                    onClick={e => e.stopPropagation()}
                    aria-label={`Select ${inv.id}`}
                    style={{ width: 14, height: 14, accentColor: "#4f46e5", cursor: "pointer" }}
                  />
                </td>

                {/* Invoice ID */}
                <td style={CELL}>
                  <span
                    style={{
                      fontFamily: "var(--font-jetbrains-mono, 'Courier New', monospace)",
                      fontSize: 12.5,
                      fontWeight: 600,
                      color: "#4f46e5",
                      background: "#eef2ff",
                      padding: "2px 8px",
                      borderRadius: 5,
                    }}
                  >
                    {inv.id}
                  </span>
                </td>

                {/* Client */}
                <td style={CELL}>
                  <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                    <div
                      aria-hidden="true"
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 7,
                        background: inv.clientAvatarBg,
                        color: inv.clientAvatarColor,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 10,
                        fontWeight: 600,
                        flexShrink: 0,
                      }}
                    >
                      {inv.clientInitials}
                    </div>
                    <span
                      style={{
                        fontSize: 13,
                        fontWeight: 500,
                        color: "var(--pf-text)",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {inv.client}
                    </span>
                  </div>
                </td>

                {/* Project */}
                <td style={{ ...CELL, color: "var(--pf-text-2)", fontSize: 12.5 }}>
                  {inv.project}
                </td>

                {/* Amount */}
                <td
                  style={{
                    ...CELL,
                    textAlign: "right" as const,
                    fontFamily: "var(--font-inter-tight)",
                    fontSize: 14,
                    fontWeight: 700,
                  }}
                >
                  ${inv.amount.toLocaleString()}
                </td>

                {/* Status */}
                <td style={CELL}>
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 5,
                      fontSize: 11.5,
                      fontWeight: 500,
                      padding: "3px 9px",
                      borderRadius: 99,
                      background: sc.badgeBg,
                      color: sc.badgeColor,
                    }}
                  >
                    <span
                      aria-hidden="true"
                      style={{
                        width: 5,
                        height: 5,
                        borderRadius: "50%",
                        background: sc.dotColor,
                        flexShrink: 0,
                      }}
                    />
                    {sc.label}
                  </span>
                </td>

                {/* Issued */}
                <td style={{ ...CELL, color: "var(--pf-text-2)", fontSize: 12.5 }}>
                  {fmtDate(inv.date)}
                </td>

                {/* Due date */}
                <td
                  style={{
                    ...CELL,
                    fontSize: 12.5,
                    color: pastDue ? "#dc2626" : "var(--pf-text-2)",
                    fontWeight: pastDue ? 500 : 400,
                  }}
                >
                  {pastDue && (
                    <i
                      className="ti ti-alert-triangle"
                      aria-hidden="true"
                      style={{ fontSize: 12, marginRight: 4 }}
                    />
                  )}
                  {fmtDate(inv.dueDate)}
                </td>

                {/* Row actions */}
                <td style={CELL}>
                  <div
                    style={{
                      display: "flex",
                      gap: 5,
                      alignItems: "center",
                      opacity: isHov || isSel ? 1 : 0,
                      transition: "opacity .15s",
                    }}
                  >
                    <ActionBtn
                      icon="ti-file-type-pdf"
                      label={`Download PDF for ${inv.id}`}
                      onClick={() => onExportOne(inv)}
                    />
                    {inv.status === "draft" || inv.status === "pending" ? (
                      <ActionBtn icon="ti-send" label={`Send ${inv.id}`} />
                    ) : (
                      <ActionBtn icon="ti-copy" label={`Duplicate ${inv.id}`} />
                    )}
                    <ActionBtn icon="ti-dots-vertical" label="More options" />
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

function ActionBtn({
  icon,
  label,
  onClick,
}: {
  icon: string;
  label: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      style={{
        width: 30,
        height: 30,
        borderRadius: 6,
        border: "1px solid var(--pf-line)",
        background: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        color: "var(--pf-text-2)",
        flexShrink: 0,
      }}
    >
      <i className={`ti ${icon}`} aria-hidden="true" style={{ fontSize: 14 }} />
    </button>
  );
}
