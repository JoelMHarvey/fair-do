# Stripe go-live checklist

fair-do uses **Stripe Connect (Express)** with **destination charges**
(`transfer_data.destination`). The full lesson amount transfers to the tutor's
connected account — fair-do takes no commission. Students pay via Stripe Checkout.

> ⚠️ **fair-do (the platform) is liable** for refunds, chargebacks, and negative
> balances on destination charges. Keep a cash buffer.

---

## 0. Prerequisite — legal entity (hard blocker)
Stripe activation needs: company legal name + **Companies House number**,
registered address, a director's ID, and a **UK business bank account (GBP)**.
**Cannot activate live until the company is registered.**

## 1. Activate the Stripe account (live)
Dashboard → **Activate account** → business type (Ltd), company number, address,
director identity, business bank account, description ("online tutoring
marketplace"). This exits test mode.

## 2. Set up the Connect platform
Dashboard → **Connect** → complete the **platform profile**:
- [ ] Platform/responsibility questionnaire (refund + dispute liability sits with us)
- [ ] **Branding**: icon, brand colour `#217567`, business name (shown to tutors)
- [ ] **Statement descriptor** (e.g. `FAIRDO`) — what students see on their statement
- [ ] Accept the **Connect service agreement**

## 3. Live API key
Developers → **API keys** → reveal **live secret key** (`sk_live_...`).
(No publishable key is used server-side.)

## 4. Live webhook
Developers → **Webhooks** → **Add endpoint**:
- URL: `https://fair-do.com/api/webhooks/stripe`
- Events (all handled in code):
  - [ ] `checkout.session.completed` — records payment, creates video room, sends emails, rewards referrals, handles gift + org top-ups
  - [ ] `account.updated` — flips `tutor.stripeOnboarded` once charges + payouts are enabled (KYC done)
  - [ ] `charge.refunded` — syncs a payment to `refunded` / `partially_refunded` when a refund is issued from the Dashboard
- [ ] Copy the **live signing secret** (`whsec_...`)

> The endpoint verifies the signature and is **idempotent** (dedupes by event id
> via `ProcessedStripeEvent`), so Stripe retries are safe.

## 5. Vercel env (Production) → then **redeploy**
```
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...        # the LIVE webhook's secret
NEXT_PUBLIC_APP_URL=https://fair-do.com
BOOKINGS_ENABLED=true                  # opens the server booking gate
NEXT_PUBLIC_BOOKINGS_ENABLED=true      # opens the booking UI
```
Env changes require a redeploy to take effect.

## 6. Re-onboard tutors in LIVE
Test-mode connected accounts (`acct_...`) **do not carry to live**.
- [ ] Run `npm run seed:remove-demo` on the prod DB
- [ ] Each real tutor re-runs Connect onboarding in live mode → Stripe KYC →
      `charges_enabled` + `payouts_enabled` → `account.updated` flips
      `stripeOnboarded = true`. The booking route refuses tutors without
      active capabilities, so this gates itself.

## 7. Smoke test (before announcing)
With one real, live-onboarded tutor:
1. [ ] Book a real lesson, **real card, small amount**
2. [ ] Charge succeeds → full amount transfers to tutor (no application fee)
3. [ ] `checkout.session.completed` marks the lesson paid + confirmation email sent
4. [ ] Cancel >24h ahead → refund lands; `charge.refunded` reflected in the payment
5. [ ] Tutor **payout** appears (≈2 business days)

## 8. Also confirm (not Stripe, but launch-coupled)
- [ ] `DAILY_WEBHOOK_SECRET` set (video webhook fails closed without it)
- [ ] `SENTRY_DSN` set (error capture)


---

### Order of operations
Companies House → activate Stripe + Connect → live key + webhook → Vercel env +
redeploy → re-onboard a tutor → smoke test → announce.

### Rollback
Set `BOOKINGS_ENABLED` unset (or `false`) and redeploy to instantly close booking
again — no charge can be attempted while the gate is closed.
