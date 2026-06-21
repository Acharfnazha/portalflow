import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/shared/page-header";
import { formatCurrency } from "@/lib/format";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("organization_id, full_name, role")
    .eq("id", user.id)
    .single();

  if (!profile?.organization_id) redirect("/dashboard");
  const orgId = profile.organization_id as string;

  // Parallel data fetch
  const [
    { data: clientRows },
    { data: projectRows },
    { data: invoiceRows },
    { data: documentRows },
    { data: recentActivity },
  ] = await Promise.all([
    supabase.from("clients").select("status, mrr_cents").eq("organization_id", orgId).is("deleted_at", null),
    supabase.from("projects").select("status, deadline").eq("organization_id", orgId).is("deleted_at", null),
    supabase.from("invoices").select("status, total_cents, due_at").eq("organization_id", orgId).is("deleted_at", null),
    supabase.from("documents").select("id").eq("organization_id", orgId).is("deleted_at", null).eq("status", "ready"),
    supabase.from("activity_logs")
      .select("id, action, entity_type, entity_id, metadata, created_at")
      .eq("organization_id", orgId)
      .order("created_at", { ascending: false })
      .limit(8),
  ]);

  const now = new Date();

  // KPIs
  const totalClients  = clientRows?.length ?? 0;
  const activeClients = clientRows?.filter(c => c.status === "active").length ?? 0;
  const totalMrr      = clientRows?.reduce((s, c) => s + (c.mrr_cents ?? 0), 0) ?? 0;

  const activeProjects = projectRows?.filter(p => p.status === "active").length ?? 0;
  const overdueProjects = projectRows?.filter(p =>
    p.deadline && new Date(p.deadline) < now && p.status !== "completed" && p.status !== "canceled"
  ).length ?? 0;

  const openInvoices    = invoiceRows?.filter(i => i.status === "pending" || i.status === "overdue").length ?? 0;
  const overdueInvoices = invoiceRows?.filter(i => i.status === "overdue").length ?? 0;
  const totalBilled     = invoiceRows?.filter(i => i.status !== "draft" && i.status !== "void")
    .reduce((s, i) => s + (i.total_cents ?? 0), 0) ?? 0;

  const totalDocuments = documentRows?.length ?? 0;

  const firstName = profile.full_name?.split(" ")[0] ?? "there";

  const kpis = [
    {
      label: "Active clients",
      value: String(activeClients),
      sub: `${totalClients} total`,
      icon: "ti-users",
      color: "#4f46e5",
      href: "/dashboard/clients",
    },
    {
      label: "Active projects",
      value: String(activeProjects),
      sub: overdueProjects > 0 ? `${overdueProjects} overdue` : "On track",
      subRed: overdueProjects > 0,
      icon: "ti-layout-kanban",
      color: "#0891b2",
      href: "/dashboard/projects",
    },
    {
      label: "Open invoices",
      value: String(openInvoices),
      sub: overdueInvoices > 0 ? `${overdueInvoices} overdue` : "All current",
      subRed: overdueInvoices > 0,
      icon: "ti-receipt",
      color: "#d97706",
      href: "/dashboard/invoices",
    },
    {
      label: "Monthly revenue",
      value: formatCurrency(totalMrr),
      sub: `${formatCurrency(totalBilled)} billed total`,
      icon: "ti-trending-up",
      color: "#059669",
      href: "/dashboard/invoices",
    },
  ];

  function activityIcon(entityType: string) {
    if (entityType === "client")   return { icon: "ti-user-plus",    color: "#4f46e5" };
    if (entityType === "project")  return { icon: "ti-layout-kanban", color: "#0891b2" };
    if (entityType === "invoice")  return { icon: "ti-receipt",       color: "#d97706" };
    if (entityType === "document") return { icon: "ti-file-upload",   color: "#059669" };
    return { icon: "ti-activity", color: "#6b7280" };
  }

  function fmtRelative(ts: string) {
    const diff = (now.getTime() - new Date(ts).getTime()) / 1000;
    if (diff < 60)   return "just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  }

  return (
    <div style={{ minHeight: "calc(100vh - 57px)", background: "var(--pf-surface)" }}>
      <PageHeader
        title={`Good ${now.getHours() < 12 ? "morning" : now.getHours() < 17 ? "afternoon" : "evening"}, ${firstName}`}
        subtitle="Here's what's happening with your workspace today."
      />

      <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 20 }}>

        {/* KPI cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14 }}>
          {kpis.map(k => (
            <Link
              key={k.label}
              href={k.href}
              style={{ textDecoration: "none" }}
            >
              <div
                style={{
                  background: "#fff",
                  border: "1px solid var(--pf-line)",
                  borderRadius: 12,
                  padding: "18px 20px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 12.5, color: "var(--pf-text-2)", fontWeight: 500 }}>{k.label}</span>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: `${k.color}14`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <i className={`ti ${k.icon}`} style={{ fontSize: 16, color: k.color }} />
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 26, fontWeight: 700, color: "var(--pf-text)", fontFamily: "var(--font-inter-tight)", lineHeight: 1 }}>
                    {k.value}
                  </div>
                  <div style={{ fontSize: 12, color: k.subRed ? "#dc2626" : "var(--pf-text-3)", marginTop: 4 }}>
                    {k.sub}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Bottom row */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 14 }}>

          {/* Recent activity */}
          <div style={{ background: "#fff", border: "1px solid var(--pf-line)", borderRadius: 12, overflow: "hidden" }}>
            <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--pf-line)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: "var(--pf-text)" }}>Recent activity</span>
            </div>
            <div style={{ padding: "4px 0" }}>
              {(recentActivity ?? []).length === 0 ? (
                <div style={{ padding: "40px 20px", textAlign: "center", color: "var(--pf-text-3)", fontSize: 13 }}>
                  No activity yet — create a client to get started.
                </div>
              ) : (recentActivity ?? []).map(a => {
                const { icon, color } = activityIcon(a.entity_type ?? "");
                const meta = (a.metadata ?? {}) as Record<string, unknown>;
                return (
                  <div
                    key={a.id}
                    style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "11px 20px", borderBottom: "1px solid var(--pf-line)" }}
                  >
                    <div style={{ width: 30, height: 30, borderRadius: 8, background: `${color}12`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                      <i className={`ti ${icon}`} style={{ fontSize: 14, color }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, color: "var(--pf-text)", lineHeight: 1.4 }}>
                        <span style={{ fontWeight: 500 }}>{String(meta.actor_name ?? "Someone")}</span>
                        {" "}{String(a.action ?? "performed an action")}
                        {meta.name ? <span style={{ fontWeight: 500 }}> {String(meta.name)}</span> : null}
                      </div>
                      <div style={{ fontSize: 11.5, color: "var(--pf-text-3)", marginTop: 2 }}>
                        {fmtRelative(a.created_at)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick actions + stats */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

            {/* Quick actions */}
            <div style={{ background: "#fff", border: "1px solid var(--pf-line)", borderRadius: 12, overflow: "hidden" }}>
              <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--pf-line)" }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: "var(--pf-text)" }}>Quick actions</span>
              </div>
              <div style={{ padding: 12, display: "flex", flexDirection: "column", gap: 6 }}>
                {[
                  { href: "/dashboard/clients",             icon: "ti-user-plus",    label: "Add a client",     color: "#4f46e5" },
                  { href: "/dashboard/projects/new",        icon: "ti-plus",         label: "New project",      color: "#0891b2" },
                  { href: "/dashboard/documents",           icon: "ti-upload",       label: "Upload document",  color: "#059669" },
                  { href: "/dashboard/settings/billing",    icon: "ti-credit-card",  label: "Manage billing",   color: "#d97706" },
                ].map(a => (
                  <Link
                    key={a.label}
                    href={a.href}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "9px 10px",
                      borderRadius: 8,
                      textDecoration: "none",
                      color: "var(--pf-text)",
                      fontSize: 13,
                      transition: "background .12s",
                    }}
                  >
                    <div style={{ width: 28, height: 28, borderRadius: 7, background: `${a.color}14`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <i className={`ti ${a.icon}`} style={{ fontSize: 14, color: a.color }} />
                    </div>
                    {a.label}
                    <i className="ti ti-chevron-right" style={{ marginLeft: "auto", fontSize: 13, color: "var(--pf-text-3)" }} />
                  </Link>
                ))}
              </div>
            </div>

            {/* Workspace stats */}
            <div style={{ background: "#fff", border: "1px solid var(--pf-line)", borderRadius: 12, padding: "16px 20px" }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: "var(--pf-text)", marginBottom: 14 }}>At a glance</div>
              {[
                { label: "Documents",      value: String(totalDocuments), icon: "ti-file-text",    color: "#6366f1" },
                { label: "Clients",        value: String(totalClients),   icon: "ti-users",        color: "#4f46e5" },
                { label: "Total billed",   value: formatCurrency(totalBilled), icon: "ti-receipt",    color: "#059669" },
              ].map(s => (
                <div key={s.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "7px 0", borderBottom: "1px solid var(--pf-line)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <i className={`ti ${s.icon}`} style={{ fontSize: 14, color: s.color }} />
                    <span style={{ fontSize: 12.5, color: "var(--pf-text-2)" }}>{s.label}</span>
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "var(--pf-text)" }}>{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
