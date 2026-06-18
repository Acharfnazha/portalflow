"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SETTINGS_NAV, PLAN_PRICES } from "@/lib/constants";
import { PageHeader } from "@/components/shared/page-header";
import { PfBadge } from "@/components/ui/pf-badge";
import { formatCurrency } from "@/lib/format";

const PLANS = [
  {
    id: "studio",
    name: "Studio",
    price: PLAN_PRICES.studio.month,
    features: ["5 team members", "25 clients", "5 GB storage", "PDF invoices", "Basic portal"],
  },
  {
    id: "agency",
    name: "Agency Pro",
    price: PLAN_PRICES.agency.month,
    features: ["Unlimited members", "Unlimited clients", "50 GB storage", "Custom branding", "Advanced portal + approvals"],
    current: true,
  },
];

export default function BillingPage() {
  const pathname = usePathname();

  return (
    <div style={{ minHeight: "calc(100vh - 57px)", background: "var(--pf-surface)" }}>
      <PageHeader title="Settings" subtitle="Manage your workspace preferences" />

      <div style={{ display: "flex", padding: 20, gap: 20, alignItems: "flex-start" }}>
        {/* Nav */}
        <nav
          aria-label="Settings sections"
          style={{
            width: 200,
            flexShrink: 0,
            background: "#fff",
            border: "1px solid var(--pf-line)",
            borderRadius: 12,
            padding: "8px 6px",
            position: "sticky",
            top: 20,
          }}
        >
          {SETTINGS_NAV.map(item => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  display: "flex", alignItems: "center", gap: 8,
                  padding: "8px 10px", borderRadius: 7,
                  fontSize: 13, fontWeight: active ? 500 : 400,
                  color: active ? "#4f46e5" : "var(--pf-text-2)",
                  background: active ? "#eef2ff" : "transparent",
                  textDecoration: "none", transition: "all .12s",
                }}
              >
                <i className={`ti ${item.icon}`} aria-hidden style={{ fontSize: 15, flexShrink: 0 }} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Billing content */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Current plan */}
          <div style={{ background: "#fff", border: "1px solid var(--pf-line)", borderRadius: 12, overflow: "hidden" }}>
            <div style={{ padding: "18px 24px", borderBottom: "1px solid var(--pf-line)" }}>
              <h2 style={{ fontSize: 15, fontWeight: 700, color: "var(--pf-text)", margin: 0 }}>Current plan</h2>
            </div>
            <div style={{ padding: "20px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: 20, fontWeight: 700, color: "var(--pf-text)" }}>Agency Pro</span>
                  <PfBadge variant="green">Active</PfBadge>
                </div>
                <p style={{ margin: 0, fontSize: 13, color: "var(--pf-text-2)" }}>
                  {formatCurrency(PLAN_PRICES.agency.month)}/month · Renews Feb 1, 2025
                </p>
              </div>
              <button
                type="button"
                style={{
                  padding: "8px 16px", borderRadius: 8, border: "1px solid var(--pf-line)",
                  background: "#fff", fontSize: 13, color: "var(--pf-text-2)", cursor: "pointer", fontFamily: "var(--font-inter)",
                }}
              >
                Manage subscription
              </button>
            </div>
          </div>

          {/* Plan cards */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {PLANS.map(p => (
              <div
                key={p.id}
                style={{
                  background: "#fff",
                  border: `1px solid ${p.current ? "#4f46e5" : "var(--pf-line)"}`,
                  borderRadius: 12,
                  padding: "20px 22px",
                  position: "relative",
                }}
              >
                {p.current && (
                  <span
                    style={{
                      position: "absolute",
                      top: 14,
                      right: 14,
                      fontSize: 11,
                      fontWeight: 500,
                      padding: "2px 8px",
                      borderRadius: 99,
                      background: "#eef2ff",
                      color: "#4f46e5",
                    }}
                  >
                    Current plan
                  </span>
                )}
                <p style={{ margin: "0 0 2px", fontSize: 15, fontWeight: 700, color: "var(--pf-text)" }}>{p.name}</p>
                <p style={{ margin: "0 0 16px", fontSize: 22, fontWeight: 700, color: "var(--pf-text)" }}>
                  {formatCurrency(p.price)}
                  <span style={{ fontSize: 13, fontWeight: 400, color: "var(--pf-text-3)" }}>/mo</span>
                </p>
                <ul style={{ margin: "0 0 16px", padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 7 }}>
                  {p.features.map(f => (
                    <li key={f} style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 13, color: "var(--pf-text-2)" }}>
                      <i className="ti ti-check" aria-hidden style={{ fontSize: 13, color: "#4f46e5", flexShrink: 0 }} />
                      {f}
                    </li>
                  ))}
                </ul>
                {!p.current && (
                  <button
                    type="button"
                    style={{
                      width: "100%", padding: "8px 0", borderRadius: 8,
                      border: "1px solid #4f46e5", background: "transparent",
                      fontSize: 13, fontWeight: 500, color: "#4f46e5", cursor: "pointer", fontFamily: "var(--font-inter)",
                    }}
                  >
                    Downgrade to {p.name}
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Payment method stub */}
          <div style={{ background: "#fff", border: "1px solid var(--pf-line)", borderRadius: 12, overflow: "hidden" }}>
            <div style={{ padding: "18px 24px", borderBottom: "1px solid var(--pf-line)" }}>
              <h2 style={{ fontSize: 15, fontWeight: 700, color: "var(--pf-text)", margin: 0 }}>Payment method</h2>
            </div>
            <div style={{ padding: "18px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 42, height: 28, borderRadius: 5, background: "#1a1f71", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontSize: 9, fontWeight: 800, color: "#fff", letterSpacing: 1 }}>VISA</span>
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: 13.5, fontWeight: 500, color: "var(--pf-text)" }}>Visa ending in 4242</p>
                  <p style={{ margin: 0, fontSize: 12, color: "var(--pf-text-3)" }}>Expires 08/2027</p>
                </div>
              </div>
              <button
                type="button"
                style={{
                  padding: "7px 14px", borderRadius: 8, border: "1px solid var(--pf-line)",
                  background: "#fff", fontSize: 13, color: "var(--pf-text-2)", cursor: "pointer", fontFamily: "var(--font-inter)",
                }}
              >
                Update card
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
