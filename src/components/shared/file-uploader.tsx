"use client";

import { useRef, useState } from "react";
import { Spinner } from "@/components/ui/spinner";
import { formatFileSize } from "@/lib/format";

interface FileUploaderProps {
  accept?: string;
  maxSizeMb?: number;
  multiple?: boolean;
  onUpload: (files: File[]) => void | Promise<void>;
  uploading?: boolean;
  label?: string;
  description?: string;
}

export function FileUploader({
  accept,
  maxSizeMb = 25,
  multiple,
  onUpload,
  uploading,
  label = "Upload files",
  description,
}: FileUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function validate(files: File[]): File[] | null {
    const maxBytes = maxSizeMb * 1024 * 1024;
    const oversized = files.filter(f => f.size > maxBytes);
    if (oversized.length) {
      setError(`${oversized[0].name} exceeds the ${maxSizeMb} MB limit.`);
      return null;
    }
    setError(null);
    return files;
  }

  async function handle(files: FileList | null) {
    if (!files || files.length === 0) return;
    const arr = Array.from(files);
    const valid = validate(arr);
    if (valid) await onUpload(valid);
  }

  return (
    <div>
      <div
        role="button"
        tabIndex={0}
        aria-label={label}
        onClick={() => inputRef.current?.click()}
        onKeyDown={e => (e.key === "Enter" || e.key === " ") && inputRef.current?.click()}
        onDragEnter={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={e => { e.preventDefault(); setDragging(false); }}
        onDragOver={e => e.preventDefault()}
        onDrop={e => {
          e.preventDefault();
          setDragging(false);
          handle(e.dataTransfer.files);
        }}
        style={{
          border: `2px dashed ${dragging ? "#4f46e5" : "var(--pf-line)"}`,
          borderRadius: 10,
          padding: "32px 20px",
          textAlign: "center",
          cursor: uploading ? "wait" : "pointer",
          background: dragging ? "#eef2ff" : "var(--pf-surface)",
          transition: "all .15s",
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={e => handle(e.target.files)}
          style={{ display: "none" }}
          disabled={uploading}
        />

        {uploading ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
            <Spinner size={28} />
            <p style={{ fontSize: 13, color: "var(--pf-text-2)", margin: 0 }}>Uploading…</p>
          </div>
        ) : (
          <>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 10,
                background: dragging ? "#c7d2fe" : "var(--pf-surface-2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 10px",
              }}
            >
              <i className="ti ti-cloud-upload" aria-hidden style={{ fontSize: 22, color: dragging ? "#4f46e5" : "var(--pf-text-3)" }} />
            </div>
            <p style={{ fontSize: 13, fontWeight: 500, color: "var(--pf-text)", margin: "0 0 3px" }}>
              {label}
            </p>
            <p style={{ fontSize: 12, color: "var(--pf-text-3)", margin: 0 }}>
              {description ?? `Drag & drop or click · Max ${formatFileSize(maxSizeMb * 1024 * 1024)}`}
            </p>
          </>
        )}
      </div>

      {error && (
        <p style={{ marginTop: 6, fontSize: 12, color: "#dc2626" }} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
