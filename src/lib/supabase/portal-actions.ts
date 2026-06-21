"use server";

import { createClient, createServiceClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { DocumentFileType } from "@/types/app.types";

// â"€â"€ Shared type for portal page data â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€

export interface PortalContext {
  client: {
    id: string;
    name: string;
    email?: string;
    website?: string;
    avatarUrl?: string;
  };
  org: {
    name: string;
    logoUrl?: string;
    website?: string;
  };
}

// â"€â"€ Look up client by portal token (no auth required) â"€â"€â"€â"€â"€â"€â"€â"€

export async function getPortalContext(token: string): Promise<PortalContext | null> {
  try {
  const supabase = await createServiceClient();

  const { data } = await supabase
    .from("clients")
    .select("id, name, email, website, avatar_url, organization_id, organizations(name, logo_url, website)")
    .eq("portal_token", token)
    .eq("portal_enabled", true)
    .is("deleted_at", null)
    .single();

  if (!data) return null;

  const org = data.organizations as unknown as { name: string; logo_url?: string; website?: string } | null;

  return {
    client: {
      id:        data.id,
      name:      data.name,
      email:     data.email   || undefined,
      website:   data.website || undefined,
      avatarUrl: data.avatar_url || undefined,
    },
    org: {
      name:    org?.name    ?? "Agency",
      logoUrl: org?.logo_url ?? undefined,
      website: org?.website  ?? undefined,
    },
  };
  } catch {
    return null;
  }
}

// â"€â"€ Fetch portal projects â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€

export async function getPortalProjects(clientId: string) {
  const supabase = await createServiceClient();
  const { data } = await supabase
    .from("projects")
    .select("id, name, status, priority, progress, deadline, description")
    .eq("client_id", clientId)
    .eq("visible_to_client", true)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });
  return data ?? [];
}

// â"€â"€ Fetch portal documents (with signed URLs) â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€

export async function getPortalDocuments(clientId: string) {
  const supabase = await createServiceClient();
  const { data } = await supabase
    .from("documents")
    .select("id, name, file_path, file_type, mime_type, size_bytes, created_at")
    .eq("client_id", clientId)
    .eq("visible_to_client", true)
    .is("deleted_at", null)
    .eq("status", "ready")
    .order("created_at", { ascending: false });

  if (!data?.length) return [];

  // Generate signed URLs in parallel
  const withUrls = await Promise.all(
    data.map(async (doc) => {
      const { data: signed } = await supabase.storage
        .from("documents")
        .createSignedUrl(doc.file_path as string, 3600, {
          download: doc.name as string,
        });
      return {
        id:          doc.id as string,
        name:        doc.name as string,
        filePath:    doc.file_path as string,
        fileType:    (doc.file_type as DocumentFileType) || "other",
        mimeType:    (doc.mime_type as string) || undefined,
        sizeBytes:   (doc.size_bytes as number) ?? 0,
        createdAt:   doc.created_at as string,
        signedUrl:   signed?.signedUrl ?? undefined,
      } satisfies {
        id: string; name: string; filePath: string;
        fileType: DocumentFileType; mimeType?: string;
        sizeBytes: number; createdAt: string; signedUrl?: string;
      };
    })
  );
  return withUrls;
}

// â"€â"€ Fetch portal invoices â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€

export async function getPortalInvoices(clientId: string) {
  const supabase = await createServiceClient();
  const { data } = await supabase
    .from("invoices")
    .select("id, invoice_number, status, total_cents, currency, issued_at, due_at, projects(name)")
    .eq("client_id", clientId)
    .not("status", "eq", "draft")
    .is("deleted_at", null)
    .order("created_at", { ascending: false });
  return data ?? [];
}

// â"€â"€ Dashboard: generate new portal token â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€

export type PortalActionState = { error?: string; token?: string } | null;

export async function generatePortalTokenAction(
  _prev: PortalActionState,
  formData: FormData
): Promise<PortalActionState> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Not authenticated" };

    const { data: profile } = await supabase
      .from("profiles")
      .select("organization_id, role")
      .eq("id", user.id)
      .single();

    if (!["owner", "admin", "manager"].includes(profile?.role ?? "")) {
      return { error: "Insufficient permissions" };
    }

    const clientId = formData.get("client_id") as string;

    // Use service client to update (bypass RLS for this write)
    const admin = await createServiceClient();
    const newToken = Buffer.from(crypto.getRandomValues(new Uint8Array(24))).toString("base64url");

    const { error } = await admin
      .from("clients")
      .update({ portal_token: newToken, updated_at: new Date().toISOString() })
      .eq("id", clientId)
      .eq("organization_id", profile?.organization_id as string);

    if (error) throw error;

    revalidatePath(`/dashboard/clients/${clientId}`);
    return { token: newToken };
  } catch (e) {
    return { error: (e as Error).message };
  }
}

// â"€â"€ Dashboard: toggle portal enabled â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€

export async function togglePortalEnabledAction(
  _prev: PortalActionState,
  formData: FormData
): Promise<PortalActionState> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Not authenticated" };

    const { data: profile } = await supabase
      .from("profiles")
      .select("organization_id, role")
      .eq("id", user.id)
      .single();

    if (!["owner", "admin", "manager"].includes(profile?.role ?? "")) {
      return { error: "Insufficient permissions" };
    }

    const clientId = formData.get("client_id") as string;
    const enabled  = formData.get("enabled") === "true";

    const { error } = await supabase
      .from("clients")
      .update({ portal_enabled: enabled, updated_at: new Date().toISOString() })
      .eq("id", clientId)
      .eq("organization_id", profile?.organization_id as string);

    if (error) throw error;

    revalidatePath(`/dashboard/clients/${clientId}`);
    return null;
  } catch (e) {
    return { error: (e as Error).message };
  }
}

