"use client";

import { useActionState, useState, useEffect } from "react";
import { updateOrganization } from "@/lib/supabase/org-actions";

const TIMEZONES = [
  "UTC",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "America/Sao_Paulo",
  "Europe/London",
  "Europe/Paris",
  "Europe/Berlin",
  "Europe/Madrid",
  "Asia/Dubai",
  "Asia/Kolkata",
  "Asia/Tokyo",
  "Asia/Shanghai",
  "Asia/Singapore",
  "Australia/Sydney",
];

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "8px 12px",
  borderRadius: 8,
  border: "1px solid var(--pf-line-strong)",
  fontSize: 13.5,
  color: "var(--pf-text)",
  background: "#fff",
  outline: "none",
  fontFamily: "var(--font-inter)",
  boxSizing: "border-box",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 12.5,
  fontWeight: 500,
  color: "var(--pf-text-2)",
  marginBottom: 5,
};

interface Org {
  name: string;
  slug: string;
  website: string | null;
  timezone: string;
  plan: string;
}

export function OrgSettingsForm({ org, isOwner }: { org: Org; isOwner: boolean }) {
  const [state, action, pending] = useActionState(updateOrganization, null);
  const [saved, setSaved] = useState(false);
  const [callCount, setCallCount] = useState(0);

  useEffect(() => {
    if (callCount > 0 && state === null && !pending) {
      const id = setTimeout(() => setSaved(true), 0);
      return () => clearTimeout(id);
    }
  }, [state, pending, callCount]);

  const handleSubmit = (formData: FormData) => {
    setSaved(false);
    setCallCount((c) => c + 1);
    action(formData);
  };

  return (
    <div style={{ padding: "24px" }}>
      {saved && !state?.error && (
        <div style={{
          padding: "10px 14px",
          borderRadius: 8,
          background: "#f0fdf4",
          border: "1px solid #bbf7d0",
          marginBottom: 20,
          fontSize: 13,
          color: "#15803d",
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}>
          <i className="ti ti-circle-check" style={{ fontSize: 15 }} />
          Organization settings saved.
        </div>
      )}

      {state?.error && (
        <div style={{
          padding: "10px 14px",
          borderRadius: 8,
          background: "#fef2f2",
          border: "1px solid #fecaca",
          marginBottom: 20,
          fontSize: 13,
          color: "#dc2626",
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}>
          <i className="ti ti-alert-circle" style={{ fontSize: 15 }} />
          {state.error}
        </div>
      )}

      <form action={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 480 }}>
        <div>
          <label htmlFor="name" style={labelStyle}>Organization name</label>
          <input
            id="name"
            name="name"
            type="text"
            required
            defaultValue={org.name}
            disabled={!isOwner}
            style={isOwner ? inputStyle : { ...inputStyle, background: "var(--pf-surface)", color: "var(--pf-text-3)" }}
          />
        </div>

        <div>
          <label htmlFor="slug" style={labelStyle}>Slug</label>
          <input
            id="slug"
            name="slug"
            type="text"
            required
            defaultValue={org.slug}
            disabled={!isOwner}
            pattern="[a-z0-9-]+"
            style={isOwner ? inputStyle : { ...inputStyle, background: "var(--pf-surface)", color: "var(--pf-text-3)" }}
          />
          <p style={{ margin: "4px 0 0", fontSize: 12, color: "var(--pf-text-3)" }}>
            Portal URLs: <code style={{ fontSize: 11.5, background: "var(--pf-surface-2)", padding: "1px 5px", borderRadius: 4 }}>portalflow.io/p/{org.slug}</code>
          </p>
        </div>

        <div>
          <label htmlFor="website" style={labelStyle}>Website</label>
          <input
            id="website"
            name="website"
            type="url"
            defaultValue={org.website ?? ""}
            placeholder="https://youragency.com"
            disabled={!isOwner}
            style={isOwner ? inputStyle : { ...inputStyle, background: "var(--pf-surface)", color: "var(--pf-text-3)" }}
          />
        </div>

        <div>
          <label htmlFor="timezone" style={labelStyle}>Timezone</label>
          <select
            id="timezone"
            name="timezone"
            defaultValue={org.timezone ?? "UTC"}
            disabled={!isOwner}
            style={{ ...inputStyle, cursor: isOwner ? "pointer" : "not-allowed", background: isOwner ? "#fff" : "var(--pf-surface)" }}
          >
            {TIMEZONES.map((tz) => (
              <option key={tz} value={tz}>{tz}</option>
            ))}
          </select>
        </div>

        {/* Plan (read-only) */}
        <div>
          <label style={labelStyle}>Plan</label>
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "10px 14px",
            borderRadius: 8,
            border: "1px solid var(--pf-line)",
            background: "var(--pf-surface)",
          }}>
            <span style={{ fontSize: 13.5, color: "var(--pf-text)", fontWeight: 500, textTransform: "capitalize" }}>
              {org.plan}
            </span>
            <a
              href="/dashboard/settings/billing"
              style={{ fontSize: 12.5, color: "#4f46e5", textDecoration: "none", fontWeight: 500 }}
            >
              Manage plan →
            </a>
          </div>
        </div>

        {isOwner && (
          <div style={{ paddingTop: 4, borderTop: "1px solid var(--pf-line)", display: "flex", justifyContent: "flex-end" }}>
            <button
              type="submit"
              disabled={pending}
              style={{
                padding: "8px 20px",
                borderRadius: 8,
                border: "none",
                background: pending ? "#818cf8" : "#4f46e5",
                color: "#fff",
                fontSize: 13,
                fontWeight: 500,
                cursor: pending ? "not-allowed" : "pointer",
                fontFamily: "var(--font-inter)",
                display: "flex",
                alignItems: "center",
                gap: 7,
              }}
            >
              {pending && (
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden style={{ animation: "pf-spin .7s linear infinite" }}>
                  <circle cx="8" cy="8" r="6" stroke="rgba(255,255,255,.35)" strokeWidth="2" />
                  <path d="M14 8a6 6 0 0 0-6-6" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
                </svg>
              )}
              {pending ? "Saving…" : "Save changes"}
            </button>
          </div>
        )}

        {!isOwner && (
          <p style={{ fontSize: 12.5, color: "var(--pf-text-3)", fontStyle: "italic" }}>
            Only the organization owner can edit these settings.
          </p>
        )}
      </form>
    </div>
  );
}
