"use client";

import { useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import type { Document } from "@/types/app.types";
import { FILE_TYPE_TABS } from "@/lib/doc-config";
import { formatFileSize } from "@/lib/format";
import { DocumentRow } from "./document-row";
import { UploadModal } from "./upload-modal";

interface Props {
  documents:    Document[];
  clientNames:  Record<string, string>;
  projectNames: Record<string, string>;
  clients:      { id: string; name: string }[];
  projects:     { id: string; name: string }[];
  totalCount:   number;
  role:         string;
  orgId:        string;
  initialSearch:    string;
  initialType:      string;
  initialClientId:  string;
  initialProjectId: string;
}

export default function DocumentsShell({
  documents,
  clientNames,
  projectNames,
  clients,
  projects,
  totalCount,
  orgId,
  initialSearch,
  initialType,
  initialClientId,
  initialProjectId,
}: Props) {
  const router       = useRouter();
  const searchParams = useSearchParams();

  const [uploadOpen, setUploadOpen] = useState(false);
  const [search, setSearch]         = useState(initialSearch);

  const activeType      = searchParams.get("type")       ?? initialType      ?? "all";
  const activeClientId  = searchParams.get("client_id")  ?? initialClientId  ?? "";
  const activeProjectId = searchParams.get("project_id") ?? initialProjectId ?? "";

  // Total size of all fetched documents
  const totalSize = documents.reduce((sum, d) => sum + (d.sizeBytes ?? 0), 0);

  function pushParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "all") {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/dashboard/documents?${params.toString()}`);
  }

  const handleSearch = useCallback(
    (value: string) => {
      setSearch(value);
      const params = new URLSearchParams(searchParams.toString());
      if (value.trim()) {
        params.set("q", value.trim());
      } else {
        params.delete("q");
      }
      router.push(`/dashboard/documents?${params.toString()}`);
    },
    [router, searchParams]
  );

  return (
    <div style={{ minHeight: "calc(100vh - 57px)", background: "var(--pf-surface)" }}>
      {/* ── Page header ─────────────────────────────────────────── */}
      <div
        style={{
          background:      "#fff",
          borderBottom:    "1px solid var(--pf-line)",
          padding:         "20px 20px 16px",
          display:         "flex",
          alignItems:      "flex-start",
          justifyContent:  "space-between",
          gap:             12,
          flexWrap:        "wrap",
        }}
      >
        <div>
          <h1
            style={{
              fontFamily: "var(--font-inter-tight)",
              fontSize:   20,
              fontWeight: 700,
              color:      "var(--pf-text)",
              margin:     0,
            }}
          >
            Documents
          </h1>
          <p style={{ fontSize: 13, color: "var(--pf-text-2)", margin: "4px 0 0" }}>
            {totalCount} {totalCount === 1 ? "file" : "files"} · {formatFileSize(totalSize)} stored
          </p>
        </div>

        <button
          type="button"
          onClick={() => setUploadOpen(true)}
          style={{
            display:     "flex",
            alignItems:  "center",
            gap:         6,
            padding:     "8px 16px",
            borderRadius: 8,
            border:      "none",
            background:  "#4f46e5",
            fontSize:    13.5,
            fontWeight:  500,
            color:       "#fff",
            cursor:      "pointer",
            fontFamily:  "var(--font-inter)",
          }}
        >
          <i className="ti ti-upload" aria-hidden style={{ fontSize: 15 }} />
          Upload
        </button>
      </div>

      {/* ── KPI bar ──────────────────────────────────────────────── */}
      <div
        style={{
          display:       "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
          gap:           1,
          background:    "var(--pf-line)",
          borderBottom:  "1px solid var(--pf-line)",
        }}
      >
        {[
          { label: "Total files", value: totalCount, icon: "ti-files" },
          {
            label: "PDF",
            value: documents.filter((d) => d.fileType === "pdf").length,
            icon:  "ti-file-type-pdf",
          },
          {
            label: "Images",
            value: documents.filter((d) => d.fileType === "img").length,
            icon:  "ti-photo",
          },
          {
            label: "Storage used",
            value: formatFileSize(totalSize),
            icon:  "ti-database",
          },
        ].map((kpi) => (
          <div
            key={kpi.label}
            style={{
              background: "#fff",
              padding:    "14px 20px",
              display:    "flex",
              alignItems: "center",
              gap:        12,
            }}
          >
            <div
              style={{
                width:       36,
                height:      36,
                borderRadius: 9,
                background:  "#eef2ff",
                display:     "flex",
                alignItems:  "center",
                justifyContent: "center",
                flexShrink:  0,
              }}
            >
              <i
                className={`ti ${kpi.icon}`}
                aria-hidden
                style={{ fontSize: 18, color: "#4f46e5" }}
              />
            </div>
            <div>
              <div
                style={{
                  fontFamily: "var(--font-inter-tight)",
                  fontSize:   20,
                  fontWeight: 700,
                  color:      "var(--pf-text)",
                  lineHeight: 1,
                }}
              >
                {kpi.value}
              </div>
              <div style={{ fontSize: 11.5, color: "var(--pf-text-3)", marginTop: 2 }}>
                {kpi.label}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Filter / toolbar ─────────────────────────────────────── */}
      <div
        style={{
          background:    "#fff",
          borderBottom:  "1px solid var(--pf-line)",
          padding:       "10px 20px",
          display:       "flex",
          alignItems:    "center",
          justifyContent: "space-between",
          gap:           12,
          flexWrap:      "wrap",
        }}
      >
        {/* Type tabs */}
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
          {FILE_TYPE_TABS.map((t) => {
            const isActive = (activeType || "all") === t.key;
            return (
              <button
                key={t.key}
                type="button"
                onClick={() => pushParam("type", t.key)}
                style={{
                  padding:     "6px 12px",
                  borderRadius: 7,
                  border:      isActive ? "1px solid #c7d2fe" : "1px solid transparent",
                  background:  isActive ? "#eef2ff" : "transparent",
                  fontSize:    13,
                  color:       isActive ? "#4338ca" : "var(--pf-text-2)",
                  fontWeight:  isActive ? 600 : 400,
                  cursor:      "pointer",
                  fontFamily:  "var(--font-inter)",
                  transition:  "all .12s",
                }}
              >
                {t.label}
              </button>
            );
          })}
        </div>

        {/* Right filters: client, project, search */}
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          {/* Client dropdown */}
          {clients.length > 0 && (
            <select
              value={activeClientId}
              onChange={(e) => pushParam("client_id", e.target.value)}
              style={{
                padding:     "7px 10px",
                borderRadius: 8,
                border:      "1px solid var(--pf-line)",
                fontSize:    13,
                color:       activeClientId ? "var(--pf-text)" : "var(--pf-text-3)",
                background:  "#fff",
                cursor:      "pointer",
                fontFamily:  "var(--font-inter)",
                outline:     "none",
              }}
            >
              <option value="">All clients</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          )}

          {/* Project dropdown */}
          {projects.length > 0 && (
            <select
              value={activeProjectId}
              onChange={(e) => pushParam("project_id", e.target.value)}
              style={{
                padding:     "7px 10px",
                borderRadius: 8,
                border:      "1px solid var(--pf-line)",
                fontSize:    13,
                color:       activeProjectId ? "var(--pf-text)" : "var(--pf-text-3)",
                background:  "#fff",
                cursor:      "pointer",
                fontFamily:  "var(--font-inter)",
                outline:     "none",
              }}
            >
              <option value="">All projects</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          )}

          {/* Search */}
          <div
            style={{
              display:     "flex",
              alignItems:  "center",
              gap:         8,
              padding:     "7px 11px",
              borderRadius: 8,
              border:      "1px solid var(--pf-line)",
              background:  "#fff",
            }}
          >
            <i
              className="ti ti-search"
              aria-hidden
              style={{ fontSize: 14, color: "var(--pf-text-3)", flexShrink: 0 }}
            />
            <input
              type="search"
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search files…"
              aria-label="Search documents"
              style={{
                border:     "none",
                background: "transparent",
                fontSize:   13,
                color:      "var(--pf-text)",
                outline:    "none",
                width:      160,
                fontFamily: "var(--font-inter)",
              }}
            />
          </div>
        </div>
      </div>

      {/* ── Document table ───────────────────────────────────────── */}
      <div style={{ padding: 20 }}>
        <AnimatePresence mode="wait">
          {documents.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                background:   "#fff",
                border:       "1px solid var(--pf-line)",
                borderRadius: 12,
                display:      "flex",
                flexDirection: "column",
                alignItems:   "center",
                padding:      "72px 20px",
                gap:          12,
                color:        "var(--pf-text-3)",
              }}
            >
              <i
                className="ti ti-folder-off"
                aria-hidden
                style={{ fontSize: 44, opacity: 0.3 }}
              />
              <p style={{ fontSize: 15, fontWeight: 600, color: "var(--pf-text-2)", margin: 0 }}>
                No documents found
              </p>
              <p style={{ fontSize: 13, margin: 0 }}>
                {initialSearch || activeType !== "all" || activeClientId || activeProjectId
                  ? "Try adjusting the filters."
                  : "Upload your first document to get started."}
              </p>
              {!initialSearch && activeType === "all" && !activeClientId && !activeProjectId && (
                <button
                  type="button"
                  onClick={() => setUploadOpen(true)}
                  style={{
                    marginTop:   8,
                    display:     "flex",
                    alignItems:  "center",
                    gap:         6,
                    padding:     "8px 16px",
                    borderRadius: 8,
                    border:      "none",
                    background:  "#4f46e5",
                    fontSize:    13.5,
                    color:       "#fff",
                    fontWeight:  500,
                    cursor:      "pointer",
                    fontFamily:  "var(--font-inter)",
                  }}
                >
                  <i className="ti ti-upload" aria-hidden style={{ fontSize: 15 }} />
                  Upload first document
                </button>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                background:   "#fff",
                border:       "1px solid var(--pf-line)",
                borderRadius: 12,
                overflow:     "hidden",
              }}
            >
              {/* Table header */}
              <div
                style={{
                  display:       "grid",
                  gridTemplateColumns: "1fr auto",
                  padding:       "10px 16px",
                  borderBottom:  "1px solid var(--pf-line)",
                  background:    "var(--pf-surface)",
                }}
              >
                <span style={{ fontSize: 11.5, fontWeight: 600, color: "var(--pf-text-3)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Name
                </span>
                <span style={{ fontSize: 11.5, fontWeight: 600, color: "var(--pf-text-3)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Actions
                </span>
              </div>

              {documents.map((doc, i) => (
                <DocumentRow
                  key={doc.id}
                  doc={doc}
                  clientName={doc.clientId ? clientNames[doc.clientId] : undefined}
                  projectName={doc.projectId ? projectNames[doc.projectId] : undefined}
                  isLast={i === documents.length - 1}
                />
              ))}

              {/* Footer count */}
              <div
                style={{
                  padding:    "10px 16px",
                  borderTop:  "1px solid var(--pf-line)",
                  background: "var(--pf-surface)",
                }}
              >
                <span style={{ fontSize: 12, color: "var(--pf-text-3)" }}>
                  {documents.length} {documents.length === 1 ? "file" : "files"} · {formatFileSize(totalSize)}
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Upload modal ─────────────────────────────────────────── */}
      <UploadModal
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        orgId={orgId}
        clients={clients}
        projects={projects}
        defaultClientId={activeClientId}
        defaultProjectId={activeProjectId}
      />
    </div>
  );
}
