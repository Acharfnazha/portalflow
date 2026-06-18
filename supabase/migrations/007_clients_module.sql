-- ============================================================
--  PortalFlow — Clients Module
--  Migration: 007_clients_module.sql
-- ============================================================

-- ── RLS: clients ─────────────────────────────────────────────

-- Agency users can read own-org clients (excluding soft-deleted)
CREATE POLICY "clients_select_org"
  ON public.clients FOR SELECT
  USING (
    organization_id = auth.org_id()
    AND deleted_at IS NULL
  );

-- Portal visitors can read their own client record
CREATE POLICY "clients_select_portal"
  ON public.clients FOR SELECT
  USING (id = auth.portal_client_id());

-- Manager+ can create clients
CREATE POLICY "clients_insert_manager"
  ON public.clients FOR INSERT
  WITH CHECK (
    organization_id = auth.org_id()
    AND auth.has_role_at_least('manager')
  );

-- Manager+ can update clients in their org
CREATE POLICY "clients_update_manager"
  ON public.clients FOR UPDATE
  USING (
    organization_id = auth.org_id()
    AND deleted_at IS NULL
    AND auth.has_role_at_least('manager')
  );

-- Manager+ can soft-delete (set deleted_at) — handled via UPDATE policy above

-- ── RLS: activity_logs ───────────────────────────────────────

-- Users can read activity for their org
CREATE POLICY "activity_select_org"
  ON public.activity_logs FOR SELECT
  USING (organization_id = auth.org_id());

-- Inserts only via service role (bypasses RLS)
-- No INSERT policy needed here — service client handles writes

-- ── Helper: log client activity ──────────────────────────────

CREATE OR REPLACE FUNCTION public.log_activity(
  p_org_id      uuid,
  p_actor_id    uuid,
  p_entity_type text,
  p_entity_id   uuid,
  p_action      text,
  p_description text    DEFAULT NULL,
  p_changes     jsonb   DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.activity_logs (
    organization_id, actor_id, entity_type, entity_id,
    action, description, changes
  ) VALUES (
    p_org_id, p_actor_id, p_entity_type, p_entity_id,
    p_action, p_description, p_changes
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.log_activity TO authenticated;

-- ── View: client activity with actor name ────────────────────

CREATE OR REPLACE VIEW public.client_activity_view AS
SELECT
  al.id,
  al.organization_id,
  al.actor_id,
  al.entity_type,
  al.entity_id,
  al.action,
  al.description,
  al.changes,
  al.created_at,
  p.full_name AS actor_name,
  p.avatar_url AS actor_avatar_url
FROM public.activity_logs al
LEFT JOIN public.profiles p ON p.id = al.actor_id;
