import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import ProjectForm from "@/components/dashboard/projects/project-form";

interface PageProps {
  searchParams: Promise<{ client_id?: string }>;
}

export default async function NewProjectPage({ searchParams }: PageProps) {
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
  const role = profile.role as string;

  if (!["owner", "admin", "manager"].includes(role)) {
    redirect("/dashboard/projects");
  }

  const { data: clients } = await supabase
    .from("clients")
    .select("id, name")
    .eq("organization_id", orgId)
    .is("deleted_at", null)
    .order("name");

  return (
    <ProjectForm
      clients={(clients ?? []) as { id: string; name: string }[]}
      defaultClientId={params.client_id}
    />
  );
}
