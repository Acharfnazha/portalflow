"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  INVOICES,
  InvoiceStatus,
  InvoiceItem,
} from "@/lib/invoices-data";
import { RevenueSummary } from "@/components/dashboard/invoices/revenue-summary";
import { RevenueChart }   from "@/components/dashboard/invoices/revenue-chart";
import { InvoiceToolbar } from "@/components/dashboard/invoices/invoice-toolbar";
import { InvoiceTable }   from "@/components/dashboard/invoices/invoice-table";

type FilterTab = "all" | InvoiceStatus;

const PAGE_SIZE = 10;

export default function InvoicesPage() {
  const [query,    setQuery]    = useState("");
  const [filter,   setFilter]   = useState<FilterTab>("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [page,     setPage]     = useState(1);
  const [showChart, setShowChart] = useState(true);

  /* ── Counts per tab ─────────────────────────────────── */
  const counts = useMemo(
    (): Record<FilterTab, number> => ({
      all:     INVOICES.length,
      paid:    INVOICES.filter(i => i.status === "paid").length,
      pending: INVOICES.filter(i => i.status === "pending").length,
      overdue: INVOICES.filter(i => i.status === "overdue").length,
      draft:   INVOICES.filter(i => i.status === "draft").length,
    }),
    [],
  );

  /* ── Filtered list ──────────────────────────────────── */
  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return INVOICES.filter(inv => {
      const matchQ =
        !q ||
        inv.id.toLowerCase().includes(q) ||
        inv.client.toLowerCase().includes(q) ||
        inv.project.toLowerCase().includes(q);
      const matchF = filter === "all" || inv.status === filter;
      return matchQ && matchF;
    });
  }, [query, filter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage   = Math.min(page, totalPages);
  const paginated  = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  /* ── Bulk stats ─────────────────────────────────────── */
  const selectedList = INVOICES.filter(i => selected.has(i.id));
  const selectedTotal = selectedList.reduce((s, i) => s + i.amount, 0);

  /* ── Handlers ───────────────────────────────────────── */
  function toggleInvoice(id: string) {
    setSelected(prev => {
      const n = new Set(prev);
      if (n.has(id)) { n.delete(id); } else { n.add(id); }
      return n;
    });
  }

  function toggleAll(ids: string[]) {
    const allOn = ids.every(id => selected.has(id));
    setSelected(prev => {
      const n = new Set(prev);
      if (allOn) { ids.forEach(id => n.delete(id)); } else { ids.forEach(id => n.add(id)); }
      return n;
    });
  }

  function handleFilter(f: FilterTab) {
    setFilter(f);
    setPage(1);
    setSelected(new Set());
  }

  function handleExport() {
    /* UI demo — would trigger real PDF generation / CSV download */
    alert("Export triggered — connect your PDF/CSV pipeline here.");
  }

  function handleExportOne(inv: InvoiceItem) {
    alert(`Downloading PDF for ${inv.id}…`);
  }

  /* ── Render ─────────────────────────────────────────── */
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "calc(100vh - 57px)",
        background: "var(--pf-surface)",
      }}
    >
      {/* ── Page header ──────────────────────────────────── */}
      <div
        style={{
          background: "#fff",
          borderBottom: "1px solid var(--pf-line)",
          padding: "20px 20px 16px",
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 12,
          flexWrap: "wrap" as const,
        }}
      >
        <div>
          <h1
            style={{
              fontFamily: "var(--font-inter-tight)",
              fontSize: 20,
              fontWeight: 700,
              color: "var(--pf-text)",
              margin: 0,
            }}
          >
            Invoices
          </h1>
          <p style={{ fontSize: 13, color: "var(--pf-text-2)", margin: "4px 0 0" }}>
            {counts.paid} paid · {counts.pending} pending · {counts.overdue > 0
              ? <span style={{ color: "#dc2626" }}>{counts.overdue} overdue ·</span>
              : null}{" "}
            {counts.draft} draft
          </p>
        </div>

        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {/* Toggle chart */}
          <button
            type="button"
            onClick={() => setShowChart(v => !v)}
            aria-pressed={showChart}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "7px 13px",
              borderRadius: 8,
              border: showChart
                ? "1px solid #4f46e5"
                : "1px solid var(--pf-line)",
              background: showChart ? "#eef2ff" : "#fff",
              fontSize: 13,
              color: showChart ? "#4f46e5" : "var(--pf-text-2)",
              cursor: "pointer",
              fontFamily: "var(--font-inter)",
              transition: "all .15s",
            }}
          >
            <i className="ti ti-chart-bar" aria-hidden="true" style={{ fontSize: 15 }} />
            {showChart ? "Hide" : "Show"} chart
          </button>

          <button
            type="button"
            onClick={handleExport}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "7px 13px",
              borderRadius: 8,
              border: "1px solid var(--pf-line)",
              background: "#fff",
              fontSize: 13,
              color: "var(--pf-text)",
              cursor: "pointer",
              fontFamily: "var(--font-inter)",
            }}
          >
            <i className="ti ti-file-export" aria-hidden="true" style={{ fontSize: 15 }} />
            Export CSV
          </button>

          <button
            type="button"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "7px 14px",
              borderRadius: 8,
              border: "none",
              background: "#4f46e5",
              fontSize: 13,
              fontWeight: 500,
              color: "#fff",
              cursor: "pointer",
              fontFamily: "var(--font-inter)",
            }}
          >
            <i className="ti ti-plus" aria-hidden="true" style={{ fontSize: 15 }} />
            New invoice
          </button>
        </div>
      </div>

      {/* ── Revenue KPI cards ────────────────────────────── */}
      <RevenueSummary />

      {/* ── Revenue chart (collapsible) ──────────────────── */}
      <AnimatePresence initial={false}>
        {showChart && (
          <motion.div
            key="chart"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            style={{ overflow: "hidden" }}
          >
            <RevenueChart />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Toolbar ──────────────────────────────────────── */}
      <InvoiceToolbar
        query={query}
        onQuery={q => { setQuery(q); setPage(1); }}
        filter={filter}
        onFilter={handleFilter}
        counts={counts}
        onExport={handleExport}
      />

      {/* ── Bulk action bar ──────────────────────────────── */}
      <AnimatePresence>
        {selected.size > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            role="region"
            aria-live="polite"
            aria-label={`${selected.size} invoices selected`}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "9px 20px",
              background: "#eef2ff",
              borderBottom: "1px solid #c7d2fe",
            }}
          >
            <span
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: "#3730a3",
              }}
            >
              {selected.size} selected
              {selected.size > 0 && (
                <span style={{ fontWeight: 400, marginLeft: 4 }}>
                  · ${selectedTotal.toLocaleString()} total
                </span>
              )}
            </span>

            {[
              { icon: "ti-file-type-pdf",  label: "Download PDFs" },
              { icon: "ti-send",           label: "Send reminders" },
              { icon: "ti-circle-check",   label: "Mark as paid"  },
            ].map(a => (
              <button
                key={a.label}
                type="button"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  padding: "5px 10px",
                  borderRadius: 6,
                  border: "1px solid #a5b4fc",
                  background: "transparent",
                  fontSize: 12.5,
                  color: "#4338ca",
                  cursor: "pointer",
                  fontFamily: "var(--font-inter)",
                }}
              >
                <i className={`ti ${a.icon}`} aria-hidden="true" style={{ fontSize: 14 }} />
                {a.label}
              </button>
            ))}

            <button
              type="button"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 5,
                padding: "5px 10px",
                borderRadius: 6,
                border: "1px solid #fca5a5",
                background: "transparent",
                fontSize: 12.5,
                color: "#dc2626",
                cursor: "pointer",
                fontFamily: "var(--font-inter)",
              }}
            >
              <i className="ti ti-trash" aria-hidden="true" style={{ fontSize: 14 }} />
              Void
            </button>

            <button
              type="button"
              onClick={() => setSelected(new Set())}
              style={{
                marginLeft: "auto",
                background: "none",
                border: "none",
                fontSize: 13,
                color: "#6366f1",
                cursor: "pointer",
                fontFamily: "var(--font-inter)",
              }}
              aria-label="Clear selection"
            >
              Clear
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Invoice table ────────────────────────────────── */}
      <div style={{ flex: 1, background: "#fff" }}>
        <InvoiceTable
          invoices={paginated}
          selected={selected}
          onToggle={toggleInvoice}
          onToggleAll={toggleAll}
          onExportOne={handleExportOne}
        />

        {/* Pagination footer */}
        {filtered.length > 0 && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "12px 20px",
              borderTop: "1px solid var(--pf-line)",
            }}
          >
            <span style={{ fontSize: 12.5, color: "var(--pf-text-3)" }}>
              Showing {Math.min(paginated.length, PAGE_SIZE)} of {filtered.length} invoices
            </span>

            <nav
              aria-label="Invoice pagination"
              style={{ display: "flex", gap: 4 }}
            >
              <PageBtn
                label="Previous"
                icon="ti-chevron-left"
                disabled={safePage === 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
              />
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(
                p => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPage(p)}
                    aria-current={p === safePage ? "page" : undefined}
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: 6,
                      border: `1px solid ${p === safePage ? "#4f46e5" : "var(--pf-line)"}`,
                      background: p === safePage ? "#4f46e5" : "#fff",
                      color: p === safePage ? "#fff" : "var(--pf-text-2)",
                      cursor: "pointer",
                      fontSize: 12,
                      fontFamily: "var(--font-inter)",
                    }}
                  >
                    {p}
                  </button>
                ),
              )}
              {totalPages > 5 && (
                <>
                  <span style={{ width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: "var(--pf-text-3)" }}>
                    …
                  </span>
                  <button
                    type="button"
                    onClick={() => setPage(totalPages)}
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: 6,
                      border: `1px solid ${safePage === totalPages ? "#4f46e5" : "var(--pf-line)"}`,
                      background: safePage === totalPages ? "#4f46e5" : "#fff",
                      color: safePage === totalPages ? "#fff" : "var(--pf-text-2)",
                      cursor: "pointer",
                      fontSize: 12,
                      fontFamily: "var(--font-inter)",
                    }}
                  >
                    {totalPages}
                  </button>
                </>
              )}
              <PageBtn
                label="Next"
                icon="ti-chevron-right"
                disabled={safePage === totalPages}
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              />
            </nav>
          </div>
        )}
      </div>
    </div>
  );
}

function PageBtn({
  label,
  icon,
  disabled,
  onClick,
}: {
  label: string;
  icon: string;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      style={{
        width: 30,
        height: 30,
        borderRadius: 6,
        border: "1px solid var(--pf-line)",
        background: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: disabled ? "default" : "pointer",
        color: "var(--pf-text-2)",
        opacity: disabled ? 0.4 : 1,
      }}
    >
      <i className={`ti ${icon}`} aria-hidden="true" style={{ fontSize: 13 }} />
    </button>
  );
}
