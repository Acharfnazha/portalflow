// ============================================================
//  PortalFlow — Shared Application Types
// ============================================================

// ── Plans ────────────────────────────────────────────────────
export type Plan = "studio" | "agency" | "enterprise";
export type BillingInterval = "month" | "year";
export type SubscriptionStatus =
  | "trialing"
  | "active"
  | "past_due"
  | "canceled"
  | "paused";

// ── User / Auth ───────────────────────────────────────────────
export type UserRole = "owner" | "admin" | "manager" | "member";

export interface User {
  id: string;
  organizationId: string;
  fullName: string;
  email: string;
  avatarUrl?: string;
  role: UserRole;
  title?: string;
  phone?: string;
  timezone: string;
  lastSeenAt?: string;
  createdAt: string;
}

// ── Organization ──────────────────────────────────────────────
export interface Organization {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string;
  plan: Plan;
  subscriptionStatus: SubscriptionStatus;
  trialEndsAt?: string;
  storageUsedBytes: number;
  settings: Record<string, unknown>;
  createdAt: string;
}

// ── Clients ───────────────────────────────────────────────────
export type ClientStatus = "new" | "active" | "trial" | "at_risk" | "churned";
export type CompanySize = "1-10" | "11-50" | "51-200" | "201-500" | "500+";

export interface Client {
  id: string;
  organizationId: string;
  ownerId?: string;
  name: string;
  email?: string;
  phone?: string;
  website?: string;
  domain?: string;
  status: ClientStatus;
  industry?: string;
  companySize?: CompanySize;
  location?: string;
  avatarUrl?: string;
  tags: string[];
  mrrCents: number;
  healthScore: number;
  portalEnabled: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ClientContact {
  id: string;
  clientId: string;
  name: string;
  email?: string;
  phone?: string;
  role?: string;
  isPrimary: boolean;
}

// ── Projects ──────────────────────────────────────────────────
export type ProjectStatus =
  | "planning"
  | "active"
  | "in_review"
  | "on_hold"
  | "completed"
  | "canceled";
export type ProjectPriority = "high" | "medium" | "low";

export interface Project {
  id: string;
  organizationId: string;
  clientId: string;
  createdBy?: string;
  name: string;
  description?: string;
  status: ProjectStatus;
  priority: ProjectPriority;
  progress: number;
  startDate?: string;
  deadline?: string;
  budgetCents: number;
  spentCents: number;
  visibleToClient: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ProjectMember {
  projectId: string;
  userId: string;
  role: "lead" | "contributor" | "viewer";
  assignedAt: string;
}

// ── Documents ─────────────────────────────────────────────────
export type DocumentStatus = "processing" | "ready" | "quarantined" | "deleted";
export type DocumentFileType = "pdf" | "doc" | "xls" | "img" | "zip" | "other";

export interface Document {
  id: string;
  organizationId: string;
  clientId?: string;
  projectId?: string;
  uploadedBy?: string;
  name: string;
  filePath: string;
  fileUrl?: string;
  fileType?: DocumentFileType;
  mimeType?: string;
  sizeBytes: number;
  version: number;
  parentId?: string;
  status: DocumentStatus;
  visibleToClient: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

// ── Invoices ──────────────────────────────────────────────────
export type InvoiceStatus =
  | "draft"
  | "pending"
  | "paid"
  | "overdue"
  | "void"
  | "refunded";

export interface Invoice {
  id: string;
  organizationId: string;
  clientId: string;
  projectId?: string;
  createdBy?: string;
  invoiceNumber: string;
  status: InvoiceStatus;
  currency: string;
  subtotalCents: number;
  taxRate: number;
  taxCents: number;
  discountCents: number;
  totalCents: number;
  amountPaidCents: number;
  notes?: string;
  terms?: string;
  issuedAt?: string;
  dueAt?: string;
  paidAt?: string;
  sentAt?: string;
  viewedAt?: string;
  pdfPath?: string;
  stripePaymentIntentId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceLineItem {
  id: string;
  invoiceId: string;
  description: string;
  quantity: number;
  unitPriceCents: number;
  totalCents: number;
  sortOrder: number;
}

// ── Payments ──────────────────────────────────────────────────
export type PaymentStatus =
  | "pending"
  | "succeeded"
  | "failed"
  | "refunded"
  | "partially_refunded";
export type PaymentMethod =
  | "stripe"
  | "bank_transfer"
  | "cash"
  | "check"
  | "crypto"
  | "other";

export interface Payment {
  id: string;
  organizationId: string;
  invoiceId: string;
  clientId: string;
  amountCents: number;
  currency: string;
  status: PaymentStatus;
  method: PaymentMethod;
  referenceNumber?: string;
  stripePaymentIntentId?: string;
  stripeChargeId?: string;
  paidAt?: string;
  refundAmountCents: number;
  refundedAt?: string;
  createdAt: string;
}

// ── Activity ──────────────────────────────────────────────────
export type ActivityEntityType =
  | "client"
  | "project"
  | "invoice"
  | "document"
  | "payment"
  | "user"
  | "subscription"
  | "portal_session"
  | "organization";

export interface ActivityLog {
  id: string;
  organizationId: string;
  actorId?: string;
  entityType: ActivityEntityType;
  entityId: string;
  action: string;
  description?: string;
  changes?: { before: unknown; after: unknown };
  createdAt: string;
}

// ── Portal ────────────────────────────────────────────────────
export interface PortalSession {
  id: string;
  clientId: string;
  createdBy: string;
  token: string;
  expiresAt: string;
  lastUsedAt?: string;
  createdAt: string;
}

// ── Subscriptions ─────────────────────────────────────────────
export interface Subscription {
  id: string;
  organizationId: string;
  stripeSubscriptionId?: string;
  stripeCustomerId?: string;
  stripePriceId?: string;
  plan: Plan;
  status: SubscriptionStatus;
  billingInterval: BillingInterval;
  seats: number;
  currentPeriodStart?: string;
  currentPeriodEnd?: string;
  trialStart?: string;
  trialEnd?: string;
  cancelAtPeriodEnd: boolean;
  canceledAt?: string;
  createdAt: string;
}

// ── API Responses ─────────────────────────────────────────────
export interface ApiResponse<T> {
  data: T;
  error?: never;
}
export interface ApiError {
  data?: never;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}
export type ApiResult<T> = ApiResponse<T> | ApiError;

// ── Table / List ──────────────────────────────────────────────
export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export type SortDir = "asc" | "desc";
export interface SortState<K extends string> {
  key: K;
  dir: SortDir;
}

// ── Navigation ────────────────────────────────────────────────
export interface NavItem {
  label: string;
  href: string;
  icon: string;
  badge?: number;
  children?: NavItem[];
}

// ── File Upload ───────────────────────────────────────────────
export interface UploadProgress {
  fileId: string;
  fileName: string;
  progress: number;
  status: "pending" | "uploading" | "complete" | "error";
  error?: string;
}

// ── Plan Limits ───────────────────────────────────────────────
export interface PlanLimitResult {
  allowed: boolean;
  current: number;
  limit: number | null;
  plan: Plan;
}
