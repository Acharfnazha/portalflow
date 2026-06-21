"use server";

import { createClient, createServiceClient } from "@/lib/supabase/server";
import { getStripe, getPriceId, stripeIsConfigured } from "@/lib/stripe";

type ActionResult = { url?: string; error?: string };

// ── Shared auth helper ────────────────────────────────────────────────────────

async function getOwnerContext() {
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

  if (profile?.role !== "owner") throw new Error("Only workspace owners can manage billing");
  if (!profile.organization_id) throw new Error("No organization");

  return { user, orgId: profile.organization_id as string };
}

// ── Ensure Stripe customer exists for the org ─────────────────────────────────

async function ensureStripeCustomer(orgId: string, userId: string): Promise<string> {
  const stripe  = getStripe();
  const service = await createServiceClient();

  const { data: org } = await service
    .from("organizations")
    .select("name, stripe_customer_id")
    .eq("id", orgId)
    .single();

  if (org?.stripe_customer_id) return org.stripe_customer_id as string;

  // Get user email from auth
  const {
    data: { user: authUser },
  } = await service.auth.admin.getUserById(userId);

  const customer = await stripe.customers.create({
    email:    authUser?.email,
    name:     (org?.name as string | null) ?? undefined,
    metadata: { organization_id: orgId },
  });

  await service
    .from("organizations")
    .update({ stripe_customer_id: customer.id })
    .eq("id", orgId);

  return customer.id;
}

// ── Create Stripe checkout session (new subscriptions) ────────────────────────

export async function createCheckoutSessionAction(
  _prev: unknown,
  formData: FormData
): Promise<ActionResult> {
  if (!stripeIsConfigured()) {
    return { error: "STRIPE_NOT_CONFIGURED" };
  }

  try {
    const { user, orgId } = await getOwnerContext();
    const plan            = formData.get("plan") as string;
    const interval        = (formData.get("interval") as string) || "month";

    const priceId = getPriceId(plan, interval);
    if (!priceId) return { error: `Price ID not configured for ${plan}/${interval}. Add STRIPE_PRICE_${plan.toUpperCase()}_${interval === "year" ? "YEARLY" : "MONTHLY"} to your environment.` };

    const customerId = await ensureStripeCustomer(orgId, user.id);
    const siteUrl    = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3001";

    const session = await getStripe().checkout.sessions.create({
      customer:     customerId,
      mode:         "subscription",
      line_items:   [{ price: priceId, quantity: 1 }],
      success_url:  `${siteUrl}/dashboard/settings/billing?success=true`,
      cancel_url:   `${siteUrl}/dashboard/settings/billing?canceled=true`,
      metadata:     { organization_id: orgId, plan },
      subscription_data: {
        metadata: { organization_id: orgId, plan },
      },
      allow_promotion_codes: true,
    });

    return { url: session.url! };
  } catch (e) {
    return { error: (e as Error).message };
  }
}

// ── Change plan (for existing subscribers) ────────────────────────────────────

export async function changePlanAction(
  _prev: unknown,
  formData: FormData
): Promise<ActionResult> {
  if (!stripeIsConfigured()) {
    return { error: "STRIPE_NOT_CONFIGURED" };
  }

  try {
    const { orgId }  = await getOwnerContext();
    const newPlan    = formData.get("plan") as string;
    const interval   = (formData.get("interval") as string) || "month";

    const priceId = getPriceId(newPlan, interval);
    if (!priceId) return { error: `Price ID not configured for ${newPlan}/${interval}.` };

    const service = await createServiceClient();
    const { data: sub } = await service
      .from("subscriptions")
      .select("stripe_subscription_id")
      .eq("organization_id", orgId)
      .single();

    if (!sub?.stripe_subscription_id) {
      return { error: "No active subscription found. Use checkout to start a new subscription." };
    }

    const stripe         = getStripe();
    const stripeSub      = await stripe.subscriptions.retrieve(sub.stripe_subscription_id as string);
    const itemId         = stripeSub.items.data[0]?.id;

    if (!itemId) return { error: "Could not find subscription item" };

    await stripe.subscriptions.update(sub.stripe_subscription_id as string, {
      items:               [{ id: itemId, price: priceId }],
      proration_behavior:  "create_prorations",
      metadata:            { plan: newPlan },
    });

    // Optimistic local update — webhook will confirm
    await service
      .from("subscriptions")
      .update({ plan: newPlan, stripe_price_id: priceId, billing_interval: interval })
      .eq("organization_id", orgId);

    return { url: `/dashboard/settings/billing?success=true` };
  } catch (e) {
    return { error: (e as Error).message };
  }
}

// ── Open Stripe billing portal ────────────────────────────────────────────────

export async function createBillingPortalAction(): Promise<ActionResult> {
  if (!stripeIsConfigured()) {
    return { error: "STRIPE_NOT_CONFIGURED" };
  }

  try {
    const { user, orgId } = await getOwnerContext();
    const customerId      = await ensureStripeCustomer(orgId, user.id);
    const siteUrl         = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3001";

    const session = await getStripe().billingPortal.sessions.create({
      customer:   customerId,
      return_url: `${siteUrl}/dashboard/settings/billing`,
    });

    return { url: session.url };
  } catch (e) {
    return { error: (e as Error).message };
  }
}

// ── Cancel subscription at period end ────────────────────────────────────────

export async function cancelSubscriptionAction(): Promise<{ error?: string }> {
  if (!stripeIsConfigured()) {
    return { error: "STRIPE_NOT_CONFIGURED" };
  }

  try {
    const { orgId } = await getOwnerContext();
    const service   = await createServiceClient();

    const { data: sub } = await service
      .from("subscriptions")
      .select("stripe_subscription_id")
      .eq("organization_id", orgId)
      .single();

    if (!sub?.stripe_subscription_id) {
      return { error: "No active subscription found" };
    }

    await getStripe().subscriptions.update(sub.stripe_subscription_id as string, {
      cancel_at_period_end: true,
    });

    await service
      .from("subscriptions")
      .update({ cancel_at_period_end: true })
      .eq("organization_id", orgId);

    return {};
  } catch (e) {
    return { error: (e as Error).message };
  }
}

// ── Resume canceled subscription ──────────────────────────────────────────────

export async function resumeSubscriptionAction(): Promise<{ error?: string }> {
  if (!stripeIsConfigured()) return { error: "STRIPE_NOT_CONFIGURED" };

  try {
    const { orgId } = await getOwnerContext();
    const service   = await createServiceClient();

    const { data: sub } = await service
      .from("subscriptions")
      .select("stripe_subscription_id")
      .eq("organization_id", orgId)
      .single();

    if (!sub?.stripe_subscription_id) return { error: "No subscription found" };

    await getStripe().subscriptions.update(sub.stripe_subscription_id as string, {
      cancel_at_period_end: false,
    });

    await service
      .from("subscriptions")
      .update({ cancel_at_period_end: false })
      .eq("organization_id", orgId);

    return {};
  } catch (e) {
    return { error: (e as Error).message };
  }
}
