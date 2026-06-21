import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import type { Document, DocumentFileType } from "@/types/app.types";
import { FILE_TYPE_CONFIG } from "@/lib/doc-config";
import { formatFileSize } from "@/lib/format";

interface PageProps {
  params: Promise<{ id: string }>;
}

function fmtDate(s?: string) {
  if (!s) return "—";
  return new Date(s).toLocaleDateString("en-US", {
    month: "long",
    day:   "numeric",
    year:  "numeric",
  });
}

export default async function DocumentDetailPage({ params }: PageProps) {
  const { id }   = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("organization_id, role")
    .eq("id", user.id)
    .single();

  if (!profile?.organization_id) redirect("/dashboard");
  const orgId = profile.organization_id as string;

  const { data: row } = await supabase
    .from("documents")
    .select("*, clients(id, name), projects(id, name)")
    .eq("id", id)
    .eq("organization_id", orgId)
    .is("deleted_at", null)
    .single();

  if (!row) notFound();

  const doc: Document = {
    id:              row.id,
    organizationId:  row.organization_id,
    clientId:        row.client_id || undefined,
    projectId:       row.project_id || undefined,
    uploadedBy:      row.uploaded_by || undefined,
    name:            row.name,
    filePath:        row.file_path,
    fileType:        (row.file_type as DocumentFileType) || "other",
    mimeType:        row.mime_type || undefined,
    sizeBytes:       row.size_bytes ?? 0,
    version:         row.version ?? 1,
    status:          row.status ?? "ready",
    visibleToClient: row.visible_to_client ?? false,
    tags:            row.tags ?? [],
    createdAt:       row.created_at,
    updatedAt:       row.updated_at,
  };

  const client  = row.clients as { id: string; name: string } | null;
  const project = row.projects as { id: string; name: string } | null;
  const ftc     = FILE_TYPE_CONFIG[doc.fileType ?? "other"] ?? FILE_TYPE_CONFIG.other;

  const isImage = doc.fileType === "img";

  // Generate a short-lived preview URL for images
  let previewUrl: string | undefined;
  if (isImage) {
    const { data } = await supabase.storage
      .from("documents")
      .createSignedUrl(doc.filePath, 300);
    previewUrl = data?.signedUrl;
  }

  return (
    <div style={{ minHeight: "calc(100vh - 57px)", background: "var(--pf-surface)" }}>
      {/* Header */}
      <div
        style={{
          background:   "#fff",
          borderBottom: "1px solid var(--pf-line)",
          padding:      "20px 24px 16px",
        }}
      >
        {/* Breadcrumb */}
        <div
          style={{
            display:     "flex",
            alignItems:  "center",
            gap:         6,
            fontSize:    12.5,
            color:       "var(--pf-text-3)",
            marginBottom: 12,
          }}
        >
          <Link href="/dashboard/documents" style={{ color: "var(--pf-text-3)", textDecoration: "none" }}>
            Documents
          </Link>
          <i className="ti ti-chevron-right" aria-hidden style={{ fontSize: 11 }} />
          <span
            style={{ color: "var(--pf-text-2)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 240 }}
          >
            {doc.name}
          </span>
        </div>

        {/* Title row */}
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div
            style={{
              width:          48,
              height:         48,
              borderRadius:   12,
              background:     ftc.bg,
              display:        "flex",
              alignItems:     "center",
              justifyContent: "center",
              flexShrink:     0,
            }}
          >
            <i className={`ti ${ftc.icon}`} aria-hidden style={{ fontSize: 24, color: ftc.color }} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h1
              style={{
                fontFamily:    "var(--font-inter-tight)",
                fontSize:      18,
                fontWeight:    700,
                color:         "var(--pf-text)",
                margin:        0,
                overflow:      "hidden",
                textOverflow:  "ellipsis",
                whiteSpace:    "nowrap",
              }}
            >
              {doc.name}
            </h1>
            <p style={{ fontSize: 12.5, color: "var(--pf-text-3)", margin: "3px 0 0" }}>
              {ftc.label} · {formatFileSize(doc.sizeBytes)} · Uploaded {fmtDate(doc.createdAt)}
            </p>
          </div>

          {/* Download button (client action — handled via client component or form) */}
          <Link
            href={`/api/documents/${doc.id}/download`}
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
              textDecoration: "none",
            }}
          >
            <i className="ti ti-download" aria-hidden style={{ fontSize: 15 }} />
            Download
          </Link>
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: 24, display: "grid", gridTemplateColumns: "1fr 280px", gap: 20, alignItems: "start" }}>
        {/* Main: preview for images, placeholder for others */}
        <div
          style={{
            background:   "#fff",
            border:       "1px solid var(--pf-line)",
            borderRadius: 12,
            overflow:     "hidden",
            minHeight:    320,
            display:      "flex",
            alignItems:   "center",
            justifyContent: "center",
          }}
        >
          {isImage && previewUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={previewUrl}
              alt={doc.name}
              style={{ maxWidth: "100%", maxHeight: 480, objectFit: "contain", display: "block" }}
            />
          ) : (
            <div
              style={{
                display:       "flex",
                flexDirection: "column",
                alignItems:    "center",
                gap:           12,
                padding:       48,
                color:         "var(--pf-text-3)",
              }}
            >
              <div
                style={{
                  width:          72,
                  height:         72,
                  borderRadius:   18,
                  background:     ftc.bg,
                  display:        "flex",
                  alignItems:     "center",
                  justifyContent: "center",
                }}
              >
                <i className={`ti ${ftc.icon}`} aria-hidden style={{ fontSize: 36, color: ftc.color }} />
              </div>
              <p style={{ fontSize: 14, color: "var(--pf-text-2)", margin: 0, fontWeight: 500 }}>
                {doc.name}
              </p>
              <p style={{ fontSize: 12.5, margin: 0 }}>
                Preview not available. Download to view.
              </p>
            </div>
          )}
        </div>

        {/* Sidebar: metadata */}
        <div
          style={{
            background:    "#fff",
            border:        "1px solid var(--pf-line)",
            borderRadius:  12,
            padding:       "18px 20px",
            display:       "flex",
            flexDirection: "column",
            gap:           14,
          }}
        >
          <h2
            style={{
              fontFamily:    "var(--font-inter-tight)",
              fontSize:      14,
              fontWeight:    700,
              color:         "var(--pf-text)",
              margin:        "0 0 4px",
            }}
          >
            Details
          </h2>

          {[
            { label: "File type", value: ftc.label },
            { label: "Size",      value: formatFileSize(doc.sizeBytes) },
            { label: "Uploaded",  value: fmtDate(doc.createdAt) },
            { label: "MIME type", value: doc.mimeType ?? "—" },
            { label: "Version",   value: `v${doc.version ?? 1}` },
          ].map(({ label, value }) => (
            <div key={label}>
              <div
                style={{
                  fontSize:      11,
                  fontWeight:    600,
                  color:         "var(--pf-text-3)",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  marginBottom:  3,
                }}
              >
                {label}
              </div>
              <div style={{ fontSize: 13, color: "var(--pf-text)" }}>{value}</div>
            </div>
          ))}

          {/* Client */}
          {client && (
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, color: "var(--pf-text-3)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 3 }}>
                Client
              </div>
              <Link
                href={`/dashboard/clients/${client.id}`}
                style={{ fontSize: 13, color: "#4f46e5", textDecoration: "none", fontWeight: 500 }}
              >
                {client.name}
              </Link>
            </div>
          )}

          {/* Project */}
          {project && (
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, color: "var(--pf-text-3)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 3 }}>
                Project
              </div>
              <Link
                href={`/dashboard/projects/${project.id}`}
                style={{ fontSize: 13, color: "#4f46e5", textDecoration: "none", fontWeight: 500 }}
              >
                {project.name}
              </Link>
            </div>
          )}

          {/* Visibility */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: "var(--pf-text-3)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 3 }}>
              Client portal
            </div>
            <span
              style={{
                display:     "flex",
                alignItems:  "center",
                gap:         5,
                fontSize:    13,
                color:       doc.visibleToClient ? "#16a34a" : "var(--pf-text-3)",
                fontWeight:  500,
              }}
            >
              <i
                className={`ti ${doc.visibleToClient ? "ti-eye" : "ti-eye-off"}`}
                aria-hidden
                style={{ fontSize: 13 }}
              />
              {doc.visibleToClient ? "Visible" : "Hidden"}
            </span>
          </div>

          {/* Tags */}
          {doc.tags.length > 0 && (
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, color: "var(--pf-text-3)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>
                Tags
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                {doc.tags.map((t) => (
                  <span
                    key={t}
                    style={{ fontSize: 11, padding: "2px 8px", borderRadius: 99, background: "var(--pf-surface-2)", color: "var(--pf-text-2)", border: "1px solid var(--pf-line)" }}
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
