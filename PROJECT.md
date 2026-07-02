# fair-do — Project Roadmap

Affordable UK tutoring platform for independent tutors. Tutors keep **100% on their own students**; **10% commission only on marketplace (directory-sourced) bookings**. Subscription tiers: **Free £0 · Pro £29 · School £79**. *(Current model — earlier phases below describe a superseded flat 15% platform fee.)*
Students pay less. Tutors earn more. Everyone wins.

**Domains:** fair-do.com · fair-do.co.uk (Cloudflare, 3yr, WHOIS private)
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
| 1.1 | Domain registered (fair-do.com + .co.uk) | ✅ | Cloudflare, 3yr, WHOIS private |
| 1.2 | Lawyer email sent (Harper James) | ✅ | GDPR + lawful basis consultation |
| 1.3 | Lawyer consultation completed | ⬜ | Article 6 basis, DPIA scope, DPAs |
| 1.4 | UKIPO class 41 trademark search — "fair-do" | ⬜ | Free at trademarks.ipo.gov.uk |
| 1.5 | Companies House — Faresay Ltd exists; register the fair-do trading name | ⬜ | £50, SIC code TBD with lawyer |
| 1.6 | ICO registration (data controller) | ⬜ | ~£60/yr, Tier 2 |
| 1.7 | Data Processing Agreements with all vendors | ⬜ | Clerk, Stripe, Daily.co, Neon, Resend |
| 1.8 | Platform T&Cs drafted (lawyer) | ⬜ | ~£1,500–3,000 fixed fee |
| 1.9 | Tutor contractor agreement drafted | ⬜ | Independent contractor, PI insurance req. |
| 1.10 | Privacy notice drafted | ⬜ | Must cover children's personal data (many students are under 18) |
| 1.11 | Safeguarding protocol documented | ⬜ | DBS checks + escalation routes for concerns about a child's welfare |

---

## Phase 2 — Technical Foundation

| # | Task | Status | Notes |
|---|------|--------|-------|
| 2.1 | Node v22 installed | ✅ | v22.22.0 |
| 2.2 | Next.js project scaffolded | ✅ | App Router, TypeScript, Tailwind |
| 2.3 | Prisma schema written | ✅ | User, Teacher, Student, Match, Session, Message, Payment |
| 2.4 | Clerk auth installed + configured | ✅ | clerk doctor all pass, middleware set |
| 2.5 | Neon database created + DATABASE_URL set | ✅ | eu-west-2, neondb |
| 2.6 | `prisma db push` — schema live | ✅ | Prisma 6.19.3, Node 20 LTS |
| 2.7 | Stripe account created (platform) | ⬜ | Enable Connect in dashboard |
| 2.8 | Daily.co account created | ⬜ | EU data residency enabled |
| 2.9 | Resend account + domain verified | ⬜ | fair-do.com DNS records |
| 2.10 | All env vars populated in .env.local | 🔄 | Clerk + DB done; Stripe/Daily/Resend pending |
| 2.11 | Private GitHub repo created | ⬜ | fair-do org, main branch protected |

---

## Phase 3 — Onboarding Flows

| # | Task | Status | Notes |
|---|------|--------|-------|
| 3.1 | Clerk webhook → create User record in DB | ✅ | `user.created` event, svix verification |
| 3.2 | Role selection page (`/onboarding`) | ✅ | "I need a tutor" / "I am a tutor" |
| 3.3 | Role saved to DB via API | ✅ | POST /api/onboarding/role, Zod-validated |
| 3.4 | **Student onboarding** — questionnaire | ✅ | subjects, level, goals, days |
| 3.5 | **Student onboarding** — explicit GDPR consent | ✅ | Article 6 consent, v1.0, timestamped |
| 3.6 | **Student onboarding** — safeguarding notice | ✅ | Safeguarding signposting (under-18s), checkbox required |
| 3.7 | **Tutor onboarding** — profile form | ✅ | Name, bio, lesson rate, subjects, teaching styles |
| 3.8 | **Tutor onboarding** — credential entry | ✅ | Body/number/expiry (doc upload: phase 6) |
| 3.9 | **Tutor onboarding** — availability | ✅ | Per-day time range, Europe/London |
| 3.10 | **Tutor onboarding** — Stripe Connect | ✅ | Express account → hosted onboarding → complete page |
| 3.11 | Admin credential verification dashboard | ✅ | /admin — pending list + approve/reject buttons |
| 3.12 | Tutor approval email (Resend) | ✅ | Approval + rejection emails via Resend; email failure doesn't block action |

