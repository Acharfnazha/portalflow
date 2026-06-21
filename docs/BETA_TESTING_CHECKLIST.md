# PortalFlow — Beta Testing Checklist

> Version: Beta 0.1 · Sprint 12  
> Use this checklist for each beta tester session. Mark ✅ pass, ❌ fail, ⚠️ partial, or ➖ skipped.
>
> **Before testing:** Seed the account with at least 1 client, 1 project, and 1 document so you can test non-empty states.

---

## Section 1 — Authentication

| # | Test | Expected | Result | Notes |
|---|---|---|---|---|
| 1.1 | Navigate to the root URL `/` | Landing page loads, no errors | | |
| 1.2 | Click "Start free trial" | Redirected to `/signup` | | |
| 1.3 | Sign up with a new email | Confirmation email received within 60s | | |
| 1.4 | Click confirmation link in email | Redirected to `/dashboard`, KPI cards visible | | |
| 1.5 | Sign out | Redirected to `/login` | | |
| 1.6 | Sign in with correct credentials | Redirected to `/dashboard` | | |
| 1.7 | Sign in with wrong password | Error message shown, no redirect | | |
| 1.8 | Click "Forgot password" | Email received, link works, password updated | | |
| 1.9 | Try to access `/dashboard` while logged out | Redirected to `/login` | | |

---

## Section 2 — Dashboard Home

| # | Test | Expected | Result | Notes |
|---|---|---|---|---|
| 2.1 | Visit `/dashboard` | KPI cards render (may be zeros) | | |
| 2.2 | All 4 KPI cards load without error | No spinner stuck, no "NaN" values | | |
| 2.3 | Recent activity feed renders | Shows entries or "No recent activity" empty state | | |
| 2.4 | Quick actions section visible | Links to Clients, Projects, Documents | | |
| 2.5 | Sidebar navigation visible and functional | All links navigate correctly | | |
| 2.6 | User name / role shown in sidebar footer | Shows your name, not "Member" fallback | | |
| 2.7 | Notification bell visible in topbar | Loads without error | | |

---

## Section 3 — Clients

| # | Test | Expected | Result | Notes |
|---|---|---|---|---|
| 3.1 | Navigate to `/dashboard/clients` | Client list renders (or empty state) | | |
| 3.2 | Click "Add client" | Modal opens with form fields | | |
| 3.3 | Submit "Add client" with only name filled | Client created, appears in list | | |
| 3.4 | Submit "Add client" with all fields filled | Client created with all data saved | | |
| 3.5 | Search for a client by name | Results filter correctly | | |
| 3.6 | Filter by status (Active) | Only Active clients shown | | |
| 3.7 | Click a client name | Navigates to client profile page | | |
| 3.8 | Client profile — Overview tab | Stats, contact info, tags visible | | |
| 3.9 | Client profile — Projects tab | Real project data shown | | |
| 3.10 | Client profile — Documents tab | Real document data shown | | |
| 3.11 | Client profile — Activity tab | Activity timeline shows | | |
| 3.12 | Click "Edit" on a client | Modal prefills with existing data | | |
| 3.13 | Save edit | Changes saved and visible immediately | | |
| 3.14 | Delete a client | Client removed from list (soft delete) | | |
| ⚠️ 3.15 | Client profile — Invoices tab | **KNOWN ISSUE KI-002:** Always shows empty | | |
| ⚠️ 3.16 | Client profile — Notes tab | **KNOWN ISSUE KI-003:** Notes lost on refresh | | |
| ⚠️ 3.17 | Bulk select + bulk actions | **KNOWN ISSUE KI-004:** Buttons do nothing | | |

---

## Section 4 — Projects

| # | Test | Expected | Result | Notes |
|---|---|---|---|---|
| 4.1 | Navigate to `/dashboard/projects` | Project list renders (or empty state) | | |
| 4.2 | Click "New project" | Navigate to `/dashboard/projects/new` | | |
| 4.3 | Create project with all fields | Saved and redirected to project detail | | |
| 4.4 | Toggle "Visible to client" ON | Toggle state saved | | |
| 4.5 | Project detail page loads | Name, status, progress, deadline visible | | |
| 4.6 | Edit a project | Modal prefills, save works | | |
| 4.7 | Project list — filter by status | Only matching projects shown | | |
| 4.8 | Project list — search by name | Results filter correctly | | |

---

## Section 5 — Documents

