import type { Metadata } from "next";
import { PortalNav } from "@/components/portal/portal-nav";

export const metadata: Metadata = {
  title: "Client Portal — PortalFlow",
};

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
  params: Promise<{ token: string }>;
}) {
  const token = "demo-token";

  return (
    <div style={{ minHeight: "100vh", background: "var(--pf-surface)" }}>
      <PortalNav
        token={token}
        clientName="Nexus Digital"
        agencyName="Antigravity Studio"
      />
      <main>{children}</main>
    </div>
  );
}