---

## Phase 4 — Core Features

| # | Task | Status | Notes |
|---|------|--------|-------|
| 4.1 | Tutor matching algorithm | ✅ | Score: subject+50, level+30, availability+20 |
| 4.2 | Tutor directory / match results page | ✅ | /tutors — ranked matches, bio, subjects, book CTA |
| 4.3 | Booking flow — select slot | ✅ | /book/[id] — date picker from availability, time slots |
| 4.4 | Payment flow — Stripe checkout | ✅ | Checkout session with application_fee + Connect transfer |
| 4.5 | Stripe webhook — payment confirmed | ✅ | /api/webhooks/stripe — creates Payment record |
| 4.6 | Video lessons — Daily.co room creation | ✅ | Created in Stripe webhook on payment; expires +3h |
| 4.7 | Video lesson page (`/session/[id]`) | ✅ | Daily.co iframe, countdown, opens 10min early |
| 4.8 | Async messaging — thread per match | ✅ | /messages/[matchId] — thread auto-created, Enter to send |
| 4.9 | Lesson completion flow | ✅ | POST /api/session/[id]/complete — tutor only |
| 4.10 | Cancellation + refund | ✅ | POST /api/session/[id]/cancel — 24hr refund policy via Stripe |
| 4.11 | Tutor earnings dashboard | ✅ | /teacher/earnings — monthly + all-time, per-lesson table |

---

## Phase 5 — Dashboards & UX

| # | Task | Status | Notes |
|---|------|--------|-------|
| 5.1 | Student dashboard (`/dashboard`) | ✅ | Upcoming lessons, unread messages, tutor threads — real data |
| 5.2 | Tutor dashboard (`/teacher/dashboard`) | ✅ | Real counts: lessons, students, month earnings; lesson list; message threads |
| 5.3 | Admin dashboard (`/admin`) | ✅ | Platform stats (students, active tutors, lessons, revenue) + verification queue |
| 5.4 | Email notifications (Resend) | ✅ | Booking confirm (student+tutor), cancellation notice with refund status; 24hr reminder = future cron |
| 5.5 | Public tutor profiles | ✅ | /tutors/[id] — SEO metadata, JSON-LD, credential badge, book/signup CTA |
| 5.6 | Marketing homepage | ✅ | Hero, how-it-works (student+tutor), comparison table, footer with nav |
| 5.7 | /about, /faq, /privacy, /terms pages | ✅ | GDPR-aware privacy policy, safeguarding statement in terms/FAQ |
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
| 6.8 | No sensitive data in logs | ✅ | Audited — only Stripe/API error objects logged, no student personal data |

---

## Phase 7 — Beta Launch

| # | Task | Status | Notes |
|---|------|--------|-------|
| 7.1 | Recruit 15–25 QTS-qualified tutors | ⬜ | Teaching forums, r/tutoring, LinkedIn |
| 7.2 | Onboard tutors, verify credentials | 🔄 | Manual review live (/admin). 6 demo tutors seeded (prisma/seed-therapists.mjs) to exercise directory/matching — delete before public launch. |
| 7.3 | Recruit 30–50 beta students | ⬜ | Discounted rate, friends/network first |
| 7.4 | Beta feedback collection | ⬜ | Matching quality, lesson experience, payout timing |
| 7.5 | Fix critical issues from beta | ⬜ | |
| 7.6 | Tutor testimonials / trust signals | ✅ | Star reviews: student rates a past lesson; avg+count on cards & profile; recent comments on profile; batched in matching. |
| 7.7 | Production deployment (Vercel/Netlify) | ✅ | fair-do.com live — full end-to-end verified on prod |

---

## Phase 8 — Growth (Post-launch)

| # | Task | Status | Notes |
|---|------|--------|-------|
| 8.1 | SEO content (GCSE revision, exam prep, study skills) | ✅ | /blog + 3 seed posts (need-a-tutor, exam-prep, first-lesson) w/ JSON-LD, internal CTAs, safeguarding note |
| 8.2 | Tutor referral programme | ✅ | Tutors get a /r/CODE link; new tutor linked at onboarding (cookie or field); referrer earns £25 bonus once referee runs first paid lesson (idempotent, in webhook + credit path); ReferralLinkCard + earned/pending on tutor dashboard. Payout: with next Connect payout (admin). |
| 8.3 | Schools & tutoring agencies (B2B) | ⬜ | B2B channel — bulk lesson packages |
| 8.4 | Group lessons | ⬜ | Better margin, broader reach |
| 8.5 | iOS / Android native apps | ⬜ | After web is stable |
| 8.6 | The Tutors' Association partnership / accreditation | ⬜ | Legitimacy signal |

