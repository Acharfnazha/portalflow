"use client";

import { useActionState, useState, useEffect } from "react";
import type { User } from "@supabase/supabase-js";
import { updateProfile, changePassword } from "@/lib/supabase/actions";
import type { AuthProfile } from "@/hooks/use-auth";

const TIMEZONES = [
  "UTC", "America/New_York", "America/Chicago", "America/Denver",
  "America/Los_Angeles", "Europe/London", "Europe/Paris", "Europe/Berlin",
  "Asia/Tokyo", "Asia/Shanghai", "Asia/Kolkata", "Australia/Sydney",
];

const sectionStyle: React.CSSProperties = {
  background: "#fff",
  border: "1px solid var(--pf-line)",
  borderRadius: 12,
  padding: "24px",
  marginBottom: 20,
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 12.5,
  fontWeight: 500,
  color: "var(--pf-text-2)",
  marginBottom: 5,
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "9px 12px",
  borderRadius: 8,
  border: "1px solid var(--pf-line-strong)",
  fontSize: 13.5,
  color: "var(--pf-text)",
  background: "#fff",
  outline: "none",
  fontFamily: "var(--font-inter)",
  boxSizing: "border-box",
};

const disabledInputStyle: React.CSSProperties = {
  ...inputStyle,
  background: "var(--pf-surface)",
  color: "var(--pf-text-3)",
  cursor: "not-allowed",
};

