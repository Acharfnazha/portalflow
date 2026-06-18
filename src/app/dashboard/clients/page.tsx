import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { can } from "@/lib/permissions";
import { ClientsShell } from "@/components/dashboard/clients/clients-shell";
import type { Client, ClientStatus } from "@/types/app.types";

const PAGE_SIZE = 10;

interface PageProps {
  searchParams: Promise<{ q?: string; status?: string; page?: string }>;
}

export default async function ClientsPage({ searchParams }: PageProps) {
  const { q = "", status = "", page: pageStr = "1" } = await searchParams;
  const page = Math.max(1, parseInt(pageStr, 10) || 1);

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("organization_id, role")
    .eq("id", user.id)
    .single();

  if (!profile?.organization_id) redirect("/dashboard");

  const orgId = profile.organization_id as string;
  const userRole = profile.role as "owner" | "admin" | "manager" | "staff";

  // Build query
  let query = supabase
    .from("clients")
    .select("*", { count: "exact" })
    .eq("organization_id", orgId)
    .is("deleted_at", null);

  if (q) query = query.ilike("name", `%${q}%`);
  if (status && status !== "all") query = query.eq("status", status as ClientStatus);

  const from = (page - 1) * PAGE_SIZE;
  const to   = from + PAGE_SIZE - 1;

  const { data: rows, count, error } = await query
    .order("updated_at", { ascending: false })
    .range(from, to);

  if (error) {
    console.error("clients fetch error:", error);
  }

  // Get owner names from profiles
  const ownerIds = [...new Set((rows ?? []).map(r => r.owner_id).filter(Boolean))] as string[];
  const ownerMap: Record<string, string> = {};
  if (ownerIds.length) {
    const { data: ownerProfiles } = await supabase
      .from("profiles")
      .select("id, full_name")
      .in("id", ownerIds);
    ownerProfiles?.forEach(p => { ownerMap[p.id] = p.full_name ?? ""; });
  }

  // Map DB rows to Client type
  const clients: (Client & { ownerName?: string })[] = (rows ?? []).map(r => ({
    id:           r.id,
    organizationId: r.organization_id,
    ownerId:      r.owner_id ?? undefined,
    name:         r.name,
    email:        r.email ?? undefined,
    phone:        r.phone ?? undefined,
    website:      r.website ?? undefined,
    domain:       r.domain ?? undefined,
    status:       r.status as ClientStatus,
    industry:     r.industry ?? undefined,
    companySize:  r.company_size ?? undefined,
    location:     r.location ?? undefined,
    avatarUrl:    r.avatar_url ?? undefined,
    tags:         r.tags ?? [],
    mrrCents:     r.mrr_cents,
    healthScore:  r.health_score,
    portalEnabled: r.portal_enabled,
    notes:        r.notes ?? undefined,
    createdAt:    r.created_at,
    updatedAt:    r.updated_at,
    ownerName:    r.owner_id ? ownerMap[r.owner_id] : undefined,
  }));

  // KPI counts (org-wide, not filtered)
  const { data: allClients } = await supabase
    .from("clients")
    .select("status, mrr_cents")
    .eq("organization_id", orgId)
    .is("deleted_at", null);

  const kpi = {
    total:        allClients?.length ?? 0,
    active:       allClients?.filter(c => c.status === "active").length ?? 0,
    atRisk:       allClients?.filter(c => c.status === "at_risk").length ?? 0,
    totalMrrCents: allClients?.reduce((s, c) => s + (c.mrr_cents ?? 0), 0) ?? 0,
  };

  const total      = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <ClientsShell
      clients={clients}
      kpi={kpi}
      total={total}
      page={page}
      totalPages={totalPages}
      canManage={can.manageClients(userRole)}
    />
  );
}
