# Stripe → Vercel setup (test → live)

Standalone, practical steps to take Stripe from test to live and wire every Stripe
value into Vercel. This is the only env work that touches real money — do it
deliberately. (Deeper Connect/liability background lives in `STRIPE-GOLIVE.md`.)

> **Mode matters.** Everything below — keys, products, prices, the webhook, and
> connected accounts — is **separate between Test and Live**. Test `price_…` / `acct_…`
> / `whsec_…` do **not** carry over. When you flip to Live you recreate them all.

---

## ⭐ Test mode first (do this now — no bank account needed)

**Live needs the company bank account; Test mode does not.** You can validate every
paid flow today with Stripe **test cards**, then swap to Live later with no code
changes. Do this now:

1. Stripe → toggle **Test mode** (top-right). Developers → API keys → copy
   `sk_test_…` → set `STRIPE_SECRET_KEY` in Vercel (Preview/Production as you test).
2. Connect → enable in test (a test platform profile is enough).
3. Create the **3 prices in Test mode** (monthly, GBP): Pro £29, School £79, Parent
   portal £4.99 → `STRIPE_PRICE_PRO`, `STRIPE_PRICE_SCHOOL`, `STRIPE_PRICE_PARENT_PORTAL`.
4. Webhook: either
   - add a **test endpoint** at `https://<your-deploy>/api/webhooks/stripe` with the 5
     events (Step 5 below) → use its `whsec_…`, **or**
   - run locally: `stripe listen --forward-to localhost:3000/api/webhooks/stripe` →
     use the `whsec_…` it prints.
   Set `STRIPE_WEBHOOK_SECRET`.
5. `BOOKINGS_ENABLED=true` + `NEXT_PUBLIC_BOOKINGS_ENABLED=true` → redeploy.
6. **Test** with card `4242 4242 4242 4242` (any future expiry / any CVC):
   - book a lesson · subscribe a tutor to Pro/School · invite a parent → subscribe ·
     set a recurring slot → save card. Connect onboarding has a test flow too.

When the bank clears → **Live swap only**: `sk_live_…`, recreate the 3 prices in Live,
add the Live webhook, update the env vars. Nothing in code changes.

The rest of this doc is the **Live** procedure.

---

## What the app charges (so you know what to build in Stripe)

| Charge | How | Needs a Product/Price? |
|---|---|---|
| Lesson bookings | Checkout / PaymentIntent, **destination charge** via Connect (platform fee + transfer to tutor) | No — amount is per-lesson |
| Gift vouchers, packages, org top-ups | Checkout with dynamic `price_data` | No |
| **Teacher Pro** plan (£29/mo) | Subscription | ✅ `STRIPE_PRICE_PRO` |
| **Teacher School** plan (£79/mo) | Subscription | ✅ `STRIPE_PRICE_SCHOOL` |
| **Parent portal** (£4.99/mo) | Subscription | ✅ `STRIPE_PRICE_PARENT_PORTAL` |

So you create **3 recurring Products/Prices**. Everything else is dynamic.

The platform is **Stripe Connect (Express)** — tutors are connected accounts; the
platform takes its fee via `application_fee_amount` + `transfer_data`. **Connect must
be enabled and the platform profile completed in Live.**

---

## Prerequisite (the hard gate) 🔴

Stripe won't activate Live without: a registered company (Companies House number),
registered address, a director's ID, and a **UK business bank account (GBP)**. You
cannot get `sk_live_…` until the account is activated.

---

## Step 1 — Activate the Live account

Stripe Dashboard → **Activate account**: business type (Ltd), company number, address,
director identity, bank account, description ("online tutoring marketplace"). This
exits Test mode.

## Step 2 — Set up Connect (Live)

Dashboard → **Connect** → complete the **platform profile**:
- Responsibility/liability questionnaire (refunds + disputes sit with the platform).
- Branding: icon, brand colour `#4f46e5`, business name (shown to tutors).
- Statement descriptor (e.g. `FAIRDO`) — what students see on their statement.
- Accept the Connect service agreement.

## Step 3 — Live API key

