"use client";

import { useState, useMemo } from "react";
import { formatCurrency } from "@/lib/format";
import { EmptyState } from "@/components/ui/empty-state";
import { NewInvoiceModal } from "./new-invoice-modal";
import { RevenueChart } from "./revenue-chart";
import type { MonthlyRevenuePoint } from "@/lib/supabase/invoice-actions";

interface Invoice {
  id:          string;
  number:      string;
  status:      string;
  totalCents:  number;
  issuedAt:    string | null;
  dueAt:       string | null;
  paidAt:      string | null;
  clientId:    string;
  clientName:  string;
  projectName: string | null;
}

interface Props {
  invoices:      Invoice[];
  clients:       { id: string; name: string }[];
  projects:      { id: string; name: string; clientId: string }[];
  canEdit:       boolean;
  orgId:         string;
  revenueData:   MonthlyRevenuePoint[];
}

const STATUS_STYLE: Record<string, { label: string; bg: string; color: string }> = {
  draft:    { label: "Draft",    bg: "#f3f4f6", color: "#374151" },
  pending:  { label: "Pending",  bg: "#fef3c7", color: "#92400e" },
  paid:     { label: "Paid",     bg: "#d1fae5", color: "#065f46" },
  overdue:  { label: "Overdue",  bg: "#fee2e2", color: "#991b1b" },
  void:     { label: "Void",     bg: "#f3f4f6", color: "#6b7280" },
  refunded: { label: "Refunded", bg: "#ede9fe", color: "#5b21b6" },
};

type FilterTab = "all" | "pending" | "paid" | "overdue" | "draft";

