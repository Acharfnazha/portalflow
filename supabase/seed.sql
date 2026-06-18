-- ============================================================
--  PortalFlow — Development Seed Data
--  File: supabase/seed.sql
--
--  Run AFTER all migrations. Dev / staging only.
--  Production: use signup flow + Stripe test mode.
-- ============================================================

-- ── Disable RLS for seeding (re-enabled automatically) -----
SET session_replication_role = replica;

-- ── Seed organization -----------------------------------------
INSERT INTO public.organizations (id, name, slug, plan, subscription_status)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Antigravity Studio',
  'antigravity-studio',
  'agency',
  'active'
);

-- ── Seed subscription ----------------------------------------
INSERT INTO public.subscriptions (
  organization_id, plan, status, billing_interval,
  current_period_start, current_period_end
)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'agency', 'active', 'month',
  date_trunc('month', now()),
  date_trunc('month', now()) + interval '1 month'
);

-- ── Seed team members (auth.users created separately in Supabase dashboard)
-- These UUIDs must match the UUIDs in auth.users if testing locally
INSERT INTO public.users (id, organization_id, full_name, email, role, title)
VALUES
  ('00000000-0000-0000-0001-000000000001',
   '00000000-0000-0000-0000-000000000001',
   'Alex Rivera', 'alex@antigravity.studio', 'owner', 'Founder & CEO'),

  ('00000000-0000-0000-0001-000000000002',
   '00000000-0000-0000-0000-000000000001',
   'Sam Chen', 'sam@antigravity.studio', 'manager', 'Project Manager'),

  ('00000000-0000-0000-0001-000000000003',
   '00000000-0000-0000-0000-000000000001',
   'Jordan Kim', 'jordan@antigravity.studio', 'member', 'Lead Designer');

-- ── Seed clients -----------------------------------------------
INSERT INTO public.clients (id, organization_id, owner_id, name, email, website, domain, status, industry, company_size, location, mrr_cents, health_score, portal_enabled, tags)
VALUES
  ('00000000-0000-0000-0002-000000000001',
   '00000000-0000-0000-0000-000000000001',
   '00000000-0000-0000-0001-000000000001',
   'Nexus Digital', 'hello@nexusdigital.io', 'nexusdigital.io', 'nexusdigital.io',
   'active', 'Technology', '51-200', 'San Francisco, CA',
   450000, 92, true, ARRAY['saas', 'tech', 'priority']),

  ('00000000-0000-0000-0002-000000000002',
   '00000000-0000-0000-0000-000000000001',
   '00000000-0000-0000-0001-000000000002',
   'Bloom Health', 'team@bloomhealth.co', 'bloomhealth.co', 'bloomhealth.co',
   'active', 'Healthcare', '11-50', 'Austin, TX',
   280000, 78, true, ARRAY['health', 'b2b']),

  ('00000000-0000-0000-0002-000000000003',
   '00000000-0000-0000-0000-000000000001',
   '00000000-0000-0000-0001-000000000001',
   'Crestwood Finance', 'ops@crestwood.com', 'crestwood.com', 'crestwood.com',
   'at_risk', 'Finance', '201-500', 'New York, NY',
   180000, 41, false, ARRAY['finance', 'enterprise']),

  ('00000000-0000-0000-0002-000000000004',
   '00000000-0000-0000-0000-000000000001',
   '00000000-0000-0000-0001-000000000002',
   'Pixel & Pine', 'studio@pixelpine.co', 'pixelpine.co', 'pixelpine.co',
   'trial', 'Design', '1-10', 'Portland, OR',
   0, 65, false, ARRAY['design', 'startup']),

  ('00000000-0000-0000-0002-000000000005',
   '00000000-0000-0000-0000-000000000001',
   '00000000-0000-0000-0001-000000000001',
   'Arcadia Retail', 'tech@arcadiaretail.com', 'arcadiaretail.com', 'arcadiaretail.com',
   'active', 'Retail', '201-500', 'Chicago, IL',
   320000, 83, true, ARRAY['retail', 'ecommerce']);

