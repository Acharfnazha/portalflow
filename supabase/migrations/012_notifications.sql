-- ============================================================
--  012 — Notifications
-- ============================================================

CREATE TYPE IF NOT EXISTS public.notification_type AS ENUM (
  'client_created',
  'project_created',
  'document_uploaded',
  'invoice_created',
  'invoice_overdue',
  'portal_invite_sent'
);

CREATE TABLE IF NOT EXISTS public.notifications (
  id              uuid                      PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid                      NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id         uuid                      NOT NULL REFERENCES auth.users(id)           ON DELETE CASCADE,
  type            public.notification_type  NOT NULL,
  title           text                      NOT NULL,
  body            text,
  entity_type     text,
  entity_id       uuid,
  read_at         timestamptz,
  created_at      timestamptz               NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS notif_user_created_idx ON public.notifications (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS notif_org_unread_idx   ON public.notifications (organization_id) WHERE read_at IS NULL;

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Users may read their own notifications
CREATE POLICY "notif_select_own" ON public.notifications
  FOR SELECT USING (user_id = auth.uid());

-- Users may update (mark read) their own notifications
CREATE POLICY "notif_update_own" ON public.notifications
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Service role inserts on behalf of the system
CREATE POLICY "notif_insert_service" ON public.notifications
  FOR INSERT WITH CHECK (true);
