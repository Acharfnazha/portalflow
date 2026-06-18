import { use } from "react";
import { PfBadge } from "@/components/ui/pf-badge";
import { formatCurrency, formatDate } from "@/lib/format";

export default function PortalInvoicesPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token: _token } = use(params);

  const invoices = [
    { id: "INV-0001", project: "Brand Refresh", amount: 480000, status: "paid" as const, issued: "2024-11-15", due: "2024-12-15" },
    { id: "INV-0002", project: "Brand Refresh", amount: 640000, status: "paid" as const, issued: "2024-12-15", due: "2025-01-15" },
    { id: "INV-0003", project: "Brand Refresh", amount: 512000, status: "pending" as const, issued: "2025-01-15", due: "2025-02-15" },
  ];

  const statusBadge: Record<string, { variant: "green" | "amber" | "red"; label: string }> = {
    paid:    { variant: "green", label: "Paid" },
    pending: { variant: "amber", label: "Pending" },
    overdue: { variant: "red",   label: "Overdue" },
  };

  const total = invoices.reduce((s, i) => s + i.amount, 0);
  const paid  = invoices.filter(i => i.status === "paid").reduce((s, i) => s + i.amount, 0);

  return (
    <div style={{ padding: 28 }}>
      <h1 style={{ fontSize: 20, fontWeight: 700, color: "var(--pf-text)", margin: "0 0 20px", letterSpacing: "-.3px" }}>
        Invoices
      </h1>

      {/* Summary */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 24 }}>
        <div style={{ background: "#fff", border: "1px solid var(--pf-line)", borderRadius: 12, padding: "18px 20px" }}>
          <p style={{ margin: "0 0 2px", fontSize: 12, color: "var(--pf-text-3)" }}>Total billed</p>
          <p style={{ margin: 0, fontSize: 24, fontWeight: 700, color: "var(--pf-text)", fontFamily: "var(--font-inter-tight)" }}>{formatCurrency(total)}</p>
        </div>
        <div style={{ background: "#fff", border: "1px solid var(--pf-line)", borderRadius: 12, padding: "18px 20px" }}>
          <p style={{ margin: "0 0 2px", fontSize: 12, color: "var(--pf-text-3)" }}>Paid</p>
          <p style={{ margin: 0, fontSize: 24, fontWeight: 700, color: "#16a34a", fontFamily: "var(--font-inter-tight)" }}>{formatCurrency(paid)}</p>
        </div>
      </div>

      {/* Table */}
      <div style={{ background: "#fff", border: "1px solid var(--pf-line)", borderRadius: 12, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead style={{ background: "var(--pf-surface)" }}>
            <tr>
              {["Invoice", "Project", "Amount", "Status", "Issued", "Due"].map(h => (
                <th
                  key={h}
                  style={{
                    padding: "9px 16px", textAlign: "left",
                    fontSize: 11.5, fontWeight: 600, color: "var(--pf-text-3)",
                    textTransform: "uppercase", letterSpacing: ".04em",
                    borderBottom: "1px solid var(--pf-line)",
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {invoices.map((inv, i) => {
              const sb = statusBadge[inv.status];
              return (
                <tr key={inv.id} style={{ borderBottom: i < invoices.length - 1 ? "1px solid var(--pf-line)" : "none" }}>
                  <td style={{ padding: "13px 16px" }}>
                    <span style={{ fontFamily: "monospace", fontSize: 12.5, fontWeight: 600, color: "#4f46e5", background: "#eef2ff", padding: "2px 7px", borderRadius: 5 }}>
                      {inv.id}
                    </span>
                  </td>
                  <td style={{ padding: "13px 16px", fontSize: 13, color: "var(--pf-text-2)" }}>{inv.project}</td>
                  <td style={{ padding: "13px 16px", fontSize: 14, fontWeight: 700, color: "var(--pf-text)", fontFamily: "var(--font-inter-tight)" }}>
                    {formatCurrency(inv.amount)}
                  </td>
                  <td style={{ padding: "13px 16px" }}>
                    <PfBadge variant={sb.variant}>{sb.label}</PfBadge>
                  </td>
                  <td style={{ padding: "13px 16px", fontSize: 12.5, color: "var(--pf-text-2)" }}>{formatDate(inv.issued)}</td>
                  <td style={{ padding: "13px 16px", fontSize: 12.5, color: "var(--pf-text-2)" }}>{formatDate(inv.due)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
