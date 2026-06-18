import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { can } from "@/lib/permissions";
import { ClientProfileShell } from "@/components/dashboard/client-profile/profile-shell";
import type { Client, ClientStatus } from "@/types/app.types";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ClientProfilePage({ params }: PageProps) {
  const { id } = await params;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("organization_id, role")
    .eq("id", user.id)
    .single();

  if (!profile?.organization_id) redirect("/dashboard");

  const orgId    = profile.organization_id as string;
  const userRole = profile.role as "owner" | "admin" | "manager" | "staff";

  const { data: row, error } = await supabase
    .from("clients")
    .select("*")
    .eq("id", id)
    .eq("organization_id", orgId)
    .is("deleted_at", null)
    .single();

  if (error || !row) notFound();

  let ownerName: string | undefined;
  if (row.owner_id) {
    const { data: ownerProfile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", row.owner_id)
      .single();
    ownerName = ownerProfile?.full_name ?? undefined;
  }

  const [{ count: projectCount }, { count: invoiceCount }, { count: docCount }] = await Promise.all([
    supabase.from("projects").select("*", { count: "exact", head: true }).eq("client_id", id).is("deleted_at", null),
    supabase.from("invoices").select("*", { count: "exact", head: true }).eq("client_id", id).is("deleted_at", null),
    supabase.from("documents").select("*", { count: "exact", head: true }).eq("client_id", id).is("deleted_at", null),
  ]);

  const client: Client & { ownerName?: string } = {
    id:            row.id,
    organizationId: row.organization_id,
    ownerId:       row.owner_id ?? undefined,
    name:          row.name,
    email:         row.email ?? undefined,
    phone:         row.phone ?? undefined,
    website:       row.website ?? undefined,
    domain:        row.domain ?? undefined,
    status:        row.status as ClientStatus,
    industry:      row.industry ?? undefined,
    companySize:   row.company_size ?? undefined,
    location:      row.location ?? undefined,
    avatarUrl:     row.avatar_url ?? undefined,
    tags:          row.tags ?? [],
    mrrCents:      row.mrr_cents,
    healthScore:   row.health_score,
    portalEnabled: row.portal_enabled,
    notes:         row.notes ?? undefined,
    createdAt:     row.created_at,
    updatedAt:     row.updated_at,
    ownerName,
  };

  return (
    <ClientProfileShell
      client={client}
      counts={{ projects: projectCount ?? 0, invoices: invoiceCount ?? 0, documents: docCount ?? 0 }}
      canManage={can.manageClients(userRole)}
    />
  );
}