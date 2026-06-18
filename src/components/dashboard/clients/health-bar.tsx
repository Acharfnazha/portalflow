import { healthColor } from "@/lib/clients-data";

export function HealthBar({ score }: { score: number }) {
  const color = healthColor(score);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }} role="meter" aria-valuenow={score} aria-valuemin={0} aria-valuemax={100} aria-label={`Health score: ${score}`}>
      <div style={{ flex: 1, height: 5, borderRadius: 99, background: "var(--pf-surface-2)", overflow: "hidden" }}>
        <div style={{ width: `${score}%`, height: "100%", borderRadius: 99, background: color, transition: "width .4s" }} />
      </div>
      <span style={{ fontSize: "11.5px", color: "var(--pf-text-2)", minWidth: 24, textAlign: "right" as const }}>{score}</span>
    </div>
  );
}
