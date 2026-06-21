import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import type { Project, ProjectStatus, ProjectPriority } from "@/types/app.types";
import ProjectForm from "@/components/dashboard/projects/project-form";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProjectPage({ params }: PageProps) {
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

  const role = profile.role as string;
  if (!["owner", "admin", "manager"].includes(role)) {
    redirect(`/dashboard/projects/${id}`);
  }

  const { data: row } = await supabase
    .from("projects")
    .select("*")
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

  const { data: clients } = await supabase
    .from("clients")
    .select("id, name")
    .eq("organization_id", profile.organization_id)
    .is("deleted_at", null)
    .order("name");

  return (
    <ProjectForm
      project={project}
      clients={(clients ?? []) as { id: string; name: string }[]}
    />
  );
}
