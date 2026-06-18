"use client";

import { useState } from "react";
import { getMonthlyRevenue } from "@/lib/invoices-data";

function fmt(n: number) {
  if (n >= 1000) return `$${(n / 1000).toFixed(0)}k`;
  return `$${n}`;
}

export function RevenueChart() {
  const data   = getMonthlyRevenue(6);
  const [hovered, setHovered] = useState<number | null>(null);

  const maxVal = Math.max(...data.map(d => d.collected + d.outstanding), 1);

  const totalCollected   = data.reduce((s, d) => s + d.collected, 0);
  const totalOutstanding = data.reduce((s, d) => s + d.outstanding, 0);

  return (
    <div
      style={{
        background: "#fff",
        borderBottom: "1px solid var(--pf-line)",
        padding: "20px 24px 16px",
      }}
    >
      {/* Chart header */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          marginBottom: 20,
        }}
      >
        <div>
          <div
            style={{
              fontFamily: "var(--font-inter-tight)",
              fontSize: 15,
              fontWeight: 600,
              color: "var(--pf-text)",
            }}
          >
            Revenue overview
          </div>
          <div style={{ fontSize: 12, color: "var(--pf-text-3)", marginTop: 2 }}>
            Last 6 months
          </div>
        </div>

        {/* Totals + Legend */}
        <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
          <LegendItem color="#4f46e5" label="Collected" value={fmt(totalCollected)} />
          <LegendItem color="#fbbf24" label="Outstanding" value={fmt(totalOutstanding)} />
        </div>
      </div>

      {/* Bars */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          gap: 10,
          height: 120,
        }}
      >
        {data.map((d, i) => {
          const totalH  = ((d.collected + d.outstanding) / maxVal) * 100;
          const paidH   = totalH > 0 ? (d.collected / (d.collected + d.outstanding)) * totalH : 0;
          const pendH   = totalH - paidH;
          const isHov   = hovered === i;

          return (
            <div
              key={i}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 6,
                cursor: "default",
                position: "relative",
              }}
            >
              {/* Tooltip */}
              {isHov && (
                <div
                  style={{
                    position: "absolute",
                    bottom: "calc(100% + 6px)",
                    left: "50%",
                    transform: "translateX(-50%)",
                    background: "#0f172a",
                    color: "#fff",
                    borderRadius: 7,
                    padding: "7px 10px",
                    fontSize: 11.5,
                    whiteSpace: "nowrap" as const,
                    zIndex: 10,
                    pointerEvents: "none",
                  }}
                >
                  <div style={{ fontWeight: 600, marginBottom: 2 }}>{d.month}</div>
                  {d.collected > 0 && (
                    <div style={{ color: "#86efac" }}>
                      Collected: {fmt(d.collected)}
                    </div>
                  )}
                  {d.outstanding > 0 && (
                    <div style={{ color: "#fde68a" }}>
                      Outstanding: {fmt(d.outstanding)}
                    </div>
                  )}
                  {d.collected === 0 && d.outstanding === 0 && (
                    <div style={{ color: "#94a3b8" }}>No invoices</div>
                  )}
                  {/* Arrow */}
                  <div
                    style={{
                      position: "absolute",
                      top: "100%",
                      left: "50%",
                      transform: "translateX(-50%)",
                      width: 0,
                      height: 0,
                      borderLeft: "5px solid transparent",
                      borderRight: "5px solid transparent",
                      borderTop: "5px solid #0f172a",
                    }}
                  />
                </div>
              )}

              {/* Stacked bar */}
              <div
                style={{
                  width: "100%",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "flex-end",
                  height: 100,
                  borderRadius: 6,
                  overflow: "hidden",
                  background: isHov ? "var(--pf-surface-2)" : "var(--pf-surface)",
                  transition: "background .15s",
                }}
              >
                {totalH === 0 ? (
                  <div
                    style={{
                      height: 3,
                      background: "var(--pf-line)",
                      borderRadius: 99,
                      margin: "0 8px",
                    }}
                  />
                ) : (
                  <>
                    {/* Outstanding (top, amber) */}
                    {pendH > 0 && (
                      <div
                        style={{
                          height: `${pendH}%`,
                          background: isHov ? "#fbbf24" : "#fde68a",
                          transition: "background .15s, height .4s ease",
                        }}
                      />
                    )}
                    {/* Collected (bottom, indigo) */}
                    {paidH > 0 && (
                      <div
                        style={{
                          height: `${paidH}%`,
                          background: isHov ? "#4f46e5" : "#6366f1",
                          transition: "background .15s, height .4s ease",
                        }}
                      />
                    )}
                  </>
                )}
              </div>

              {/* Month label */}
              <div
                style={{
                  fontSize: 11,
                  color: isHov ? "var(--pf-text)" : "var(--pf-text-3)",
                  fontWeight: isHov ? 500 : 400,
                  transition: "color .15s",
                  textAlign: "center" as const,
                }}
              >
                {d.month}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function LegendItem({
  color,
  label,
  value,
}: {
  color: string;
  label: string;
  value: string;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <span
        aria-hidden="true"
        style={{
          width: 10,
          height: 10,
          borderRadius: 3,
          background: color,
          flexShrink: 0,
        }}
      />
      <div>
        <div style={{ fontSize: 11, color: "var(--pf-text-3)" }}>{label}</div>
        <div
          style={{
            fontFamily: "var(--font-inter-tight)",
            fontSize: 14,
            fontWeight: 700,
            color: "var(--pf-text)",
          }}
        >
          {value}
        </div>
      </div>
    </div>
  );
}
