import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { stripeIsConfigured } from "@/lib/stripe";
import { PageHeader } from "@/components/shared/page-header";
import { SettingsNav } from "@/components/dashboard/settings/settings-nav";
import { BillingShell } from "@/components/dashboard/settings/billing-shell";

interface PageProps {
  searchParams: Promise<{ success?: string; canceled?: string }>;
}

export default async function BillingPage({ searchParams }: PageProps) {
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

  const orgId   = profile.organization_id as string;
  const isOwner = profile.role === "owner";

  // Fetch subscription row (maybeSingle — may not exist yet)
  const { data: sub } = await supabase
    .from("subscriptions")
    .select(
      "plan, status, billing_interval, current_period_end, cancel_at_period_end, stripe_subscription_id"
    )
    .eq("organization_id", orgId)
    .maybeSingle();

  const subData = sub
    ? {
        plan:                 sub.plan                as string,
        status:               sub.status              as string,
        billingInterval:      sub.billing_interval    as string,
        currentPeriodEnd:     sub.current_period_end  as string | null,
        cancelAtPeriodEnd:    sub.cancel_at_period_end as boolean,
        stripeSubscriptionId: sub.stripe_subscription_id as string | null,
      }
    : null;

  const { success, canceled } = await searchParams;

  return (
    <div style={{ minHeight: "calc(100vh - 57px)", background: "var(--pf-surface)" }}>
      <PageHeader title="Settings" subtitle="Manage your workspace preferences" />

      <div style={{ display: "flex", padding: 20, gap: 20, alignItems: "flex-start" }}>
        <SettingsNav />

        <BillingShell
          subscription={subData}
          isOwner={isOwner}
          stripeConfigured={stripeIsConfigured()}
          successParam={success === "true"}
          canceledParam={canceled === "true"}
        />
      </div>
    </div>
  );
}
