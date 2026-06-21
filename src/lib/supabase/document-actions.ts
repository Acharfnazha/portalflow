"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { DocumentFileType } from "@/types/app.types";
import { createNotification } from "@/lib/supabase/notification-actions";

export type DocActionState = { error?: string } | null;

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

  if (!profile?.organization_id) throw new Error("No organization");
  return { supabase, user, profile, orgId: profile.organization_id as string };
}

// ── Create record (called after client-side storage upload) ──────────────────

export async function createDocumentRecord(data: {
  filePath: string;
  fileName: string;
  fileType: DocumentFileType;
  mimeType: string;
  sizeBytes: number;
  clientId?: string;
  projectId?: string;
  visibleToClient?: boolean;
}): Promise<{ id?: string; error?: string }> {
  try {
    const { supabase, user, orgId } = await getOrgAndUser();

    const { data: doc, error } = await supabase
      .from("documents")
      .insert({
        organization_id:  orgId,
        client_id:        data.clientId  || null,
        project_id:       data.projectId || null,
        uploaded_by:      user.id,
        name:             data.fileName,
        file_path:        data.filePath,
        file_type:        data.fileType,
        mime_type:        data.mimeType,
        size_bytes:       data.sizeBytes,
        status:           "ready",
        visible_to_client: data.visibleToClient ?? false,
        tags:             [],
      })
      .select("id")
      .single();

    if (error) throw error;

    revalidatePath("/dashboard/documents");
    if (data.clientId)  revalidatePath(`/dashboard/clients/${data.clientId}`);
    if (data.projectId) revalidatePath(`/dashboard/projects/${data.projectId}`);

    // Fire-and-forget notification
    createNotification(
      orgId,
      user.id,
      "document_uploaded",
      `Document uploaded: ${data.fileName}`,
      data.clientId ? `Linked to client` : "General document",
      "document",
      doc.id as string
    );

    return { id: doc.id as string };
  } catch (e) {
    return { error: (e as Error).message };
  }
}

// ── Generate signed download URL ─────────────────────────────────────────────

export async function getSignedUrlAction(
  docId: string
): Promise<{ url?: string; error?: string }> {
  try {
    const { supabase, orgId } = await getOrgAndUser();

    const { data: doc } = await supabase
      .from("documents")
      .select("file_path, name")
      .eq("id", docId)
      .eq("organization_id", orgId)
      .is("deleted_at", null)
      .single();

    if (!doc) return { error: "Document not found" };

    const { data, error } = await supabase.storage
      .from("documents")
      .createSignedUrl(doc.file_path as string, 3600, {
        download: doc.name as string,
      });

    if (error) throw error;
    return { url: data.signedUrl };
  } catch (e) {
    return { error: (e as Error).message };
  }
}

// ── Soft-delete document + remove from storage ───────────────────────────────

export async function deleteDocumentAction(
  _prev: DocActionState,
  formData: FormData
): Promise<DocActionState> {
  try {
    const { supabase, orgId } = await getOrgAndUser();
    const id = formData.get("id") as string;

    const { data: doc } = await supabase
      .from("documents")
      .select("file_path, client_id, project_id")
      .eq("id", id)
      .eq("organization_id", orgId)
      .single();

    if (!doc) return { error: "Document not found" };

    const { error: dbErr } = await supabase
      .from("documents")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", id)
      .eq("organization_id", orgId);

    if (dbErr) throw dbErr;

    // Best-effort storage removal — don't fail the request if the file is gone
    await supabase.storage
      .from("documents")
      .remove([doc.file_path as string])
      .catch(() => null);

    revalidatePath("/dashboard/documents");
    if (doc.client_id)  revalidatePath(`/dashboard/clients/${doc.client_id}`);
    if (doc.project_id) revalidatePath(`/dashboard/projects/${doc.project_id}`);

    return null;
  } catch (e) {
    return { error: (e as Error).message };
  }
}
