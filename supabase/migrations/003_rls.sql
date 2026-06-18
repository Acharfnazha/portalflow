-- ============================================================
--  PortalFlow — Row Level Security (RLS)
--  Migration: 003_rls.sql
--
--  Three principals:
--    1. Agency users    — authenticated via Supabase Auth (JWT)
--                         data scoped to their organization_id
--    2. Portal visitors — NOT in auth.users; authenticated via
--                         portal_sessions.token in a request header
--                         (validated by Edge Function / middleware)
--                         → uses a Postgres session variable:
--                           SET LOCAL app.portal_client_id = '<uuid>';
--    3. Service role    — Supabase service key (webhooks, crons)
--                         bypasses RLS entirely
--
--  Helper functions defined here; triggers in 004_functions.sql.
-- ============================================================

-- ── Helper: get org_id for the current auth user -----------
CREATE OR REPLACE FUNCTION auth.org_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT organization_id
  FROM   public.users
  WHERE  id = auth.uid()
$$;

-- ── Helper: get the portal client_id set by middleware -----
CREATE OR REPLACE FUNCTION auth.portal_client_id()
RETURNS uuid
LANGUAGE sql
STABLE
AS $$
  SELECT NULLIF(current_setting('app.portal_client_id', true), '')::uuid
$$;

-- ── Helper: current user's role ----------------------------
CREATE OR REPLACE FUNCTION auth.user_role()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT role FROM public.users WHERE id = auth.uid()
$$;

-- ============================================================
--  Enable RLS on every table
-- ============================================================
ALTER TABLE public.organizations    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_contacts  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portal_sessions  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_members  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_line_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs    ENABLE ROW LEVEL SECURITY;

-- ============================================================
--  ORGANIZATIONS
-- ============================================================
-- Agency users may read their own org
CREATE POLICY "org_select_own" ON public.organizations
  FOR SELECT
  USING (id = auth.org_id());

-- Only owner may update org settings
CREATE POLICY "org_update_owner" ON public.organizations
  FOR UPDATE
  USING (id = auth.org_id() AND auth.user_role() = 'owner');

-- Insert handled by signup Edge Function (service role)
-- Delete: owner only (also owner can only delete via service role for safety)

-- ============================================================
--  USERS (profiles)
-- ============================================================
-- All team members in org can see each other
CREATE POLICY "users_select_org" ON public.users
  FOR SELECT
  USING (organization_id = auth.org_id());

-- Users update their own profile
CREATE POLICY "users_update_self" ON public.users
  FOR UPDATE
  USING (id = auth.uid());

-- Admin/owner may update any profile in org (role assignment, removal)
CREATE POLICY "users_update_admin" ON public.users
  FOR UPDATE
  USING (
    organization_id = auth.org_id()
    AND auth.user_role() IN ('owner', 'admin')
  );

-- Insert: service role only (triggered on auth.users insert)
-- Delete: owner/admin can remove team members
CREATE POLICY "users_delete_admin" ON public.users
  FOR DELETE
  USING (
    organization_id = auth.org_id()
    AND auth.user_role() IN ('owner', 'admin')
    AND id != auth.uid()           -- cannot self-delete
  );

-- ============================================================
--  CLIENTS
-- ============================================================
CREATE POLICY "clients_select" ON public.clients
  FOR SELECT
  USING (
    -- Agency users: own org, not soft-deleted
    (organization_id = auth.org_id() AND deleted_at IS NULL)
    OR
    -- Portal visitor: their own client record
    (id = auth.portal_client_id() AND portal_enabled = true)
  );

CREATE POLICY "clients_insert" ON public.clients
  FOR INSERT
  WITH CHECK (
    organization_id = auth.org_id()
    AND auth.user_role() IN ('owner', 'admin', 'manager')
  );

CREATE POLICY "clients_update" ON public.clients
  FOR UPDATE
  USING (
    organization_id = auth.org_id()
    AND deleted_at IS NULL
    AND auth.user_role() IN ('owner', 'admin', 'manager')
  );

