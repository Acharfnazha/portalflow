export type ProjectStatus   = "active" | "review" | "completed" | "hold" | "planning";
export type ProjectPriority = "high"   | "medium" | "low";

export interface TeamMember {
  name: string;
  initials: string;
  color: string;
}

export interface Project {
  id: number;
  name: string;
  client: string;
  clientId: number;
  description: string;
  status: ProjectStatus;
  priority: ProjectPriority;
  progress: number;
  deadline: string;
  startDate: string;
  budget: number;
  spent: number;
  team: TeamMember[];
  tasks: { total: number; done: number };
  tags: string[];
}

export interface Invoice {
  id: string;
  clientId: number;
  project: string;
  amount: number;
  status: "paid" | "pending" | "overdue" | "draft";
  date: string;
  dueDate: string;
}

export interface Document {
  id: number;
  clientId: number;
  name: string;
  type: "pdf" | "doc" | "xls" | "img" | "zip";
  size: string;
  uploadedBy: string;
  date: string;
}

export interface ActivityItem {
  id: number;
  clientId: number;
  type: "message" | "invoice" | "project" | "document" | "note" | "status" | "call";
  user: string;
  userInitials: string;
  userColor: string;
  action: string;
  detail?: string;
  date: string;
  time: string;
}

export interface ClientNote {
  id: number;
  clientId: number;
  author: string;
  authorInitials: string;
  authorColor: string;
  body: string;
  date: string;
}

/* ─── Status + Priority config ────────────────────────────────────── */

export const PROJECT_STATUS_CONFIG: Record<ProjectStatus, {
  label: string; dotColor: string; badgeBg: string; badgeColor: string;
}> = {
  active:    { label: "Active",     dotColor: "#22c55e", badgeBg: "#f0fdf4", badgeColor: "#15803d" },
  review:    { label: "In Review",  dotColor: "#f59e0b", badgeBg: "#fffbeb", badgeColor: "#b45309" },
  completed: { label: "Completed",  dotColor: "#6366f1", badgeBg: "#eef2ff", badgeColor: "#4338ca" },
  hold:      { label: "On Hold",    dotColor: "#94a3b8", badgeBg: "#f8fafc", badgeColor: "#64748b" },
  planning:  { label: "Planning",   dotColor: "#3b82f6", badgeBg: "#eff6ff", badgeColor: "#1d4ed8" },
};

export const PRIORITY_CONFIG: Record<ProjectPriority, {
  label: string; color: string; icon: string;
}> = {
  high:   { label: "High",   color: "#ef4444", icon: "ti-arrow-up"   },
  medium: { label: "Medium", color: "#f59e0b", icon: "ti-minus"      },
  low:    { label: "Low",    color: "#94a3b8", icon: "ti-arrow-down" },
};

export const INVOICE_STATUS_CONFIG: Record<Invoice["status"], {
  label: string; badgeBg: string; badgeColor: string;
}> = {
  paid:    { label: "Paid",    badgeBg: "#f0fdf4", badgeColor: "#15803d" },
  pending: { label: "Pending", badgeBg: "#fffbeb", badgeColor: "#b45309" },
  overdue: { label: "Overdue", badgeBg: "#fef2f2", badgeColor: "#dc2626" },
  draft:   { label: "Draft",   badgeBg: "#f8fafc", badgeColor: "#64748b" },
};

export const DOC_ICON: Record<Document["type"], { icon: string; color: string }> = {
  pdf: { icon: "ti-file-type-pdf", color: "#ef4444" },
  doc: { icon: "ti-file-type-doc", color: "#3b82f6" },
  xls: { icon: "ti-file-type-xls", color: "#22c55e" },
  img: { icon: "ti-photo",         color: "#8b5cf6" },
  zip: { icon: "ti-file-zip",      color: "#f59e0b" },
};

export const ACTIVITY_ICON: Record<ActivityItem["type"], { icon: string; bg: string; color: string }> = {
  message:  { icon: "ti-message-circle", bg: "#eff6ff", color: "#3b82f6" },
  invoice:  { icon: "ti-receipt",        bg: "#f0fdf4", color: "#16a34a" },
  project:  { icon: "ti-layout-kanban",  bg: "#eef2ff", color: "#4f46e5" },
  document: { icon: "ti-file-text",      bg: "#fef3c7", color: "#d97706" },
  note:     { icon: "ti-notes",          bg: "#f5f3ff", color: "#7c3aed" },
  status:   { icon: "ti-circle-check",   bg: "#f0fdf4", color: "#16a34a" },
  call:     { icon: "ti-phone",          bg: "#fff7ed", color: "#ea580c" },
};

/* ─── Extended client metadata ─────────────────────────────────────── */

