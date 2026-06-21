# Changelog

All notable changes to PortalFlow are documented here.

Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [0.10.0] — 2026-06-20 · Sprint 10: Marketing Launch

### Added
- Comprehensive README with screenshots section, demo flow, and architecture overview
- `docs/` folder: PRODUCT.md, ARCHITECTURE.md, ROADMAP.md, CHANGELOG.md
- `docs/screenshots/` directory for product screenshots

### Changed
- README fully rewritten — badges, feature map, tech stack table, quick start, env var reference, subscription plan table, deployment guide, security checklist

---

## [0.9.0] — 2026-06-20 · Sprint 9: Final QA

### Added
- Real dashboard home page with live KPI cards (clients, projects, MRR, open invoices), recent activity feed, quick actions panel, and at-a-glance stats
- New `InvoicesDashboard` client component — replaced mock data shell with real Supabase data
- Payments page — real payment history from Supabase with summary cards and table
- `favicon.svg` — branded SVG favicon in `/app/`
- Per-route layout files for auth pages with correct page titles (Sign in / Start free trial / Reset password)
- Open Graph + Twitter Card metadata in root layout
- `metadataBase` set from `NEXT_PUBLIC_SITE_URL`
- `title.template: "%s — PortalFlow"` for automatic page titles

### Fixed
- `/dashboard/projects` and `/dashboard/documents` redirected to `/auth/login` (not found) — corrected to `/login`
- Both pages redirected to `/onboarding` (not found) — corrected to `/dashboard`
- Sidebar showed hardcoded badge `42` on Clients and `3` on Invoices — removed
- Sidebar showed hardcoded "Studio plan" — now shows actual user role

### Changed
- `next.config.ts` — added `turbopack.root` (silences monorepo warning), `images.remotePatterns` for Supabase Storage
- `.env.local.example` — updated with all Sprint 6 + 7 variables

---

## [0.8.0] — 2026-06-20 · Sprint 8: Production Deployment

### Added
- `turbopack.root` in `next.config.ts` to silence monorepo lockfile warning
- `images.remotePatterns` for Supabase Storage domains
- Full `.env.local.example` with all 15 environment variables documented

### Fixed
- Stripe API version `"2026-05-27.dahlia"` — matches installed stripe v22 package
- `Invoice.subscription` not typed in new Stripe API — used `unknown` cast in webhook handler
- `Subscription.current_period_start/end` not typed — used `unknown` cast with fallback

### Documentation
- Sprint 8 deployment reference with exact Supabase and Stripe URL values
- Security audit table (all passing)

---

## [0.7.0] — 2026-06-19 · Sprint 7: SaaS Billing

### Added
- `src/lib/stripe.ts` — Stripe singleton, `getPriceId()`, `planFromPriceId()`
- `src/lib/supabase/billing-actions.ts` — `createCheckoutSessionAction`, `changePlanAction`, `createBillingPortalAction`, `cancelSubscriptionAction`, `resumeSubscriptionAction`
- `src/app/api/webhooks/stripe/route.ts` — webhook handler with signature verification; handles 6 event types
- `src/components/dashboard/settings/billing-shell.tsx` — billing page UI with plan cards, interval toggle, current plan display, cancel/resume
- `src/app/dashboard/settings/billing/page.tsx` — server component fetching real subscription data
- `PLAN_CONFIG` in `constants.ts` — Starter / Pro / Agency plan definitions with features and limits

### Changed
- `PLAN_PRICES` in `constants.ts` — added enterprise pricing

---

## [0.6.0] — 2026-06-18 · Sprint 6: Email & Notifications

### Added
- `supabase/migrations/012_notifications.sql` — `notifications` table with RLS
- `src/lib/email.ts` — Resend integration with graceful fallback (copy/mailto)
- `src/lib/email-templates.ts` — `portalInviteTemplate()` with inline-CSS HTML
- `src/lib/supabase/notification-actions.ts` — `createNotification`, `getNotificationsAction`, `markReadAction`, `markAllReadAction`, `sendPortalInviteAction`
- `src/components/dashboard/notification-bell.tsx` — real notification bell with unread count, type icons, mark-as-read
- `src/types/app.types.ts` — `NotificationType` union, `Notification` interface

### Changed
- `src/components/dashboard/topbar.tsx` — replaced 60-line mock bell with `<NotificationBell />`
- `src/components/dashboard/client-profile/portal-card.tsx` — added "Send portal invite" button with fallback UI
- `src/lib/supabase/document-actions.ts` — fires `document_uploaded` notification after upload
- `src/lib/supabase/client-actions.ts` — fires `client_created` notification after create
- `src/lib/supabase/project-actions.ts` — fires `project_created` notification after create

---

## [0.5.0] — 2026-06-17 · Sprint 5: Client Portal

### Added
- `supabase/migrations/011_portal_tokens.sql`
- `src/lib/supabase/portal-actions.ts` — `getPortalContext`, `getPortalProjects`, `getPortalDocuments`, `getPortalInvoices`
- `src/app/portal/[token]/layout.tsx` — token validation (404 guard), `<PortalNav>`
- `src/app/portal/[token]/page.tsx` — overview with KPI cards and recent activity
- `src/app/portal/[token]/projects/page.tsx` — project list with status, progress bar, overdue indicator
- `src/app/portal/[token]/documents/page.tsx` — document list with signed URL downloads
- `src/app/portal/[token]/invoices/page.tsx` — invoice table with summary cards
- `src/components/portal/portal-nav.tsx` — portal navigation component
- Portal link copy, regenerate token, and preview actions in `portal-card.tsx`

---

## [0.4.0] — 2026-06-16 · Sprint 4: Documents Module

### Added
- `supabase/migrations/010_documents_module.sql`
- Document upload modal with drag-and-drop, Supabase Storage integration
- Document library with search, type filter, client/project filters
- Signed URL generation for secure downloads
- File type icons and size formatting

---

## [0.3.0] — 2026-06-15 · Sprint 3: Projects Module

### Added
- Project CRUD (create, edit, soft-delete)
- Project detail page with tabs
- Project form with client assignment, status, priority, deadline, budget
- Project list with KPI cards (total, active, completed, overdue)
- Status badges, progress bars, priority indicators

---

## [0.2.0] — 2026-06-14 · Sprint 2: Clients Module

### Added
- Full client CRM with CRUD operations
- Client profile with 6 tabs: Overview, Projects, Invoices, Documents, Notes, Activity
- Health score, MRR, status tracking (New/Active/Trial/At Risk/Churned)
- Contact management, tag system
- Bulk selection and delete
- Paginated client list with search and filter
- Activity timeline auto-logged on mutations

---

## [0.1.0] — 2026-06-13 · Sprint 1: Foundation

### Added
- Next.js 16 App Router project with TypeScript
- Supabase auth integration (`@supabase/ssr`) — email/password, magic link, password reset
- Multi-tenant organization system — one org per signup, RLS-enforced isolation
- Role-based permissions — Owner, Admin, Manager, Staff
- Dashboard shell — sidebar navigation, topbar, layout
- Team management — invite by email, role assignment
- Marketing landing page — hero, features, pricing, FAQ, testimonials
- SQL migrations 001–009 covering full schema and RLS
