-- ─────────────────────────────────────────────────────────────
-- 005_auth_profiles.sql
-- Extends Supabase auth with a profiles table and org bootstrap
-- ─────────────────────────────────────────────────────────────

-- ── Profiles ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
  id            uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id uuid REFERENCES public.organizations(id) ON DELETE SET NULL,
  full_name     text,
  avatar_url    text,
  role          text NOT NULL DEFAULT 'owner'
                  CHECK (role IN ('owner', 'admin', 'manager', 'member')),
  job_title     text,
  timezone      text NOT NULL DEFAULT 'UTC',
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Users can only read/update their own profile
CREATE POLICY "profiles_select_own"
  ON public.profiles FOR SELECT
  USING (id = auth.uid());

CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE
  USING (id = auth.uid());

-- Org members can view other members' profiles
CREATE POLICY "profiles_select_org"
  ON public.profiles FOR SELECT
  USING (
    organization_id IS NOT NULL
    AND organization_id = (
      SELECT organization_id FROM public.profiles WHERE id = auth.uid()
    )
  );

-- ── Auto-create profile on signup ────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  _org_id uuid;
  _org_name text;
BEGIN
  -- Extract org name from metadata (set during signup form)
  _org_name := COALESCE(
    NEW.raw_user_meta_data->>'org_name',
    split_part(NEW.email, '@', 2)
  );

  -- Create org (first user becomes owner)
  INSERT INTO public.organizations (name, slug, plan)
  VALUES (
    _org_name,
    regexp_replace(lower(_org_name), '[^a-z0-9]+', '-', 'g'),
    'studio'
  )
  RETURNING id INTO _org_id;

  -- Create profile
  INSERT INTO public.profiles (id, organization_id, full_name, role)
  VALUES (
    NEW.id,
    _org_id,
    TRIM(
      COALESCE(NEW.raw_user_meta_data->>'first_name', '') || ' ' ||
      COALESCE(NEW.raw_user_meta_data->>'last_name', '')
    ),
    'owner'
  );

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ── Updated-at trigger for profiles ─────────────────────────
DROP TRIGGER IF EXISTS set_profiles_updated_at ON public.profiles;
CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();
