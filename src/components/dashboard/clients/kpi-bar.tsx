"use client";

import { formatCurrency } from "@/lib/format";

interface Props {
  total: number;
  active: number;
  atRisk: number;
  totalMrrCents: number;
}

export function ClientsKpiBar({ total, active, atRisk, totalMrrCents }: Props) {
  const avgMrr = total ? Math.round(totalMrrCents / total) : 0;

  const cards = [
    { icon: "ti-users",          label: "Total clients",      value: total,                         sub: "+4 this month",  subColor: "#16a34a" },
    { icon: "ti-circle-check",   label: "Active",             value: active,                        sub: total ? `${Math.round((active / total) * 100)}% of total` : "0%", subColor: "var(--pf-text-3)" },
    { icon: "ti-alert-triangle", label: "At risk",            value: atRisk,                        sub: "+2 vs last month", subColor: atRisk > 0 ? "#dc2626" : "var(--pf-text-3)" },
    { icon: "ti-chart-bar",      label: "Avg. MRR / client",  value: formatCurrency(avgMrr),        sub: "+12% vs last month", subColor: "#16a34a" },
  ];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, padding: "16px 20px" }}>
      {cards.map(c => (
        <div key={c.label} style={{ background: "var(--pf-surface)", borderRadius: 9, padding: "12px 14px" }}>
          <div style={{ fontSize: "11.5px", color: "var(--pf-text-3)", display: "flex", alignItems: "center", gap: 5 }}>
            <i className={`ti ${c.icon}`} aria-hidden="true" style={{ fontSize: 14 }} />
            {c.label}
          </div>
          <div style={{ fontSize: 22, fontWeight: 600, fontFamily: "var(--font-inter-tight)", color: "var(--pf-text)", marginTop: 5, lineHeight: 1 }}>
            {c.value}
          </div>
          <div style={{ fontSize: "11.5px", color: c.subColor, marginTop: 4, display: "flex", alignItems: "center", gap: 3 }}>
            <i className="ti ti-trending-up" aria-hidden="true" style={{ fontSize: 12 }} />
            {c.sub}
          </div>
        </div>
      ))}
    </div>
  );
}
