import { notFound } from "next/navigation";
import { getPortalContext, getPortalDocuments } from "@/lib/supabase/portal-actions";
import { FILE_TYPE_CONFIG } from "@/lib/doc-config";
import { formatFileSize } from "@/lib/format";
import type { DocumentFileType } from "@/types/app.types";

interface PageProps {
  params: Promise<{ token: string }>;
}

function fmtDate(s: string) {
  return new Date(s).toLocaleDateString("en-US", {
    month: "short",
    day:   "numeric",
    year:  "numeric",
  });
}

export default async function PortalDocumentsPage({ params }: PageProps) {
  const { token } = await params;
  const ctx = await getPortalContext(token);
  if (!ctx) notFound();

  const documents = await getPortalDocuments(ctx.client.id);

  return (
    <div style={{ padding: "28px 28px 40px", maxWidth: 900, margin: "0 auto" }}>
      <div style={{ marginBottom: 24 }}>
        <h1
          style={{
            fontSize:      20,
            fontWeight:    700,
            color:         "var(--pf-text)",
            margin:        "0 0 4px",
            letterSpacing: "-.3px",
            fontFamily:    "var(--font-inter-tight)",
          }}
        >
          Documents
        </h1>
        <p style={{ margin: 0, fontSize: 13, color: "var(--pf-text-2)" }}>
          {documents.length} {documents.length === 1 ? "file" : "files"} shared with you
        </p>
      </div>

      {documents.length === 0 ? (
        <div
          style={{
            background:    "#fff",
            border:        "1px solid var(--pf-line)",
            borderRadius:  12,
            display:       "flex",
            flexDirection: "column",
            alignItems:    "center",
            padding:       "72px 20px",
            color:         "var(--pf-text-3)",
          }}
        >
          <i className="ti ti-folder-off" aria-hidden style={{ fontSize: 44, opacity: 0.3 }} />
          <p style={{ fontSize: 15, fontWeight: 600, color: "var(--pf-text-2)", margin: "12px 0 4px" }}>
            No documents yet
          </p>
          <p style={{ fontSize: 13, margin: 0 }}>
            Documents shared with you will appear here.
          </p>
        </div>
      ) : (
        <div
          style={{
            background:   "#fff",
            border:       "1px solid var(--pf-line)",
            borderRadius: 12,
            overflow:     "hidden",
          }}
        >
          {documents.map((doc, i) => {
            const ftc = FILE_TYPE_CONFIG[doc.fileType as DocumentFileType] ?? FILE_TYPE_CONFIG.other;
            return (
              <div
                key={doc.id}
                style={{
                  display:      "flex",
                  alignItems:   "center",
                  gap:          14,
                  padding:      "14px 18px",
                  borderBottom: i < documents.length - 1 ? "1px solid var(--pf-line)" : "none",
                }}
              >
                {/* File icon */}
                <div
                  style={{
                    width:          44,
                    height:         44,
                    borderRadius:   11,
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
                    style={{ fontSize: 22, color: ftc.color }}
                  />
                </div>

                {/* Name + meta */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p
                    style={{
                      margin:       0,
                      fontSize:     14,
                      fontWeight:   500,
                      color:        "var(--pf-text)",
                      overflow:     "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace:   "nowrap",
                    }}
                  >
                    {doc.name}
                  </p>
                  <p style={{ margin: "3px 0 0", fontSize: 12, color: "var(--pf-text-3)" }}>
                    {ftc.label} · {formatFileSize(doc.sizeBytes)} · {fmtDate(doc.createdAt)}
                  </p>
                </div>

                {/* Type badge */}
                <span
                  style={{
                    fontSize:     11.5,
                    fontWeight:   600,
                    padding:      "3px 9px",
                    borderRadius: 99,
                    background:   ftc.bg,
                    color:        ftc.color,
                    flexShrink:   0,
                  }}
                >
                  {ftc.label}
                </span>

                {/* Download */}
                {doc.signedUrl ? (
                  <a
                    href={doc.signedUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    download={doc.name}
                    style={{
                      display:      "flex",
                      alignItems:   "center",
                      gap:          5,
                      padding:      "7px 14px",
                      borderRadius: 8,
                      border:       "1px solid var(--pf-line)",
                      background:   "#fff",
                      fontSize:     13,
                      color:        "var(--pf-text-2)",
                      textDecoration: "none",
                      flexShrink:   0,
                      fontFamily:   "var(--font-inter)",
                      fontWeight:   500,
                    }}
                  >
                    <i className="ti ti-download" aria-hidden style={{ fontSize: 14 }} />
                    Download
                  </a>
                ) : (
                  <div
                    style={{
                      padding:      "7px 14px",
                      borderRadius: 8,
                      border:       "1px solid var(--pf-line)",
                      fontSize:     13,
                      color:        "var(--pf-text-3)",
                      flexShrink:   0,
                    }}
                  >
                    Processing…
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
