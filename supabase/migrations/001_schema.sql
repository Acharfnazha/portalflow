-- ============================================================
--  PortalFlow — Core Schema
--  Migration: 001_schema.sql
--  Database:  PostgreSQL 15 via Supabase
--
--  Execution order:
--    001_schema.sql        ← this file
--    002_indexes.sql
--    003_rls.sql
--    004_functions.sql
--    seed.sql              (dev only)
-- ============================================================

-- Extensions ------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "citext";     -- case-insensitive text (email, slug)

-- ============================================================
--  1. ORGANIZATIONS  (tenant root — every row in every table
--     belongs to exactly one organization)
-- ============================================================
CREATE TABLE public.organizations (
  id                     uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  name                   text        NOT NULL CHECK (length(trim(name)) > 0),
  slug                   citext      NOT NULL UNIQUE
                           CHECK (slug ~ '^[a-z0-9][a-z0-9\-]{1,62}[a-z0-9]$'),
  logo_url               text,
  website                text,
  -- Billing / plan ------------------------------------------
  plan                   text        NOT NULL DEFAULT 'studio'
                           CHECK (plan IN ('studio', 'agency', 'enterprise')),
  stripe_customer_id     text        UNIQUE,
  subscription_status    text        NOT NULL DEFAULT 'trialing'
                           CHECK (subscription_status IN
                             ('trialing', 'active', 'past_due', 'canceled', 'paused')),
  trial_ends_at          timestamptz DEFAULT (now() + interval '14 days'),
  -- Usage limits --------------------------------------------
  storage_used_bytes     bigint      NOT NULL DEFAULT 0 CHECK (storage_used_bytes >= 0),
  -- Flexible config (timezone, branding, feature flags) -----
  settings               jsonb       NOT NULL DEFAULT '{}',
  created_at             timestamptz NOT NULL DEFAULT now(),
  updated_at             timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE  public.organizations IS 'Top-level tenant. All data is scoped to one organization.';
COMMENT ON COLUMN public.organizations.slug IS 'URL-safe identifier used in portal links and API paths.';
COMMENT ON COLUMN public.organizations.storage_used_bytes IS 'Maintained by trigger on documents INSERT/DELETE.';

-- ============================================================
--  2. USERS  (profile extending auth.users)
--     One row per Supabase auth user. Created automatically
--     by a trigger on auth.users INSERT.
-- ============================================================
CREATE TABLE public.users (
  id               uuid        PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  organization_id  uuid        NOT NULL REFERENCES public.organizations (id) ON DELETE CASCADE,
  full_name        text        NOT NULL DEFAULT '',
  email            citext      NOT NULL,
  avatar_url       text,
  role             text        NOT NULL DEFAULT 'member'
                     CHECK (role IN ('owner', 'admin', 'manager', 'member')),
  title            text,                           -- "Head of Design", "Project Manager", etc.
  phone            text,
  timezone         text        NOT NULL DEFAULT 'UTC',
  last_seen_at     timestamptz,
  preferences      jsonb       NOT NULL DEFAULT '{}',  -- notification prefs, theme, etc.
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE  public.users IS 'Extended profile for auth.users. Auto-created on signup.';
COMMENT ON COLUMN public.users.role IS 'RBAC role. owner > admin > manager > member.';

-- ============================================================
--  3. CLIENTS
-- ============================================================
CREATE TABLE public.clients (
  id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id  uuid        NOT NULL REFERENCES public.organizations (id) ON DELETE CASCADE,
  owner_id         uuid        REFERENCES public.users (id) ON DELETE SET NULL,
  -- Identity ------------------------------------------------
  name             text        NOT NULL CHECK (length(trim(name)) > 0),
  email            citext,
  phone            text,
  website          text,
  domain           text,
  -- Classification -----------------------------------------
  status           text        NOT NULL DEFAULT 'new'
                     CHECK (status IN ('new', 'active', 'trial', 'at_risk', 'churned')),
  industry         text,
  company_size     text
                     CHECK (company_size IN ('1-10', '11-50', '51-200', '201-500', '500+')),
  location         text,
  avatar_url       text,
  tags             text[]      NOT NULL DEFAULT '{}',
  -- Revenue -------------------------------------------------
  mrr_cents        integer     NOT NULL DEFAULT 0 CHECK (mrr_cents >= 0),
  health_score     smallint    NOT NULL DEFAULT 50
                     CHECK (health_score BETWEEN 0 AND 100),
  -- Portal --------------------------------------------------
  portal_enabled   boolean     NOT NULL DEFAULT false,
  -- Misc ----------------------------------------------------
  notes            text,
  metadata         jsonb       NOT NULL DEFAULT '{}',
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now(),
  deleted_at       timestamptz                    -- soft delete
);

COMMENT ON COLUMN public.clients.mrr_cents     IS 'Monthly recurring revenue in cents (USD).';
COMMENT ON COLUMN public.clients.health_score  IS '0-100 score computed by edge function weekly.';
COMMENT ON COLUMN public.clients.deleted_at    IS 'Soft delete — non-NULL rows are excluded from normal queries.';

-- ── Client contacts (multiple per client) ------------------
CREATE TABLE public.client_contacts (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id    uuid        NOT NULL REFERENCES public.clients (id) ON DELETE CASCADE,
  name         text        NOT NULL,
  email        citext,
  phone        text,
  role         text,                              -- "VP Engineering", "Billing contact"
  is_primary   boolean     NOT NULL DEFAULT false,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

-- ── Portal sessions (magic-link tokens for client access) --
CREATE TABLE public.portal_sessions (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id    uuid        NOT NULL REFERENCES public.clients (id) ON DELETE CASCADE,
  created_by   uuid        NOT NULL REFERENCES public.users (id) ON DELETE CASCADE,
  token        text        NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
  expires_at   timestamptz NOT NULL DEFAULT (now() + interval '30 days'),
  last_used_at timestamptz,
  ip_address   inet,
  created_at   timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE  public.portal_sessions IS 'Magic-link tokens granting client read access to their portal.';
COMMENT ON COLUMN public.portal_sessions.token IS '32-byte random hex string. Invalidated when expires_at < now().';

-- ============================================================
--  4. PROJECTS
-- ============================================================
CREATE TABLE public.projects (
  id                uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id   uuid        NOT NULL REFERENCES public.organizations (id) ON DELETE CASCADE,
  client_id         uuid        NOT NULL REFERENCES public.clients (id) ON DELETE CASCADE,
  created_by        uuid        REFERENCES public.users (id) ON DELETE SET NULL,
  -- Identity ------------------------------------------------
  name              text        NOT NULL CHECK (length(trim(name)) > 0),
  description       text,
  status            text        NOT NULL DEFAULT 'planning'
                      CHECK (status IN
                        ('planning', 'active', 'in_review', 'on_hold', 'completed', 'canceled')),
  priority          text        NOT NULL DEFAULT 'medium'
                      CHECK (priority IN ('high', 'medium', 'low')),
  -- Progress ------------------------------------------------
  progress          smallint    NOT NULL DEFAULT 0
                      CHECK (progress BETWEEN 0 AND 100),
  -- Schedule ------------------------------------------------
  start_date        date,
  deadline          date,
  -- Budget --------------------------------------------------
  budget_cents      integer     NOT NULL DEFAULT 0 CHECK (budget_cents >= 0),
  spent_cents       integer     NOT NULL DEFAULT 0 CHECK (spent_cents >= 0),
  -- Visibility to client portal ----------------------------
  visible_to_client boolean     NOT NULL DEFAULT true,
  tags              text[]      NOT NULL DEFAULT '{}',
  metadata          jsonb       NOT NULL DEFAULT '{}',
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now(),
  deleted_at        timestamptz,

  CONSTRAINT deadline_after_start
    CHECK (deadline IS NULL OR start_date IS NULL OR deadline >= start_date)
);

-- ── Project team members -----------------------------------
CREATE TABLE public.project_members (
  project_id   uuid  NOT NULL REFERENCES public.projects (id) ON DELETE CASCADE,
  user_id      uuid  NOT NULL REFERENCES public.users (id)    ON DELETE CASCADE,
  role         text  NOT NULL DEFAULT 'contributor'
                 CHECK (role IN ('lead', 'contributor', 'viewer')),
  assigned_at  timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (project_id, user_id)
);

-- ============================================================
--  5. DOCUMENTS
-- ============================================================
CREATE TABLE public.documents (
  id                uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id   uuid        NOT NULL REFERENCES public.organizations (id) ON DELETE CASCADE,
  client_id         uuid        REFERENCES public.clients (id)  ON DELETE SET NULL,
  project_id        uuid        REFERENCES public.projects (id) ON DELETE SET NULL,
  uploaded_by       uuid        REFERENCES public.users (id)    ON DELETE SET NULL,
  -- File identity -------------------------------------------
  name              text        NOT NULL,
  file_path         text        NOT NULL,          -- Supabase Storage path
  file_url          text,                          -- public/signed download URL
  file_type         text,                          -- pdf | doc | xls | img | zip | other
  mime_type         text,
  size_bytes        bigint      NOT NULL DEFAULT 0 CHECK (size_bytes >= 0),
  -- Versioning ----------------------------------------------
  version           integer     NOT NULL DEFAULT 1 CHECK (version >= 1),
  parent_id         uuid        REFERENCES public.documents (id) ON DELETE SET NULL,
  -- Status --------------------------------------------------
  status            text        NOT NULL DEFAULT 'processing'
                      CHECK (status IN ('processing', 'ready', 'quarantined', 'deleted')),
  visible_to_client boolean     NOT NULL DEFAULT false,
  tags              text[]      NOT NULL DEFAULT '{}',
  metadata          jsonb       NOT NULL DEFAULT '{}',
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now(),
  deleted_at        timestamptz
);

COMMENT ON COLUMN public.documents.parent_id IS 'Non-NULL on version > 1 documents. Points to the v1 root.';
COMMENT ON COLUMN public.documents.status    IS 'processing → ready (after virus scan). quarantined = failed scan.';

-- ============================================================
--  6. INVOICES
-- ============================================================
CREATE TABLE public.invoices (
  id                        uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id           uuid        NOT NULL REFERENCES public.organizations (id) ON DELETE CASCADE,
  client_id                 uuid        NOT NULL REFERENCES public.clients (id)       ON DELETE RESTRICT,
  project_id                uuid        REFERENCES public.projects (id)               ON DELETE SET NULL,
  created_by                uuid        REFERENCES public.users (id)                  ON DELETE SET NULL,
  -- Numbering -----------------------------------------------
  invoice_number            text        NOT NULL,
  UNIQUE (organization_id, invoice_number),
  -- Status --------------------------------------------------
  status                    text        NOT NULL DEFAULT 'draft'
                              CHECK (status IN
                                ('draft', 'pending', 'paid', 'overdue', 'void', 'refunded')),
  -- Amounts (all in cents) ----------------------------------
  currency                  char(3)     NOT NULL DEFAULT 'USD',
  subtotal_cents            integer     NOT NULL DEFAULT 0 CHECK (subtotal_cents >= 0),
  tax_rate                  numeric(5,4)NOT NULL DEFAULT 0
                              CHECK (tax_rate BETWEEN 0 AND 1),
  tax_cents                 integer     NOT NULL DEFAULT 0 CHECK (tax_cents >= 0),
  discount_cents            integer     NOT NULL DEFAULT 0 CHECK (discount_cents >= 0),
  total_cents               integer     NOT NULL DEFAULT 0 CHECK (total_cents >= 0),
  amount_paid_cents         integer     NOT NULL DEFAULT 0 CHECK (amount_paid_cents >= 0),
  -- Dates ---------------------------------------------------
  issued_at                 date,
  due_at                    date,
  paid_at                   timestamptz,
  sent_at                   timestamptz,
  viewed_at                 timestamptz,           -- when client first opened portal invoice
  -- Content -------------------------------------------------
  notes                     text,
  terms                     text,
  -- Storage -------------------------------------------------
  pdf_path                  text,                  -- Supabase Storage path
  -- Stripe --------------------------------------------------
  stripe_payment_intent_id  text,
  stripe_invoice_id         text,
  -- Misc ----------------------------------------------------
  metadata                  jsonb       NOT NULL DEFAULT '{}',
  created_at                timestamptz NOT NULL DEFAULT now(),
  updated_at                timestamptz NOT NULL DEFAULT now(),
  deleted_at                timestamptz,

  CONSTRAINT due_after_issued
    CHECK (due_at IS NULL OR issued_at IS NULL OR due_at >= issued_at),
  CONSTRAINT paid_amount_le_total
    CHECK (amount_paid_cents <= total_cents)
);

COMMENT ON COLUMN public.invoices.tax_rate IS 'Stored as decimal: 0.2 = 20%. Applied at time of finalization.';
COMMENT ON COLUMN public.invoices.viewed_at IS 'Set when the client opens the invoice in the portal.';

-- ── Invoice line items -------------------------------------
CREATE TABLE public.invoice_line_items (
  id               uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id       uuid         NOT NULL REFERENCES public.invoices (id) ON DELETE CASCADE,
  description      text         NOT NULL,
  quantity         numeric(10,2)NOT NULL DEFAULT 1 CHECK (quantity > 0),
  unit_price_cents integer      NOT NULL CHECK (unit_price_cents >= 0),
  -- Computed at INSERT / UPDATE by trigger (avoids drift) ---
  total_cents      integer      NOT NULL DEFAULT 0,
  sort_order       integer      NOT NULL DEFAULT 0,
  created_at       timestamptz  NOT NULL DEFAULT now(),
  updated_at       timestamptz  NOT NULL DEFAULT now()
);

COMMENT ON COLUMN public.invoice_line_items.total_cents IS 'ROUND(quantity * unit_price_cents). Kept in sync by trigger.';

-- ============================================================
--  7. PAYMENTS
-- ============================================================
CREATE TABLE public.payments (
  id                        uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id           uuid        NOT NULL REFERENCES public.organizations (id) ON DELETE CASCADE,
  invoice_id                uuid        NOT NULL REFERENCES public.invoices (id)       ON DELETE RESTRICT,
  client_id                 uuid        NOT NULL REFERENCES public.clients (id)        ON DELETE RESTRICT,
  -- Amount --------------------------------------------------
  amount_cents              integer     NOT NULL CHECK (amount_cents > 0),
  currency                  char(3)     NOT NULL DEFAULT 'USD',
  -- Status --------------------------------------------------
  status                    text        NOT NULL DEFAULT 'pending'
                              CHECK (status IN
                                ('pending', 'succeeded', 'failed', 'refunded',
                                 'partially_refunded')),
  -- Method --------------------------------------------------
  method                    text        NOT NULL DEFAULT 'stripe'
                              CHECK (method IN
                                ('stripe', 'bank_transfer', 'cash', 'check', 'crypto', 'other')),
  reference_number          text,                  -- for non-Stripe payments
  notes                     text,
  -- Stripe --------------------------------------------------
  stripe_payment_intent_id  text,
  stripe_charge_id          text,
  -- Refund --------------------------------------------------
  refund_amount_cents       integer     NOT NULL DEFAULT 0 CHECK (refund_amount_cents >= 0),
  refunded_at               timestamptz,
  -- Dates ---------------------------------------------------
  paid_at                   timestamptz,
  metadata                  jsonb       NOT NULL DEFAULT '{}',
  created_at                timestamptz NOT NULL DEFAULT now(),
  updated_at                timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT refund_le_payment CHECK (refund_amount_cents <= amount_cents)
);

-- ============================================================
--  8. SUBSCRIPTIONS  (PortalFlow platform billing)
-- ============================================================
CREATE TABLE public.subscriptions (
  id                     uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id        uuid        NOT NULL UNIQUE
                           REFERENCES public.organizations (id) ON DELETE CASCADE,
  -- Stripe --------------------------------------------------
  stripe_subscription_id text        UNIQUE,
  stripe_customer_id     text,
  stripe_price_id        text,
  -- Plan ----------------------------------------------------
  plan                   text        NOT NULL DEFAULT 'studio'
                           CHECK (plan IN ('studio', 'agency', 'enterprise')),
  status                 text        NOT NULL DEFAULT 'trialing'
                           CHECK (status IN
                             ('trialing', 'active', 'past_due', 'canceled',
                              'paused', 'incomplete', 'incomplete_expired')),
  billing_interval       text        NOT NULL DEFAULT 'month'
                           CHECK (billing_interval IN ('month', 'year')),
  -- Seats ---------------------------------------------------
  seats                  integer     NOT NULL DEFAULT 1 CHECK (seats >= 1),
  -- Billing period ------------------------------------------
  current_period_start   timestamptz,
  current_period_end     timestamptz,
  trial_start            timestamptz,
  trial_end              timestamptz,
  -- Cancellation --------------------------------------------
  cancel_at_period_end   boolean     NOT NULL DEFAULT false,
  canceled_at            timestamptz,
  -- Usage metering (updated by webhooks) --------------------
  extra_storage_gb       integer     NOT NULL DEFAULT 0,
  metadata               jsonb       NOT NULL DEFAULT '{}',
  created_at             timestamptz NOT NULL DEFAULT now(),
  updated_at             timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE  public.subscriptions IS 'One row per organization. Source of truth mirrored from Stripe.';
COMMENT ON COLUMN public.subscriptions.seats IS 'Billable team seats. Enforced at invite time.';

-- ============================================================
--  9. ACTIVITY_LOGS  (immutable audit trail)
-- ============================================================
CREATE TABLE public.activity_logs (
  id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id  uuid        NOT NULL REFERENCES public.organizations (id) ON DELETE CASCADE,
  actor_id         uuid        REFERENCES public.users (id) ON DELETE SET NULL,
  -- What happened -------------------------------------------
  entity_type      text        NOT NULL
                     CHECK (entity_type IN
                       ('client', 'project', 'invoice', 'document', 'payment',
                        'user', 'subscription', 'portal_session', 'organization')),
  entity_id        uuid        NOT NULL,
  action           text        NOT NULL,           -- created | updated | deleted | sent | paid |
                                                   -- status_changed | viewed | shared | commented
  description      text,                           -- human-readable summary
  -- Diff ----------------------------------------------------
  changes          jsonb,                          -- { before: {...}, after: {...} }
  -- Request context -----------------------------------------
  ip_address       inet,
  user_agent       text,
  -- Timestamp (no updated_at — logs are immutable) ----------
  created_at       timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE  public.activity_logs IS 'Append-only audit trail. Never update or delete rows.';
COMMENT ON COLUMN public.activity_logs.changes IS 'JSON diff: {before: {...}, after: {...}}. NULL for creates.';
COMMENT ON COLUMN public.activity_logs.actor_id IS 'NULL for system-generated events (cron jobs, webhooks).';
