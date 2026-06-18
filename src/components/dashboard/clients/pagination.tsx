"use client";

interface Props {
  total: number;
  showing: number;
  from?: number;
  page: number;
  totalPages: number;
  onPage: (p: number) => void;
}

export function ClientsPagination({ total, showing, from = 1, page, totalPages, onPage }: Props) {
  const pages = Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1);

  const btnStyle = (active: boolean): React.CSSProperties => ({
    width: 28,
    height: 28,
    borderRadius: 6,
    border: `1px solid ${active ? "#4f46e5" : "var(--pf-line)"}`,
    background: active ? "#4f46e5" : "#fff",
    color: active ? "#fff" : "var(--pf-text-2)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    fontSize: 12,
    fontFamily: "var(--font-inter)",
  });

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 20px", borderTop: "1px solid var(--pf-line)" }}>
      <span style={{ fontSize: "12.5px", color: "var(--pf-text-3)" }}>
        Showing {from}–{from + showing - 1} of {total} clients
      </span>
      <nav aria-label="Pagination" style={{ display: "flex", gap: 4 }}>
        <button
          type="button"
          onClick={() => onPage(Math.max(1, page - 1))}
          disabled={page === 1}
          aria-label="Previous page"
          style={{ ...btnStyle(false), opacity: page === 1 ? 0.4 : 1 }}
        >
          <i className="ti ti-chevron-left" aria-hidden="true" style={{ fontSize: 13 }} />
        </button>

        {pages.map(p => (
          <button key={p} type="button" onClick={() => onPage(p)} aria-current={p === page ? "page" : undefined} style={btnStyle(p === page)}>
            {p}
          </button>
        ))}

        {totalPages > 5 && (
          <>
            <span style={{ ...btnStyle(false), cursor: "default", letterSpacing: 1 }}>…</span>
            <button type="button" onClick={() => onPage(totalPages)} style={btnStyle(page === totalPages)}>{totalPages}</button>
          </>
        )}

        <button
          type="button"
          onClick={() => onPage(Math.min(totalPages, page + 1))}
          disabled={page === totalPages}
          aria-label="Next page"
          style={{ ...btnStyle(false), opacity: page === totalPages ? 0.4 : 1 }}
        >
          <i className="ti ti-chevron-right" aria-hidden="true" style={{ fontSize: 13 }} />
        </button>
      </nav>
    </div>
  );
}
