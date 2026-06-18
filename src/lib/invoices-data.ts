export type InvoiceStatus = "paid" | "pending" | "overdue" | "draft";

export interface InvoiceItem {
  id: string;
  clientId: number;
  client: string;
  clientInitials: string;
  clientAvatarBg: string;
  clientAvatarColor: string;
  project: string;
  amount: number;
  status: InvoiceStatus;
  date: string;   /* ISO */
  dueDate: string; /* ISO */
}

/* ─── Status config ─────────────────────────────────────────────── */

export const INVOICE_STATUS_CFG: Record<InvoiceStatus, {
  label: string;
  dotColor: string;
  badgeBg: string;
  badgeColor: string;
  icon: string;
}> = {
  paid:    { label: "Paid",    dotColor: "#22c55e", badgeBg: "#f0fdf4", badgeColor: "#15803d", icon: "ti-circle-check" },
  pending: { label: "Pending", dotColor: "#f59e0b", badgeBg: "#fffbeb", badgeColor: "#b45309", icon: "ti-clock"        },
  overdue: { label: "Overdue", dotColor: "#ef4444", badgeBg: "#fef2f2", badgeColor: "#dc2626", icon: "ti-alert-circle" },
  draft:   { label: "Draft",   dotColor: "#94a3b8", badgeBg: "#f8fafc", badgeColor: "#64748b", icon: "ti-pencil"       },
};

/* ─── Invoice list ──────────────────────────────────────────────── */