---

## Phase 9 — Product Enhancements (current sprint)

| # | Task | Status | Notes |
|---|------|--------|-------|
| 9.1 | Design system + UI/UX overhaul | ✅ | Brand palette (brand/sand/coral), Fraunces+Inter, motion, Logo/Nav/Footer; homepage, onboarding (role+student), tutors, profile, booking, gift, dashboards (student/tutor/admin/earnings) all on-brand. |
| 9.2 | Simplified student onboarding | ✅ | 4 steps → 2 (matching essentials + combined safeguarding/GDPR consent) |
| 9.3 | Discounted first lesson | ✅ | Tutor sets introRatePence; booking auto-applies on student's first lesson, shown on cards/profile |
| 9.4 | Tutor profile pages + external links | ✅ | /teacher/profile editor: photo, website, LinkedIn, intro video, tagline. Surfaced on public profile. |
| 9.5 | Repeat-student / retention score | ✅ | `lib/metrics.ts` repeat-rate; "Students keep coming back" badge (≥3 students, ≥50% repeat) |
| 9.6 | Credits / vouchers / gift purchases | ✅ | /gift buy → Stripe → emailed code; /redeem → creditBalancePence; auto-applied at booking (no card if covered) |
| 9.7 | Group bookings (tutor-set discount) | ✅ | groupRatePence + groupMaxSize; seat selector; room sized to group; intro rate excluded for groups |
| 9.8 | Complaints procedure | ✅ | /complaints form (categories incl. safeguarding) → admin email + queue; admin resolve workflow |
| 9.9 | Observability (Sentry + uptime + analytics) | ✅ | Sentry wired (instrumentation + logError + withSentryConfig, inert until DSN) + /api/health. Add DSN env to activate; uptime monitor on /api/health. |
| 9.10 | Security hardening + DDOS protection | 🔄 | Headers + per-route rate limits done; Sentry for attack visibility. Cloudflare WAF/Turnstile = exact steps in docs/SECURITY.md (dashboard config). Redis + pen test before public launch. |
| 9.11 | Auto-validate tutor credentials | 🔄 | No public API exists; `lib/credentials.ts` seam + manual flow; Onfido identity-assurance documented |
| 9.12 | Corporate / B2B onboarding | ✅ | Org schema + /for-schools + admin manager + email-domain auto-enrol + pool→credit→Stripe waterfall + per-org admin report + /org self-serve portal (pool, monthly usage table, CSV export, top-up). |
| 9.13 | US expansion feasibility | ✅ | Research complete — docs/SCALE-AND-EXPANSION.md: student-data privacy (FERPA/COPPA), per-state requirements, separate entity. Defer to v2. |

---

## Phase 14 — Onboarding depth, content & growth

| # | Task | Status | Notes |
|---|------|--------|-------|
| 14.1 | Multi-select onboarding (subjects + levels) | ✅ | Both now multi-select; matching scores across all; links to /styles + /about from onboarding |
| 14.2 | Lesson page re-skin + auto-refresh | ✅ | Brand tokens, Logo, room auto-poll, clearer setting-up state + support fallback |
| 14.3 | 90/85 messaging reconciled | ✅ | Founding 90% consistent across home, role card, tutor onboarding |
| 14.4 | Marketing kit | ✅ | docs/MARKETING.md — vision-led messaging, student+tutor hooks, magazine article draft, 4 short-form video scripts, contact-list sourcing, 6-week launch sequence |
| 14.5 | Deepen /styles (history/origins/how-it-works, layered) | ✅ | Each teaching style: origin, history, mechanism + "Go deeper" accordion with reputable external links (DfE, Education Endowment Foundation, Oak National Academy, etc.) |
| 14.6 | Tutor photo upload + adjust (drawing/blur) | ✅ | Cloudinary upload widget + Photo/Blurred/Illustrated styles; gated on NEXT_PUBLIC_CLOUDINARY_* (setup in docs/LAUNCH.md) |
| 14.7 | Re-skin tutor onboarding + complete page | ✅ | Brand tokens, Logo, display headings, founding-90% badge + "Why fair-do?" link |

