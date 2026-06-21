"use client";

import type { Client } from "@/types/app.types";
import { HealthBar } from "@/components/dashboard/clients/health-bar";
import { formatCurrency, formatDate, formatRelative } from "@/lib/format";
import { PortalCard } from "./portal-card";

interface Props {
  client:     Client & { ownerName?: string };
  canManage?: boolean;
}

export function InfoSidebar({ client, canManage }: Props) {
  return (
    <aside
      aria-label="Client information"
      style={{ width: 264, flexShrink: 0, background: "#fff", borderRight: "1px solid var(--pf-line)", padding: "20px 0", overflowY: "auto" }}
    >
      <Section title="Contact">
        <InfoRow icon="ti-mail"    label="Email"    value={client.email ?? "—"} />
        <InfoRow icon="ti-phone"   label="Phone"    value={client.phone ?? "—"} />
        <InfoRow icon="ti-globe"   label="Website"  value={client.website ?? client.domain ?? "—"} />
        <InfoRow icon="ti-map-pin" label="Location" value={client.location ?? "—"} />
      </Section>

      <Divider />

      <Section title="Account">
        <div style={{ padding: "6px 20px" }}>
          <div style={{ fontSize: 11, color: "var(--pf-text-3)", marginBottom: 2 }}>Monthly Revenue</div>
          <div style={{ fontFamily: "var(--font-inter-tight)", fontSize: 20, fontWeight: 700, color: "var(--pf-text)" }}>
            {client.mrrCents > 0 ? formatCurrency(client.mrrCents) : "—"}
          </div>
        </div>
        <div style={{ padding: "6px 20px" }}>
          <div style={{ fontSize: 11, color: "var(--pf-text-3)", marginBottom: 6 }}>Health Score</div>
          <HealthBar score={client.healthScore} />
        </div>
        {client.tags.length > 0 && (
          <div style={{ padding: "6px 20px" }}>
            <div style={{ fontSize: 11, color: "var(--pf-text-3)", marginBottom: 5 }}>Tags</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
              {client.tags.map(t => (
                <span key={t} style={{ fontSize: 11.5, padding: "2px 8px", borderRadius: 99, background: "var(--pf-surface-2)", color: "var(--pf-text-2)" }}>
                  {t}
                </span>
              ))}
            </div>
          </div>
        )}
      </Section>

      <Divider />

      <Section title="Details">
        <InfoRow icon="ti-building"       label="Industry"     value={client.industry ?? "—"} />
        <InfoRow icon="ti-users"          label="Company size" value={client.companySize ? `${client.companySize} employees` : "—"} />
        <InfoRow icon="ti-user-circle"    label="Owner"        value={client.ownerName ?? "—"} />
        <InfoRow icon="ti-calendar-plus"  label="Added"        value={formatDate(client.createdAt)} />
        <InfoRow icon="ti-calendar-event" label="Last updated" value={formatRelative(client.updatedAt)} />
      </Section>

      {client.notes && (
        <>
          <Divider />
          <Section title="Notes">
            <div style={{ padding: "4px 20px 8px", fontSize: 13, color: "var(--pf-text-2)", lineHeight: 1.55 }}>
              {client.notes}
            </div>
          </Section>
        </>
      )}

      {canManage && (
        <>
          <Divider />
          <PortalCard
            clientId={client.id}
            clientEmail={client.email}
            clientName={client.name}
            portalToken={client.portalToken}
            portalEnabled={client.portalEnabled}
          />
        </>
      )}

      <Divider />

      <Section title="Quick Links">
        {client.website && (
          <QuickLink icon="ti-external-link" label="Visit website" href={client.website} />
        )}
        <QuickLink icon="ti-file-invoice" label="All invoices" href={`/dashboard/invoices?client=${client.id}`} />
        <QuickLink icon="ti-briefcase"    label="All projects" href={`/dashboard/projects?client=${client.id}`} />
      </Section>
    </aside>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ padding: "4px 0 8px" }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: "var(--pf-text-3)", letterSpacing: ".06em", textTransform: "uppercase", padding: "4px 20px 6px" }}>
        {title}
      </div>
      {children}
    </div>
  );
}

function InfoRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "5px 20px" }}>
      <i className={`ti ${icon}`} aria-hidden="true" style={{ fontSize: 14, color: "var(--pf-text-3)", marginTop: 1, flexShrink: 0 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 11, color: "var(--pf-text-3)" }}>{label}</div>
        <div style={{ fontSize: 13, color: "var(--pf-text)", wordBreak: "break-all" }}>{value}</div>
      </div>
    </div>
  );
}

function QuickLink({ icon, label, href }: { icon: string; label: string; href: string }) {
  return (
    <a href={href} style={{ display: "flex", alignItems: "center", gap: 9, padding: "6px 20px", width: "100%", textDecoration: "none", fontSize: 13, color: "#4f46e5", fontFamily: "var(--font-inter)" }}>
      <i className={`ti ${icon}`} aria-hidden="true" style={{ fontSize: 14 }} />
      {label}
    </a>
  );
}

function Divider() {
  return <div aria-hidden="true" style={{ height: 1, background: "var(--pf-line)", margin: "4px 0" }} />;
}
