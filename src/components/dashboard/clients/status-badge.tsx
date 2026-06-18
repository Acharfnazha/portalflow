import { CLIENT_STATUS_CONFIG } from "@/lib/constants";
import type { ClientStatus } from "@/types/app.types";

export function StatusBadge({ status }: { status: ClientStatus }) {
  const cfg = CLIENT_STATUS_CONFIG[status] ?? CLIENT_STATUS_CONFIG.new;
  return (
    <span
      style={{
        display: "inline-flex", alignItems: "center", gap: 5,
        padding: "3px 9px", borderRadius: 99,
        fontSize: "11.5px", fontWeight: 500,
        background: cfg.bg, color: cfg.color,
      }}
    >
      <span aria-hidden="true" style={{ width: 5, height: 5, borderRadius: "50%", background: cfg.dot, flexShrink: 0 }} />
      {cfg.label}
    </span>
  );
}
