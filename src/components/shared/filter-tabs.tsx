"use client";

interface TabItem<T extends string> {
  key: T;
  label: string;
  count?: number;
  dot?: string;
}

interface FilterTabsProps<T extends string> {
  tabs: TabItem<T>[];
  active: T;
  onChange: (key: T) => void;
}

export function FilterTabs<T extends string>({
  tabs,
  active,
  onChange,
}: FilterTabsProps<T>) {
  return (
    <div
      style={{ display: "flex", gap: 4, flexWrap: "wrap" }}
      role="tablist"
    >
      {tabs.map((t) => {
        const isActive = t.key === active;
        return (
          <button
            key={t.key}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(t.key)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "6px 12px",
              borderRadius: 7,
              cursor: "pointer",
              border: isActive ? "1px solid #4f46e5" : "1px solid var(--pf-line)",
              background: isActive ? "#eef2ff" : "#fff",
              fontSize: 12.5,
              color: isActive ? "#4f46e5" : "var(--pf-text-2)",
              fontFamily: "var(--font-inter)",
              transition: "all .15s",
              whiteSpace: "nowrap",
            }}
          >
            {t.dot && (
              <span
                aria-hidden
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  background: t.dot,
                  flexShrink: 0,
                }}
              />
            )}
            {t.label}
            {t.count !== undefined && (
              <span
                style={{
                  fontSize: 11,
                  padding: "1px 6px",
                  borderRadius: 99,
                  background: isActive ? "#4f46e5" : "var(--pf-surface-2)",
                  color: isActive ? "#fff" : "var(--pf-text-3)",
                }}
              >
                {t.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
