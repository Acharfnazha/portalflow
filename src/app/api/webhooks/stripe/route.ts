import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getStripe, planFromPriceId } from "@/lib/stripe";
import { createServiceClient } from "@/lib/supabase/server";

// Disable body parsing so we get the raw body for signature verification
export const runtime = "nodejs";

async function getOrgIdForCustomer(
  customerId: string,
  service: Awaited<ReturnType<typeof createServiceClient>>
): Promise<string | null> {
  // 1. Check subscriptions table
  const { data: sub } = await service
    .from("subscriptions")
    .select("organization_id")
    .eq("stripe_customer_id", customerId)
    .single();
  if (sub?.organization_id) return sub.organization_id as string;

  // 2. Check organizations table
  const { data: org } = await service
    .from("organizations")
    .select("id")
    .eq("stripe_customer_id", customerId)
    .single();
  return (org?.id as string | null) ?? null;
}

async function upsertSubscription(
  sub: Stripe.Subscription,
  service: Awaited<ReturnType<typeof createServiceClient>>
) {
  // Get organization_id from metadata or customer lookup
  let orgId = (sub.metadata?.organization_id as string | undefined) ?? null;
  if (!orgId) {
    const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer.id;
    orgId = await getOrgIdForCustomer(customerId, service);
  }
  if (!orgId) return; // Can't associate — skip

  const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer.id;
  const priceId    = sub.items.data[0]?.price?.id ?? null;
  const plan       = (sub.metadata?.plan as string | undefined) ?? planFromPriceId(priceId ?? "") ?? "studio";

  // Use unknown cast for fields that vary between API versions
  const s = sub as unknown as Record<string, unknown>;
  const periodStart = (s.current_period_start as number | undefined)
    ?? (sub.items.data[0] as unknown as Record<string, unknown>)?.current_period_start as number | undefined;
  const periodEnd   = (s.current_period_end as number | undefined)
    ?? (sub.items.data[0] as unknown as Record<string, unknown>)?.current_period_end as number | undefined;

  const row = {
    organization_id:       orgId,
    stripe_subscription_id: sub.id,
    stripe_customer_id:    customerId,
    stripe_price_id:       priceId,
    plan,
    status:                sub.status,
    billing_interval:      sub.items.data[0]?.price?.recurring?.interval ?? "month",
    current_period_start:  periodStart ? new Date(periodStart * 1000).toISOString() : null,
    current_period_end:    periodEnd   ? new Date(periodEnd   * 1000).toISOString() : null,
    cancel_at_period_end:  sub.cancel_at_period_end,
    canceled_at:           sub.canceled_at
      ? new Date((sub.canceled_at as number) * 1000).toISOString()
      : null,
    updated_at:            new Date().toISOString(),
  };

  await service.from("subscriptions").upsert(row, { onConflict: "organization_id" });

  // Mirror plan & status onto the organization row
  await service
    .from("organizations")
    .update({
      stripe_customer_id:  customerId,
      subscription_status: sub.status,
    })
    .eq("id", orgId);
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig  = req.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "No stripe-signature header" }, { status: 400 });
  }

  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "STRIPE_WEBHOOK_SECRET not set" }, { status: 500 });
  }

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return NextResponse.json(
      { error: `Webhook signature verification failed: ${(err as Error).message}` },
      { status: 400 }
    );
  }

  const service = await createServiceClient();

  try {
    switch (event.type) {
      // ── Checkout completed ────────────────────────────────────
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode === "subscription" && session.subscription) {
          const subId = typeof session.subscription === "string"
            ? session.subscription
            : session.subscription.id;
          const sub = await getStripe().subscriptions.retrieve(subId);
          // Merge checkout metadata into subscription metadata
          if (session.metadata?.organization_id && !sub.metadata?.organization_id) {
            await getStripe().subscriptions.update(subId, {
              metadata: { ...sub.metadata, ...session.metadata },
            });
            sub.metadata = { ...sub.metadata, ...session.metadata };
          }
          await upsertSubscription(sub, service);
        }
        break;
      }

      // ── Subscription lifecycle ────────────────────────────────
      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        await upsertSubscription(sub, service);
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        await upsertSubscription(sub, service); // status will be "canceled"
        break;
      }

      // ── Invoice payment ───────────────────────────────────────
      case "invoice.payment_succeeded": {
        const inv   = event.data.object as unknown as Record<string, unknown>;
        const subId = typeof inv.subscription === "string"
          ? inv.subscription
          : (inv.subscription as { id: string } | null)?.id ?? null;

        if (subId) {
          await service
            .from("subscriptions")
            .update({ status: "active", updated_at: new Date().toISOString() })
            .eq("stripe_subscription_id", subId);
        }
        break;
      }

      case "invoice.payment_failed": {
        const inv   = event.data.object as unknown as Record<string, unknown>;
        const subId = typeof inv.subscription === "string"
          ? inv.subscription
          : (inv.subscription as { id: string } | null)?.id ?? null;

        if (subId) {
          await service
            .from("subscriptions")
            .update({ status: "past_due", updated_at: new Date().toISOString() })
            .eq("stripe_subscription_id", subId);
        }
        break;
      }

      // All other events — acknowledge and ignore
      default:
        break;
    }
  } catch (err) {
    console.error(`[stripe-webhook] Error handling ${event.type}:`, err);
    return NextResponse.json({ error: "Handler error" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
