"use client";

interface SearchInputProps {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  width?: number | string;
  autoFocus?: boolean;
}

export function SearchInput({
  value,
  onChange,
  placeholder = "Search…",
  width = 200,
  autoFocus,
}: SearchInputProps) {
  return (
    <label
      style={{
        display: "flex",
        alignItems: "center",
        gap: 7,
        background: "var(--pf-surface)",
        border: "1px solid var(--pf-line)",
        borderRadius: 8,
        padding: "6px 11px",
        cursor: "text",
      }}
    >
      <i
        className="ti ti-search"
        aria-hidden
        style={{ fontSize: 14, color: "var(--pf-text-3)", flexShrink: 0 }}
      />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        style={{
          border: "none",
          background: "transparent",
          fontSize: 13,
          color: "var(--pf-text)",
          outline: "none",
          width,
          fontFamily: "var(--font-inter)",
        }}
      />
      {value && (
        <button
          type="button"
          aria-label="Clear search"
          onClick={() => onChange("")}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "var(--pf-text-3)",
            padding: 0,
            display: "flex",
          }}
        >
          <i className="ti ti-x" aria-hidden style={{ fontSize: 13 }} />
        </button>
      )}
    </label>
  );
}
