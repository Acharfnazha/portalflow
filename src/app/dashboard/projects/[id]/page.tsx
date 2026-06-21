import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import type { Project, ProjectStatus, ProjectPriority } from "@/types/app.types";
import ProjectDetailShell from "@/components/dashboard/projects/project-detail-shell";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ProjectDetailPage({ params }: PageProps) {
  const { id } = await params;
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

  const { data: row } = await supabase
    .from("projects")
    .select("*, clients(id, name, email, company)")
    .eq("id", id)
    .eq("organization_id", profile.organization_id)
    .is("deleted_at", null)
    .single();

  if (!row) notFound();

  const project: Project = {
    id: row.id,
    organizationId: row.organization_id,
    clientId: row.client_id,
    createdBy: row.created_by ?? undefined,
    name: row.name,
    description: row.description ?? undefined,
    status: row.status as ProjectStatus,
    priority: row.priority as ProjectPriority,
    progress: row.progress ?? 0,
    startDate: row.start_date ?? undefined,
    deadline: row.deadline ?? undefined,
    budgetCents: row.budget_cents ?? 0,
    spentCents: row.spent_cents ?? 0,
    visibleToClient: row.visible_to_client ?? false,
    tags: row.tags ?? [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };

  const client = row.clients as {
    id: string;
    name: string;
    email?: string;
    company?: string;
  } | null;

  const { data: activityRows } = await supabase
    .from("client_activity_view")
    .select("*")
    .eq("entity_type", "project")
    .eq("entity_id", id)
    .order("created_at", { ascending: false })
    .limit(20);

  return (
    <ProjectDetailShell
      project={project}
      client={client}
      activity={activityRows ?? []}
      role={profile.role as string}
      orgId={profile.organization_id as string}
    />
  );
}
