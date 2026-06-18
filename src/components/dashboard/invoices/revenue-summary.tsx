"use client";

import { INVOICES } from "@/lib/invoices-data";

export function RevenueSummary() {
  const paid     = INVOICES.filter(i => i.status === "paid");
  const pending  = INVOICES.filter(i => i.status === "pending");
  const overdue  = INVOICES.filter(i => i.status === "overdue");
  const draft    = INVOICES.filter(i => i.status === "draft");

  const totalCollected   = paid.reduce((s, i) => s + i.amount, 0);
  const totalPending     = pending.reduce((s, i) => s + i.amount, 0);
  const totalOverdue     = overdue.reduce((s, i) => s + i.amount, 0);
  const totalDraft       = draft.reduce((s, i) => s + i.amount, 0);
  const totalOutstanding = totalPending + totalOverdue;

  const cards = [
    {
      label:    "Total collected",
      value:    `$${(totalCollected / 1000).toFixed(1)}k`,
      sub:      `${paid.length} invoices`,
      icon:     "ti-circle-check",
      iconBg:   "#f0fdf4",
      iconClr:  "#16a34a",
      trend:    "+12% vs last period",
      trendUp:  true,
    },
    {
      label:    "Outstanding",
      value:    `$${(totalOutstanding / 1000).toFixed(1)}k`,
      sub:      `${pending.length + overdue.length} invoices`,
      icon:     "ti-clock",
      iconBg:   "#fffbeb",
      iconClr:  "#d97706",
      trend:    `${pending.length} pending`,
      trendUp:  null,
    },
    {
      label:    "Overdue",
      value:    `$${(totalOverdue / 1000).toFixed(1)}k`,
      sub:      `${overdue.length} invoice${overdue.length !== 1 ? "s" : ""}`,
      icon:     "ti-alert-circle",
      iconBg:   "#fef2f2",
      iconClr:  "#dc2626",
      trend:    "Needs attention",
      trendUp:  false,
    },
    {
      label:    "Draft",
      value:    `$${(totalDraft / 1000).toFixed(1)}k`,
      sub:      `${draft.length} invoice${draft.length !== 1 ? "s" : ""}`,
      icon:     "ti-pencil",
      iconBg:   "#f8fafc",
      iconClr:  "#64748b",
      trend:    "Not yet sent",
      trendUp:  null,
    },
  ];

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: 1,
        background: "var(--pf-line)",
        borderTop: "1px solid var(--pf-line)",
        borderBottom: "1px solid var(--pf-line)",
      }}
    >
      {cards.map((c, i) => (
        <div
          key={i}
          style={{
            background: "#fff",
            padding: "20px 22px",
            display: "flex",
            gap: 14,
            alignItems: "flex-start",
          }}
        >
          {/* Icon */}
          <div
            aria-hidden="true"
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              background: c.iconBg,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <i className={`ti ${c.icon}`} style={{ fontSize: 19, color: c.iconClr }} />
          </div>

          {/* Text */}
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, color: "var(--pf-text-3)", marginBottom: 3 }}>
              {c.label}
            </div>
            <div
              style={{
                fontFamily: "var(--font-inter-tight)",
                fontSize: 22,
                fontWeight: 700,
                color: "var(--pf-text)",
                lineHeight: 1.1,
                marginBottom: 4,
              }}
            >
              {c.value}
            </div>
            <div style={{ fontSize: 12, color: "var(--pf-text-3)" }}>{c.sub}</div>
            {c.trend && (
              <div
                style={{
                  marginTop: 6,
                  fontSize: 11.5,
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  color:
                    c.trendUp === true
                      ? "#16a34a"
                      : c.trendUp === false
                      ? "#dc2626"
                      : "var(--pf-text-3)",
                }}
              >
                {c.trendUp === true  && <i className="ti ti-trending-up"   style={{ fontSize: 13 }} />}
                {c.trendUp === false && <i className="ti ti-trending-down"  style={{ fontSize: 13 }} />}
                {c.trendUp === null  && <i className="ti ti-info-circle"    style={{ fontSize: 13 }} />}
                {c.trend}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
