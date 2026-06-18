-- ============================================================
--  PortalFlow — Indexes
--  Migration: 002_indexes.sql
--
--  Strategy:
--    • Every FK column gets an index (avoids seq scans on JOINs)
--    • Composite indexes target the exact WHERE + ORDER BY
--      patterns used by the app's most frequent queries
--    • Partial indexes exclude soft-deleted rows (deleted_at IS NULL)
--    • GIN indexes for jsonb columns queried with @> / ?
--    • GIN indexes for array columns queried with @> / &&
-- ============================================================

-- ============================================================
--  organizations
-- ============================================================
-- slug is already covered by the UNIQUE constraint (implicitly creates a btree index)
-- Covered: lookup by Stripe customer (webhook handler)
CREATE INDEX idx_organizations_stripe_customer
  ON public.organizations (stripe_customer_id)
  WHERE stripe_customer_id IS NOT NULL;

CREATE INDEX idx_organizations_subscription_status
  ON public.organizations (subscription_status);

-- ============================================================
--  users
-- ============================================================
CREATE INDEX idx_users_organization_id
  ON public.users (organization_id);

-- email lookup (login, invite dedup)
CREATE UNIQUE INDEX idx_users_email_unique
  ON public.users (email);

-- role filter (e.g., "list all managers in org")
CREATE INDEX idx_users_org_role
  ON public.users (organization_id, role);

-- ============================================================
--  clients
-- ============================================================
-- Primary listing query: org + alive rows
CREATE INDEX idx_clients_organization_active
  ON public.clients (organization_id, status)
  WHERE deleted_at IS NULL;

-- Account manager assignment
CREATE INDEX idx_clients_owner_id
  ON public.clients (owner_id)
  WHERE deleted_at IS NULL;

-- Health-score sorted list (at-risk dashboard)
CREATE INDEX idx_clients_org_health
  ON public.clients (organization_id, health_score)
  WHERE deleted_at IS NULL;

-- Portal lookup
CREATE INDEX idx_clients_portal_enabled
  ON public.clients (organization_id, portal_enabled)
  WHERE portal_enabled = true AND deleted_at IS NULL;

-- Free-text search helper (ilike on name / domain)
CREATE INDEX idx_clients_name_trgm
  ON public.clients USING gin (name gin_trgm_ops)
  WHERE deleted_at IS NULL;

-- tags @> filter
CREATE INDEX idx_clients_tags
  ON public.clients USING gin (tags);

-- ============================================================
--  client_contacts
-- ============================================================
CREATE INDEX idx_client_contacts_client_id
  ON public.client_contacts (client_id);

-- Quick lookup for primary contact
CREATE INDEX idx_client_contacts_primary
  ON public.client_contacts (client_id, is_primary)
  WHERE is_primary = true;

-- ============================================================
--  portal_sessions
-- ============================================================
-- Token lookup is the hot path (every portal page load)
-- Already covered by UNIQUE constraint; add partial for valid tokens
CREATE INDEX idx_portal_sessions_token_valid
  ON public.portal_sessions (token)
  WHERE expires_at > now();

CREATE INDEX idx_portal_sessions_client_id
  ON public.portal_sessions (client_id);

-- ============================================================
--  projects
-- ============================================================
-- Main listing: org + status + soft-delete filter
CREATE INDEX idx_projects_org_status
  ON public.projects (organization_id, status)
  WHERE deleted_at IS NULL;

-- Client profile → projects tab
CREATE INDEX idx_projects_client_id
  ON public.projects (client_id)
  WHERE deleted_at IS NULL;

-- Deadline-sorted view (overdue detection)
CREATE INDEX idx_projects_deadline
  ON public.projects (organization_id, deadline)
  WHERE deleted_at IS NULL AND deadline IS NOT NULL;

-- Priority filter
CREATE INDEX idx_projects_org_priority
  ON public.projects (organization_id, priority, status)
  WHERE deleted_at IS NULL;

-- Free-text on name
CREATE INDEX idx_projects_name_trgm
  ON public.projects USING gin (name gin_trgm_ops)
  WHERE deleted_at IS NULL;

CREATE INDEX idx_projects_tags
  ON public.projects USING gin (tags);

CREATE INDEX idx_projects_created_by
  ON public.projects (created_by);

-- ============================================================
--  project_members
-- ============================================================
-- Reverse lookup: which projects is a user on?
CREATE INDEX idx_project_members_user_id
  ON public.project_members (user_id);

-- ============================================================
--  documents
-- ============================================================
CREATE INDEX idx_documents_org_active
  ON public.documents (organization_id, status)
  WHERE deleted_at IS NULL;

