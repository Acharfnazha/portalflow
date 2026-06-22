import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const INTEGRATIONS = [
  {
    id: "stripe",
    name: "Stripe",
    description: "Accept payments and manage subscriptions.",
    icon: "ti-credit-card",
    color: "#6772e5",
    connected: false,
    comingSoon: false,
    settingsHref: "/dashboard/settings/billing",
  },
  {
    id: "google",
    name: "Google",
    description: "Sign in with Google and sync calendar events.",
    icon: "ti-brand-google",
    color: "#4285f4",
    connected: false,
    comingSoon: false,
    settingsHref: null,
  },
  {
    id: "slack",
    name: "Slack",
    description: "Get notified about new invoices, projects, and client activity.",
    icon: "ti-brand-slack",
    color: "#4a154b",
    connected: false,
    comingSoon: true,
    settingsHref: null,
  },
  {
    id: "zapier",
    name: "Zapier",
    description: "Connect PortalFlow to 5,000+ apps without code.",
    icon: "ti-bolt",
    color: "#ff4a00",
    connected: false,
    comingSoon: true,
    settingsHref: null,
  },
  {
    id: "notion",
    name: "Notion",
    description: "Sync project notes and documents to your Notion workspace.",
    icon: "ti-brand-notion",
    color: "#000",
    connected: false,
    comingSoon: true,
    settingsHref: null,
  },
  {
    id: "hubspot",
    name: "HubSpot",
    description: "Sync clients and deals with your HubSpot CRM.",
    icon: "ti-building-community",
    color: "#ff7a59",
    connected: false,
    comingSoon: true,
    settingsHref: null,
  },
];

export default async function IntegrationsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <div style={{ padding: "32px 36px", maxWidth: 780 }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: "var(--pf-text)", margin: "0 0 4px", letterSpacing: "-.3px" }}>
          Integrations
        </h1>
        <p style={{ fontSize: 13.5, color: "var(--pf-text-2)", margin: 0 }}>
          Connect PortalFlow with the tools your team already uses.
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {INTEGRATIONS.map((integration) => (
          <div
            key={integration.id}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              padding: "16px 20px",
              background: "#fff",
              border: "1px solid var(--pf-line)",
              borderRadius: 12,
            }}
          >
            {/* Icon */}
            <div style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              background: `${integration.color}14`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}>
              <i className={`ti ${integration.icon}`} style={{ fontSize: 20, color: integration.color }} />
            </div>

            {/* Info */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: "var(--pf-text)" }}>
                  {integration.name}
                </span>
                {integration.comingSoon && (
                  <span style={{
                    fontSize: 10.5,
                    fontWeight: 600,
                    color: "#6366f1",
                    background: "#eef2ff",
                    padding: "2px 7px",
                    borderRadius: 20,
                    letterSpacing: ".2px",
                  }}>
                    COMING SOON
                  </span>
                )}
                {integration.connected && (
                  <span style={{
                    fontSize: 10.5,
                    fontWeight: 600,
                    color: "#059669",
                    background: "#f0fdf4",
                    padding: "2px 7px",
                    borderRadius: 20,
                    letterSpacing: ".2px",
                  }}>
                    CONNECTED
                  </span>
                )}
              </div>
              <p style={{ fontSize: 12.5, color: "var(--pf-text-3)", margin: 0, lineHeight: 1.4 }}>
                {integration.description}
              </p>
            </div>

            {/* Action */}
            {!integration.comingSoon && (
              integration.settingsHref ? (
                <a
                  href={integration.settingsHref}
                  style={{
                    padding: "7px 14px",
                    borderRadius: 8,
                    border: "1px solid var(--pf-line-strong)",
                    background: "#fff",
                    fontSize: 13,
                    color: "var(--pf-text-2)",
                    textDecoration: "none",
                    fontFamily: "var(--font-inter)",
                    whiteSpace: "nowrap",
                    flexShrink: 0,
                  }}
                >
                  Manage
                </a>
              ) : (
                <button
                  disabled
                  style={{
                    padding: "7px 14px",
                    borderRadius: 8,
                    border: "1px solid var(--pf-line)",
                    background: "#f9fafb",
                    fontSize: 13,
                    color: "var(--pf-text-3)",
                    cursor: "not-allowed",
                    fontFamily: "var(--font-inter)",
                    whiteSpace: "nowrap",
                    flexShrink: 0,
                  }}
                >
                  Connect
                </button>
              )
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
