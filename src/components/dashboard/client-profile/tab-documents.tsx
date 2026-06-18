"use client";

import { motion } from "framer-motion";
import { DOC_ICON } from "@/lib/projects-data";

// Mock data retained until Documents Module sprint
const DOCUMENTS: { clientId: string; id: string; name: string; type: string; size: string; uploadedBy: string; date: string }[] = [];

interface Props { clientId: string }

export function TabDocuments({ clientId }: Props) {
  const docs = DOCUMENTS.filter(d => d.clientId === clientId);

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <span style={{ fontSize: 13, color: "var(--pf-text-2)" }}>{docs.length} file{docs.length !== 1 ? "s" : ""}</span>
        <button type="button" style={uploadBtn}>
          <i className="ti ti-upload" aria-hidden="true" style={{ fontSize: 14 }} /> Upload
        </button>
      </div>

      {docs.length === 0 && (
        <Empty icon="ti-file-off" text="No documents uploaded yet." />
      )}

      <div style={{ border: "1px solid var(--pf-line)", borderRadius: 10, overflow: "hidden" }}>
        {docs.map((doc, i) => {
          const di = DOC_ICON[doc.type as keyof typeof DOC_ICON] ?? { icon: "ti-file", color: "#64748b" };
          return (
            <motion.div
              key={doc.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.04 }}
              style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: "12px 16px",
                borderBottom: i < docs.length - 1 ? "1px solid var(--pf-line)" : "none",
                background: "#fff",
                cursor: "pointer",
              }}
            >
              {/* File type icon */}
              <div style={{ width: 36, height: 36, borderRadius: 8, background: di.color + "18", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <i className={`ti ${di.icon}`} aria-hidden="true" style={{ fontSize: 18, color: di.color }} />
              </div>

              {/* Name + meta */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: "var(--pf-text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" as const }}>
                  {doc.name}
                </div>
                <div style={{ fontSize: 12, color: "var(--pf-text-3)", marginTop: 2 }}>
                  {doc.size} · Uploaded by {doc.uploadedBy} · {doc.date}
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                <ActionBtn icon="ti-download" label={`Download ${doc.name}`} />
                <ActionBtn icon="ti-dots-vertical" label="More options" />
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

function ActionBtn({ icon, label }: { icon: string; label: string }) {
  return (
    <button
      type="button"
      aria-label={label}
      style={{ width: 30, height: 30, borderRadius: 6, border: "1px solid var(--pf-line)", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--pf-text-2)" }}
    >
      <i className={`ti ${icon}`} aria-hidden="true" style={{ fontSize: 14 }} />
    </button>
  );
}

const uploadBtn: React.CSSProperties = {
  display: "flex", alignItems: "center", gap: 6,
  padding: "6px 13px", borderRadius: 8,
  border: "1px solid var(--pf-line)", background: "#fff",
  color: "var(--pf-text)", fontSize: 13, cursor: "pointer",
  fontFamily: "var(--font-inter)",
};

function Empty({ icon, text }: { icon: string; text: string }) {
  return (
    <div style={{ textAlign: "center", padding: "40px 0", color: "var(--pf-text-3)" }}>
      <i className={`ti ${icon}`} aria-hidden="true" style={{ fontSize: 32, opacity: 0.35 }} />
      <p style={{ marginTop: 8, fontSize: 13 }}>{text}</p>
    </div>
  );
}
