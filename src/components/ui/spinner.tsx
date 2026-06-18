interface SpinnerProps {
  size?: number;
  color?: string;
}

export function Spinner({ size = 20, color = "#4f46e5" }: SpinnerProps) {
  return (
    <svg
      aria-label="Loading"
      role="status"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      style={{ flexShrink: 0, animation: "pf-spin 0.7s linear infinite" }}
    >
      <style>{`@keyframes pf-spin { to { transform: rotate(360deg); } }`}</style>
      <circle cx="12" cy="12" r="10" stroke={color} strokeOpacity=".2" strokeWidth="3" />
      <path
        d="M12 2a10 10 0 0 1 10 10"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}
