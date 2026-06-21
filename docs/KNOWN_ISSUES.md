# PortalFlow — Known Issues

> Last updated: 2026-06-20 · Sprint 12
>
> Issues are classified P0 (blocks use) → P2 (polish). Fixed issues are marked ✅.

---

## P0 — Blocks Real Customer Use

### KI-001 · Invoice creation saves nothing to the database

**Status:** Open  
**Affected route:** `/dashboard/invoices` → "New invoice" button  
**Symptom:** User fills the form, clicks "Create invoice", sees "Invoice created" success toast, modal closes — but no invoice is written to the database. The invoice list is unchanged after the modal closes.  
**Root cause:** `new-invoice-modal.tsx` uses `setTimeout(() => success(...), 600)` with no server action call. The submit handler is entirely mock.  
**Secondary symptom:** The Client and Project dropdowns in the modal show fictional companies (`Apex Innovations`, `Nexus Digital`, etc.) instead of the user's real clients and projects.  
**Workaround:** None. Invoices cannot be created.  
**Fix needed:** Replace mock submit with `createInvoiceAction()` server action; replace `MOCK_CLIENTS`/`MOCK_PROJECTS` with real Supabase queries.

---

### KI-002 · Client Invoices tab always shows empty

**Status:** Open  
**Affected route:** `/dashboard/clients/[id]` → Invoices tab  
**Symptom:** The Invoices tab on any client profile always shows "No invoices yet for this client." regardless of what is in the database.  
**Root cause:** `tab-invoices.tsx` declares `const INVOICES = []` — a hardcoded empty array that is never replaced with a database query.  
**Workaround:** View all invoices at `/dashboard/invoices` and filter by client name manually.  
**Fix needed:** Replace the hardcoded array with a Supabase query filtered by `clientId`.

---

### KI-003 · Client notes are not persisted

**Status:** Open  
**Affected route:** `/dashboard/clients/[id]` → Notes tab  
**Symptom:** User types a note and clicks "Save note". The note appears in the list immediately. On page refresh, all notes are gone.  
**Root cause:** `tab-notes.tsx` stores notes in `useState` only. No server action, no database write.  
**Workaround:** Use the client's "Notes" field in the Edit Client modal — this field is persisted to `clients.notes` (plain text only, not a list).  
**Fix needed:** Create a `client_notes` table (or reuse `activity_logs`) and wire a server action in `tab-notes.tsx`.

---

## P1 — Embarrassing in a Demo

### KI-004 · Bulk client actions do nothing

**Status:** Open  
**Affected route:** `/dashboard/clients` (select clients → bulk bar)  
**Symptom:** Selecting one or more clients shows the bulk action bar with Tag, Email, Reassign, Delete buttons. Clicking any button does nothing — no handler, no action, no feedback.  
**Root cause:** `bulk-bar.tsx` renders buttons with no `onClick` handlers.  
**Workaround:** Operate on clients one at a time.  
**Fix needed:** Wire server actions for each bulk operation.

---

### KI-005 · Session-expiry redirects to non-existent `/auth/login`

**Status:** Fixed ✅ (Sprint 12)  
**Affected routes:** `/dashboard/projects/new`, `/dashboard/projects/[id]`, `/dashboard/projects/[id]/edit`, `/dashboard/documents/[id]`  
**Symptom:** If a user's session expires while on these pages, they are redirected to `/auth/login` which does not exist (404) instead of `/login`.  
**Fix applied:** All four pages updated to `redirect("/login")` and `redirect("/dashboard")`.

---

### KI-006 · "Visible to client" defaults to OFF on document upload

**Status:** Open  
**Affected route:** `/dashboard/documents` → Upload modal  
**Symptom:** Every document uploaded is invisible in the client portal by default. Users who share a portal link before toggling visibility will have clients see an empty Documents tab.  
**Workaround:** Manually check "Visible to client in portal" on every upload.  
**Fix needed:** Change the `visible` default in `upload-modal.tsx` based on whether a client is pre-selected.

---

### KI-007 · Invoice revenue chart uses mock data

**Status:** Open  
**Affected route:** `/dashboard/invoices` (chart above the table)  
**Symptom:** The revenue chart shows generated fake data regardless of actual invoice history. The totals shown do not match the real invoice data in the table below.  
**Root cause:** `revenue-chart.tsx` imports `getMonthlyRevenue()` from `@/lib/invoices-data` — a mock data generator.  
**Workaround:** Ignore the chart; use the summary cards below it (which show real Supabase data).  
**Fix needed:** Replace with a real Supabase aggregation query grouped by month.

---

### KI-008 · No organization logo on the client portal

**Status:** Open  
**Affected route:** `/portal/[token]/*`  
**Symptom:** The portal nav shows the organization's name as plain text. No logo appears even though the `<PortalNav>` component accepts `agencyLogoUrl` and renders it if present.  
**Root cause:** The org settings form has no logo upload input. `organizations.logo_url` is always null.  
**Workaround:** None visible to clients.  
**Fix needed:** Add a logo upload field to `/dashboard/settings` that stores to Supabase Storage.

---

## P2 — Polish / UX

### KI-009 · Invoice modal warning misleads the user

**Status:** Open  
**Affected route:** `/dashboard/invoices` → New invoice modal  
**Symptom:** The modal shows a blue notice: "Stripe billing is not connected yet. This invoice will be saved as a draft." This implies saving works. It does not (see KI-001).  
**Fix needed:** Remove the notice entirely until KI-001 is fixed. Replace the Create button with a disabled state labelled "Invoice creation coming soon."

---

### KI-010 · Portal URL looks like a phishing link

**Status:** Open  
**Affected route:** `/portal/[token]`  
**Symptom:** Portal URLs are `/portal/AbCdEfGhIjKlMnOpQrStUvWxYz` — raw base64 tokens that look untrustworthy to clients.  
**Fix needed:** Add a vanity slug layer (e.g. `/portal/baj-united/AbCd`) or display a "Your secure portal" explainer on first visit.

---

### KI-011 · No document display name — raw filename shown in portal

**Status:** Open  
**Affected route:** Portal Documents tab  
**Symptom:** Files uploaded as `OffspringGroup_ProductCatalog_v3_FINAL_corrected.pdf` appear verbatim in the client portal.  
**Fix needed:** Add a "Display name" input to the upload modal.

---

### KI-012 · Industry dropdown has no relevant options for non-agency verticals

**Status:** Open  
**Affected route:** `/dashboard/clients` → New/Edit client modal  
**Symptom:** Industry options are agency/tech-centric (Technology, Marketing, E-commerce, etc.). No food, export, logistics, manufacturing, or retail options.  
**Fix needed:** Expand the `INDUSTRIES` array in `client-modal.tsx`.

---

### KI-013 · `NEXT_PUBLIC_APP_URL` in constants.ts is not documented

**Status:** Open  
**Affected file:** `src/lib/constants.ts:6`  
**Symptom:** `APP_URL` reads from `NEXT_PUBLIC_APP_URL` which is not in `.env.local.example`. All auth/portal URL construction uses `NEXT_PUBLIC_SITE_URL`. `APP_URL` from constants is currently unused in critical paths, but could cause confusion.  
**Fix needed:** Change `NEXT_PUBLIC_APP_URL` → `NEXT_PUBLIC_SITE_URL` in constants.ts, or remove `APP_URL` if unused.
