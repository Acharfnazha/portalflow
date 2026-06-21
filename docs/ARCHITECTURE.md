# PortalFlow — Architecture

> This document describes the system design, data flow, and key technical decisions.

---

## High-Level Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        BROWSER / CLIENT                         │
│                                                                 │
│   Public routes         Auth routes         Dashboard           │
│   /portal/[token]/*     /(auth)/*           /dashboard/*        │
│        │                     │                    │             │
└────────┼─────────────────────┼────────────────────┼────────────┘
         │                     │                    │
         ▼                     ▼                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                     NEXT.JS 16 APP ROUTER                       │
│                       (Vercel Edge)                             │
│                                                                 │
│  Server Components (fetch → render)                             │
│  Server Actions (mutations → revalidate)                        │
│  API Route: /api/webhooks/stripe                                │
└────────────┬───────────────────────────────────────────────────┘
             │
      ┌──────┴──────────────────┐
      │                         │
      ▼                         ▼
┌──────────────┐        ┌──────────────────┐
│   Supabase   │        │      Stripe       │
│              │        │                  │
│  PostgreSQL  │        │  Checkout        │
│  Auth        │        │  Billing Portal  │
│  Storage     │        │  Webhooks        │
│  RLS         │        └──────────────────┘
└──────────────┘
```

---

## Request Flows

### 1. Dashboard Request (Authenticated)

```
User visits /dashboard/clients
  │
  ├── Next.js Server Component executes
  │     └── createClient() → Supabase anon client with cookie session
  │           └── auth.getUser() → validates JWT
  │                 └── if null → redirect("/login")
  │
  ├── Supabase query: SELECT * FROM clients WHERE organization_id = $org
  │     └── RLS: auth.org_id() enforced automatically in Postgres
  │           → only this user's org data returned
  │
  └── React renders server HTML → streamed to browser
        └── Client Components hydrate for interactivity
```

### 2. Portal Request (Token-based, No Login)

```
Client visits /portal/abc123-def456-…
  │
  ├── Next.js Server Component (layout.tsx)
  │     └── createServiceClient() → bypasses RLS
  │           └── SELECT * FROM portal_sessions WHERE token = $token
  │                 └── if null → notFound() (404)
  │                 └── if found → { client_id, org_id, client.name, org.name }
  │
  ├── Each portal page independently fetches:
  │     getPortalProjects(token)   → service client, filtered by client_id
  │     getPortalDocuments(token)  → service client, signed URLs
  │     getPortalInvoices(token)   → service client, non-draft only
  │
  └── Portal layout renders with client name + org name in nav
        Client has read-only view — no write actions exposed
```

### 3. Stripe Webhook

```
Stripe sends POST /api/webhooks/stripe
  │
  ├── req.text() → raw body (required for signature verification)
  ├── stripe.webhooks.constructEvent(body, sig, STRIPE_WEBHOOK_SECRET)
  │     └── throws on invalid signature → 400
  │
  ├── Switch on event.type:
  │     checkout.session.completed     → retrieve subscription → upsertSubscription()
  │     customer.subscription.created  → upsertSubscription()
  │     customer.subscription.updated  → upsertSubscription()
  │     customer.subscription.deleted  → upsertSubscription() (status = canceled)
  │     invoice.payment_succeeded      → update status = active
  │     invoice.payment_failed         → update status = past_due
  │
  └── upsertSubscription():
        find org_id from metadata or customer lookup
        upsert into subscriptions table (onConflict: organization_id)
        update organizations.subscription_status
```

### 4. Server Action Mutation

```
User clicks "Create client" → form submits
  │
  ├── createClientAction(prevState, formData) [server action]
  │     ├── createClient() → auth.getUser() → validate session
  │     ├── check role (manager+)
  │     ├── INSERT INTO clients … (RLS: org scoped)
  │     ├── log_activity() RPC → inserts into activity_logs
  │     ├── createNotification() → inserts into notifications for all org members
  │     └── revalidatePath("/dashboard/clients")
  │
  └── Next.js revalidates → Server Component re-fetches → UI updates
```

---

## Database Schema

```
organizations
  ├── id, name, slug, plan, subscription_status
  ├── stripe_customer_id
  └── logo_url, website, timezone

profiles  ─────────────────── linked to auth.users
  ├── id, organization_id
  ├── full_name, avatar_url, job_title
  └── role: owner | admin | manager | staff

clients
  ├── id, organization_id, owner_id
  ├── name, email, phone, website, domain
  ├── status: new | active | trial | at_risk | churned
  ├── mrr_cents, health_score, tags
  ├── portal_enabled, portal_token
  └── deleted_at (soft delete)

projects
  ├── id, organization_id, client_id
  ├── status: planning | active | in_review | on_hold | completed | canceled
  ├── priority: high | medium | low
  ├── progress (0–100), deadline, budget_cents, spent_cents
  └── visible_to_client, deleted_at

documents
  ├── id, organization_id, client_id, project_id
  ├── name, file_path, file_type, mime_type, size_bytes
  ├── status: processing | ready | quarantined | deleted
  └── visible_to_client, deleted_at

invoices
  ├── id, organization_id, client_id, project_id
  ├── invoice_number, status: draft | pending | paid | overdue | void | refunded
  ├── total_cents, tax_rate, due_at, paid_at
  └── stripe_payment_intent_id

payments
  ├── id, organization_id, client_id, invoice_id
  ├── amount_cents, method, status, reference
  └── created_at

portal_sessions
  ├── id, client_id, organization_id
  ├── token (uuid, unique)
  └── expires_at, created_by

subscriptions  ──── one row per organization
  ├── organization_id
  ├── stripe_subscription_id, stripe_customer_id, stripe_price_id
  ├── plan: studio | agency | enterprise
  ├── status, billing_interval
  └── current_period_start, current_period_end, cancel_at_period_end

notifications
  ├── id, organization_id, user_id
  ├── type: client_created | project_created | document_uploaded | …
  ├── title, body, entity_type, entity_id
  └── read_at

activity_logs
  ├── id, organization_id
  ├── actor_id, action, entity_type, entity_id
  └── metadata (jsonb)
```

---

## Row Level Security

Every table has RLS enabled. The key patterns:

```sql
-- Agency users: scoped to their org
USING (organization_id = auth.org_id())

-- Portal visitors: scoped to their client
USING (client_id = auth.portal_client_id())

-- Portal client_id injected via:
SET LOCAL app.portal_client_id = '<uuid>';  -- in service client context

-- Service role: bypasses RLS entirely (used for portal token resolution and webhooks)
```

Helper functions:
- `auth.org_id()` — returns `organization_id` for the current JWT user
- `auth.portal_client_id()` — reads `app.portal_client_id` session variable
- `auth.user_role()` — returns the user's role string

---

## Supabase Client Hierarchy

```
createClient()          ← anon key + cookie session
  Used by:              all dashboard Server Components and Server Actions
  RLS:                  enforced (data scoped to authenticated user's org)

createServiceClient()   ← service role key, server-only
  Used by:              portal token resolution, Stripe webhook handler,
                        notification creation, team invite actions
  RLS:                  bypassed (can read any row)
  Security:             only called in server files, never in client components
```

---

## Authentication Flow

```
Signup:
  signUp() server action
    → supabase.auth.signUp({ email, password, options: { data: { org_name, … } } })
    → Supabase sends confirmation email
    → User clicks link → /auth/callback?code=…
    → exchangeCodeForSession(code)
    → Redirect to /dashboard

  On auth.users INSERT:
    trigger: on_auth_user_created → handle_new_user()
      → INSERT INTO organizations (name, slug, plan='studio')
      → INSERT INTO profiles (id, organization_id, role='owner')
      → INSERT INTO users (mirror for FK constraints)

Sign-in:
  signIn() server action → signInWithPassword → cookie set → redirect /dashboard

Password reset:
  forgotPassword() → auth.resetPasswordForEmail → email link
  /reset-password → updateUser({ password }) → redirect /dashboard
```

---

## Key Technical Decisions

### No Tailwind
**Decision:** Raw CSS custom properties throughout.
**Why:** Cleaner control over the design system; no purge complexity; smaller bundle; properties compose naturally with JS.

### Server Components by default
**Decision:** Every page fetches its own data in a Server Component. Client components receive data as props.
**Why:** Eliminates waterfall loading, removes client-side fetch state management, enables streaming. No `useState` + `useEffect` + `loading` pattern for data.

### Server Actions for all mutations
**Decision:** No `/api/*` routes for dashboard mutations — all use `"use server"` functions.
**Why:** Co-located with their components; automatically typed end-to-end; no manual API contract to maintain.

### Portal token design
**Decision:** Tokens are plain UUIDs stored in `portal_sessions`. One token per client.
**Why:** Simple to invalidate (delete the row or regenerate token). No JWT complexity for unauthenticated guests. Service role resolves token server-side — token never hits the database from the browser.

### No Redux / heavy state
**Decision:** Zustand for toast notifications and UI-only state. Everything else is server state.
**Why:** The App Router's server component model makes client-side state management largely unnecessary for data. Keeping client state minimal reduces complexity.

---

## Performance Characteristics

| Metric | Approach |
|---|---|
| First paint | Server-rendered HTML — no loading spinners for initial data |
| Data fetching | Parallel `Promise.all()` on dashboard pages |
| Supabase caching | Next.js fetch deduplication within a request (portal pages) |
| Bundle size | No Tailwind; Framer Motion only where needed; code-split by route |
| Images | `next/image` with `remotePatterns` for Supabase Storage |
| Fonts | `next/font/google` — self-hosted, no external request |

---

## Security Checklist

- [x] RLS on all 12 tables
- [x] Service role key server-only (not in any `"use client"` file)
- [x] Stripe webhook signature verification before DB write
- [x] Portal is read-only (no write actions in portal routes)
- [x] Owner-only billing mutations
- [x] Soft deletes (data never hard-deleted by user actions)
- [x] `.env.local` git-ignored
- [x] No raw errors exposed in UI (errors logged server-side, users see friendly messages)
- [x] Auth callback uses `x-forwarded-host` in production (safe for Vercel preview URLs)
