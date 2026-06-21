import { notFound } from "next/navigation";
import { getPortalContext, getPortalProjects, getPortalDocuments, getPortalInvoices } from "@/lib/supabase/portal-actions";

interface PageProps {
  params: Promise<{ token: string }>;
}

function fmtMoney(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style:    "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

export default async function PortalHomePage({ params }: PageProps) {
  const { token } = await params;
  const ctx = await getPortalContext(token);
  if (!ctx) notFound();

  const [projects, documents, invoices] = await Promise.all([
    getPortalProjects(ctx.client.id),
    getPortalDocuments(ctx.client.id),
    getPortalInvoices(ctx.client.id),
  ]);

  const activeProjects    = projects.filter((p) => p.status === "active").length;
  const completedProjects = projects.filter((p) => p.status === "completed").length;
  const openInvoices      = invoices.filter((i) => i.status === "pending" || i.status === "overdue").length;
  const totalInvoiced     = (invoices as { total_cents: number }[]).reduce((s, i) => s + (i.total_cents ?? 0), 0);

  const kpis = [
    { icon: "ti-briefcase",     label: "Active projects",    value: String(activeProjects),    color: "#4f46e5", bg: "#eef2ff" },
    { icon: "ti-receipt",       label: "Open invoices",      value: String(openInvoices),      color: "#d97706", bg: "#fffbeb" },
    { icon: "ti-folder",        label: "Documents",          value: String(documents.length),  color: "#16a34a", bg: "#f0fdf4" },
    { icon: "ti-circle-check",  label: "Completed projects", value: String(completedProjects), color: "#0f766e", bg: "#f0fdfa" },
  ];

  const recentDocs     = documents.slice(0, 3);
  const recentInvoices = invoices.slice(0, 3);

  return (
    <div style={{ padding: "28px 28px 40px", maxWidth: 900, margin: "0 auto" }}>
      {/* Welcome */}
      <div style={{ marginBottom: 28 }}>
        <h1
          style={{
            fontSize:      22,
            fontWeight:    700,
            color:         "var(--pf-text)",
            margin:        "0 0 4px",
            letterSpacing: "-.4px",
            fontFamily:    "var(--font-inter-tight)",
          }}
        >
          Welcome back, {ctx.client.name}
        </h1>
        <p style={{ margin: 0, fontSize: 13.5, color: "var(--pf-text-2)" }}>
          Here&apos;s an overview of your current work with {ctx.org.name}.
        </p>
      </div>

      {/* KPI cards */}
      <div
        style={{
          display:             "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          gap:                 14,
          marginBottom:        28,
        }}
      >
        {kpis.map((s) => (
          <div
            key={s.label}
            style={{
              background:   "#fff",
              border:       "1px solid var(--pf-line)",
              borderRadius: 12,
              padding:      "18px 20px",
              display:      "flex",
              alignItems:   "flex-start",
              gap:          14,
            }}
          >
            <div
              style={{
                width:          40,
                height:         40,
                borderRadius:   10,
                background:     s.bg,
                display:        "flex",
                alignItems:     "center",
                justifyContent: "center",
                flexShrink:     0,
              }}
            >
              <i className={`ti ${s.icon}`} aria-hidden style={{ fontSize: 19, color: s.color }} />
            </div>
            <div>
              <p style={{ margin: "0 0 2px", fontSize: 12, color: "var(--pf-text-3)" }}>
                {s.label}
              </p>
              <p
                style={{
                  margin:     0,
                  fontSize:   22,
                  fontWeight: 700,
                  color:      "var(--pf-text)",
                  lineHeight: 1.1,
                  fontFamily: "var(--font-inter-tight)",
                }}
              >
                {s.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Total billed banner (only if there are invoices) */}
      {totalInvoiced > 0 && (
        <div
          style={{
            background:   "#fff",
            border:       "1px solid var(--pf-line)",
            borderRadius: 12,
            padding:      "16px 20px",
            marginBottom: 20,
            display:      "flex",
            alignItems:   "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <p style={{ margin: 0, fontSize: 12, color: "var(--pf-text-3)" }}>Total billed</p>
            <p
              style={{
                margin:     0,
                fontSize:   26,
                fontWeight: 700,
                color:      "var(--pf-text)",
                fontFamily: "var(--font-inter-tight)",
              }}
            >
              {fmtMoney(totalInvoiced)}
            </p>
          </div>
          {openInvoices > 0 && (
            <span
              style={{
                fontSize:     12.5,
                fontWeight:   600,
                padding:      "5px 12px",
                borderRadius: 99,
                background:   "#fffbeb",
                color:        "#d97706",
                border:       "1px solid #fde68a",
              }}
            >
              {openInvoices} open invoice{openInvoices > 1 ? "s" : ""}
            </span>
          )}
        </div>
      )}

      {/* Two columns: recent docs + recent invoices */}
      <div
        style={{
          display:             "grid",
          gridTemplateColumns: "1fr 1fr",
          gap:                 16,
        }}
      >
        {/* Recent documents */}
        <div
          style={{
            background:   "#fff",
            border:       "1px solid var(--pf-line)",
            borderRadius: 12,
            overflow:     "hidden",
          }}
        >
          <div
            style={{
              padding:      "14px 18px",
              borderBottom: "1px solid var(--pf-line)",
              display:      "flex",
              alignItems:   "center",
              justifyContent: "space-between",
            }}
          >
            <h2 style={{ fontSize: 14, fontWeight: 600, color: "var(--pf-text)", margin: 0 }}>
              Recent documents
            </h2>
            <a
              href={`/portal/${token}/documents`}
              style={{ fontSize: 12.5, color: "#4f46e5", textDecoration: "none" }}
            >
              View all →
            </a>
          </div>
          {recentDocs.length === 0 ? (
            <div style={{ padding: "32px 18px", textAlign: "center", color: "var(--pf-text-3)", fontSize: 13 }}>
              <i className="ti ti-file-off" aria-hidden style={{ fontSize: 28, opacity: 0.3, display: "block", marginBottom: 8 }} />
              No documents yet
            </div>
          ) : (
            recentDocs.map((doc, i) => (
              <div
                key={doc.id}
                style={{
                  display:      "flex",
                  alignItems:   "center",
                  gap:          10,
                  padding:      "12px 18px",
                  borderBottom: i < recentDocs.length - 1 ? "1px solid var(--pf-line)" : "none",
                }}
              >
                <i className="ti ti-file-text" aria-hidden style={{ fontSize: 17, color: "#4f46e5", flexShrink: 0 }} />
                <span style={{ fontSize: 13, color: "var(--pf-text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {doc.name}
                </span>
              </div>
            ))
          )}
        </div>

        {/* Recent invoices */}
        <div
          style={{
            background:   "#fff",
            border:       "1px solid var(--pf-line)",
            borderRadius: 12,
            overflow:     "hidden",
          }}
        >
          <div
            style={{
              padding:      "14px 18px",
              borderBottom: "1px solid var(--pf-line)",
              display:      "flex",
              alignItems:   "center",
              justifyContent: "space-between",
            }}
          >
            <h2 style={{ fontSize: 14, fontWeight: 600, color: "var(--pf-text)", margin: 0 }}>
              Recent invoices
            </h2>
            <a
              href={`/portal/${token}/invoices`}
              style={{ fontSize: 12.5, color: "#4f46e5", textDecoration: "none" }}
            >
              View all →
            </a>
          </div>
          {recentInvoices.length === 0 ? (
            <div style={{ padding: "32px 18px", textAlign: "center", color: "var(--pf-text-3)", fontSize: 13 }}>
              <i className="ti ti-receipt-off" aria-hidden style={{ fontSize: 28, opacity: 0.3, display: "block", marginBottom: 8 }} />
              No invoices yet
            </div>
          ) : (
            (recentInvoices as { id: string; invoice_number: string; status: string; total_cents: number }[]).map((inv, i) => {
              const statusColor = inv.status === "paid" ? "#16a34a" : inv.status === "overdue" ? "#dc2626" : "#d97706";
              const statusBg    = inv.status === "paid" ? "#f0fdf4" : inv.status === "overdue" ? "#fef2f2" : "#fffbeb";
              return (
                <div
                  key={inv.id}
                  style={{
                    display:        "flex",
                    alignItems:     "center",
                    justifyContent: "space-between",
                    padding:        "12px 18px",
                    borderBottom:   i < recentInvoices.length - 1 ? "1px solid var(--pf-line)" : "none",
                  }}
                >
                  <div>
                    <span
                      style={{
                        fontFamily:   "monospace",
                        fontSize:     12.5,
                        fontWeight:   600,
                        color:        "#4f46e5",
                        background:   "#eef2ff",
                        padding:      "1px 6px",
                        borderRadius: 4,
                      }}
                    >
                      {inv.invoice_number}
                    </span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span
                      style={{
                        fontSize:     12,
                        fontWeight:   700,
                        fontFamily:   "var(--font-inter-tight)",
                        color:        "var(--pf-text)",
                      }}
                    >
                      {fmtMoney(inv.total_cents)}
                    </span>
                    <span
                      style={{
                        fontSize:     11.5,
                        fontWeight:   600,
                        padding:      "2px 8px",
                        borderRadius: 99,
                        background:   statusBg,
                        color:        statusColor,
                        textTransform: "capitalize",
                      }}
                    >
                      {inv.status}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