export const INVOICES: InvoiceItem[] = [
  /* Jan 2025 ─────────────────── */
  { id:"INV-1034", clientId:5, client:"Orbital Systems",  clientInitials:"OS", clientAvatarBg:"#dbeafe", clientAvatarColor:"#1d4ed8", project:"Analytics Dashboard", amount:14000, status:"draft",   date:"2025-01-18", dueDate:"2025-02-15" },
  { id:"INV-1033", clientId:1, client:"Apex Innovations", clientInitials:"AI", clientAvatarBg:"#ede9fe", clientAvatarColor:"#5b21b6", project:"Website Redesign",    amount: 6000, status:"pending", date:"2025-01-15", dueDate:"2025-02-01" },
  { id:"INV-1032", clientId:3, client:"Streamline Co",    clientInitials:"SC", clientAvatarBg:"#d1fae5", clientAvatarColor:"#065f46", project:"Mobile App v2",       amount: 9000, status:"pending", date:"2025-01-15", dueDate:"2025-01-31" },
  { id:"INV-1031", clientId:1, client:"Apex Innovations", clientInitials:"AI", clientAvatarBg:"#ede9fe", clientAvatarColor:"#5b21b6", project:"SEO & Content",       amount: 2100, status:"pending", date:"2025-01-10", dueDate:"2025-01-25" },
  { id:"INV-1030", clientId:2, client:"Nexus Digital",    clientInitials:"ND", clientAvatarBg:"#fef3c7", clientAvatarColor:"#92400e", project:"Q1 Brand Campaign",   amount: 5100, status:"overdue", date:"2025-01-01", dueDate:"2025-01-15" },

  /* Dec 2024 ─────────────────── */
  { id:"INV-1029", clientId:4, client:"Vertex Corp",      clientInitials:"VC", clientAvatarBg:"#fce7f3", clientAvatarColor:"#9d174d", project:"E-Commerce",         amount: 7500, status:"paid",    date:"2024-12-20", dueDate:"2025-01-05" },
  { id:"INV-1028", clientId:5, client:"Orbital Systems",  clientInitials:"OS", clientAvatarBg:"#dbeafe", clientAvatarColor:"#1d4ed8", project:"Analytics Dashboard", amount:12000, status:"paid",    date:"2024-12-15", dueDate:"2024-12-31" },
  { id:"INV-1027", clientId:3, client:"Streamline Co",    clientInitials:"SC", clientAvatarBg:"#d1fae5", clientAvatarColor:"#065f46", project:"Mobile App v2",       amount: 9000, status:"paid",    date:"2024-12-15", dueDate:"2024-12-31" },
  { id:"INV-1026", clientId:1, client:"Apex Innovations", clientInitials:"AI", clientAvatarBg:"#ede9fe", clientAvatarColor:"#5b21b6", project:"Website Redesign",    amount: 6000, status:"paid",    date:"2024-12-01", dueDate:"2024-12-15" },
  { id:"INV-1025", clientId:2, client:"Nexus Digital",    clientInitials:"ND", clientAvatarBg:"#fef3c7", clientAvatarColor:"#92400e", project:"Brand Campaign",      amount: 5100, status:"paid",    date:"2024-12-15", dueDate:"2024-12-30" },

  /* Nov 2024 ─────────────────── */
  { id:"INV-1024", clientId:6, client:"Pinnacle Labs",    clientInitials:"PL", clientAvatarBg:"#fff7ed", clientAvatarColor:"#9a3412", project:"Employer Brand",      amount: 3200, status:"paid",    date:"2024-11-20", dueDate:"2024-12-05" },
  { id:"INV-1023", clientId:7, client:"Cascade Health",   clientInitials:"CH", clientAvatarBg:"#ecfdf5", clientAvatarColor:"#064e3b", project:"API Documentation",   amount: 2000, status:"paid",    date:"2024-11-15", dueDate:"2024-11-30" },
  { id:"INV-1022", clientId:4, client:"Vertex Corp",      clientInitials:"VC", clientAvatarBg:"#fce7f3", clientAvatarColor:"#9d174d", project:"E-Commerce",         amount: 7500, status:"paid",    date:"2024-11-15", dueDate:"2024-12-01" },
  { id:"INV-1021", clientId:3, client:"Streamline Co",    clientInitials:"SC", clientAvatarBg:"#d1fae5", clientAvatarColor:"#065f46", project:"Mobile App v2",       amount: 9000, status:"paid",    date:"2024-11-15", dueDate:"2024-11-30" },

  /* Oct 2024 ─────────────────── */
  { id:"INV-1020", clientId:5, client:"Orbital Systems",  clientInitials:"OS", clientAvatarBg:"#dbeafe", clientAvatarColor:"#1d4ed8", project:"Analytics Dashboard", amount:12000, status:"paid",    date:"2024-10-15", dueDate:"2024-10-31" },
  { id:"INV-1019", clientId:8, client:"Meridian Finance",  clientInitials:"MF", clientAvatarBg:"#f0f9ff", clientAvatarColor:"#075985", project:"Brand Identity",      amount: 4500, status:"paid",    date:"2024-10-10", dueDate:"2024-10-25" },
  { id:"INV-1018", clientId:1, client:"Apex Innovations", clientInitials:"AI", clientAvatarBg:"#ede9fe", clientAvatarColor:"#5b21b6", project:"SEO & Content",       amount: 2100, status:"paid",    date:"2024-10-01", dueDate:"2024-10-15" },

  /* Sep 2024 ─────────────────── */
  { id:"INV-1017", clientId:4, client:"Vertex Corp",      clientInitials:"VC", clientAvatarBg:"#fce7f3", clientAvatarColor:"#9d174d", project:"E-Commerce",         amount: 7200, status:"paid",    date:"2024-09-20", dueDate:"2024-10-05" },
  { id:"INV-1016", clientId:5, client:"Orbital Systems",  clientInitials:"OS", clientAvatarBg:"#dbeafe", clientAvatarColor:"#1d4ed8", project:"Analytics Dashboard", amount:12000, status:"paid",    date:"2024-09-15", dueDate:"2024-09-30" },
  { id:"INV-1015", clientId:9, client:"Summit Learning",  clientInitials:"SL", clientAvatarBg:"#fef9c3", clientAvatarColor:"#713f12", project:"LMS Integration",     amount: 5800, status:"paid",    date:"2024-09-10", dueDate:"2024-09-25" },

  /* Aug 2024 ─────────────────── */
  { id:"INV-1014", clientId:3, client:"Streamline Co",    clientInitials:"SC", clientAvatarBg:"#d1fae5", clientAvatarColor:"#065f46", project:"Mobile App v1",       amount: 9000, status:"paid",    date:"2024-08-15", dueDate:"2024-08-31" },
  { id:"INV-1013", clientId:8, client:"Meridian Finance",  clientInitials:"MF", clientAvatarBg:"#f0f9ff", clientAvatarColor:"#075985", project:"Brand Identity",      amount: 4500, status:"paid",    date:"2024-08-10", dueDate:"2024-08-25" },
  { id:"INV-1012", clientId:1, client:"Apex Innovations", clientInitials:"AI", clientAvatarBg:"#ede9fe", clientAvatarColor:"#5b21b6", project:"Website Audit",       amount: 3200, status:"paid",    date:"2024-08-01", dueDate:"2024-08-15" },
];

/* ─── Monthly revenue helper ────────────────────────────────────── */

export interface MonthlyRevenue {
  month: string;   /* "Aug '24" */
  collected: number;
  outstanding: number;
}

export function getMonthlyRevenue(months = 6): MonthlyRevenue[] {
  const result: MonthlyRevenue[] = [];
  const now = new Date();

  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const year  = d.getFullYear();
    const month = d.getMonth(); /* 0-based */

    const label = d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });

    const collected   = INVOICES.filter(inv => {
      const id = new Date(inv.date);
      return id.getFullYear() === year && id.getMonth() === month && inv.status === "paid";
    }).reduce((s, inv) => s + inv.amount, 0);

    const outstanding = INVOICES.filter(inv => {
      const id = new Date(inv.date);
      return id.getFullYear() === year && id.getMonth() === month &&
        (inv.status === "pending" || inv.status === "overdue");
    }).reduce((s, inv) => s + inv.amount, 0);

    result.push({ month: label, collected, outstanding });
  }
  return result;
}
