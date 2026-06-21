"use client";

import { useState, useTransition, useActionState } from "react";
import { generatePortalTokenAction, togglePortalEnabledAction } from "@/lib/supabase/portal-actions";
import { sendPortalInviteAction } from "@/lib/supabase/notification-actions";
import { useToast } from "@/stores/ui.store";
import type { EmailFallback } from "@/lib/email";

interface Props {
  clientId:      string;
  clientEmail?:  string;
  clientName:    string;
  portalToken?:  string;
  portalEnabled: boolean;
}

export function PortalCard({ clientId, clientEmail, clientName, portalToken: initialToken, portalEnabled: initialEnabled }: Props) {
  const { success, error: toastError } = useToast();
  const [enabled,       setEnabled]       = useState(initialEnabled);
  const [token,         setToken]         = useState(initialToken ?? "");
  const [copied,        setCopied]        = useState(false);
  const [toggling,      startToggle]      = useTransition();
  const [inviting,      startInvite]      = useTransition();
  const [fallback,      setFallback]      = useState<EmailFallback | null>(null);
  const [fallbackCopied, setFallbackCopied] = useState(false);

  const siteUrl   = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3001";
  const portalUrl = token ? `${siteUrl}/portal/${token}` : "";

  const [, generateAction] = useActionState(generatePortalTokenAction, null);

  async function handleRegenerate() {
    const fd = new FormData();
    fd.append("client_id", clientId);
    const result = await generatePortalTokenAction(null, fd);
    if (result?.error) {
      toastError("Failed to regenerate", result.error);
    } else if (result?.token) {
      setToken(result.token);
      success("Portal link regenerated", "Share the new link with your client.");
    }
  }

  function handleToggle() {
    const next = !enabled;
    startToggle(async () => {
      const fd = new FormData();
      fd.append("client_id", clientId);
      fd.append("enabled", String(next));
      const result = await togglePortalEnabledAction(null, fd);
      if (result?.error) {
        toastError("Update failed", result.error);
      } else {
        setEnabled(next);
        success(next ? "Portal enabled" : "Portal disabled");
      }
    });
  }

  async function handleCopy() {
    if (!portalUrl) return;
    await navigator.clipboard.writeText(portalUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleSendInvite() {
    if (!clientEmail) {
      toastError("No email address", "Add an email to this client first.");
      return;
    }
    if (!token) {
      toastError("No portal link", "Generate a portal link first.");
      return;
    }
    startInvite(async () => {
      const fd = new FormData();
      fd.append("client_id",    clientId);
      fd.append("client_email", clientEmail);
      fd.append("client_name",  clientName);
      fd.append("portal_token", token);
      const result = await sendPortalInviteAction(null, fd);
      if (result.error) {
        toastError("Invite failed", result.error);
      } else if (result.sent) {
        setFallback(null);
        success("Invite sent!", `Portal link emailed to ${clientEmail}`);
      } else if (result.fallback) {
        setFallback(result.fallback);
      }
    });
  }

  async function handleCopyFallback() {
    if (!fallback) return;
    await navigator.clipboard.writeText(`Subject: ${fallback.subject}\n\n${fallback.text}`);
    setFallbackCopied(true);
    setTimeout(() => setFallbackCopied(false), 2000);
  }

  return (
    <div style={{ padding: "4px 0 8px" }}>
      {/* Section header */}
      <div
        style={{
          fontSize:      11,
          fontWeight:    600,
          color:         "var(--pf-text-3)",
          letterSpacing: ".06em",
          textTransform: "uppercase",
          padding:       "4px 20px 10px",
        }}
      >
        Client Portal
      </div>

      {/* Enable toggle */}
      <div
        style={{
          display:        "flex",
          alignItems:     "center",
          justifyContent: "space-between",
          padding:        "0 20px 10px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <div
            style={{
              width:        8,
              height:       8,
              borderRadius: "50%",
              background:   enabled ? "#22c55e" : "var(--pf-text-3)",
              flexShrink:   0,
            }}
          />
          <span style={{ fontSize: 12.5, color: "var(--pf-text-2)", fontWeight: 500 }}>
            {enabled ? "Active" : "Disabled"}
          </span>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={enabled}
          aria-label={enabled ? "Disable client portal" : "Enable client portal"}
          onClick={handleToggle}
          disabled={toggling}
          style={{
            width:        36,
            height:       20,
            borderRadius: 10,
            background:   enabled ? "#4f46e5" : "var(--pf-line)",
            border:       "none",
            cursor:       toggling ? "not-allowed" : "pointer",
            position:     "relative",
            transition:   "background .15s",
            flexShrink:   0,
          }}
        >
          <span
            style={{
              position:   "absolute",
              top:        2,
              left:       enabled ? 18 : 2,
              width:      16,
              height:     16,
              borderRadius: "50%",
              background: "#fff",
              boxShadow:  "0 1px 3px rgba(0,0,0,.2)",
              transition: "left .15s",
              display:    "block",
            }}
          />
        </button>
      </div>

      {/* Portal link */}
      {token ? (
        <div style={{ padding: "0 20px 8px" }}>
          <div
            style={{
              background:   "var(--pf-surface)",
              border:       "1px solid var(--pf-line)",
              borderRadius: 7,
              padding:      "7px 10px",
              fontSize:     11.5,
              color:        "var(--pf-text-2)",
              overflow:     "hidden",
              textOverflow: "ellipsis",
              whiteSpace:   "nowrap",
              fontFamily:   "monospace",
              marginBottom: 8,
            }}
          >
            /portal/{token}
          </div>

          {/* Actions */}
          <div style={{ display: "flex", gap: 5 }}>
            <button
              type="button"
              onClick={handleCopy}
              disabled={!enabled}
              style={{
                flex:         1,
                display:      "flex",
                alignItems:   "center",
                justifyContent: "center",
                gap:          5,
                padding:      "6px 0",
                borderRadius: 7,
                border:       "1px solid var(--pf-line)",
                background:   copied ? "#f0fdf4" : "#fff",
                fontSize:     12.5,
                color:        copied ? "#16a34a" : "var(--pf-text-2)",
                cursor:       enabled ? "pointer" : "not-allowed",
                opacity:      enabled ? 1 : 0.5,
                fontFamily:   "var(--font-inter)",
                transition:   "all .15s",
              }}
            >
              <i
                className={`ti ${copied ? "ti-check" : "ti-copy"}`}
                aria-hidden
                style={{ fontSize: 13 }}
              />
              {copied ? "Copied!" : "Copy"}
            </button>

            <a
              href={enabled ? portalUrl : undefined}
              target="_blank"
              rel="noopener noreferrer"
              aria-disabled={!enabled}
              style={{
                flex:         1,
                display:      "flex",
                alignItems:   "center",
                justifyContent: "center",
                gap:          5,
                padding:      "6px 0",
                borderRadius: 7,
                border:       "1px solid var(--pf-line)",
                background:   "#fff",
                fontSize:     12.5,
                color:        "var(--pf-text-2)",
                textDecoration: "none",
                opacity:      enabled ? 1 : 0.5,
                pointerEvents: enabled ? "auto" : "none",
                fontFamily:   "var(--font-inter)",
              }}
            >
              <i className="ti ti-external-link" aria-hidden style={{ fontSize: 13 }} />
              Preview
            </a>
          </div>
        </div>
      ) : null}

      {/* Send portal invite */}
      {token && (
        <div style={{ padding: "4px 20px 8px" }}>
          <button
            type="button"
            onClick={handleSendInvite}
            disabled={inviting || !enabled}
            style={{
              width:          "100%",
              display:        "flex",
              alignItems:     "center",
              justifyContent: "center",
              gap:            6,
              padding:        "8px 0",
              borderRadius:   8,
              border:         "none",
              background:     enabled ? "#4f46e5" : "var(--pf-line)",
              color:          enabled ? "#fff" : "var(--pf-text-3)",
              fontSize:       13,
              fontWeight:     600,
              cursor:         (inviting || !enabled) ? "not-allowed" : "pointer",
              opacity:        inviting ? 0.7 : 1,
              fontFamily:     "var(--font-inter)",
              transition:     "opacity .15s",
            }}
          >
            <i
              className={`ti ${inviting ? "ti-loader" : "ti-mail"}`}
              aria-hidden
              style={{ fontSize: 14 }}
            />
            {inviting ? "Sending…" : "Send portal invite"}
          </button>

          {/* Fallback panel — shown when Resend is not configured */}
          {fallback && (
            <div
              style={{
                marginTop:    10,
                background:   "#fffbeb",
                border:       "1px solid #fde68a",
                borderRadius: 8,
                padding:      "12px 14px",
              }}
            >
              <div
                style={{
                  display:        "flex",
                  alignItems:     "center",
                  justifyContent: "space-between",
                  marginBottom:   8,
                }}
              >
                <span
                  style={{
                    fontSize:   11.5,
                    fontWeight: 600,
                    color:      "#92400e",
                    display:    "flex",
                    alignItems: "center",
                    gap:        5,
                  }}
                >
                  <i className="ti ti-info-circle" aria-hidden style={{ fontSize: 13 }} />
                  Email provider not configured
                </span>
                <button
                  type="button"
                  onClick={() => setFallback(null)}
                  style={{
                    background: "none",
                    border:     "none",
                    cursor:     "pointer",
                    color:      "#92400e",
                    fontSize:   14,
                    lineHeight: 1,
                    padding:    0,
                  }}
                  aria-label="Close"
                >
                  ×
                </button>
              </div>

              <p
                style={{
                  margin:     "0 0 8px",
                  fontSize:   11.5,
                  color:      "#78350f",
                  lineHeight: 1.45,
                }}
              >
                Add <code style={{ background: "#fef3c7", padding: "1px 4px", borderRadius: 3 }}>RESEND_API_KEY</code> to
                &nbsp;.env.local to send automatically. For now, copy the email below:
              </p>

              <div
                style={{
                  background:   "#fff",
                  border:       "1px solid #fde68a",
                  borderRadius: 6,
                  padding:      "8px 10px",
                  fontSize:     11.5,
                  color:        "#78350f",
                  maxHeight:    80,
                  overflowY:    "auto",
                  whiteSpace:   "pre-wrap",
                  wordBreak:    "break-all",
                  marginBottom: 8,
                  lineHeight:   1.5,
                  fontFamily:   "monospace",
                }}
              >
                {fallback.text}
              </div>

              <div style={{ display: "flex", gap: 6 }}>
                <button
                  type="button"
                  onClick={handleCopyFallback}
                  style={{
                    flex:         1,
                    display:      "flex",
                    alignItems:   "center",
                    justifyContent: "center",
                    gap:          5,
                    padding:      "6px 0",
                    borderRadius: 6,
                    border:       "1px solid #fde68a",
                    background:   fallbackCopied ? "#f0fdf4" : "#fff",
                    fontSize:     12,
                    fontWeight:   500,
                    color:        fallbackCopied ? "#16a34a" : "#92400e",
                    cursor:       "pointer",
                    fontFamily:   "var(--font-inter)",
                  }}
                >
                  <i
                    className={`ti ${fallbackCopied ? "ti-check" : "ti-copy"}`}
                    aria-hidden
                    style={{ fontSize: 12 }}
                  />
                  {fallbackCopied ? "Copied!" : "Copy text"}
                </button>

                <a
                  href={fallback.mailto}
                  style={{
                    flex:           1,
                    display:        "flex",
                    alignItems:     "center",
                    justifyContent: "center",
                    gap:            5,
                    padding:        "6px 0",
                    borderRadius:   6,
                    border:         "1px solid #fde68a",
                    background:     "#fff",
                    fontSize:       12,
                    fontWeight:     500,
                    color:          "#92400e",
                    textDecoration: "none",
                    fontFamily:     "var(--font-inter)",
                  }}
                >
                  <i className="ti ti-external-link" aria-hidden style={{ fontSize: 12 }} />
                  Open in mail
                </a>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Regenerate link */}
      <div style={{ padding: "2px 20px 4px" }}>
        <button
          type="button"
          onClick={handleRegenerate}
          style={{
            width:        "100%",
            display:      "flex",
            alignItems:   "center",
            gap:          7,
            padding:      "6px 0",
            background:   "none",
            border:       "none",
            fontSize:     12.5,
            color:        token ? "#dc2626" : "#4f46e5",
            cursor:       "pointer",
            fontFamily:   "var(--font-inter)",
          }}
        >
          <i
            className={`ti ${token ? "ti-refresh" : "ti-link"}`}
            aria-hidden
            style={{ fontSize: 13 }}
          />
          {token ? "Regenerate link…" : "Generate portal link"}
        </button>
        {token && (
          <p style={{ margin: 0, fontSize: 11, color: "var(--pf-text-3)", lineHeight: 1.4 }}>
            Regenerating revokes the old link immediately.
          </p>
        )}
      </div>

      {/* Suppress unused lint warning */}
      <form style={{ display: "none" }} action={generateAction} />
    </div>
  );
}
