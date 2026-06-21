# PortalFlow — Launch Package

Everything needed to publish PortalFlow professionally across GitHub, LinkedIn, and social media.

---

## GitHub Repository Description

**One-liner (under 255 chars — paste into GitHub About field):**

```
Full-stack SaaS client portal platform. Next.js 16 · Supabase · Stripe · Resend. Give every client a secure, branded portal for projects, invoices, and documents. Built in a 30-day sprint.
```

**GitHub Topics (paste as tags):**

```
nextjs supabase stripe typescript saas client-portal agency-tools
framer-motion vercel postgresql row-level-security resend
```

---

## LinkedIn Launch Post

> Copy-paste ready. ~1,400 characters — fits LinkedIn's algorithm sweet spot.
> **Replace the bracketed placeholders before posting.**

---

I just shipped PortalFlow — a full SaaS client portal platform, built from scratch in 30 days.

Here's what's inside ↓

**The problem:**
Agencies waste hours every week answering "what's the project status?" emails, resending invoice PDFs, and maintaining scattered Google Drive links. There's no professional way to give clients a live view of their work.

**The solution:**
PortalFlow gives every client a unique, token-based portal — a clean, read-only view of their projects, invoices, and documents. No client login required. Just share a link.

**What I built:**

🏗 Full client CRM — status tracking, MRR, health scores, activity history
📁 Document hub — file uploads with Supabase Storage, signed URL downloads
🧾 Invoicing — full lifecycle from draft → pending → paid → overdue
🔔 Notifications — real-time bell with mark-as-read
💳 SaaS billing — Stripe Checkout, Billing Portal, webhook-synced subscription state
🔐 Client portal — token-based, read-only, zero friction for clients

**Tech stack:**
Next.js 16 App Router · TypeScript 5 · Supabase (PostgreSQL + RLS) · Stripe · Resend · Vercel

**The part I'm most proud of:**
Security. Row Level Security on every table. Service role key server-only. Stripe webhook signature verified before any DB write. Owner-only billing mutations. Production-ready from day one — not bolted on.

10 sprints. 12 SQL migrations. ~60 components. 0 build errors.

GitHub → [your repo link]
Live demo → [your demo link]

What would you build next on top of this? Drop it in the comments ↓

#buildinpublic #saas #nextjs #supabase #typescript #webdev #fullstack #agencytools #indiehacker

---

## Short SaaS Pitch

> Use for portfolio pages, cold outreach, or intro conversations.

**Elevator pitch (2 sentences):**

> PortalFlow is a SaaS client portal platform for agencies and freelancers. It replaces scattered email threads and Drive links with one clean workspace — and gives every client a secure, branded portal to track their projects, invoices, and documents in real time.

**Technical pitch (for engineers):**

> A multi-tenant Next.js 16 SaaS built on Supabase PostgreSQL with full Row Level Security, Stripe subscription billing with webhook-synced state, token-based client portals (no auth required), and transactional email via Resend. Server Components for all data fetching, Server Actions for all mutations, zero client-side API routes in the dashboard.

**Investor/product pitch (1 paragraph):**

> Agencies spend 4–6 hours per week on client communication overhead — status update emails, invoice follow-ups, document resends. PortalFlow eliminates that by giving every client a dedicated, branded portal. The agency workspace handles project management, document sharing, and invoicing. The client portal — accessible via a single shared link, no login — shows clients exactly what they need, when they need it. Monetized as a subscription SaaS: Starter at $29/mo, Pro at $79/mo, Agency at $199/mo.

---

## 30-Second Video Script

> For a demo recording, screen share, or LinkedIn video post.

---

**[0:00 — 0:04] Hook**

*(Show landing page)*

"Every agency is drowning in client emails. Here's how I fixed that."

---

**[0:04 — 0:10] The dashboard**

*(Navigate to /dashboard)*

"This is PortalFlow — a full SaaS workspace I built in 30 days. Live KPIs, recent activity, and quick actions, all from real database data."

---

**[0:10 — 0:17] Client profile**

*(Click into a client)*

"Each client has a full profile — MRR, health score, activity history, and six tabs covering every touchpoint."

---

**[0:17 — 0:22] The portal**

*(Click 'Copy portal link', open in new tab)*

"One click sends the client a unique link. No login, no account — just their projects, invoices, and documents in a clean, branded view."

---

**[0:22 — 0:27] Tech callout**

*(Show terminal or GitHub repo briefly)*

"Built with Next.js 16 App Router, Supabase for auth and database, Stripe for billing, and Row Level Security on every table."

---

**[0:27 — 0:30] CTA**

"Link in bio — GitHub is open source. Star it if you found this useful."

---

## Demo Checklist

Run this flow to demo PortalFlow end-to-end in under 5 minutes.

### Before you start
- [ ] App running locally or deployed to Vercel
- [ ] Supabase project connected with migrations applied
- [ ] At least one user account registered

---

### Step 1 — Landing Page (`/`)
- [ ] Open the root URL
- [ ] Scroll through: Hero → Features → Pricing → FAQ
- [ ] Click "Start free trial" → arrives at signup

**What to show:** Professional marketing page; pricing section with three plans.

---

