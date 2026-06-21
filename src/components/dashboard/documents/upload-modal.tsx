"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { FileUploader } from "@/components/shared/file-uploader";
import { createDocumentRecord } from "@/lib/supabase/document-actions";
import { inferFileType } from "@/lib/doc-config";
import { useToast } from "@/stores/ui.store";

interface Props {
  open: boolean;
  onClose: () => void;
  orgId: string;
  clients: { id: string; name: string }[];
  projects: { id: string; name: string }[];
  defaultClientId?: string;
  defaultProjectId?: string;
  onSuccess?: () => void;
}

export function UploadModal({
  open,
  onClose,
  orgId,
  clients,
  projects,
  defaultClientId = "",
  defaultProjectId = "",
  onSuccess,
}: Props) {
  const { success, error: toastError } = useToast();
  const [uploading, setUploading] = useState(false);
  const [clientId, setClientId]   = useState(defaultClientId);
  const [projectId, setProjectId] = useState(defaultProjectId);
  const [visible, setVisible]     = useState(false);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    setClientId(defaultClientId);
    setProjectId(defaultProjectId);
    setVisible(false);
  }, [defaultClientId, defaultProjectId, open]);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  async function handleUpload(files: File[]) {
    if (!files.length) return;
    setUploading(true);
    const supabase = createClient();

    const results = await Promise.allSettled(
      files.map(async (file) => {
        const docId   = crypto.randomUUID();
        const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
        const path     = `${orgId}/${docId}/${safeName}`;
        const fileType = inferFileType(file);

        // Upload to Supabase Storage
        const { error: storageErr } = await supabase.storage
          .from("documents")
          .upload(path, file, { upsert: false });

        if (storageErr) throw new Error(storageErr.message);

        // Insert DB record via server action
        const res = await createDocumentRecord({
          filePath:        path,
          fileName:        file.name,
          fileType,
          mimeType:        file.type || "application/octet-stream",
          sizeBytes:       file.size,
          clientId:        clientId  || undefined,
          projectId:       projectId || undefined,
          visibleToClient: visible,
        });

        if (res.error) throw new Error(res.error);
        return file.name;
      })
    );

    setUploading(false);

    const succeeded = results.filter((r) => r.status === "fulfilled").length;
    const failed    = results.filter((r) => r.status === "rejected");

    if (succeeded > 0) {
      success(
        succeeded === 1 ? "File uploaded" : `${succeeded} files uploaded`,
        "Documents are ready."
      );
      onSuccess?.();
      if (!failed.length) onClose();
    }

    failed.forEach((r) => {
      if (r.status === "rejected") {
        toastError("Upload failed", (r.reason as Error).message);
      }
    });
  }

  if (!open) return null;

  const inputStyle: React.CSSProperties = {
    width:         "100%",
    padding:       "9px 12px",
    borderRadius:  8,
    border:        "1px solid var(--pf-line)",
    fontSize:      13.5,
    color:         "var(--pf-text)",
    background:    "#fff",
    fontFamily:    "var(--font-inter)",
    outline:       "none",
    boxSizing:     "border-box",
    cursor:        "pointer",
  };
  const labelStyle: React.CSSProperties = {
    display:      "block",
    fontSize:     12.5,
    fontWeight:   500,
    color:        "var(--pf-text-2)",
    marginBottom: 6,
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset:    0,
          background: "rgba(0,0,0,.4)",
          zIndex:   100,
        }}
      />

      {/* Panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="upload-modal-title"
        style={{
          position:       "fixed",
          inset:          0,
          display:        "flex",
          alignItems:     "center",
          justifyContent: "center",
          zIndex:         101,
          padding:        16,
        }}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            background:  "#fff",
            borderRadius: 14,
            width:        "100%",
            maxWidth:     560,
            maxHeight:    "90vh",
            overflow:     "auto",
            boxShadow:    "0 20px 60px rgba(0,0,0,.18)",
          }}
        >
          {/* Header */}
          <div
            style={{
              display:         "flex",
              alignItems:      "center",
              justifyContent:  "space-between",
              padding:         "18px 22px 14px",
              borderBottom:    "1px solid var(--pf-line)",
            }}
          >
            <div>
              <h2
                id="upload-modal-title"
                style={{
                  fontFamily: "var(--font-inter-tight)",
                  fontSize:   17,
                  fontWeight: 700,
                  color:      "var(--pf-text)",
                  margin:     0,
                }}
              >
                Upload documents
              </h2>
              <p style={{ fontSize: 12.5, color: "var(--pf-text-3)", margin: "3px 0 0" }}>
                PDF, Word, Excel, images, ZIP · Max 25 MB each
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              style={{
                width:           30,
                height:          30,
                borderRadius:    7,
                border:          "1px solid var(--pf-line)",
                background:      "transparent",
                display:         "flex",
                alignItems:      "center",
                justifyContent:  "center",
                cursor:          "pointer",
                color:           "var(--pf-text-3)",
                flexShrink:      0,
              }}
            >
              <i className="ti ti-x" aria-hidden style={{ fontSize: 15 }} />
            </button>
          </div>

          {/* Body */}
          <div style={{ padding: "20px 22px", display: "flex", flexDirection: "column", gap: 16 }}>
            {/* File drop zone */}
            <FileUploader
              accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.gif,.webp,.zip"
              multiple
              onUpload={handleUpload}
              uploading={uploading}
              label="Drop files here or click to browse"
              description="PDF, Word, Excel, images, ZIP · Max 25 MB each"
            />

            {/* Client + Project */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div>
                <label htmlFor="upload-client" style={labelStyle}>
                  Client <span style={{ color: "var(--pf-text-3)", fontWeight: 400 }}>(optional)</span>
                </label>
                <select
                  id="upload-client"
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  style={inputStyle}
                >
                  <option value="">No client</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="upload-project" style={labelStyle}>
                  Project <span style={{ color: "var(--pf-text-3)", fontWeight: 400 }}>(optional)</span>
                </label>
                <select
                  id="upload-project"
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value)}
                  style={inputStyle}
                >
                  <option value="">No project</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Visible to client */}
            <label
              style={{
                display:     "flex",
                alignItems:  "center",
                gap:         8,
                cursor:      "pointer",
                userSelect:  "none",
              }}
            >
              <input
                type="checkbox"
                checked={visible}
                onChange={(e) => setVisible(e.target.checked)}
                style={{ width: 15, height: 15, accentColor: "#4f46e5", cursor: "pointer" }}
              />
              <span style={{ fontSize: 13.5, color: "var(--pf-text)" }}>
                Visible to client in portal
              </span>
            </label>
          </div>

          {/* Footer */}
          <div
            style={{
              display:         "flex",
              justifyContent:  "flex-end",
              gap:             10,
              padding:         "14px 22px",
              borderTop:       "1px solid var(--pf-line)",
            }}
          >
            <button
              type="button"
              onClick={onClose}
              style={{
                padding:     "8px 18px",
                borderRadius: 8,
                border:      "1px solid var(--pf-line)",
                background:  "#fff",
                fontSize:    13.5,
                color:       "var(--pf-text)",
                cursor:      "pointer",
                fontFamily:  "var(--font-inter)",
                fontWeight:  500,
              }}
            >
              Cancel
            </button>
            <p style={{ margin: 0, fontSize: 12, color: "var(--pf-text-3)", alignSelf: "center" }}>
              Use the drop zone above to upload files
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
