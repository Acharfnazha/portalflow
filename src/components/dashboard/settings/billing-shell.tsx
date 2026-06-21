"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  createCheckoutSessionAction,
  changePlanAction,
  createBillingPortalAction,
  cancelSubscriptionAction,
  resumeSubscriptionAction,
} from "@/lib/supabase/billing-actions";
import { useToast } from "@/stores/ui.store";
import { PLAN_CONFIG, type PlanKey } from "@/lib/constants";
import { formatCurrency } from "@/lib/format";

interface SubData {
  plan:                   string;
  status:                 string;
  billingInterval:        string;
  currentPeriodEnd?:      string | null;
  cancelAtPeriodEnd:      boolean;
  stripeSubscriptionId?:  string | null;
}

interface Props {
  subscription:     SubData | null;
  isOwner:          boolean;
  stripeConfigured: boolean;
  successParam?:    boolean;
  canceledParam?:   boolean;
}

const STATUS_STYLE: Record<string, { label: string; bg: string; color: string }> = {
  trialing:            { label: "Trial",      bg: "#eff6ff", color: "#1d4ed8" },
  active:              { label: "Active",     bg: "#f0fdf4", color: "#16a34a" },
  past_due:            { label: "Past due",   bg: "#fef2f2", color: "#dc2626" },
  canceled:            { label: "Canceled",   bg: "#f8fafc", color: "#475569" },
  paused:              { label: "Paused",     bg: "#fff7ed", color: "#c2410c" },
  incomplete:          { label: "Incomplete", bg: "#fff7ed", color: "#c2410c" },
  incomplete_expired:  { label: "Expired",    bg: "#f8fafc", color: "#475569" },
};

