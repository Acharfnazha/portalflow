<div align="center">

<img src="public/logo.svg" alt="PortalFlow" width="64" height="64" />

# PortalFlow

**Client portals that make you look enterprise.**

Give every client a secure, beautifully branded place for projects, invoices, documents, and updates. Stop chasing email threads.

[![Next.js](https://img.shields.io/badge/Next.js_16-App_Router-black?logo=next.js&logoColor=white)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript_5-strict-3178c6?logo=typescript&logoColor=white)](https://typescriptlang.org)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL_+_RLS-3ecf8e?logo=supabase&logoColor=white)](https://supabase.com)
[![Stripe](https://img.shields.io/badge/Stripe-Billing-635bff?logo=stripe&logoColor=white)](https://stripe.com)
[![Vercel](https://img.shields.io/badge/Vercel-Deployed-black?logo=vercel&logoColor=white)](https://vercel.com)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

[**Live Demo**](https://portalflow.vercel.app) · [**Docs**](docs/PRODUCT.md) · [**Architecture**](docs/ARCHITECTURE.md) · [**Changelog**](docs/CHANGELOG.md)

</div>

---

## What is PortalFlow?

PortalFlow is a production-ready SaaS platform built for freelancers and agencies. It replaces the chaos of scattered client emails, shared Google Drive folders, and manual invoice chasing with one clean, professional workspace.

Each client gets a **unique, token-based portal** — a beautifully designed read-only view of their projects, invoices, and documents. No client login required. Just share a link.

Built as a **30-day sprint project** to demonstrate full-stack SaaS architecture at production quality.

---

## Screenshots

> _Screenshots show the live application with seed data._

| Landing Page | Dashboard |
|---|---|
| ![Landing](docs/screenshots/landing.png) | ![Dashboard](docs/screenshots/dashboard.png) |

| Client Profile | Client Portal |
|---|---|
| ![Client](docs/screenshots/client-profile.png) | ![Portal](docs/screenshots/portal.png) |

| Invoices | Billing |
|---|---|
| ![Invoices](docs/screenshots/invoices.png) | ![Billing](docs/screenshots/billing.png) |

---

## Features

### Core Workspace
- **Dashboard** — Live KPI cards (clients, projects, MRR, open invoices), recent activity feed, quick actions
- **Client CRM** — Full client management with status tracking (Active / At Risk / Churned), MRR, health scores, contact info, and activity history
- **Project Tracking** — Project lifecycle management with progress bars, deadlines, priorities, and per-client visibility controls
- **Document Hub** — Upload and share files via signed Supabase Storage URLs — PDFs, images, spreadsheets, and more
- **Invoicing** — Create and track invoices with line items, tax rates, and full status lifecycle (Draft → Pending → Paid → Overdue)
- **Payment History** — Track payments received, matched to invoices and clients

### Client Portal
- **Token-based access** — Each client gets a unique `/portal/[token]` URL — no login, no friction
- **Projects view** — Progress, status, deadlines; only projects marked visible to the client
- **Invoices view** — Invoice history with amounts and status; draft and void invoices hidden
- **Documents view** — Signed URL downloads; only documents shared with the client
- **Portal invites** — One-click email invite via Resend; graceful fallback to copy/mailto

### Team & Settings
- **Team management** — Invite teammates with role-based permissions (Owner · Admin · Manager · Staff)
- **Notifications** — Real-time bell with unread count; events for client creation, project updates, document uploads, invoice events; mark-as-read
- **Organization settings** — Workspace name, slug, website, timezone
- **Profile settings** — Name, job title, avatar URL

### Billing
- **Three plans** — Starter ($29/mo), Pro ($79/mo), Agency ($199/mo)
- **Stripe Checkout** — Hosted subscription flow for new sign-ups
- **Stripe Billing Portal** — Self-serve plan changes, payment method updates, cancellation
- **Webhook-synced state** — Subscription status always in sync via `customer.subscription.*` events
- **Annual pricing** — 20% discount, toggle on the billing page

---

## Tech Stack

| Layer | Technology | Why |
|---|---|---|
| **Framework** | Next.js 16 (App Router) | Server Components for data fetching; no waterfall loading |
| **Language** | TypeScript 5 (strict) | End-to-end type safety across DB → UI |
| **Database** | Supabase PostgreSQL | Managed Postgres with RLS, realtime, migrations |
| **Auth** | Supabase Auth (`@supabase/ssr`) | Cookie-based sessions, SSR-compatible |
| **Storage** | Supabase Storage | Signed URLs for secure, expiring file access |
| **Billing** | Stripe | Checkout, Billing Portal, Webhooks (signature-verified) |
| **Email** | Resend | HTML transactional email; optional — fallback built-in |
| **State** | Zustand | Lightweight client-side state (toasts, UI) |
| **Styling** | CSS custom properties | No Tailwind, no CSS-in-JS — raw CSS variables for performance |
| **Icons** | Tabler Icons | 5,000+ consistent open-source icons |
| **Animations** | Framer Motion | Page transitions, collapsible sections |
| **Deployment** | Vercel | Edge-native, zero-config Next.js hosting |

---

## Architecture at a Glance

```
Browser
  │
  ├── Public routes (/portal/[token]/*)
  │     └── Service client (server-only) resolves token → client
  │         Data scoped to that client only (RLS + service role)
  │
  ├── Auth routes (/(auth)/*)
  │     └── Supabase Auth → cookie session → redirect to /dashboard
  │
  └── Dashboard (/dashboard/*)
        └── Anon client (cookie session) → RLS auto-scopes to org
            Server Components fetch data → Client Components handle interactivity
            Server Actions for all mutations (no exposed API routes)

Database (Supabase PostgreSQL)
  ├── RLS on every table — users see only their organization's data
  ├── Portal visitors scoped via SET LOCAL app.portal_client_id
  └── Service role used server-side only (webhooks, portal token resolution)

Billing (Stripe)
  ├── Checkout Session → subscription created
  ├── Webhook (/api/webhooks/stripe) → verified → DB upsert
  └── Billing Portal → plan changes, payment methods, cancellation
```

Full architecture details: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)

---

## Project Structure

```
src/
├── app/
│   ├── (auth)/              # Login, signup, forgot-password, reset-password
│   ├── auth/                # OAuth callback, invite acceptance, email check
│   ├── dashboard/           # Protected workspace
│   │   ├── page.tsx         # Dashboard home (live KPIs + activity)
│   │   ├── clients/         # Client list + [id] profile (6 tabs)
│   │   ├── projects/        # Project list + detail + new/edit
│   │   ├── documents/       # Document library with upload modal
│   │   ├── invoices/        # Invoice list (real Supabase data)
│   │   ├── payments/        # Payment history
│   │   ├── team/            # Team management + invites
│   │   └── settings/        # General · Profile · Billing
│   ├── portal/[token]/      # Client portal (token-based, no login)
│   └── api/webhooks/stripe/ # Stripe webhook handler
├── components/
│   ├── dashboard/           # All dashboard UI components (~40 files)
│   ├── portal/              # Portal nav
│   ├── shared/              # Page header, confirm dialog, file uploader
│   └── ui/                  # Design system (empty state, badge, avatar…)
├── lib/
│   ├── supabase/            # Server/service clients + all server actions
│   ├── stripe.ts            # Stripe singleton, plan helpers, price ID lookup
│   ├── email.ts             # Resend integration with graceful fallback
│   ├── email-templates.ts   # Inline-CSS HTML email templates
│   ├── constants.ts         # Plan config, status configs, design tokens
│   ├── format.ts            # Currency, date, file size formatters
│   └── permissions.ts       # Role-based permission helpers
└── types/
    └── app.types.ts         # All shared TypeScript interfaces
supabase/
└── migrations/              # 001–012 SQL (schema, RLS, functions, modules)
docs/
├── PRODUCT.md               # Product overview and user stories
├── ARCHITECTURE.md          # System design and data flow
├── ROADMAP.md               # Planned features and timeline
└── CHANGELOG.md             # Release history
```

---

## Quick Start

### Prerequisites

| Tool | Version |
|---|---|
| Node.js | 18+ |
| npm | 9+ |
| Supabase account | [supabase.com](https://supabase.com) — free tier works |
| Stripe account _(optional)_ | Test mode only for billing |
| Resend account _(optional)_ | Portal invite emails |

### 1 · Clone and install

```bash
git clone https://github.com/Acharfnazha/portalflow.git
cd portalflow
npm install
```

### 2 · Configure environment

```bash
cp .env.local.example .env.local
```

Minimum required:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
NEXT_PUBLIC_SITE_URL=http://localhost:3001
```

See [`.env.local.example`](.env.local.example) for the full variable list including Stripe and Resend.

> **Never commit `.env.local`.** It is already in `.gitignore`.

### 3 · Run database migrations

In **Supabase Dashboard → SQL Editor**, run each file in order:

```
supabase/migrations/001_schema.sql
supabase/migrations/002_indexes.sql
supabase/migrations/003_rls.sql
supabase/migrations/004_functions.sql
supabase/migrations/005_auth_profiles.sql
supabase/migrations/006_org_system.sql
supabase/migrations/007_clients_module.sql
supabase/migrations/008_production_fixes.sql
supabase/migrations/009_consolidate.sql
supabase/migrations/010_documents_module.sql
supabase/migrations/011_portal_tokens.sql
supabase/migrations/012_notifications.sql
```

### 4 · Configure Supabase Auth

**Supabase → Authentication → URL Configuration:**

| Field | Value |
|---|---|
| Site URL | `http://localhost:3001` |
| Redirect URLs | `http://localhost:3001/auth/callback` |

### 5 · Start the dev server

```bash
npm run dev
# → http://localhost:3001
```

---

## Demo Flow

The fastest way to see everything working:

```
1. Visit /                    → Marketing landing page
2. Click "Start free trial"   → Signup form
3. Verify email               → Auto-redirected to /dashboard
4. Dashboard                  → Live KPIs (empty on first visit)
5. Clients → Add client       → Fill in name, email, MRR
6. Client profile             → Copy portal link from the Portal tab
7. Projects → New project     → Assign to the client, set visible to client
8. Documents → Upload         → Upload a PDF, mark visible to client
9. Visit /portal/[token]      → See the client's portal view
10. Settings → Billing        → See the subscription plans
```

---

## Deployment

### Vercel (recommended)

```bash
# One-time setup
vercel link

# Deploy
vercel --prod
```

Or connect your GitHub repo in the Vercel dashboard for automatic deploys on push.

**Required environment variables in Vercel → Settings → Environment Variables:**

Copy everything from `.env.local.example` and update:
- `NEXT_PUBLIC_SITE_URL` → your production domain
- Supabase Auth → URL Configuration → update to your domain
- Stripe webhook → add `https://your-domain.vercel.app/api/webhooks/stripe`

Full deployment guide: [docs/PRODUCT.md#deployment](docs/PRODUCT.md#deployment)

---

## Environment Variables Reference

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Public anon key (safe for browser) |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | Service role key — **server-only, never expose** |
| `NEXT_PUBLIC_SITE_URL` | ✅ | Production URL for auth redirects |
| `STRIPE_SECRET_KEY` | Billing | `sk_test_...` or `sk_live_...` |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Billing | `pk_test_...` or `pk_live_...` |
| `STRIPE_WEBHOOK_SECRET` | Billing | `whsec_...` — from Stripe webhook settings |
| `STRIPE_PRICE_STUDIO_MONTHLY` | Billing | Price ID for Starter monthly |
| `STRIPE_PRICE_STUDIO_YEARLY` | Billing | Price ID for Starter yearly |
| `STRIPE_PRICE_AGENCY_MONTHLY` | Billing | Price ID for Pro monthly |
| `STRIPE_PRICE_AGENCY_YEARLY` | Billing | Price ID for Pro yearly |
| `STRIPE_PRICE_ENTERPRISE_MONTHLY` | Billing | Price ID for Agency monthly |
| `STRIPE_PRICE_ENTERPRISE_YEARLY` | Billing | Price ID for Agency yearly |
| `RESEND_API_KEY` | Email | `re_...` — optional, fallback built-in |
| `RESEND_FROM_EMAIL` | Email | Verified sender address |

---

## Subscription Plans

| | **Starter** | **Pro** | **Agency** |
|---|---|---|---|
| **Price/month** | $29 | $79 | $199 |
| **Price/year** | $232 | $632 | $1,592 |
| **Clients** | 20 | Unlimited | Unlimited |
| **Projects** | 5 | Unlimited | Unlimited |
| **Storage** | 1 GB | 10 GB | Unlimited |
| **Team seats** | 1 | 5 | Unlimited |
| **White-label portal** | — | — | ✓ |
| **Custom domain** | — | — | ✓ |

---

## Security

| Concern | Implementation |
|---|---|
| Data isolation | RLS on every table — users only see their org's data |
| Portal access | Token-based; resolved server-side via service client |
| Service role key | Server-only; never referenced in any client file |
| Stripe webhooks | Signature verified via `constructEvent()` before any DB write |
| Billing actions | Restricted to `role === "owner"` at server action level |
| Secrets | `.env.local` is git-ignored; env vars in Vercel at rest |
| Auth | Cookie-based sessions via `@supabase/ssr`; PKCE flow |

---

## Scripts

```bash
npm run dev      # Start dev server on port 3001
npm run build    # TypeScript check + production build
npm run start    # Start production server
npm run lint     # ESLint
```

---

## Roadmap

See [docs/ROADMAP.md](docs/ROADMAP.md) for the full planned feature list.

**Near-term:**
- [ ] Stripe payment collection from client portal
- [ ] PDF invoice generation
- [ ] Custom branding per organization (Agency plan)
- [ ] Plan limit enforcement at the application layer

**Medium-term:**
- [ ] In-app messaging between agency and client
- [ ] Mobile-responsive sidebar (hamburger menu)
- [ ] Onboarding checklist for new workspaces

**Long-term:**
- [ ] Public API with API keys
- [ ] Zapier / Make / n8n integrations
- [ ] Native mobile app

---

## Contributing

1. Fork the repo
2. Create a feature branch: `git checkout -b feat/your-feature`
3. Make your changes and add tests if applicable
4. Run `npm run build && npm run lint` — both must pass
5. Open a pull request

---

## License

[MIT](LICENSE) — free to use, fork, and build on.

---

<div align="center">

Built by [Achraf Naz](https://github.com/Acharfnazha) · 30-day SaaS sprint · June 2026

</div>
