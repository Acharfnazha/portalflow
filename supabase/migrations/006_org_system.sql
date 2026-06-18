-- ─────────────────────────────────────────────────────────────
-- 006_org_system.sql
-- Org member invitations, role enforcement, RLS refinement
-- ─────────────────────────────────────────────────────────────

-- ── Invitations ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.invitations (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  email           citext NOT NULL,
  role            text NOT NULL DEFAULT 'staff'
                    CHECK (role IN ('admin', 'manager', 'staff')),
  token           text UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
  invited_by      uuid NOT NULL REFERENCES auth.users(id),
  accepted_at     timestamptz,
  expires_at      timestamptz NOT NULL DEFAULT (now() + interval '7 days'),
  created_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organization_id, email)        -- one pending invite per email per org
);

ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;

-- Org admins can manage invitations in their org
CREATE POLICY "invitations_select_org_admins"
  ON public.invitations FOR SELECT
  USING (
    organization_id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid())
    AND (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('owner', 'admin')
  );

CREATE POLICY "invitations_insert_org_admins"
  ON public.invitations FOR INSERT
  WITH CHECK (
    organization_id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid())
    AND (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('owner', 'admin')
  );

CREATE POLICY "invitations_delete_org_admins"
  ON public.invitations FOR DELETE
  USING (
    organization_id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid())
    AND (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('owner', 'admin')
  );

-- Anyone can read an invitation by its token (for the accept flow)
CREATE POLICY "invitations_select_by_token"
  ON public.invitations FOR SELECT
  USING (
    accepted_at IS NULL
    AND expires_at > now()
  );

-- ── Role rank helper ─────────────────────────────────────────
-- Returns the numeric rank for a role string
CREATE OR REPLACE FUNCTION public.role_rank(p_role text)
RETURNS int
LANGUAGE sql IMMUTABLE STRICT PARALLEL SAFE AS $$
  SELECT CASE p_role
    WHEN 'owner'   THEN 4
    WHEN 'admin'   THEN 3
    WHEN 'manager' THEN 2
    WHEN 'staff'   THEN 1
    ELSE 0
  END;
$$;

-- Returns true if the current user's role is ≥ the given minimum
CREATE OR REPLACE FUNCTION auth.has_role_at_least(min_role text)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT COALESCE(
    (SELECT public.role_rank(role) >= public.role_rank(min_role)
     FROM public.profiles
     WHERE id = auth.uid()),
    false
  );
$$;

-- ── RLS refinements on organizations ─────────────────────────
-- (Drop and recreate to add role-based update/delete)
DROP POLICY IF EXISTS "organizations_owner_all" ON public.organizations;

-- Select: any org member
CREATE POLICY IF NOT EXISTS "orgs_select_members"
  ON public.organizations FOR SELECT
  USING (
    id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid())
  );

-- Update: owner only
CREATE POLICY IF NOT EXISTS "orgs_update_owner"
  ON public.organizations FOR UPDATE
  USING (
    id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid())
    AND auth.has_role_at_least('owner')
  );

-- Delete: owner only (soft-delete via app layer, this is a safety net)
CREATE POLICY IF NOT EXISTS "orgs_delete_owner"
  ON public.organizations FOR DELETE
  USING (
    id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid())
    AND auth.has_role_at_least('owner')
  );

-- ── RLS on profiles: allow admins to view/update org members ─
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;

-- Update own profile (anyone)
CREATE POLICY IF NOT EXISTS "profiles_update_own"
  ON public.profiles FOR UPDATE
  USING (id = auth.uid());

-- Admins+ can update role of other members in their org (not owners)
CREATE POLICY IF NOT EXISTS "profiles_admin_update_role"
  ON public.profiles FOR UPDATE
  USING (
    id != auth.uid()
    AND organization_id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid())
    AND auth.has_role_at_least('admin')
    AND role != 'owner'  -- cannot demote owners
  );

-- ── Accept invitation function ────────────────────────────────
-- Called after a user is authenticated; migrates them into the invited org
CREATE OR REPLACE FUNCTION public.accept_invitation(p_token text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  _inv   public.invitations%ROWTYPE;
  _user  uuid := auth.uid();
  _old_org_id uuid;
BEGIN
  IF _user IS NULL THEN
    RETURN jsonb_build_object('error', 'not_authenticated');
  END IF;

  -- Load and validate invitation
  SELECT * INTO _inv
  FROM public.invitations
  WHERE token = p_token
    AND accepted_at IS NULL
    AND expires_at > now()
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'invalid_or_expired_token');
  END IF;

  -- Get user's current (auto-created) org so we can clean it up
  SELECT organization_id INTO _old_org_id
  FROM public.profiles WHERE id = _user;

  -- Move user to the invited org with the invited role
  UPDATE public.profiles
  SET organization_id = _inv.organization_id,
      role = _inv.role
  WHERE id = _user;

  -- Mark invitation accepted
  UPDATE public.invitations
  SET accepted_at = now()
  WHERE id = _inv.id;

  -- Delete the auto-created empty org if no one else is in it
  IF _old_org_id IS NOT NULL AND _old_org_id != _inv.organization_id THEN
    DELETE FROM public.organizations o
    WHERE o.id = _old_org_id
      AND NOT EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.organization_id = o.id AND p.id != _user
      );
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'organization_id', _inv.organization_id,
    'role', _inv.role
  );
END;
$$;

-- ── Updated-at trigger for invitations ───────────────────────
DROP TRIGGER IF EXISTS set_invitations_updated_at ON public.invitations;
-- (invitations table has no updated_at; skip)

-- ── Indexes ───────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_invitations_org      ON public.invitations (organization_id);
CREATE INDEX IF NOT EXISTS idx_invitations_email    ON public.invitations (email);
CREATE INDEX IF NOT EXISTS idx_invitations_token    ON public.invitations (token) WHERE accepted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_invitations_expires  ON public.invitations (expires_at) WHERE accepted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_org_role    ON public.profiles (organization_id, role);
