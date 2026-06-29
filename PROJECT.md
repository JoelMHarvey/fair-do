# Faresay — Project Roadmap

Affordable UK therapy marketplace. 15% platform fee (vs BetterHelp's ~65%).
Clients pay less. Therapists earn more. Everyone wins.

**Domains:** faresay.com · faresay.co.uk (Cloudflare, 3yr, WHOIS private)
**Stack:** Next.js 16 · TypeScript · Tailwind v4 · Prisma 6 · Neon · Clerk v6 · Stripe Connect · Daily.co · Resend

---

## Status legend

- ✅ Done
- 🔄 In progress
- ⬜ Not started
- 🔴 Blocked

---

## Phase 1 — Legal & Admin

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1.1 | Domain registered (faresay.com + .co.uk) | ✅ | Cloudflare, 3yr, WHOIS private |
| 1.2 | Lawyer email sent (Harper James) | ✅ | GDPR + lawful basis consultation |
| 1.3 | Lawyer consultation completed | ⬜ | Article 6/9 basis, DPIA scope, DPAs |
| 1.4 | UKIPO class 44 trademark search — "Faresay" | ⬜ | Free at trademarks.ipo.gov.uk |
| 1.5 | Companies House — register Faresay Ltd | ⬜ | £50, SIC code TBD with lawyer |
| 1.6 | ICO registration (data controller) | ⬜ | ~£60/yr, Tier 2 |
| 1.7 | Data Processing Agreements with all vendors | ⬜ | Clerk, Stripe, Daily.co, Neon, Resend |
| 1.8 | Platform T&Cs drafted (lawyer) | ⬜ | ~£1,500–3,000 fixed fee |
| 1.9 | Therapist contractor agreement drafted | ⬜ | Independent contractor, PI insurance req. |
| 1.10 | Privacy notice drafted | ⬜ | Must cover special category (mental health) data |
| 1.11 | Crisis protocol documented | ⬜ | Samaritans/999 signposting, not a crisis service |

---

## Phase 2 — Technical Foundation

| # | Task | Status | Notes |
|---|------|--------|-------|
| 2.1 | Node v22 installed | ✅ | v22.22.0 |
| 2.2 | Next.js project scaffolded | ✅ | App Router, TypeScript, Tailwind |
| 2.3 | Prisma schema written | ✅ | User, Therapist, Client, Match, Session, Message, Payment |
| 2.4 | Clerk auth installed + configured | ✅ | clerk doctor all pass, middleware set |
| 2.5 | Neon database created + DATABASE_URL set | ✅ | eu-west-2, neondb |
| 2.6 | `prisma db push` — schema live | ✅ | Prisma 6.19.3, Node 20 LTS |
| 2.7 | Stripe account created (platform) | ⬜ | Enable Connect in dashboard |
| 2.8 | Daily.co account created | ⬜ | EU data residency enabled |
| 2.9 | Resend account + domain verified | ⬜ | faresay.com DNS records |
| 2.10 | All env vars populated in .env.local | 🔄 | Clerk + DB done; Stripe/Daily/Resend pending |
| 2.11 | Private GitHub repo created | ⬜ | faresay org, main branch protected |

---

## Phase 3 — Onboarding Flows

| # | Task | Status | Notes |
|---|------|--------|-------|
| 3.1 | Clerk webhook → create User record in DB | ✅ | `user.created` event, svix verification |
| 3.2 | Role selection page (`/onboarding`) | ✅ | "I need a therapist" / "I am a therapist" |
| 3.3 | Role saved to DB via API | ✅ | POST /api/onboarding/role, Zod-validated |
| 3.4 | **Client onboarding** — questionnaire | ✅ | reason, previous therapy, approach preference, days |
| 3.5 | **Client onboarding** — explicit GDPR consent | ✅ | Article 9 consent, v1.0, timestamped |
| 3.6 | **Client onboarding** — crisis safety screen | ✅ | Samaritans/999/111 signposting, checkbox required |
| 3.7 | **Therapist onboarding** — profile form | ✅ | Name, bio, session rate, specialisms, approaches |
| 3.8 | **Therapist onboarding** — credential entry | ✅ | Body/number/expiry (doc upload: phase 6) |
| 3.9 | **Therapist onboarding** — availability | ✅ | Per-day time range, Europe/London |
| 3.10 | **Therapist onboarding** — Stripe Connect | ✅ | Express account → hosted onboarding → complete page |
| 3.11 | Admin credential verification dashboard | ✅ | /admin — pending list + approve/reject buttons |
| 3.12 | Therapist approval email (Resend) | ✅ | Approval + rejection emails via Resend; email failure doesn't block action |

---

## Phase 4 — Core Features

| # | Task | Status | Notes |
|---|------|--------|-------|
| 4.1 | Therapist matching algorithm | ✅ | Score: specialism+50, approach+30, availability+20 |
| 4.2 | Therapist directory / match results page | ✅ | /therapists — ranked matches, bio, specialisms, book CTA |
| 4.3 | Booking flow — select slot | ✅ | /book/[id] — date picker from availability, time slots |
| 4.4 | Payment flow — Stripe checkout | ✅ | Checkout session with application_fee + Connect transfer |
| 4.5 | Stripe webhook — payment confirmed | ✅ | /api/webhooks/stripe — creates Payment record |
| 4.6 | Video sessions — Daily.co room creation | ✅ | Created in Stripe webhook on payment; expires +3h |
| 4.7 | Video session page (`/session/[id]`) | ✅ | Daily.co iframe, countdown, opens 10min early |
| 4.8 | Async messaging — thread per match | ✅ | /messages/[matchId] — thread auto-created, Enter to send |
| 4.9 | Session completion flow | ✅ | POST /api/session/[id]/complete — therapist only |
| 4.10 | Cancellation + refund | ✅ | POST /api/session/[id]/cancel — 24hr refund policy via Stripe |
| 4.11 | Therapist earnings dashboard | ✅ | /therapist/earnings — monthly + all-time, per-session table |

---

## Phase 5 — Dashboards & UX

| # | Task | Status | Notes |
|---|------|--------|-------|
| 5.1 | Client dashboard (`/dashboard`) | ✅ | Upcoming sessions, unread messages, therapist threads — real data |
| 5.2 | Therapist dashboard (`/therapist/dashboard`) | ✅ | Real counts: sessions, clients, month earnings; session list; message threads |
| 5.3 | Admin dashboard (`/admin`) | ✅ | Platform stats (clients, active therapists, sessions, revenue) + verification queue |
| 5.4 | Email notifications (Resend) | ✅ | Booking confirm (client+therapist), cancellation notice with refund status; 24hr reminder = future cron |
| 5.5 | Public therapist profiles | ✅ | /therapists/[id] — SEO metadata, JSON-LD, credential badge, book/signup CTA |
| 5.6 | Marketing homepage | ✅ | Hero, how-it-works (client+therapist), comparison table, footer with nav |
| 5.7 | /about, /faq, /privacy, /terms pages | ✅ | GDPR-aware privacy policy, crisis disclaimer in terms/FAQ |
| 5.8 | Mobile responsive (all pages) | ✅ | Tailwind sm: breakpoints throughout; test on real device before launch |

---

## Phase 6 — Security & Compliance

| # | Task | Status | Notes |
|---|------|--------|-------|
| 6.1 | GDPR consent flows audited | ⬜ | Lawyer sign-off on UX |
| 6.2 | DPIA completed | ⬜ | Required before go-live |
| 6.3 | Security headers (CSP, HSTS, etc.) | ✅ | next.config.ts — HSTS, X-Frame, CSP, Referrer-Policy, Permissions-Policy |
| 6.4 | Credential doc storage security | ⬜ | No upload yet — document upload is post-beta scope |
| 6.5 | Rate limiting on API routes | ✅ | In-memory limiter on /api/booking/create (5/min) and /api/messages/send (30/min) — upgrade to Redis pre-launch |
| 6.6 | Stripe webhook signature verification | ✅ | stripe.webhooks.constructEvent with STRIPE_WEBHOOK_SECRET |
| 6.7 | Clerk webhook signature verification | ✅ | svix header validation in /api/webhooks/clerk |
| 6.8 | No PHI in logs | ✅ | Audited — only Stripe/API error objects logged, no mental health data |

---

## Phase 7 — Beta Launch

| # | Task | Status | Notes |
|---|------|--------|-------|
| 7.1 | Recruit 15–25 BACP-registered therapists | ⬜ | BACP forums, r/therapists, LinkedIn |
| 7.2 | Onboard therapists, verify credentials | 🔄 | Manual review live (/admin). 6 demo therapists seeded (prisma/seed-therapists.mjs) to exercise directory/matching — delete before public launch. |
| 7.3 | Recruit 30–50 beta clients | ⬜ | Discounted rate, friends/network first |
| 7.4 | Beta feedback collection | ⬜ | Matching quality, session experience, payout timing |
| 7.5 | Fix critical issues from beta | ⬜ | |
| 7.6 | Therapist testimonials / trust signals | ✅ | Star reviews: client rates a past session; avg+count on cards & profile; recent comments on profile; batched in matching. |
| 7.7 | Production deployment (Vercel/Netlify) | ✅ | faresay.com live — full end-to-end verified on prod |

---

## Phase 8 — Growth (Post-launch)

| # | Task | Status | Notes |
|---|------|--------|-------|
| 8.1 | SEO content (anxiety, depression, relationships) | ✅ | /blog + 3 seed posts (need-therapy, anxiety, first-session) w/ JSON-LD, internal CTAs, crisis signpost |
| 8.2 | Therapist referral programme | ✅ | Therapists get a /r/CODE link; new therapist linked at onboarding (cookie or field); referrer earns £25 bonus once referee runs first paid session (idempotent, in webhook + credit path); ReferralLinkCard + earned/pending on therapist dashboard. Payout: with next Connect payout (admin). |
| 8.3 | Corporate EAP (Employee Assistance Programme) | ⬜ | B2B channel — bulk session packages |
| 8.4 | Group therapy sessions | ⬜ | Better margin, broader reach |
| 8.5 | iOS / Android native apps | ⬜ | After web is stable |
| 8.6 | BACP partnership / accreditation | ⬜ | Legitimacy signal |

---

## Phase 9 — Product Enhancements (current sprint)

| # | Task | Status | Notes |
|---|------|--------|-------|
| 9.1 | Design system + UI/UX overhaul | ✅ | Brand palette (brand/sand/coral), Fraunces+Inter, motion, Logo/Nav/Footer; homepage, onboarding (role+client), therapists, profile, booking, gift, dashboards (client/therapist/admin/earnings) all on-brand. |
| 9.2 | Simplified client onboarding | ✅ | 4 steps → 2 (matching essentials + combined safety/GDPR consent) |
| 9.3 | Discounted first session | ✅ | Therapist sets introRatePence; booking auto-applies on client's first session, shown on cards/profile |
| 9.4 | Therapist profile pages + external links | ✅ | /therapist/profile editor: photo, website, Psychology Today, LinkedIn, intro video, tagline. Surfaced on public profile. |
| 9.5 | Repeat-client / retention score | ✅ | `lib/metrics.ts` repeat-rate; "Clients keep coming back" badge (≥3 clients, ≥50% repeat) |
| 9.6 | Credits / vouchers / gift purchases | ✅ | /gift buy → Stripe → emailed code; /redeem → creditBalancePence; auto-applied at booking (no card if covered) |
| 9.7 | Group bookings (therapist-set discount) | ✅ | groupRatePence + groupMaxSize; seat selector; room sized to group; intro rate excluded for groups |
| 9.8 | Complaints procedure | ✅ | /complaints form (categories incl. safeguarding) → admin email + queue; admin resolve workflow |
| 9.9 | Observability (Sentry + uptime + analytics) | ✅ | Sentry wired (instrumentation + logError + withSentryConfig, inert until DSN) + /api/health. Add DSN env to activate; uptime monitor on /api/health. |
| 9.10 | Security hardening + DDOS protection | 🔄 | Headers + per-route rate limits done; Sentry for attack visibility. Cloudflare WAF/Turnstile = exact steps in docs/SECURITY.md (dashboard config). Redis + pen test before public launch. |
| 9.11 | Auto-validate therapist credentials | 🔄 | No public API exists; `lib/credentials.ts` seam + manual flow; Onfido identity-assurance documented |
| 9.12 | Corporate / B2B onboarding | ✅ | Org schema + /for-business + admin manager + email-domain auto-enrol + pool→credit→Stripe waterfall + per-org admin report + /org self-serve portal (pool, monthly usage table, CSV export, top-up). |
| 9.13 | US expansion feasibility | ✅ | Research complete — docs/SCALE-AND-EXPANSION.md: HIPAA, per-state licensing, separate entity. Defer to v2. |

---

## Phase 14 — Onboarding depth, content & growth

| # | Task | Status | Notes |
|---|------|--------|-------|
| 14.1 | Multi-select onboarding (reasons + approaches) | ✅ | Both now multi-select; matching scores across all; links to /styles + /about from onboarding |
| 14.2 | Session page re-skin + auto-refresh | ✅ | Brand tokens, Logo, room auto-poll, clearer setting-up state + support fallback |
| 14.3 | 90/85 messaging reconciled | ✅ | Founding 90% consistent across home, role card, therapist onboarding |
| 14.4 | Marketing kit | ✅ | docs/MARKETING.md — vision-led messaging, client+therapist hooks, magazine article draft, 4 short-form video scripts, contact-list sourcing, 6-week launch sequence |
| 14.5 | Deepen /styles (history/origins/how-it-works, layered) | ✅ | Each approach: origin, history, mechanism + "Go deeper" accordion with reputable external links (NHS, BACP, BABCP, UKCP, EMDR Assoc, etc.) |
| 14.6 | Therapist photo upload + adjust (drawing/blur) | ✅ | Cloudinary upload widget + Photo/Blurred/Illustrated styles; gated on NEXT_PUBLIC_CLOUDINARY_* (setup in docs/LAUNCH.md) |
| 14.7 | Re-skin therapist onboarding + complete page | ✅ | Brand tokens, Logo, display headings, founding-90% badge + "Why Faresay?" link |

---

## Phase 13 — Founding-member launch promo

| # | Task | Status | Notes |
|---|------|--------|-------|
| 13.1 | Per-therapist commission + founder rate | ✅ | Therapist.platformFeePercent (default 15); founders keep 90% (10% fee). Booking + webhook use it. |
| 13.2 | Auto-enrol founders during promo | ✅ | While FOUNDING_OFFER active, new therapists get founder rate + badge |
| 13.3 | Front-and-centre messaging | ✅ | Site-wide top bar + homepage + /for-therapists: "we're new, join early, share for more" |
| 13.4 | Founding-therapist badge | ✅ | Trust signal on profile/cards |

---

## Phase 12 — Discovery depth & Safety

| # | Task | Status | Notes |
|---|------|--------|-------|
| 12.1 | Emergency contacts / helplines page | ✅ | /help — 999 banner + 24/7 lines (Samaritans, SHOUT, NHS 111) + specialised (Papyrus, CALM, Mind, Refuge); tap-to-call; linked in footer on every page. |
| 12.2 | "Understanding therapy styles" page | ✅ | /styles — CBT, psychodynamic, person-centred, EMDR, mindfulness, integrative explained (what it is / helps with / how a session feels); nav + footer links |
| 12.3 | Language-spoken filter | ✅ | Therapist.languages; profile multi-select; /therapists filter + card/profile display |
| 12.4 | Availability calendar (aggregate) | ✅ | /availability — 7-day × hourly grid of free-therapist counts (region/state-scoped); tap slot → bookable list |

---

## Phase 11 — Portal, Discovery & Mission

| # | Task | Status | Notes |
|---|------|--------|-------|
| 11.1 | Org self-serve portal | ✅ | /org — contact/domain-member sees pool, spend (month+all-time), members, discount; privacy-safe aggregate only; self top-up via Stripe (org_topup webhook) |
| 11.2 | Therapist rate percentile | ✅ | Editable standard rate in profile editor with live percentile bar — "cheaper than X% of therapists", median, band (budget/mid/premium) |
| 11.3 | Therapist discovery filters (soonest + cheapest) | ✅ | /therapists sort tabs: Best match / Cheapest / Soonest; next-available computed from availability, shown per card |
| 11.4 | Mission-driven About page | ✅ | Technologists with a heart; therapists paid fairly; access for more; no profiting from suffering |

---

## Phase 10 — Bookings, Trust & Growth (current sprint)

| # | Task | Status | Notes |
|---|------|--------|-------|
| 10.1 | Booking email: calendar invite + reminder + cancel link | ✅ | .ics attached to confirm emails (client+therapist) w/ 30-min alarm; cancel link in confirm + reminder; hourly Vercel cron sends 24h reminder (CRON_SECRET-guarded, reminderSentAt guard) |
| 10.2 | Cancel session from dashboard + refund warning | ✅ | Cancel button on /session/[id]; confirm dialog warns "non-refundable within 24h" vs "full refund"; calls cancel API |
| 10.3 | Dashboard → home link | ✅ | Explicit Home + Find-a-therapist links in client/therapist dashboard navs |
| 10.4 | Gift "how it works" + sensitive framing | ✅ | 3-step explainer + "a gentle word" note (private redemption, no pressure) |
| 10.5 | Credential-check audit trail | ✅ | CredentialCheck record on every approve/reject — admin clerkId, body, number, method, result, notes, timestamp (immutable) |
| 10.6 | Admin menu visible when admin signed in | ✅ | SiteNav role-aware shows Admin link; /dashboard redirects ADMIN → /admin |
| 10.7 | Referral discounts (clients + therapists) | ✅ | /r/CODE link → cookie → referee gets £10 signup credit; referrer gets £10 when referee books (idempotent, in booking + webhook); ReferralCard on dashboard |
| 10.8 | Company onboarding discount | ✅ | New orgs auto-get 10% off for 30 days; applied at booking; "10% off first month" hook on /for-business |

---

## Env var checklist

```
DATABASE_URL                          # Neon PostgreSQL
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY     # Clerk
CLERK_SECRET_KEY                      # Clerk (server only)
NEXT_PUBLIC_CLERK_SIGN_IN_URL         # /sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL         # /sign-up
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL   # /dashboard
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL   # /onboarding
CLERK_WEBHOOK_SECRET                  # svix secret from Clerk dashboard
STRIPE_SECRET_KEY                     # server only
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
STRIPE_WEBHOOK_SECRET
PLATFORM_FEE_PERCENT                  # 15
DAILY_API_KEY
RESEND_API_KEY
NEXT_PUBLIC_APP_URL                   # https://faresay.com (or localhost:3000)
```

---

## Economics summary

| | BetterHelp | Faresay |
|---|---|---|
| Client pays / week | £55–80 | £40–55 |
| Therapist gets / session | ~£24 (~35%) | ~£42–47 (85%) |
| Platform fee | ~65% | 15% |

---

## Key decisions log

| Date | Decision | Rationale |
|------|----------|-----------|
| Jun 2026 | Name: Faresay | Invented word, no conflicts, encodes fair + say |
| Jun 2026 | Domains: Cloudflare, 3yr, WHOIS private | Cost price, privacy from day 1 |
| Jun 2026 | Platform fee: 15% | Sustainable at scale, 4× fairer than BetterHelp |
| Jun 2026 | UK-only launch | GDPR not HIPAA, known regulatory environment |
| Jun 2026 | Therapists: independent contractors | Standard model, requires own PI insurance |
| Jun 2026 | Stripe Connect Express | Fastest therapist onboarding, Stripe handles KYC |
| Jun 2026 | Daily.co for video | GDPR-compliant, EU data residency, simple embed |
| Jun 2026 | Clerk for auth | Already familiar, handles both user types cleanly |

<!-- deploy check: phase9-routes -->

---

## Phase 15 — US expansion (foundation in parallel with UK legal)

| # | Task | Status | Notes |
|---|------|--------|-------|
| 15.1 | US plan documented | ✅ | docs/US-EXPANSION-PLAN.md — per-state licensing + HIPAA are the real differences; launch 1 state, cash-pay, separate US entity |
| 15.2 | Region data model | ✅ | Region enum (UK/US); Therapist.country + licenseState; Client.country + usState (all default UK — inert for current site) |
| 15.3 | Locale lib | ✅ | lib/locale.ts — per-region currency, crisis lines (988/Crisis Text Line for US), credential bodies (LPC/LCSW/LMFT…), US_STATES, formatMoney |
| 15.4 | State-aware matching | ✅ | US clients only match in-state licensed therapists; UK unchanged |
| 15.5 | Region-aware /help + crisis screens | ✅ | /help driven by lib/locale — 988/Crisis Text/SAMHSA for US, UK lines for UK |
| 15.6 | Region-aware currency in UI | ✅ | £/$ via therapist.country on cards, profile, booking, earnings (ProfileForm percentile median = minor follow-up) |
| 15.7 | US therapist onboarding (state + license body) | ✅ | US license bodies (LPC/LCSW/LMFT/LMHC/PsyD) + state picker + $ breakdown |
| 15.8 | US client onboarding (state capture) | ✅ | Required state dropdown when region=US; stored for in-state matching |
| 15.9 | HIPAA BAAs + Stripe US + US entity | 🔴 | Legal/ops gated — see plan Phase B |

### US — NY-first launch + full-coverage scaling

| # | Task | Status | Notes |
|---|------|--------|-------|
| 15.10 | Launch-state gate (NY first) | ✅ | LAUNCH_US_STATES=['NY'] (or NEXT_PUBLIC_ACTIVE_US_STATES); onboarding dropdowns + server guards restrict to live states; add a code to expand coverage |
| 15.11 | US/NY legal pathway documented | ✅ | docs/US-LEGAL-NY.md — CPOM, NY licensing (LMHC/LCSW/LMFT/Psych), HIPAA BAAs, SHIELD/MHL, telehealth consent, entity/bank/Stripe-US; "how to trigger" table + PSYPACT/Counseling-Compact scaling |
| 15.12 | NY legal execution | 🔴 | Engage NY healthcare attorney (CPOM + docs) · US entity + EIN + bank · Stripe US · HIPAA BAAs · NYSED verification |
| 15.13 | Multi-state therapist licensing (scale) | ⬜ | Migrate Therapist.licenseState → licenseStates[] for PSYPACT/Compact holders; match client.usState ∈ licenseStates |
