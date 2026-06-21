import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PortalNav } from "@/components/portal/portal-nav";
import { getPortalContext } from "@/lib/supabase/portal-actions";

interface LayoutProps {
  children: React.ReactNode;
  params:   Promise<{ token: string }>;
}

export async function generateMetadata({ params }: { params: Promise<{ token: string }> }): Promise<Metadata> {
  const { token } = await params;
  const ctx = await getPortalContext(token);
  if (!ctx) return { title: "Not Found" };
  return {
    title: `${ctx.client.name} — ${ctx.org.name} Client Portal`,
  };
}

export default async function PortalLayout({ children, params }: LayoutProps) {
  const { token } = await params;
  const ctx = await getPortalContext(token);

  if (!ctx) {
    notFound();
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--pf-surface)" }}>
      <PortalNav
        token={token}
        clientName={ctx.client.name}
        agencyName={ctx.org.name}
        agencyLogoUrl={ctx.org.logoUrl}
      />
      <main>{children}</main>
    </div>
  );
}
