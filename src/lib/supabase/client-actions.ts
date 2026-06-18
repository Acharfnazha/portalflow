"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import type { ClientStatus } from "@/types/app.types";

export type ClientActionState = { error: string } | null;

// ── helpers ──────────────────────────────────────────────────────────────────

async function getOrgAndUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data: profile } = await supabase
    .from("profiles")
    .select("organization_id, role")
    .eq("id", user.id)
    .single();

  if (!profile?.organization_id) throw new Error("No organization");
  return { supabase, user, profile, orgId: profile.organization_id as string };
}

async function logActivity(
  orgId: string,
  actorId: string,
  entityId: string,
  action: string,
  description: string,
  changes?: { before?: unknown; after?: unknown }
) {
  try {
    const service = await createServiceClient();
    await service.from("activity_logs").insert({
      organization_id: orgId,
      actor_id: actorId,
      entity_type: "client",
      entity_id: entityId,
      action,
      description,
      changes: changes ?? null,
    });
  } catch {
    // Non-fatal — don't break the main action
  }
}

// ── createClient ─────────────────────────────────────────────────────────────

export async function createClientAction(
  _prev: ClientActionState,
  formData: FormData
): Promise<ClientActionState> {
  try {
    const { supabase, user, orgId } = await getOrgAndUser();

    const name = formData.get("name") as string;
    if (!name?.trim()) return { error: "Client name is required." };

    const tagsRaw = (formData.get("tags") as string) ?? "";
    const tags = tagsRaw.split(",").map(t => t.trim()).filter(Boolean);

    const mrrInput = formData.get("mrr") as string;
    const mrrCents = mrrInput ? Math.round(parseFloat(mrrInput) * 100) : 0;

    const { data: client, error } = await supabase
      .from("clients")
      .insert({
        organization_id: orgId,
        owner_id: user.id,
        name: name.trim(),
        email: (formData.get("email") as string) || null,
        phone: (formData.get("phone") as string) || null,
        website: (formData.get("website") as string) || null,
        domain: (formData.get("domain") as string) || null,
        status: (formData.get("status") as ClientStatus) || "new",
        industry: (formData.get("industry") as string) || null,
        company_size: (formData.get("company_size") as string) || null,
        location: (formData.get("location") as string) || null,
        tags,
        mrr_cents: mrrCents,
        notes: (formData.get("notes") as string) || null,
      })
      .select("id")
      .single();

    if (error) return { error: error.message };

    await logActivity(orgId, user.id, client.id, "created", `Created client ${name.trim()}`);

    revalidatePath("/dashboard/clients");
    return null;
  } catch (e) {
    return { error: (e as Error).message };
  }
}

// ── updateClient ─────────────────────────────────────────────────────────────

export async function updateClientAction(
  _prev: ClientActionState,
  formData: FormData
): Promise<ClientActionState> {
  try {
    const { supabase, user, orgId } = await getOrgAndUser();

    const id = formData.get("id") as string;
    if (!id) return { error: "Missing client ID." };

    const name = formData.get("name") as string;
    if (!name?.trim()) return { error: "Client name is required." };

    const tagsRaw = (formData.get("tags") as string) ?? "";
    const tags = tagsRaw.split(",").map(t => t.trim()).filter(Boolean);

    const mrrInput = formData.get("mrr") as string;
    const mrrCents = mrrInput ? Math.round(parseFloat(mrrInput) * 100) : 0;

    // Snapshot before for audit trail
    const { data: before } = await supabase
      .from("clients")
      .select("name, status, mrr_cents")
      .eq("id", id)
      .single();

    const { error } = await supabase
      .from("clients")
      .update({
        name: name.trim(),
        email: (formData.get("email") as string) || null,
        phone: (formData.get("phone") as string) || null,
        website: (formData.get("website") as string) || null,
        domain: (formData.get("domain") as string) || null,
        status: (formData.get("status") as ClientStatus) || "new",
        industry: (formData.get("industry") as string) || null,
        company_size: (formData.get("company_size") as string) || null,
        location: (formData.get("location") as string) || null,
        tags,
        mrr_cents: mrrCents,
        notes: (formData.get("notes") as string) || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("organization_id", orgId);

    if (error) return { error: error.message };

    await logActivity(orgId, user.id, id, "updated", `Updated client ${name.trim()}`, {
      before,
      after: { name: name.trim(), status: formData.get("status"), mrr_cents: mrrCents },
    });

    revalidatePath("/dashboard/clients");
    revalidatePath(`/dashboard/clients/${id}`);
    return null;
  } catch (e) {
    return { error: (e as Error).message };
  }
}

// ── deleteClient ─────────────────────────────────────────────────────────────

export async function deleteClientAction(
  _prev: ClientActionState,
  formData: FormData
): Promise<ClientActionState> {
  try {
    const { supabase, user, orgId } = await getOrgAndUser();

    const id = formData.get("id") as string;
    if (!id) return { error: "Missing client ID." };

    const { data: client } = await supabase
      .from("clients")
      .select("name")
      .eq("id", id)
      .single();

    const { error } = await supabase
      .from("clients")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", id)
      .eq("organization_id", orgId);

    if (error) return { error: error.message };

    await logActivity(orgId, user.id, id, "deleted", `Deleted client ${client?.name ?? id}`);

    revalidatePath("/dashboard/clients");
    redirect("/dashboard/clients");
  } catch (e) {
    if ((e as Error).message === "NEXT_REDIRECT") throw e;
    return { error: (e as Error).message };
  }
}
