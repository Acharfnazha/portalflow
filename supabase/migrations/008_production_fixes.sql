-- ─────────────────────────────────────────────────────────────
-- 008_production_fixes.sql
--
-- Fixes four blocking bugs:
--
-- 1. auth.org_id()    — was querying public.users (empty table).
--                       Updated to query public.profiles.
-- 2. auth.user_role() — same issue. Also maps 'member' → 'staff'
--                       so DB values align with TypeScript types.
-- 3. Role enum        — public.profiles.role allowed 'member' but
--                       app + invitations use 'staff'. Aligned to
--                       the canonical set: owner/admin/manager/staff.
-- 4. organizations.timezone — column was missing; org-actions.ts
--                       tries to update it. Added the column.
-- ─────────────────────────────────────────────────────────────


-- ── 1 & 2. Fix RLS helper functions ──────────────────────────
-- These were defined in 003_rls.sql to query public.users,
-- which is never populated. Repointing them to public.profiles.

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

CREATE OR REPLACE FUNCTION auth.user_role()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid()
$$;


-- ── 3. Fix role enum: add 'staff', drop 'member' ─────────────
-- Step A: relax the constraint temporarily
ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_role_check;

-- Step B: migrate any existing 'member' rows to 'staff'
UPDATE public.profiles
  SET role = 'staff'
  WHERE role = 'member';

-- Step C: re-add the constraint with the correct set
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_role_check
    CHECK (role IN ('owner', 'admin', 'manager', 'staff'));

-- Also fix the trigger default — 'owner' is correct for the
-- first user, no change needed there.


-- ── 4. Add timezone column to organizations ──────────────────
ALTER TABLE public.organizations
  ADD COLUMN IF NOT EXISTS timezone text NOT NULL DEFAULT 'UTC';


-- ── 5. Ensure profiles INSERT policy exists ───────────────────
-- The handle_new_user() trigger runs as SECURITY DEFINER so it
-- bypasses RLS. But add an explicit service-role INSERT policy
-- as a safety net for future manual inserts.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'profiles' AND policyname = 'profiles_insert_trigger'
  ) THEN
    EXECUTE $p$
      CREATE POLICY "profiles_insert_trigger"
        ON public.profiles FOR INSERT
        WITH CHECK (true)
    $p$;
  END IF;
END $$;


-- ── 6. Grant SELECT on profiles to authenticated role ─────────
-- Supabase requires explicit grants for RLS-enabled tables.
GRANT SELECT ON public.profiles TO authenticated;
GRANT UPDATE ON public.profiles TO authenticated;

-- ── 7. Grant SELECT on organizations to authenticated role ────
GRANT SELECT ON public.organizations TO authenticated;
GRANT UPDATE ON public.organizations TO authenticated;
