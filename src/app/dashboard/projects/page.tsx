import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import type { Project, ProjectStatus, ProjectPriority } from "@/types/app.types";
import ProjectsShell from "@/components/dashboard/projects/projects-shell";

interface PageProps {
  searchParams: Promise<{ q?: string; status?: string }>;
}

function mapRow(row: Record<string, unknown>): Project {
  return {
    id: row.id as string,
    organizationId: row.organization_id as string,
    clientId: row.client_id as string,
    createdBy: row.created_by as string | undefined,
    name: row.name as string,
    description: row.description as string | undefined,
    status: row.status as ProjectStatus,
    priority: row.priority as ProjectPriority,
    progress: (row.progress as number) ?? 0,
    startDate: row.start_date as string | undefined,
    deadline: row.deadline as string | undefined,
    budgetCents: (row.budget_cents as number) ?? 0,
    spentCents: (row.spent_cents as number) ?? 0,
    visibleToClient: (row.visible_to_client as boolean) ?? false,
    tags: (row.tags as string[]) ?? [],
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

export default async function ProjectsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("organization_id, role")
    .eq("id", user.id)
    .single();

  if (!profile?.organization_id) redirect("/dashboard");

  const orgId = profile.organization_id as string;
  const statusFilter = params.status as string | undefined;
  const search = params.q?.trim();

  let query = supabase
    .from("projects")
    .select("*, clients(id, name)")
    .eq("organization_id", orgId)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (statusFilter && statusFilter !== "all") {
    query = query.eq("status", statusFilter);
  }
  if (search) {
    query = query.ilike("name", `%${search}%`);
  }

  const { data: rows } = await query;
  const projects = (rows ?? []).map(mapRow);

  const clientNames: Record<string, string> = {};
  (rows ?? []).forEach((r) => {
    const c = r.clients as { id: string; name: string } | null;
    if (c) clientNames[c.id] = c.name;
  });

  const { data: clients } = await supabase
    .from("clients")
    .select("id, name")
    .eq("organization_id", orgId)
    .is("deleted_at", null)
    .order("name");

  const now = new Date();
  const kpis = {
    total: projects.length,
    active: projects.filter((p) => p.status === "active").length,
    completed: projects.filter((p) => p.status === "completed").length,
    overdue: projects.filter(
      (p) =>
        p.deadline &&
        new Date(p.deadline) < now &&
        p.status !== "completed" &&
        p.status !== "canceled"
    ).length,
  };

  return (
    <ProjectsShell
      projects={projects}
      clientNames={clientNames}
      clients={(clients ?? []) as { id: string; name: string }[]}
      kpis={kpis}
      role={profile.role as string}
      initialSearch={search ?? ""}
      initialStatus={statusFilter ?? ""}

    />
  );
}
