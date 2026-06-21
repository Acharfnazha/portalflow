// Server-only — never import from client components.
import Stripe from "stripe";

let _stripe: Stripe | undefined;

export function getStripe(): Stripe {
  if (!_stripe) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error("STRIPE_SECRET_KEY is not configured");
    }
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2026-05-27.dahlia",
      typescript: true,
    });
  }
  return _stripe;
}

export function stripeIsConfigured() {
  return !!process.env.STRIPE_SECRET_KEY;
}

// Map our plan key → Stripe price ID (from env)
export function getPriceId(plan: string, interval: string): string | null {
  const key = `STRIPE_PRICE_${plan.toUpperCase()}_${interval === "year" ? "YEARLY" : "MONTHLY"}`;
  return process.env[key] ?? null;
}

// Map Stripe price ID → our plan key
export function planFromPriceId(priceId: string): string | null {
  const plans = ["studio", "agency", "enterprise"];
  const intervals = ["MONTHLY", "YEARLY"];
  for (const p of plans) {
    for (const i of intervals) {
      if (process.env[`STRIPE_PRICE_${p.toUpperCase()}_${i}`] === priceId) return p;
    }
  }
  return null;
}
