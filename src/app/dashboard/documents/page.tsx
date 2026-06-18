"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PageHeader } from "@/components/shared/page-header";
import { SearchInput } from "@/components/shared/search-input";
import { FilterTabs } from "@/components/shared/filter-tabs";
import { FileUploader } from "@/components/shared/file-uploader";
import { EmptyState } from "@/components/ui/empty-state";
import { formatFileSize, formatDate } from "@/lib/format";

type FileType = "all" | "pdf" | "doc" | "xls" | "img" | "other";

const MOCK_DOCS = [
  { id: "1", name: "Brand Guidelines v3.pdf",        type: "pdf",  size: 4200000,  client: "Nexus Digital",     date: "2025-01-10" },
  { id: "2", name: "Project Proposal — Q1 2025.docx",type: "doc",  size: 280000,   client: "Bloom Health",      date: "2025-01-08" },
  { id: "3", name: "Invoice Tracker Jan.xlsx",        type: "xls",  size: 156000,   client: "Arcadia Retail",    date: "2025-01-06" },
  { id: "4", name: "Hero Illustration Final.png",     type: "img",  size: 1900000,  client: "Nexus Digital",     date: "2025-01-04" },
  { id: "5", name: "NDA — Crestwood Finance.pdf",     type: "pdf",  size: 320000,   client: "Crestwood Finance", date: "2024-12-20" },
  { id: "6", name: "Sitemap Draft.pdf",               type: "pdf",  size: 190000,   client: "Bloom Health",      date: "2024-12-15" },
];

const TYPE_ICON: Record<string, { icon: string; bg: string; color: string }> = {
  pdf:   { icon: "ti-file-type-pdf", bg: "#fef2f2", color: "#dc2626" },
  doc:   { icon: "ti-file-type-doc", bg: "#eff6ff", color: "#1d4ed8" },
  xls:   { icon: "ti-file-spreadsheet", bg: "#f0fdf4", color: "#16a34a" },
  img:   { icon: "ti-photo",          bg: "#faf5ff", color: "#7e22ce" },
  other: { icon: "ti-file",           bg: "var(--pf-surface-2)", color: "var(--pf-text-3)" },
};

const TABS = [
  { key: "all" as const, label: "All" },
  { key: "pdf" as const, label: "PDF" },
  { key: "doc" as const, label: "Word" },
  { key: "xls" as const, label: "Excel" },
  { key: "img" as const, label: "Images" },
];

export default function DocumentsPage() {
  const [query, setQuery]       = useState("");
  const [filter, setFilter]     = useState<FileType>("all");
  const [uploading, setUploading] = useState(false);
  const [showUpload, setShowUpload] = useState(false);

  const filtered = MOCK_DOCS.filter(d => {
    const q = query.toLowerCase();
    const matchQ = !q || d.name.toLowerCase().includes(q) || d.client.toLowerCase().includes(q);
    const matchF = filter === "all" || d.type === filter;
    return matchQ && matchF;
  });

  async function handleUpload(files: File[]) {
    setUploading(true);
    await new Promise(r => setTimeout(r, 1500));
    setUploading(false);
    setShowUpload(false);
    alert(`Uploaded: ${files.map(f => f.name).join(", ")}`);
  }

  return (
    <div style={{ minHeight: "calc(100vh - 57px)", background: "var(--pf-surface)" }}>
      <PageHeader
        title="Documents"
        subtitle={`${MOCK_DOCS.length} files across all clients`}
        actions={
          <>
            <button
              type="button"
              onClick={() => setShowUpload(v => !v)}
              style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "7px 14px", borderRadius: 8, border: "none",
                background: "#4f46e5", fontSize: 13, fontWeight: 500,
                color: "#fff", cursor: "pointer", fontFamily: "var(--font-inter)",
              }}
            >
              <i className="ti ti-upload" aria-hidden style={{ fontSize: 15 }} />
              Upload
            </button>
          </>
        }
      />

      <AnimatePresence>
        {showUpload && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            style={{ overflow: "hidden", background: "#fff", borderBottom: "1px solid var(--pf-line)" }}
          >
            <div style={{ padding: "20px 20px" }}>
              <FileUploader
                accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.zip"
                multiple
                onUpload={handleUpload}
                uploading={uploading}
                label="Upload documents"
                description="PDF, Word, Excel, images, ZIP · Max 25 MB each"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div
        style={{
          background: "#fff",
          borderBottom: "1px solid var(--pf-line)",
          padding: "10px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <FilterTabs tabs={TABS} active={filter} onChange={setFilter} />
        <SearchInput value={query} onChange={setQuery} placeholder="Search documents…" />
      </div>

      <div style={{ padding: 20 }}>
        {filtered.length === 0 ? (
          <div style={{ background: "#fff", border: "1px solid var(--pf-line)", borderRadius: 12 }}>
            <EmptyState
              icon="ti-folder-off"
              title="No documents found"
              description="Upload your first document or adjust the filters."
            />
          </div>
        ) : (
          <div
            style={{
              background: "#fff",
              border: "1px solid var(--pf-line)",
              borderRadius: 12,
              overflow: "hidden",
            }}
          >
            {filtered.map((doc, i) => {
              const ti = TYPE_ICON[doc.type] ?? TYPE_ICON.other;
              return (
                <motion.div
                  key={doc.id}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                    padding: "13px 16px",
                    borderBottom: i < filtered.length - 1 ? "1px solid var(--pf-line)" : "none",
                  }}
                >
                  <div
                    style={{
                      width: 38, height: 38, borderRadius: 9,
                      background: ti.bg, display: "flex",
                      alignItems: "center", justifyContent: "center", flexShrink: 0,
                    }}
                  >
                    <i className={`ti ${ti.icon}`} aria-hidden style={{ fontSize: 19, color: ti.color }} />
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: 0, fontSize: 13.5, fontWeight: 500, color: "var(--pf-text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {doc.name}
                    </p>
                    <p style={{ margin: 0, fontSize: 12, color: "var(--pf-text-3)" }}>
                      {doc.client} · {formatFileSize(doc.size)} · {formatDate(doc.date)}
                    </p>
                  </div>

                  <div style={{ display: "flex", gap: 5 }}>
                    {["ti-download", "ti-dots-vertical"].map(ic => (
                      <button
                        key={ic}
                        type="button"
                        style={{
                          width: 30, height: 30, borderRadius: 7,
                          border: "1px solid var(--pf-line)", background: "#fff",
                          cursor: "pointer", display: "flex",
                          alignItems: "center", justifyContent: "center", color: "var(--pf-text-2)",
                        }}
                      >
                        <i className={`ti ${ic}`} aria-hidden style={{ fontSize: 14 }} />
                      </button>
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
