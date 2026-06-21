import { notFound } from "next/navigation";
import { getPortalContext, getPortalInvoices } from "@/lib/supabase/portal-actions";

interface PageProps {
  params: Promise<{ token: string }>;
}

const STATUS_STYLE: Record<string, { label: string; bg: string; color: string }> = {
  pending:  { label: "Pending",  bg: "#fffbeb", color: "#d97706" },
  paid:     { label: "Paid",     bg: "#f0fdf4", color: "#16a34a" },
  overdue:  { label: "Overdue",  bg: "#fef2f2", color: "#dc2626" },
  void:     { label: "Void",     bg: "#f8fafc", color: "#64748b" },
  refunded: { label: "Refunded", bg: "#f0fdf4", color: "#0f766e" },
};

function fmtMoney(cents: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style:    "currency",
    currency: currency,
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

function fmtDate(s?: string | null) {
  if (!s) return "—";
  return new Date(s).toLocaleDateString("en-US", {
    month: "short",
    day:   "numeric",
    year:  "numeric",
  });
}

export default async function PortalInvoicesPage({ params }: PageProps) {
  const { token } = await params;
  const ctx = await getPortalContext(token);
  if (!ctx) notFound();

  const rawInvoices = await getPortalInvoices(ctx.client.id);

  type InvoiceRow = {
    id: string;
    invoice_number: string;
    status: string;
    total_cents: number;
    currency: string;
    issued_at?: string | null;
    due_at?: string | null;
    projects?: { name: string } | null;
  };

  const invoices = rawInvoices as unknown as InvoiceRow[];
  const totalBilled = invoices.reduce((s, i) => s + (i.total_cents ?? 0), 0);
  const totalPaid   = invoices.filter((i) => i.status === "paid").reduce((s, i) => s + (i.total_cents ?? 0), 0);
  const totalDue    = invoices.filter((i) => i.status === "pending" || i.status === "overdue").reduce((s, i) => s + (i.total_cents ?? 0), 0);

  return (
    <div style={{ padding: "28px 28px 40px", maxWidth: 900, margin: "0 auto" }}>
      <div style={{ marginBottom: 24 }}>
        <h1
          style={{
            fontSize:      20,
            fontWeight:    700,
            color:         "var(--pf-text)",
            margin:        "0 0 4px",
            letterSpacing: "-.3px",
            fontFamily:    "var(--font-inter-tight)",
          }}
        >
          Invoices
        </h1>
        <p style={{ margin: 0, fontSize: 13, color: "var(--pf-text-2)" }}>
          {invoices.length} invoice{invoices.length !== 1 ? "s" : ""} from {ctx.org.name}
        </p>
      </div>

      {invoices.length === 0 ? (
        <div
          style={{
            background:    "#fff",
            border:        "1px solid var(--pf-line)",
            borderRadius:  12,
            display:       "flex",
            flexDirection: "column",
            alignItems:    "center",
            padding:       "72px 20px",
            color:         "var(--pf-text-3)",
          }}
        >
          <i className="ti ti-receipt-off" aria-hidden style={{ fontSize: 44, opacity: 0.3 }} />
          <p style={{ fontSize: 15, fontWeight: 600, color: "var(--pf-text-2)", margin: "12px 0 4px" }}>
            No invoices yet
          </p>
          <p style={{ fontSize: 13, margin: 0 }}>
            Invoices will appear here once issued.
          </p>
        </div>
      ) : (
        <>
          {/* Summary cards */}
          <div
            style={{
              display:             "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap:                 12,
              marginBottom:        20,
            }}
          >
            {[
              { label: "Total billed", value: fmtMoney(totalBilled), color: "var(--pf-text)" },
              { label: "Paid",         value: fmtMoney(totalPaid),   color: "#16a34a" },
              { label: "Outstanding",  value: fmtMoney(totalDue),    color: totalDue > 0 ? "#d97706" : "var(--pf-text)" },
            ].map((s) => (
              <div
                key={s.label}
                style={{
                  background:   "#fff",
                  border:       "1px solid var(--pf-line)",
                  borderRadius: 12,
                  padding:      "16px 18px",
                }}
              >
                <p style={{ margin: "0 0 2px", fontSize: 12, color: "var(--pf-text-3)" }}>
                  {s.label}
                </p>
                <p
                  style={{
                    margin:     0,
                    fontSize:   22,
                    fontWeight: 700,
                    color:      s.color,
                    fontFamily: "var(--font-inter-tight)",
                  }}
                >
                  {s.value}
                </p>
              </div>
            ))}
          </div>

          {/* Invoice table */}
          <div
            style={{
              background:   "#fff",
              border:       "1px solid var(--pf-line)",
              borderRadius: 12,
              overflow:     "hidden",
            }}
          >
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead style={{ background: "var(--pf-surface)" }}>
                <tr>
                  {["Invoice", "Project", "Amount", "Status", "Issued", "Due"].map((h) => (
                    <th
                      key={h}
                      style={{
                        padding:       "10px 16px",
                        textAlign:     "left",
                        fontSize:      11.5,
                        fontWeight:    600,
                        color:         "var(--pf-text-3)",
                        textTransform: "uppercase",
                        letterSpacing: ".04em",
                        borderBottom:  "1px solid var(--pf-line)",
                        whiteSpace:    "nowrap",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv, i) => {
                  const ss = STATUS_STYLE[inv.status] ?? STATUS_STYLE.pending;
                  return (
                    <tr
                      key={inv.id}
                      style={{
                        borderBottom: i < invoices.length - 1 ? "1px solid var(--pf-line)" : "none",
                      }}
                    >
                      <td style={{ padding: "13px 16px" }}>
                        <span
                          style={{
                            fontFamily:   "monospace",
                            fontSize:     12.5,
                            fontWeight:   600,
                            color:        "#4f46e5",
                            background:   "#eef2ff",
                            padding:      "2px 7px",
                            borderRadius: 5,
                            whiteSpace:   "nowrap",
                          }}
                        >
                          {inv.invoice_number}
                        </span>
                      </td>
                      <td
                        style={{
                          padding:      "13px 16px",
                          fontSize:     13,
                          color:        "var(--pf-text-2)",
                          maxWidth:     160,
                          overflow:     "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace:   "nowrap",
                        }}
                      >
                        {inv.projects?.name ?? "—"}
                      </td>
                      <td style={{ padding: "13px 16px" }}>
                        <span
                          style={{
                            fontSize:   14,
                            fontWeight: 700,
                            color:      "var(--pf-text)",
                            fontFamily: "var(--font-inter-tight)",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {fmtMoney(inv.total_cents, inv.currency)}
                        </span>
                      </td>
                      <td style={{ padding: "13px 16px" }}>
                        <span
                          style={{
                            fontSize:     12,
                            fontWeight:   600,
                            padding:      "3px 9px",
                            borderRadius: 99,
                            background:   ss.bg,
                            color:        ss.color,
                            textTransform: "capitalize",
                            whiteSpace:   "nowrap",
                          }}
                        >
                          {ss.label}
                        </span>
                      </td>
                      <td style={{ padding: "13px 16px", fontSize: 13, color: "var(--pf-text-2)", whiteSpace: "nowrap" }}>
                        {fmtDate(inv.issued_at)}
                      </td>
                      <td
                        style={{
                          padding:    "13px 16px",
                          fontSize:   13,
                          color:      inv.status === "overdue" ? "#dc2626" : "var(--pf-text-2)",
                          fontWeight: inv.status === "overdue" ? 600 : 400,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {fmtDate(inv.due_at)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