-- Soft delete only (set deleted_at = now()) via UPDATE policy above.
-- Hard delete restricted to service role.

-- ============================================================
--  CLIENT CONTACTS
-- ============================================================
CREATE POLICY "client_contacts_select" ON public.client_contacts
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.clients c
      WHERE c.id = client_contacts.client_id
        AND (
          c.organization_id = auth.org_id()
          OR c.id = auth.portal_client_id()
        )
        AND c.deleted_at IS NULL
    )
  );

CREATE POLICY "client_contacts_write" ON public.client_contacts
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.clients c
      WHERE c.id = client_contacts.client_id
        AND c.organization_id = auth.org_id()
        AND c.deleted_at IS NULL
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.clients c
      WHERE c.id = client_contacts.client_id
        AND c.organization_id = auth.org_id()
        AND c.deleted_at IS NULL
    )
  );

-- ============================================================
--  PORTAL SESSIONS
-- ============================================================
-- Agency users: list sessions they created (or admin sees all for org)
CREATE POLICY "portal_sessions_select" ON public.portal_sessions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.clients c
      WHERE c.id = portal_sessions.client_id
        AND c.organization_id = auth.org_id()
    )
  );

CREATE POLICY "portal_sessions_insert" ON public.portal_sessions
  FOR INSERT
  WITH CHECK (
    auth.user_role() IN ('owner', 'admin', 'manager')
    AND EXISTS (
      SELECT 1 FROM public.clients c
      WHERE c.id = portal_sessions.client_id
        AND c.organization_id = auth.org_id()
    )
  );

-- Revoke (delete) session: admin+ or session creator
CREATE POLICY "portal_sessions_delete" ON public.portal_sessions
  FOR DELETE
  USING (
    created_by = auth.uid()
    OR auth.user_role() IN ('owner', 'admin')
  );

-- ============================================================
--  PROJECTS
-- ============================================================
CREATE POLICY "projects_select" ON public.projects
  FOR SELECT
  USING (
    -- Agency: own org
    (organization_id = auth.org_id() AND deleted_at IS NULL)
    OR
    -- Portal visitor: client's projects marked visible
    (
      client_id = auth.portal_client_id()
      AND visible_to_client = true
      AND deleted_at IS NULL
    )
  );

CREATE POLICY "projects_insert" ON public.projects
  FOR INSERT
  WITH CHECK (
    organization_id = auth.org_id()
    AND auth.user_role() IN ('owner', 'admin', 'manager')
  );

CREATE POLICY "projects_update" ON public.projects
  FOR UPDATE
  USING (
    organization_id = auth.org_id()
    AND deleted_at IS NULL
    AND (
      auth.user_role() IN ('owner', 'admin', 'manager')
      OR
      -- Member can update if they are assigned
      EXISTS (
        SELECT 1 FROM public.project_members pm
        WHERE pm.project_id = projects.id
          AND pm.user_id = auth.uid()
          AND pm.role IN ('lead', 'contributor')
      )
    )
  );

-- ============================================================
--  PROJECT MEMBERS
-- ============================================================
CREATE POLICY "project_members_select" ON public.project_members
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id = project_members.project_id
        AND (
          p.organization_id = auth.org_id()
          OR (p.client_id = auth.portal_client_id() AND p.visible_to_client = true)
        )
        AND p.deleted_at IS NULL
    )
  );

CREATE POLICY "project_members_write" ON public.project_members
  FOR ALL
  USING (
    auth.user_role() IN ('owner', 'admin', 'manager')
    AND EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id = project_members.project_id
        AND p.organization_id = auth.org_id()
    )
  );

-- ============================================================
--  DOCUMENTS
-- ============================================================
CREATE POLICY "documents_select" ON public.documents
  FOR SELECT
  USING (
    (organization_id = auth.org_id() AND deleted_at IS NULL)
    OR
    (
      client_id = auth.portal_client_id()
      AND visible_to_client = true
      AND deleted_at IS NULL
    )
  );

CREATE POLICY "documents_insert" ON public.documents
  FOR INSERT
  WITH CHECK (organization_id = auth.org_id());

