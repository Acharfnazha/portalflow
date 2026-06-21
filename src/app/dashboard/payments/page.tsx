import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/ui/empty-state";

export default async function PaymentsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("organization_id")
    .eq("id", user.id)
    .single();
  if (!profile?.organization_id) redirect("/dashboard");

  const orgId = profile.organization_id as string;

  const { data: payments, count } = await supabase
    .from("payments")
    .select("id, amount_cents, status, method, reference, created_at, invoices(invoice_number), clients(name)", { count: "exact" })
    .eq("organization_id", orgId)
    .order("created_at", { ascending: false })
    .limit(50);

  const totalReceived = (payments ?? [])
    .filter(p => p.status === "succeeded")
    .reduce((s, p) => s + ((p.amount_cents as number) ?? 0), 0);

  function fmtDate(d: string) {
    return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  }
  function fmtCents(c: number) {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(c / 100);
  }

  const STATUS_STYLE: Record<string, { bg: string; color: string }> = {
    succeeded: { bg: "#d1fae5", color: "#065f46" },
    pending:   { bg: "#fef3c7", color: "#92400e" },
    failed:    { bg: "#fee2e2", color: "#991b1b" },
    refunded:  { bg: "#ede9fe", color: "#5b21b6" },
  };

  return (
    <div style={{ minHeight: "calc(100vh - 57px)", background: "var(--pf-surface)" }}>
      <PageHeader title="Payments" subtitle="Track payments received against your invoices." />

      <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
        {/* Summary */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12 }}>
          {[
            { label: "Total received", value: fmtCents(totalReceived), color: "#059669" },
            { label: "Payment records", value: String(count ?? 0), color: "#4f46e5" },
          ].map(s => (
            <div key={s.label} style={{ background: "#fff", border: "1px solid var(--pf-line)", borderRadius: 10, padding: "14px 16px" }}>
              <div style={{ fontSize: 11.5, color: "var(--pf-text-3)", marginBottom: 4 }}>{s.label}</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: s.color, fontFamily: "var(--font-inter-tight)" }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Table */}
        <div style={{ background: "#fff", border: "1px solid var(--pf-line)", borderRadius: 12, overflow: "hidden" }}>
          <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--pf-line)" }}>
            <h2 style={{ fontSize: 14, fontWeight: 600, color: "var(--pf-text)", margin: 0 }}>Payment history</h2>
          </div>
          {(payments ?? []).length === 0 ? (
            <EmptyState
              icon="ti-credit-card"
              title="No payments recorded yet"
              description="Payments are created automatically when clients pay invoices via Stripe, or you can record them manually."
            />
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--pf-line)" }}>
                  {["Date", "Client", "Invoice", "Amount", "Method", "Status"].map(h => (
                    <th key={h} style={{ padding: "9px 16px", textAlign: "left", fontSize: 11.5, fontWeight: 600, color: "var(--pf-text-3)", letterSpacing: ".04em", textTransform: "uppercase" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(payments ?? []).map(p => {
                  const client  = p.clients  as unknown as { name: string } | null;
                  const invoice = p.invoices as unknown as { invoice_number: string } | null;
                  const st      = STATUS_STYLE[p.status as string] ?? { bg: "#f3f4f6", color: "#374151" };
                  return (
                    <tr key={p.id as string} style={{ borderBottom: "1px solid var(--pf-line)" }}>
                      <td style={{ padding: "11px 16px", fontSize: 13, color: "var(--pf-text-2)" }}>{fmtDate(p.created_at as string)}</td>
                      <td style={{ padding: "11px 16px", fontSize: 13, color: "var(--pf-text)" }}>{client?.name ?? "—"}</td>
                      <td style={{ padding: "11px 16px", fontSize: 13, color: "var(--pf-text-2)" }}>{invoice?.invoice_number ?? "—"}</td>
                      <td style={{ padding: "11px 16px", fontSize: 13, fontWeight: 600, color: "var(--pf-text)" }}>{fmtCents((p.amount_cents as number) ?? 0)}</td>
                      <td style={{ padding: "11px 16px", fontSize: 12.5, color: "var(--pf-text-2)", textTransform: "capitalize" }}>{(p.method as string) ?? "—"}</td>
                      <td style={{ padding: "11px 16px" }}>
                        <span style={{ display: "inline-block", padding: "2px 9px", borderRadius: 99, fontSize: 11.5, fontWeight: 600, background: st.bg, color: st.color, textTransform: "capitalize" }}>
                          {(p.status as string) ?? "—"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
