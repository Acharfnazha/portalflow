"use server";

import { revalidatePath } from "next/cache";
import { createClient, createServiceClient } from "./server";
import type { AuthState } from "./actions";
import type { InvitableRole } from "@/lib/permissions";

export type InviteState = { error: string } | { inviteUrl: string } | null;

// ── Update organization ───────────────────────────────────────────────
export async function updateOrganization(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated." };

  const { data: profile } = await supabase
    .from("profiles")
    .select("organization_id, role")
    .eq("id", user.id)
    .single();

  if (!profile?.organization_id) return { error: "No organization found." };
  if (!["owner"].includes(profile.role)) return { error: "Only owners can update organization settings." };

  const name = (formData.get("name") as string).trim();
  const slug = (formData.get("slug") as string).trim().toLowerCase().replace(/[^a-z0-9-]/g, "-");
  const website = (formData.get("website") as string).trim();
  const timezone = formData.get("timezone") as string;

  if (!name) return { error: "Organization name is required." };
  if (!slug) return { error: "Slug is required." };

  const { error } = await supabase
    .from("organizations")
    .update({ name, slug, website: website || null, timezone })
    .eq("id", profile.organization_id);

  if (error) {
    if (error.code === "23505") return { error: "That slug is already taken." };
    return { error: error.message };
  }

  revalidatePath("/dashboard/settings");
  return null;
}

// ── Invite member ─────────────────────────────────────────────────────
export async function inviteMember(
  _prev: InviteState,
  formData: FormData
): Promise<InviteState> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated." };

  const { data: profile } = await supabase
    .from("profiles")
    .select("organization_id, role")
    .eq("id", user.id)
    .single();

  if (!profile?.organization_id) return { error: "No organization found." };
  if (!["owner", "admin"].includes(profile.role)) return { error: "Only admins can invite members." };

  const email = (formData.get("email") as string).trim().toLowerCase();
  const role = formData.get("role") as InvitableRole;

  if (!email) return { error: "Email is required." };
  if (!["admin", "manager", "staff"].includes(role)) return { error: "Invalid role." };

  // Upsert invitation (handles duplicate gracefully)
  const { data: invitation, error } = await supabase
    .from("invitations")
    .upsert(
      {
        organization_id: profile.organization_id,
        email,
        role,
        invited_by: user.id,
        accepted_at: null,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      },
      { onConflict: "organization_id,email", ignoreDuplicates: false }
    )
    .select()
    .single();

  if (error) return { error: error.message };

  const inviteUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/auth/accept-invite?token=${invitation.token}`;

  // Send invite email via Supabase Auth admin API
  let emailSent = false;
  try {
    const serviceClient = await createServiceClient();
    await (serviceClient.auth.admin as { inviteUserByEmail: (email: string, opts: Record<string, unknown>) => Promise<unknown> }).inviteUserByEmail(email, {
      redirectTo: inviteUrl,
      data: { invited_to_org: profile.organization_id, invitation_role: role },
    });
    emailSent = true;
  } catch {
    // Email sending not configured — invitation was created, surface the link instead
  }

  revalidatePath("/dashboard/team");
  return emailSent ? null : { inviteUrl };
}

// ── Update member role ────────────────────────────────────────────────
export async function updateMemberRole(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated." };

  const { data: myProfile } = await supabase
    .from("profiles")
    .select("organization_id, role")
    .eq("id", user.id)
    .single();

  if (!myProfile) return { error: "Not authenticated." };
  if (!["owner", "admin"].includes(myProfile.role)) return { error: "Only admins can change roles." };

  const memberId = formData.get("memberId") as string;
  const newRole = formData.get("role") as string;

  if (!memberId || !newRole) return { error: "Missing required fields." };
  if (memberId === user.id) return { error: "You cannot change your own role." };
  if (!["admin", "manager", "staff"].includes(newRole)) return { error: "Invalid role." };

  // Admins cannot promote to their own level or higher
  const roleRank = { owner: 4, admin: 3, manager: 2, staff: 1 } as const;
  type RankKey = keyof typeof roleRank;
  if (roleRank[newRole as RankKey] >= roleRank[myProfile.role as RankKey]) {
    return { error: "You cannot assign a role equal to or higher than your own." };
  }

  // Ensure target is in the same org
  const { data: targetProfile } = await supabase
    .from("profiles")
    .select("organization_id, role")
    .eq("id", memberId)
    .single();

  if (!targetProfile || targetProfile.organization_id !== myProfile.organization_id) {
    return { error: "Member not found in your organization." };
  }
  if (targetProfile.role === "owner") return { error: "Cannot change the owner's role." };

  const { error } = await supabase
    .from("profiles")
    .update({ role: newRole })
    .eq("id", memberId)
    .eq("organization_id", myProfile.organization_id);

  if (error) return { error: error.message };

  revalidatePath("/dashboard/team");
  return null;
}

// ── Remove member ─────────────────────────────────────────────────────
export async function removeMember(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated." };

  const { data: myProfile } = await supabase
    .from("profiles")
    .select("organization_id, role")
    .eq("id", user.id)
    .single();

  if (!myProfile) return { error: "Not authenticated." };
  if (!["owner", "admin"].includes(myProfile.role)) return { error: "Only admins can remove members." };

  const memberId = formData.get("memberId") as string;
  if (!memberId) return { error: "Member ID required." };
  if (memberId === user.id) return { error: "You cannot remove yourself." };

  const { data: targetProfile } = await supabase
    .from("profiles")
    .select("organization_id, role")
    .eq("id", memberId)
    .single();

  if (!targetProfile || targetProfile.organization_id !== myProfile.organization_id) {
    return { error: "Member not found in your organization." };
  }
  if (targetProfile.role === "owner") return { error: "Cannot remove the organization owner." };

  // Detach from org (set organization_id to null, reset role)
  const { error } = await supabase
    .from("profiles")
    .update({ organization_id: null, role: "staff" })
    .eq("id", memberId)
    .eq("organization_id", myProfile.organization_id);

  if (error) return { error: error.message };

  revalidatePath("/dashboard/team");
  return null;
}

// ── Cancel invitation ─────────────────────────────────────────────────
export async function cancelInvitation(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated." };

  const { data: myProfile } = await supabase
    .from("profiles")
    .select("organization_id, role")
    .eq("id", user.id)
    .single();

  if (!myProfile) return { error: "Not authenticated." };
  if (!["owner", "admin"].includes(myProfile.role)) return { error: "Only admins can cancel invitations." };

  const invitationId = formData.get("invitationId") as string;
  if (!invitationId) return { error: "Invitation ID required." };

  const { error } = await supabase
    .from("invitations")
    .delete()
    .eq("id", invitationId)
    .eq("organization_id", myProfile.organization_id)
    .is("accepted_at", null);

  if (error) return { error: error.message };

  revalidatePath("/dashboard/team");
  return null;
}

// ── Accept invitation (called post-auth) ──────────────────────────────
export async function acceptInvitation(token: string): Promise<AuthState> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated." };

  const { data, error } = await supabase.rpc("accept_invitation", { p_token: token });
  if (error) return { error: error.message };

  const result = data as { error?: string; success?: boolean };
  if (result?.error) {
    return { error: result.error === "invalid_or_expired_token" ? "This invitation link is invalid or has expired." : result.error };
  }

  revalidatePath("/", "layout");
  return null;
}
