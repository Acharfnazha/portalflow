"use server";

import { createClient, createServiceClient } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/email";
import { portalInviteTemplate } from "@/lib/email-templates";
import type { EmailFallback } from "@/lib/email";
import type { NotificationType } from "@/types/app.types";

// ── Internal helper — creates notification rows for all org members except actor ─

export async function createNotification(
  orgId:       string,
  actorId:     string,
  type:        NotificationType,
  title:       string,
  body:        string,
  entityType?: string,
  entityId?:   string
) {
  try {
    const service = await createServiceClient();

    const { data: members } = await service
      .from("profiles")
      .select("id")
      .eq("organization_id", orgId)
      .neq("id", actorId);

    if (!members?.length) return;

    await service.from("notifications").insert(
      members.map((m) => ({
        organization_id: orgId,
        user_id:         m.id as string,
        type,
        title,
        body,
        entity_type:     entityType ?? null,
        entity_id:       entityId   ?? null,
      }))
    );
  } catch {
    // Non-fatal — notification creation never breaks the main action
  }
}

// ── Fetch notifications for current user ─────────────────────────────────────

export async function getNotificationsAction() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data } = await supabase
      .from("notifications")
      .select("id, type, title, body, entity_type, entity_id, read_at, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(30);

    return (data ?? []).map((n) => ({
      id:         n.id         as string,
      type:       n.type       as NotificationType,
      title:      n.title      as string,
      body:       (n.body      as string | null) ?? undefined,
      entityType: (n.entity_type as string | null) ?? undefined,
      entityId:   (n.entity_id   as string | null) ?? undefined,
      readAt:     (n.read_at     as string | null) ?? undefined,
      createdAt:  n.created_at as string,
    }));
  } catch {
    return [];
  }
}

// ── Mark single notification read ─────────────────────────────────────────────

export async function markReadAction(notifId: string) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from("notifications")
      .update({ read_at: new Date().toISOString() })
      .eq("id", notifId)
      .eq("user_id", user.id)
      .is("read_at", null);
  } catch {
    // Silently fail
  }
}

// ── Mark all notifications read ───────────────────────────────────────────────

export async function markAllReadAction() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from("notifications")
      .update({ read_at: new Date().toISOString() })
      .eq("user_id", user.id)
      .is("read_at", null);
  } catch {
    // Silently fail
  }
}

// ── Send portal invite email ──────────────────────────────────────────────────

export async function sendPortalInviteAction(
  _prev: unknown,
  formData: FormData
): Promise<{ sent?: boolean; fallback?: EmailFallback; error?: string }> {
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

    const clientId    = formData.get("client_id")    as string;
    const clientEmail = formData.get("client_email") as string;
    const clientName  = formData.get("client_name")  as string;
    const portalToken = formData.get("portal_token") as string;

    if (!clientEmail) return { error: "Client has no email address" };
    if (!portalToken) return { error: "Portal link not generated yet" };

    const orgId   = profile!.organization_id as string;
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3001";

    // Look up org name
    const service  = await createServiceClient();
    const { data: org } = await service
      .from("organizations")
      .select("name")
      .eq("id", orgId)
      .single();

    const orgName   = (org?.name as string | null) ?? "Your Agency";
    const portalUrl = `${siteUrl}/portal/${portalToken}`;

    const { subject, html, text } = portalInviteTemplate({
      clientName,
      orgName,
      portalUrl,
    });

    const result = await sendEmail({ to: clientEmail, subject, html, text });

    if (result.sent) {
      // Record notification for all org members except sender
      await createNotification(
        orgId,
        user.id,
        "portal_invite_sent",
        `Portal invite sent to ${clientName}`,
        `Invite email delivered to ${clientEmail}`,
        "client",
        clientId
      );
    }

    return { sent: result.sent, fallback: result.fallback, error: result.error };
  } catch (e) {
    return { error: (e as Error).message };
  }
}