| # | Test | Expected | Result | Notes |
|---|---|---|---|---|
| 5.1 | Navigate to `/dashboard/documents` | Document library renders | | |
| 5.2 | Click "Upload document" | Modal opens with drop zone | | |
| 5.3 | Upload a PDF (< 25 MB) | Success toast, document appears in list | | |
| 5.4 | Upload with a client assigned | Document linked to client, visible on client profile | | |
| 5.5 | Toggle "Visible to client in portal" ON | Checkbox state saved on upload | | |
| 5.6 | Click download on a document | File downloads correctly (signed URL) | | |
| 5.7 | Click download multiple times | Each download works (URL doesn't expire mid-session) | | |
| 5.8 | Upload a file > 25 MB | Error shown, upload rejected | | |
| 5.9 | Delete a document | Removed from list; file no longer downloadable | | |
| 5.10 | Document detail page `/dashboard/documents/[id]` | Loads with metadata and download option | | |

---

## Section 6 — Invoices

| # | Test | Expected | Result | Notes |
|---|---|---|---|---|
| 6.1 | Navigate to `/dashboard/invoices` | Invoice list renders (or empty state) | | |
| 6.2 | Filter tabs (All / Pending / Paid / Overdue) | Filter changes the visible rows | | |
| 6.3 | Summary cards (Total billed, Paid, Outstanding) | Numbers match the visible data | | |
| ❌ 6.4 | Click "New invoice" | **KNOWN ISSUE KI-001:** Nothing saved to DB | | |
| ❌ 6.5 | Invoice appears in list after creation | **KNOWN ISSUE KI-001:** Will not appear | | |
| ⚠️ 6.6 | Revenue chart matches table data | **KNOWN ISSUE KI-007:** Chart uses mock data | | |

---

## Section 7 — Client Portal

| # | Test | Expected | Result | Notes |
|---|---|---|---|---|
| 7.1 | Go to any client profile → Portal card | Card visible in right sidebar | | |
| 7.2 | Toggle portal enabled → ON | Dot turns green, "Active" shown | | |
| 7.3 | Click "Generate portal link" | Token generated, URL shown | | |
| 7.4 | Click "Copy" | URL copied to clipboard | | |
| 7.5 | Open portal URL in incognito window | Portal loads with client name and org name | | |
| 7.6 | Portal overview — KPI cards render | Active projects, open invoices, documents count | | |
| 7.7 | Portal → Projects tab | Correct projects shown (visible_to_client = true only) | | |
| 7.8 | Portal → Documents tab | Correct documents shown with download links | | |
| 7.9 | Download a document from portal | File downloads correctly | | |
| 7.10 | Portal → Invoices tab | Shows invoices (empty if none created) | | |
| 7.11 | Open wrong/invalid token | 404 page shown | | |
| 7.12 | Disable portal → try to open URL | 404 page shown | | |
| 7.13 | Click "Send portal invite" (Resend configured) | Success toast, email delivered | | |
| 7.14 | Click "Send portal invite" (no Resend key) | Yellow fallback panel with copy/mailto options | | |
| 7.15 | Click "Regenerate link…" | New token generated; old URL returns 404 | | |
| ⚠️ 7.16 | Org logo in portal nav | **KNOWN ISSUE KI-008:** No logo, text only | | |

---

## Section 8 — Notifications

| # | Test | Expected | Result | Notes |
|---|---|---|---|---|
| 8.1 | Create a client | Bell shows unread badge | | |
| 8.2 | Create a project | Bell badge increments | | |
| 8.3 | Upload a document | Bell badge increments | | |
| 8.4 | Click notification bell | Dropdown opens with notification list | | |
| 8.5 | Click a notification | Marks as read, badge decrements | | |
| 8.6 | Click "Mark all as read" | All notifications marked read, badge disappears | | |

---

## Section 9 — Team Management

| # | Test | Expected | Result | Notes |
|---|---|---|---|---|
| 9.1 | Navigate to `/dashboard/settings/team` | Team list shows current members | | |
| 9.2 | Click "Invite member" | Modal opens with email + role fields | | |
| 9.3 | Send invite to a real email | Invitation email received | | |
| 9.4 | Invited user clicks link + sets password | Logged in, org visible | | |
| 9.5 | Invited user's role enforced | Staff cannot edit clients if role restricts | | |

---

## Section 10 — Settings

| # | Test | Expected | Result | Notes |
|---|---|---|---|---|
| 10.1 | Navigate to `/dashboard/settings` | Org name, slug, website, timezone fields | | |
| 10.2 | Update org name | Saved, sidebar shows new name | | |
| 10.3 | Update slug (to available value) | Saved | | |
| 10.4 | Update slug (to taken value) | Error: "That slug is already taken." | | |
| 10.5 | Navigate to `/dashboard/settings/profile` | Name, job title, timezone fields | | |
| 10.6 | Update profile name | Saved, sidebar shows new name | | |
| 10.7 | Change password | Works, can sign in with new password | | |
| 10.8 | Navigate to `/dashboard/settings/billing` | Plan cards visible (Starter/Pro/Agency) | | |
| 10.9 | Monthly/Yearly toggle | Prices update | | |
| 10.10 | Click "Upgrade" (Stripe test mode) | Redirected to Stripe Checkout | | |

---

## Section 11 — Performance & Reliability

| # | Test | Expected | Result | Notes |
|---|---|---|---|---|
| 11.1 | Hard-refresh `/dashboard` | Loads in < 2s | | |
| 11.2 | Navigate between all dashboard tabs | No full-page reload on navigation | | |
| 11.3 | Open portal with 5+ documents | All documents load with signed URLs | | |
| 11.4 | Open on mobile (375px viewport) | Legible; no horizontal scroll | | |
| 11.5 | Check browser console for errors | No red errors in console | | |

---

## Tester Sign-off

| Field | Value |
|---|---|
| Tester name | |
| Date | |
| Environment | Production / Staging |
| Overall assessment | ✅ Ready / ⚠️ Needs fixes / ❌ Blocked |
| Blocking issues found | |
| Notes | |
