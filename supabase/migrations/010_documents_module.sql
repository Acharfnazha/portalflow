-- ============================================================
--  PortalFlow — Documents Module
--  Migration: 010_documents_module.sql
--
--  1. RLS policies for the documents table
--  2. Supabase Storage bucket creation
--  3. Storage object RLS policies
--  4. Grants
-- ============================================================


-- ── 1. RLS: documents table ──────────────────────────────────

-- Agency members can read their org's active documents
CREATE POLICY "documents_select_org"
  ON public.documents FOR SELECT
  USING (
    organization_id = auth.org_id()
    AND deleted_at IS NULL
  );

-- Any authenticated org member can upload (insert) documents
CREATE POLICY "documents_insert_org"
  ON public.documents FOR INSERT
  WITH CHECK (organization_id = auth.org_id());

-- Manager+ can update document metadata (rename, tags, visibility)
CREATE POLICY "documents_update_manager"
  ON public.documents FOR UPDATE
  USING (
    organization_id = auth.org_id()
    AND deleted_at IS NULL
    AND auth.has_role_at_least('manager')
  );

-- Portal clients can read documents explicitly shared with them
-- (requires auth.portal_client_id() defined in a later portal migration)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_proc
    WHERE proname = 'portal_client_id'
    AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'auth')
  ) THEN
    EXECUTE $p$
      CREATE POLICY "documents_select_portal"
        ON public.documents FOR SELECT
        USING (
          client_id = auth.portal_client_id()
          AND visible_to_client = true
          AND deleted_at IS NULL
        )
    $p$;
  END IF;
END $$;


-- ── 2. Storage bucket ─────────────────────────────────────────

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'documents',
  'documents',
  false,       -- private; all access via signed URLs
  26214400,    -- 25 MB per file
  ARRAY[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/zip',
    'text/plain',
    'text/csv'
  ]
) ON CONFLICT (id) DO NOTHING;


-- ── 3. Storage object RLS ─────────────────────────────────────
-- Storage paths follow: {orgId}/{docId}/{fileName}
-- The first path segment is always the org ID for easy scoping.

-- Upload: authenticated org members can write to their org folder
CREATE POLICY "storage_documents_insert"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'documents'
    AND auth.uid() IS NOT NULL
    AND (string_to_array(name, '/'))[1] = (auth.org_id())::text
  );

-- Download: authenticated org members can read their org's files
CREATE POLICY "storage_documents_select"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'documents'
    AND auth.uid() IS NOT NULL
    AND (string_to_array(name, '/'))[1] = (auth.org_id())::text
  );

-- Delete: authenticated org members can delete their org's files
CREATE POLICY "storage_documents_delete"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'documents'
    AND auth.uid() IS NOT NULL
    AND (string_to_array(name, '/'))[1] = (auth.org_id())::text
  );


-- ── 4. Grants ─────────────────────────────────────────────────
GRANT SELECT, INSERT, UPDATE ON public.documents TO authenticated;