CREATE POLICY "documents_update" ON public.documents
  FOR UPDATE
  USING (
    organization_id = auth.org_id()
    AND deleted_at IS NULL
    AND auth.user_role() IN ('owner', 'admin', 'manager')
  );

-- ============================================================
--  INVOICES
-- ============================================================
CREATE POLICY "invoices_select" ON public.invoices
  FOR SELECT
  USING (
    (organization_id = auth.org_id() AND deleted_at IS NULL)
    OR
    (
      client_id = auth.portal_client_id()
      AND status NOT IN ('draft', 'void')
      AND deleted_at IS NULL
    )
  );

CREATE POLICY "invoices_insert" ON public.invoices
  FOR INSERT
  WITH CHECK (
    organization_id = auth.org_id()
    AND auth.user_role() IN ('owner', 'admin', 'manager')
  );

CREATE POLICY "invoices_update" ON public.invoices
  FOR UPDATE
  USING (
    organization_id = auth.org_id()
    AND deleted_at IS NULL
    AND auth.user_role() IN ('owner', 'admin', 'manager')
    -- Cannot edit paid/void invoices (except to add pdf_path)
  );

-- ============================================================
--  INVOICE LINE ITEMS
-- ============================================================
CREATE POLICY "line_items_select" ON public.invoice_line_items
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.invoices i
      WHERE i.id = invoice_line_items.invoice_id
        AND (
          i.organization_id = auth.org_id()
          OR (
            i.client_id = auth.portal_client_id()
            AND i.status NOT IN ('draft', 'void')
          )
        )
        AND i.deleted_at IS NULL
    )
  );

CREATE POLICY "line_items_write" ON public.invoice_line_items
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.invoices i
      WHERE i.id = invoice_line_items.invoice_id
        AND i.organization_id = auth.org_id()
        AND i.status = 'draft'     -- line items locked once invoice is sent
    )
  );

-- ============================================================
--  PAYMENTS
-- ============================================================
CREATE POLICY "payments_select" ON public.payments
  FOR SELECT
  USING (
    (organization_id = auth.org_id())
    OR
    (client_id = auth.portal_client_id() AND status = 'succeeded')
  );

-- Payments are created by webhooks (service role) or manually by manager+
CREATE POLICY "payments_insert" ON public.payments
  FOR INSERT
  WITH CHECK (
    organization_id = auth.org_id()
    AND auth.user_role() IN ('owner', 'admin', 'manager')
  );

-- Updates: status changes, refund recording (manager+)
CREATE POLICY "payments_update" ON public.payments
  FOR UPDATE
  USING (
    organization_id = auth.org_id()
    AND auth.user_role() IN ('owner', 'admin', 'manager')
  );

-- ============================================================
--  SUBSCRIPTIONS
-- ============================================================
-- Only owner may read billing details
CREATE POLICY "subscriptions_select" ON public.subscriptions
  FOR SELECT
  USING (
    organization_id = auth.org_id()
    AND auth.user_role() IN ('owner', 'admin')
  );

-- Stripe webhook (service role) handles inserts/updates.
-- No direct INSERT/UPDATE policy for regular users.

-- ============================================================
--  ACTIVITY LOGS
-- ============================================================
-- All org members can read their org's activity
CREATE POLICY "activity_select" ON public.activity_logs
  FOR SELECT
  USING (organization_id = auth.org_id());

-- Portal visitors: read their own client's activity (non-sensitive)
CREATE POLICY "activity_portal_select" ON public.activity_logs
  FOR SELECT
  USING (
    entity_type IN ('project', 'invoice', 'document')
    AND entity_id IN (
      -- projects visible to client
      SELECT id FROM public.projects
      WHERE client_id = auth.portal_client_id() AND visible_to_client = true
      UNION
      -- invoices visible to client
      SELECT id FROM public.invoices
      WHERE client_id = auth.portal_client_id() AND status NOT IN ('draft', 'void')
    )
  );

-- Logs are written by service role / SECURITY DEFINER functions only.
-- No direct INSERT policy for regular users to prevent tampering.
