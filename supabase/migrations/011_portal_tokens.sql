-- ============================================================
--  PortalFlow — Portal Token Column
--  Migration: 011_portal_tokens.sql
--
--  Adds portal_token to clients table for secure, token-based
--  client portal access without requiring client authentication.
-- ============================================================

-- Add portal_token column
ALTER TABLE public.clients
  ADD COLUMN IF NOT EXISTS portal_token text UNIQUE;

-- Generate tokens for all existing clients that don't have one
UPDATE public.clients
SET portal_token = encode(gen_random_bytes(24), 'base64url')
WHERE portal_token IS NULL;

-- Make the column NOT NULL after backfill
ALTER TABLE public.clients
  ALTER COLUMN portal_token SET NOT NULL;

-- Add default so new clients get a token automatically
ALTER TABLE public.clients
  ALTER COLUMN portal_token SET DEFAULT encode(gen_random_bytes(24), 'base64url');

-- Fast lookup by token (portal routes use this on every request)
CREATE UNIQUE INDEX IF NOT EXISTS clients_portal_token_idx
  ON public.clients (portal_token)
  WHERE deleted_at IS NULL;

COMMENT ON COLUMN public.clients.portal_token IS
  'Secure URL-safe base64 token for client portal access. Regenerate to revoke access.';
