"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import type { Document, DocumentFileType } from "@/types/app.types";
import { FILE_TYPE_CONFIG } from "@/lib/doc-config";
import { formatFileSize } from "@/lib/format";
import { getSignedUrlAction, deleteDocumentAction } from "@/lib/supabase/document-actions";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { UploadModal } from "@/components/dashboard/documents/upload-modal";
import { useToast } from "@/stores/ui.store";

interface Props {
  clientId:   string;
  orgId:      string;
  canManage?: boolean;
  // Pass these when embedding in project detail
  projectId?: string;
  projects?:  { id: string; name: string }[];
  clients?:   { id: string; name: string }[];
}

export function TabDocuments({
  clientId,
  orgId,
  canManage,
  projectId,
  projects = [],
  clients  = [],
}: Props) {
  const { success, error: toastError } = useToast();
  const [docs,         setDocs]         = useState<Document[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [uploadOpen,   setUploadOpen]   = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Document | null>(null);
  const [downloading,  setDownloading]  = useState<string | null>(null);

  const fetchDocs = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();

    let query = supabase
      .from("documents")
      .select("*")
      .eq("organization_id", orgId)
      .is("deleted_at", null)
      .eq("status", "ready")
      .order("created_at", { ascending: false });

    if (projectId) {
      query = query.eq("project_id", projectId);
    } else {
      query = query.eq("client_id", clientId);
    }

    const { data } = await query;
    setDocs(
      (data ?? []).map((r) => ({
        id:              r.id,
        organizationId:  r.organization_id,
        clientId:        r.client_id || undefined,
        projectId:       r.project_id || undefined,
        uploadedBy:      r.uploaded_by || undefined,
        name:            r.name,
        filePath:        r.file_path,
        fileType:        (r.file_type as DocumentFileType) || "other",
        mimeType:        r.mime_type || undefined,
        sizeBytes:       r.size_bytes ?? 0,
        version:         r.version ?? 1,
        status:          r.status ?? "ready",
        visibleToClient: r.visible_to_client ?? false,
        tags:            r.tags ?? [],
        createdAt:       r.created_at,
        updatedAt:       r.updated_at,
      }))
    );
    setLoading(false);
  }, [clientId, projectId, orgId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchDocs();
  }, [fetchDocs]);

  async function handleDownload(doc: Document) {
    setDownloading(doc.id);
    const res = await getSignedUrlAction(doc.id);
    setDownloading(null);
    if (res.error) {
      toastError("Download failed", res.error);
    } else if (res.url) {
      window.open(res.url, "_blank", "noopener");
      success("Download started");
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    const fd = new FormData();
    fd.append("id", deleteTarget.id);
    const result = await deleteDocumentAction(null, fd);
    if (result?.error) {
      toastError("Delete failed", result.error);
    } else {
      success("Document deleted");
      setDocs((prev) => prev.filter((d) => d.id !== deleteTarget.id));
    }
    setDeleteTarget(null);
  }

  return (
    <div>
      {/* Toolbar */}
      <div
        style={{
          display:        "flex",
          alignItems:     "center",
          justifyContent: "space-between",
          marginBottom:   16,
        }}
      >
        <span style={{ fontSize: 13, color: "var(--pf-text-2)" }}>
          {loading ? "Loading…" : `${docs.length} ${docs.length === 1 ? "file" : "files"}`}
        </span>
        {canManage && (
          <button
            type="button"
            onClick={() => setUploadOpen(true)}
            style={{
              display:     "flex",
              alignItems:  "center",
              gap:         6,
              padding:     "6px 13px",
              borderRadius: 8,
              border:      "1px solid var(--pf-line)",
              background:  "#fff",
              color:       "var(--pf-text)",
              fontSize:    13,
              cursor:      "pointer",
              fontFamily:  "var(--font-inter)",
            }}
          >
            <i className="ti ti-upload" aria-hidden style={{ fontSize: 14 }} />
            Upload
          </button>
        )}
      </div>

      {/* List */}
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              display:       "flex",
              flexDirection: "column",
              alignItems:    "center",
              padding:       "48px 0",
              color:         "var(--pf-text-3)",
            }}
          >
            <i
              className="ti ti-loader-2"
              aria-hidden
              style={{ fontSize: 28, opacity: 0.4, animation: "spin 1s linear infinite" }}
            />
            <p style={{ fontSize: 13, marginTop: 10 }}>Loading documents…</p>
          </motion.div>
        ) : docs.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              display:       "flex",
              flexDirection: "column",
              alignItems:    "center",
              padding:       "48px 0",
              color:         "var(--pf-text-3)",
            }}
          >
            <i className="ti ti-file-off" aria-hidden style={{ fontSize: 32, opacity: 0.3 }} />
            <p style={{ fontSize: 13, marginTop: 10, margin: "10px 0 0" }}>No documents yet.</p>
            {canManage && (
              <button
                type="button"
                onClick={() => setUploadOpen(true)}
                style={{
                  marginTop:   10,
                  fontSize:    13,
                  color:       "#4f46e5",
                  background:  "none",
                  border:      "none",
                  cursor:      "pointer",
                  fontFamily:  "var(--font-inter)",
                  textDecoration: "underline",
                }}
              >
                Upload the first document
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
              border:       "1px solid var(--pf-line)",
              borderRadius: 10,
              overflow:     "hidden",
            }}
          >
            {docs.map((doc, i) => {
              const ftc = FILE_TYPE_CONFIG[doc.fileType ?? "other"] ?? FILE_TYPE_CONFIG.other;
              const dateStr = doc.createdAt
                ? new Date(doc.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day:   "numeric",
                    year:  "numeric",
                  })
                : "—";

              return (
                <motion.div
                  key={doc.id}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  style={{
                    display:      "flex",
                    alignItems:   "center",
                    gap:          12,
                    padding:      "12px 16px",
                    borderBottom: i < docs.length - 1 ? "1px solid var(--pf-line)" : "none",
                    background:   "#fff",
                  }}
                  onMouseEnter={(e) =>
                    ((e.currentTarget as HTMLDivElement).style.background = "var(--pf-surface)")
                  }
                  onMouseLeave={(e) =>
                    ((e.currentTarget as HTMLDivElement).style.background = "#fff")
                  }
                >
                  {/* Icon */}
                  <div
                    style={{
                      width:          36,
                      height:         36,
                      borderRadius:   8,
                      background:     ftc.bg,
                      display:        "flex",
                      alignItems:     "center",
                      justifyContent: "center",
                      flexShrink:     0,
                    }}
                  >
                    <i
                      className={`ti ${ftc.icon}`}
                      aria-hidden
                      style={{ fontSize: 18, color: ftc.color }}
                    />
                  </div>

                  {/* Name + meta */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize:     13,
                        fontWeight:   500,
                        color:        "var(--pf-text)",
                        overflow:     "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace:   "nowrap",
                      }}
                    >
                      {doc.name}
                    </div>
                    <div style={{ fontSize: 11.5, color: "var(--pf-text-3)", marginTop: 2 }}>
                      {ftc.label} · {formatFileSize(doc.sizeBytes)} · {dateStr}
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                    <button
                      type="button"
                      aria-label={`Download ${doc.name}`}
                      onClick={() => handleDownload(doc)}
                      disabled={downloading === doc.id}
                      style={{
                        width:          30,
                        height:         30,
                        borderRadius:   6,
                        border:         "1px solid var(--pf-line)",
                        background:     "#fff",
                        display:        "flex",
                        alignItems:     "center",
                        justifyContent: "center",
                        cursor:         downloading === doc.id ? "not-allowed" : "pointer",
                        color:          "var(--pf-text-2)",
                      }}
                    >
                      <i
                        className={`ti ${downloading === doc.id ? "ti-loader-2" : "ti-download"}`}
                        aria-hidden
                        style={{
                          fontSize:  14,
                          animation: downloading === doc.id ? "spin 1s linear infinite" : "none",
                        }}
                      />
                    </button>
                    {canManage && (
                      <button
                        type="button"
                        aria-label={`Delete ${doc.name}`}
                        onClick={() => setDeleteTarget(doc)}
                        style={{
                          width:          30,
                          height:         30,
                          borderRadius:   6,
                          border:         "1px solid var(--pf-line)",
                          background:     "#fff",
                          display:        "flex",
                          alignItems:     "center",
                          justifyContent: "center",
                          cursor:         "pointer",
                          color:          "#dc2626",
                        }}
                      >
                        <i className="ti ti-trash" aria-hidden style={{ fontSize: 14 }} />
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upload modal */}
      <UploadModal
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        orgId={orgId}
        clients={clients}
        projects={projects}
        defaultClientId={clientId}
        defaultProjectId={projectId}
        onSuccess={fetchDocs}
      />

      {/* Delete confirm */}
      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete document"
        description={`Delete "${deleteTarget?.name}"? This cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