---

## Phase 13 — Founding-member launch promo

| # | Task | Status | Notes |
|---|------|--------|-------|
| 13.1 | Per-tutor commission + founder rate | ✅ | Teacher.platformFeePercent (default 15); founders keep 90% (10% fee). Booking + webhook use it. *(Model since updated: commission is now source-based — 0% on own students, 10% on marketplace bookings — via `commissionForSource` in billing.ts.)* |
| 13.2 | Auto-enrol founders during promo | ✅ | While FOUNDING_OFFER active, new tutors get founder rate + badge |
| 13.3 | Front-and-centre messaging | ✅ | Site-wide top bar + homepage + /for-tutors: "we're new, join early, share for more" |
| 13.4 | Founding-tutor badge | ✅ | Trust signal on profile/cards |

---

## Phase 12 — Discovery depth & Safety

| # | Task | Status | Notes |
|---|------|--------|-------|
| 12.1 | Safeguarding contacts / helplines page | ✅ | /help — 999 emergency banner + safeguarding lines (NSPCC, Childline) + report-a-concern guidance; tap-to-call; linked in footer on every page. |
| 12.2 | "Understanding teaching styles" page | ✅ | /styles — structured, Socratic, person-centred, exam-focused, project-based, mastery explained (what it is / helps with / how a lesson feels); nav + footer links |
| 12.3 | Language-spoken filter | ✅ | Teacher.languages; profile multi-select; /tutors filter + card/profile display |
| 12.4 | Availability calendar (aggregate) | ✅ | /availability — 7-day × hourly grid of free-tutor counts (region/state-scoped); tap slot → bookable list |

---

## Phase 11 — Portal, Discovery & Mission

| # | Task | Status | Notes |
|---|------|--------|-------|
| 11.1 | Org self-serve portal | ✅ | /org — contact/domain-member sees pool, spend (month+all-time), members, discount; privacy-safe aggregate only; self top-up via Stripe (org_topup webhook) |
| 11.2 | Tutor rate percentile | ✅ | Editable standard rate in profile editor with live percentile bar — "cheaper than X% of tutors", median, band (budget/mid/premium) |
| 11.3 | Tutor discovery filters (soonest + cheapest) | ✅ | /tutors sort tabs: Best match / Cheapest / Soonest; next-available computed from availability, shown per card |
| 11.4 | Mission-driven About page | ✅ | Technologists with a heart; tutors paid fairly; access for more; affordable learning, not extraction |

---

## Phase 10 — Bookings, Trust & Growth (current sprint)

