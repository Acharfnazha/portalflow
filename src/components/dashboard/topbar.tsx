"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuthContext } from "@/components/auth/auth-provider";
import { signOut } from "@/lib/supabase/actions";
import { useOutsideClick } from "@/hooks/use-outside-click";
import { getInitials, getAvatarColors } from "@/lib/format";

export function Topbar() {
  const [query, setQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, profile } = useAuthContext();
  const menuRef = useOutsideClick<HTMLDivElement>(() => setMenuOpen(false));

  const displayName = profile?.full_name || user?.email?.split("@")[0] || "User";
  const initials = getInitials(displayName);
  const avatarColors = getAvatarColors(displayName);

  return (
    <header
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "12px 20px",
        borderBottom: "1px solid var(--pf-line)",
        background: "#fff",
        position: "sticky",
        top: 0,
        zIndex: 30,
      }}
    >
      {/* Search */}
      <div
        role="search"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          flex: 1,
          maxWidth: 320,
          background: "var(--pf-surface)",
          border: "1px solid var(--pf-line)",
          borderRadius: 8,
          padding: "7px 11px",
        }}
      >
        <i className="ti ti-search" aria-hidden="true" style={{ fontSize: 15, color: "var(--pf-text-3)", flexShrink: 0 }} />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search…"
          aria-label="Global search"
          style={{
            border: "none",
            background: "transparent",
            fontSize: 13,
            color: "var(--pf-text)",
            outline: "none",
            width: "100%",
            fontFamily: "var(--font-inter)",
          }}
        />
        <kbd style={{ fontSize: 11, color: "var(--pf-text-3)", background: "var(--pf-surface-2)", border: "1px solid var(--pf-line)", borderRadius: 5, padding: "1px 5px", marginLeft: "auto", flexShrink: 0 }}>
          ⌘K
        </kbd>
      </div>

      {/* Actions */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginLeft: "auto" }}>
        <button
          aria-label="Notifications"
          style={{ position: "relative", width: 32, height: 32, borderRadius: 8, border: "1px solid var(--pf-line)", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--pf-text-2)" }}
        >
          <i className="ti ti-bell" aria-hidden="true" style={{ fontSize: 17 }} />
          <span aria-hidden="true" style={{ position: "absolute", top: 6, right: 6, width: 6, height: 6, borderRadius: "50%", background: "#ef4444", border: "1.5px solid #fff" }} />
        </button>

        {/* Avatar + dropdown */}
        <div ref={menuRef} style={{ position: "relative" }}>
          <button
            aria-label="Open profile menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((o) => !o)}
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              background: avatarColors.bg,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 12,
              fontWeight: 600,
              color: avatarColors.color,
              cursor: "pointer",
              border: "none",
              fontFamily: "var(--font-inter)",
            }}
          >
            {profile?.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profile.avatar_url}
                alt={displayName}
                style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }}
              />
            ) : (
              initials
            )}
          </button>

          {menuOpen && (
            <div
              style={{
                position: "absolute",
                top: "calc(100% + 8px)",
                right: 0,
                width: 200,
                background: "#fff",
                border: "1px solid var(--pf-line)",
                borderRadius: 10,
                boxShadow: "0 8px 24px rgba(0,0,0,.08)",
                zIndex: 50,
                overflow: "hidden",
              }}
            >
              {/* User info */}
              <div style={{ padding: "12px 14px", borderBottom: "1px solid var(--pf-line)" }}>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "var(--pf-text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {displayName}
                </p>
                <p style={{ margin: "2px 0 0", fontSize: 11.5, color: "var(--pf-text-3)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {user?.email}
                </p>
              </div>

              {/* Menu items */}
              <div style={{ padding: "6px 0" }}>
                {[
                  { href: "/dashboard/settings/profile", icon: "ti-user-circle", label: "Profile" },
                  { href: "/dashboard/settings",         icon: "ti-settings",     label: "Settings" },
                ].map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 9,
                      padding: "8px 14px",
                      fontSize: 13,
                      color: "var(--pf-text-2)",
                      textDecoration: "none",
                    }}
                  >
                    <i className={`ti ${item.icon}`} aria-hidden style={{ fontSize: 15, color: "var(--pf-text-3)" }} />
                    {item.label}
                  </Link>
                ))}
              </div>

              {/* Sign out */}
              <div style={{ borderTop: "1px solid var(--pf-line)", padding: "6px 0" }}>
                <form action={signOut}>
                  <button
                    type="submit"
                    style={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      gap: 9,
                      padding: "8px 14px",
                      fontSize: 13,
                      color: "#dc2626",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      textAlign: "left",
                      fontFamily: "var(--font-inter)",
                    }}
                  >
                    <i className="ti ti-logout" aria-hidden style={{ fontSize: 15 }} />
                    Sign out
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
