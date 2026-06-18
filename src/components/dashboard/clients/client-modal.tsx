"use client";

import { useActionState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { createClientAction, updateClientAction } from "@/lib/supabase/client-actions";
import type { Client, ClientStatus } from "@/types/app.types";

interface Props {
  open: boolean;
  onClose: () => void;
  client?: Client | null;
}

const STATUSES: { value: ClientStatus; label: string }[] = [
  { value: "new",      label: "New"      },
  { value: "active",   label: "Active"   },
  { value: "trial",    label: "Trial"    },
  { value: "at_risk",  label: "At Risk"  },
  { value: "churned",  label: "Churned"  },
];

const COMPANY_SIZES = ["1-10", "11-50", "51-200", "201-500", "500+"];

const INDUSTRIES = [
  "Technology", "Finance", "Healthcare", "Marketing", "E-commerce",
  "Education", "Real Estate", "Legal", "Media", "Consulting", "Other",
];

export function ClientModal({ open, onClose, client }: Props) {
  const isEdit = !!client;
  const action = isEdit ? updateClientAction : createClientAction;
  const [state, dispatch, pending] = useActionState(action, null);
  const formRef = useRef<HTMLFormElement>(null);
  const successRef = useRef(false);

  useEffect(() => {
    if (!open) {
      successRef.current = false;
      formRef.current?.reset();
    }
  }, [open]);

  useEffect(() => {
    if (!pending && state === null && successRef.current) {
      onClose();
    }
    if (pending) successRef.current = true;
  }, [state, pending, onClose]);

  const mrrDollars = client ? (client.mrrCents / 100).toFixed(0) : "";

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={onClose}
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.45)", zIndex: 100 }}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.15 }}
            style={{
              position: "fixed", top: "50%", left: "50%",
              transform: "translate(-50%, -50%)",
              width: 560, maxWidth: "calc(100vw - 40px)", maxHeight: "90vh",
              background: "#fff", borderRadius: 16,
              boxShadow: "0 24px 64px rgba(0,0,0,.18)",
              zIndex: 101, display: "flex", flexDirection: "column",
              overflow: "hidden",
            }}
          >
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 24px", borderBottom: "1px solid var(--pf-line)", flexShrink: 0 }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--pf-text)", margin: 0, letterSpacing: "-.2px" }}>
                {isEdit ? "Edit client" : "New client"}
              </h2>
              <button onClick={onClose} type="button" style={iconBtn}>
                <i className="ti ti-x" aria-hidden style={{ fontSize: 15 }} />
              </button>
            </div>

            {/* Form body */}
            <form
              ref={formRef}
              action={dispatch}
              style={{ overflowY: "auto", flex: 1, padding: "24px", display: "flex", flexDirection: "column", gap: 18 }}
            >
              {isEdit && <input type="hidden" name="id" value={client.id} />}

              {state?.error && (
                <div style={{ padding: "10px 14px", borderRadius: 8, background: "#fef2f2", border: "1px solid #fecaca", fontSize: 13, color: "#dc2626", display: "flex", alignItems: "center", gap: 8 }}>
                  <i className="ti ti-alert-circle" style={{ fontSize: 15, flexShrink: 0 }} />
                  {state.error}
                </div>
              )}

              {/* Row: name + status */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 160px", gap: 14 }}>
                <Field label="Company name *">
                  <input name="name" type="text" required defaultValue={client?.name} placeholder="Acme Corp" style={inputStyle} />
                </Field>
                <Field label="Status">
                  <select name="status" defaultValue={client?.status ?? "new"} style={inputStyle}>
                    {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                </Field>
              </div>

              {/* Row: email + phone */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <Field label="Email">
                  <input name="email" type="email" defaultValue={client?.email ?? ""} placeholder="contact@company.com" style={inputStyle} />
                </Field>
                <Field label="Phone">
                  <input name="phone" type="tel" defaultValue={client?.phone ?? ""} placeholder="+1 555 000 0000" style={inputStyle} />
                </Field>
              </div>

              {/* Row: website + domain */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <Field label="Website">
                  <input name="website" type="url" defaultValue={client?.website ?? ""} placeholder="https://company.com" style={inputStyle} />
                </Field>
                <Field label="Domain">
                  <input name="domain" type="text" defaultValue={client?.domain ?? ""} placeholder="company.com" style={inputStyle} />
                </Field>
              </div>

              {/* Row: industry + company size */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <Field label="Industry">
                  <select name="industry" defaultValue={client?.industry ?? ""} style={inputStyle}>
                    <option value="">— Select —</option>
                    {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
                  </select>
                </Field>
                <Field label="Company size">
                  <select name="company_size" defaultValue={client?.companySize ?? ""} style={inputStyle}>
                    <option value="">— Select —</option>
                    {COMPANY_SIZES.map(s => <option key={s} value={s}>{s} employees</option>)}
                  </select>
                </Field>
              </div>

              {/* Row: location + MRR */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <Field label="Location">
                  <input name="location" type="text" defaultValue={client?.location ?? ""} placeholder="San Francisco, CA" style={inputStyle} />
                </Field>
                <Field label="Monthly revenue ($)">
                  <input name="mrr" type="number" min="0" step="1" defaultValue={mrrDollars} placeholder="0" style={inputStyle} />
                </Field>
              </div>

              {/* Tags */}
              <Field label="Tags" hint="Comma-separated (e.g. Enterprise, VIP)">
                <input name="tags" type="text" defaultValue={client?.tags?.join(", ") ?? ""} placeholder="Enterprise, SaaS, VIP" style={inputStyle} />
              </Field>

              {/* Notes */}
              <Field label="Notes">
                <textarea
                  name="notes"
                  defaultValue={client?.notes ?? ""}
                  rows={3}
                  placeholder="Internal notes about this client…"
                  style={{ ...inputStyle, resize: "vertical", lineHeight: 1.55 }}
                />
              </Field>

              {/* Footer */}
              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", paddingTop: 8, borderTop: "1px solid var(--pf-line)", flexShrink: 0 }}>
                <button type="button" onClick={onClose} style={cancelBtn}>Cancel</button>
                <button type="submit" disabled={pending} style={{ ...submitBtn, background: pending ? "#818cf8" : "#4f46e5" }}>
                  {pending && (
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden style={{ animation: "pf-spin .7s linear infinite" }}>
                      <circle cx="8" cy="8" r="6" stroke="rgba(255,255,255,.35)" strokeWidth="2" />
                      <path d="M14 8a6 6 0 0 0-6-6" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  )}
                  {pending ? "Saving…" : isEdit ? "Save changes" : "Create client"}
                </button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ display: "block", fontSize: 12.5, fontWeight: 500, color: "var(--pf-text-2)", marginBottom: 5 }}>
        {label}
        {hint && <span style={{ fontWeight: 400, color: "var(--pf-text-3)", marginLeft: 5 }}>{hint}</span>}
      </label>
      {children}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "8px 12px", borderRadius: 8,
  border: "1px solid var(--pf-line-strong)", fontSize: 13.5,
  color: "var(--pf-text)", background: "#fff", outline: "none",
  fontFamily: "var(--font-inter)", boxSizing: "border-box",
};

const iconBtn: React.CSSProperties = {
  width: 30, height: 30, borderRadius: 8, border: "1px solid var(--pf-line)",
  background: "#fff", cursor: "pointer", display: "flex",
  alignItems: "center", justifyContent: "center", color: "var(--pf-text-3)",
};

const cancelBtn: React.CSSProperties = {
  padding: "8px 16px", borderRadius: 8, border: "1px solid var(--pf-line-strong)",
  background: "#fff", fontSize: 13.5, color: "var(--pf-text-2)",
  cursor: "pointer", fontFamily: "var(--font-inter)",
};

const submitBtn: React.CSSProperties = {
  padding: "8px 18px", borderRadius: 8, border: "none",
  color: "#fff", fontSize: 13.5, fontWeight: 500,
  cursor: "pointer", fontFamily: "var(--font-inter)",
  display: "flex", alignItems: "center", gap: 7,
};
