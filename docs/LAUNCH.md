# Launch Checklist

Run `node scripts/preflight.mjs` (with prod env) to auto-check env + test/live status.

## 1. Payments — Stripe go-live
- [ ] Stripe Dashboard → toggle **View test data** OFF → activate account (business details, bank).
- [ ] Get **live** keys → set in Vercel: `STRIPE_SECRET_KEY=sk_live_…`, `STRIPE_PUBLISHABLE_KEY=pk_live_…`.
- [ ] Live webhook: Dashboard → Webhooks → add `https://faresay.com/api/webhooks/stripe`, event `checkout.session.completed` → copy signing secret → `STRIPE_WEBHOOK_SECRET` in Vercel.
- [ ] **Stripe Connect**: enable in live mode. Real therapists complete Express onboarding (real KYC) → `charges_enabled` becomes true → the 85/15 split activates automatically (code already checks `charges_enabled`).
- [ ] Turn on **Stripe Radar** fraud rules.

## 2. Email — Resend domain
- [ ] Resend → Domains → add `faresay.com` → add the DKIM/SPF/return-path DNS records in Cloudflare.
- [ ] Wait for "Verified".
- [ ] Set `RESEND_FROM="Faresay <hello@faresay.com>"` in Vercel (replaces the resend.dev sender).
- [ ] Set `COMPLAINTS_EMAIL` to a monitored inbox.

## 3. Auth — Clerk production instance
- [ ] Clerk Dashboard → create **Production** instance for faresay.com.
- [ ] Add custom domain `clerk.faresay.com` (CNAME in Cloudflare).
- [ ] Set live keys in Vercel: `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_…`, `CLERK_SECRET_KEY=sk_live_…`.
- [ ] Recreate the user.created webhook → `https://faresay.com/api/webhooks/clerk` → `CLERK_WEBHOOK_SECRET`.

## 3b. Therapist photos — Cloudinary
- [ ] Create a free Cloudinary account → note the **Cloud name**.
- [ ] Settings → Upload → add an **unsigned upload preset** (e.g. `faresay_therapists`); restrict formats to images, set a max size, enable incoming transformations.
- [ ] Add to Vercel env (client-exposed, safe — unsigned):
  - `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`
  - `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET`
- Therapists then get Upload + Blur/Illustrated style options on /therapist/profile. Until set, the uploader shows a "not configured" note (rest of the form works).

## 4. Security
- [ ] Cloudflare WAF + Turnstile + rate-limiting rules — see SECURITY.md.
- [ ] Upgrade rate limiter to **Upstash Redis** (current is in-memory, per-instance).
- [ ] Sentry: set `SENTRY_DSN` + `NEXT_PUBLIC_SENTRY_DSN` (+ re-add `withSentryConfig` once Turbopack-compatible).
- [ ] `CRON_SECRET` set; confirm Vercel plan includes Cron (for 24h reminders).

## 5. Data
- [ ] Remove demo therapists: `node prisma/remove-demo-therapists.mjs`
- [ ] Confirm at least a few real, credential-verified therapists are ACTIVE.
- [ ] Set the ADMIN account(s).

## 6. Legal (Phase 1 — with lawyer)
- [ ] Companies House registration (Faresay Ltd).
- [ ] ICO registration (data controller).
- [ ] DPAs with Clerk, Stripe, Daily.co, Neon, Resend.
- [ ] DPIA completed; privacy notice + T&Cs + therapist contract signed off.

## 7. Final smoke test (on prod, live keys)
- [ ] Sign up → onboarding → match → book → pay (real card, small amount) → session room.
- [ ] Cancel >24h → refund lands.
- [ ] Gift purchase → voucher email → redeem → credit applied.
- [ ] Referral link → signup credit → booking reward.
