# PortalFlow — Product Overview

> Last updated: June 2026

---

## What is PortalFlow?

PortalFlow is a SaaS client portal platform for freelancers and agencies. It solves the problem every agency has: clients asking "where are we on the project?" by email, documents scattered across Drive links, invoices tracked in spreadsheets.

PortalFlow gives you a single workspace to manage your clients — and gives each client a secure, branded portal to track everything in real time.

---

## Who is it for?

| User | Problem solved |
|---|---|
| **Freelancer** | Stop answering "invoice status?" DMs. Clients see everything in the portal. |
| **Small agency (2–10 people)** | One workspace for all clients, shared by the whole team with role-based access. |
| **Creative studio** | Professional client experience — looks like an enterprise product, costs $29/month. |
| **Consultant** | Project updates and document delivery without a back-and-forth email chain. |

---

## User Stories

### Agency user (workspace member)
- As an **owner**, I can create a workspace and invite my team.
- As a **manager**, I can add clients, create projects, upload documents, and send invoices.
- As any **team member**, I can view clients and projects assigned to me.
- As an **owner**, I can manage the subscription and billing.

### Client (portal visitor)
- As a **client**, I receive a portal link by email.
- I can view my active projects, their progress, and status.
- I can download invoices and see payment status.
- I can download documents shared with me.
- I never need to create an account.

---

## Feature Map

### Workspace

| Feature | Status | Notes |
|---|---|---|
| Signup / login | ✅ Live | Email + password; magic link on reset |
| Multi-tenant orgs | ✅ Live | One org per account; RLS-enforced isolation |
| Team invites | ✅ Live | Email invite flow; role assignment |
| Role permissions | ✅ Live | Owner · Admin · Manager · Staff |
| Notifications | ✅ Live | Bell with unread count; mark-as-read |
| Dashboard home | ✅ Live | Live KPIs, activity feed, quick actions |

### Client Management

| Feature | Status | Notes |
|---|---|---|
| Client CRUD | ✅ Live | Create, edit, soft-delete |
| Status tracking | ✅ Live | New / Active / Trial / At Risk / Churned |
| MRR tracking | ✅ Live | Monthly recurring revenue per client |
| Health score | ✅ Live | 0–100 visual bar |
| Contact management | ✅ Live | Multiple contacts per client |
| Activity timeline | ✅ Live | Auto-logged on all mutations |
| Bulk operations | ✅ Live | Select + bulk delete/export |
| Search + filter | ✅ Live | Full-text search, status filter, pagination |
| Tags | ✅ Live | Free-form tagging |

### Projects

| Feature | Status | Notes |
|---|---|---|
| Project CRUD | ✅ Live | Create, edit, soft-delete |
| Status lifecycle | ✅ Live | Planning → Active → In Review → Completed |
| Priority levels | ✅ Live | High / Medium / Low |
| Progress bar | ✅ Live | 0–100% manual or computed |
| Deadline tracking | ✅ Live | Overdue indicator |
| Client visibility | ✅ Live | Toggle per project |
| Budget tracking | ✅ Live | Budget vs spent (cents) |

### Documents

| Feature | Status | Notes |
|---|---|---|
| File upload | ✅ Live | Supabase Storage, drag-and-drop |
| File types | ✅ Live | PDF, DOCX, XLSX, images, ZIP, CSV |
| Signed URLs | ✅ Live | Expiring secure download links |
| Client sharing | ✅ Live | Toggle per document |
| Search + filter | ✅ Live | By name, type, client, project |

### Invoicing

| Feature | Status | Notes |
|---|---|---|
| Invoice list | ✅ Live | Real Supabase data, filterable |
| Status lifecycle | ✅ Live | Draft → Pending → Paid → Overdue → Void |
| Line items | ✅ Schema | UI via client profile tab |
| Tax support | ✅ Schema | tax_rate + tax_cents columns |
| CSV export | ✅ Live | Download filtered invoice list |
| Payment tracking | ✅ Live | Payment history with method + status |
| Stripe checkout | 🔲 Planned | Client pays invoice from portal |
| PDF generation | 🔲 Planned | Download as PDF |

### Client Portal

| Feature | Status | Notes |
|---|---|---|
| Token-based access | ✅ Live | UUID token in URL; no login |
| Overview page | ✅ Live | KPI cards + recent activity |
| Projects view | ✅ Live | Filtered to visible projects |
| Invoices view | ✅ Live | Filtered to non-draft invoices |
| Documents view | ✅ Live | Filtered to shared documents |
| Portal invite email | ✅ Live | Resend integration + fallback |
| Regenerate token | ✅ Live | Invalidates old portal link |

### Billing

| Feature | Status | Notes |
|---|---|---|
| Subscription plans | ✅ Live | Starter / Pro / Agency |
| Stripe Checkout | ✅ Live | New subscription flow |
| Stripe Billing Portal | ✅ Live | Self-serve plan changes |
| Annual pricing | ✅ Live | 20% discount, toggle UI |
| Webhook sync | ✅ Live | DB always mirrors Stripe state |
| Cancel / resume | ✅ Live | Cancel at period end; resumable |

---

## Pages

| Route | Auth | Description |
|---|---|---|
| `/` | Public | Marketing landing page |
| `/login` | Public | Email + password sign-in |
| `/signup` | Public | New workspace registration |
| `/forgot-password` | Public | Password reset request |
| `/reset-password` | Public | Set new password (from email link) |
| `/dashboard` | Auth | Home with KPIs and activity |
| `/dashboard/clients` | Auth | Client list with search, filter, pagination |
| `/dashboard/clients/[id]` | Auth | Client profile with 6 tabs |
| `/dashboard/projects` | Auth | Project list |
| `/dashboard/projects/new` | Auth | New project form |
| `/dashboard/projects/[id]` | Auth | Project detail |
| `/dashboard/documents` | Auth | Document library + upload |
| `/dashboard/invoices` | Auth | Invoice list (real data) |
| `/dashboard/payments` | Auth | Payment history |
| `/dashboard/team` | Auth | Team members + invite |
| `/dashboard/settings` | Auth | Organization settings |
| `/dashboard/settings/profile` | Auth | Personal profile |
| `/dashboard/settings/billing` | Auth | Subscription + plans |
| `/portal/[token]` | Token | Client portal overview |
| `/portal/[token]/projects` | Token | Client's projects |
| `/portal/[token]/invoices` | Token | Client's invoices |
| `/portal/[token]/documents` | Token | Client's documents |
| `/api/webhooks/stripe` | Stripe sig | Subscription event handler |

---

## Deployment

### Production (Vercel)

1. Push repo to GitHub
2. Connect to Vercel; set environment variables
3. Set `NEXT_PUBLIC_SITE_URL` to your domain
4. Update Supabase Auth → URL Configuration
5. Create Stripe webhook pointing to `/api/webhooks/stripe`
6. Run SQL migrations 001–012 in production Supabase

### Environment

The app is stateless — all state lives in Supabase and Stripe. Vercel Edge handles serving; no persistent server needed.

---

## Pricing Rationale

| Plan | Target | Price | Key limit |
|---|---|---|---|
| **Starter** | Solo freelancer | $29/mo | 20 clients, 5 projects |
| **Pro** | Small agency | $79/mo | Unlimited + 5 seats |
| **Agency** | Studio / reseller | $199/mo | White-label + custom domain |

Annual plans save 20% (billed as one payment).