export const CLIENT_META: Record<number, {
  industry: string;
  size: string;
  location: string;
  website: string;
  plan: string;
}> = {
  1: { industry: "Technology",    size: "51–200",   location: "San Francisco, CA", website: "apex.io",       plan: "Agency Pro" },
  2: { industry: "Media",         size: "11–50",    location: "New York, NY",      website: "nexusdigital.co",plan: "Studio" },
  3: { industry: "SaaS",          size: "201–500",  location: "Austin, TX",        website: "streamline.co",  plan: "Agency Pro" },
  4: { industry: "Manufacturing", size: "501–1000", location: "Chicago, IL",       website: "vertexcorp.com", plan: "Agency Pro" },
  5: { industry: "Aerospace",     size: "1001+",    location: "Houston, TX",       website: "orbital.systems",plan: "Enterprise" },
  6: { industry: "Biotech",       size: "11–50",    location: "Boston, MA",        website: "pinnaclelabs.io",plan: "Studio" },
  7: { industry: "Healthcare",    size: "201–500",  location: "Seattle, WA",       website: "cascadehealth.com",plan: "Agency Pro" },
  8: { industry: "Finance",       size: "51–200",   location: "Miami, FL",         website: "meridian.finance",plan: "Studio" },
  9: { industry: "Education",     size: "11–50",    location: "Denver, CO",        website: "summitlearn.io", plan: "Studio" },
  10:{ industry: "Retail",        size: "501–1000", location: "Los Angeles, CA",   website: "zenithretail.com",plan: "Agency Pro" },
};

/* ─── Projects ──────────────────────────────────────────────────────── */

export const PROJECTS: Project[] = [
  {
    id: 1, name: "Website Redesign", client: "Apex Innovations", clientId: 1,
    description: "Complete overhaul of the marketing site with a new brand identity, improved conversion funnel, and headless CMS integration.",
    status: "active", priority: "high", progress: 68,
    deadline: "2025-02-15", startDate: "2024-11-01", budget: 18000, spent: 12240,
    team: [
      { name: "Sarah Chen",  initials: "SC", color: "#ddd6fe" },
      { name: "Marcus Reid", initials: "MR", color: "#fde68a" },
      { name: "Priya Nair",  initials: "PN", color: "#bbf7d0" },
    ],
    tasks: { total: 34, done: 23 },
    tags: ["Design", "Dev", "CMS"],
  },
  {
    id: 2, name: "Q1 Brand Campaign", client: "Nexus Digital", clientId: 2,
    description: "Multi-channel brand awareness campaign across social, paid, and email. Includes creative assets and performance tracking.",
    status: "review", priority: "high", progress: 85,
    deadline: "2025-01-31", startDate: "2024-12-01", budget: 12000, spent: 10200,
    team: [
      { name: "Jordan Lee",  initials: "JL", color: "#fce7f3" },
      { name: "Alex Torres", initials: "AT", color: "#dbeafe" },
    ],
    tasks: { total: 22, done: 19 },
    tags: ["Marketing", "Social", "Paid"],
  },
  {
    id: 3, name: "Mobile App v2", client: "Streamline Co", clientId: 3,
    description: "Native iOS and Android rebuild with new feature set, improved performance, and design system aligned to updated brand guidelines.",
    status: "active", priority: "high", progress: 41,
    deadline: "2025-04-30", startDate: "2024-12-15", budget: 45000, spent: 18450,
    team: [
      { name: "Dev Sharma",  initials: "DS", color: "#ddd6fe" },
      { name: "Elena Kowal", initials: "EK", color: "#fed7aa" },
      { name: "Jin Park",    initials: "JP", color: "#bbf7d0" },
      { name: "Nadia Brun",  initials: "NB", color: "#fce7f3" },
    ],
    tasks: { total: 87, done: 36 },
    tags: ["iOS", "Android", "Design"],
  },
  {
    id: 4, name: "SEO & Content Strategy", client: "Apex Innovations", clientId: 1,
    description: "12-month content roadmap, technical SEO audit, keyword clustering, and editorial calendar for blog and resource center.",
    status: "active", priority: "medium", progress: 55,
    deadline: "2025-06-30", startDate: "2024-10-01", budget: 8400, spent: 4620,
    team: [
      { name: "Sarah Chen", initials: "SC", color: "#ddd6fe" },
      { name: "Priya Nair", initials: "PN", color: "#bbf7d0" },
    ],
    tasks: { total: 28, done: 15 },
    tags: ["SEO", "Content"],
  },
  {
    id: 5, name: "E-Commerce Integration", client: "Vertex Corp", clientId: 4,
    description: "Shopify Plus setup with custom theme, ERP integration, inventory sync, and B2B wholesale portal for enterprise clients.",
    status: "completed", priority: "medium", progress: 100,
    deadline: "2024-12-20", startDate: "2024-09-01", budget: 22000, spent: 21340,
    team: [
      { name: "Marcus Reid", initials: "MR", color: "#fde68a" },
      { name: "Alex Torres", initials: "AT", color: "#dbeafe" },
      { name: "Jin Park",    initials: "JP", color: "#bbf7d0" },
    ],
    tasks: { total: 56, done: 56 },
    tags: ["E-commerce", "Dev", "ERP"],
  },
  {
    id: 6, name: "Analytics Dashboard", client: "Orbital Systems", clientId: 5,
    description: "Custom data visualization dashboard for ops team. Real-time KPIs, custom chart library, and role-based access views.",
    status: "planning", priority: "medium", progress: 12,
    deadline: "2025-05-15", startDate: "2025-01-15", budget: 28000, spent: 3360,
    team: [
      { name: "Dev Sharma",  initials: "DS", color: "#ddd6fe" },
      { name: "Elena Kowal", initials: "EK", color: "#fed7aa" },
    ],
    tasks: { total: 45, done: 5 },
    tags: ["Analytics", "Dev", "Data"],
  },
  {
    id: 7, name: "Employer Brand Refresh", client: "Pinnacle Labs", clientId: 6,
    description: "Careers page redesign, LinkedIn presence audit, job description templates, and culture video production series.",
    status: "hold", priority: "low", progress: 30,
    deadline: "2025-03-31", startDate: "2024-11-15", budget: 9500, spent: 2850,
    team: [
      { name: "Jordan Lee", initials: "JL", color: "#fce7f3" },
    ],
    tasks: { total: 18, done: 5 },
    tags: ["Brand", "HR", "Video"],
  },
  {
    id: 8, name: "API Documentation", client: "Cascade Health", clientId: 7,
    description: "Developer documentation portal with interactive API explorer, SDK guides, and integration tutorials for third-party devs.",
    status: "review", priority: "low", progress: 90,
    deadline: "2025-01-25", startDate: "2024-11-01", budget: 6000, spent: 5400,
    team: [
      { name: "Priya Nair",  initials: "PN", color: "#bbf7d0" },
      { name: "Alex Torres", initials: "AT", color: "#dbeafe" },
    ],
    tasks: { total: 20, done: 18 },
    tags: ["Docs", "Dev"],
  },
];

