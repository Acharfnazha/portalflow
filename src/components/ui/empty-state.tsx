interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "64px 32px",
        gap: 10,
        textAlign: "center",
      }}
    >
      {icon && (
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: 14,
            background: "var(--pf-surface-2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 4,
          }}
        >
          <i className={`ti ${icon}`} aria-hidden style={{ fontSize: 26, color: "var(--pf-text-3)" }} />
        </div>
      )}
      <p style={{ fontSize: 15, fontWeight: 600, color: "var(--pf-text)", margin: 0 }}>
        {title}
      </p>
      {description && (
        <p style={{ fontSize: 13, color: "var(--pf-text-3)", margin: 0, maxWidth: 320 }}>
          {description}
        </p>
      )}
      {action && <div style={{ marginTop: 8 }}>{action}</div>}
    </div>
  );
}
