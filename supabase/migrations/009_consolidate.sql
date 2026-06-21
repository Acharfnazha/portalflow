-- ─────────────────────────────────────────────────────────────
-- 009_consolidate.sql
--
-- Fixes critical conflicts introduced by the 001-008 migration set:
--
-- 1. Dual-trigger conflict: 004 creates trg_on_auth_user_created
--    (writes to public.users) and 005 creates on_auth_user_created
--    (writes to public.profiles). Both fire on signup and both try
--    to create an organization → duplicate org rows / FK violations.
--    Fix: drop the 004 trigger and update handle_new_user() to
--    ALSO mirror into public.users so FK constraints still work.
--
-- 2. clients.owner_id FK references public.users. If the 004 trigger
--    is dropped, inserting a client would fail. Fixed by the mirror
--    insert above.
--
-- 3. Duplicate RLS policies on clients (003 + 007).
--
-- 4. Duplicate RLS policies on activity_logs (003 + 007).
--
-- 5. Grant missing execute permissions for helper functions.
-- ─────────────────────────────────────────────────────────────


-- ── 1. Drop the conflicting 004 trigger ──────────────────────
DROP TRIGGER IF EXISTS trg_on_auth_user_created ON auth.users;


-- ── 2. Rewrite handle_new_user() to write both tables ────────
-- Writes to public.profiles (the app uses this) AND mirrors into
-- public.users (so FK constraints on clients, projects, etc. work).
-- Slug gets a uuid suffix to avoid unique collisions.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  _org_id    uuid;
  _org_name  text;
  _full_name text;
  _slug      text;
BEGIN
  _org_name := COALESCE(
    NULLIF(TRIM(NEW.raw_user_meta_data->>'org_name'), ''),
    split_part(NEW.email, '@', 2)
  );

  _full_name := TRIM(
    COALESCE(NEW.raw_user_meta_data->>'first_name', '') || ' ' ||
    COALESCE(NEW.raw_user_meta_data->>'last_name',  '')
  );

  -- Slug: lower-case org name + 8-char uuid suffix to avoid collisions
  _slug := regexp_replace(lower(_org_name), '[^a-z0-9]+', '-', 'g')
           || '-' || left(gen_random_uuid()::text, 8);

  -- Create organization (first user becomes owner)
  INSERT INTO public.organizations (name, slug, plan)
  VALUES (_org_name, _slug, 'studio')
  RETURNING id INTO _org_id;

  -- Create profile (primary source of truth for the app)
  INSERT INTO public.profiles (id, organization_id, full_name, role)
  VALUES (NEW.id, _org_id, _full_name, 'owner')
  ON CONFLICT (id) DO NOTHING;

  -- Mirror into public.users so FK constraints on clients, projects,
  -- portal_sessions, documents, invoices, payments, activity_logs work.
  INSERT INTO public.users (id, organization_id, full_name, email, role)
  VALUES (NEW.id, _org_id, _full_name, NEW.email, 'owner')
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

-- Ensure the 005 trigger is (re)created pointing to the updated function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();


-- ── 3. Drop duplicate client RLS policies from 003_rls.sql ───
-- 007_clients_module.sql defines better versions of these.
DROP POLICY IF EXISTS "clients_select" ON public.clients;
DROP POLICY IF EXISTS "clients_insert" ON public.clients;
DROP POLICY IF EXISTS "clients_update" ON public.clients;


-- ── 4. Drop duplicate activity_logs policies from 003_rls.sql ─
-- 007_clients_module.sql defines activity_select_org which supersedes these.
DROP POLICY IF EXISTS "activity_select"        ON public.activity_logs;
DROP POLICY IF EXISTS "activity_portal_select" ON public.activity_logs;


-- ── 5. Grant permissions on helper functions ─────────────────
GRANT EXECUTE ON FUNCTION auth.org_id            TO authenticated;
GRANT EXECUTE ON FUNCTION auth.user_role         TO authenticated;
GRANT EXECUTE ON FUNCTION auth.has_role_at_least TO authenticated;
GRANT EXECUTE ON FUNCTION public.role_rank       TO authenticated;
GRANT EXECUTE ON FUNCTION public.log_activity    TO authenticated;
