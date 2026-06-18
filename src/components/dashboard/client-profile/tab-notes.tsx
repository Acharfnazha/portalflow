"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
// Mock data retained until Notes Module sprint
const NOTES: { clientId: string; id: string; author: string; authorInitials: string; authorColor: string; body: string; date: string }[] = [];

interface Props { clientId: string }

export function TabNotes({ clientId }: Props) {
  const [notes, setNotes] = useState(NOTES.filter((n) => n.clientId === clientId));
  const [draft, setDraft] = useState("");

  function handleSave() {
    const text = draft.trim();
    if (!text) return;
    setNotes((prev: typeof NOTES) => [
      {
        id: String(Date.now()),
        clientId,
        author: "You",
        authorInitials: "AN",
        authorColor: "#e0e7ff",
        body: text,
        date: "Just now",
      },
      ...prev,
    ]);
    setDraft("");
  }

  return (
    <div>
      {/* Compose area */}
      <div
        style={{
          background: "#fff",
          border: "1px solid var(--pf-line)",
          borderRadius: 10,
          marginBottom: 16,
          overflow: "hidden",
        }}
      >
        <textarea
          value={draft}
          onChange={e => setDraft(e.target.value)}
          placeholder="Add a note about this client — context, preferences, important decisions…"
          aria-label="New note"
          rows={3}
          style={{
            width: "100%", boxSizing: "border-box" as const,
            padding: "12px 14px", border: "none", resize: "none" as const,
            fontFamily: "var(--font-inter)", fontSize: 13,
            color: "var(--pf-text)", background: "transparent",
            outline: "none", lineHeight: 1.6,
          }}
        />
        <div style={{ display: "flex", justifyContent: "flex-end", padding: "8px 12px", borderTop: "1px solid var(--pf-line)" }}>
          <button
            type="button"
            onClick={handleSave}
            disabled={!draft.trim()}
            style={{
              padding: "6px 16px", borderRadius: 7, border: "none",
              background: draft.trim() ? "#4f46e5" : "var(--pf-surface-2)",
              color: draft.trim() ? "#fff" : "var(--pf-text-3)",
              fontSize: 13, fontWeight: 500, cursor: draft.trim() ? "pointer" : "default",
              fontFamily: "var(--font-inter)",
              transition: "background .15s, color .15s",
            }}
          >
            Save note
          </button>
        </div>
      </div>

      {/* Notes list */}
      {notes.length === 0 && (
        <div style={{ textAlign: "center", padding: "40px 0", color: "var(--pf-text-3)" }}>
          <i className="ti ti-notes" aria-hidden="true" style={{ fontSize: 32, opacity: 0.35 }} />
          <p style={{ marginTop: 8, fontSize: 13 }}>No notes yet. Add one above.</p>
        </div>
      )}

      <AnimatePresence initial={false}>
        {notes.map(note => (
          <motion.div
            key={note.id}
            layout
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            style={{
              background: "#fff",
              border: "1px solid var(--pf-line)",
              borderRadius: 10,
              padding: "14px 16px",
              marginBottom: 10,
            }}
          >
            {/* Note header */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
              <div
                aria-hidden="true"
                style={{
                  width: 28, height: 28, borderRadius: "50%",
                  background: note.authorColor, fontSize: 10, fontWeight: 600,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "var(--pf-text)",
                }}
              >
                {note.authorInitials}
              </div>
              <span style={{ fontSize: 13, fontWeight: 500, color: "var(--pf-text)" }}>{note.author}</span>
              <span style={{ fontSize: 12, color: "var(--pf-text-3)", marginLeft: "auto" }}>{note.date}</span>
            </div>

            {/* Note body */}
            <p style={{ fontSize: 13, color: "var(--pf-text-2)", lineHeight: 1.65, margin: 0 }}>
              {note.body}
            </p>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