function fmtDate(s?: string | null) {
  if (!s) return null;
  return new Date(s).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

export function BillingShell({ subscription, isOwner, stripeConfigured, successParam, canceledParam }: Props) {
  const router              = useRouter();
  const { success, error: toastError, warning } = useToast();
  const [interval, setInterval] = useState<"month" | "year">(
    (subscription?.billingInterval as "month" | "year") ?? "month"
  );
  const [actionPlan,  setActionPlan]  = useState<string | null>(null);
  const [isPortal,    setIsPortal]    = useState(false);
  const [isCanceling, setIsCanceling] = useState(false);
  const [isResuming,  setIsResuming]  = useState(false);
  const [, startTransition]           = useTransition();

  const currentPlan   = subscription?.plan ?? null;
  const subStatus     = subscription?.status ?? null;
  const isActive      = subStatus === "active" || subStatus === "trialing";
  const isCanceled    = subscription?.cancelAtPeriodEnd ?? false;
  const renewalDate   = fmtDate(subscription?.currentPeriodEnd);
  const hasActiveSub  = !!subscription?.stripeSubscriptionId && isActive;
  const statusStyle   = subStatus ? STATUS_STYLE[subStatus] ?? STATUS_STYLE.active : null;

  function redirect(url: string) {
    if (url.startsWith("http")) {
      window.location.assign(url);
    } else {
      router.push(url);
      router.refresh();
    }
  }

  function handleUpgrade(planKey: PlanKey) {
    if (!isOwner) {
      warning("Permission denied", "Only workspace owners can manage billing.");
      return;
    }
    if (!stripeConfigured) {
      toastError("Stripe not configured", "Add STRIPE_SECRET_KEY to your environment to enable billing.");
      return;
    }

    setActionPlan(planKey);
    startTransition(async () => {
      const fd = new FormData();
      fd.append("plan",     planKey);
      fd.append("interval", interval);

      const result = hasActiveSub
        ? await changePlanAction(null, fd)
        : await createCheckoutSessionAction(null, fd);

      if (result?.error === "STRIPE_NOT_CONFIGURED") {
        toastError("Stripe not configured", "Add your Stripe keys to .env.local.");
      } else if (result?.error) {
        toastError("Billing error", result.error);
      } else if (result?.url) {
        success("Redirecting to Stripe…");
        redirect(result.url);
      }
      setActionPlan(null);
    });
  }

  function handleManageBilling() {
    if (!isOwner) {
      warning("Permission denied", "Only workspace owners can access billing settings.");
      return;
    }
    setIsPortal(true);
    startTransition(async () => {
      const result = await createBillingPortalAction();
      if (result?.error === "STRIPE_NOT_CONFIGURED") {
        toastError("Stripe not configured", "Add STRIPE_SECRET_KEY to your environment.");
      } else if (result?.error) {
        toastError("Billing error", result.error);
      } else if (result?.url) {
        window.location.href = result.url;
      }
      setIsPortal(false);
    });
  }

  function handleCancel() {
    if (!confirm("Cancel your subscription? You'll keep access until the end of the billing period.")) return;
    setIsCanceling(true);
    startTransition(async () => {
      const result = await cancelSubscriptionAction();
      if (result?.error) {
        toastError("Error", result.error);
      } else {
        success("Subscription canceled", "You'll keep access until " + (renewalDate ?? "period end") + ".");
        router.refresh();
      }
      setIsCanceling(false);
    });
  }

  function handleResume() {
    setIsResuming(true);
    startTransition(async () => {
      const result = await resumeSubscriptionAction();
      if (result?.error) {
        toastError("Error", result.error);
      } else {
        success("Subscription resumed", "Your subscription will renew as scheduled.");
        router.refresh();
      }
      setIsResuming(false);
    });
  }

  const planOrder: PlanKey[] = ["studio", "agency", "enterprise"];

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 14 }}>
      {/* Success / canceled banners */}
      {successParam && (
        <div
          style={{
            background:   "#f0fdf4",
            border:       "1px solid #bbf7d0",
            borderRadius: 10,
            padding:      "13px 18px",
            display:      "flex",
            alignItems:   "center",
            gap:          10,
            fontSize:     13.5,
            color:        "#166534",
          }}
        >
          <i className="ti ti-circle-check" aria-hidden style={{ fontSize: 18, color: "#16a34a" }} />
          <strong>Payment successful.</strong>&nbsp;Your plan has been updated.
        </div>
      )}
      {canceledParam && (
        <div
          style={{
            background:   "#fff7ed",
            border:       "1px solid #fed7aa",
            borderRadius: 10,
            padding:      "13px 18px",
            display:      "flex",
            alignItems:   "center",
            gap:          10,
            fontSize:     13.5,
            color:        "#9a3412",
          }}
        >
          <i className="ti ti-info-circle" aria-hidden style={{ fontSize: 18, color: "#c2410c" }} />
          Checkout was canceled. No charge was made.
        </div>
      )}

      {/* Stripe not configured notice */}
      {!stripeConfigured && (
        <div
          style={{
            background:   "#fff7ed",
            border:       "1px dashed #fb923c",
            borderRadius: 10,
            padding:      "14px 18px",
            fontSize:     13,
            color:        "#7c2d12",
          }}
        >
          <p style={{ margin: "0 0 6px", fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
            <i className="ti ti-alert-triangle" aria-hidden style={{ fontSize: 15 }} />
            Stripe not configured — billing is disabled
          </p>
          <p style={{ margin: 0, lineHeight: 1.55 }}>
            Add the following to your <code style={{ background: "#fed7aa", padding: "1px 5px", borderRadius: 3 }}>.env.local</code> to enable payments:
          </p>
          <pre
            style={{
              margin:     "8px 0 0",
              padding:    "10px 12px",
              background: "#ffedd5",
              borderRadius: 6,
              fontSize:   12,
              color:      "#7c2d12",
              overflowX:  "auto",
              fontFamily: "monospace",
            }}
          >{`STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_STUDIO_MONTHLY=price_...
STRIPE_PRICE_STUDIO_YEARLY=price_...
STRIPE_PRICE_AGENCY_MONTHLY=price_...
STRIPE_PRICE_AGENCY_YEARLY=price_...
STRIPE_PRICE_ENTERPRISE_MONTHLY=price_...
STRIPE_PRICE_ENTERPRISE_YEARLY=price_...`}</pre>
        </div>
      )}

      {/* Current plan card */}
      <div
        style={{
          background:   "#fff",
          border:       "1px solid var(--pf-line)",
          borderRadius: 12,
          overflow:     "hidden",
        }}
      >
        <div style={{ padding: "16px 22px", borderBottom: "1px solid var(--pf-line)" }}>
          <h2 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "var(--pf-text)" }}>
            Current plan
          </h2>
        </div>
        <div
          style={{
            padding:        "18px 22px",
            display:        "flex",
            alignItems:     "center",
            justifyContent: "space-between",
            gap:            16,
            flexWrap:       "wrap",
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <span
                style={{
                  fontSize:   19,
                  fontWeight: 700,
                  color:      "var(--pf-text)",
                  fontFamily: "var(--font-inter-tight)",
                }}
              >
                {currentPlan ? PLAN_CONFIG[currentPlan as PlanKey]?.name ?? currentPlan : "No active plan"}
              </span>
              {statusStyle && (
                <span
                  style={{
                    fontSize:     11.5,
                    fontWeight:   600,
                    padding:      "2px 9px",
                    borderRadius: 99,
                    background:   statusStyle.bg,
                    color:        statusStyle.color,
                  }}
                >
                  {isCanceled ? "Cancels " + (renewalDate ?? "soon") : statusStyle.label}
                </span>
              )}
            </div>
            <p style={{ margin: 0, fontSize: 13, color: "var(--pf-text-2)" }}>
              {currentPlan && PLAN_CONFIG[currentPlan as PlanKey]
                ? `${formatCurrency(PLAN_CONFIG[currentPlan as PlanKey][interval === "year" ? "yearlyPrice" : "monthlyPrice"])}/${interval === "year" ? "year" : "month"}`
                : "Start a subscription to unlock all features"}
              {renewalDate && !isCanceled && ` · Renews ${renewalDate}`}
              {renewalDate && isCanceled && ` · Access until ${renewalDate}`}
            </p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {isCanceled ? (
              <button
                type="button"
                onClick={handleResume}
                disabled={isResuming || !isOwner}
                style={{
                  padding:      "8px 16px",
                  borderRadius: 8,
                  border:       "none",
                  background:   "#4f46e5",
                  fontSize:     13,
                  fontWeight:   600,
                  color:        "#fff",
                  cursor:       (!isOwner || isResuming) ? "not-allowed" : "pointer",
                  opacity:      isResuming ? 0.7 : 1,
                  fontFamily:   "var(--font-inter)",
                }}
              >
                {isResuming ? "Resuming…" : "Resume subscription"}
              </button>
            ) : (
              <>
                {hasActiveSub && (
                  <button
                    type="button"
                    onClick={handleManageBilling}
                    disabled={isPortal || !isOwner}
                    style={{
                      padding:      "8px 16px",
                      borderRadius: 8,
                      border:       "1px solid var(--pf-line)",
                      background:   "#fff",
                      fontSize:     13,
                      color:        "var(--pf-text-2)",
                      cursor:       (!isOwner || isPortal) ? "not-allowed" : "pointer",
                      fontFamily:   "var(--font-inter)",
                      display:      "flex",
                      alignItems:   "center",
                      gap:          6,
                    }}
                  >
                    <i className={`ti ${isPortal ? "ti-loader" : "ti-external-link"}`} aria-hidden style={{ fontSize: 13 }} />
                    {isPortal ? "Loading…" : "Manage billing"}
                  </button>
                )}
                {hasActiveSub && isOwner && (
                  <button
                    type="button"
                    onClick={handleCancel}
                    disabled={isCanceling}
                    style={{
                      padding:      "8px 16px",
                      borderRadius: 8,
                      border:       "1px solid #fecaca",
                      background:   "#fff",
                      fontSize:     13,
                      color:        "#dc2626",
                      cursor:       isCanceling ? "not-allowed" : "pointer",
                      fontFamily:   "var(--font-inter)",
                      opacity:      isCanceling ? 0.6 : 1,
                    }}
                  >
                    {isCanceling ? "Canceling…" : "Cancel plan"}
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Billing interval toggle */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div
          style={{
            display:      "flex",
            background:   "var(--pf-surface-2)",
            border:       "1px solid var(--pf-line)",
            borderRadius: 8,
            padding:      2,
            gap:          2,
          }}
        >
          {(["month", "year"] as const).map((iv) => (
            <button
              key={iv}
              type="button"
              onClick={() => setInterval(iv)}
              style={{
                padding:      "5px 14px",
                borderRadius: 6,
                border:       "none",
                background:   interval === iv ? "#fff" : "transparent",
                fontSize:     12.5,
                fontWeight:   interval === iv ? 600 : 400,
                color:        interval === iv ? "var(--pf-text)" : "var(--pf-text-3)",
                cursor:       "pointer",
                fontFamily:   "var(--font-inter)",
                boxShadow:    interval === iv ? "0 1px 3px rgba(0,0,0,.07)" : "none",
                transition:   "all .12s",
              }}
            >
              {iv === "month" ? "Monthly" : "Yearly"}
            </button>
          ))}
        </div>
        {interval === "year" && (
          <span
            style={{
              fontSize:     12,
              fontWeight:   600,
              padding:      "3px 9px",
              borderRadius: 99,
              background:   "#f0fdf4",
              color:        "#16a34a",
            }}
          >
            Save ~20%
          </span>
        )}
      </div>

      {/* Plan cards */}
      <div
        style={{
          display:             "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap:                 12,
        }}
      >
        {planOrder.map((planKey) => {
          const p         = PLAN_CONFIG[planKey];
          const isCurrent = currentPlan === planKey;
          const price     = interval === "year" ? p.yearlyPrice : p.monthlyPrice;
          const isLoading = actionPlan === planKey;

          return (
            <div
              key={planKey}
              style={{
                background:   "#fff",
                border:       `1px solid ${p.highlighted ? "#4f46e5" : isCurrent ? "#94a3b8" : "var(--pf-line)"}`,
                borderRadius: 12,
                padding:      "20px 20px 18px",
                position:     "relative",
                display:      "flex",
                flexDirection: "column",
              }}
            >
              {p.highlighted && (
                <div
                  style={{
                    position:     "absolute",
                    top:          -1,
                    left:         "50%",
                    transform:    "translateX(-50%)",
                    background:   "#4f46e5",
                    color:        "#fff",
                    fontSize:     11,
                    fontWeight:   700,
                    padding:      "3px 12px",
                    borderRadius: "0 0 8px 8px",
                    letterSpacing: ".03em",
                    whiteSpace:   "nowrap",
                  }}
                >
                  MOST POPULAR
                </div>
              )}

              <p
                style={{
                  margin:     "0 0 2px",
                  fontSize:   14,
                  fontWeight: 700,
                  color:      "var(--pf-text)",
                  marginTop:  p.highlighted ? 10 : 0,
                }}
              >
                {p.name}
              </p>

              <p
                style={{
                  margin:     "0 0 14px",
                  fontSize:   26,
                  fontWeight: 700,
                  color:      "var(--pf-text)",
                  fontFamily: "var(--font-inter-tight)",
                  letterSpacing: "-.5px",
                  lineHeight: 1,
                }}
              >
                {formatCurrency(price)}
                <span style={{ fontSize: 13, fontWeight: 400, color: "var(--pf-text-3)" }}>
                  /{interval === "year" ? "yr" : "mo"}
                </span>
              </p>

              <ul
                style={{
                  margin:        "0 0 18px",
                  padding:       0,
                  listStyle:     "none",
                  display:       "flex",
                  flexDirection: "column",
                  gap:           7,
                  flex:          1,
                }}
              >
                {p.features.map((f) => (
                  <li
                    key={f}
                    style={{
                      display:    "flex",
                      alignItems: "flex-start",
                      gap:        7,
                      fontSize:   13,
                      color:      "var(--pf-text-2)",
                      lineHeight: 1.4,
                    }}
                  >
                    <i
                      className="ti ti-check"
                      aria-hidden
                      style={{ fontSize: 13, color: "#4f46e5", flexShrink: 0, marginTop: 1 }}
                    />
                    {f}
                  </li>
                ))}
              </ul>

              {isCurrent ? (
                <div
                  style={{
                    width:          "100%",
                    padding:        "9px 0",
                    borderRadius:   8,
                    border:         "1px solid var(--pf-line)",
                    background:     "var(--pf-surface)",
                    fontSize:       13,
                    fontWeight:     600,
                    color:          "var(--pf-text-3)",
                    textAlign:      "center",
                  }}
                >
                  <i className="ti ti-check" aria-hidden style={{ marginRight: 4, color: "#4f46e5" }} />
                  Current plan
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => handleUpgrade(planKey)}
                  disabled={isLoading || !isOwner}
                  style={{
                    width:          "100%",
                    padding:        "9px 0",
                    borderRadius:   8,
                    border:         p.highlighted ? "none" : "1px solid var(--pf-line)",
                    background:     p.highlighted ? "#4f46e5" : "#fff",
                    fontSize:       13,
                    fontWeight:     600,
                    color:          p.highlighted ? "#fff" : "var(--pf-text-2)",
                    cursor:         (!isOwner || isLoading) ? "not-allowed" : "pointer",
                    opacity:        isLoading ? 0.7 : 1,
                    fontFamily:     "var(--font-inter)",
                    display:        "flex",
                    alignItems:     "center",
                    justifyContent: "center",
                    gap:            5,
                    transition:     "opacity .12s",
                  }}
                >
                  {isLoading ? (
                    <>
                      <i className="ti ti-loader" aria-hidden style={{ fontSize: 13 }} />
                      Loading…
                    </>
                  ) : !currentPlan ? (
                    `Get ${p.name}`
                  ) : planOrder.indexOf(planKey) > planOrder.indexOf(currentPlan as PlanKey) ? (
                    `Upgrade to ${p.name}`
                  ) : (
                    `Downgrade to ${p.name}`
                  )}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Owner notice */}
      {!isOwner && (
        <p style={{ margin: 0, fontSize: 12.5, color: "var(--pf-text-3)", textAlign: "center" }}>
          <i className="ti ti-lock" aria-hidden style={{ marginRight: 4 }} />
          Only workspace owners can make billing changes.
        </p>
      )}
    </div>
  );
}
