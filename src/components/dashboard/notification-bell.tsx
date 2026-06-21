"use client";

import { useState, useEffect, useTransition, useCallback } from "react";
import { useOutsideClick } from "@/hooks/use-outside-click";
import {
  getNotificationsAction,
  markReadAction,
  markAllReadAction,
} from "@/lib/supabase/notification-actions";
import type { Notification, NotificationType } from "@/types/app.types";

const TYPE_CONFIG: Record<NotificationType, { icon: string; color: string }> = {
  client_created:     { icon: "ti-user-plus",      color: "#22c55e" },
  project_created:    { icon: "ti-briefcase",       color: "#6366f1" },
  document_uploaded:  { icon: "ti-file-upload",     color: "#3b82f6" },
  invoice_created:    { icon: "ti-receipt",         color: "#d97706" },
  invoice_overdue:    { icon: "ti-alert-triangle",  color: "#ef4444" },
  portal_invite_sent: { icon: "ti-mail",            color: "#0f766e" },
};

function fmtTime(ts: string) {
  const diff = Date.now() - new Date(ts).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export function NotificationBell() {
  const [open, setOpen]                   = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loaded, setLoaded]               = useState(false);
  const [, startMark]                     = useTransition();
  const ref = useOutsideClick<HTMLDivElement>(() => setOpen(false));

  const load = useCallback(async () => {
    const data = await getNotificationsAction();
    setNotifications(data);
    setLoaded(true);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  const unread = notifications.filter((n) => !n.readAt).length;

  function handleOpen() {
    setOpen((o) => !o);
    if (!open) load();
  }

  function handleMarkOne(id: string) {
    startMark(async () => {
      await markReadAction(id);
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === id ? { ...n, readAt: new Date().toISOString() } : n
        )
      );
    });
  }

  function handleMarkAll() {
    startMark(async () => {
      await markAllReadAction();
      const now = new Date().toISOString();
      setNotifications((prev) => prev.map((n) => ({ ...n, readAt: n.readAt ?? now })));
    });
  }

  return (
    <div ref={ref} style={{ position: "relative" }}>
      {/* Bell button */}
      <button
        type="button"
        aria-label="Notifications"
        aria-expanded={open}
        onClick={handleOpen}
        style={{
          position:        "relative",
          width:           32,
          height:          32,
          borderRadius:    8,
          border:          "1px solid var(--pf-line)",
          background:      open ? "var(--pf-surface)" : "#fff",
          display:         "flex",
          alignItems:      "center",
          justifyContent:  "center",
          cursor:          "pointer",
          color:           "var(--pf-text-2)",
        }}
      >
        <i className="ti ti-bell" aria-hidden="true" style={{ fontSize: 17 }} />
        {loaded && unread > 0 && (
          <span
            aria-hidden="true"
            style={{
              position:     "absolute",
              top:          5,
              right:        5,
              width:        8,
              height:       8,
              borderRadius: "50%",
              background:   "#ef4444",
              border:       "1.5px solid #fff",
            }}
          />
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div
          style={{
            position:     "absolute",
            top:          "calc(100% + 8px)",
            right:        0,
            width:        320,
            background:   "#fff",
            border:       "1px solid var(--pf-line)",
            borderRadius: 12,
            boxShadow:    "0 8px 32px rgba(0,0,0,.1)",
            zIndex:       50,
            overflow:     "hidden",
          }}
        >
          {/* Header */}
          <div
            style={{
              display:        "flex",
              alignItems:     "center",
              justifyContent: "space-between",
              padding:        "13px 16px",
              borderBottom:   "1px solid var(--pf-line)",
            }}
          >
            <span style={{ fontSize: 13.5, fontWeight: 600, color: "var(--pf-text)" }}>
              Notifications
            </span>
            {unread > 0 && (
              <span
                style={{
                  fontSize:     11,
                  padding:      "2px 7px",
                  borderRadius: 99,
                  background:   "#ef444420",
                  color:        "#dc2626",
                  fontWeight:   600,
                }}
              >
                {unread} new
              </span>
            )}
          </div>

          {/* List */}
          <div style={{ maxHeight: 340, overflowY: "auto" }}>
            {!loaded ? (
              <div
                style={{
                  padding:       "32px 16px",
                  textAlign:     "center",
                  color:         "var(--pf-text-3)",
                  fontSize:      13,
                }}
              >
                <i
                  className="ti ti-loader"
                  aria-hidden
                  style={{ fontSize: 22, opacity: 0.4, display: "block", marginBottom: 8 }}
                />
                Loading…
              </div>
            ) : notifications.length === 0 ? (
              <div
                style={{
                  padding:       "40px 16px",
                  textAlign:     "center",
                  color:         "var(--pf-text-3)",
                }}
              >
                <i
                  className="ti ti-bell-off"
                  aria-hidden
                  style={{ fontSize: 30, opacity: 0.3, display: "block", marginBottom: 8 }}
                />
                <p style={{ margin: 0, fontSize: 13 }}>You&apos;re all caught up</p>
              </div>
            ) : (
              notifications.map((n) => {
                const tc       = TYPE_CONFIG[n.type] ?? { icon: "ti-bell", color: "#6366f1" };
                const isUnread = !n.readAt;
                return (
                  <div
                    key={n.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => isUnread && handleMarkOne(n.id)}
                    onKeyDown={(e) => e.key === "Enter" && isUnread && handleMarkOne(n.id)}
                    style={{
                      display:      "flex",
                      gap:          12,
                      padding:      "12px 16px",
                      borderBottom: "1px solid var(--pf-line)",
                      cursor:       isUnread ? "pointer" : "default",
                      background:   isUnread ? "#f8f8ff" : "transparent",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = "var(--pf-surface)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = isUnread ? "#f8f8ff" : "transparent")
                    }
                  >
                    {/* Icon */}
                    <div
                      style={{
                        width:          32,
                        height:         32,
                        borderRadius:   8,
                        background:     tc.color + "18",
                        display:        "flex",
                        alignItems:     "center",
                        justifyContent: "center",
                        flexShrink:     0,
                      }}
                    >
                      <i
                        className={`ti ${tc.icon}`}
                        aria-hidden
                        style={{ fontSize: 15, color: tc.color }}
                      />
                    </div>

                    {/* Text */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize:   13,
                          fontWeight: isUnread ? 600 : 500,
                          color:      "var(--pf-text)",
                        }}
                      >
                        {n.title}
                      </div>
                      {n.body && (
                        <div
                          style={{
                            fontSize:     12,
                            color:        "var(--pf-text-2)",
                            marginTop:    2,
                            overflow:     "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace:   "nowrap",
                          }}
                        >
                          {n.body}
                        </div>
                      )}
                    </div>

                    {/* Time + unread dot */}
                    <div
                      style={{
                        display:       "flex",
                        flexDirection: "column",
                        alignItems:    "flex-end",
                        gap:           4,
                        flexShrink:    0,
                      }}
                    >
                      <span style={{ fontSize: 11, color: "var(--pf-text-3)", marginTop: 2 }}>
                        {fmtTime(n.createdAt)}
                      </span>
                      {isUnread && (
                        <span
                          aria-hidden
                          style={{
                            width:        6,
                            height:       6,
                            borderRadius: "50%",
                            background:   "#4f46e5",
                          }}
                        />
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          {unread > 0 && (
            <div
              style={{
                padding:    "10px 16px",
                textAlign:  "center",
                borderTop:  "1px solid var(--pf-line)",
              }}
            >
              <button
                type="button"
                onClick={handleMarkAll}
                style={{
                  fontSize:   12.5,
                  color:      "#4f46e5",
                  background: "none",
                  border:     "none",
                  cursor:     "pointer",
                  fontFamily: "var(--font-inter)",
                  fontWeight: 500,
                }}
              >
                Mark all as read
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
