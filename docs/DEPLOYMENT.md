# PortalFlow — Production Deployment Guide

> Last updated: 2026-06-20  
> This document is the authoritative deployment reference. Follow it top-to-bottom for a first deploy.

---

## Critical fixes applied before this guide was written

The following bugs were found during the pre-deployment audit and fixed in the codebase. They must also be applied to your production Supabase database (instructions below).

| Fix | File | What changed |
|---|---|---|
| Missing middleware | `src/middleware.ts` | Created — Next.js was never running auth middleware |
| Dual auth trigger | `supabase/migrations/013_fix_auth_trigger.sql` | Drops 004 trigger; extends `handle_new_user()` to populate both `profiles` and `users` |
| Email domain mismatch | `src/lib/email.ts` | Default sender changed from `.io` to `.app` |
| Undocumented env var | `src/lib/constants.ts` | `NEXT_PUBLIC_APP_URL` → `NEXT_PUBLIC_SITE_URL` |

---

## Part 1 — Environment Variables

Set all of the following in your Vercel project → Settings → Environment Variables.  
Scope all to **Production** (and optionally Preview). None go to Development.

### Supabase

| Variable | Where to find it | Notes |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Dashboard → Settings → API → Project URL | `https://xxxxxxxxxxxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Dashboard → Settings → API → Project API keys → `anon public` | Safe to expose — RLS enforces row-level access |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Dashboard → Settings → API → Project API keys → `service_role` | **Never expose to browser. Server-only.** |

### Site URL

| Variable | Value | Notes |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | `https://portalflow.app` | Used in auth callbacks, portal invite links, Stripe return URLs. No trailing slash. |

### Stripe

| Variable | Where to find it | Notes |
|---|---|---|
| `STRIPE_SECRET_KEY` | Stripe Dashboard → Developers → API keys → Secret key | `sk_live_...` for production |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe Dashboard → Developers → API keys → Publishable key | `pk_live_...` for production |
| `STRIPE_WEBHOOK_SECRET` | Stripe Dashboard → Developers → Webhooks → your endpoint → Signing secret | `whsec_...` — generated after you create the webhook |
| `STRIPE_PRICE_STUDIO_MONTHLY` | Stripe Dashboard → Products → Starter → Monthly price → Price ID | `price_...` |
| `STRIPE_PRICE_STUDIO_YEARLY` | Stripe Dashboard → Products → Starter → Yearly price → Price ID | `price_...` |
| `STRIPE_PRICE_AGENCY_MONTHLY` | Stripe Dashboard → Products → Pro → Monthly price → Price ID | `price_...` |
| `STRIPE_PRICE_AGENCY_YEARLY` | Stripe Dashboard → Products → Pro → Yearly price → Price ID | `price_...` |
| `STRIPE_PRICE_ENTERPRISE_MONTHLY` | Stripe Dashboard → Products → Agency → Monthly price → Price ID | `price_...` |
| `STRIPE_PRICE_ENTERPRISE_YEARLY` | Stripe Dashboard → Products → Agency → Yearly price → Price ID | `price_...` |

### Email (Resend)

| Variable | Where to find it | Notes |
|---|---|---|
| `RESEND_API_KEY` | Resend Dashboard → API Keys → Create API key | `re_...` |
| `RESEND_FROM_EMAIL` | Set manually | `PortalFlow <noreply@portalflow.app>` — domain must be verified in Resend |

**Total: 15 environment variables.**

---

## Part 2 — Supabase Production Configuration

### 2.1 Authentication → URL Configuration

In Supabase Dashboard → Authentication → URL Configuration:

| Field | Value |
|---|---|
| **Site URL** | `https://portalflow.app` |
| **Redirect URLs** (add all) | `https://portalflow.app/auth/callback` |
| | `https://portalflow.app/auth/callback?next=/dashboard` |
| | `https://portalflow.app/auth/callback?next=/reset-password` |
| | `https://*.vercel.app/auth/callback` (for preview deploys) |

### 2.2 Authentication → Email Templates

In Supabase Dashboard → Authentication → Email Templates:

For every template, change the **"Confirm signup" link** from the Supabase default to:

```
{{ .SiteURL }}/auth/callback?token_hash={{ .TokenHash }}&type=email&next=/dashboard
```

For "Reset password":
```
{{ .SiteURL }}/auth/callback?token_hash={{ .TokenHash }}&type=recovery&next=/reset-password
```

For "Magic link":
```
{{ .SiteURL }}/auth/callback?token_hash={{ .TokenHash }}&type=magiclink
```

### 2.3 Email SMTP (optional but recommended)

By default Supabase sends auth emails from their domain, which may land in spam. Configure custom SMTP:
- Supabase Dashboard → Authentication → SMTP Settings
- Use your Resend SMTP credentials or another provider

