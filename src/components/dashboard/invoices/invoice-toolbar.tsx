"use client";

import { InvoiceStatus } from "@/lib/invoices-data";

type FilterTab = "all" | InvoiceStatus;

interface Props {
  query: string;
  onQuery: (q: string) => void;
  filter: FilterTab;
  onFilter: (f: FilterTab) => void;
  counts: Record<FilterTab, number>;
  onExport: () => void;
}

const TABS: { key: FilterTab; label: string }[] = [
  { key: "all",     label: "All"     },
  { key: "paid",    label: "Paid"    },
  { key: "pending", label: "Pending" },
  { key: "overdue", label: "Overdue" },
  { key: "draft",   label: "Draft"   },
];

const DOT_COLORS: Record<FilterTab, string> = {
  all:     "transparent",
  paid:    "#22c55e",
  pending: "#f59e0b",
  overdue: "#ef4444",
  draft:   "#94a3b8",
};

export function InvoiceToolbar({
  query, onQuery,
  filter, onFilter,
  counts, onExport,
}: Props) {
  return (
    <div
      style={{
        background: "#fff",
        borderBottom: "1px solid var(--pf-line)",
        padding: "10px 20px",
        display: "flex",
        alignItems: "center",
        gap: 8,
        flexWrap: "wrap" as const,
      }}
    >
      {/* Status filter tabs */}
      {TABS.map(t => {
        const active = filter === t.key;
        return (
          <button
            key={t.key}
            type="button"
            onClick={() => onFilter(t.key)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "6px 12px",
              borderRadius: 7,
              cursor: "pointer",
              border: active ? "1px solid #4f46e5" : "1px solid var(--pf-line)",
              background: active ? "#eef2ff" : "#fff",
              fontSize: "12.5px",
              color: active ? "#4f46e5" : "var(--pf-text-2)",
              fontFamily: "var(--font-inter)",
              transition: "all .15s",
            }}
          >
            {t.key !== "all" && (
              <span
                aria-hidden="true"
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  background: DOT_COLORS[t.key],
                  flexShrink: 0,
                }}
              />
            )}
            {t.label}
            <span
              style={{
                fontSize: 11,
                padding: "1px 6px",
                borderRadius: 99,
                background: active ? "#4f46e5" : "var(--pf-surface-2)",
                color: active ? "#fff" : "var(--pf-text-3)",
              }}
            >
              {counts[t.key]}
            </span>
          </button>
        );
      })}

      {/* Divider */}
      <div
        aria-hidden="true"
        style={{ width: 1, height: 20, background: "var(--pf-line)", margin: "0 2px" }}
      />

      {/* Client filter */}
      <button
        type="button"
        style={ghostBtn}
      >
        <i className="ti ti-building" aria-hidden="true" style={{ fontSize: 14 }} />
        Client
        <i className="ti ti-chevron-down" aria-hidden="true" style={{ fontSize: 12, opacity: 0.6 }} />
      </button>

      {/* Date range */}
      <button type="button" style={ghostBtn}>
        <i className="ti ti-calendar" aria-hidden="true" style={{ fontSize: 14 }} />
        Date range
        <i className="ti ti-chevron-down" aria-hidden="true" style={{ fontSize: 12, opacity: 0.6 }} />
      </button>

      {/* Amount range */}
      <button type="button" style={ghostBtn}>
        <i className="ti ti-coins" aria-hidden="true" style={{ fontSize: 14 }} />
        Amount
        <i className="ti ti-chevron-down" aria-hidden="true" style={{ fontSize: 12, opacity: 0.6 }} />
      </button>

      {/* Push search + export right */}
      <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
        {/* Search */}
        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: 7,
            background: "var(--pf-surface)",
            border: "1px solid var(--pf-line)",
            borderRadius: 8,
            padding: "6px 11px",
          }}
        >
          <i
            className="ti ti-search"
            aria-hidden="true"
            style={{ fontSize: 14, color: "var(--pf-text-3)", flexShrink: 0 }}
          />
          <input
            type="search"
            value={query}
            onChange={e => onQuery(e.target.value)}
            placeholder="Search invoices…"
            aria-label="Search invoices"
            style={{
              border: "none",
              background: "transparent",
              fontSize: 13,
              color: "var(--pf-text)",
              outline: "none",
              width: 176,
              fontFamily: "var(--font-inter)",
            }}
          />
        </label>

        {/* Export */}
        <button
          type="button"
          onClick={onExport}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "6px 14px",
            borderRadius: 8,
            border: "1px solid var(--pf-line)",
            background: "#fff",
            fontSize: 13,
            color: "var(--pf-text)",
            cursor: "pointer",
            fontFamily: "var(--font-inter)",
          }}
        >
          <i className="ti ti-download" aria-hidden="true" style={{ fontSize: 15 }} />
          Export
        </button>
      </div>
    </div>
  );
}

const ghostBtn: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 5,
  padding: "6px 11px",
  borderRadius: 7,
  border: "1px solid var(--pf-line)",
  background: "#fff",
  fontSize: "12.5px",
  color: "var(--pf-text-2)",
  cursor: "pointer",
  fontFamily: "var(--font-inter)",
};
