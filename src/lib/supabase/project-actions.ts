"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { ProjectStatus, ProjectPriority } from "@/types/app.types";
import { createNotification } from "@/lib/supabase/notification-actions";

export type ProjectActionState = {
  error?: string;
  fieldErrors?: Record<string, string>;
} | null;

async function getOrgAndUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data: profile } = await supabase
    .from("profiles")
    .select("organization_id, role")
    .eq("id", user.id)
    .single();
  if (!profile) throw new Error("Profile not found");

  return { supabase, user, profile, orgId: profile.organization_id as string };
}

export async function createProjectAction(
  _prev: ProjectActionState,
  formData: FormData
): Promise<ProjectActionState> {
  let createdId: string | undefined;
  try {
    const { supabase, user, orgId } = await getOrgAndUser();

    const name = (formData.get("name") as string | null)?.trim();
    const clientId = formData.get("client_id") as string | null;
    const description = (formData.get("description") as string | null)?.trim() || null;
    const status = (formData.get("status") as ProjectStatus) || "planning";
    const priority = (formData.get("priority") as ProjectPriority) || "medium";
    const progress = parseInt(formData.get("progress") as string) || 0;
    const startDate = (formData.get("start_date") as string | null) || null;
    const deadline = (formData.get("deadline") as string | null) || null;
    const budgetCents = Math.round(parseFloat((formData.get("budget") as string) || "0") * 100);
    const visibleToClient = formData.get("visible_to_client") === "true";

    if (!name) return { fieldErrors: { name: "Project name is required" } };
    if (!clientId) return { fieldErrors: { client_id: "Client is required" } };

    const { data: project, error } = await supabase
      .from("projects")
      .insert({
        organization_id: orgId,
        client_id: clientId,
        created_by: user.id,
        name,
        description,
        status,
        priority,
        progress: Math.min(100, Math.max(0, progress)),
        start_date: startDate || null,
        deadline: deadline || null,
        budget_cents: budgetCents,
        spent_cents: 0,
        visible_to_client: visibleToClient,
        tags: [],
      })
      .select("id")
      .single();

    if (error) throw error;
    createdId = project.id;

    await supabase.rpc("log_activity", {
      p_org_id: orgId,
      p_actor_id: user.id,
      p_entity_type: "project",
      p_entity_id: createdId,
      p_action: "created",
      p_description: `Created project "${name}"`,
    });

    createNotification(orgId, user.id, "project_created", `New project: ${name}`, `Status: ${status}`, "project", createdId);
  } catch (e) {
    return { error: (e as Error).message };
  }

  revalidatePath("/dashboard/projects");
  redirect(`/dashboard/projects/${createdId}`);
}

export async function updateProjectAction(
  _prev: ProjectActionState,
  formData: FormData
): Promise<ProjectActionState> {
  try {
    const { supabase, user, orgId } = await getOrgAndUser();

    const id = formData.get("id") as string;
    const name = (formData.get("name") as string | null)?.trim();
    const clientId = formData.get("client_id") as string | null;
    const description = (formData.get("description") as string | null)?.trim() || null;
    const status = formData.get("status") as ProjectStatus;
    const priority = formData.get("priority") as ProjectPriority;
    const progress = parseInt(formData.get("progress") as string) || 0;
    const startDate = (formData.get("start_date") as string | null) || null;
    const deadline = (formData.get("deadline") as string | null) || null;
    const budgetCents = Math.round(parseFloat((formData.get("budget") as string) || "0") * 100);
    const spentCents = Math.round(parseFloat((formData.get("spent") as string) || "0") * 100);
    const visibleToClient = formData.get("visible_to_client") === "true";

    if (!name) return { fieldErrors: { name: "Project name is required" } };
    if (!clientId) return { fieldErrors: { client_id: "Client is required" } };

    const { error } = await supabase
      .from("projects")
      .update({
        client_id: clientId,
        name,
        description,
        status,
        priority,
        progress: Math.min(100, Math.max(0, progress)),
        start_date: startDate || null,
        deadline: deadline || null,
        budget_cents: budgetCents,
        spent_cents: spentCents,
        visible_to_client: visibleToClient,
      })
      .eq("id", id)
      .eq("organization_id", orgId)
      .is("deleted_at", null);

    if (error) throw error;

    await supabase.rpc("log_activity", {
      p_org_id: orgId,
      p_actor_id: user.id,
      p_entity_type: "project",
      p_entity_id: id,
      p_action: "updated",
      p_description: `Updated project "${name}"`,
    });

    revalidatePath("/dashboard/projects");
    revalidatePath(`/dashboard/projects/${id}`);
    return null;
  } catch (e) {
    return { error: (e as Error).message };
  }
}

export async function deleteProjectAction(
  _prev: ProjectActionState,
  formData: FormData
): Promise<ProjectActionState> {
  try {
    const { supabase, user, orgId } = await getOrgAndUser();
    const id = formData.get("id") as string;

    const { data: project } = await supabase
      .from("projects")
      .select("name")
      .eq("id", id)
      .eq("organization_id", orgId)
      .single();

    const { error } = await supabase
      .from("projects")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", id)
      .eq("organization_id", orgId);

    if (error) throw error;

    await supabase.rpc("log_activity", {
      p_org_id: orgId,
      p_actor_id: user.id,
      p_entity_type: "project",
      p_entity_id: id,
      p_action: "deleted",
      p_description: `Deleted project "${project?.name ?? id}"`,
    });
  } catch (e) {
    if ((e as Error).message === "NEXT_REDIRECT") throw e;
    return { error: (e as Error).message };
  }

  revalidatePath("/dashboard/projects");
  redirect("/dashboard/projects");
}