CREATE INDEX idx_documents_client_id
  ON public.documents (client_id)
  WHERE deleted_at IS NULL;

CREATE INDEX idx_documents_project_id
  ON public.documents (project_id)
  WHERE deleted_at IS NULL;

CREATE INDEX idx_documents_uploaded_by
  ON public.documents (uploaded_by);

-- Client-portal visible documents
CREATE INDEX idx_documents_client_visible
  ON public.documents (client_id, visible_to_client)
  WHERE visible_to_client = true AND deleted_at IS NULL;

-- Version chain lookup
CREATE INDEX idx_documents_parent_id
  ON public.documents (parent_id)
  WHERE parent_id IS NOT NULL;

-- File-type filter
CREATE INDEX idx_documents_file_type
  ON public.documents (organization_id, file_type)
  WHERE deleted_at IS NULL;

-- ============================================================
--  invoices
-- ============================================================
-- Main listing: org + status
CREATE INDEX idx_invoices_org_status
  ON public.invoices (organization_id, status)
  WHERE deleted_at IS NULL;

-- Client profile → invoices tab
CREATE INDEX idx_invoices_client_id
  ON public.invoices (client_id)
  WHERE deleted_at IS NULL;

-- Project → invoices
CREATE INDEX idx_invoices_project_id
  ON public.invoices (project_id)
  WHERE deleted_at IS NULL AND project_id IS NOT NULL;

-- Overdue detection (cron job scans this daily)
CREATE INDEX idx_invoices_overdue_check
  ON public.invoices (organization_id, due_at)
  WHERE status = 'pending' AND deleted_at IS NULL;

-- Invoice number lookup (API + PDF generation)
CREATE INDEX idx_invoices_number
  ON public.invoices (organization_id, invoice_number)
  WHERE deleted_at IS NULL;

-- Stripe reconciliation
CREATE INDEX idx_invoices_stripe_pi
  ON public.invoices (stripe_payment_intent_id)
  WHERE stripe_payment_intent_id IS NOT NULL;

-- Date-range revenue queries
CREATE INDEX idx_invoices_issued_at
  ON public.invoices (organization_id, issued_at)
  WHERE deleted_at IS NULL;

-- ============================================================
--  invoice_line_items
-- ============================================================
-- All lookups go through invoice_id
CREATE INDEX idx_line_items_invoice_id
  ON public.invoice_line_items (invoice_id);

-- Sorted rendering
CREATE INDEX idx_line_items_sort
  ON public.invoice_line_items (invoice_id, sort_order);

-- ============================================================
--  payments
-- ============================================================
CREATE INDEX idx_payments_org
  ON public.payments (organization_id, created_at DESC);

CREATE INDEX idx_payments_invoice_id
  ON public.payments (invoice_id);

CREATE INDEX idx_payments_client_id
  ON public.payments (client_id);

CREATE INDEX idx_payments_status
  ON public.payments (organization_id, status);

-- Stripe reconciliation
CREATE INDEX idx_payments_stripe_pi
  ON public.payments (stripe_payment_intent_id)
  WHERE stripe_payment_intent_id IS NOT NULL;

CREATE INDEX idx_payments_stripe_charge
  ON public.payments (stripe_charge_id)
  WHERE stripe_charge_id IS NOT NULL;

-- ============================================================
--  subscriptions
-- ============================================================
-- organization_id UNIQUE already indexed
CREATE INDEX idx_subscriptions_stripe_id
  ON public.subscriptions (stripe_subscription_id)
  WHERE stripe_subscription_id IS NOT NULL;

CREATE INDEX idx_subscriptions_status
  ON public.subscriptions (status);

-- Expiring trial sweep (cron)
CREATE INDEX idx_subscriptions_trial_end
  ON public.subscriptions (trial_end)
  WHERE status = 'trialing';

-- ============================================================
--  activity_logs
-- ============================================================
-- Most common query: latest events for an org
CREATE INDEX idx_activity_org_time
  ON public.activity_logs (organization_id, created_at DESC);

-- Entity feed (show all events for one client/project/invoice)
CREATE INDEX idx_activity_entity
  ON public.activity_logs (entity_type, entity_id, created_at DESC);

-- Actor history
CREATE INDEX idx_activity_actor
  ON public.activity_logs (actor_id, created_at DESC)
  WHERE actor_id IS NOT NULL;

-- ============================================================
--  Enable pg_trgm for trigram indexes above
-- ============================================================
CREATE EXTENSION IF NOT EXISTS pg_trgm;