/* ─── Invoices ─────────────────────────────────────────────────────── */

export const INVOICES: Invoice[] = [
  { id: "INV-1024", clientId: 1, project: "Website Redesign",   amount: 6000,  status: "paid",    date: "2024-12-01", dueDate: "2024-12-15" },
  { id: "INV-1025", clientId: 1, project: "Website Redesign",   amount: 6000,  status: "paid",    date: "2025-01-01", dueDate: "2025-01-15" },
  { id: "INV-1031", clientId: 1, project: "SEO & Content",      amount: 2100,  status: "pending", date: "2025-01-10", dueDate: "2025-01-25" },
  { id: "INV-1033", clientId: 1, project: "Website Redesign",   amount: 6000,  status: "pending", date: "2025-01-15", dueDate: "2025-02-01" },
  { id: "INV-1018", clientId: 2, project: "Q1 Brand Campaign",  amount: 5100,  status: "paid",    date: "2024-12-15", dueDate: "2024-12-30" },
  { id: "INV-1029", clientId: 2, project: "Q1 Brand Campaign",  amount: 5100,  status: "overdue", date: "2025-01-01", dueDate: "2025-01-15" },
  { id: "INV-1010", clientId: 3, project: "Mobile App v2",      amount: 9000,  status: "paid",    date: "2024-12-15", dueDate: "2024-12-31" },
  { id: "INV-1030", clientId: 3, project: "Mobile App v2",      amount: 9000,  status: "pending", date: "2025-01-15", dueDate: "2025-01-31" },
];

/* ─── Documents ────────────────────────────────────────────────────── */

