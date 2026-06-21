-- ============================================================
--  PORTALFLOW — SUPABASE DASHBOARD SQL (run once, in order)
--  Paste this entire file into:
--  Supabase Dashboard → SQL Editor → New Query → Run
-- ============================================================
--  Why this is needed:
--  Supabase MCP (the migration tool) cannot create functions
--  in the `auth` schema — those require superuser access only
--  available inside the Dashboard SQL Editor.
--  Migrations 003 and 008 define these helpers; this file
--  consolidates the correct final versions.
-- ============================================================


-- ── STEP 1: RLS helper — org_id() ────────────────────────────
-- Returns the organization_id for the currently authenticated user.
-- Reads from public.profiles (populated by the signup trigger).
-- Used in every RLS policy that gates data to an org.

CREATE OR REPLACE FUNCTION auth.org_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT organization_id
  FROM   public.profiles
  WHERE  id = auth.uid()
$$;


-- ── STEP 2: RLS helper — user_role() ─────────────────────────
-- Returns the role ('owner','admin','manager','staff') for the
-- currently authenticated user. Used in write policies.

CREATE OR REPLACE FUNCTION auth.user_role()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT role
  FROM   public.profiles
  WHERE  id = auth.uid()
$$;


-- ── STEP 3: RLS helper — portal_client_id() ──────────────────
-- Returns the portal client UUID set by the Next.js middleware
-- via a Postgres session variable (SET LOCAL app.portal_client_id).
-- Returns NULL for regular agency users.

CREATE OR REPLACE FUNCTION auth.portal_client_id()
RETURNS uuid
LANGUAGE sql
STABLE
AS $$
  SELECT NULLIF(current_setting('app.portal_client_id', true), '')::uuid
$$;


-- ── STEP 4: Role helper — has_role_at_least() ────────────────
-- Returns true if the current user's role is >= the given role.
-- Role rank: owner(4) > admin(3) > manager(2) > staff(1).

CREATE OR REPLACE FUNCTION auth.has_role_at_least(required_role text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT COALESCE(
    public.role_rank((SELECT role FROM public.profiles WHERE id = auth.uid()))
    >= public.role_rank(required_role),
    false
  )
$$;


-- ── STEP 5: role_rank() helper (public schema) ────────────────
-- Numeric rank so role comparison is a simple integer compare.

CREATE OR REPLACE FUNCTION public.role_rank(role text)
RETURNS integer
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE role
    WHEN 'owner'   THEN 4
    WHEN 'admin'   THEN 3
    WHEN 'manager' THEN 2
    WHEN 'staff'   THEN 1
    ELSE 0
  END
$$;


-- ── STEP 6: Grant execute permissions ────────────────────────
-- Without these, authenticated users cannot call the helpers
-- even though they are SECURITY DEFINER.

GRANT EXECUTE ON FUNCTION auth.org_id()                    TO authenticated;
GRANT EXECUTE ON FUNCTION auth.user_role()                 TO authenticated;
GRANT EXECUTE ON FUNCTION auth.portal_client_id()          TO authenticated;
GRANT EXECUTE ON FUNCTION auth.has_role_at_least(text)     TO authenticated;
GRANT EXECUTE ON FUNCTION public.role_rank(text)           TO authenticated;
GRANT EXECUTE ON FUNCTION public.log_activity              TO authenticated;

-- Also ensure table grants are in place (idempotent)
GRANT SELECT, UPDATE ON public.profiles       TO authenticated;
GRANT SELECT, UPDATE ON public.organizations  TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.invoices TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.clients  TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.projects TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.documents TO authenticated;
GRANT SELECT ON public.notifications TO authenticated;
GRANT UPDATE ON public.notifications TO authenticated;


-- ── STEP 7: Fix RLS infinite recursion on profiles ───────────
-- The migration policy "profiles_select_org" queries public.profiles
-- from INSIDE a profiles RLS policy, causing infinite recursion.
-- Replace it with auth.org_id() which is SECURITY DEFINER and
-- bypasses RLS when it reads profiles.

DROP POLICY IF EXISTS "profiles_select_org" ON public.profiles;

CREATE POLICY "profiles_select_org"
  ON public.profiles FOR SELECT
  USING (
    organization_id IS NOT NULL
    AND organization_id = auth.org_id()
  );


-- ── STEP 9: Verify — quick sanity check ──────────────────────
-- Run these SELECTs after applying the above.
-- Expected: 3 rows in auth schema (org_id, user_role, portal_client_id,
-- has_role_at_least) and 2 in public (role_rank, log_activity or similar).

SELECT routine_schema, routine_name
FROM   information_schema.routines
WHERE  routine_name IN ('org_id', 'user_role', 'portal_client_id',
                        'has_role_at_least', 'role_rank')
ORDER  BY routine_schema, routine_name;

-- Also verify the fix: this should return no recursion error
-- (run as an authenticated user after signing in)
-- SELECT auth.org_id();

-- ============================================================
--  END OF FILE
--  After running this, proceed to the app and test:
--  1. Sign up → dashboard loads → no 403 errors
--  2. Create a client → appears in list
--  3. Create an invoice → appears in invoice list
--  4. Revenue chart shows real bars for months with invoices
-- ============================================================
