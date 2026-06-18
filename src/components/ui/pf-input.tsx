"use client";

import { cn } from "@/lib/utils";
import { useState } from "react";

interface PfInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: string;           // tabler icon class e.g. "ti-search"
  iconRight?: string;
  onClear?: () => void;
  containerClassName?: string;
}

export function PfInput({
  label,
  error,
  hint,
  icon,
  iconRight,
  onClear,
  containerClassName,
  className,
  id,
  ...props
}: PfInputProps) {
  const [focused, setFocused] = useState(false);
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

  const borderColor = error
    ? "#dc2626"
    : focused
    ? "#4f46e5"
    : "var(--pf-line-strong)";

  return (
    <div className={cn("pf-input-wrap", containerClassName)} style={{ width: "100%" }}>
      {label && (
        <label
          htmlFor={inputId}
          style={{
            display: "block",
            fontSize: 12.5,
            fontWeight: 500,
            color: "var(--pf-text-2)",
            marginBottom: 5,
          }}
        >
          {label}
          {props.required && (
            <span aria-hidden style={{ color: "#dc2626", marginLeft: 3 }}>*</span>
          )}
        </label>
      )}

      <div
        style={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          background: "#fff",
          border: `1px solid ${borderColor}`,
          borderRadius: 8,
          transition: "border-color .15s",
          boxShadow: focused && !error ? "0 0 0 3px rgba(79,70,229,.12)" : "none",
        }}
      >
        {icon && (
          <i
            className={`ti ${icon}`}
            aria-hidden
            style={{
              position: "absolute",
              left: 11,
              fontSize: 15,
              color: "var(--pf-text-3)",
              pointerEvents: "none",
            }}
          />
        )}

        <input
          id={inputId}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className={cn(className)}
          style={{
            width: "100%",
            padding: icon ? "8px 12px 8px 34px" : "8px 12px",
            paddingRight: iconRight || onClear ? 34 : 12,
            border: "none",
            outline: "none",
            background: "transparent",
            fontSize: 13,
            color: "var(--pf-text)",
            fontFamily: "var(--font-inter)",
            borderRadius: 7,
          }}
          {...props}
        />

        {(iconRight || onClear) && (
          <button
            type="button"
            onClick={onClear}
            aria-label="Clear"
            style={{
              position: "absolute",
              right: 10,
              background: "none",
              border: "none",
              cursor: onClear ? "pointer" : "default",
              color: "var(--pf-text-3)",
              padding: 0,
              display: "flex",
            }}
          >
            <i
              className={`ti ${iconRight ?? "ti-x"}`}
              aria-hidden
              style={{ fontSize: 14 }}
            />
          </button>
        )}
      </div>

      {(error || hint) && (
        <p
          style={{
            marginTop: 4,
            fontSize: 12,
            color: error ? "#dc2626" : "var(--pf-text-3)",
          }}
          role={error ? "alert" : undefined}
        >
          {error ?? hint}
        </p>
      )}
    </div>
  );
}