export const DOCUMENTS: Document[] = [
  { id: 1, clientId: 1, name: "Brand Guidelines v3.pdf",     type: "pdf", size: "4.2 MB",  uploadedBy: "Sarah Chen",  date: "2025-01-08" },
  { id: 2, clientId: 1, name: "Website Scope of Work.pdf",   type: "pdf", size: "1.1 MB",  uploadedBy: "Marcus Reid", date: "2024-11-05" },
  { id: 3, clientId: 1, name: "Content Audit 2024.xlsx",     type: "xls", size: "890 KB",  uploadedBy: "Priya Nair",  date: "2024-10-20" },
  { id: 4, clientId: 1, name: "Design Mockups — Final.zip",  type: "zip", size: "28 MB",   uploadedBy: "Sarah Chen",  date: "2025-01-12" },
  { id: 5, clientId: 1, name: "Meeting Notes Jan 15.doc",    type: "doc", size: "45 KB",   uploadedBy: "Marcus Reid", date: "2025-01-15" },
  { id: 6, clientId: 2, name: "Campaign Brief Q1.pdf",       type: "pdf", size: "2.3 MB",  uploadedBy: "Jordan Lee",  date: "2024-12-02" },
  { id: 7, clientId: 2, name: "Ad Creative Assets.zip",      type: "zip", size: "142 MB",  uploadedBy: "Jordan Lee",  date: "2024-12-18" },
  { id: 8, clientId: 3, name: "App Wireframes v2.pdf",       type: "pdf", size: "8.7 MB",  uploadedBy: "Dev Sharma",  date: "2025-01-05" },
  { id: 9, clientId: 3, name: "Design System.zip",           type: "zip", size: "34 MB",   uploadedBy: "Dev Sharma",  date: "2025-01-10" },
];

/* ─── Activity feed ────────────────────────────────────────────────── */

export const ACTIVITIES: ActivityItem[] = [
  { id: 1,  clientId: 1, type: "message",  user: "Sarah Chen",  userInitials: "SC", userColor: "#ddd6fe",
    action: "sent a message", detail: "Quick question about the hero section — should we go with the split or centered approach? The client seems to lean centered based on the mood board.", date: "Today",  time: "10:42 AM" },
  { id: 2,  clientId: 1, type: "document", user: "Sarah Chen",  userInitials: "SC", userColor: "#ddd6fe",
    action: "uploaded Design Mockups — Final.zip", date: "Today",  time: "10:38 AM" },
  { id: 3,  clientId: 1, type: "invoice",  user: "Marcus Reid", userInitials: "MR", userColor: "#fde68a",
    action: "created invoice INV-1033 for $6,000", date: "Jan 15", time: "9:15 AM" },
  { id: 4,  clientId: 1, type: "project",  user: "Priya Nair",  userInitials: "PN", userColor: "#bbf7d0",
    action: "updated Website Redesign to 68% complete", date: "Jan 14", time: "4:50 PM" },
  { id: 5,  clientId: 1, type: "call",     user: "Marcus Reid", userInitials: "MR", userColor: "#fde68a",
    action: "logged a call · 24 min", detail: "Reviewed CMS options — client prefers Contentful over Sanity. Will follow up with a detailed comparison doc by Thursday.", date: "Jan 14", time: "2:30 PM" },
  { id: 6,  clientId: 1, type: "note",     user: "You",         userInitials: "AN", userColor: "#e0e7ff",
    action: "added a note", detail: "Client is very engaged and highly responsive. They prefer async communication via email. Budget is flexible if scope expands thoughtfully.", date: "Jan 12", time: "11:00 AM" },
  { id: 7,  clientId: 1, type: "invoice",  user: "Marcus Reid", userInitials: "MR", userColor: "#fde68a",
    action: "marked INV-1025 as paid · $6,000", date: "Jan 10", time: "9:00 AM" },
  { id: 8,  clientId: 1, type: "document", user: "Priya Nair",  userInitials: "PN", userColor: "#bbf7d0",
    action: "uploaded Meeting Notes Jan 15.doc", date: "Jan 10", time: "8:30 AM" },
  { id: 9,  clientId: 1, type: "status",   user: "Marcus Reid", userInitials: "MR", userColor: "#fde68a",
    action: "changed status from New → Active", date: "Nov 1",  time: "10:00 AM" },
  { id: 10, clientId: 1, type: "project",  user: "Sarah Chen",  userInitials: "SC", userColor: "#ddd6fe",
    action: "created project Website Redesign", date: "Nov 1",  time: "9:45 AM" },
];

/* ─── Notes ────────────────────────────────────────────────────────── */

export const NOTES: ClientNote[] = [
  {
    id: 1, clientId: 1, author: "Marcus Reid", authorInitials: "MR", authorColor: "#fde68a",
    body: "Client is very engaged and highly responsive. They prefer async communication via email rather than Slack. Budget has some flexibility if scope expands thoughtfully — they've mentioned up to 15% overage is fine.",
    date: "Jan 12, 2025",
  },
  {
    id: 2, clientId: 1, author: "Sarah Chen", authorInitials: "SC", authorColor: "#ddd6fe",
    body: "Key stakeholder is their VP of Marketing, Dana Kim. She is the decision maker on design approvals. Their CTO (Raj Patel) reviews technical deliverables. Avoid scheduling review calls on Thursdays.",
    date: "Nov 8, 2024",
  },
];
