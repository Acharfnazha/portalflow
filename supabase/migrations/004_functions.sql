-- ============================================================
--  PortalFlow — Functions & Triggers
--  Migration: 004_functions.sql
-- ============================================================

-- ============================================================
--  UTILITY: update updated_at on every write
-- ============================================================
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Attach to every table that has updated_at
DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'organizations', 'users', 'clients', 'client_contacts',
    'projects', 'documents', 'invoices', 'invoice_line_items',
    'payments', 'subscriptions'
  ]
  LOOP
    EXECUTE format(
      'CREATE TRIGGER trg_%I_updated_at
         BEFORE UPDATE ON public.%I
         FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();',
      t, t
    );
  END LOOP;
END;
$$;

-- ============================================================
--  AUTO-CREATE profile on auth.users INSERT
--  Fires when a new user signs up. Expects org_id to be
--  passed as app_metadata.organization_id (set during invite flow).
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_org_id  uuid;
  v_role    text;
BEGIN
  v_org_id := (NEW.raw_app_meta_data->>'organization_id')::uuid;
  v_role   := COALESCE(NEW.raw_app_meta_data->>'role', 'member');

  -- If no org yet (first signup), create a new organization first
  IF v_org_id IS NULL THEN
    INSERT INTO public.organizations (name, slug)
    VALUES (
      COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
      lower(regexp_replace(
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        '[^a-z0-9]', '-', 'g'
      )) || '-' || left(gen_random_uuid()::text, 8)
    )
    RETURNING id INTO v_org_id;

    v_role := 'owner';
  END IF;

  INSERT INTO public.users (id, organization_id, full_name, email, role)
  VALUES (
    NEW.id,
    v_org_id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.email,
    v_role
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();

-- ============================================================
--  INVOICE NUMBER GENERATION
--  Generates INV-XXXX scoped per organization.
--  Uses a sequence stored in a side table for atomicity.
-- ============================================================
CREATE TABLE IF NOT EXISTS public.invoice_sequences (
  organization_id uuid    PRIMARY KEY REFERENCES public.organizations (id) ON DELETE CASCADE,
  last_number     integer NOT NULL DEFAULT 0
);

CREATE OR REPLACE FUNCTION public.next_invoice_number(p_org_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_next integer;
BEGIN
  INSERT INTO public.invoice_sequences (organization_id, last_number)
  VALUES (p_org_id, 1)
  ON CONFLICT (organization_id) DO UPDATE
    SET last_number = invoice_sequences.last_number + 1
  RETURNING last_number INTO v_next;

  RETURN 'INV-' || lpad(v_next::text, 4, '0');
END;
$$;

COMMENT ON FUNCTION public.next_invoice_number IS
  'Thread-safe invoice number generator. Produces INV-0001, INV-0042, etc.';

-- Auto-assign invoice_number on INSERT if not provided
CREATE OR REPLACE FUNCTION public.assign_invoice_number()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.invoice_number IS NULL OR NEW.invoice_number = '' THEN
    NEW.invoice_number := public.next_invoice_number(NEW.organization_id);
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_invoice_number
  BEFORE INSERT ON public.invoices
  FOR EACH ROW EXECUTE FUNCTION public.assign_invoice_number();

-- ============================================================
--  INVOICE LINE ITEMS: keep total_cents in sync
-- ============================================================
CREATE OR REPLACE FUNCTION public.sync_line_item_total()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.total_cents := ROUND(NEW.quantity * NEW.unit_price_cents);
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_line_item_total
  BEFORE INSERT OR UPDATE ON public.invoice_line_items
  FOR EACH ROW EXECUTE FUNCTION public.sync_line_item_total();

-- Also keep invoice totals in sync when line items change
CREATE OR REPLACE FUNCTION public.sync_invoice_totals()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_invoice_id uuid;
  v_subtotal   integer;
  v_tax_rate   numeric;
  v_tax        integer;
  v_discount   integer;
  v_total      integer;
BEGIN
  v_invoice_id := COALESCE(NEW.invoice_id, OLD.invoice_id);

  SELECT
    COALESCE(SUM(li.total_cents), 0),
    i.tax_rate,
    i.discount_cents
  INTO v_subtotal, v_tax_rate, v_discount
  FROM       public.invoice_line_items li
  RIGHT JOIN public.invoices i ON i.id = v_invoice_id
  WHERE i.id = v_invoice_id
  GROUP BY i.tax_rate, i.discount_cents;

  v_tax   := ROUND(v_subtotal * v_tax_rate);
  v_total := GREATEST(0, v_subtotal + v_tax - v_discount);

  UPDATE public.invoices
  SET
    subtotal_cents = v_subtotal,
    tax_cents      = v_tax,
    total_cents    = v_total,
    updated_at     = now()
  WHERE id = v_invoice_id;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_invoice_totals_on_line_item
  AFTER INSERT OR UPDATE OR DELETE ON public.invoice_line_items
  FOR EACH ROW EXECUTE FUNCTION public.sync_invoice_totals();

-- ============================================================
--  ORGANIZATION STORAGE METER
--  Keeps organizations.storage_used_bytes accurate.
-- ============================================================
CREATE OR REPLACE FUNCTION public.update_org_storage()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.organizations
    SET storage_used_bytes = storage_used_bytes + NEW.size_bytes
    WHERE id = NEW.organization_id;

  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.organizations
    SET storage_used_bytes = GREATEST(0, storage_used_bytes - OLD.size_bytes)
    WHERE id = OLD.organization_id;

  ELSIF TG_OP = 'UPDATE' AND NEW.size_bytes <> OLD.size_bytes THEN
    UPDATE public.organizations
    SET storage_used_bytes = GREATEST(0,
          storage_used_bytes - OLD.size_bytes + NEW.size_bytes)
    WHERE id = NEW.organization_id;
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER trg_document_storage
  AFTER INSERT OR UPDATE OR DELETE ON public.documents
  FOR EACH ROW EXECUTE FUNCTION public.update_org_storage();

-- ============================================================
--  ACTIVITY LOG HELPER
--  Call this from server actions / API routes to record events.
--  Uses SECURITY DEFINER so regular users can append logs
--  without needing a direct INSERT policy.
-- ============================================================
CREATE OR REPLACE FUNCTION public.log_activity(
  p_organization_id  uuid,
  p_actor_id         uuid,
  p_entity_type      text,
  p_entity_id        uuid,
  p_action           text,
  p_description      text    DEFAULT NULL,
  p_changes          jsonb   DEFAULT NULL,
  p_ip_address       inet    DEFAULT NULL,
  p_user_agent       text    DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_id uuid;
BEGIN
  INSERT INTO public.activity_logs
    (organization_id, actor_id, entity_type, entity_id,
     action, description, changes, ip_address, user_agent)
  VALUES
    (p_organization_id, p_actor_id, p_entity_type, p_entity_id,
     p_action, p_description, p_changes, p_ip_address, p_user_agent)
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$;

COMMENT ON FUNCTION public.log_activity IS
  'SECURITY DEFINER wrapper. Call from API routes to append audit events safely.';

-- ============================================================
--  SUBSCRIPTION SYNC
--  Called by the Stripe webhook handler to keep subscriptions
--  and organizations in sync atomically.
-- ============================================================
CREATE OR REPLACE FUNCTION public.sync_stripe_subscription(
  p_stripe_subscription_id  text,
  p_stripe_customer_id      text,
  p_stripe_price_id         text,
  p_plan                    text,
  p_status                  text,
  p_billing_interval        text,
  p_current_period_start    timestamptz,
  p_current_period_end      timestamptz,
  p_trial_start             timestamptz  DEFAULT NULL,
  p_trial_end               timestamptz  DEFAULT NULL,
  p_cancel_at_period_end    boolean      DEFAULT false,
  p_canceled_at             timestamptz  DEFAULT NULL,
  p_seats                   integer      DEFAULT 1
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_org_id uuid;
BEGIN
  -- Resolve org from stripe customer id
  SELECT id INTO v_org_id
  FROM   public.organizations
  WHERE  stripe_customer_id = p_stripe_customer_id;

  IF v_org_id IS NULL THEN
    RAISE EXCEPTION 'No organization found for Stripe customer %', p_stripe_customer_id;
  END IF;

  -- Upsert subscription
  INSERT INTO public.subscriptions (
    organization_id, stripe_subscription_id, stripe_customer_id,
    stripe_price_id, plan, status, billing_interval,
    current_period_start, current_period_end,
    trial_start, trial_end,
    cancel_at_period_end, canceled_at, seats
  )
  VALUES (
    v_org_id, p_stripe_subscription_id, p_stripe_customer_id,
    p_stripe_price_id, p_plan, p_status, p_billing_interval,
    p_current_period_start, p_current_period_end,
    p_trial_start, p_trial_end,
    p_cancel_at_period_end, p_canceled_at, p_seats
  )
  ON CONFLICT (organization_id) DO UPDATE SET
    stripe_subscription_id = EXCLUDED.stripe_subscription_id,
    stripe_price_id        = EXCLUDED.stripe_price_id,
    plan                   = EXCLUDED.plan,
    status                 = EXCLUDED.status,
    billing_interval       = EXCLUDED.billing_interval,
    current_period_start   = EXCLUDED.current_period_start,
    current_period_end     = EXCLUDED.current_period_end,
    trial_start            = EXCLUDED.trial_start,
    trial_end              = EXCLUDED.trial_end,
    cancel_at_period_end   = EXCLUDED.cancel_at_period_end,
    canceled_at            = EXCLUDED.canceled_at,
    seats                  = EXCLUDED.seats,
    updated_at             = now();

  -- Mirror status + plan onto organization row for fast reads
  UPDATE public.organizations
  SET
    plan                = p_plan,
    subscription_status = p_status,
    updated_at          = now()
  WHERE id = v_org_id;
END;
$$;

-- ============================================================
--  SOFT-DELETE SHORTCUTS
--  Prefer calling these over raw UPDATE to keep deleted_at
--  consistent and auto-log the event.
-- ============================================================
CREATE OR REPLACE FUNCTION public.soft_delete(
  p_table   text,
  p_id      uuid,
  p_actor   uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_org_id uuid;
BEGIN
  EXECUTE format(
    'UPDATE public.%I SET deleted_at = now(), updated_at = now()
     WHERE id = $1 AND deleted_at IS NULL
     RETURNING organization_id',
    p_table
  ) INTO v_org_id USING p_id;

  IF v_org_id IS NULL THEN
    RAISE EXCEPTION 'Row not found or already deleted: %.%', p_table, p_id;
  END IF;

  PERFORM public.log_activity(
    v_org_id, p_actor, p_table, p_id, 'deleted',
    format('%s %s soft-deleted', p_table, p_id)
  );
END;
$$;

-- ============================================================
--  PLAN LIMIT CHECK
--  Call before creating clients / inviting team members.
-- ============================================================
CREATE OR REPLACE FUNCTION public.check_plan_limit(
  p_org_id    uuid,
  p_resource  text   -- 'clients' | 'users' | 'storage_gb'
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_plan        text;
  v_current     integer;
  v_limit       integer;
  v_storage_gb  numeric;
BEGIN
  SELECT plan INTO v_plan FROM public.organizations WHERE id = p_org_id;

  -- Plan limits
  IF p_resource = 'clients' THEN
    v_limit := CASE v_plan
      WHEN 'studio'     THEN 25
      WHEN 'agency'     THEN NULL  -- unlimited
      WHEN 'enterprise' THEN NULL
    END;
    SELECT count(*) INTO v_current
    FROM   public.clients
    WHERE  organization_id = p_org_id AND deleted_at IS NULL;

  ELSIF p_resource = 'users' THEN
    v_limit := CASE v_plan
      WHEN 'studio' THEN 5
      ELSE NULL               -- unlimited
    END;
    SELECT count(*) INTO v_current
    FROM   public.users WHERE organization_id = p_org_id;

  ELSIF p_resource = 'storage_gb' THEN
    v_limit := CASE v_plan
      WHEN 'studio'     THEN 5
      WHEN 'agency'     THEN 50
      WHEN 'enterprise' THEN NULL
    END;
    SELECT CEIL(storage_used_bytes / 1073741824.0)
    INTO   v_current
    FROM   public.organizations WHERE id = p_org_id;
  END IF;

  RETURN jsonb_build_object(
    'allowed',  v_limit IS NULL OR v_current < v_limit,
    'current',  v_current,
    'limit',    v_limit,
    'plan',     v_plan
  );
END;
$$;

-- ============================================================
--  PORTAL TOKEN VALIDATION
--  Used by Next.js middleware. Returns client_id if valid,
--  null if expired / not found.
-- ============================================================
CREATE OR REPLACE FUNCTION public.validate_portal_token(p_token text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_client_id uuid;
BEGIN
  UPDATE public.portal_sessions
  SET    last_used_at = now()
  WHERE  token      = p_token
    AND  expires_at > now()
  RETURNING client_id INTO v_client_id;

  RETURN v_client_id;   -- NULL if not found / expired
END;
$$;

COMMENT ON FUNCTION public.validate_portal_token IS
  'Validates a portal token and refreshes last_used_at. Returns client_id or NULL.';
