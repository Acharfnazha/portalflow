// Role hierarchy: owner > admin > manager > staff
// Clients are not dashboard users — they access via portal_sessions only.

export type Role = "owner" | "admin" | "manager" | "staff";
export type InvitableRole = Exclude<Role, "owner">; // owners are not invitable

const RANK: Record<Role, number> = {
  owner: 4,
  admin: 3,
  manager: 2,
  staff: 1,
};

export function hasRole(userRole: Role, required: Role): boolean {
  return RANK[userRole] >= RANK[required];
}

// ── Named permission gates ─────────────────────────────────────────────
export const can = {
  manageOrg:      (role: Role) => hasRole(role, "owner"),
  manageBilling:  (role: Role) => hasRole(role, "owner"),
  manageMembers:  (role: Role) => hasRole(role, "admin"),
  inviteMembers:  (role: Role) => hasRole(role, "admin"),
  removeMembers:  (role: Role) => hasRole(role, "admin"),
  changeRoles:    (role: Role) => hasRole(role, "admin"),
  manageClients:  (role: Role) => hasRole(role, "manager"),
  manageProjects: (role: Role) => hasRole(role, "manager"),
  createInvoices: (role: Role) => hasRole(role, "manager"),
  uploadDocuments:(role: Role) => hasRole(role, "staff"),
  viewClients:    (role: Role) => hasRole(role, "staff"),
  viewProjects:   (role: Role) => hasRole(role, "staff"),
} as const;

// ── UI display helpers ─────────────────────────────────────────────────
export const ROLE_CONFIG: Record<
  Role,
  { label: string; badgeBg: string; badgeColor: string; dotColor: string }
> = {
  owner:   { label: "Owner",   badgeBg: "#eef2ff", badgeColor: "#4338ca", dotColor: "#6366f1" },
  admin:   { label: "Admin",   badgeBg: "#faf5ff", badgeColor: "#7e22ce", dotColor: "#a855f7" },
  manager: { label: "Manager", badgeBg: "#eff6ff", badgeColor: "#1d4ed8", dotColor: "#3b82f6" },
  staff:   { label: "Staff",   badgeBg: "#f8fafc", badgeColor: "#475569", dotColor: "#94a3b8" },
};

export const INVITABLE_ROLES: { value: InvitableRole; label: string; description: string }[] = [
  {
    value: "admin",
    label: "Admin",
    description: "Can manage clients, projects, invoices, and team members.",
  },
  {
    value: "manager",
    label: "Manager",
    description: "Can manage clients and projects, create invoices.",
  },
  {
    value: "staff",
    label: "Staff",
    description: "Can view and update assigned projects and clients.",
  },
];

// Roles that a given user can assign to others (cannot assign own role or higher)
export function assignableRoles(userRole: Role): InvitableRole[] {
  return INVITABLE_ROLES.filter((r) => RANK[r.value] < RANK[userRole]).map((r) => r.value);
}
