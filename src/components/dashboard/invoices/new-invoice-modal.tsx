"use client";

import { useState, useEffect, useRef, useActionState } from "react";
import { useToast } from "@/stores/ui.store";
import { createInvoiceAction } from "@/lib/supabase/invoice-actions";
import type { CreateInvoiceState } from "@/lib/supabase/invoice-actions";

interface Props {
  open:     boolean;
  onClose:  () => void;
  clients:  { id: string; name: string }[];
  projects: { id: string; name: string; clientId: string }[];
}

const STATUSES = [
  { value: "draft",   label: "Draft"   },
  { value: "pending", label: "Pending" },
];

export function NewInvoiceModal({ open, onClose, clients, projects }: Props) {
  const { success, error: toastError } = useToast();
  const firstInputRef  = useRef<HTMLSelectElement>(null);
  const [clientId, setClientId] = useState("");

  const [state, formAction, pending] = useActionState<CreateInvoiceState | null, FormData>(
    createInvoiceAction,
    null
  );

  // Toast + close on server action result
  useEffect(() => {
    if (state?.success) {
      onClose();
      setTimeout(() => setClientId(""), 0);
      success("Invoice created", "The invoice has been saved.");
    }
    if (state?.error) {
      toastError("Failed to create invoice", state.error);
    }
  }, [state]); // eslint-disable-line react-hooks/exhaustive-deps

  // Body scroll lock + focus
  useEffect(() => {
    if (open) {
      setTimeout(() => firstInputRef.current?.focus(), 50);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      setTimeout(() => setClientId(""), 0);
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  // Escape key
  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const filteredProjects = clientId
    ? projects.filter((p) => p.clientId === clientId)
    : projects;

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "9px 12px", borderRadius: 8,
    border: "1px solid var(--pf-line)", fontSize: 13.5,
    color: "var(--pf-text)", background: "#fff",
    fontFamily: "var(--font-inter)", outline: "none", boxSizing: "border-box",
  };
  const labelStyle: React.CSSProperties = {
    display: "block", fontSize: 12.5, fontWeight: 500,
    color: "var(--pf-text-2)", marginBottom: 6,
  };

  return (
    <>
      {/* Backdrop */}
      <div onClick={onClose}
        style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.4)", zIndex: 100 }} />

      {/* Panel */}
      <div role="dialog" aria-modal="true" aria-labelledby="new-invoice-title"
        style={{ position: "fixed", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 101, padding: 16 }}>
        <div style={{ background: "#fff", borderRadius: 14, width: "100%", maxWidth: 560, maxHeight: "90vh", overflow: "auto", boxShadow: "0 20px 60px rgba(0,0,0,.18)" }}
          onClick={(e) => e.stopPropagation()}>

          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 22px 14px", borderBottom: "1px solid var(--pf-line)" }}>
            <div>
              <h2 id="new-invoice-title" style={{ fontFamily: "var(--font-inter-tight)", fontSize: 17, fontWeight: 700, color: "var(--pf-text)", margin: 0 }}>
                New invoice
              </h2>
              <p style={{ fontSize: 12.5, color: "var(--pf-text-3)", margin: "3px 0 0" }}>
                Fill in the details to create a new invoice.
              </p>
            </div>
            <button type="button" onClick={onClose} aria-label="Close"
              style={{ width: 30, height: 30, borderRadius: 7, border: "1px solid var(--pf-line)", background: "transparent", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--pf-text-3)", flexShrink: 0 }}>
              <i className="ti ti-x" aria-hidden style={{ fontSize: 15 }} />
            </button>
          </div>

          {/* Form */}
          <form action={formAction}>
            <div style={{ padding: "20px 22px", display: "flex", flexDirection: "column", gap: 16 }}>

              {/* Client + Project */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div>
                  <label htmlFor="inv-client" style={labelStyle}>
                    Client <span style={{ color: "#dc2626" }}>*</span>
                  </label>
                  <select id="inv-client" name="client_id" required ref={firstInputRef}
                    value={clientId} onChange={(e) => setClientId(e.target.value)}
                    style={{ ...inputStyle, cursor: "pointer" }}>
                    <option value="">Select client…</option>
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="inv-project" style={labelStyle}>Project</label>
                  <select id="inv-project" name="project_id"
                    style={{ ...inputStyle, cursor: "pointer" }}>
                    <option value="">None</option>
                    {filteredProjects.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Amount + Status */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div>
                  <label htmlFor="inv-amount" style={labelStyle}>
                    Amount ($) <span style={{ color: "#dc2626" }}>*</span>
                  </label>
                  <input id="inv-amount" name="amount" type="number"
                    min={0} step="0.01" required placeholder="0.00" style={inputStyle} />
                </div>
                <div>
                  <label htmlFor="inv-status" style={labelStyle}>Status</label>
                  <select id="inv-status" name="status" defaultValue="draft"
                    style={{ ...inputStyle, cursor: "pointer" }}>
                    {STATUSES.map((s) => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Dates */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div>
                  <label htmlFor="inv-issued" style={labelStyle}>
                    Issue date <span style={{ color: "#dc2626" }}>*</span>
                  </label>
                  <input id="inv-issued" name="issued_date" type="date" required
                    defaultValue={new Date().toISOString().split("T")[0]} style={inputStyle} />
                </div>
                <div>
                  <label htmlFor="inv-due" style={labelStyle}>
                    Due date <span style={{ color: "#dc2626" }}>*</span>
                  </label>
                  <input id="inv-due" name="due_date" type="date" required style={inputStyle} />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label htmlFor="inv-notes" style={labelStyle}>Notes</label>
                <textarea id="inv-notes" name="notes" rows={3}
                  placeholder="Payment terms, scope notes, or any other details…"
                  style={{ ...inputStyle, resize: "vertical" as const, lineHeight: 1.6 }} />
              </div>
            </div>

            {/* Footer */}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, padding: "14px 22px", borderTop: "1px solid var(--pf-line)" }}>
              <button type="button" onClick={onClose}
                style={{ padding: "8px 18px", borderRadius: 8, border: "1px solid var(--pf-line)", background: "#fff", fontSize: 13.5, color: "var(--pf-text)", cursor: "pointer", fontFamily: "var(--font-inter)", fontWeight: 500 }}>
                Cancel
              </button>
              <button type="submit" disabled={pending}
                style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 20px", borderRadius: 8, border: "none", background: pending ? "#a5b4fc" : "#4f46e5", fontSize: 13.5, color: "#fff", fontWeight: 500, cursor: pending ? "not-allowed" : "pointer", fontFamily: "var(--font-inter)", transition: "background .15s" }}>
                {pending
                  ? <><i className="ti ti-loader-2" aria-hidden style={{ fontSize: 15 }} />Saving…</>
                  : "Create invoice"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
