import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import type { Document, DocumentFileType } from "@/types/app.types";
import DocumentsShell from "@/components/dashboard/documents/documents-shell";

interface PageProps {
  searchParams: Promise<{
    q?: string;
    type?: string;
    client_id?: string;
    project_id?: string;
  }>;
}

function mapRow(row: Record<string, unknown>): Document {
  return {
    id:              row.id as string,
    organizationId:  row.organization_id as string,
    clientId:        (row.client_id as string) || undefined,
    projectId:       (row.project_id as string) || undefined,
    uploadedBy:      (row.uploaded_by as string) || undefined,
    name:            row.name as string,
    filePath:        row.file_path as string,
    fileType:        (row.file_type as DocumentFileType) || "other",
    mimeType:        (row.mime_type as string) || undefined,
    sizeBytes:       (row.size_bytes as number) ?? 0,
    version:         (row.version as number) ?? 1,
    status:          (row.status as "processing" | "ready" | "quarantined" | "deleted") ?? "ready",
    visibleToClient: (row.visible_to_client as boolean) ?? false,
    tags:            (row.tags as string[]) ?? [],
    createdAt:       row.created_at as string,
    updatedAt:       row.updated_at as string,
  };
}

export default async function DocumentsPage({ searchParams }: PageProps) {
  const params  = await searchParams;
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

  // ── Fetch documents with optional filters ────────────────────────────
  let query = supabase
    .from("documents")
    .select("*, clients(id, name), projects(id, name)")
    .eq("organization_id", orgId)
    .is("deleted_at", null)
    .eq("status", "ready")
    .order("created_at", { ascending: false });

  if (params.type && params.type !== "all") {
    query = query.eq("file_type", params.type);
  }
  if (params.q?.trim()) {
    query = query.ilike("name", `%${params.q.trim()}%`);
  }
  if (params.client_id) {
    query = query.eq("client_id", params.client_id);
  }
  if (params.project_id) {
    query = query.eq("project_id", params.project_id);
  }

  const { data: rows } = await query;
  const documents = (rows ?? []).map(mapRow);

  // Build lookup maps for display
  const clientNames: Record<string, string> = {};
  const projectNames: Record<string, string> = {};
  (rows ?? []).forEach((r) => {
    const c = r.clients as { id: string; name: string } | null;
    const p = r.projects as { id: string; name: string } | null;
    if (c) clientNames[c.id] = c.name;
    if (p) projectNames[p.id] = p.name;
  });

  // Fetch all clients + projects for filter dropdowns
  const [{ data: clients }, { data: projects }] = await Promise.all([
    supabase
      .from("clients")
      .select("id, name")
      .eq("organization_id", orgId)
      .is("deleted_at", null)
      .order("name"),
    supabase
      .from("projects")
      .select("id, name")
      .eq("organization_id", orgId)
      .is("deleted_at", null)
      .order("name"),
  ]);

  // Total count (unfiltered) for KPI
  const { count: totalCount } = await supabase
    .from("documents")
    .select("*", { count: "exact", head: true })
    .eq("organization_id", orgId)
    .is("deleted_at", null)
    .eq("status", "ready");

  return (
    <DocumentsShell
      documents={documents}
      clientNames={clientNames}
      projectNames={projectNames}
      clients={(clients ?? []) as { id: string; name: string }[]}
      projects={(projects ?? []) as { id: string; name: string }[]}
      totalCount={totalCount ?? 0}
      role={profile.role as string}
      orgId={orgId}
      initialSearch={params.q ?? ""}
      initialType={params.type ?? ""}
      initialClientId={params.client_id ?? ""}
      initialProjectId={params.project_id ?? ""}
    />
  );
}
