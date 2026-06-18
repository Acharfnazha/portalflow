"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import type { Client, ClientStatus } from "@/types/app.types";
import { ClientsKpiBar } from "./kpi-bar";
import { ClientsToolbar } from "./toolbar";
import { BulkBar } from "./bulk-bar";
import { ClientsTable } from "./table";
import { ClientsPagination } from "./pagination";
import { ClientModal } from "./client-modal";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { deleteClientAction } from "@/lib/supabase/client-actions";

type FilterTab = "all" | ClientStatus;

interface KpiData {
  total: number;
  active: number;
  atRisk: number;
  totalMrrCents: number;
}

interface Props {
  clients: Client[];
  kpi: KpiData;
  total: number;
  page: number;
  totalPages: number;
  canManage: boolean;
}

export function ClientsShell({ clients, kpi, total, page, totalPages, canManage }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<"table" | "board" | "list">("table");
  const [modalOpen, setModalOpen] = useState(false);
  const [editClient, setEditClient] = useState<Client | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Client | null>(null);
  const [deleteState, setDeleteState] = useState<{ error: string } | null>(null);
  const [, startDeleteTransition] = useTransition();

  const currentFilter = (searchParams.get("status") ?? "all") as FilterTab;
  const currentQuery  = searchParams.get("q") ?? "";

  function pushParams(updates: Record<string, string>) {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([k, v]) => {
      if (v) params.set(k, v); else params.delete(k);
    });
    router.replace(`${pathname}?${params.toString()}`);
  }

  function handleFilter(f: FilterTab) {
    pushParams({ status: f === "all" ? "" : f, page: "" });
    setSelected(new Set());
  }

  function handleSearch(q: string) {
    pushParams({ q, page: "" });
  }

  function handlePage(p: number) {
    pushParams({ page: p === 1 ? "" : String(p) });
  }

  function handleEdit(client: Client) {
    setEditClient(client);
    setModalOpen(true);
  }

  function handleCreate() {
    setEditClient(null);
    setModalOpen(true);
  }

  function handleCloseModal() {
    setModalOpen(false);
    setEditClient(null);
  }

  function handleDeleteConfirm() {
    if (!deleteTarget) return;
    startDeleteTransition(async () => {
      const fd = new FormData();
      fd.set("id", deleteTarget.id);
      const result = await deleteClientAction(null, fd);
      if (result?.error) {
        setDeleteState(result);
      } else {
        setDeleteTarget(null);
      }
    });
  }

  function toggleClient(id: string) {
    setSelected(prev => { const n = new Set(prev); if (n.has(id)) { n.delete(id); } else { n.add(id); } return n; });
  }

  function toggleAll(ids: string[]) {
    const allOn = ids.every(id => selected.has(id));
    setSelected(prev => {
      const n = new Set(prev);
      if (allOn) { ids.forEach(id => n.delete(id)); } else { ids.forEach(id => n.add(id)); }
      return n;
    });
  }

  const counts: Record<FilterTab, number> = {
    all:     kpi.total,
    active:  clients.filter(c => c.status === "active").length,
    trial:   clients.filter(c => c.status === "trial").length,
    at_risk: clients.filter(c => c.status === "at_risk").length,
    churned: clients.filter(c => c.status === "churned").length,
    new:     clients.filter(c => c.status === "new").length,
  };

  const showing = clients.length;
  const from = (page - 1) * 10 + 1;

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "calc(100vh - 57px)" }}>
      {/* Page header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", padding: "20px 20px 0" }}>
        <div>
          <h1 style={{ fontFamily: "var(--font-inter-tight)", fontSize: 20, fontWeight: 600, color: "var(--pf-text)" }}>
            Clients
          </h1>
          <p style={{ fontSize: 13, color: "var(--pf-text-2)", marginTop: 3 }}>
            {kpi.total} total · {kpi.active} active · {kpi.atRisk} at risk
          </p>
        </div>

        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {/* Search */}
          <div role="search" style={{ display: "flex", alignItems: "center", gap: 7, background: "var(--pf-surface)", border: "1px solid var(--pf-line)", borderRadius: 8, padding: "7px 11px" }}>
            <i className="ti ti-search" aria-hidden="true" style={{ fontSize: 14, color: "var(--pf-text-3)" }} />
            <input
              type="search"
              defaultValue={currentQuery}
              onChange={e => handleSearch(e.target.value)}
              placeholder="Search clients…"
              aria-label="Search clients"
              style={{ border: "none", background: "transparent", fontSize: 13, color: "var(--pf-text)", outline: "none", width: 180, fontFamily: "var(--font-inter)" }}
            />
          </div>

          <button type="button" style={ghostBtn}>
            <i className="ti ti-download" aria-hidden="true" style={{ fontSize: 15, color: "var(--pf-text-2)" }} /> Export
          </button>

          {canManage && (
            <button type="button" onClick={handleCreate} style={primaryBtn}>
              <i className="ti ti-plus" aria-hidden="true" style={{ fontSize: 15 }} /> Add client
            </button>
          )}
        </div>
      </div>

      <ClientsKpiBar {...kpi} />

      <ClientsToolbar
        activeFilter={currentFilter}
        onFilter={handleFilter}
        viewMode={viewMode}
        onViewMode={setViewMode}
        counts={counts}
      />

      <BulkBar count={selected.size} onClear={() => setSelected(new Set())} />

      {clients.length === 0 ? (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, padding: 48, color: "var(--pf-text-3)" }}>
          <i className="ti ti-users-off" aria-hidden="true" style={{ fontSize: 36, opacity: 0.4 }} />
          <p style={{ fontSize: 14, margin: 0 }}>No clients match your search.</p>
          {canManage && (
            <button onClick={handleCreate} type="button" style={{ ...primaryBtn, marginTop: 8 }}>
              <i className="ti ti-plus" style={{ fontSize: 15 }} /> Add your first client
            </button>
          )}
        </div>
      ) : (
        <>
          <ClientsTable
            clients={clients}
            selected={selected}
            onToggle={toggleClient}
            onToggleAll={toggleAll}
            onEdit={handleEdit}
            onDelete={(c) => setDeleteTarget(c)}
          />
          <ClientsPagination
            total={total}
            showing={showing}
            from={from}
            page={page}
            totalPages={totalPages}
            onPage={handlePage}
          />
        </>
      )}

      {/* Create / Edit modal */}
      <ClientModal
        open={modalOpen}
        onClose={handleCloseModal}
        client={editClient}
      />

      {/* Delete confirm */}
      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete client"
        description={deleteTarget ? `Permanently delete ${deleteTarget.name}? This will archive all related projects and invoices.` : ""}
        confirmLabel="Delete"
        variant="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={() => { setDeleteTarget(null); setDeleteState(null); }}
      />

      {deleteState?.error && (
        <div style={{ position: "fixed", bottom: 20, right: 20, padding: "12px 16px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 10, fontSize: 13, color: "#dc2626", zIndex: 300 }}>
          {deleteState.error}
        </div>
      )}
    </div>
  );
}

const ghostBtn: React.CSSProperties = {
  display: "flex", alignItems: "center", gap: 6,
  padding: "7px 13px", borderRadius: 8, border: "1px solid var(--pf-line)",
  background: "#fff", fontSize: 13, color: "var(--pf-text)", cursor: "pointer",
  fontFamily: "var(--font-inter)",
};

const primaryBtn: React.CSSProperties = {
  display: "flex", alignItems: "center", gap: 6,
  padding: "7px 14px", borderRadius: 8, border: "none",
  background: "#4f46e5", fontSize: 13, fontWeight: 500,
  color: "#fff", cursor: "pointer", fontFamily: "var(--font-inter)",
};
