import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
  width?: number | string;
  height?: number | string;
  radius?: number | string;
  style?: React.CSSProperties;
}

export function Skeleton({ className, width, height, radius = 6, style }: SkeletonProps) {
  return (
    <div
      aria-hidden
      className={cn("pf-skeleton", className)}
      style={{
        width,
        height: height ?? 16,
        borderRadius: radius,
        background: "linear-gradient(90deg, var(--pf-surface) 25%, var(--pf-surface-2) 50%, var(--pf-surface) 75%)",
        backgroundSize: "200% 100%",
        animation: "pf-shimmer 1.5s infinite",
        ...style,
      }}
    />
  );
}

export function SkeletonText({ lines = 3, gap = 8 }: { lines?: number; gap?: number }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap }}>
      {Array.from({ length: lines }, (_, i) => (
        <Skeleton
          key={i}
          height={13}
          width={i === lines - 1 ? "60%" : "100%"}
        />
      ))}
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid var(--pf-line)",
        borderRadius: 12,
        padding: 20,
        display: "flex",
        flexDirection: "column",
        gap: 12,
      }}
    >
      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        <Skeleton width={40} height={40} radius={10} />
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
          <Skeleton height={14} width="60%" />
          <Skeleton height={11} width="40%" />
        </div>
      </div>
      <Skeleton height={11} width="90%" />
      <Skeleton height={11} width="70%" />
      <Skeleton height={6} radius={99} />
    </div>
  );
}

// Add the keyframe to globals — injected once via a style tag
export function SkeletonStyles() {
  return (
    <style>{`
      @keyframes pf-shimmer {
        0%   { background-position: 200% 0; }
        100% { background-position: -200% 0; }
      }
    `}</style>
  );
}
