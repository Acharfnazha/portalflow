export type ClientStatus = "active" | "trial" | "new" | "risk" | "churned";

export interface Client {
  id: number;
  name: string;
  domain: string;
  initials: string;
  avatarBg: string;
  avatarColor: string;
  status: ClientStatus;
  owner: string;
  email: string;
  phone: string;
  mrr: number;
  health: number;
  lastActivity: string;
  tag: string;
}

export const CLIENTS: Client[] = [
  { id: 1,  name: "Acme Co",         domain: "acme.com",       initials: "AC", avatarBg: "#ede9fe", avatarColor: "#5b21b6", status: "active",  owner: "Ali N.",  email: "james@acme.com",   phone: "+1 415 555 0101", mrr: 3200, health: 92, lastActivity: "2 min ago",   tag: "Enterprise" },
  { id: 2,  name: "Meridian Bank",   domain: "meridian.io",    initials: "MB", avatarBg: "#dbeafe", avatarColor: "#1d4ed8", status: "trial",   owner: "Sara K.", email: "cto@meridian.io",  phone: "+1 212 555 0188", mrr: 1800, health: 77, lastActivity: "1 hr ago",    tag: "Finance"    },
  { id: 3,  name: "Foundry & Bloom", domain: "foundry.co",     initials: "FB", avatarBg: "#dcfce7", avatarColor: "#15803d", status: "active",  owner: "Ali N.",  email: "hello@foundry.co", phone: "+1 310 555 0145", mrr: 4900, health: 88, lastActivity: "3 hr ago",    tag: "Agency"     },
  { id: 4,  name: "Quanta",          domain: "quanta.dev",     initials: "QT", avatarBg: "#fef9c3", avatarColor: "#a16207", status: "new",     owner: "Tom B.",  email: "ops@quanta.dev",   phone: "+1 628 555 0173", mrr: 900,  health: 65, lastActivity: "Yesterday",   tag: "Startup"    },
  { id: 5,  name: "Halcyon",         domain: "halcyon.xyz",    initials: "HC", avatarBg: "#fce7f3", avatarColor: "#be185d", status: "risk",    owner: "Sara K.", email: "hi@halcyon.xyz",   phone: "+1 347 555 0192", mrr: 2100, health: 41, lastActivity: "3 days ago",  tag: "Agency"     },
  { id: 6,  name: "Lattice & Co",    domain: "lattice.com",    initials: "LC", avatarBg: "#e0f2fe", avatarColor: "#0369a1", status: "active",  owner: "Ali N.",  email: "ceo@lattice.com",  phone: "+1 650 555 0167", mrr: 5400, health: 95, lastActivity: "4 days ago",  tag: "Enterprise" },
  { id: 7,  name: "Vanta Studio",    domain: "vanta.studio",   initials: "VS", avatarBg: "#fff7ed", avatarColor: "#c2410c", status: "risk",    owner: "Tom B.",  email: "team@vanta.studio",phone: "+1 206 555 0134", mrr: 1200, health: 38, lastActivity: "1 week ago",  tag: "Startup"    },
  { id: 8,  name: "Northwind",       domain: "northwind.co",   initials: "NW", avatarBg: "#f0fdf4", avatarColor: "#166534", status: "churned", owner: "Ali N.",  email: "info@northwind.co",phone: "+1 503 555 0156", mrr: 0,    health: 12, lastActivity: "2 weeks ago", tag: "Agency"     },
  { id: 9,  name: "Solstice Labs",   domain: "solstice.io",    initials: "SL", avatarBg: "#ede9fe", avatarColor: "#5b21b6", status: "active",  owner: "Sara K.", email: "dev@solstice.io",  phone: "+1 415 555 0122", mrr: 2700, health: 83, lastActivity: "2 days ago",  tag: "Startup"    },
  { id: 10, name: "Atlas & Bloom",   domain: "atlasbloom.com", initials: "AB", avatarBg: "#fce7f3", avatarColor: "#be185d", status: "active",  owner: "Tom B.",  email: "hello@atlasbloom.com", phone: "+1 212 555 0199", mrr: 3800, health: 79, lastActivity: "5 days ago",  tag: "Agency"     },
];

export const STATUS_CONFIG: Record<ClientStatus, { label: string; dotColor: string; badgeBg: string; badgeColor: string }> = {
  active:  { label: "Active",  dotColor: "#16a34a", badgeBg: "#dcfce7", badgeColor: "#15803d" },
  trial:   { label: "Trial",   dotColor: "#7c3aed", badgeBg: "#ede9fe", badgeColor: "#5b21b6" },
  new:     { label: "New",     dotColor: "#0284c7", badgeBg: "#e0f2fe", badgeColor: "#075985" },
  risk:    { label: "At risk", dotColor: "#d97706", badgeBg: "#fef3c7", badgeColor: "#92400e" },
  churned: { label: "Churned", dotColor: "#dc2626", badgeBg: "#fee2e2", badgeColor: "#991b1b" },
};

export function healthColor(score: number): string {
  if (score >= 80) return "#16a34a";
  if (score >= 50) return "#d97706";
  return "#dc2626";
}