### Step 2 — Signup (`/signup`)
- [ ] Fill in: First name, Last name, Work email, Agency name, Password
- [ ] Click "Create account"
- [ ] Check email → click confirmation link
- [ ] Redirected to `/dashboard`

**What to show:** Clean auth form; confirmation flow; automatic org creation.

---

### Step 3 — Dashboard (`/dashboard`)
- [ ] Point out KPI cards (clients, projects, invoices, MRR)
- [ ] Note "all zeros" for a new workspace — empty state is intentional
- [ ] Sidebar navigation visible

**What to show:** Real server-rendered data; no fake numbers.

---

### Step 4 — Create a Client (`/dashboard/clients`)
- [ ] Click "Add client"
- [ ] Fill: Name = "Acme Studio", Email, MRR = 2500, Status = Active
- [ ] Save
- [ ] Client appears in table

**What to show:** Instant update; no page reload needed; KPI bar updates.

---

### Step 5 — Client Profile (`/dashboard/clients/[id]`)
- [ ] Click on "Acme Studio"
- [ ] Show all 6 tabs: Overview, Projects, Invoices, Documents, Notes, Activity
- [ ] On the Portal tab: show the portal link, click "Send portal invite"

**What to show:** Depth of the client profile; portal integration built-in.

---

### Step 6 — Create a Project (`/dashboard/projects/new`)
- [ ] Fill: Name, assign to Acme Studio, Status = Active, progress = 65%
- [ ] Toggle "Visible to client" ON
- [ ] Save

**What to show:** Client visibility toggle — controls what the portal shows.

---

### Step 7 — Upload a Document (`/dashboard/documents`)
- [ ] Click "Upload document"
- [ ] Select a PDF
- [ ] Assign to Acme Studio
- [ ] Toggle "Visible to client" ON
- [ ] Upload

**What to show:** Supabase Storage integration; signed URL generation.

---

### Step 8 — View Invoices (`/dashboard/invoices`)
- [ ] Show the invoice list (or empty state if no invoices yet)
- [ ] Point out filter tabs: All / Pending / Paid / Overdue / Draft
- [ ] Point out summary cards: Total billed, Total paid, Outstanding, Overdue

**What to show:** Real data from Supabase; clean table with status badges.

---

### Step 9 — The Client Portal (`/portal/[token]`)
- [ ] Copy the portal link from the client's Portal tab (or from the invite email)
- [ ] Open in an incognito window (simulates the client's experience)
- [ ] Overview: KPI cards, recent activity
- [ ] Projects tab: the project you created is visible
- [ ] Documents tab: the document you uploaded is visible and downloadable
- [ ] Invoices tab: (show if any exist)

**What to show:** This is the WOW moment — client sees everything in a clean, branded view with zero login.

---

### Step 10 — Billing (`/dashboard/settings/billing`)
- [ ] Click Settings → Billing
- [ ] Show the three plan cards (Starter / Pro / Agency)
- [ ] Show the monthly/yearly toggle (20% annual discount)
- [ ] If Stripe not configured: show the "Stripe not configured" notice

**What to show:** SaaS monetization built-in; complete Stripe integration ready to go live.

---

### Wrap-up Talking Points

- **Architecture:** Server Components for all data fetching — no loading spinners, no client-side fetch state
- **Security:** RLS on every table; service role key never exposed to browser; Stripe webhook signature verified
- **Scale:** Multi-tenant by design — each org's data is isolated at the database level, not in application code
- **Production-ready:** 0 build errors, 0 lint errors; deployed on Vercel with Edge runtime

---

## Screenshots to Capture

Take these screenshots for README, LinkedIn, and portfolio:

| Screenshot | URL | Notes |
|---|---|---|
| Landing page | `/` | Full viewport, scroll to hero section |
| Dashboard home | `/dashboard` | With KPI cards visible (seed some data first) |
| Client list | `/dashboard/clients` | Show at least 3–4 clients |
| Client profile | `/dashboard/clients/[id]` | Projects tab open |
| Projects list | `/dashboard/projects` | Show active + in-review mix |
| Document library | `/dashboard/documents` | Show file type icons |
| Invoices | `/dashboard/invoices` | Show mixed statuses (paid + pending + overdue) |
| Portal overview | `/portal/[token]` | Open in incognito; show KPI cards |
| Portal projects | `/portal/[token]/projects` | Clean project cards |
| Billing page | `/dashboard/settings/billing` | Plan cards visible |

**Recommended tool:** Use browser at 1440px width; screenshot with full page or `⌘+Shift+4` on Mac.

---

## GitHub Repo Checklist

Before making the repo public:

- [ ] README updated (done ✅)
- [ ] `docs/` folder complete (done ✅)
- [ ] `.env.local` NOT committed (check with `git status`)
- [ ] `.env.local.example` committed with all variables documented
- [ ] No API keys, secrets, or tokens in any committed file
- [ ] No hardcoded production URLs in source code
- [ ] `LICENSE` file exists (MIT)
- [ ] Screenshots in `docs/screenshots/` (add manually)
- [ ] GitHub repository description set (use text above)
- [ ] GitHub Topics added (use list above)
- [ ] GitHub Social Preview image set (1280×640 from your landing page)
