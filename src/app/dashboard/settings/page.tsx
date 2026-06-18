import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/shared/page-header";
import { SettingsNav } from "@/components/dashboard/settings/settings-nav";
import { OrgSettingsForm } from "@/components/dashboard/settings/org-settings-form";

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("organization_id, role")
    .eq("id", user.id)
    .single();

  const { data: org } = profile?.organization_id
    ? await supabase
        .from("organizations")
        .select("name, slug, website, timezone, plan")
        .eq("id", profile.organization_id)
        .single()
    : { data: null };

  const fallbackOrg = {
    name: "My Organization",
    slug: "my-org",
    website: null,
    timezone: "UTC",
    plan: "studio",
  };

  return (
    <div style={{ minHeight: "calc(100vh - 57px)", background: "var(--pf-surface)" }}>
      <PageHeader title="Settings" subtitle="Manage your workspace preferences" />

      <div style={{ display: "flex", padding: 20, gap: 20, alignItems: "flex-start" }}>
        <SettingsNav />

        <div style={{ flex: 1, background: "#fff", border: "1px solid var(--pf-line)", borderRadius: 12, overflow: "hidden" }}>
          <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--pf-line)" }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--pf-text)", margin: 0 }}>
              General
            </h2>
            <p style={{ fontSize: 13, color: "var(--pf-text-3)", margin: "3px 0 0" }}>
              Workspace name, logo, and timezone settings.
            </p>
          </div>
          <OrgSettingsForm
            org={org ?? fallbackOrg}
            isOwner={profile?.role === "owner"}
          />
        </div>
      </div>
    </div>
  );
}