function fmtDate(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function InvoicesDashboard({ invoices, clients, projects, canEdit, revenueData }: Props) {
  const [filter,      setFilter]      = useState<FilterTab>("all");
  const [query,       setQuery]       = useState("");
  const [page,        setPage]        = useState(1);
  const [modalOpen,   setModalOpen]   = useState(false);

  const PAGE_SIZE = 15;

  const counts = useMemo(() => ({
    all:     invoices.length,
    pending: invoices.filter((i) => i.status === "pending").length,
    paid:    invoices.filter((i) => i.status === "paid").length,
    overdue: invoices.filter((i) => i.status === "overdue").length,
    draft:   invoices.filter((i) => i.status === "draft").length,
  }), [invoices]);

  const summary = useMemo(() => ({
    totalBilled:      invoices.filter((i) => !["draft","void"].includes(i.status)).reduce((s, i) => s + i.totalCents, 0),
    totalPaid:        invoices.filter((i) => i.status === "paid").reduce((s, i) => s + i.totalCents, 0),
    totalOutstanding: invoices.filter((i) => ["pending","overdue"].includes(i.status)).reduce((s, i) => s + i.totalCents, 0),
    totalOverdue:     invoices.filter((i) => i.status === "overdue").reduce((s, i) => s + i.totalCents, 0),
  }), [invoices]);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return invoices.filter((i) => {
      const matchQ = !q || i.number.toLowerCase().includes(q) || i.clientName.toLowerCase().includes(q) || (i.projectName ?? "").toLowerCase().includes(q);
      const matchF = filter === "all" || i.status === filter;
      return matchQ && matchF;
    });
  }, [invoices, filter, query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage   = Math.min(page, totalPages);
  const paginated  = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const tabs: { key: FilterTab; label: string }[] = [
    { key: "all",     label: "All"     },
    { key: "pending", label: "Pending" },
    { key: "paid",    label: "Paid"    },
    { key: "overdue", label: "Overdue" },
    { key: "draft",   label: "Draft"   },
  ];

  function handleFilter(f: FilterTab) { setFilter(f); setPage(1); }

  return (
    <>
      <div style={{ display: "flex", flexDirection: "column", minHeight: "calc(100vh - 57px)", background: "var(--pf-surface)" }}>

        {/* Header */}
        <div style={{ background: "#fff", borderBottom: "1px solid var(--pf-line)", padding: "20px 24px 16px", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <div>
            <h1 style={{ fontFamily: "var(--font-inter-tight)", fontSize: 20, fontWeight: 700, color: "var(--pf-text)", margin: 0 }}>Invoices</h1>
            <p style={{ fontSize: 13, color: "var(--pf-text-2)", margin: "4px 0 0" }}>
              {counts.paid} paid · {counts.pending} pending
              {counts.overdue > 0 && <span style={{ color: "#dc2626" }}> · {counts.overdue} overdue</span>}
              {" "}· {counts.draft} draft
            </p>
          </div>
          {canEdit && (
            <div style={{ display: "flex", gap: 8 }}>
              <button type="button"
                onClick={() => {
                  const header = ["number","client","project","amount","status","issued","due"];
                  const rows = filtered.map((i) => [i.number, `"${i.clientName}"`, `"${i.projectName ?? ""}"`, (i.totalCents / 100).toFixed(2), i.status, i.issuedAt ?? "", i.dueAt ?? ""].join(","));
                  const csv = [header.join(","), ...rows].join("\n");
                  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
                  const a = Object.assign(document.createElement("a"), { href: url, download: "invoices.csv" });
                  a.click(); URL.revokeObjectURL(url);
                }}
                style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 13px", borderRadius: 8, border: "1px solid var(--pf-line)", background: "#fff", fontSize: 13, color: "var(--pf-text)", cursor: "pointer", fontFamily: "var(--font-inter)" }}>
                <i className="ti ti-file-export" aria-hidden style={{ fontSize: 15 }} />
                Export CSV
              </button>
              <button type="button" onClick={() => setModalOpen(true)}
                style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 16px", borderRadius: 8, border: "none", background: "#4f46e5", fontSize: 13, color: "#fff", cursor: "pointer", fontFamily: "var(--font-inter)", fontWeight: 500 }}>
                <i className="ti ti-plus" aria-hidden style={{ fontSize: 15 }} />
                New invoice
              </button>
            </div>
          )}
        </div>

        {/* Revenue chart */}
        <RevenueChart data={revenueData} />

        {/* Summary cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 12, padding: "16px 24px 0" }}>
          {[
            { label: "Total billed",   value: formatCurrency(summary.totalBilled),     color: "#4f46e5" },
            { label: "Total paid",     value: formatCurrency(summary.totalPaid),        color: "#059669" },
            { label: "Outstanding",    value: formatCurrency(summary.totalOutstanding), color: "#d97706" },
            { label: "Overdue",        value: formatCurrency(summary.totalOverdue),     color: "#dc2626" },
          ].map((s) => (
            <div key={s.label} style={{ background: "#fff", border: "1px solid var(--pf-line)", borderRadius: 10, padding: "14px 16px" }}>
              <div style={{ fontSize: 11.5, color: "var(--pf-text-3)", marginBottom: 4 }}>{s.label}</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: s.color, fontFamily: "var(--font-inter-tight)" }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div style={{ background: "#fff", borderBottom: "1px solid var(--pf-line)", padding: "12px 24px", display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", marginTop: 16 }}>
          <div style={{ display: "flex", gap: 2, borderRadius: 8, border: "1px solid var(--pf-line)", padding: 3, background: "var(--pf-surface)" }}>
            {tabs.map((t) => (
              <button key={t.key} type="button" onClick={() => handleFilter(t.key)}
                style={{ padding: "5px 12px", borderRadius: 6, border: "none", background: filter === t.key ? "#fff" : "transparent", fontSize: 12.5, fontWeight: filter === t.key ? 600 : 400, color: filter === t.key ? "var(--pf-text)" : "var(--pf-text-2)", cursor: "pointer", fontFamily: "var(--font-inter)", boxShadow: filter === t.key ? "0 1px 3px rgba(0,0,0,.08)" : "none" }}>
                {t.label} <span style={{ fontSize: 11, color: "var(--pf-text-3)", marginLeft: 2 }}>{counts[t.key]}</span>
              </button>
            ))}
          </div>
          <input type="search" placeholder="Search invoices…" value={query}
            onChange={(e) => { setQuery(e.target.value); setPage(1); }}
            style={{ flex: 1, minWidth: 200, maxWidth: 320, padding: "7px 12px", borderRadius: 8, border: "1px solid var(--pf-line)", fontSize: 13, color: "var(--pf-text)", background: "#fff", fontFamily: "var(--font-inter)", outline: "none" }} />
        </div>

        {/* Table */}
        <div style={{ flex: 1, background: "#fff", overflow: "auto" }}>
          {paginated.length === 0 ? (
            <EmptyState
              icon="ti-receipt"
              title={invoices.length === 0 ? "No invoices yet" : "No invoices match your filter"}
              description={invoices.length === 0 ? 'Click "New invoice" to create your first one.' : "Try adjusting your search or filter."} />
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--pf-line)" }}>
                  {["Invoice #", "Client", "Project", "Amount", "Status", "Issued", "Due"].map((h) => (
                    <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: 11.5, fontWeight: 600, color: "var(--pf-text-3)", letterSpacing: ".04em", textTransform: "uppercase", whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginated.map((inv) => {
                  const st = STATUS_STYLE[inv.status] ?? { label: inv.status, bg: "#f3f4f6", color: "#374151" };
                  return (
                    <tr key={inv.id} style={{ borderBottom: "1px solid var(--pf-line)" }}>
                      <td style={{ padding: "12px 16px", fontSize: 13, fontWeight: 600, color: "var(--pf-text)", whiteSpace: "nowrap" }}>{inv.number}</td>
                      <td style={{ padding: "12px 16px", fontSize: 13, color: "var(--pf-text)" }}>{inv.clientName}</td>
                      <td style={{ padding: "12px 16px", fontSize: 13, color: "var(--pf-text-2)" }}>{inv.projectName ?? "—"}</td>
                      <td style={{ padding: "12px 16px", fontSize: 13, fontWeight: 600, color: "var(--pf-text)", whiteSpace: "nowrap" }}>{formatCurrency(inv.totalCents)}</td>
                      <td style={{ padding: "12px 16px" }}>
                        <span style={{ display: "inline-block", padding: "2px 9px", borderRadius: 99, fontSize: 11.5, fontWeight: 600, background: st.bg, color: st.color }}>{st.label}</span>
                      </td>
                      <td style={{ padding: "12px 16px", fontSize: 12.5, color: "var(--pf-text-2)", whiteSpace: "nowrap" }}>{fmtDate(inv.issuedAt)}</td>
                      <td style={{ padding: "12px 16px", fontSize: 12.5, color: inv.status === "overdue" ? "#dc2626" : "var(--pf-text-2)", whiteSpace: "nowrap" }}>{fmtDate(inv.dueAt)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}

          {/* Pagination */}
          {filtered.length > PAGE_SIZE && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderTop: "1px solid var(--pf-line)" }}>
              <span style={{ fontSize: 12.5, color: "var(--pf-text-3)" }}>
                Showing {Math.min(paginated.length, PAGE_SIZE)} of {filtered.length}
              </span>
              <div style={{ display: "flex", gap: 4 }}>
                <button type="button" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={safePage === 1} aria-label="Previous"
                  style={{ width: 30, height: 30, borderRadius: 6, border: "1px solid var(--pf-line)", background: "#fff", cursor: safePage === 1 ? "default" : "pointer", opacity: safePage === 1 ? .4 : 1 }}>
                  <i className="ti ti-chevron-left" style={{ fontSize: 13 }} />
                </button>
                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1).map((p) => (
                  <button key={p} type="button" onClick={() => setPage(p)} aria-current={p === safePage ? "page" : undefined}
                    style={{ width: 30, height: 30, borderRadius: 6, border: `1px solid ${p === safePage ? "#4f46e5" : "var(--pf-line)"}`, background: p === safePage ? "#4f46e5" : "#fff", color: p === safePage ? "#fff" : "var(--pf-text-2)", cursor: "pointer", fontSize: 12, fontFamily: "var(--font-inter)" }}>
                    {p}
                  </button>
                ))}
                <button type="button" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={safePage === totalPages} aria-label="Next"
                  style={{ width: 30, height: 30, borderRadius: 6, border: "1px solid var(--pf-line)", background: "#fff", cursor: safePage === totalPages ? "default" : "pointer", opacity: safePage === totalPages ? .4 : 1 }}>
                  <i className="ti ti-chevron-right" style={{ fontSize: 13 }} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* New Invoice Modal */}
      <NewInvoiceModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        clients={clients}
        projects={projects}
      />
    </>
  );
}
