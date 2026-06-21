# Bug Report

> Copy this template, fill it in, and send to the PortalFlow team.
> Remove any sections that don't apply.

---

## Summary

_One sentence describing what went wrong._

> Example: "Creating a client succeeds but the client doesn't appear in the list until I refresh the page."

---

## Environment

| Field | Value |
|---|---|
| URL where bug occurred | `https://portalflow.app/dashboard/...` |
| Browser | Chrome 125 / Safari 17 / Firefox 126 |
| Device | Desktop / Mobile (specify model if mobile) |
| Account email | _(your login email)_ |
| Organization name | _(your org name)_ |
| Date / time (approx.) | 2026-06-20, ~14:30 UTC |

---

## Steps to Reproduce

_List every step required to trigger the bug. Be specific._

1. Go to `/dashboard/clients`
2. Click "Add client"
3. Fill in: Name = "Test Corp", Status = "Active", MRR = 5000
4. Click "Create client"
5. Modal closes with "Client created" toast
6. Client does not appear in the list

---

## Expected Behavior

_What should have happened?_

> The new client "Test Corp" should appear at the top of the client list immediately after the modal closes.

---

## Actual Behavior

_What actually happened?_

> The client list is unchanged. Refreshing the page shows the client, so it was saved — but the list didn't update.

---

## Screenshots / Screen Recording

_Attach or paste screenshots. A screen recording (Loom, screen capture) is extremely helpful for UI bugs._

> [Attach screenshot or recording here]

---

## Console Errors

_Open browser DevTools (F12) → Console tab. Copy any red error messages here._

```
[paste console errors here, or write "None"]
```

---

## Network Errors

_Open browser DevTools → Network tab. If any requests show red (4xx/5xx), click them and copy the Response body here._

```
[paste network error response here, or write "None"]
```

---

## Frequency

- [ ] Happens every time
- [ ] Happens sometimes (approx. ___% of the time)
- [ ] Happened once, cannot reproduce

---

## Severity

- [ ] P0 — Blocks core workflow (can't use the product at all)
- [ ] P1 — Major feature broken but workaround exists
- [ ] P2 — Minor annoyance, cosmetic, or edge case

---

## Additional Context

_Anything else that might be relevant: recent changes to your account, unusual data, specific file types, etc._

---

_Thank you for taking the time to report this. We will follow up within 24–48 hours._
