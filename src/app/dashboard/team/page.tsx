import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/shared/page-header";
import { TeamClient } from "@/components/dashboard/team/team-client";

export default async function TeamPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("organization_id, role")
    .eq("id", user.id)
    .single();

  if (!profile?.organization_id) {
    return (
      <div style={{ minHeight: "calc(100vh - 57px)", background: "var(--pf-surface)" }}>
        <PageHeader title="Team" subtitle="Manage your team members and invitations" />
        <div style={{ padding: 24, textAlign: "center", color: "var(--pf-text-3)", fontSize: 14 }}>
          You are not part of any organization.
        </div>
      </div>
    );
  }

  const [{ data: members }, { data: invitations }] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, full_name, email:id, role, job_title, avatar_url")
      .eq("organization_id", profile.organization_id)
      .order("role"),
    supabase
      .from("invitations")
      .select("id, email, role, invited_at:created_at, expires_at")
      .eq("organization_id", profile.organization_id)
      .is("accepted_at", null)
      .gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false }),
  ]);

  // Fetch emails from auth.users for each member via service client
  const { createServiceClient } = await import("@/lib/supabase/server");
  const service = await createServiceClient();
  const memberIds = (members ?? []).map((m) => m.id);
  const emailMap: Record<string, string> = {};

  if (memberIds.length > 0) {
    const { data: users } = await service.auth.admin.listUsers({ perPage: 200 });
    for (const u of users?.users ?? []) {
      if (memberIds.includes(u.id)) {
        emailMap[u.id] = u.email ?? "";
      }
    }
  }

  const enrichedMembers = (members ?? []).map((m) => ({
    ...m,
    email: emailMap[m.id] ?? "",
  }));

  return (
    <div style={{ minHeight: "calc(100vh - 57px)", background: "var(--pf-surface)" }}>
      <PageHeader title="Team" subtitle="Manage your team members and invitations" />
      <TeamClient
        members={enrichedMembers}
        invitations={invitations ?? []}
        currentUserId={user.id}
        currentUserRole={profile.role as "owner" | "admin" | "manager" | "staff"}
      />
    </div>
  );
}
