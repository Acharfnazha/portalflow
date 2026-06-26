"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export interface CreateInvoiceState {
  error?: string;
  success?: boolean;
}

export async function createInvoiceAction(
  _prev: CreateInvoiceState | null,
  formData: FormData
): Promise<CreateInvoiceState> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Not authenticated" };

    const { data: profile } = await supabase
      .from("profiles")
      .select("organization_id, role")
      .eq("id", user.id)
      .single();

    if (!["owner", "admin", "manager"].includes(profile?.role ?? "")) {
      return { error: "Insufficient permissions" };
    }

    const orgId     = profile!.organization_id as string;
    const clientId  = formData.get("client_id") as string;
    const projectId = formData.get("project_id") as string;
    const amountStr = formData.get("amount") as string;
    const status    = (formData.get("status") as string) || "draft";
    const issuedAt  = formData.get("issued_date") as string;
    const dueAt     = formData.get("due_date") as string;
    const notes     = (formData.get("notes") as string) || null;

    if (!clientId) return { error: "Client is required" };

    const totalCents = Math.round(parseFloat(amountStr) * 100);
    if (isNaN(totalCents) || totalCents < 0) return { error: "Invalid amount" };

    const { error } = await supabase.from("invoices").insert({
      organization_id: orgId,
      client_id:       clientId,
      project_id:      projectId || null,
      status,
      total_cents:     totalCents,
      subtotal_cents:  totalCents,
      issued_at:       issuedAt || null,
      due_at:          dueAt   || null,
      notes,
    });

    if (error) return { error: error.message };

    revalidatePath("/dashboard/invoices");
    return { success: true };
  } catch (e) {
    return { error: (e as Error).message };
  }
}

export interface MonthlyRevenuePoint {
  month: string;
  collected: number;
  outstanding: number;
}

export async function getMonthlyRevenueAction(
  orgId: string,
  months = 6
): Promise<MonthlyRevenuePoint[]> {
  const supabase = await createClient();

  // Verify caller owns this org before querying (defense-in-depth on top of RLS)
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: profile } = await supabase
    .from("profiles")
    .select("organization_id")
    .eq("id", user.id)
    .single();

  if (!profile?.organization_id || profile.organization_id !== orgId) return [];

  const since = new Date();
  since.setMonth(since.getMonth() - (months - 1));
  since.setDate(1);
  const sinceStr = since.toISOString().split("T")[0];

  const { data } = await supabase
    .from("invoices")
    .select("issued_at, total_cents, status")
    .eq("organization_id", orgId)
    .is("deleted_at", null)
    .gte("issued_at", sinceStr)
    .not("status", "in", '("void")');

  const result: MonthlyRevenuePoint[] = [];
  const now = new Date();

  for (let i = months - 1; i >= 0; i--) {
    const d     = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const year  = d.getFullYear();
    const month = d.getMonth();
    const label = d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });

    const bucket = (data ?? []).filter((inv) => {
      if (!inv.issued_at) return false;
      const dt = new Date(inv.issued_at);
      return dt.getFullYear() === year && dt.getMonth() === month;
    });

    const collected = bucket
      .filter((i) => i.status === "paid")
      .reduce((s, i) => s + ((i.total_cents as number) ?? 0), 0);

    const outstanding = bucket
      .filter((i) => i.status === "pending" || i.status === "overdue")
      .reduce((s, i) => s + ((i.total_cents as number) ?? 0), 0);

    result.push({ month: label, collected, outstanding });
  }

  return result;
}
