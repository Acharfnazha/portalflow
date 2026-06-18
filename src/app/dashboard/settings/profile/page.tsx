import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProfileForm } from "@/components/dashboard/settings/profile-form";

export default async function ProfileSettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return (
    <div style={{ padding: "32px 36px", maxWidth: 700 }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: "var(--pf-text)", margin: "0 0 4px", letterSpacing: "-.3px" }}>
          Profile
        </h1>
        <p style={{ fontSize: 13.5, color: "var(--pf-text-2)", margin: 0 }}>
          Manage your personal information and preferences.
        </p>
      </div>

      <ProfileForm user={user} profile={profile} />
    </div>
  );
}
