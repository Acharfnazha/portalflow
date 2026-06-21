# PortalFlow — Roadmap

> Items are loosely ordered by value. No committed dates.

---

## v1.1 — Client Payments

> Complete the invoice → payment loop from the client side.

- [ ] **Stripe payment link on portal invoices** — "Pay now" button on client-facing invoices triggers Stripe Checkout
- [ ] **Auto-update invoice status on payment** — webhook marks invoice `paid` and creates a payment record
- [ ] **Payment receipt email** — Resend email to client confirming payment received
- [ ] **Invoice PDF generation** — Serverless PDF via `@react-pdf/renderer` or Puppeteer; stored in Supabase Storage

---

## v1.2 — Branding & White-Label (Agency Plan)

> Let studios replace PortalFlow branding with their own.

- [ ] **Custom portal logo** — Org logo replaces PortalFlow logo in portal nav
- [ ] **Custom accent color** — Per-org CSS variable override for portal pages
- [ ] **Custom domain** — Map `client.yourstudio.com` to the portal (Vercel Domains API)
- [ ] **Remove PortalFlow branding** — Footer and email sender on Agency plan

---

## v1.3 — Plan Limit Enforcement

> Enforce the Starter plan's 20-client, 5-project caps.

- [ ] **Hard cap at create time** — server action checks current count vs plan limit before inserting
- [ ] **Upgrade prompt** — contextual "You've reached your plan limit" UI with upgrade CTA
- [ ] **Storage quota** — track `size_bytes` sum per org; block uploads over limit
- [ ] **Seat limit** — block team invites when seats exhausted on Starter plan

---

## v1.4 — Mobile Dashboard

> Full mobile responsiveness for the dashboard.

- [ ] **Sidebar hamburger menu** — drawer on mobile; current sidebar hidden below 900px
- [ ] **Responsive tables** — card view on mobile for clients, invoices, documents
- [ ] **Touch-friendly inputs** — larger tap targets in forms and modals

---

## v1.5 — Messaging

> Async communication channel between agency and client, inside the portal.

- [ ] **Thread per project** — client posts messages from portal; agency responds from dashboard
- [ ] **File attachments in thread** — drag documents directly into message thread
- [ ] **Email notification on new message** — Resend email to notify the other party
- [ ] **Unread indicator** — notification bell event type `message_received`

---

## v2.0 — Onboarding & Growth

- [ ] **Guided onboarding checklist** — "Add your first client", "Create a project", "Share portal link" steps after signup
- [ ] **Demo workspace** — Seed data option on first signup so new users see a fully populated dashboard
- [ ] **Referral system** — "Invite a colleague, get one month free" tracked via referral codes
- [ ] **Usage analytics** — dashboard showing portal views, document downloads, invoice opens per client

---

## v2.1 — Integrations

- [ ] **Zapier** — triggers: new client, new invoice; actions: create client from CRM, mark invoice paid
- [ ] **Make (Integromat)** — same triggers via webhook
- [ ] **Slack** — post to #deals when a new client is created; notify on invoice payment
- [ ] **Public REST API** — JWT-authenticated API endpoints with per-org API keys

---

## v3.0 — Enterprise

- [ ] **SSO / SAML** — Okta, Azure AD, Google Workspace login for enterprise teams
- [ ] **Audit log** — immutable, exportable audit trail for compliance
- [ ] **Data export** — full org data dump (CSV + JSON) on request
- [ ] **SLA dashboard** — track time-to-response on client requests
- [ ] **Multi-currency invoicing** — EUR, GBP, AUD per client
- [ ] **Native mobile app** — React Native app for iOS + Android

---

## Won't Do (deliberately out of scope)

- **Time tracking** — scope creep; better served by dedicated tools (Toggl, Harvest)
- **Full accounting** — QuickBooks / Xero integration is the right answer, not replication
- **CMS / website builder** — out of scope; portal is purposefully simple
- **Real-time chat** — async messaging (v1.5) is sufficient; live chat adds complexity without proportional value for the target market
