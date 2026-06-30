# fair-do — Technical Specification

**The canonical technical reference for fair-do.** Generated from the codebase; the repo is the source of truth. See `docs/INBOX-AGENT-SPEC.md`, `NATIVE-APP-SPEC.md`, `CLINIC-PLAN.md`, `I18N-PLAN.md`, `TEST-PLAN.md`, `CREDENTIAL-VERIFICATION.md`, `SECURITY.md`, `STRIPE-GOLIVE.md`, `LAUNCH.md` for deep dives. Live diagrams: `/founder/architecture`.

---

## 1. Product

fair-do is a **UK B2B SaaS practice-management tool that tutors subscribe to**. They manage their own students, take secure video lessons, get paid, and stay compliant.

- **Business model:** a monthly **subscription** (**Free £0 · Pro £29 · School £79 · Enterprise custom**). No commission — tutors keep 100% of every lesson; the only per-lesson cost is Stripe's standard card-processing fee, which fair-do keeps none of. `MARKETPLACE_COMMISSION_BPS = 0` in `src/lib/billing.ts`.
- **Data roles:** the **tutor is the data controller**; **fair-do is the processor**. Students/records belong to the tutor.
- **Status:** pre-launch / onboarding first tutors. Public student booking is gated off; the tutor portal is the active path.

---

## 2. Architecture (at a glance)

```
Clients (web browser · Expo mobile app)
   → Clerk middleware (proxy.ts): cookie (web) + bearer (mobile)
   → Next.js 16 App Router on Vercel
        RSC pages · 63 API routes · /api/mobile/v1 read API · webhooks · 6 cron jobs · 55 lib modules
   → Prisma 6 → Neon Postgres (34 models)
External: Stripe Connect · Daily.co · Resend · Twilio · Anthropic · Cloudinary · Plausible · IMAP · Upstash · Sentry · Turnstile
```

Render it interactively (6 diagrams incl. full DB schema) at **`/founder/architecture`**.

---

## 3. Stack

| Layer | Tech |
|------|------|
| Framework | **Next.js 16.2.9** (App Router, Turbopack), **React 19** |
| Language | TypeScript (strict) |
| ORM / DB | **Prisma 6.19** → **Neon Postgres** (serverless, eu-west-2) |
| Auth | **Clerk v7** (`@clerk/nextjs`) |
| Payments | **Stripe 22** (Connect, destination charges) |
| Video | **Daily.co** (`@daily-co/daily-js`) |
| Email | **Resend 6** |
| SMS | **Twilio** |
| Web push | **web-push** (VAPID) |
| AI | **Anthropic SDK 0.106** (`claude-sonnet-4-6`) — inbox agent |
| Inbound mail | **imapflow** + **mailparser** — inbox agent |
| Rate limiting | **Upstash Redis** (fallback in-memory) |
| Bot defence | **Cloudflare Turnstile** |
| Analytics | **Plausible** |
| Images | **Cloudinary** (unsigned upload widget) |
| Errors | **Sentry** (web + native) |
| Validation | **zod 4** |
| Mobile | **Expo / React Native** (`/native`) |
| Hosting | **Vercel** (cron, edge), Neon DB |

**Schema workflow:** `prisma db push` (no `migrations/` dir) — additive changes pushed per environment at deploy. The native app is excluded from the backend `tsconfig`.

---

## 4. Data model (34 models)

Hub-and-spoke around **`Match`** (a tutor↔student relationship).

- **Identity:** `User` (Clerk id, role) → `Teacher` **or** `Student` (1:1). `Organisation` pools corporate `Student`s.
- **Teacher:** `Availability`, `Subscription` (tier + `commissionBps`), `CredentialCheck` (audit), `StudentInvite`, `Package`, `Broadcast`, `BroadcastTemplate`, `TeacherReferral`.
- **Match:** `Session`, `MessageThread`→`Message`, `StudentDocument`, `StudentForm`, `LessonNote`.
- **Session:** `Payment` (1:1), `Review` (1:1), `SessionParticipant`; `slotKey @unique` (double-book guard), `guestToken @unique` (magic-link room access), `dailyRoomName/Url`.
- **Money:** `Payment` (amount, `platformFeePence`, `teacherPayoutPence`, `transferred`, currency), `GiftVoucher`, `Referral`.
- **Ops/standalone:** `FxRate`, `CronRun`, `AlertState`, `ProcessedStripeEvent`, `PendingSelfBooking`, `PushSubscription`, `NativeDevice`, `Setting` (runtime toggles), `InboxMessage` (inbox-agent audit), `Complaint`.

