# Practice Portal — Go-Live Runbook

> Step-by-step to switch the practice portal on for a first **design partner** therapist, safely.
> Companion to the project tracker (`pivot-project-plan.md`) and the pivot plan
> (`therapist-portal-pivot.md`). Everything is gated behind `PRACTICE_PORTAL_ENABLED`, so nothing
> here affects the live marketplace until the final step.
> Last updated: 26 June 2026

> **Operator note:** do these in order. Steps 1–3 are reversible and invisible to users. Step 6
> (the flag) is the only one users notice — and only therapists, only the new surfaces. Roll back by
> unsetting the flag.

---

## 0. Pre-flight
- [ ] PR #10 merged to `main` (or deployed from the branch for a private test).
- [ ] You have access to: the Neon database (`DATABASE_URL`), the Stripe dashboard, and Vercel env vars.
- [ ] A real therapist lined up as the design partner (ideally one already warm from outreach).

## 1. Database — apply the new schema  ⚠️ required first
The portal adds columns to existing tables (`Match`, `Therapist`) and new tables (`ClientInvite`,
`Subscription`, `Package`). This repo uses `prisma db push` (not migrations). **Run this before the
code that reads the new columns is live, or marketplace queries will error.**

```bash
# with production DATABASE_URL in the environment
npx prisma db push
```
- [ ] `db push` completed cleanly; `npx prisma studio` shows the new tables.
- [ ] Existing marketplace pages still load (sanity check — the new columns are additive/nullable).

## 2. Stripe — subscription Prices (the SaaS layer)
Create two **recurring** Prices on your platform account (GBP, monthly):
- **Practice** — £39/mo → copy its Price ID
- **Clinic** — £79/mo → copy its Price ID

Set them as Vercel env vars (Production + Preview):
```
STRIPE_PRICE_PRACTICE=price_xxx
STRIPE_PRICE_CLINIC=price_yyy
```
- [ ] Both Price IDs set. (Starter is free — no Price needed; commission only.)
- [ ] `STRIPE_SECRET_KEY` / `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` already present (they are, for the marketplace).

## 3. Stripe — webhook events
The existing endpoint is `/api/webhooks/stripe`. Make sure these events are enabled on the webhook
(the first four already are for the marketplace; the subscription ones are new):
- [ ] `checkout.session.completed` ✓ (sessions, packages, subscriptions)
- [ ] `account.updated` ✓ · `charge.refunded` ✓
- [ ] `customer.subscription.updated` — **add**
- [ ] `customer.subscription.deleted` — **add**
- [ ] `STRIPE_WEBHOOK_SECRET` matches this endpoint.

## 4. Other env
- [ ] `NEXT_PUBLIC_APP_URL` is the real origin (invite/booking/QR links are built from it).
- [ ] `RESEND_API_KEY` + `RESEND_FROM` set and the sending domain is verified (invite/booking/package emails).
- [ ] `DAILY_API_KEY` set (video rooms). Offline/package sessions create the room immediately.
- [ ] `BOOKINGS_ENABLED` — not required for the practice portal (its booking route is separate), but
      set it if you also want marketplace bookings open.

## 5. Smoke test (use a test therapist + a personal second email as the client)
With the flag **on for a preview/staging deploy**, walk the whole loop:
1. [ ] Therapist signs in → `/therapist/dashboard` shows the "Choose your plan" nudge + quick actions.
2. [ ] **Billing:** subscribe to Practice (Stripe test card) → returns active; commission shows 1%.
3. [ ] **Invite:** `/therapist/clients` → invite the client email → invite email arrives; QR renders.
4. [ ] **Accept:** open the invite link as the client → accept → appears as an active client.
5. [ ] **Per-client rate:** set a custom rate → reflected on the client page.
6. [ ] **Schedule (online):** book a session → client gets a pay-link → pay → session shows paid,
       video room created, Payment recorded with the subscription commission.
7. [ ] **Package:** create a package → (offline or pay-link) → schedule "use a package session" →
       draw-down decrements; completes on the last one.
8. [ ] **Directory toggle:** turn on "accepting new clients" → therapist appears in `/therapists`.
9. [ ] **Subscription portal:** "Manage billing" opens the Stripe portal.

## 6. Go live for the design partner
- [ ] Set `PRACTICE_PORTAL_ENABLED=true` in Vercel (Production) → redeploy.
- [ ] Confirm the marketplace still works (the flag only adds surfaces).
- [ ] Onboard the design partner; watch the first real invite + booking closely.

## 7. Before REAL client data — legal
- [ ] DPA in place with the therapist (they are the controller; Faresay is the processor — see pivot plan §9).
- [ ] SaaS subscription terms accepted.
- [ ] Privacy notice updated for the processor model.

## Rollback
- Unset `PRACTICE_PORTAL_ENABLED` (or set `false`) → all practice surfaces 404 / hide; routes refuse.
- The schema changes are additive and harmless to leave in place.

## Per-therapist vs global
The flag is global (all therapists see the surfaces once on). To pilot with **one** therapist only,
either run it on a separate preview deployment shared with just them, or add an allowlist check
(small follow-up) — note it here if you want that built.
