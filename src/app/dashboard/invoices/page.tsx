import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { InvoicesDashboard } from "@/components/dashboard/invoices/invoices-dashboard";
import { getMonthlyRevenueAction } from "@/lib/supabase/invoice-actions";

export default async function InvoicesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("organization_id, role")
    .eq("id", user.id)
    .single();
  if (!profile?.organization_id) redirect("/dashboard");

  const orgId   = profile.organization_id as string;
  const canEdit = ["owner", "admin", "manager"].includes(profile.role as string);

  const [
    { data: invoiceRows },
    { data: clientRows },
    { data: projectRows },
    revenueData,
  ] = await Promise.all([
    supabase
      .from("invoices")
      .select("id, invoice_number, status, total_cents, issued_at, due_at, paid_at, client_id, project_id, clients(name), projects(name)")
      .eq("organization_id", orgId)
      .is("deleted_at", null)
      .order("created_at", { ascending: false }),

    supabase
      .from("clients")
      .select("id, name")
      .eq("organization_id", orgId)
      .is("deleted_at", null)
      .order("name"),

    supabase
      .from("projects")
      .select("id, name, client_id")
      .eq("organization_id", orgId)
      .is("deleted_at", null)
      .order("name"),

    getMonthlyRevenueAction(orgId, 6),
  ]);

  const invoices = (invoiceRows ?? []).map((r) => {
    const client  = r.clients  as unknown as { name: string } | null;
    const project = r.projects as unknown as { name: string } | null;
    return {
      id:          r.id as string,
      number:      r.invoice_number as string,
      status:      r.status as string,
      totalCents:  (r.total_cents as number) ?? 0,
      issuedAt:    r.issued_at  as string | null,
      dueAt:       r.due_at     as string | null,
      paidAt:      r.paid_at    as string | null,
      clientId:    r.client_id  as string,
      clientName:  client?.name  ?? "Unknown client",
      projectName: project?.name ?? null,
    };
  });

  const clients = (clientRows ?? []) as { id: string; name: string }[];

  const projects = (projectRows ?? []).map((p) => ({
    id:       p.id       as string,
    name:     p.name     as string,
    clientId: p.client_id as string,
  }));

  return (
    <InvoicesDashboard
      invoices={invoices}
      clients={clients}
      projects={projects}
      canEdit={canEdit}
      orgId={orgId}
      revenueData={revenueData}
    />
  );
}