Toggle Stripe to **Live mode** → Developers → **API keys** → reveal the **live secret
key** (`sk_live_…`). (No publishable key is used — the app uses Checkout redirects, no
client-side Stripe.js.)

## Step 4 — Create the 3 subscription Products/Prices (Live mode)

Products → **Add product** (three times). Each: recurring, **monthly**, **GBP**.

| Product name | Price | Copy the Price ID into |
|---|---|---|
| fair-do Pro | £29.00 / month | `STRIPE_PRICE_PRO` |
| fair-do School | £79.00 / month | `STRIPE_PRICE_SCHOOL` |
| fair-do Parent Portal | £4.99 / month | `STRIPE_PRICE_PARENT_PORTAL` |

Each "Add price" gives a **Price ID** (`price_…`) — that's the value, not the product id.

## Step 5 — Create the Live webhook

Developers → **Webhooks** → **Add endpoint**:
- URL: `https://fair-do.com/api/webhooks/stripe`
- Events (select exactly these):
  - `checkout.session.completed`
  - `account.updated`
  - `charge.refunded`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
- Create → copy the **Signing secret** (`whsec_…`) → that's `STRIPE_WEBHOOK_SECRET`.

The endpoint is idempotent (dedupes by event id), so Stripe retries are safe.

---

## Step 6 — Vercel env vars (Production)

Vercel → Settings → Environment Variables → **Production**. Set/replace:

| Var | Value | From |
|---|---|---|
| `STRIPE_SECRET_KEY` | `sk_live_…` | Step 3 |
| `STRIPE_WEBHOOK_SECRET` | `whsec_…` | Step 5 (the **live** endpoint's secret) |
| `STRIPE_PRICE_PRO` | `price_…` | Step 4 |
| `STRIPE_PRICE_SCHOOL` | `price_…` | Step 4 |
| `STRIPE_PRICE_PARENT_PORTAL` | `price_…` | Step 4 (only if running the parent portal) |
| `NEXT_PUBLIC_APP_URL` | `https://fair-do.com` | — |
| `BOOKINGS_ENABLED` | `true` | opens the booking/charge gate |
| `NEXT_PUBLIC_BOOKINGS_ENABLED` | `true` | opens the booking UI |

**Redeploy** after saving (env changes need a redeploy to take effect).

---

## Step 7 — Re-onboard tutors in Live

Test-mode connected accounts (`acct_…`) don't exist in Live. Each real tutor re-runs
Connect onboarding in Live → Stripe KYC → `charges_enabled` + `payouts_enabled` →
they become bookable. The booking route refuses tutors without active capabilities,
so this gates itself.

---

## Step 8 — Smoke test (real card, small amount)

1. A tutor completes Live Connect onboarding.
2. Book a lesson, pay with a real card → charge succeeds, platform fee retained,
   remainder transfers to the tutor.
3. `checkout.session.completed` marks it paid + sends the confirmation email.
4. Cancel >24h ahead → refund lands; `charge.refunded` reflected.
5. (If using paid plans) subscribe a tutor to **Pro** → `customer.subscription.updated`
   activates the plan; check `/teacher/billing` shows it.
6. (If using parent portal) a parent subscribes → portal unlocks.

---

## Rollback

Unset (or set `false`) `BOOKINGS_ENABLED` and redeploy → instantly closes booking; no
charge can be attempted while the gate is closed.

---

## Quick checklist

- [ ] Company + UK bank → Stripe account activated (Live)
- [ ] Connect platform profile completed (Live)
- [ ] `sk_live_…` → `STRIPE_SECRET_KEY`
- [ ] 3 prices created (Live) → `STRIPE_PRICE_PRO` / `_SCHOOL` / `_PARENT_PORTAL`
- [ ] Live webhook + 5 events → `STRIPE_WEBHOOK_SECRET`
- [ ] `NEXT_PUBLIC_APP_URL`, `BOOKINGS_ENABLED`, `NEXT_PUBLIC_BOOKINGS_ENABLED`
- [ ] Redeploy
- [ ] Tutors re-onboard in Live
- [ ] Smoke test passed