-- ── Seed projects ----------------------------------------------
INSERT INTO public.projects (id, organization_id, client_id, created_by, name, description, status, priority, progress, start_date, deadline, budget_cents, spent_cents, visible_to_client, tags)
VALUES
  ('00000000-0000-0000-0003-000000000001',
   '00000000-0000-0000-0000-000000000001',
   '00000000-0000-0000-0002-000000000001',
   '00000000-0000-0000-0001-000000000001',
   'Brand Refresh & Design System', 'Full visual identity overhaul with Figma component library.',
   'active', 'high', 68,
   '2024-11-01', '2025-02-28', 2400000, 1632000, true, ARRAY['branding', 'design']),

  ('00000000-0000-0000-0003-000000000002',
   '00000000-0000-0000-0000-000000000001',
   '00000000-0000-0000-0002-000000000002',
   '00000000-0000-0000-0001-000000000002',
   'Patient Portal Redesign', 'HIPAA-compliant web portal for patient scheduling and records.',
   'in_review', 'high', 91,
   '2024-09-15', '2025-01-31', 3200000, 2912000, true, ARRAY['web', 'healthcare']),

  ('00000000-0000-0000-0003-000000000003',
   '00000000-0000-0000-0000-000000000001',
   '00000000-0000-0000-0002-000000000005',
   '00000000-0000-0000-0001-000000000003',
   'E-commerce Platform Migration', 'Shopify → custom Next.js storefront.',
   'active', 'medium', 44,
   '2024-12-01', '2025-03-31', 5600000, 2464000, true, ARRAY['web', 'ecommerce']),

  ('00000000-0000-0000-0003-000000000004',
   '00000000-0000-0000-0000-000000000001',
   '00000000-0000-0000-0002-000000000003',
   '00000000-0000-0000-0001-000000000001',
   'Compliance Dashboard', 'Internal regulatory reporting tool.',
   'on_hold', 'low', 22,
   '2025-01-10', '2025-05-30', 1800000, 396000, false, ARRAY['dashboard', 'compliance']);

-- ── Seed project members ---------------------------------------
INSERT INTO public.project_members (project_id, user_id, role)
VALUES
  ('00000000-0000-0000-0003-000000000001', '00000000-0000-0000-0001-000000000003', 'lead'),
  ('00000000-0000-0000-0003-000000000001', '00000000-0000-0000-0001-000000000002', 'contributor'),
  ('00000000-0000-0000-0003-000000000002', '00000000-0000-0000-0001-000000000002', 'lead'),
  ('00000000-0000-0000-0003-000000000002', '00000000-0000-0000-0001-000000000003', 'contributor'),
  ('00000000-0000-0000-0003-000000000003', '00000000-0000-0000-0001-000000000001', 'lead'),
  ('00000000-0000-0000-0003-000000000003', '00000000-0000-0000-0001-000000000003', 'contributor');

-- ── Seed invoices ----------------------------------------------
INSERT INTO public.invoices (
  id, organization_id, client_id, project_id, created_by,
  invoice_number, status, subtotal_cents, tax_rate, tax_cents, total_cents, amount_paid_cents,
  currency, issued_at, due_at, paid_at, notes
)
VALUES
  ('00000000-0000-0000-0004-000000000001',
   '00000000-0000-0000-0000-000000000001',
   '00000000-0000-0000-0002-000000000001',
   '00000000-0000-0000-0003-000000000001',
   '00000000-0000-0000-0001-000000000001',
   'INV-0001', 'paid', 480000, 0, 0, 480000, 480000,
   'USD', '2024-11-15', '2024-12-15',
   '2024-12-10', 'Phase 1 — Discovery & strategy'),

  ('00000000-0000-0000-0004-000000000002',
   '00000000-0000-0000-0000-000000000001',
   '00000000-0000-0000-0002-000000000001',
   '00000000-0000-0000-0003-000000000001',
   '00000000-0000-0000-0001-000000000001',
   'INV-0002', 'paid', 640000, 0, 0, 640000, 640000,
   'USD', '2024-12-15', '2025-01-15',
   '2025-01-12', 'Phase 2 — Visual design'),

  ('00000000-0000-0000-0004-000000000003',
   '00000000-0000-0000-0000-000000000001',
   '00000000-0000-0000-0002-000000000001',
   '00000000-0000-0000-0003-000000000001',
   '00000000-0000-0000-0001-000000000001',
   'INV-0003', 'pending', 512000, 0, 0, 512000, 0,
   'USD', '2025-01-15', '2025-02-15',
   NULL, 'Phase 3 — Component library'),

  ('00000000-0000-0000-0004-000000000004',
   '00000000-0000-0000-0000-000000000001',
   '00000000-0000-0000-0002-000000000002',
   '00000000-0000-0000-0003-000000000002',
   '00000000-0000-0000-0001-000000000002',
   'INV-0004', 'paid', 960000, 0.1, 96000, 1056000, 1056000,
   'USD', '2024-10-01', '2024-11-01',
   '2024-10-28', 'Patient portal — Phase 1'),

  ('00000000-0000-0000-0004-000000000005',
   '00000000-0000-0000-0000-000000000001',
   '00000000-0000-0000-0002-000000000002',
   '00000000-0000-0000-0003-000000000002',
   '00000000-0000-0000-0001-000000000002',
   'INV-0005', 'overdue', 768000, 0.1, 76800, 844800, 0,
   'USD', '2024-12-01', '2025-01-01',
   NULL, 'Patient portal — Phase 2 (OVERDUE)'),

  ('00000000-0000-0000-0004-000000000006',
   '00000000-0000-0000-0000-000000000001',
   '00000000-0000-0000-0002-000000000005',
   '00000000-0000-0000-0003-000000000003',
   '00000000-0000-0000-0001-000000000001',
   'INV-0006', 'paid', 1120000, 0, 0, 1120000, 1120000,
   'USD', '2024-12-10', '2025-01-10',
   '2025-01-08', 'E-commerce migration — milestone 1'),

  ('00000000-0000-0000-0004-000000000007',
   '00000000-0000-0000-0000-000000000001',
   '00000000-0000-0000-0002-000000000003',
   '00000000-0000-0000-0003-000000000004',
   '00000000-0000-0000-0001-000000000001',
   'INV-0007', 'draft', 396000, 0, 0, 396000, 0,
   'USD', NULL, NULL,
   NULL, 'Compliance dashboard — initial setup (DRAFT)');