### 2.4 Storage

The `documents` bucket is created by migration `010_documents_module.sql`. Verify in Supabase Dashboard → Storage:
- Bucket name: `documents`
- Public: **NO** (private)
- File size limit: 25 MB
- Allowed MIME types: PDF, Word, Excel, images, ZIP, text, CSV

If the bucket does not exist (migrations not applied), create it manually with those settings before testing document upload.

---

## Part 3 — Run Migrations in Production

In Supabase Dashboard → SQL Editor, run each migration file in order:

```
001_schema.sql
002_indexes.sql
003_rls.sql
004_functions.sql
005_auth_profiles.sql
006_org_system.sql
007_clients_module.sql
008_production_fixes.sql
009_consolidate.sql
010_documents_module.sql
011_portal_tokens.sql
012_notifications.sql
013_fix_auth_trigger.sql   ← CRITICAL: fixes dual trigger bug
```

**Do not run `seed.sql` in production** — it inserts test data.

**Migration 013 is required** even if you run all migrations fresh, because 004 and 005 both create triggers that conflict. Running 013 after 005 drops the 004 trigger and fixes `handle_new_user()`.

---

## Part 4 — Stripe Webhook Setup

1. Go to Stripe Dashboard → Developers → Webhooks → Add endpoint
2. Endpoint URL: `https://portalflow.app/api/webhooks/stripe`
3. Events to listen for:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
4. Save the **Signing secret** — this is your `STRIPE_WEBHOOK_SECRET` env var

---

## Part 5 — Vercel Deployment

```bash
# Install Vercel CLI if not installed
npm i -g vercel

# From the project root
vercel --prod
```

Or connect the GitHub repo in Vercel Dashboard → New Project → Import Git Repository.

**Build settings** (Vercel auto-detects these from Next.js):
- Framework: Next.js
- Build command: `npm run build`
- Output directory: `.next`
- Install command: `npm install`

**Node.js version:** 18.x or 20.x (set in Vercel project settings)

---

## Part 6 — Post-Deploy Verification

Run through this checklist after deploying. Every item must pass before going live.

### Auth flow
- [ ] `https://portalflow.app` loads the landing page
- [ ] `/signup` renders signup form
- [ ] Sign up with a real email → confirmation email arrives in < 60s
- [ ] Click confirmation link → redirected to `/dashboard` (not `/auth/login`)
- [ ] Sign out → redirected to `/login`
- [ ] Sign in → redirected to `/dashboard`
- [ ] Navigate to `/dashboard` while logged out → redirected to `/login`

### Data integrity (critical — verifies migration 013)
- [ ] After signup: go to Supabase Dashboard → Table Editor → `organizations` → confirm exactly **1 row** was created (not 2)
- [ ] Check `public.users` → confirm 1 row with correct `organization_id`
- [ ] Check `public.profiles` → confirm 1 row with the **same** `organization_id`
- [ ] Create a client → client appears in list (confirms RLS is not blocking writes)

### Core features
- [ ] Create a client → saved, appears in list
- [ ] Create a project → saved, appears in list
- [ ] Upload a document (PDF) → appears in documents list with download link
- [ ] Download a document → file downloads correctly
- [ ] Client portal → generate portal link, open in incognito, portal loads

### Billing (Stripe)
- [ ] `/dashboard/settings/billing` loads plan cards
- [ ] Click "Upgrade" → redirected to Stripe Checkout (test mode first)
- [ ] Stripe webhook → send test event from Stripe dashboard, confirm it returns 200

### Email (Resend)
- [ ] Password reset email arrives
- [ ] Portal invite email arrives (if Resend key configured)

---

## Part 7 — Known Issues at Launch

These are not deployment blockers but will affect beta users. See `docs/KNOWN_ISSUES.md` for full details.

| ID | Issue | Severity |
|---|---|---|
| KI-001 | Invoice creation does not save to DB | P0 |
| KI-002 | Client Invoices tab always empty | P0 |
| KI-003 | Client notes not persisted | P0 |
| KI-004 | Bulk client actions do nothing | P1 |
| KI-006 | Documents default to hidden in portal | P1 |
| KI-007 | Revenue chart uses mock data | P1 |

Recommend disclosing KI-001 to beta users upfront to avoid confusion.

---

## Security Checklist

- [ ] `SUPABASE_SERVICE_ROLE_KEY` is not prefixed with `NEXT_PUBLIC_`
- [ ] `.env.local` is in `.gitignore` and was not committed
- [ ] Stripe webhook signature verification is enabled (not skipped)
- [ ] Supabase RLS is enabled on all tables (verified in Dashboard → Table Editor → each table → RLS badge)
- [ ] `documents` Storage bucket is **private** (not public)
- [ ] Auth email templates use `{{ .SiteURL }}` not hardcoded URLs
