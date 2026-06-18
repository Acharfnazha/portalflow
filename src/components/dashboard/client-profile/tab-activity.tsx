"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { formatRelative } from "@/lib/format";
import { getAvatarColors, getInitials } from "@/lib/format";

interface ActivityItem {
  id: string;
  action: string;
  description: string | null;
  created_at: string;
  actor_id: string | null;
  actor_name: string | null;
  actor_avatar_url: string | null;
}

const ACTION_CONFIG: Record<string, { icon: string; bg: string; color: string; label: string }> = {
  created:        { icon: "ti-sparkles",    bg: "#eef2ff", color: "#4f46e5", label: "Created" },
  updated:        { icon: "ti-pencil",      bg: "#eff6ff", color: "#1d4ed8", label: "Updated" },
  deleted:        { icon: "ti-trash",       bg: "#fef2f2", color: "#dc2626", label: "Deleted" },
  status_changed: { icon: "ti-refresh",     bg: "#fffbeb", color: "#b45309", label: "Status changed" },
  note_added:     { icon: "ti-notes",       bg: "#f0fdf4", color: "#16a34a", label: "Note added" },
  invoice_sent:   { icon: "ti-send",        bg: "#f0fdf4", color: "#16a34a", label: "Invoice sent" },
  portal_viewed:  { icon: "ti-eye",         bg: "#faf5ff", color: "#7e22ce", label: "Portal viewed" },
  payment_received: { icon: "ti-cash",      bg: "#f0fdf4", color: "#16a34a", label: "Payment received" },
  default:        { icon: "ti-activity",    bg: "var(--pf-surface-2)", color: "var(--pf-text-3)", label: "Activity" },
};

export function TabActivity({ clientId }: { clientId: string }) {
  const [items, setItems] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    async function load() {
      setLoading(true);
      const { data } = await supabase
        .from("activity_logs")
        .select(`
          id, action, description, created_at, actor_id,
          profiles:actor_id ( full_name, avatar_url )
        `)
        .eq("entity_type", "client")
        .eq("entity_id", clientId)
        .order("created_at", { ascending: false })
        .limit(50);

      setItems(
        (data ?? []).map((r: { id: string; action: string; description: string | null; created_at: string; actor_id: string | null; profiles?: { full_name?: string; avatar_url?: string }[] | null }) => {
          const profile = Array.isArray(r.profiles) ? r.profiles[0] : null;
          return {
            id:              r.id,
            action:          r.action,
            description:     r.description,
            created_at:      r.created_at,
            actor_id:        r.actor_id,
            actor_name:      profile?.full_name ?? null,
            actor_avatar_url: profile?.avatar_url ?? null,
          };
        })
      );
      setLoading(false);
    }

    load();
  }, [clientId]);

  if (loading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {[...Array(4)].map((_, i) => (
          <div key={i} style={{ display: "flex", gap: 12 }}>
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--pf-surface-2)", animation: "pf-shimmer 1.4s infinite", backgroundSize: "400% 100%", backgroundImage: "linear-gradient(90deg,var(--pf-surface-2) 25%,var(--pf-surface) 50%,var(--pf-surface-2) 75%)", flexShrink: 0 }} />
            <div style={{ flex: 1, paddingTop: 6 }}>
              <div style={{ height: 13, borderRadius: 6, background: "var(--pf-surface-2)", width: "60%", animation: "pf-shimmer 1.4s infinite", backgroundSize: "400% 100%", backgroundImage: "linear-gradient(90deg,var(--pf-surface-2) 25%,var(--pf-surface) 50%,var(--pf-surface-2) 75%)" }} />
              <div style={{ height: 11, borderRadius: 6, background: "var(--pf-surface-2)", width: "40%", marginTop: 6, animation: "pf-shimmer 1.4s infinite", backgroundSize: "400% 100%", backgroundImage: "linear-gradient(90deg,var(--pf-surface-2) 25%,var(--pf-surface) 50%,var(--pf-surface-2) 75%)" }} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "40px 0", color: "var(--pf-text-3)" }}>
        <i className="ti ti-history" aria-hidden="true" style={{ fontSize: 32, opacity: 0.35 }} />
        <p style={{ marginTop: 8, fontSize: 13 }}>No activity recorded yet.</p>
      </div>
    );
  }

  // Group by date
  const grouped: { date: string; items: ActivityItem[] }[] = [];
  let lastDate = "";
  for (const item of items) {
    const date = new Date(item.created_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
    if (date !== lastDate) {
      grouped.push({ date, items: [item] });
      lastDate = date;
    } else {
      grouped[grouped.length - 1].items.push(item);
    }
  }

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <span style={{ fontSize: 13, color: "var(--pf-text-2)" }}>{items.length} event{items.length !== 1 ? "s" : ""}</span>
      </div>

      {grouped.map((group, gi) => (
        <div key={group.date}>
          {/* Date divider */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12, marginTop: gi > 0 ? 20 : 0 }}>
            <div style={{ flex: 1, height: 1, background: "var(--pf-line)" }} />
            <span style={{ fontSize: 11, color: "var(--pf-text-3)", whiteSpace: "nowrap", fontWeight: 500 }}>{group.date}</span>
            <div style={{ flex: 1, height: 1, background: "var(--pf-line)" }} />
          </div>

          {group.items.map((item, i) => {
            const cfg = ACTION_CONFIG[item.action] ?? ACTION_CONFIG.default;
            const actorName = item.actor_name ?? "System";
            const { bg: avatarBg, color: avatarColor } = getAvatarColors(actorName);
            const initials = getInitials(actorName);

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2, delay: i * 0.04 }}
                style={{ display: "flex", gap: 12, marginBottom: 12 }}
              >
                {/* Icon */}
                <div aria-hidden="true" style={{ width: 32, height: 32, borderRadius: "50%", background: cfg.bg, color: cfg.color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <i className={`ti ${cfg.icon}`} aria-hidden="true" style={{ fontSize: 15 }} />
                </div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0, paddingTop: 5 }}>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 6, flexWrap: "wrap" }}>
                    {/* Actor avatar */}
                    <div style={{ width: 18, height: 18, borderRadius: "50%", background: avatarBg, color: avatarColor, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 600, flexShrink: 0 }}>
                      {initials}
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 500, color: "var(--pf-text)" }}>{actorName}</span>
                    <span style={{ fontSize: 13, color: "var(--pf-text-2)" }}>{cfg.label.toLowerCase()}</span>
                    <span style={{ fontSize: 11, color: "var(--pf-text-3)", marginLeft: "auto" }}>
                      {formatRelative(item.created_at)}
                    </span>
                  </div>

                  {item.description && (
                    <div style={{ marginTop: 6, padding: "9px 12px", background: "var(--pf-surface)", border: "1px solid var(--pf-line)", borderRadius: 8, fontSize: 13, color: "var(--pf-text-2)", lineHeight: 1.5 }}>
                      {item.description}
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
