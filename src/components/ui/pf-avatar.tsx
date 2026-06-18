import { getAvatarColors, getInitials } from "@/lib/format";
import { cn } from "@/lib/utils";

interface PfAvatarProps {
  name: string;
  src?: string | null;
  size?: number;
  radius?: number;
  className?: string;
  style?: React.CSSProperties;
}

export function PfAvatar({
  name,
  src,
  size = 32,
  radius = 8,
  className,
  style,
}: PfAvatarProps) {
  const { bg, color } = getAvatarColors(name);
  const initials = getInitials(name);
  const fontSize = Math.round(size * 0.35);

  return (
    <div
      aria-label={name}
      className={cn(className)}
      style={{
        width: size,
        height: size,
        borderRadius: radius,
        background: bg,
        color,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize,
        fontWeight: 600,
        flexShrink: 0,
        overflow: "hidden",
        ...style,
      }}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={name}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      ) : (
        <span aria-hidden="true">{initials}</span>
      )}
    </div>
  );
}

interface PfAvatarStackProps {
  names: string[];
  srcs?: (string | null | undefined)[];
  size?: number;
  max?: number;
}

export function PfAvatarStack({ names, srcs, size = 28, max = 4 }: PfAvatarStackProps) {
  const visible = names.slice(0, max);
  const overflow = names.length - max;

  return (
    <div style={{ display: "flex", alignItems: "center" }}>
      {visible.map((name, i) => (
        <PfAvatar
          key={i}
          name={name}
          src={srcs?.[i]}
          size={size}
          radius={size / 3}
          style={{
            marginLeft: i === 0 ? 0 : -(size * 0.3),
            border: "2px solid #fff",
            boxSizing: "content-box",
          }}
        />
      ))}
      {overflow > 0 && (
        <div
          style={{
            width: size,
            height: size,
            borderRadius: size / 3,
            background: "var(--pf-surface-2)",
            color: "var(--pf-text-3)",
            fontSize: Math.round(size * 0.32),
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginLeft: -(size * 0.3),
            border: "2px solid #fff",
            flexShrink: 0,
          }}
        >
          +{overflow}
        </div>
      )}
    </div>
  );
}