| # | Task | Status | Notes |
|---|------|--------|-------|
| 10.1 | Booking email: calendar invite + reminder + cancel link | ✅ | .ics attached to confirm emails (student+tutor) w/ 30-min alarm; cancel link in confirm + reminder; hourly Vercel cron sends 24h reminder (CRON_SECRET-guarded, reminderSentAt guard) |
| 10.2 | Cancel lesson from dashboard + refund warning | ✅ | Cancel button on /session/[id]; confirm dialog warns "non-refundable within 24h" vs "full refund"; calls cancel API |
| 10.3 | Dashboard → home link | ✅ | Explicit Home + Find-a-tutor links in student/tutor dashboard navs |
| 10.4 | Gift "how it works" + sensitive framing | ✅ | 3-step explainer + "a gentle word" note (private redemption, no pressure) |
| 10.5 | Credential-check audit trail | ✅ | CredentialCheck record on every approve/reject — admin clerkId, body, number, method, result, notes, timestamp (immutable) |
| 10.6 | Admin menu visible when admin signed in | ✅ | SiteNav role-aware shows Admin link; /dashboard redirects ADMIN → /admin |
| 10.7 | Referral discounts (students + tutors) | ✅ | /r/CODE link → cookie → referee gets £10 signup credit; referrer gets £10 when referee books (idempotent, in booking + webhook); ReferralCard on dashboard |
| 10.8 | School onboarding discount | ✅ | New orgs auto-get 10% off for 30 days; applied at booking; "10% off first month" hook on /for-schools |

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
NEXT_PUBLIC_APP_URL                   # https://fair-do.com (or localhost:3000)
```

---

## Economics summary

*(Updated to current model: subscription + source-based commission, replacing the earlier flat 15% platform fee.)*

| | Commission-heavy incumbents | fair-do |
|---|---|---|
| Student pays / week | £55–80 | £40–55 |
| Tutor gets / lesson | ~£24 (~35%) | 100% on own students; ~90% on marketplace bookings |
| Platform fee | ~25–65% on every lesson | 0% on own students · 10% on marketplace only |
| Subscription | n/a | Free £0 · Pro £29 · School £79 |

---

## Key decisions log

| Date | Decision | Rationale |
|------|----------|-----------|
| Jun 2026 | Name: fair-do | British English for "a fair deal"; encodes fair pricing for tutors + students |
| Jun 2026 | Domains: Cloudflare, 3yr, WHOIS private | Cost price, privacy from day 1 |
| Jun 2026 | Platform fee: 15% | Sustainable at scale, 4× fairer than BetterHelp — *superseded: now 0% on own students, 10% on marketplace bookings, plus Free/Pro/School subscriptions* |
| Jun 2026 | UK-only launch | UK data protection, known regulatory environment |
| Jun 2026 | Tutors: independent contractors | Standard model, requires own PI insurance |
| Jun 2026 | Stripe Connect Express | Fastest tutor onboarding, Stripe handles KYC |
| Jun 2026 | Daily.co for video | GDPR-compliant, EU data residency, simple embed |
| Jun 2026 | Clerk for auth | Already familiar, handles both user types cleanly |

<!-- deploy check: phase9-routes -->

---

## Phase 16 — AI Tutor Toolkit (differentiator — no competitor has this)

*Goal: eliminate 60–90% of tutor prep time; give students and parents proof of learning.*

| # | Task | Status | Notes |
|---|------|--------|-------|
| 16.1 | AI lesson plan generator | ⬜ | `/teacher/lesson-plan` — tutor inputs subject, level, exam board (AQA/Edexcel/OCR), target grade, exam date, topics to avoid. Claude generates a 6–10 session plan with objectives, activities, and timing. Stored per student engagement. Uses `@anthropic-ai/sdk` already in stack. The single biggest gap vs every competitor — nobody has this. |
| 16.2 | Teaching materials library (per-student) | ✅ | `ResourceLibrary` component + `/api/resources` — tutors upload worksheets/past papers (25 MB max); students can submit work back. Visibility toggle per file. Behind `RESOURCES_ENABLED=true`. External link manager (`ClientDocuments`) also covers Google Drive / OneDrive links. |
| 16.3 | AI post-session summary | ✅ | `lib/lesson-notes.ts` + `LessonNoteEditor` — Claude Haiku generates topics covered, difficulty areas, and homework from session transcript. Tutor reviews/edits then shares with student. `/api/teacher/lesson-notes`. Behind `AI_NOTES_ENABLED=true` + Pro/School tier. |
| 16.4 | Between-lesson AI study assistant | ⬜ | `/study` — Claude-powered chat scoped to the student's booked subjects/level. Can answer questions, explain concepts, set practice problems. NOT a replacement for the tutor — framed as "between-lesson support." Gated to Pro/School tiers. |
| 16.5 | Tutor private notes per student | ✅ | `NotesEditor` component + `/api/practice/students/[matchId]` PATCH — freeform private notes visible only to the tutor. Already live (not feature-flagged). |

---

## Phase 17 — Collaborative Lesson Environment

*Goal: match Spires's BitPaper + recording; surpass MyTutor's basic whiteboard.*

| # | Task | Status | Notes |
|---|------|--------|-------|
| 17.1 | Collaborative whiteboard in video sessions | ✅ | `lib/whiteboard.ts` + `WhiteboardButton` — Excalidraw room with deterministic room ID + E2E key derived from session ID + server secret. Both participants open the same board with no stored state. Self-hosted `EXCALIDRAW_SERVER_URL` enables embedded iframe; otherwise opens in a new tab. Behind `WHITEBOARD_ENABLED=true`. |
| 17.2 | Lesson recording | ⬜ | Enable Daily.co cloud recording API. Recording starts automatically when both participants join. Stored in Daily.co (or transferred to Cloudinary/S3 post-session). Accessible from student dashboard + tutor dashboard for 30 days. Key GDPR note: explicit consent banner before joining required. |
| 17.3 | In-session file sharing | ✅ | Covered by `ResourceLibrary` (16.2) — tutor uploads post-session; file is student-visible. For in-session drag-and-drop, the Excalidraw whiteboard supports image paste. |

---

## Phase 18 — Parent Portal + Progress Tracking

*Goal: answer the question every parent has — "Is my child actually learning?" No competitor does this.*

| # | Task | Status | Notes |
|---|------|--------|-------|
| 18.1 | Parent account model | ✅ | `ParentLink` model — teacher invites parent per student via `/api/teacher/parent/invite`. Parent accepts via `/parent/accept/[token]`. Multi-child supported (`groupLinksByChild`). Parent role in Clerk metadata. Behind `PARENT_PORTAL_ENABLED=true`. |
| 18.2 | Parent dashboard `/parent/dashboard` | ✅ | `/parent/dashboard` page — per-child tabs, lesson history, parent↔tutor messaging thread, subscription status. £4.99/mo via Stripe (`/parent/subscribe`). Behind `PARENT_PORTAL_ENABLED=true` + Pro/School teacher tier. |
| 18.3 | Goal setting per student | ⬜ | Tutor sets: target grade, exam board, exam date on the `Match` record. Surfaced on parent dashboard and student detail page. Not yet built. |
| 18.4 | Progress graph | ⬜ | Per-student chart: sessions completed, topics covered (from AI notes), tutor's session rating. Visible to tutor, student, and parent. Exportable as PDF. |

---

## Phase 19 — Curriculum Alignment

*Goal: deep switching costs; no competitor has spec-level lesson tracking.*

| # | Task | Status | Notes |
|---|------|--------|-------|
| 19.1 | UK curriculum spec data | ⬜ | Seed DB with topic lists for common GCSE/A-level subjects across AQA, Edexcel, OCR (publicly available from exam board websites). `CurriculumSpec` + `SpecTopic` models. Start with top 10 subjects (Maths, English, Biology, Chemistry, Physics, History, Geography, French, Spanish, Computer Science). |
| 19.2 | Topic tagging on lesson notes | ⬜ | When tutor completes a session (16.5), they tag 1–5 spec topics covered. Autocomplete from `SpecTopic` for the student's exam board. Takes < 30 seconds. |
| 19.3 | Syllabus coverage heatmap | ⬜ | Student and parent see a heatmap of the full spec: green = covered, amber = mentioned, grey = not yet. Shows coverage % and estimated sessions remaining to full coverage before exam date. Makes the "value of tutoring" tangible and creates urgency to book ahead. |

---

## Phase 20 — Retention, Conversion & Mobile

*Goal: close the remaining gaps vs GoStudent (mobile), Spires (trust), and the market generally.*

| # | Task | Status | Notes |
|---|------|--------|-------|
| 20.1 | Lesson packages / bundles | ⬜ | Students buy a 5- or 10-lesson pack at 5–10% off the per-lesson rate. Tutor opts in per profile. Credits issued immediately; applied automatically at booking. Improves retention and smooths tutor cash flow. Stripe Checkout supports payment for bundles. |
| 20.2 | Trial lesson money-back guarantee | ⬜ | Policy + UI change: "Not happy with your first lesson? Full refund, no questions." Surfaced on homepage, tutor profile, and booking confirmation. Refund via existing cancel API (mark as trial-refund). Requires admin flag to ensure the policy is honoured, not abused. Biggest single conversion lever for first-time students. |
| 20.3 | Tutors' Association accreditation | ⬜ | Apply for platform partnership/accreditation with The Tutors' Association (already in Phase 8.6 — fast-track). Accreditation badge on homepage, tutor cards, and onboarding. Equivalent trust signal to Spires's selective vetting. |
| 20.4 | Mobile app (iOS + Android) | ⬜ | Already specced in `NATIVE-APP-SPEC.md`. React Native. Core flows: browse tutors, book, join lesson, message, view summaries. Push notifications for lesson reminders and AI summaries. This is GoStudent's main UX advantage — close it. |
| 20.5 | Push notifications (web) | ⬜ | Web push already scaffolded (`web-push` in package.json). Wire up: lesson reminder 1h before, new message, AI summary ready, booking confirmed/cancelled. Works on mobile web ahead of the native app. |

---

## Phase 15 — US expansion (foundation in parallel with UK legal)

| # | Task | Status | Notes |
|---|------|--------|-------|
| 15.1 | US plan documented | ✅ | docs/US-EXPANSION-PLAN.md — per-state requirements + student-data privacy (FERPA/COPPA) are the real differences; launch 1 state, cash-pay, separate US entity |
| 15.2 | Region data model | ✅ | Region enum (UK/US); Teacher.country + licenseState; Student.country + usState (all default UK — inert for current site) |
| 15.3 | Locale lib | ✅ | lib/locale.ts — per-region currency, safeguarding/child-safety lines (Childhelp/911 for US), credential bodies (state teaching certification…), US_STATES, formatMoney |
| 15.4 | State-aware matching | ✅ | US students only match in-state tutors; UK unchanged |
| 15.5 | Region-aware /help + safeguarding screens | ✅ | /help driven by lib/locale — Childhelp/911 for US, UK lines for UK |
| 15.6 | Region-aware currency in UI | ✅ | £/$ via teacher.country on cards, profile, booking, earnings (ProfileForm percentile median = minor follow-up) |
| 15.7 | US tutor onboarding (state + credential body) | ✅ | US credential bodies (state teaching certification) + state picker + $ breakdown |
| 15.8 | US student onboarding (state capture) | ✅ | Required state dropdown when region=US; stored for in-state matching |
| 15.9 | Student-data agreements (FERPA) + Stripe US + US entity | 🔴 | Legal/ops gated — see plan Phase B |

## Phase 21 — Enterprise: fair-do for Schools (white-label portal)

*Goal: schools get their own branded portal on the same backend — brand, year/house/class/subject structure, staff contacts, mail groups, calendars. Full plan: `docs/ENTERPRISE-SCHOOLS-PLAN.md`.*

| # | Task | Status | Notes |
|---|------|--------|-------|
| 21.1 | M0 — Tenancy foundation | ⬜ | Extend `Organisation` (slug/plan/branding), `OrgMembership` + school-admin role, subdomain resolution in `src/proxy.ts`, tenant-isolation db test, `ENTERPRISE_PORTAL_ENABLED` flag |
| 21.2 | M1 — Branding & school shell | ⬜ | One-hex → full token ramp over Tailwind v4 CSS vars, tenant layout (logo/name/theme), `/school` admin console + branding editor, branded emails + Clerk sign-in |
| 21.3 | M2 — Structure, members & staff directory | ⬜ | YearGroup/House/SchoolClass/OrgSubject models, UK-preset setup, CSV student import, staff contacts (+DSL flag in safeguarding flows), subject→marketplace mapping, reports v1 |
| 21.4 | M3 — Mail groups, broadcasts & calendars | ⬜ | Rule-based mail groups ("all Year 10 parents"), school broadcasts via existing pipeline, term/event calendars with ICS import/export, booking warn/block on holidays |
| 21.5 | M4 — Enterprise hardening (Portal+) | ⬜ | Custom domains, SSO (MS365/Google via Clerk), annual Stripe invoicing, onboarding wizard, per-tenant admin tools. Start only after a pilot school is live |
| 21.6 | Legal track (parallel with M0) | ⬜ | School DPA template (school = controller), DPIA addendum for bulk under-18 CSV import — gate on first pilot import |
| 21.7 | Pilot: 2 design-partner schools | ⬜ | Independents first, 50% off yr 1 for feedback + case study; pricing proposal Portal £2,400/yr · Portal+ £4,800/yr |

---

### US — NY-first launch + full-coverage scaling

| # | Task | Status | Notes |
|---|------|--------|-------|
| 15.10 | Launch-state gate (NY first) | ✅ | LAUNCH_US_STATES=['NY'] (or NEXT_PUBLIC_ACTIVE_US_STATES); onboarding dropdowns + server guards restrict to live states; add a code to expand coverage |
| 15.11 | US/NY legal pathway documented | ✅ | docs/US-LEGAL-NY.md — NY business registration, student-data privacy (FERPA/COPPA, NY SHIELD), background checks for tutors of minors, online-tutoring consent, entity/bank/Stripe-US; "how to trigger" table + multi-state scaling |
| 15.12 | NY legal execution | 🔴 | Engage NY attorney (entity + docs) · US entity + EIN + bank · Stripe US · FERPA/data agreements · background-check verification |
| 15.13 | Multi-state tutor coverage (scale) | ⬜ | Migrate Teacher.licenseState → licenseStates[] for multi-state tutors; match student.usState ∈ licenseStates |
