"use client";

import { useActionState, useState } from "react";
import { PfAvatar } from "@/components/ui/pf-avatar";
import { PfBadge } from "@/components/ui/pf-badge";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { updateMemberRole, removeMember } from "@/lib/supabase/org-actions";
import { ROLE_CONFIG, INVITABLE_ROLES, can, type Role } from "@/lib/permissions";

interface Member {
  id: string;
  full_name: string | null;
  email: string;
  role: Role;
  job_title: string | null;
  avatar_url: string | null;
}

interface MemberRowProps {
  member: Member;
  currentUserId: string;
  currentUserRole: Role;
  isLast: boolean;
}

export function MemberRow({ member, currentUserId, currentUserRole, isLast }: MemberRowProps) {
  const [roleState, roleAction, rolePending] = useActionState(updateMemberRole, null);
  const [removeState, removeAction, removePending] = useActionState(removeMember, null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const displayName = member.full_name || member.email.split("@")[0];
  const rc = ROLE_CONFIG[member.role];
  const isSelf = member.id === currentUserId;
  const isOwner = member.role === "owner";
  const canEdit = can.changeRoles(currentUserRole) && !isSelf && !isOwner;
  const canRemove = can.removeMembers(currentUserRole) && !isSelf && !isOwner;

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const formData = new FormData();
    formData.set("memberId", member.id);
    formData.set("role", e.target.value);
    roleAction(formData);
  };

  const handleRemoveSubmit = (formData: FormData) => {
    formData.set("memberId", member.id);
    removeAction(formData);
    setConfirmOpen(false);
  };

  return (
    <>
      <tr style={{ borderBottom: isLast ? "none" : "1px solid var(--pf-line)" }}>
        {/* Member */}
        <td style={{ padding: "14px 16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <PfAvatar name={displayName} src={member.avatar_url ?? undefined} size={36} />
            <div>
              <p style={{ margin: 0, fontSize: 13.5, fontWeight: 500, color: "var(--pf-text)" }}>
                {displayName}
                {isSelf && (
                  <span style={{ marginLeft: 6, fontSize: 11, color: "var(--pf-text-3)", fontWeight: 400 }}>
                    (you)
                  </span>
                )}
              </p>
              <p style={{ margin: 0, fontSize: 12, color: "var(--pf-text-3)" }}>{member.email}</p>
            </div>
          </div>
        </td>

        {/* Title */}
        <td style={{ padding: "14px 16px", fontSize: 13, color: "var(--pf-text-2)" }}>
          {member.job_title ?? "—"}
        </td>

        {/* Role */}
        <td style={{ padding: "14px 16px" }}>
          {canEdit ? (
            <select
              value={member.role}
              onChange={handleRoleChange}
              disabled={rolePending}
              style={{
                padding: "4px 8px",
                borderRadius: 7,
                border: `1px solid ${rc.badgeBg}`,
                background: rc.badgeBg,
                color: rc.badgeColor,
                fontSize: 12.5,
                fontWeight: 500,
                cursor: "pointer",
                fontFamily: "var(--font-inter)",
                outline: "none",
              }}
            >
              <option value={member.role}>{rc.label}</option>
              {INVITABLE_ROLES.filter((r) => r.value !== member.role).map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
          ) : (
            <PfBadge
              dot
              dotColor={rc.dotColor}
              style={{ background: rc.badgeBg, color: rc.badgeColor }}
            >
              {rc.label}
            </PfBadge>
          )}
          {roleState?.error && (
            <p style={{ margin: "4px 0 0", fontSize: 11.5, color: "#dc2626" }}>{roleState.error}</p>
          )}
        </td>

        {/* Actions */}
        <td style={{ padding: "14px 16px" }}>
          {canRemove && (
            <button
              type="button"
              onClick={() => setConfirmOpen(true)}
              disabled={removePending}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 5,
                padding: "5px 10px",
                borderRadius: 7,
                border: "1px solid #fecaca",
                background: "#fff",
                color: "#dc2626",
                fontSize: 12.5,
                cursor: "pointer",
                fontFamily: "var(--font-inter)",
              }}
            >
              <i className="ti ti-user-minus" aria-hidden style={{ fontSize: 13 }} />
              Remove
            </button>
          )}
          {removeState?.error && (
            <p style={{ margin: "4px 0 0", fontSize: 11.5, color: "#dc2626" }}>{removeState.error}</p>
          )}
        </td>
      </tr>

      <ConfirmDialog
        open={confirmOpen}
        title="Remove member"
        description={`Remove ${displayName} from your organization? They will lose access to all workspaces and data.`}
        confirmLabel="Remove"
        variant="danger"
        onConfirm={() => {
          const formData = new FormData();
          handleRemoveSubmit(formData);
        }}
        onCancel={() => setConfirmOpen(false)}
      />
    </>
  );
}