---

## 5. Auth & access control

- **Clerk** for identity; middleware in **`src/proxy.ts`** (`clerkMiddleware` + a **public-route allowlist**). Protected routes call `auth.protect()`.
- **Web** uses Clerk cookies; **mobile** sends `Authorization: Bearer <clerk-jwt>` (`src/lib/mobile-auth.ts` resolves it to the Teacher).
- **Roles** (`UserRole`): `STUDENT` · `TEACHER` · `ADMIN`. Admin pages (`/admin*`) gate on `user.role === 'ADMIN'`.
- **Founder portal** (`/founder*`) is gated by **email** (`FOUNDER_EMAIL`, default `joelmharvey@gmail.com`) via `isFounder()` — separate from the ADMIN role. The nav shows a "Docs" link only to the founder.
- **Token-gated public routes** (no account): self-book magic link (`?k=guestToken`, constant-time compare), intake forms, ICS calendar feed, self-book confirm.

---

## 6. Payments

Two money layers:

**A. Subscription (tutor → fair-do).** Stripe subscription per tutor; tier (Free/Pro/School) sets feature access. Synced via the Stripe webhook (`customer.subscription.*`, `checkout.session.completed type=practice_subscription`).

**B. Lesson payments (student → tutor).**
- **Card:** Stripe Checkout **destination charge** — `application_fee_amount` = commission (0% own students, 10% marketplace), `transfer_data.destination` = tutor's Connect account. The webhook (`checkout.session.completed`) creates the `Payment` + Daily room + emails. `Payment.transferred` records whether the charge actually transferred.
- **Internal:** corporate **org credit pool** or personal **credit balance** — atomic conditional decrement, no Stripe.
- **Double-book guard:** `Session.slotKey` (`teacherId:ISO`, unique, nulled on cancel) — concurrent bookings lose with a clean 409.
- **Refunds (`src/lib/refund.ts`):** card → Stripe refund with `reverse_transfer`/`refund_application_fee` **only when `transferred`**; internal → restore the org pool / personal credit.
- **Webhook idempotency:** `ProcessedStripeEvent` claims each event; a handler failure calls `rollbackAndRetry` to delete the claim so Stripe re-delivers (never "charged but unprovisioned").
- **Connect gate:** booking refuses to charge a tutor whose account isn't `charges_enabled`; `stripeOnboarded` (set by `account.updated`) gates bookability + directory listing.

---

## 7. Booking & lessons

- **Tutor-initiated** (`/api/practice/booking`): single / weekly series / package draw-down; online (Stripe) or offline.
- **Student self-pay** (`/api/booking/create`): gated by **`BOOKINGS_ENABLED`**; intro rate, group seats, org/credit funding.
- **Public self-booking** (`/p/[slug]` → `/api/practice/self-book`): rate-limited + Turnstile, **double opt-in** by default (`PendingSelfBooking` + email confirm), slot validated **in the tutor's `Availability.timezone`** (not server-local). Account-less students reach the room via a signed `?k=` magic link.
- **Video:** Daily.co room per lesson; identified meeting tokens attribute joins (student vs tutor); room opens 10 min before; Daily webhook records join/no-show data.
- **Lifecycle:** cancellation (24h refund rule / tutor-always-refundable), no-show detection + refund (cron), reviews after the lesson.

---

## 8. Credential verification

