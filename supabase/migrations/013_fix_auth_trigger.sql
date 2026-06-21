-- ─────────────────────────────────────────────────────────────
-- 013_fix_auth_trigger.sql
-- Fix: dual signup trigger creating two organizations per user
--
-- Problem:
--   Migration 004 creates trigger trg_on_auth_user_created on
--   auth.users (INSERT) → calls handle_new_auth_user() which
--   creates an org and inserts into public.users.
--
--   Migration 005 creates trigger on_auth_user_created on
--   auth.users (INSERT) → calls handle_new_user() which creates
--   a SECOND org and inserts into public.profiles.
--
--   Both triggers fire on every signup. Two orgs are created.
--   auth.org_id() reads public.users → returns org B.
--   Server actions read public.profiles → use org A.
--   RLS checks (which use auth.org_id()) reject all writes.
--
-- Fix:
--   Drop the 004 trigger. Update handle_new_user() to also
--   populate public.users with the same org_id as public.profiles.
-- ─────────────────────────────────────────────────────────────

-- 1. Drop the conflicting trigger from migration 004
DROP TRIGGER IF EXISTS trg_on_auth_user_created ON auth.users;

-- 2. Update handle_new_user() to also populate public.users
--    (required by auth.org_id() and auth.user_role() RLS helpers)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  _org_id   uuid;
  _org_name text;
  _full_name text;
BEGIN
  _org_name := COALESCE(
    NEW.raw_user_meta_data->>'org_name',
    split_part(NEW.email, '@', 2)
  );

  _full_name := TRIM(
    COALESCE(NEW.raw_user_meta_data->>'first_name', '') || ' ' ||
    COALESCE(NEW.raw_user_meta_data->>'last_name', '')
  );

  -- Create organization (first user becomes owner)
  INSERT INTO public.organizations (name, slug, plan)
  VALUES (
    _org_name,
    regexp_replace(lower(_org_name), '[^a-z0-9]+', '-', 'g'),
    'studio'
  )
  RETURNING id INTO _org_id;

  -- Populate public.profiles (used by server actions)
  INSERT INTO public.profiles (id, organization_id, full_name, role)
  VALUES (NEW.id, _org_id, _full_name, 'owner')
  ON CONFLICT (id) DO NOTHING;

  -- Populate public.users (used by auth.org_id() and auth.user_role() RLS helpers)
  INSERT INTO public.users (id, organization_id, full_name, email, role)
  VALUES (NEW.id, _org_id, _full_name, NEW.email, 'owner')
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;
