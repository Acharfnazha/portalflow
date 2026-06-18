"use client";

import { useState } from "react";
import { MemberRow } from "@/components/dashboard/team/member-row";
import { InviteModal } from "@/components/dashboard/team/invite-modal";
import { PfBadge } from "@/components/ui/pf-badge";
import { ROLE_CONFIG, can, type Role } from "@/lib/permissions";
import { cancelInvitation } from "@/lib/supabase/org-actions";
import { useActionState } from "react";

interface Member {
  id: string;
  full_name: string | null;
  email: string;
  role: Role;
  job_title: string | null;
  avatar_url: string | null;
}

interface Invitation {
  id: string;
  email: string;
  role: Role;
  invited_at: string;
  expires_at: string;
}

interface TeamClientProps {
  members: Member[];
  invitations: Invitation[];
  currentUserId: string;
  currentUserRole: Role;
}

function CancelInviteButton({ id }: { id: string }) {
  const [, action, pending] = useActionState(cancelInvitation, null);
  return (
    <form action={(fd) => { fd.set("invitationId", id); action(fd); }}>
      <button
        type="submit"
        disabled={pending}
        style={{
          padding: "4px 10px", borderRadius: 7,
          border: "1px solid var(--pf-line)", background: "#fff",
          fontSize: 12.5, color: "var(--pf-text-3)", cursor: pending ? "not-allowed" : "pointer",
          fontFamily: "var(--font-inter)",
        }}
      >
        {pending ? "…" : "Cancel"}
      </button>
    </form>
  );
}

export function TeamClient({ members, invitations, currentUserId, currentUserRole }: TeamClientProps) {
  const [inviteOpen, setInviteOpen] = useState(false);
  const canInvite = can.inviteMembers(currentUserRole);

  return (
    <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Members card */}
      <div style={{ background: "#fff", border: "1px solid var(--pf-line)", borderRadius: 12, overflow: "hidden" }}>
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "16px 20px", borderBottom: "1px solid var(--pf-line)",
        }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "var(--pf-text)" }}>
              Members
              <span style={{ marginLeft: 8, fontSize: 12, fontWeight: 400, color: "var(--pf-text-3)" }}>
                {members.length}
              </span>
            </h2>
          </div>
          {canInvite && (
            <button
              onClick={() => setInviteOpen(true)}
              style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "7px 14px", borderRadius: 8, border: "none",
                background: "#4f46e5", color: "#fff", fontSize: 13, fontWeight: 500,
                cursor: "pointer", fontFamily: "var(--font-inter)",
              }}
            >
              <i className="ti ti-user-plus" aria-hidden style={{ fontSize: 14 }} />
              Invite
            </button>
          )}
        </div>

        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--pf-line)", background: "var(--pf-surface)" }}>
              {["Member", "Title", "Role", ""].map((h) => (
                <th
                  key={h}
                  style={{
                    padding: "9px 16px", textAlign: "left",
                    fontSize: 11.5, fontWeight: 600, color: "var(--pf-text-3)",
                    letterSpacing: ".04em", textTransform: "uppercase",
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {members.map((m, i) => (
              <MemberRow
                key={m.id}
                member={m}
                currentUserId={currentUserId}
                currentUserRole={currentUserRole}
                isLast={i === members.length - 1}
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* Pending invitations */}
      {invitations.length > 0 && (
        <div style={{ background: "#fff", border: "1px solid var(--pf-line)", borderRadius: 12, overflow: "hidden" }}>
          <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--pf-line)" }}>
            <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "var(--pf-text)" }}>
              Pending invitations
              <span style={{ marginLeft: 8, fontSize: 12, fontWeight: 400, color: "var(--pf-text-3)" }}>
                {invitations.length}
              </span>
            </h2>
          </div>

          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--pf-line)", background: "var(--pf-surface)" }}>
                {["Email", "Role", "Invited", ""].map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: "9px 16px", textAlign: "left",
                      fontSize: 11.5, fontWeight: 600, color: "var(--pf-text-3)",
                      letterSpacing: ".04em", textTransform: "uppercase",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {invitations.map((inv, i) => {
                const rc = ROLE_CONFIG[inv.role] ?? ROLE_CONFIG.staff;
                return (
                  <tr
                    key={inv.id}
                    style={{ borderBottom: i === invitations.length - 1 ? "none" : "1px solid var(--pf-line)" }}
                  >
                    <td style={{ padding: "12px 16px", fontSize: 13.5, color: "var(--pf-text)" }}>
                      {inv.email}
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <PfBadge dot dotColor={rc.dotColor} style={{ background: rc.badgeBg, color: rc.badgeColor }}>
                        {rc.label}
                      </PfBadge>
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: 13, color: "var(--pf-text-3)" }}>
                      {new Date(inv.invited_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      {canInvite && <CancelInviteButton id={inv.id} />}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <InviteModal
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        userRole={currentUserRole}
      />
    </div>
  );
}
