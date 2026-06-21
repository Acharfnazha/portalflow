"use client";

import { useState, useTransition } from "react";
import type { Document } from "@/types/app.types";
import { FILE_TYPE_CONFIG } from "@/lib/doc-config";
import { formatFileSize } from "@/lib/format";
import { getSignedUrlAction, deleteDocumentAction } from "@/lib/supabase/document-actions";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { useToast } from "@/stores/ui.store";

interface Props {
  doc: Document;
  clientName?: string;
  projectName?: string;
  isLast: boolean;
}

export function DocumentRow({ doc, clientName, projectName, isLast }: Props) {
  const { success, error: toastError } = useToast();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [, startDelete] = useTransition();

  const ftc = FILE_TYPE_CONFIG[doc.fileType ?? "other"] ?? FILE_TYPE_CONFIG.other;
  const dateStr = doc.createdAt
    ? new Date(doc.createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "—";

  async function handleDownload() {
    setDownloading(true);
    const res = await getSignedUrlAction(doc.id);
    setDownloading(false);
    if (res.error) {
      toastError("Download failed", res.error);
    } else if (res.url) {
      window.open(res.url, "_blank", "noopener");
      success("Download started");
    }
  }

  async function handleDelete() {
    const fd = new FormData();
    fd.append("id", doc.id);
    startDelete(async () => {
      const result = await deleteDocumentAction(null, fd);
      if (result?.error) {
        toastError("Delete failed", result.error);
      } else {
        success("Document deleted");
      }
      setDeleteOpen(false);
    });
  }

  return (
    <>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 14,
          padding: "13px 16px",
          borderBottom: isLast ? "none" : "1px solid var(--pf-line)",
          transition: "background .1s",
        }}
        onMouseEnter={(e) =>
          ((e.currentTarget as HTMLDivElement).style.background = "var(--pf-surface)")
        }
        onMouseLeave={(e) =>
          ((e.currentTarget as HTMLDivElement).style.background = "transparent")
        }
      >
        {/* File type icon */}
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 10,
            background: ftc.bg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <i
            className={`ti ${ftc.icon}`}
            aria-hidden
            style={{ fontSize: 20, color: ftc.color }}
          />
        </div>

        {/* Name + meta */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p
            style={{
              margin: 0,
              fontSize: 13.5,
              fontWeight: 500,
              color: "var(--pf-text)",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {doc.name}
          </p>
          <p
            style={{
              margin: "2px 0 0",
              fontSize: 11.5,
              color: "var(--pf-text-3)",
              display: "flex",
              gap: 4,
              flexWrap: "wrap",
            }}
          >
            {clientName && <span>{clientName}</span>}
            {clientName && projectName && <span>·</span>}
            {projectName && <span>{projectName}</span>}
            {(clientName || projectName) && <span>·</span>}
            <span>{formatFileSize(doc.sizeBytes)}</span>
            <span>·</span>
            <span>{dateStr}</span>
          </p>
        </div>

        {/* File type badge */}
        <span
          style={{
            fontSize: 11,
            fontWeight: 600,
            padding: "2px 8px",
            borderRadius: 99,
            background: ftc.bg,
            color: ftc.color,
            flexShrink: 0,
            display: "none", // shown on wider screens via parent
          }}
          className="doc-type-badge"
        >
          {ftc.label}
        </span>

        {/* Actions */}
        <div style={{ display: "flex", gap: 5, flexShrink: 0 }}>
          <button
            type="button"
            aria-label={`Download ${doc.name}`}
            onClick={handleDownload}
            disabled={downloading}
            style={{
              width: 32,
              height: 32,
              borderRadius: 7,
              border: "1px solid var(--pf-line)",
              background: downloading ? "var(--pf-surface)" : "#fff",
              cursor: downloading ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--pf-text-2)",
            }}
          >
            <i
              className={`ti ${downloading ? "ti-loader-2" : "ti-download"}`}
              aria-hidden
              style={{
                fontSize: 14,
                animation: downloading ? "spin 1s linear infinite" : "none",
              }}
            />
          </button>
          <button
            type="button"
            aria-label={`Delete ${doc.name}`}
            onClick={() => setDeleteOpen(true)}
            style={{
              width: 32,
              height: 32,
              borderRadius: 7,
              border: "1px solid var(--pf-line)",
              background: "#fff",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#dc2626",
            }}
          >
            <i className="ti ti-trash" aria-hidden style={{ fontSize: 14 }} />
          </button>
        </div>
      </div>

      <ConfirmDialog
        open={deleteOpen}
        title="Delete document"
        description={`Delete "${doc.name}"? This cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteOpen(false)}
      />

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </>
  );
}
