# fair-do Launch Checklist

fair-do.com is a UK online tutoring marketplace forked from the Faresay therapy platform. The app code is ready; this document covers every service configuration step required before going live.

---

## Pre-launch phases overview

| Phase | Focus | Target |
|---|---|---|
| **Phase 1** — Infrastructure & Services | Provision and wire together all third-party services | Week 1–2 |
| **Phase 2** — Environment Variables | Fill `.env.production` and Vercel project variables | Week 2 |
| **Phase 3** — Pre-launch Verification | Test every integration end-to-end in test/staging mode | Week 2–3 |
| **Phase 4** — Soft Launch | Controlled rollout to founding tutors, then first students | Week 3–4 |

---

## Phase 1: Infrastructure & Services

### 1.1 GitHub Repository

- [x] Repository created: **JoelMHarvey/fair-do**
- [x] Forked from JoelMHarvey/faresay
- Confirm branch protection rules are set on `main` (require PR + passing CI before merge)
- Add `LAUNCH.md` and fair-do-specific secrets to `.gitignore` / `.env.example`

---

### 1.2 Vercel Project Setup

> **Separate Vercel project from Faresay** — do not add fair-do as a domain alias on the Faresay project.

**Steps:**

1. Go to [vercel.com/new](https://vercel.com/new) → Import Git Repository → select `JoelMHarvey/fair-do`
2. Set **Root Directory**: `.` (the repo root — same as Faresay)
3. Set **Framework Preset**: Next.js
4. Set **Build Command**: `npx prisma generate && next build` (already in `vercel.json`)
5. Set **Node.js Version**: 20.x
6. Do **not** deploy yet — add environment variables first (see Phase 2)
7. After first deploy, go to **Project Settings → Domains** and add `fair-do.com` and `www.fair-do.com`

**Vercel crons** are declared in `vercel.json` and activate automatically on the Pro plan:

| Path | Schedule | Purpose |
|---|---|---|
| `/api/cron/reminders` | Every hour (`:00`) | Session reminder emails |
| `/api/cron/no-shows` | Every hour (`:15`) | No-show detection |
| `/api/cron/credentials` | Daily at 08:00 | Tutor credential/insurance expiry checks |
| `/api/cron/alerts` | Every 15 min | Ops health alerts |
| `/api/cron/fx` | Daily at 06:30 | FX rate refresh |
| `/api/cron/inbox` | Every 5 min | Inbox agent polling |

Confirm the Vercel project is on a plan that supports cron jobs (Pro or above).

---

### 1.3 Cloudflare DNS

> **CRITICAL**: Use **grey cloud (DNS only)**, NOT orange-proxied. Vercel manages TLS termination; orange-proxying creates a double-proxy that breaks Vercel's SSL certificate provisioning and causes redirect loops.

**Records to add in Cloudflare for `fair-do.com`:**

| Type | Name | Value | Proxy |
|---|---|---|---|
| `CNAME` | `@` (or `fair-do.com`) | `cname.vercel-dns.com` | DNS only (grey) |
| `CNAME` | `www` | `cname.vercel-dns.com` | DNS only (grey) |

Vercel will auto-provision a Let's Encrypt certificate once these records propagate (usually within minutes, up to 48 hours for TTL to flush).

**www redirect**: Configure the `www` → apex redirect in Vercel Project Settings → Domains, not in Cloudflare, to avoid conflicts.

**Email DNS records** for Resend and any MX records are added separately — see §1.8.

---

### 1.4 Neon Database

> **Separate database from Faresay** — create a new database in the same Neon org. Do not point fair-do at the Faresay database; the data models will diverge.

**Steps:**

1. Log into [console.neon.tech](https://console.neon.tech)
2. In the existing Faresay org, click **New Project** → name it `fair-do` → region: `eu-west-2` (London) for UK data residency
3. Copy the **connection string** — it will look like:
   ```
   postgresql://fair_do_owner:<password>@ep-xxx-xxx.eu-west-2.aws.neon.tech/fair-do?sslmode=require
   ```
4. Set `DATABASE_URL` in Vercel environment variables (see Phase 2)
5. Run migrations on first deploy:
   ```bash
   npx prisma migrate deploy
   ```
   This runs automatically via the Vercel build command if you add it, or run it manually from a local machine pointed at the Neon connection string.

**Connection pooling**: Neon provides a pooled connection string ending in `-pooler`. Use the pooled string for the app (`DATABASE_URL`) to avoid exhausting connections under serverless concurrency. Keep the non-pooled string for `prisma migrate deploy` (migrations require a direct connection).

```
# Pooled (app runtime):
DATABASE_URL=postgresql://...@ep-xxx-pooler.eu-west-2.aws.neon.tech/fair-do?sslmode=require

# Direct (migrations only — not set in Vercel):
DIRECT_URL=postgresql://...@ep-xxx.eu-west-2.aws.neon.tech/fair-do?sslmode=require
```

---

### 1.5 Clerk Authentication

> **Separate Clerk application from Faresay** — users, JWT keys, and webhook secrets must not be shared between platforms.

**Steps:**

1. Log into [dashboard.clerk.com](https://dashboard.clerk.com)
2. Create a new application: **fair-do** → choose sign-in methods (Email + Google at minimum)
3. Copy keys:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` — starts with `pk_test_` or `pk_live_`
   - `CLERK_SECRET_KEY` — starts with `sk_test_` or `sk_live_`
4. In **Clerk Dashboard → Domains**: add `https://fair-do.com` as a production domain
5. In **JWT Templates**: if Faresay's template is named `faresay-prisma-sync`, create an equivalent `fair-do-prisma-sync` template (or use the default Clerk session token — check what `src/lib/prisma.ts` and the Clerk middleware expect)
6. In **Webhooks** → Add Endpoint:
   - URL: `https://fair-do.com/api/webhooks/clerk`
   - Events to subscribe: `user.created` (the webhook handler in `src/app/api/webhooks/clerk/route.ts` only processes `user.created` — upserts a User row in Prisma)
   - Copy the **Signing Secret** → set as `CLERK_WEBHOOK_SECRET`
7. Configure OAuth providers (Google, Apple) if desired — set up new OAuth apps in their respective consoles pointing to the Clerk fair-do application's redirect URI

**Clerk redirect URLs to configure:**

| Setting | Value |
|---|---|
| Sign-in URL | `/sign-in` |
| Sign-up URL | `/sign-up` |
| After sign-in URL | `/` |
| After sign-up URL | `/onboarding/role` |

---

### 1.6 Stripe Setup (SEPARATE ACCOUNT)

> **CRITICAL: Create a brand-new Stripe account, not a sub-account or connected account under the Faresay Stripe account.** Reason: fair-do needs its own Stripe Connect platform for tutor payouts, its own merchant identity for card statement descriptors, separate financial reporting, and isolated regulatory obligations. Revenue and payouts must never flow through the Faresay Stripe account.

**Steps:**

1. Go to [dashboard.stripe.com](https://dashboard.stripe.com) → sign out of Faresay → create a **new Stripe account** using the fair-do business entity
2. Complete business verification (UK business details, bank account for settlements)
3. Enable **Stripe Connect** → Platform type: **Express** (tutors onboard via the hosted Express flow; they receive payouts directly)
4. Copy API keys:
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` — starts with `pk_test_` or `pk_live_`
   - `STRIPE_SECRET_KEY` — starts with `sk_test_` or `sk_live_`
5. Set the **API version** — the app uses `2026-05-27.dahlia` (hardcoded in `src/lib/stripe.ts`); confirm this is available on the new account or pin it in the Stripe dashboard

**Create Stripe Products & Prices (test mode first):**

| Product | Price | Billing | Env var for Price ID |
|---|---|---|---|
| Tutor Pro | £15.00/month | Recurring monthly | `STRIPE_PRICE_PRACTICE` |
| Tutor Studio | £45.00/month | Recurring monthly | `STRIPE_PRICE_CLINIC` |
| Parent Portal | £4.99/month | Recurring monthly | `STRIPE_PRICE_PARENT_PORTAL` |

> Note: in the Faresay fork, the tiers are `starter` / `practice` / `clinic`. For fair-do, the equivalent mapping is Free (starter, up to 8 students) / Pro £15/mo (practice) / Studio £45/mo (clinic). The `STRIPE_PRICE_PRACTICE` and `STRIPE_PRICE_CLINIC` env var names are used directly by `src/lib/billing.ts` — do not rename them. The Parent Portal subscription is a separate product.

**Create Stripe Webhook Endpoint:**

1. Stripe Dashboard → Developers → Webhooks → Add Endpoint
2. URL: `https://fair-do.com/api/webhooks/stripe`
3. Events to listen for (based on `src/app/api/webhooks/stripe/route.ts`):
   - `account.updated` — Connect account KYC status
   - `charge.refunded` — Dashboard-issued refunds
   - `customer.subscription.updated` — Plan changes
   - `customer.subscription.deleted` — Cancellations
   - `checkout.session.completed` — Bookings, subscriptions, packages, gift vouchers, org top-ups
4. Copy the **Webhook Signing Secret** → set as `STRIPE_WEBHOOK_SECRET`

**Statement descriptor**: Set to `FAIR-DO.COM` in Stripe account settings so parents recognise the charge on their bank statement.

---

### 1.7 Daily.co Video

> Uses the same Daily.co account as Faresay. Add fair-do.com as an allowed domain on the existing account.

**Steps:**

1. Log into [dashboard.daily.co](https://dashboard.daily.co)
2. Go to **Developers → Allowed Domains** → add `fair-do.com` and `*.fair-do.com`
3. The existing `DAILY_API_KEY` can be reused — Daily.co API keys are account-scoped, not domain-scoped. You may create a separate key for fair-do for key-rotation hygiene: **Developers → API Keys → New Key** → name it `fair-do-production`
4. Set `DAILY_API_KEY` in Vercel project variables for fair-do

**Room configuration** (set in `src/lib/daily.ts`, no dashboard config required):

- Privacy: `private` — a valid meeting token is required to join (a leaked room URL alone cannot admit a stranger)
- Default max participants: `2` (tutor + student)
- Parent observation: max participants `3` — the `createRoom()` function accepts `maxParticipants` so the booking flow can pass `3` for sessions with parent observation enabled
- Rooms expire 3 hours after the scheduled session time
- Chat enabled; screenshare disabled

**Webhook** (if session attendance tracking is needed — check `src/app/api/webhooks/daily/route.ts`):

1. Daily Dashboard → Developers → Webhooks → Add Webhook
2. URL: `https://fair-do.com/api/webhooks/daily`
3. Events: `meeting-started`, `meeting-ended`, `participant-joined`, `participant-left`

---

### 1.8 Resend Email

> Same Resend account as Faresay; add fair-do.com as a new sending domain.

**Steps:**

1. Log into [resend.com](https://resend.com)
2. **Domains → Add Domain** → enter `fair-do.com`
3. Resend will provide DNS records to add in Cloudflare:

| Type | Name | Value | Purpose |
|---|---|---|---|
| `TXT` | `resend._domainkey.fair-do.com` | (DKIM key from Resend) | DKIM signing |
| `TXT` | `fair-do.com` | `v=spf1 include:amazonses.com ~all` | SPF (check Resend's current record) |
| `MX` | `fair-do.com` | `feedback-smtp.eu-west-1.amazonses.com` | Bounce handling |

Add all records in Cloudflare with **grey cloud (DNS only)** and click **Verify** in Resend.

4. Once verified, create an API key: **API Keys → Create API Key** → name it `fair-do-production` → scope: Sending access → Domain: `fair-do.com`
5. Set `RESEND_API_KEY` and `RESEND_FROM` in Vercel:
   ```
   RESEND_FROM=fair-do <hello@fair-do.com>
   ```

**Email types used by the app** (all defined in `src/lib/email.ts` — the `FROM` constant reads `RESEND_FROM`):

- Tutor approved / rejected / suspended
- Credential expiry reminders
- Booking confirmed (with .ics calendar attachment)
- Session reminder (24 hours before)
- No-show notice
- Cancellation notice
- Package offered / series scheduled
- Client / student invite
- Gift vouchers
- Ops alert digest (to admin inbox)
- Admin messages to tutors

**From address**: `RESEND_FROM=fair-do <hello@fair-do.com>`

---

### 1.9 Cloudinary

> Same Cloudinary account as Faresay. Add a new upload preset for fair-do.

**Steps:**

1. Log into [cloudinary.com](https://cloudinary.com)
2. **Settings → Upload → Upload Presets → Add upload preset**:
   - Preset name: `fair-do-tutors`
   - Signing mode: **Signed** (prevents unauthorised uploads)
   - Folder: `fair-do/tutors/`
   - Incoming transformations: `c_fill,g_face,w_800,h_800,q_auto` (square crop, face-aware, 800px — the display layer in `src/lib/cloudinary.ts` applies further client-side transforms down to 400px)
   - Max file size: 2 MB
   - Allowed formats: `jpg,jpeg,png,webp`
3. Note your **Cloud name** (shared with Faresay), **API key**, and **API secret**

**Environment variables needed:**

```
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=<your-cloud-name>
CLOUDINARY_API_KEY=<api-key>
CLOUDINARY_API_SECRET=<api-secret>
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=fair-do-tutors
```

The CSP in `next.config.ts` already allows `upload-widget.cloudinary.com` and `res.cloudinary.com` — no changes needed there (the Cloudinary domain is account-wide, not preset-specific).

---

### 1.10 Sentry Observability

> Create a new Sentry project in the same org as Faresay. Do not reuse the Faresay DSN — errors would be mixed across platforms.

**Steps:**

1. Log into [sentry.io](https://sentry.io)
2. **Projects → Create Project** → platform: **Next.js** → project name: `fair-do`
3. Copy the **DSN** (looks like `https://xxx@oxx.ingest.sentry.io/yyy`)
4. Set environment variables:
   ```
   SENTRY_DSN=https://xxx@oxx.ingest.sentry.io/yyy
   NEXT_PUBLIC_SENTRY_DSN=https://xxx@oxx.ingest.sentry.io/yyy
   SENTRY_ORG=<your-sentry-org-slug>
   SENTRY_PROJECT=fair-do
   SENTRY_AUTH_TOKEN=<create in Sentry User Settings → Auth Tokens>
   ```
5. `SENTRY_AUTH_TOKEN` is used by the Sentry CLI in CI to upload source maps. Create a token with `project:releases` and `org:read` scopes.

**App wiring** (already in place from the Faresay fork):

- Server-side init: `src/instrumentation.ts` — reads `SENTRY_DSN`, sets `tracesSampleRate: 0.1`, `sendDefaultPii: false`
- Client-side init: `src/instrumentation-client.ts`
- Error helper: `src/lib/observability.ts` — `logError()` forwards to Sentry when `SENTRY_DSN` is set

> **Note**: As documented in `next.config.ts`, `withSentryConfig` is intentionally omitted because it broke route collection under Next.js 16 Turbopack on Vercel. Re-add the wrapper once Sentry fully supports Turbopack builds.

**Alerts to configure in Sentry:**

- Error spike: `> 10 new errors in 5 minutes` → notify `joelmharvey@gmail.com`
- Performance: P95 response time `> 3s` on any transaction
- First-seen alert for any new error (to catch regressions early)

**Source maps**: The `SENTRY_AUTH_TOKEN` triggers automatic source map upload during `next build` when the Sentry Next.js SDK is configured. Verify in the Sentry release page after the first production deploy.

---

### 1.11 Plausible Analytics

> Add fair-do.com as a new site — separate from any Faresay Plausible site.

**Steps:**

1. Log into your Plausible account
2. **Sites → Add a website** → domain: `fair-do.com`
3. Set environment variable:
   ```
   NEXT_PUBLIC_PLAUSIBLE_DOMAIN=fair-do.com
   ```
4. The Plausible script tag should already be in the app's `<head>` via the Faresay fork — confirm it reads `NEXT_PUBLIC_PLAUSIBLE_DOMAIN`

**Custom goals to configure in Plausible (Settings → Goals):**

| Goal name | Trigger | Notes |
|---|---|---|
| `tutor_signup` | Custom event | Fire when tutor completes onboarding |
| `student_booking` | Custom event | Fire when a booking is confirmed |
| `parent_subscription` | Custom event | Fire when parent portal subscription activates |
| `subscription_upgrade` | Custom event | Fire when tutor upgrades from Free → Pro or Studio |

Verify the Plausible script is not blocked by the CSP. The `next.config.ts` CSP already includes `https://plausible.io` in `script-src` and `connect-src`.

---

### 1.12 Upstash Redis

> Create a new Redis database for fair-do. Do not share with Faresay — rate limit counters and session caches must be isolated.

**Steps:**

1. Log into [console.upstash.com](https://console.upstash.com)
2. **Create Database** → name: `fair-do` → region: `eu-west-1` (Ireland, closest to UK) → type: Regional (not Global, unless you expect significant non-EU traffic)
3. Copy credentials:
   - `UPSTASH_REDIS_REST_URL` — looks like `https://xxx.upstash.io`
   - `UPSTASH_REDIS_REST_TOKEN` — long alphanumeric string

**Used for** (via `@upstash/redis` and `@upstash/ratelimit` in `package.json`):

- API rate limiting (e.g. `/api/booking/create`, webhook endpoints, AI assistant)
- Session/response caching

---

### 1.13 Anthropic API

> The same API key can be used across Faresay and fair-do — Anthropic does not restrict by domain. However, set it separately in each Vercel project's environment so the keys can be rotated independently.

**Steps:**

1. Log into [console.anthropic.com](https://console.anthropic.com)
2. **API Keys → Create Key** → name: `fair-do-production`
3. Set `ANTHROPIC_API_KEY` in the Vercel fair-do project environment variables

**Used for**: In-session lesson note generation and the AI assistant (`src/lib/assistant.ts`, `src/app/api/assistant/chat/route.ts`).

Model in use: check `src/lib/assistant.ts` for the `model` parameter — update to the desired Claude model if needed.

---

## Phase 2: Environment Variables

Complete `.env.example` for the fair-do repository. Copy this to `.env.local` for local development and set all values in the Vercel project (Settings → Environment Variables).

```bash
# ---------------------------------------------------------
# App
# ---------------------------------------------------------
NEXT_PUBLIC_APP_URL=https://fair-do.com                    # DIFFERENT from Faresay

# ---------------------------------------------------------
# Database — Neon (DIFFERENT — new fair-do database)
# ---------------------------------------------------------
DATABASE_URL=postgresql://...@ep-xxx-pooler.eu-west-2.aws.neon.tech/fair-do?sslmode=require   # DIFFERENT
# Direct URL for migrations (not set in Vercel — use locally / in CI only):
# DIRECT_URL=postgresql://...@ep-xxx.eu-west-2.aws.neon.tech/fair-do?sslmode=require

# ---------------------------------------------------------
# Clerk — Auth (DIFFERENT — new fair-do Clerk application)
# ---------------------------------------------------------
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...              # DIFFERENT
CLERK_SECRET_KEY=sk_live_...                               # DIFFERENT
CLERK_WEBHOOK_SECRET=whsec_...                             # DIFFERENT

# ---------------------------------------------------------
# Stripe (DIFFERENT — completely separate Stripe account)
# ---------------------------------------------------------
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...             # DIFFERENT
STRIPE_SECRET_KEY=sk_live_...                              # DIFFERENT
STRIPE_WEBHOOK_SECRET=whsec_...                            # DIFFERENT
STRIPE_PRICE_PRACTICE=price_...                            # DIFFERENT (Tutor Pro £15/mo)
STRIPE_PRICE_CLINIC=price_...                              # DIFFERENT (Tutor Studio £45/mo)
STRIPE_PRICE_PARENT_PORTAL=price_...                       # NEW — Parent Portal £4.99/mo

# ---------------------------------------------------------
# Daily.co — Video (SAME account, may be new API key)
# ---------------------------------------------------------
DAILY_API_KEY=...                                          # SAME account / new key optional

# ---------------------------------------------------------
# Resend — Email (SAME account, DIFFERENT domain + key)
# ---------------------------------------------------------
RESEND_API_KEY=re_...                                      # DIFFERENT (scoped to fair-do.com)
RESEND_FROM=fair-do <hello@fair-do.com>                    # DIFFERENT

# ---------------------------------------------------------
# Cloudinary — Photos (SAME account, DIFFERENT upload preset)
# ---------------------------------------------------------
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=...                      # SAME
CLOUDINARY_API_KEY=...                                     # SAME (or new key for hygiene)
CLOUDINARY_API_SECRET=...                                  # SAME (or new key for hygiene)
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=fair-do-tutors        # DIFFERENT

# ---------------------------------------------------------
# Sentry — Observability (SAME org, DIFFERENT project)
# ---------------------------------------------------------
SENTRY_DSN=https://...@oxx.ingest.sentry.io/...           # DIFFERENT
NEXT_PUBLIC_SENTRY_DSN=https://...@oxx.ingest.sentry.io/...  # DIFFERENT
SENTRY_ORG=<your-sentry-org>                               # SAME
SENTRY_PROJECT=fair-do                                     # DIFFERENT
SENTRY_AUTH_TOKEN=...                                      # SAME or new token

# ---------------------------------------------------------
# Plausible — Analytics (SAME account, DIFFERENT site)
# ---------------------------------------------------------
NEXT_PUBLIC_PLAUSIBLE_DOMAIN=fair-do.com                   # DIFFERENT

# ---------------------------------------------------------
# Upstash Redis — Rate limiting & caching (DIFFERENT database)
# ---------------------------------------------------------
UPSTASH_REDIS_REST_URL=https://...upstash.io               # DIFFERENT
UPSTASH_REDIS_REST_TOKEN=...                               # DIFFERENT

# ---------------------------------------------------------
# Anthropic — AI (SAME account, new key for rotation hygiene)
# ---------------------------------------------------------
ANTHROPIC_API_KEY=sk-ant-...                               # SAME account / new key recommended

# ---------------------------------------------------------
# Push notifications (Web Push — generate new VAPID keys)
# ---------------------------------------------------------
NEXT_PUBLIC_VAPID_PUBLIC_KEY=...                           # DIFFERENT — generate new pair
VAPID_PRIVATE_KEY=...                                      # DIFFERENT
VAPID_SUBJECT=mailto:hello@fair-do.com                     # DIFFERENT

# ---------------------------------------------------------
# Admin / ops
# ---------------------------------------------------------
ADMIN_EMAIL=joelmharvey@gmail.com                          # SAME or set to fair-do ops address
CRON_SECRET=...                                            # DIFFERENT — random secret for cron auth
NEXT_PUBLIC_FOUNDER_EMAIL=hello@fair-do.com                # DIFFERENT

# ---------------------------------------------------------
# Optional — Onfido credential checks (not live yet)
# ---------------------------------------------------------
# ONFIDO_API_TOKEN=...                                     # Leave unset until Onfido is integrated
```

**Generate VAPID keys** for Web Push:

```bash
npx web-push generate-vapid-keys
```

Run this locally and store both keys securely. Never regenerate these after launch — existing push subscriptions will break.

---

## Phase 3: Pre-launch Verification Checklist

Work through this in a staging deployment (e.g. a Vercel preview URL with test-mode credentials) before flipping to production.

### 3.1 Security

- [ ] `https://fair-do.com` loads over HTTPS with a valid certificate (check in browser and via [ssllabs.com](https://www.ssllabs.com/ssltest/))
- [ ] `http://fair-do.com` redirects to HTTPS (Vercel does this automatically)
- [ ] CSP headers are present — run `curl -I https://fair-do.com` and check for `Content-Security-Policy`
- [ ] Update CSP in `next.config.ts`: replace `clerk.faresay.com` references with the fair-do Clerk domain (e.g. `clerk.fair-do.com` or `fair-do.clerk.accounts.dev` depending on your Clerk config)
- [ ] `X-Frame-Options: SAMEORIGIN` is set
- [ ] Rate limiting is active — test the booking endpoint with repeated requests and confirm `429` responses
- [ ] Tutor DBS/credential verification flow is tested end-to-end in admin (manual review at launch; Onfido integration is deferred per `src/lib/credentials.ts`)
- [ ] Admin-only routes (`/admin/*`) are inaccessible to non-admin users
- [ ] No `.env` files are committed to the repository

### 3.2 Payments

- [ ] Stripe is in **test mode** — confirm `pk_test_` key is used in staging
- [ ] Tutor Connect Express onboarding flow completes (test with Stripe's test bank account details)
- [ ] `account.updated` webhook is received and `stripeOnboarded` is set to `true` in the database after completing test KYC
- [ ] Parent booking checkout completes — test card `4242 4242 4242 4242`
- [ ] `checkout.session.completed` webhook is received and the booking is created in the database
- [ ] Subscription checkout completes for Pro (£15/mo) and Studio (£45/mo) tiers
- [ ] Webhook signature verification is working — confirm invalid signatures return `400`
- [ ] Idempotency is working — replaying a `checkout.session.completed` event returns `200 Already processed` without creating duplicate records
- [ ] Refund flow tested: issue a refund in the Stripe Dashboard → `charge.refunded` webhook updates `payment.status` to `refunded`
- [ ] Stripe statement descriptor shows `FAIR-DO.COM` on test bank statements
- [ ] **Before going live**: switch all Stripe keys to live-mode equivalents (see §4 Go-live toggle)

### 3.3 Email

- [ ] SPF record is verified in Resend dashboard for `fair-do.com`
- [ ] DKIM record is verified in Resend dashboard
- [ ] Send a test email via Resend dashboard → confirm delivery and check `From:` shows `fair-do <hello@fair-do.com>`
- [ ] Booking confirmation email arrives with `.ics` calendar attachment
- [ ] Cancellation email arrives for both tutor and student
- [ ] Session reminder email arrives (trigger manually via the cron endpoint)
- [ ] Tutor approval email arrives
- [ ] No-show notice email arrives
- [ ] Ops alert email arrives at `ADMIN_EMAIL`
- [ ] Emails are not landing in spam — check [mail-tester.com](https://www.mail-tester.com) score (aim for 9+/10)

### 3.4 Video

- [ ] Daily.co room is created on booking confirmation (check `session.dailyRoomName` is populated in the database after a test booking)
- [ ] Meeting token is generated for both tutor and student
- [ ] Video room opens in the browser and both participants can join
- [ ] Room is private — accessing the room URL directly without a token is rejected
- [ ] Room expires correctly (3 hours after scheduled session time)
- [ ] `DAILY_API_KEY` is confirmed as the fair-do key, not Faresay's (if separate keys were created)

### 3.5 Authentication

- [ ] Sign-up creates a `User` row in the fair-do Neon database (via Clerk webhook → `/api/webhooks/clerk`)
- [ ] Clerk webhook signature is verified correctly
- [ ] Tutor onboarding flow assigns `THERAPIST` role (the role name is inherited from Faresay — confirm the fair-do UI uses tutor-appropriate copy)
- [ ] Student onboarding flow assigns `CLIENT` role
- [ ] Admin role can be assigned via the admin panel
- [ ] Session tokens are scoped to the fair-do Clerk application and are not accepted by Faresay

### 3.6 Data & Privacy

- [ ] Privacy Policy is live at `https://fair-do.com/privacy` — must be UK GDPR-compliant, covering data collected (names, emails, payment methods, session recordings if any), retention periods, lawful basis, and user rights
- [ ] Terms & Conditions are live at `https://fair-do.com/terms` — covering tutor obligations, parent/student obligations, cancellation policy, and platform fees
- [ ] Cookie consent banner is displayed on first visit (if using analytics/marketing cookies beyond strictly necessary)
- [ ] Plausible is cookieless by default — confirm no additional cookie consent is required for analytics
- [ ] ICO registration: confirm the business is registered with the ICO as a data controller (`ico.org.uk/registration`) — required if processing personal data of UK residents
- [ ] Children's data: if students under 13 may use the platform, an age gate or parental consent mechanism is required under UK GDPR Art. 8 and the Children's Code
- [ ] DBS checks: confirm the tutor verification workflow documents that tutors working with under-18s have an Enhanced DBS certificate — this is a legal requirement for regulated activity with children in the UK
- [ ] SENDATA: do not store special category data (learning disabilities, medical diagnoses) without explicit consent and a lawful basis under UK GDPR Art. 9

---

## Phase 4: Soft Launch Sequence

### Week 3: Founding Tutors Only

- Invite 5–10 hand-picked founding tutors
- Each tutor completes: profile → Stripe Connect onboarding → credential verification (admin manual review)
- Check that tutors can set availability, set rates, and generate student invite links
- Verify tutor subscription tiers work (Free tier, no payment required to start)
- Internal booking test: Joel books a session with a founding tutor, goes through full checkout, receives confirmation email, joins video room

**Success criteria**: at least 3 tutors are fully onboarded, verified, and have a live profile.

### Week 3–4: First Student Bookings

- Founding tutors invite their existing students via the invite link (`/api/practice/clients`)
- Students complete onboarding and book their first session
- Monitor Sentry for any errors during the first real bookings
- Monitor Stripe for payment flow integrity
- Gather tutor and student feedback on UX

**Success criteria**: at least 5 sessions booked and completed without manual intervention.

### Week 4: Open Waitlist

- Enable waitlist sign-up on the homepage (if not already live)
- Announce via founding tutors' own channels and any existing email list
- Do not open public tutor sign-up yet — maintain quality control by reviewing each new tutor manually
- Monitor Plausible for traffic patterns

### Week 4–5: Public Launch

- Open tutor sign-up publicly
- Announce via Product Hunt, social media, relevant UK tutoring/education communities
- Ensure customer support flow is in place (email `hello@fair-do.com` monitored)
- Confirm Stripe Live mode is active (see Go-live toggle below)

---

## Go-live Toggle

Switch each service from test/staging to production mode in this order:

| Service | What to switch | How |
|---|---|---|
| **Stripe** | Replace `pk_test_` / `sk_test_` keys with `pk_live_` / `sk_live_` in Vercel env vars | Stripe Dashboard → Developers → API keys → Reveal live key. Create a new webhook endpoint for `https://fair-do.com/api/webhooks/stripe` in live mode and update `STRIPE_WEBHOOK_SECRET`. Re-create the Products and Prices in live mode and update `STRIPE_PRICE_PRACTICE`, `STRIPE_PRICE_CLINIC`, `STRIPE_PRICE_PARENT_PORTAL`. |
| **Clerk** | Switch from development to production instance | Clerk Dashboard → switch the application to Production. Update `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY` with live keys. Re-add the webhook endpoint in the production instance and update `CLERK_WEBHOOK_SECRET`. |
| **Neon** | Already production — ensure SSL is enforced | Confirm `?sslmode=require` is in `DATABASE_URL`. |
| **Daily.co** | No test/live distinction — already production API | Confirm `fair-do.com` is in the allowed domains list. |
| **Resend** | Domain already verified — use production API key | Confirm `RESEND_API_KEY` is the production key (not a test key). Send a final test email. |
| **Sentry** | Set environment tag | In Vercel, set `SENTRY_ENVIRONMENT=production` (or rely on Vercel's automatic `VERCEL_ENV` detection). |
| **Upstash** | Already production | No action needed. |
| **Plausible** | Already live — just ensure the script is on every page | Verify page views appear in the Plausible dashboard after your first production visit. |
| **Cloudinary** | Already production | Confirm upload preset `fair-do-tutors` is active. |

**Final pre-go-live checks:**

- [ ] All Vercel environment variables updated to production values
- [ ] Trigger a fresh Vercel deployment (or redeploy) after updating env vars
- [ ] Visit `https://fair-do.com/api/health` — confirm 200 OK
- [ ] Make one live test booking with a real card (£1 session or use the lowest possible amount) and immediately refund it
- [ ] Confirm the booking confirmation email arrives from `hello@fair-do.com`
- [ ] Confirm Sentry receives the test event from `src/instrumentation.ts` init
- [ ] Confirm Plausible records a page view on the homepage