Sign-up → `onboarding/teacher` (teaching credential type/number/expiry — QTS/QTLS/PGCE — DBS check, insurance, rates) → **PENDING** → admin at `/admin` opens the relevant teaching register (DfE Teaching Regulation Agency / GTCS / qualified-teacher registers) + a 4-point checklist → **Approve** (writes immutable `CredentialCheck`, sets `ACTIVE` + `credentialVerified`, emails) → Stripe Connect onboarding → **bookable**, or **Reject** (SUSPENDED). The **credentials cron** then monitors credential + DBS + insurance expiry: nudge at 60/30/14/7/1 days, 14-day grace, then auto-suspend. SOP: `docs/CREDENTIAL-VERIFICATION.md`.

---

## 9. Communications

- **Email — Resend** (`src/lib/email.ts`, ~16 templates). A `sendEmail()` wrapper **throws on Resend's `{error}`** so failures aren't swallowed. `RESEND_FROM` is the send identity.
- **SMS — Twilio** (reminders; messaging-service or from-number).
- **Web push — VAPID** (`web-push`); native APNs/FCM planned (`NativeDevice`).
- **Inbox agent** (`docs/INBOX-AGENT-SPEC.md`): a cron polls `support@/hello@/enquiries@` over IMAP, triages each message with Anthropic, then **drafts / sends / escalates** per a staged autonomy level (`off → draft → ack → assist`, a DB `Setting`, **off by default**, toggled on `/admin/health`). Serious mail (safeguarding/legal/GDPR/refund) always escalates to the founder and is never auto-replied. Audit in `InboxMessage`.

---

## 10. Background jobs (Vercel Cron, `CRON_SECRET`-gated)

`reminders` (hourly) · `no-shows` (15 past hour) · `credentials` (daily) · `alerts` (15 min — pages founder on threshold breach via `AlertState`) · `fx` (daily FX rates) · `inbox` (5 min — inbox agent, no-op while off). Each records a `CronRun`.

**Webhooks:** Stripe · Clerk (`user.created`) · Daily — all signature-verified.

---

## 11. Mobile app (`/native`)

Expo / React Native tutor app. Clerk Expo auth → `Authorization: Bearer` → the **`/api/mobile/v1/*`** read API (`dashboard`, `clients`, `clients/[matchId]`, `calendar`, `availability`, `earnings`, `profile`), scoped per tutor. Sentry with PII scrubbing. Full plan + remaining work: `docs/NATIVE-APP-SPEC.md`.

---

## 12. Feature flags