export function ProfileForm({
  user,
  profile,
}: {
  user: User;
  profile: AuthProfile | null;
}) {
  const [profileState, profileAction, profilePending] = useActionState(updateProfile, null);
  const [passwordState, passwordAction, passwordPending] = useActionState(changePassword, null);
  const [profileSaved, setProfileSaved] = useState(false);
  const [passwordSaved, setPasswordSaved] = useState(false);

  // Show success banner when state clears to null after a save
  const [profileCallCount, setProfileCallCount] = useState(0);
  const [passwordCallCount, setPasswordCallCount] = useState(0);

  useEffect(() => {
    if (profileCallCount > 0 && profileState === null && !profilePending) {
      const id = setTimeout(() => setProfileSaved(true), 0);
      return () => clearTimeout(id);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profileState, profilePending]);

  useEffect(() => {
    if (passwordCallCount > 0 && passwordState === null && !passwordPending) {
      const id = setTimeout(() => setPasswordSaved(true), 0);
      return () => clearTimeout(id);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [passwordState, passwordPending]);

  const fullName = profile?.full_name ?? "";
  const initials = fullName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || user.email?.[0].toUpperCase() || "?";

  const handleProfileSubmit = (formData: FormData) => {
    setProfileSaved(false);
    setProfileCallCount((c) => c + 1);
    profileAction(formData);
  };

  const handlePasswordSubmit = (formData: FormData) => {
    setPasswordSaved(false);
    setPasswordCallCount((c) => c + 1);
    passwordAction(formData);
  };

  return (
    <div>
      {/* Avatar */}
      <div style={sectionStyle}>
        <h2 style={{ fontSize: 14, fontWeight: 600, color: "var(--pf-text)", margin: "0 0 18px" }}>
          Avatar
        </h2>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 16,
              background: "#eef2ff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 22,
              fontWeight: 700,
              color: "#4f46e5",
              fontFamily: "var(--font-inter-tight)",
              flexShrink: 0,
            }}
          >
            {profile?.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profile.avatar_url}
                alt={fullName}
                style={{ width: "100%", height: "100%", borderRadius: 16, objectFit: "cover" }}
              />
            ) : (
              initials
            )}
          </div>
          <div>
            <p style={{ margin: "0 0 6px", fontSize: 13, fontWeight: 500, color: "var(--pf-text)" }}>
              {fullName || user.email}
            </p>
            <p style={{ margin: 0, fontSize: 12, color: "var(--pf-text-3)" }}>
              Avatar upload coming in Sprint 2
            </p>
          </div>
        </div>
      </div>

      {/* Personal info */}
      <div style={sectionStyle}>
        <h2 style={{ fontSize: 14, fontWeight: 600, color: "var(--pf-text)", margin: "0 0 18px" }}>
          Personal information
        </h2>

        {profileSaved && !profileState?.error && (
          <div style={{
            padding: "10px 14px",
            borderRadius: 8,
            background: "#f0fdf4",
            border: "1px solid #bbf7d0",
            marginBottom: 16,
            fontSize: 13,
            color: "#15803d",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}>
            <i className="ti ti-circle-check" style={{ fontSize: 15 }} />
            Profile updated successfully.
          </div>
        )}

        {profileState?.error && (
          <div style={{
            padding: "10px 14px",
            borderRadius: 8,
            background: "#fef2f2",
            border: "1px solid #fecaca",
            marginBottom: 16,
            fontSize: 13,
            color: "#dc2626",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}>
            <i className="ti ti-alert-circle" style={{ fontSize: 15 }} />
            {profileState.error}
          </div>
        )}

        <form action={handleProfileSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label htmlFor="fullName" style={labelStyle}>Full name</label>
            <input
              id="fullName"
              name="fullName"
              type="text"
              defaultValue={fullName}
              required
              style={inputStyle}
            />
          </div>

          <div>
            <label htmlFor="email-display" style={labelStyle}>Email</label>
            <input
              id="email-display"
              type="email"
              value={user.email ?? ""}
              disabled
              readOnly
              style={disabledInputStyle}
            />
            <p style={{ margin: "4px 0 0", fontSize: 11.5, color: "var(--pf-text-3)" }}>
              Email changes require re-verification.
            </p>
          </div>

          <div>
            <label htmlFor="jobTitle" style={labelStyle}>Job title</label>
            <input
              id="jobTitle"
              name="jobTitle"
              type="text"
              defaultValue={profile?.job_title ?? ""}
              placeholder="e.g. Creative Director"
              style={inputStyle}
            />
          </div>

          <div>
            <label htmlFor="timezone" style={labelStyle}>Timezone</label>
            <select
              id="timezone"
              name="timezone"
              defaultValue={profile?.timezone ?? "UTC"}
              style={{ ...inputStyle, cursor: "pointer" }}
            >
              {TIMEZONES.map((tz) => (
                <option key={tz} value={tz}>{tz}</option>
              ))}
            </select>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button
              type="submit"
              disabled={profilePending}
              style={{
                padding: "9px 20px",
                borderRadius: 8,
                border: "none",
                background: profilePending ? "#818cf8" : "#4f46e5",
                color: "#fff",
                fontSize: 13.5,
                fontWeight: 500,
                cursor: profilePending ? "not-allowed" : "pointer",
                fontFamily: "var(--font-inter)",
                display: "flex",
                alignItems: "center",
                gap: 7,
              }}
            >
              {profilePending && (
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden style={{ animation: "pf-spin .7s linear infinite" }}>
                  <circle cx="8" cy="8" r="6" stroke="rgba(255,255,255,.35)" strokeWidth="2" />
                  <path d="M14 8a6 6 0 0 0-6-6" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
                </svg>
              )}
              {profilePending ? "Saving…" : "Save changes"}
            </button>
          </div>
        </form>
      </div>

      {/* Change password */}
      <div style={sectionStyle}>
        <h2 style={{ fontSize: 14, fontWeight: 600, color: "var(--pf-text)", margin: "0 0 18px" }}>
          Change password
        </h2>

        {passwordSaved && !passwordState?.error && (
          <div style={{
            padding: "10px 14px",
            borderRadius: 8,
            background: "#f0fdf4",
            border: "1px solid #bbf7d0",
            marginBottom: 16,
            fontSize: 13,
            color: "#15803d",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}>
            <i className="ti ti-circle-check" style={{ fontSize: 15 }} />
            Password changed successfully.
          </div>
        )}

        {passwordState?.error && (
          <div style={{
            padding: "10px 14px",
            borderRadius: 8,
            background: "#fef2f2",
            border: "1px solid #fecaca",
            marginBottom: 16,
            fontSize: 13,
            color: "#dc2626",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}>
            <i className="ti ti-alert-circle" style={{ fontSize: 15 }} />
            {passwordState.error}
          </div>
        )}

        <form action={handlePasswordSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label htmlFor="currentPassword" style={labelStyle}>Current password</label>
            <input id="currentPassword" name="currentPassword" type="password" autoComplete="current-password" required style={inputStyle} />
          </div>
          <div>
            <label htmlFor="newPassword" style={labelStyle}>New password</label>
            <input id="newPassword" name="newPassword" type="password" autoComplete="new-password" required placeholder="Min. 8 characters" style={inputStyle} />
          </div>
          <div>
            <label htmlFor="confirmPassword" style={labelStyle}>Confirm new password</label>
            <input id="confirmPassword" name="confirmPassword" type="password" autoComplete="new-password" required style={inputStyle} />
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button
              type="submit"
              disabled={passwordPending}
              style={{
                padding: "9px 20px",
                borderRadius: 8,
                border: "none",
                background: passwordPending ? "#818cf8" : "#4f46e5",
                color: "#fff",
                fontSize: 13.5,
                fontWeight: 500,
                cursor: passwordPending ? "not-allowed" : "pointer",
                fontFamily: "var(--font-inter)",
                display: "flex",
                alignItems: "center",
                gap: 7,
              }}
            >
              {passwordPending && (
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden style={{ animation: "pf-spin .7s linear infinite" }}>
                  <circle cx="8" cy="8" r="6" stroke="rgba(255,255,255,.35)" strokeWidth="2" />
                  <path d="M14 8a6 6 0 0 0-6-6" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
                </svg>
              )}
              {passwordPending ? "Updating…" : "Change password"}
            </button>
          </div>
        </form>
      </div>

      {/* Danger zone */}
      <div style={{ ...sectionStyle, border: "1px solid #fecaca" }}>
        <h2 style={{ fontSize: 14, fontWeight: 600, color: "#dc2626", margin: "0 0 8px" }}>
          Danger zone
        </h2>
        <p style={{ fontSize: 13, color: "var(--pf-text-2)", margin: "0 0 14px" }}>
          Permanently delete your account and all associated data. This cannot be undone.
        </p>
        <button
          type="button"
          style={{
            padding: "8px 16px",
            borderRadius: 8,
            border: "1px solid #fecaca",
            background: "#fff",
            color: "#dc2626",
            fontSize: 13,
            fontWeight: 500,
            cursor: "pointer",
            fontFamily: "var(--font-inter)",
          }}
        >
          Delete account
        </button>
      </div>
    </div>
  );
}
