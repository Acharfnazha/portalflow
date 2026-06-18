import { use } from "react";
import { formatFileSize, formatDate } from "@/lib/format";

const TYPE_ICON: Record<string, { icon: string; bg: string; color: string }> = {
  pdf:   { icon: "ti-file-type-pdf",    bg: "#fef2f2", color: "#dc2626" },
  doc:   { icon: "ti-file-type-doc",    bg: "#eff6ff", color: "#1d4ed8" },
  xls:   { icon: "ti-file-spreadsheet", bg: "#f0fdf4", color: "#16a34a" },
  img:   { icon: "ti-photo",            bg: "#faf5ff", color: "#7e22ce" },
  other: { icon: "ti-file",             bg: "var(--pf-surface-2)", color: "var(--pf-text-3)" },
};

export default function PortalDocumentsPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token: _token } = use(params);

  const docs = [
    { id: "1", name: "Brand Guidelines v3.pdf",         type: "pdf", size: 4200000, date: "2025-01-10" },
    { id: "2", name: "Project Proposal Q1 2025.docx",   type: "doc", size: 280000,  date: "2025-01-08" },
    { id: "3", name: "Hero Illustration Final.png",      type: "img", size: 1900000, date: "2025-01-04" },
    { id: "4", name: "Contract — Antigravity 2025.pdf",  type: "pdf", size: 420000,  date: "2025-01-02" },
  ];

  return (
    <div style={{ padding: 28 }}>
      <h1 style={{ fontSize: 20, fontWeight: 700, color: "var(--pf-text)", margin: "0 0 20px", letterSpacing: "-.3px" }}>
        Documents
      </h1>

      <div style={{ background: "#fff", border: "1px solid var(--pf-line)", borderRadius: 12, overflow: "hidden" }}>
        {docs.map((doc, i) => {
          const ti = TYPE_ICON[doc.type] ?? TYPE_ICON.other;
          return (
            <div
              key={doc.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                padding: "14px 18px",
                borderBottom: i < docs.length - 1 ? "1px solid var(--pf-line)" : "none",
              }}
            >
              <div
                style={{
                  width: 40, height: 40, borderRadius: 10,
                  background: ti.bg, flexShrink: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}
              >
                <i className={`ti ${ti.icon}`} aria-hidden style={{ fontSize: 20, color: ti.color }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: 0, fontSize: 13.5, fontWeight: 500, color: "var(--pf-text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {doc.name}
                </p>
                <p style={{ margin: 0, fontSize: 12, color: "var(--pf-text-3)" }}>
                  {formatFileSize(doc.size)} · {formatDate(doc.date)}
                </p>
              </div>
              <button
                type="button"
                style={{
                  display: "flex", alignItems: "center", gap: 5,
                  padding: "6px 12px", borderRadius: 7,
                  border: "1px solid var(--pf-line)", background: "#fff",
                  fontSize: 12.5, color: "var(--pf-text-2)", cursor: "pointer", fontFamily: "var(--font-inter)",
                }}
              >
                <i className="ti ti-download" aria-hidden style={{ fontSize: 13 }} />
                Download
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
