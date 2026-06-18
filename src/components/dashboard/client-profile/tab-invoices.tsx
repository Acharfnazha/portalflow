"use client";

import { motion } from "framer-motion";
import { INVOICE_STATUS_CONFIG } from "@/lib/projects-data";

// Mock data retained until Invoices Module sprint
const INVOICES: { clientId: string; id: string; project: string; amount: number; status: string; date: string; dueDate: string }[] = [];

interface Props { clientId: string }

function fmtDate(s: string) {
  return new Date(s).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function TabInvoices({ clientId }: Props) {
  const invoices = INVOICES.filter(inv => inv.clientId === clientId);
  const total    = invoices.reduce((s, i) => s + i.amount, 0);
  const paid     = invoices.filter(i => i.status === "paid").reduce((s, i) => s + i.amount, 0);
  const pending  = invoices.filter(i => i.status === "pending" || i.status === "overdue").reduce((s, i) => s + i.amount, 0);

  return (
    <div>
      {/* Summary stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 20 }}>
        {[
          { label: "Total billed",  value: `$${total.toLocaleString()}`,   icon: "ti-receipt",     color: "#4f46e5" },
          { label: "Collected",     value: `$${paid.toLocaleString()}`,    icon: "ti-circle-check", color: "#16a34a" },
          { label: "Outstanding",   value: `$${pending.toLocaleString()}`, icon: "ti-clock",       color: "#d97706" },
        ].map(s => (
          <div key={s.label} style={{ background: "#fff", border: "1px solid var(--pf-line)", borderRadius: 10, padding: "12px 14px", display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 34, height: 34, borderRadius: 8, background: s.color + "14", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <i className={`ti ${s.icon}`} aria-hidden="true" style={{ fontSize: 16, color: s.color }} />
            </div>
            <div>
              <div style={{ fontSize: 11, color: "var(--pf-text-3)" }}>{s.label}</div>
              <div style={{ fontFamily: "var(--font-inter-tight)", fontSize: 17, fontWeight: 700, color: "var(--pf-text)" }}>{s.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <span style={{ fontSize: 13, color: "var(--pf-text-2)" }}>{invoices.length} invoice{invoices.length !== 1 ? "s" : ""}</span>
        <button type="button" style={newBtn}>
          <i className="ti ti-plus" aria-hidden="true" style={{ fontSize: 14 }} /> New invoice
        </button>
      </div>

      {invoices.length === 0 && (
        <Empty icon="ti-receipt-off" text="No invoices yet for this client." />
      )}

      {invoices.length > 0 && (
        <div style={{ border: "1px solid var(--pf-line)", borderRadius: 10, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: "var(--pf-surface)" }}>
                {["Invoice", "Project", "Amount", "Status", "Date", "Due date", ""].map(h => (
                  <th key={h} style={{ textAlign: "left" as const, padding: "9px 14px", fontSize: 11.5, fontWeight: 500, color: "var(--pf-text-3)", borderBottom: "1px solid var(--pf-line)", whiteSpace: "nowrap" as const }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv, i) => {
                const sc = INVOICE_STATUS_CONFIG[inv.status as keyof typeof INVOICE_STATUS_CONFIG] ?? { label: "Unknown", badgeBg: "#f8fafc", badgeColor: "#475569" };
                return (
                  <motion.tr
                    key={inv.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.04 }}
                    style={{ borderBottom: i < invoices.length - 1 ? "1px solid var(--pf-line)" : "none", background: "#fff" }}
                  >
                    <td style={td}>
                      <span style={{ fontFamily: "var(--font-jetbrains-mono, monospace)", fontSize: 12, color: "#4f46e5" }}>
                        {inv.id}
                      </span>
                    </td>
                    <td style={td}>{inv.project}</td>
                    <td style={{ ...td, fontWeight: 500, fontFamily: "var(--font-inter-tight)" }}>
                      ${inv.amount.toLocaleString()}
                    </td>
                    <td style={td}>
                      <span style={{ fontSize: 11, fontWeight: 500, padding: "2px 8px", borderRadius: 99, background: sc.badgeBg, color: sc.badgeColor }}>
                        {sc.label}
                      </span>
                    </td>
                    <td style={{ ...td, color: "var(--pf-text-2)" }}>{fmtDate(inv.date)}</td>
                    <td style={{ ...td, color: inv.status === "overdue" ? "#dc2626" : "var(--pf-text-2)" }}>
                      {fmtDate(inv.dueDate)}
                    </td>
                    <td style={td}>
                      <button type="button" aria-label="Invoice options" style={{ background: "none", border: "none", cursor: "pointer", color: "var(--pf-text-3)", padding: 4 }}>
                        <i className="ti ti-dots-horizontal" aria-hidden="true" style={{ fontSize: 14 }} />
                      </button>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const td: React.CSSProperties = {
  padding: "11px 14px", color: "var(--pf-text)", verticalAlign: "middle",
  whiteSpace: "nowrap" as const, overflow: "hidden", textOverflow: "ellipsis",
};

const newBtn: React.CSSProperties = {
  display: "flex", alignItems: "center", gap: 6,
  padding: "6px 13px", borderRadius: 8,
  border: "none", background: "#4f46e5",
  color: "#fff", fontSize: 13, fontWeight: 500,
  cursor: "pointer", fontFamily: "var(--font-inter)",
};

function Empty({ icon, text }: { icon: string; text: string }) {
  return (
    <div style={{ textAlign: "center", padding: "40px 0", color: "var(--pf-text-3)" }}>
      <i className={`ti ${icon}`} aria-hidden="true" style={{ fontSize: 32, opacity: 0.35 }} />
      <p style={{ marginTop: 8, fontSize: 13 }}>{text}</p>
    </div>
  );
}
