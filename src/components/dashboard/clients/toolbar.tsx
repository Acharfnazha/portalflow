"use client";

import { CLIENT_STATUS_CONFIG } from "@/lib/constants";
import type { ClientStatus } from "@/types/app.types";

type FilterTab = "all" | ClientStatus;
type ViewMode  = "table" | "board" | "list";

interface Props {
  activeFilter: FilterTab;
  onFilter: (f: FilterTab) => void;
  viewMode: ViewMode;
  onViewMode: (v: ViewMode) => void;
  counts: Record<FilterTab, number>;
}

export function ClientsToolbar({ activeFilter, onFilter, viewMode, onViewMode, counts }: Props) {
  const tabs: { key: FilterTab; label: string; dotColor?: string }[] = [
    { key: "all",     label: "All" },
    { key: "active",  label: "Active",   dotColor: CLIENT_STATUS_CONFIG.active.dot  },
    { key: "trial",   label: "Trial",    dotColor: CLIENT_STATUS_CONFIG.trial.dot   },
    { key: "at_risk", label: "At risk",  dotColor: CLIENT_STATUS_CONFIG.at_risk.dot },
    { key: "churned", label: "Churned",  dotColor: CLIENT_STATUS_CONFIG.churned.dot },
  ];

  return (
    <div style={{ padding: "0 20px 12px", display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", borderBottom: "1px solid var(--pf-line)" }}>
      {tabs.map(t => (
        <button
          key={t.key}
          type="button"
          onClick={() => onFilter(t.key)}
          style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "6px 12px", borderRadius: 7,
            border: activeFilter === t.key ? "1px solid #4f46e5" : "1px solid var(--pf-line)",
            background: activeFilter === t.key ? "#eef2ff" : "#fff",
            fontSize: "12.5px",
            color: activeFilter === t.key ? "#4f46e5" : "var(--pf-text-2)",
            cursor: "pointer", fontFamily: "var(--font-inter)", transition: "all .15s",
          }}
        >
          {t.dotColor && (
            <span aria-hidden="true" style={{ width: 7, height: 7, borderRadius: "50%", background: t.dotColor, flexShrink: 0 }} />
          )}
          {t.label}
          {t.key === "all" && (
            <span style={{ fontSize: 11, background: activeFilter === "all" ? "#4f46e5" : "var(--pf-surface-2)", color: activeFilter === "all" ? "#fff" : "var(--pf-text-3)", padding: "1px 7px", borderRadius: 99, marginLeft: 2 }}>
              {counts[t.key]}
            </span>
          )}
        </button>
      ))}

      <div aria-hidden="true" style={{ width: 1, height: 20, background: "var(--pf-line)", margin: "0 2px" }} />

      <button type="button" style={filterBtn}>
        <i className="ti ti-user" aria-hidden="true" style={{ fontSize: 14 }} /> Owner
      </button>
      <button type="button" style={filterBtn}>
        <i className="ti ti-tag" aria-hidden="true" style={{ fontSize: 14 }} /> Tag
      </button>
      <button type="button" style={filterBtn}>
        <i className="ti ti-calendar" aria-hidden="true" style={{ fontSize: 14 }} /> Date added
      </button>

      <div role="group" aria-label="View mode" style={{ display: "flex", background: "var(--pf-surface-2)", border: "1px solid var(--pf-line)", borderRadius: 8, padding: 3, gap: 2, marginLeft: "auto" }}>
        {(["table", "board", "list"] as ViewMode[]).map(v => (
          <button
            key={v}
            type="button"
            onClick={() => onViewMode(v)}
            aria-pressed={viewMode === v}
            style={{
              padding: "4px 11px", borderRadius: 6, fontSize: 12, cursor: "pointer",
              color: viewMode === v ? "var(--pf-text)" : "var(--pf-text-3)",
              background: viewMode === v ? "#fff" : "transparent",
              fontWeight: viewMode === v ? 500 : 400,
              border: "none", fontFamily: "var(--font-inter)", textTransform: "capitalize",
            }}
          >
            {v}
          </button>
        ))}
      </div>
    </div>
  );
}

const filterBtn: React.CSSProperties = {
  display: "flex", alignItems: "center", gap: 6,
  padding: "6px 12px", borderRadius: 7,
  border: "1px solid var(--pf-line)", background: "#fff",
  fontSize: "12.5px", color: "var(--pf-text-2)",
  cursor: "pointer", fontFamily: "var(--font-inter)",
};
