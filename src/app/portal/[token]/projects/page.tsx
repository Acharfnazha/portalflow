import { notFound } from "next/navigation";
import { getPortalContext, getPortalProjects } from "@/lib/supabase/portal-actions";

interface PageProps {
  params: Promise<{ token: string }>;
}

const STATUS_CONFIG: Record<string, { label: string; dotColor: string; badgeBg: string; badgeColor: string }> = {
  planning:  { label: "Planning",   dotColor: "#94a3b8", badgeBg: "#f8fafc", badgeColor: "#475569" },
  active:    { label: "Active",     dotColor: "#22c55e", badgeBg: "#f0fdf4", badgeColor: "#16a34a" },
  in_review: { label: "In Review",  dotColor: "#a855f7", badgeBg: "#faf5ff", badgeColor: "#7e22ce" },
  on_hold:   { label: "On Hold",    dotColor: "#f59e0b", badgeBg: "#fffbeb", badgeColor: "#d97706" },
  completed: { label: "Completed",  dotColor: "#6366f1", badgeBg: "#eef2ff", badgeColor: "#4338ca" },
  canceled:  { label: "Canceled",   dotColor: "#ef4444", badgeBg: "#fef2f2", badgeColor: "#dc2626" },
};

function fmtDate(s?: string | null) {
  if (!s) return null;
  return new Date(s).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default async function PortalProjectsPage({ params }: PageProps) {
  const { token } = await params;
  const ctx = await getPortalContext(token);
  if (!ctx) notFound();

  const projects = await getPortalProjects(ctx.client.id);

  return (
    <div style={{ padding: "28px 28px 40px", maxWidth: 900, margin: "0 auto" }}>
      <div style={{ marginBottom: 24 }}>
        <h1
          style={{
            fontSize:      20,
            fontWeight:    700,
            color:         "var(--pf-text)",
            margin:        "0 0 4px",
            letterSpacing: "-.3px",
            fontFamily:    "var(--font-inter-tight)",
          }}
        >
          Your Projects
        </h1>
        <p style={{ margin: 0, fontSize: 13, color: "var(--pf-text-2)" }}>
          {projects.length} project{projects.length !== 1 ? "s" : ""} shared with you
        </p>
      </div>

      {projects.length === 0 ? (
        <div
          style={{
            background:    "#fff",
            border:        "1px solid var(--pf-line)",
            borderRadius:  12,
            display:       "flex",
            flexDirection: "column",
            alignItems:    "center",
            padding:       "72px 20px",
            color:         "var(--pf-text-3)",
          }}
        >
          <i className="ti ti-briefcase-off" aria-hidden style={{ fontSize: 44, opacity: 0.3 }} />
          <p style={{ fontSize: 15, fontWeight: 600, color: "var(--pf-text-2)", margin: "12px 0 4px" }}>
            No projects yet
          </p>
          <p style={{ fontSize: 13, margin: 0 }}>
            Projects will appear here once they&apos;re shared with you.
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {projects.map((p) => {
            const sc           = STATUS_CONFIG[p.status as string] ?? STATUS_CONFIG.planning;
            const progress     = (p.progress as number) ?? 0;
            const deadline     = fmtDate(p.deadline as string | undefined);
            const isOverdue    = p.deadline && new Date(p.deadline as string) < new Date() && p.status !== "completed" && p.status !== "canceled";
            const progressColor =
              p.status === "completed"
                ? "#6366f1"
                : progress >= 70
                ? "#22c55e"
                : progress >= 40
                ? "#f59e0b"
                : "#3b82f6";

            return (
              <div
                key={p.id}
                style={{
                  background:   "#fff",
                  border:       "1px solid var(--pf-line)",
                  borderRadius: 12,
                  padding:      "18px 20px",
                }}
              >
                {/* Header row */}
                <div
                  style={{
                    display:        "flex",
                    alignItems:     "flex-start",
                    justifyContent: "space-between",
                    marginBottom:   14,
                    gap:            12,
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h2
                      style={{
                        fontSize:     15,
                        fontWeight:   600,
                        color:        "var(--pf-text)",
                        margin:       "0 0 4px",
                        overflow:     "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace:   "nowrap",
                      }}
                    >
                      {p.name as string}
                    </h2>
                    {p.description && (
                      <p
                        style={{
                          margin:       0,
                          fontSize:     13,
                          color:        "var(--pf-text-2)",
                          overflow:     "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace:   "nowrap",
                        }}
                      >
                        {p.description as string}
                      </p>
                    )}
                  </div>
                  <span
                    style={{
                      fontSize:     11.5,
                      fontWeight:   500,
                      padding:      "3px 10px",
                      borderRadius: 99,
                      background:   sc.badgeBg,
                      color:        sc.badgeColor,
                      display:      "flex",
                      alignItems:   "center",
                      gap:          5,
                      flexShrink:   0,
                    }}
                  >
                    <span
                      aria-hidden
                      style={{ width: 6, height: 6, borderRadius: "50%", background: sc.dotColor }}
                    />
                    {sc.label}
                  </span>
                </div>

                {/* Progress bar */}
                <div>
                  <div
                    style={{
                      display:        "flex",
                      justifyContent: "space-between",
                      marginBottom:   6,
                    }}
                  >
                    <span style={{ fontSize: 12.5, color: "var(--pf-text-3)" }}>Progress</span>
                    <span style={{ fontSize: 12.5, fontWeight: 600, color: progressColor }}>
                      {progress}%
                    </span>
                  </div>
                  <div
                    style={{
                      height:       6,
                      borderRadius: 99,
                      background:   "var(--pf-surface-2)",
                      overflow:     "hidden",
                    }}
                  >
                    <div
                      style={{
                        height:     "100%",
                        width:      `${progress}%`,
                        background: progressColor,
                        borderRadius: 99,
                        transition: "width .6s ease",
                      }}
                    />
                  </div>
                </div>

                {/* Deadline */}
                {deadline && (
                  <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 5 }}>
                    <i
                      className={`ti ${isOverdue ? "ti-alert-triangle" : "ti-calendar"}`}
                      aria-hidden
                      style={{ fontSize: 13, color: isOverdue ? "#dc2626" : "var(--pf-text-3)" }}
                    />
                    <span
                      style={{
                        fontSize:   12.5,
                        color:      isOverdue ? "#dc2626" : "var(--pf-text-3)",
                        fontWeight: isOverdue ? 600 : 400,
                      }}
                    >
                      {isOverdue ? "Overdue · " : "Due "}{deadline}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
