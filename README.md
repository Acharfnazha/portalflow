# PortalFlow

**Give every client one secure, beautifully branded place for projects, invoices, documents, and messaging.**

PortalFlow is a SaaS platform that lets agencies and freelancers create white-label client portals — replacing scattered email threads with a single, professional hub.

---

## Features

- **Authentication** — Email/password sign-up & sign-in, Google OAuth, password reset, email confirmation
- **Organization system** — Multi-tenant with owner / admin / manager / staff roles, team invites, RLS-enforced data isolation
- **Clients module** — Create, edit, soft-delete clients; search, filter by status, paginate; activity timeline fed from Supabase
- **Client profiles** — Full profile with MRR, health score, tags, contact info, owner; project / invoice / document / notes tabs
- **Landing page** — Animated marketing page with hero, pricing, FAQ, final CTA
- **Client portal** — Tokenized read-only portal for end clients (projects, invoices, documents)
- **Dashboard shell** — Sidebar navigation, topbar, responsive layout

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 (strict) |
| Database | Supabase (PostgreSQL + Auth + RLS) |
| Auth | Supabase Auth (`@supabase/ssr`) |
| Animation | Framer Motion |
| State | Zustand |
| Icons | Tabler Icons |
| Styling | CSS custom properties (no Tailwind in app shell) |
| Deployment | Vercel-ready |

---

## Project Structure

```
src/
├── app/
│   ├── (auth)/          # login, signup, forgot-password, reset-password
│   ├── auth/            # accept-invite, check-email, callback
│   ├── dashboard/       # protected dashboard routes
│   │   ├── clients/     # clients list + [id] profile
│   │   ├── invoices/
│   │   ├── projects/
│   │   ├── documents/
│   │   ├── team/
│   │   └── settings/
│   ├── portal/[token]/  # tokenized client portal (public)
│   ├── register/        # redirects to /signup
│   └── page.tsx         # landing page
├── components/
│   ├── dashboard/       # all dashboard UI components
│   ├── auth/            # auth provider, guards
│   ├── portal/          # client portal components
│   ├── shared/          # confirm-dialog, page-header
│   └── ui/              # design system primitives
├── lib/
│   ├── supabase/        # server.ts, client.ts, actions.ts, org-actions.ts, client-actions.ts
│   ├── constants.ts
│   ├── format.ts
│   └── permissions.ts
├── types/
│   └── app.types.ts
├── hooks/
└── middleware.ts         # auth guard, org onboarding redirect
supabase/
└── migrations/
    ├── 001_schema.sql
    ├── 002_indexes.sql
    ├── 003_rls.sql
    ├── 004_functions.sql
    ├── 005_auth_profiles.sql
    ├── 006_org_system.sql
    └── 007_clients_module.sql
```

---

## Getting Started

### Prerequisites

- Node.js 20+
- A [Supabase](https://supabase.com) project

### 1. Clone the repo

```bash
git clone https://github.com/Acharfnazha/portalflow.git
cd portalflow
npm install
```

### 2. Configure environment variables

Copy the example file and fill in your values:

```bash
cp .env.local.example .env.local
```

Open `.env.local` and set:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Get these from your Supabase dashboard → **Settings → API**.

> ⚠️ Never commit `.env.local`. It is already listed in `.gitignore`.

### 3. Run database migrations

In your Supabase project, open the **SQL Editor** and run the migration files in order:

```
supabase/migrations/001_schema.sql
supabase/migrations/002_indexes.sql
supabase/migrations/003_rls.sql
supabase/migrations/004_functions.sql
supabase/migrations/005_auth_profiles.sql
supabase/migrations/006_org_system.sql
supabase/migrations/007_clients_module.sql
```

### 4. Start the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Supabase anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | Supabase service role key (server-only, never exposed to browser) |
| `NEXT_PUBLIC_SITE_URL` | ✅ | Site URL used for OAuth and email redirect links |

---

## Available Scripts

```bash
npm run dev      # Start dev server
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint
```

---

## Roadmap

- [ ] Projects Module — full CRUD, kanban board, task tracking
- [ ] Invoices Module — create/send invoices, payment status
- [ ] Documents Module — file upload to Supabase Storage
- [ ] Notes Module — client notes persisted to database
- [ ] Stripe integration — subscription billing
- [ ] Client portal — wire to live Supabase data (currently static)
- [ ] Email notifications — Resend integration
- [ ] Onboarding flow — guided setup after registration

---

## Security

- Row Level Security (RLS) is enforced on all tables — users can only access data within their organization
- Service role key is used server-side only and never exposed to the client
- `.env.local` is git-ignored
- Soft deletes used for clients (data is never hard-deleted)

---

## License

MIT
