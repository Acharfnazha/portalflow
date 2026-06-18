"use client";

import { motion, AnimatePresence } from "framer-motion";

interface Props {
  count: number;
  onClear: () => void;
}

export function BulkBar({ count, onClear }: Props) {
  return (
    <AnimatePresence>
      {count > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "8px 14px",
            margin: "0 20px 10px",
            background: "#eef2ff",
            border: "1px solid #c7d2fe",
            borderRadius: 8,
          }}
          role="region"
          aria-live="polite"
          aria-label={`${count} clients selected`}
        >
          <span style={{ fontSize: 13, color: "#3730a3", fontWeight: 500 }}>{count} selected</span>

          {[
            { icon: "ti-tag",      label: "Tag" },
            { icon: "ti-send",     label: "Email" },
            { icon: "ti-transfer", label: "Reassign" },
          ].map(a => (
            <button
              key={a.label}
              type="button"
              style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 10px", borderRadius: 6, border: "1px solid #a5b4fc", background: "transparent", fontSize: "12.5px", color: "#4338ca", cursor: "pointer", fontFamily: "var(--font-inter)" }}
            >
              <i className={`ti ${a.icon}`} aria-hidden="true" style={{ fontSize: 14 }} />
              {a.label}
            </button>
          ))}

          <button
            type="button"
            style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 10px", borderRadius: 6, border: "1px solid #fca5a5", background: "transparent", fontSize: "12.5px", color: "#dc2626", cursor: "pointer", fontFamily: "var(--font-inter)" }}
          >
            <i className="ti ti-trash" aria-hidden="true" style={{ fontSize: 14 }} />
            Delete
          </button>

          <button
            type="button"
            onClick={onClear}
            style={{ marginLeft: "auto", background: "none", border: "none", fontSize: 13, color: "#6366f1", cursor: "pointer", fontFamily: "var(--font-inter)" }}
            aria-label="Clear selection"
          >
            Clear
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
