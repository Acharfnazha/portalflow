import { cn } from "@/lib/utils";

type BadgeVariant =
  | "default"
  | "green"
  | "amber"
  | "red"
  | "blue"
  | "indigo"
  | "purple"
  | "gray";

const VARIANTS: Record<BadgeVariant, React.CSSProperties> = {
  default: { background: "var(--pf-surface-2)", color: "var(--pf-text-3)" },
  green:   { background: "#f0fdf4", color: "#16a34a" },
  amber:   { background: "#fffbeb", color: "#b45309" },
  red:     { background: "#fef2f2", color: "#dc2626" },
  blue:    { background: "#eff6ff", color: "#1d4ed8" },
  indigo:  { background: "#eef2ff", color: "#4f46e5" },
  purple:  { background: "#faf5ff", color: "#7e22ce" },
  gray:    { background: "#f8fafc", color: "#475569" },
};

interface PfBadgeProps {
  variant?: BadgeVariant;
  dot?: boolean;
  dotColor?: string;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export function PfBadge({
  variant = "default",
  dot,
  dotColor,
  children,
  className,
  style,
}: PfBadgeProps) {
  return (
    <span
      className={cn(className)}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        padding: "3px 9px",
        borderRadius: 99,
        fontSize: 11.5,
        fontWeight: 500,
        whiteSpace: "nowrap",
        ...VARIANTS[variant],
        ...style,
      }}
    >
      {(dot || dotColor) && (
        <span
          aria-hidden="true"
          style={{
            width: 5,
            height: 5,
            borderRadius: "50%",
            background: dotColor ?? VARIANTS[variant].color as string,
            flexShrink: 0,
          }}
        />
      )}
      {children}
    </span>
  );
}