- **`BOOKINGS_ENABLED`** — public student self-pay booking (off pre-launch).
- **`PRACTICE_PORTAL_ENABLED`** — tutor portal + self-booking.
- **`NEXT_PUBLIC_DIRECTORY_ENABLED`** — public tutor directory (off; noindex; onboarding routes cold students to their tutor's invite instead).
- **`inbox_agent_level`** — runtime DB `Setting` (off/draft/ack/assist).
- **`SELFBOOK_REQUIRE_CONFIRM`** — double opt-in (default on).
- Gap-closer flags (compliance/progress-reports/AI-assist/clinics) live on the `epic/gap-closers` branch.

---

## 13. Security & compliance

- **UK GDPR:** student data — often relating to **children** — needs heightened protection; tutor = controller, fair-do = processor. Minimised retention, per-tutor data isolation, safeguarding-aware handling in the inbox agent + mobile app.
- **Headers/CSP:** `next.config.ts` — strict CSP (allow-lists Clerk, Stripe, Daily, Plausible, Turnstile, Cloudinary widget), HSTS, X-Frame-Options, etc.
- **Bot/abuse:** Turnstile on public mutating endpoints; Upstash rate limiting.
- **Secrets:** server-only (Clerk/Stripe/Resend/Twilio/Anthropic keys never `NEXT_PUBLIC_`); `.env*` gitignored.
- See `docs/SECURITY.md`. Outstanding: full security/IDOR re-audit (mobile API widened the surface), Cloudflare WAF, Upstash for prod rate limiting.

---

## 14. Observability

`/admin/health` + `/founder/health` render `collectMetrics()` (`src/lib/monitoring.ts`): DB up/latency, endpoint health, cron freshness (`CronRun`), counts, revenue. The **alerts cron** emails the founder on breach (dedup via `AlertState`). Plausible for product analytics (UTM-tagged campaigns); Sentry for errors. `/api/metrics` (token-gated) + `/api/health` for external monitors.

---

## 15. Environments & config

Hosted on **Vercel** (Node 20); DB on **Neon**. Key env vars by service:

- **Core:** `NEXT_PUBLIC_APP_URL`, `DATABASE_URL`, `NODE_ENV`
- **Clerk:** `CLERK_SECRET_KEY`, `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_WEBHOOK_SECRET`
- **Stripe:** `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_PRO`, `STRIPE_PRICE_SCHOOL`, `STRIPE_PRICE_PARENT_PORTAL`
- **Daily:** `DAILY_API_KEY`, `DAILY_WEBHOOK_SECRET`
- **Email/SMS/push:** `RESEND_API_KEY`, `RESEND_FROM`, `ALERT_EMAIL`, `COMPLAINTS_EMAIL`, `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM`/`TWILIO_MESSAGING_SERVICE_SID`, `VAPID_PUBLIC_KEY`/`VAPID_PRIVATE_KEY`/`VAPID_SUBJECT`
- **Inbox agent:** `ANTHROPIC_API_KEY`, `IMAP_HOST/PORT/USER/PASSWORD/MAILBOX`
- **Infra:** `CRON_SECRET`, `METRICS_TOKEN`, `UPSTASH_REDIS_REST_URL/TOKEN`, `SENTRY_DSN`/`NEXT_PUBLIC_SENTRY_DSN`
- **Other:** `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`/`_UPLOAD_PRESET`, `TURNSTILE_SECRET_KEY`/`NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `PLAUSIBLE_*`, `FOUNDER_EMAIL`, feature flags above.

Go-live env checklist: `docs/STRIPE-GOLIVE.md` + `docs/LAUNCH.md`.

---

## 16. Testing

- **Vitest** — unit (pure logic: commission, refund, slots/timezone, inbox `decideAction`) + integration (API routes against a test DB; webhook idempotency, booking, mobile-API IDOR, cron).
- **Playwright** — E2E happy paths.
- **Native** — `tsc --noEmit`.
- CI (GitHub Actions): TypeScript · Unit/Integration/Native · Vercel build, on every PR. Plan + coverage targets: `docs/TEST-PLAN.md`.

---

## 17. Repo layout

```
src/app/            App Router — pages, /api routes, /api/mobile/v1, /api/cron, /api/webhooks
src/lib/            55 modules — prisma, stripe, billing, refund, practice, matching, slots,
                    daily, email, sms, push, credentials, inbox-agent, settings, monitoring, …
src/components/     shared UI (SiteNav, HealthDashboard, …)
prisma/schema.prisma  34 models (db push, no migrations dir)
native/             Expo React Native app (separate tsconfig)
docs/               specs + plans + runbooks (this file, SECURITY, LAUNCH, UAT, plans…)
public/brand/       brand kit (served on /founder/brand)
.claude/skills/faresay-design/   the design system (tokens, social kit, guidelines)
```

---

## 18. Roadmap & known gaps

- **Native app** — foundation merged; M1–M4 to build (`NATIVE-APP-SPEC.md`).
- **Clinics** — multi-tutor; foundation on draft `feat/clinic-multi-therapist`; payment/commission/testing plan in `CLINIC-PLAN.md`.
- **i18n** — FR/DE/IT plan in `I18N-PLAN.md` (Phase 0 in progress).
- **US expansion** — `US-EXPANSION-PLAN.md`.
- **Hardening before paid bookings:** gate matching on `stripeOnboarded`, managed-student reconciliation, internal-credit→tutor payout (latent), full security/IDOR re-audit.
- **Operator config to go live:** Stripe live keys, `CRON_SECRET`, Resend domain + `RESEND_FROM`, Twilio sender, `ANTHROPIC_API_KEY` + IMAP (to enable the inbox agent), ICO registration number.
</content>
</invoke>