-- ── Seed line items ----------------------------------------
INSERT INTO public.invoice_line_items (invoice_id, description, quantity, unit_price_cents, sort_order)
VALUES
  ('00000000-0000-0000-0004-000000000003', 'Senior Designer — 80 hrs', 80, 5000, 1),
  ('00000000-0000-0000-0004-000000000003', 'Project Management', 1, 32000, 2),
  ('00000000-0000-0000-0004-000000000007', 'Technical Discovery', 1, 240000, 1),
  ('00000000-0000-0000-0004-000000000007', 'Wireframes & Prototype', 1, 156000, 2);

-- ── Seed payments ---------------------------------------------
INSERT INTO public.payments (organization_id, invoice_id, client_id, amount_cents, currency, status, method, paid_at)
VALUES
  ('00000000-0000-0000-0000-000000000001',
   '00000000-0000-0000-0004-000000000001',
   '00000000-0000-0000-0002-000000000001',
   480000, 'USD', 'succeeded', 'stripe', '2024-12-10'),

  ('00000000-0000-0000-0000-000000000001',
   '00000000-0000-0000-0004-000000000002',
   '00000000-0000-0000-0002-000000000001',
   640000, 'USD', 'succeeded', 'stripe', '2025-01-12'),

  ('00000000-0000-0000-0000-000000000001',
   '00000000-0000-0000-0004-000000000004',
   '00000000-0000-0000-0002-000000000002',
   1056000, 'USD', 'succeeded', 'bank_transfer', '2024-10-28'),

  ('00000000-0000-0000-0000-000000000001',
   '00000000-0000-0000-0004-000000000006',
   '00000000-0000-0000-0002-000000000005',
   1120000, 'USD', 'succeeded', 'stripe', '2025-01-08');

-- ── Seed activity log -----------------------------------------
INSERT INTO public.activity_logs (organization_id, actor_id, entity_type, entity_id, action, description)
VALUES
  ('00000000-0000-0000-0000-000000000001',
   '00000000-0000-0000-0001-000000000001',
   'client', '00000000-0000-0000-0002-000000000001',
   'created', 'Created client Nexus Digital'),

  ('00000000-0000-0000-0000-000000000001',
   '00000000-0000-0000-0001-000000000001',
   'invoice', '00000000-0000-0000-0004-000000000001',
   'paid', 'Invoice INV-0001 marked as paid — $4,800'),

  ('00000000-0000-0000-0000-000000000001',
   '00000000-0000-0000-0001-000000000002',
   'project', '00000000-0000-0000-0003-000000000002',
   'status_changed', 'Patient Portal moved to In Review'),

  ('00000000-0000-0000-0000-000000000001',
   NULL,
   'invoice', '00000000-0000-0000-0004-000000000005',
   'status_changed', 'Invoice INV-0005 automatically flagged as overdue');

-- ── Re-enable RLS ----------------------------------------------
SET session_replication_role = DEFAULT;
