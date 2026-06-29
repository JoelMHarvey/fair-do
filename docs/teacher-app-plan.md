# Teacher App — Development Plan

Fork of the Faresay codebase, adapted for independent teachers and private tutors.
This document is a complete hand-off for the development team.

---

## Overview

The Faresay codebase is a Next.js 16 / Prisma / Clerk / Daily.co / Stripe platform for
1:1 professional services. Roughly 80% of it — video, scheduling, payments, messaging,
subscriptions, group sessions, B2B organisations — transfers to a teacher app with zero
changes. The remaining 20% is a terminology pass plus removal of therapy-specific features
(supervision logs, clinical outcome measures, crisis screens, BACP/UKCP registration).

**Approach:** fork the repo, strip and adapt. Do not try to maintain a single codebase
serving both verticals — the legal and regulatory contexts are different enough that
divergence is fine.

---

## Domain & Infrastructure Strategy

### Domain: fair-do.com

The teacher app runs on **fair-do.com** (registered at Cloudflare). "Fair do" is
immediately legible British English — fair pricing, fair deal for teachers and students —
and maps directly to the 10% commission pitch. It cannot share `faresay.com`, which is
a therapy brand.

### What must be separate (one per product)

These services are either tied to a domain or need clean financial separation:

| Service | Why separate |
|---|---|
| **Domain** | Different brand entirely |
| **Vercel project** | Each project maps to one domain and one git repo |
| **Clerk application** | Auth tokens are app-scoped; users cannot sign in across apps with the same account |
| **Stripe platform account** | Separate Connect platform keeps teacher payouts, fees, and tax reporting completely isolated from Faresay's finances |
| **Neon database** | Separate database = no risk of data leakage between platforms; separate backups; separate connection pool limits |
| **Resend sending domain** | Email comes from `fair-do.com` — add SPF, DKIM, DMARC records in Cloudflare |
| **Daily.co domain allowlist** | Add `fair-do.com` to allowed origins in the Daily.co dashboard |
| **Sentry project** | Errors from both apps would be mixed otherwise |
| **Plausible site** | Analytics per domain |

### What can share the same provider account

These are billed per seat/team, not per project — no need to create new accounts:

| Service | Share how |
|---|---|
| **Vercel** | Same team, new project. Costs nothing extra on most plans |
| **Clerk** | Same Clerk account, new Application |
| **Neon** | Same Neon org, new project/database |
| **Daily.co** | Same account — rooms are namespaced by name, so `teachapp-<sessionId>` won't collide with `faresay-<sessionId>` |
| **Resend** | Same account, new verified domain |
| **Sentry** | Same org, new project |
| **Plausible** | Same account, new site |
| **Cloudflare** | Same account — `fair-do.com` already registered here |
| **Anthropic** | Same API key is fine — usage is billed per token regardless |

Stripe is the one exception where a truly separate account is worth the admin overhead.
Mixing two platforms' Connect payouts, platform fees, and tax reports in one Stripe
account creates accounting headaches. Two accounts = clean books.

---

## Terminology Map

Every occurrence of these terms (in code, copy, email templates, comments) needs updating.

| Faresay (therapy) | Teacher app |
|---|---|
| Therapist | Teacher / Tutor |
| Client | Student / Learner |
| Session | Lesson |
| Therapy / therapy session | Tuition / lesson |
| Specialism | Subject |
| Approach / approach tags | Teaching style |
| Practice (as in "practice portal") | Studio — or keep "practice" |
| Supervision | _(remove entirely)_ |
| Registration body (BACP/UKCP/BPS/NCS) | QTS / DBS / qualification body |
| Professional indemnity insurance | _(optional, keep field but soften language)_ |
| Match | Enrolment _(or keep Match — both work)_ |
| `faresay.com` | `fair-do.com` |
| Samaritans / 999 / crisis | _(remove)_ |
| PHQ-9 / GAD-7 | _(remove)_ |

---

## Phase 1 — Project Setup (Day 1)

### 1.1 Create the GitHub repo

Create a new GitHub repository (e.g. `fair-do`) under your account or org. Then fork
the Faresay codebase into it:

```bash
git clone <faresay-repo-url> fair-do
cd fair-do
git remote remove origin
git remote add origin <new-github-repo-url>
git push -u origin main
```

### 1.2 Create the Vercel project and get the CNAME

This must happen before Cloudflare DNS can be pointed at it.

1. In Vercel, create a new project and connect it to the `fair-do` GitHub repo
2. Go to **Project Settings → Domains** and add `fair-do.com` (and `www.fair-do.com`)
3. Vercel will display a CNAME value — typically `cname.vercel-dns.com` or a project-specific value
4. In **Cloudflare DNS** for `fair-do.com`, add:
   - `CNAME` — name: `@` (or `fair-do.com`) → value: the CNAME Vercel provided
   - `CNAME` — name: `www` → value: the same CNAME
   - Set both to **DNS only** (grey cloud, not proxied) — Vercel handles TLS itself and Cloudflare proxying can interfere with Vercel's certificate provisioning
5. Vercel will show the domain as verified once DNS propagates (usually a few minutes with Cloudflare)

### 1.3 Rename the project

- `package.json` — update `name` to `fair-do`, update `description`
- `README.md` — replace content
- Update `NEXT_PUBLIC_APP_URL` to `https://fair-do.com` in all environment files
- Update `vercel.json` project name if set

### 1.3 Environment variables

Copy `.env.local.example` and provision fresh accounts for each service:

| Variable | Action |
|---|---|
| `DATABASE_URL` | New Neon database (eu-west-2 or us-east-1 per region) |
| `CLERK_*` | New Clerk application |
| `STRIPE_*` | New Stripe platform account with Connect enabled |
| `DAILY_API_KEY` / `DAILY_WEBHOOK_SECRET` | New Daily.co account |
| `RESEND_API_KEY` / `RESEND_FROM` | Same Resend account — verify `fair-do.com` as a sending domain (SPF/DKIM DNS records in Cloudflare), set `RESEND_FROM=noreply@fair-do.com` |
| `NEXT_PUBLIC_APP_URL` | `https://fair-do.com` |
| `ONFIDO_API_TOKEN` | Optional — only needed if you want automated DBS/credential checks |
| `ANTHROPIC_API_KEY` | Carry over if keeping the AI assistant |
| All others | Carry over unchanged |

These services can all live under the **same provider accounts** as Faresay — they just
need new projects/applications/databases within those accounts. See §1.4 for details.

### 1.4 Observability setup

The full observability stack transfers unchanged. Stand up fresh instances of each tool
pointing at the new project — do not share observability with Faresay, or alerts and
errors from both apps will be mixed together.

**Sentry** — create a new Sentry project (same org, new project named e.g. `teachapp`).
Copy the new DSN to `SENTRY_DSN` and `NEXT_PUBLIC_SENTRY_DSN`. The existing
`sentry.client.config.ts`, `sentry.server.config.ts`, and `sentry.edge.config.ts` files
need no code changes — just the env vars.

**Plausible** — add `fair-do.com` as a new site in your Plausible account. Update
`PLAUSIBLE_DOMAIN` (or however it's referenced in `next.config.ts`). Plausible is
cookieless and GDPR-friendly so no consent banner changes needed.

**CronRun / AlertState models** — carry over with zero changes. These models track cron
job freshness and deduplicate alert emails; they have no Faresay-specific logic. The
alert cron at `/api/cron/alerts` will work identically for the new app.

**Health + metrics endpoints** — `/api/health` and `/api/metrics` carry over unchanged.
Set a new `METRICS_TOKEN` in env vars (generate a fresh secret — don't reuse Faresay's).
Update your uptime monitor (UptimeRobot / Checkly / whatever you use) to point at
`https://fair-do.com/api/health`.

**Alert routing** — update these env vars to point at the new app's ops addresses:
```
ALERT_EMAIL=ops@fair-do.com
COMPLAINTS_EMAIL=complaints@fair-do.com
CRON_SECRET=<new-random-secret>   # generate fresh, do not reuse Faresay's
```

**GitHub Actions** — copy any CI/CD workflows from Faresay's `.github/workflows/` into
the new repo. Update any hardcoded repo names or Vercel project references.

**What you get for free** — because these models and endpoints are unchanged, the new app
ships on day one with: cron staleness detection, DB connectivity alerts, unread mail
alerts, alert deduplication, and a metrics dashboard endpoint. No setup beyond env vars.

---

## Phase 2 — Database Schema (Days 2–3)

All changes are to `prisma/schema.prisma` followed by a single migration.
Do all schema changes together before running `prisma migrate dev`.

### 2.1 Rename the `THERAPIST` role

```prisma
// Before
enum UserRole {
  CLIENT
  THERAPIST
  ADMIN
}

// After
enum UserRole {
  STUDENT
  TEACHER
  ADMIN
}
```

Update every reference to `UserRole.THERAPIST` → `UserRole.TEACHER` and
`UserRole.CLIENT` → `UserRole.STUDENT` across the codebase after migrating.

### 2.2 Rename the `Therapist` model → `Teacher`

Prisma rename: `model Therapist` → `model Teacher`. Update all relations accordingly.
All foreign key columns named `therapistId` can stay as-is in the DB or be renamed —
keeping them saves a migration column rename and is fine as an internal implementation detail.

### 2.3 Rename the `Client` model → `Student`

Same approach — rename the model, update relations.

### 2.4 Fields to REMOVE from `Teacher` (was `Therapist`)

| Field | Reason |
|---|---|
| `registrationBody` | BACP/UKCP/BPS/NCS — therapy specific |
| `registrationNumber` | Replaced by `qualificationBody` / `dbsNumber` |
| `registrationExpiry` | Replace with `qualificationExpiry` |
| `credentialCheckId` | Keep if using Onfido for DBS; remove if manual only |
| `credentialCheckStatus` | Keep or remove with above |
| `insuranceConfirmed` | Soften to optional — not legally required for private tutors |
| `insuranceProvider` | Optional |
| `insuranceExpiry` | Optional |
| `regReminderStage` | Rename to `qualReminderStage` |
| `psychologyTodayUrl` | Remove — therapy directory |
| `supervisionLogs` (relation) | Remove with model deletion below |

### 2.5 Fields to ADD to `Teacher`

```prisma
subjects         String[]          // e.g. ["Maths", "Physics"]
levels           String[]          // e.g. ["GCSE", "A-Level", "KS3"]
teachingStyles   String[]          // replaces approachTags
qualificationBody String?          // e.g. "QTS", "ABRSM", "ICF"
qualificationRef  String?          // qualification/registration number
qualificationExpiry DateTime?
dbsNumber        String?           // DBS certificate number
dbsDate          DateTime?         // issue date (DBS certs don't expire but go stale)
ageGroups        String[]          // e.g. ["6-11", "11-16", "16-18", "Adult"]
```

Keep all existing rate, availability, group session, subscription, brand, referral, and
Stripe fields unchanged.

### 2.6 Fields to REMOVE from `Student` (was `Client`)

| Field | Reason |
|---|---|
| `questionnaire` (content only, keep the column) | Replace JSON content in onboarding code |
| `consentVersion` | Simplify consent — Art.6 not Art.9; keep `consentGiven` / `consentDate` |

No column removals needed on `Student` — just change what the app writes to `questionnaire`.

### 2.7 Models to DELETE

```
SupervisionLog   — BACP/UKCP mandate; no equivalent for teachers
OutcomeScore     — PHQ-9/GAD-7 therapy outcome measures; remove entirely
```

Remove their Prisma models, relations, and all API routes/components that reference them.

### 2.8 Models to ADAPT

**`ClientDocument`** — category enum-like string:
```
// Before (therapy)
category: "session-notes | assessment | formulation | treatment-plan | risk | outcomes | other"

// After (teaching)
category: "lesson-notes | homework | resource | progress | other"
```
This is just a string in the schema — update the validation in the API route and the
category picker component.

**`CredentialCheck`** — rename `registrationBody` → `qualificationBody`,
`registrationNumber` → `qualificationRef`. Keep the rest.

**`Complaint`** — update the `category` string enum:
```
// Before
"safeguarding | conduct | billing | technical | other"

// After
"safeguarding | conduct | billing | technical | other"
// (safeguarding stays — applies to under-18 teaching too; just update the admin UI copy)
```

**`ClientForm`** — no schema changes. The `type` field (`intake | consent | questionnaire`)
is already generic.

### 2.9 Run the migration

```bash
npx prisma migrate dev --name "teacher-app-rebrand"
```

---

## Phase 3 — Terminology & Copy Pass (Days 3–5)

This is mechanical but touches many files. Use a global find-and-replace in your editor,
then review each file to catch contextual uses that don't fit the pattern.

### 3.1 Code identifiers

Run these find-and-replaces across `src/` (case-sensitive where noted):

| Find | Replace | Notes |
|---|---|---|
| `therapistId` | `teacherId` | Only in new code going forward — existing DB columns can stay |
| `UserRole.THERAPIST` | `UserRole.TEACHER` | After schema migration |
| `UserRole.CLIENT` | `UserRole.STUDENT` | After schema migration |
| `therapist.` (object access) | `teacher.` | Review each hit |
| `client.` (object access) | `student.` | Review each hit carefully (many false positives) |
| `Therapist` (TypeScript types) | `Teacher` | After Prisma rename regenerates client |
| `approachTags` | `teachingStyles` | Field rename |
| `specialisms` | `subjects` | Field rename |
| `sessionRate` | `lessonRate` | Optional — keep or rename |

### 3.2 Route paths

Update `src/app/` route directory names:

| Current path | New path |
|---|---|
| `/therapist/dashboard` | `/teacher/dashboard` |
| `/therapist/clients` | `/teacher/students` |
| `/therapist/sessions` | `/teacher/lessons` |
| `/therapist/profile` | `/teacher/profile` |
| `/therapist/availability` | `/teacher/availability` |
| `/therapist/earnings` | `/teacher/earnings` |
| `/therapist/supervision` | _(delete)_ |
| `/therapists` (directory) | `/tutors` or `/teachers` |

### 3.3 UI copy

Update all user-facing strings in page and component files. Key areas:

- Dashboard headings: "Your therapists" → "Your tutors"
- CTA: "Find a therapist" → "Find a tutor"
- Session labels: "Session" → "Lesson" throughout
- Onboarding prompts (see Phase 4)
- Nav labels, page titles, meta descriptions

### 3.4 Email templates

All email templates are in `src/lib/email/` (Resend). Do a pass on each:

- Subject lines: "Your therapy session" → "Your lesson"
- Body copy: "therapist" → "tutor", "client" → "student"
- Footer: update platform name, support email, domain
- Approval email: update credential language (see Phase 5)
- Reminder email: "session" → "lesson"

---

## Phase 4 — Onboarding Flow Adaptation (Days 5–7)

### 4.1 Student onboarding questionnaire

**File:** `src/app/onboarding/client/` (rename dir to `student/`)

Replace the therapy questionnaire with a teaching intake:

```typescript
// Remove these therapy-specific questions:
// - "What brings you to therapy?" (anxiety, depression, trauma, relationships, grief...)
// - "Have you had therapy before?"
// - "Do you have a preference for approach?" (CBT, psychodynamic, etc.)

// Replace with:
// 1. "What subject(s) do you need help with?" (multi-select from subject list)
// 2. "What level are you studying at?" (KS1–KS3, GCSE, A-Level, University, Adult/professional)
// 3. "What are your main goals?" (pass an exam, build confidence, keep up with class, advance skills)
// 4. "How often would you like lessons?" (once a week, twice a week, flexible)
// 5. "Which days/times generally work for you?" (existing day-of-week picker — keep as-is)
```

**Remove entirely:** the crisis safety screen step (Samaritans/999 signposting checkbox).

### 4.2 Consent flow

**File:** `src/app/onboarding/client/consent/` (or wherever Art.9 consent is)

Replace the GDPR Article 9 special-category consent (mental health data) with a standard
Article 6 consent for ordinary personal data. Teaching data is not special-category.
Keep the consent checkbox and timestamp — just update the consent text.

New consent text should cover: name, email, payment details, lesson history, recordings
(if enabled). Remove all references to mental health, sensitive data, special-category.
Get this text signed off by a lawyer before launch.

### 4.3 Role selection page

**File:** `src/app/onboarding/`

```
// Before
"I need a therapist" / "I am a therapist"

// After
"I need a tutor" / "I am a tutor" (or "I teach")
```

### 4.4 Role-based redirect

**File:** wherever `/dashboard` redirects based on `user.role`

Update: `UserRole.THERAPIST` → `UserRole.TEACHER`, `UserRole.CLIENT` → `UserRole.STUDENT`.

---

## Phase 5 — Teacher Onboarding Adaptation (Days 7–9)

### 5.1 Profile form

**File:** `src/app/onboarding/therapist/` (rename to `teacher/`)

Replace therapy-specific fields:

| Remove | Replace with |
|---|---|
| Registration body picker (BACP/UKCP/BPS/NCS) | Qualification body (free text or short list: QTS, ABRSM, CELTA, TEFL, ICF, Other) |
| Registration number | Qualification/DBS reference number |
| Specialisms picker (therapy topics) | Subject picker (see subject taxonomy below) |
| Approaches picker (CBT, psychodynamic...) | Teaching style picker (structured, Socratic, project-based, exam-focused...) |
| Psychology Today URL | _(remove)_ |

Keep unchanged: bio, tagline, professional title, session rate, intro rate, group rate,
group max size, languages, website URL, LinkedIn URL, availability, profile photo.

### 5.2 Subject taxonomy

Define a canonical subject list (stored as `Teacher.subjects String[]`). Suggested initial list:

```
Maths, Further Maths, English Language, English Literature,
Biology, Chemistry, Physics, Combined Science,
History, Geography, Religious Studies,
French, Spanish, German, Mandarin, Latin,
Art & Design, Music, Drama,
Computer Science, ICT,
Economics, Business Studies, Psychology, Sociology,
Physical Education,
UCAS / University Applications,
English as a Second Language (ESL/EFL),
Coding / Programming,
Piano, Guitar, Violin, Drums, Singing
```

Level list: `KS1, KS2, KS3, GCSE, IGCSE, A-Level, IB, Scottish Highers, University, Adult`

Age group list: `Under 7, 7–11, 11–14, 14–16, 16–18, Adult`

### 5.3 Credential verification

**File:** `src/app/admin/` credential verification dashboard

Replace BACP/UKCP registration checks with:
- QTS number verification (UK Teaching Regulation Agency public register — can be manual or automated via TRA API)
- DBS certificate review (admin manually reviews uploaded doc)
- Degree/qualification document review (admin manually reviews upload)

The admin approval/reject flow and credential check model are unchanged — just update
the labels and the `qualificationBody` field.

### 5.4 Remove supervision workflow

Delete:
- All routes under `/therapist/supervision`
- The `SupervisionLog` model (done in Phase 2)
- Any nav links pointing to supervision
- The supervision dashboard admin view (if separate from main admin)

---

## Phase 6 — Feature Removals (Day 9)

### 6.1 Outcome scores

Delete:
- `OutcomeScore` Prisma model (done in Phase 2)
- API routes: `/api/outcome-scores/*`
- UI components: outcome score tracker, chart, entry form
- Any nav entry in therapist/teacher dashboard

Optional replacement: add a simple freeform "Progress note" per match — a plain text
field on `Match.notes` works for this without any new model.

### 6.2 Clinical document categories

**File:** API route that validates `ClientDocument.category`

```typescript
// Replace
const CATEGORIES = ['session-notes', 'assessment', 'formulation', 'treatment-plan', 'risk', 'outcomes', 'other']

// With
const CATEGORIES = ['lesson-notes', 'homework', 'resource', 'progress', 'other']
```

Update the category picker UI component to match.

### 6.3 Crisis safety screen

Already handled in Phase 4 (remove the step from student onboarding). Also:
- Remove any `/api/crisis` or crisis-related routes
- Remove Samaritans/999 links from help/FAQ pages
- Update the "About" / "How it works" pages to remove crisis service disclaimers

### 6.4 Therapy-specific marketing copy

Pages to update: homepage, "How it works", "For therapists"/"For clients", About, FAQ.
This is copy-only work — no code changes.

---

## Phase 7 — Matching Algorithm Adaptation (Day 10)

**File:** `src/lib/matching.ts` (or wherever the matching score is computed)

The current algorithm scores on: specialism match (+50), approach match (+30), availability (+20).

Replace with: subject match (+50), level match (+30), availability (+20).

```typescript
// Before
score += therapist.specialisms.filter(s => client.questionnaire.specialisms.includes(s)).length * 50
score += therapist.approachTags.filter(a => client.questionnaire.approaches.includes(a)).length * 30

// After
score += teacher.subjects.filter(s => student.questionnaire.subjects.includes(s)).length * 50
score += teacher.levels.filter(l => student.questionnaire.levels.includes(l)).length * 30
// availability scoring unchanged
```

Also update the directory sort/filter UI to use subjects and levels as filter dimensions
instead of specialisms and approaches.

---

## Phase 8 — Admin Dashboard Adaptation (Day 10–11)

Most of the admin dashboard is generic (user list, approval queue, session metrics,
earnings overview, complaint queue). Changes needed:

- Credential verification labels: "BACP number" → "Qualification / DBS reference"
- Registration body column → Qualification body
- Remove supervision audit view (if it exists as an admin page)
- Update complaint categories in the UI (keep safeguarding, update other labels)
- Update admin approval email template (sent when teacher is approved/rejected)

---

## Phase 9 — B2B Organisations for Schools (Day 11)

The `Organisation` model already supports bulk purchasing, credit pools, domain-based
auto-enrolment, and per-org discounts. For a teacher app this maps directly to schools
or tutoring agencies.

No model changes needed. Copy/label updates only:
- "Organisation" → "School" or "Institution" in the UI
- "Seats" → "Student places" or keep "seats"
- "Members" → "Students" or "Pupils"
- Update the org onboarding email to use appropriate language

Consider: schools booking lessons for specific students (not self-service enrolment)
is a common use case. The current invite flow (teacher invites student) covers this,
but you may want a school-admin role that can invite students in bulk. That's a v2
feature — the existing model supports it without schema changes.

---

## Phase 10 — Testing (Days 11–13)

### 10.1 Unit tests

**File:** `src/**/*.test.ts`

Update test fixtures and assertions that reference:
- `UserRole.THERAPIST` / `UserRole.CLIENT`
- therapy-specific questionnaire fields
- BACP/UKCP registration bodies
- OutcomeScore / SupervisionLog

Tests for billing, slots, credentials, refunds, vouchers, and matching need the
matching algorithm updates from Phase 7 reflected in their fixtures.

### 10.2 E2E tests

**File:** `tests/` (Playwright)

Update selectors and assertions that reference therapy copy. Key flows to re-test end-to-end:
- Student registration and onboarding (new questionnaire)
- Teacher registration and onboarding (new credential fields)
- Admin approval of a teacher
- Booking a lesson (student side)
- Joining a video lesson (both sides)
- Messaging
- Payment and refund

### 10.3 Seed data

**File:** `prisma/seed-uat.mjs`

Update seed teachers to use the new subject/level fields, and seed students with the
new questionnaire structure.

---

## Phase 11 — Legal & Compliance (Parallel, ~4 weeks)

This runs in parallel with development and should be started immediately.

| Task | Notes |
|---|---|
| New platform T&Cs | Not therapy-specific; simpler than Faresay's. Cover lesson cancellation, refunds, platform fee, teacher contractor status |
| Teacher contractor agreement | Independent contractor, DBS requirement, behaviour standards |
| Privacy notice | Art.6 lawful basis (contract + legitimate interests); no special-category data |
| DPA with vendors | Clerk, Stripe, Daily.co, Neon, Resend — same vendors, new entity |
| ICO registration | New data controller registration (~£60/yr) |
| Companies House | Register new entity |
| Under-18 safeguarding policy | Required if any teachers will teach minors — DBS enhanced check, parental consent flow for booking |
| Under-18 parental consent flow | If launching with under-18 support in v1: parent is the account holder, student is a named learner; requires additional fields on Student model |

**Recommendation:** If targeting adults first (university, professional skills, language
learning), skip the under-18 safeguarding flow for v1. Add it in v2 once the platform
is established. This significantly reduces legal complexity at launch.

---

## What NOT to Touch

The following work exactly as-is for a teacher app. Do not modify them:

- Daily.co video integration (rooms, tokens, webhook, join tracking)
- Stripe Connect payouts
- Stripe Billing subscription tiers (Starter / Practice / Clinic still make sense)
- Package bundles ("6 lessons for £X")
- Gift vouchers
- Credit system
- Referral rewards
- Availability and slot booking engine
- Group sessions (maps to small group tutoring / masterclasses)
- 1:1 messaging per Match/Enrolment
- Practice portal (teacher invites student, custom rates)
- Push notifications, email reminders, no-show cron
- Calendar sync (ICS feed)
- FX rates / locale / currency switcher
- Admin: user list, metrics, complaint queue, impersonation
- Mobile app (Expo) — just update copy and brand
- Cron jobs: reminders, no-shows, credential expiry (adapt expiry fields to new credential model)
- CronRun / AlertState observability models
- Sentry, Plausible analytics
- Broadcast / BroadcastTemplate (teacher announcements to students)
- Review model (post-lesson ratings)

---

## Effort Estimate (v1)

| Phase | Description | Days |
|---|---|---|
| 1 | Project setup, fork, env vars | 1 |
| 2 | Schema changes + migration | 2 |
| 3 | Terminology & copy pass | 3 |
| 4 | Student onboarding adaptation | 2 |
| 5 | Teacher onboarding adaptation | 3 |
| 6 | Feature removals | 1 |
| 7 | Matching algorithm | 1 |
| 8 | Admin dashboard | 1 |
| 9 | B2B / school organisations | 1 |
| 10 | Testing | 3 |
| Legal | Parallel track | ~4 weeks |
| **Total dev** | | **~18 dev-days** |

18 dev-days is roughly 3.5 weeks for one developer or 2 weeks for two. The legal track
is the long pole — budget 4–6 weeks for lawyer review and sign-off on T&Cs, contractor
agreement, and privacy notice.

---

## Recommended Launch Scope (v1)

To get to market fastest:

- Adult learners only (skip under-18 safeguarding)
- Subject taxonomy: academic subjects + music + languages (defer coding/professional)
- GCSE and A-Level focus initially (highest demand, clearest credential path)
- Manual credential verification (QTS check via TRA, DBS document upload reviewed by admin)
- No automated Onfido checks — add in v2 once volume justifies it
- Keep subscription tiers identical to Faresay — no pricing decisions needed at launch
- Skip outcome/progress tracking for v1 — teachers can use the freeform Match notes field

Everything else in the codebase is ready to go.

---

---

# Phase 2 — Competitive Differentiation

Phase 2 begins after v1 is live and has initial tutors. These features are informed by
gaps in the current UK competitor landscape (Tutorful, MyTutor, Spires, Superprof,
TutorBird, TutorCruncher) and address the most common tutor complaints across those
platforms.

---

## Competitive Context

The market splits into two categories that no single product currently serves well:

- **Marketplaces** (Tutorful, MyTutor, Spires) — students find tutors, platform takes
  20–25% commission. Tutors resent the rate and the dependency. First Tutors recently
  closed, leaving a displaced tutor base actively looking for alternatives.
- **Practice management tools** (TutorBird ~£30/mo, TutorCruncher) — tutors manage
  their own students, flat subscription, no marketplace, no integrated video or payments.

The teacher app already spans both. Phase 2 deepens the advantages on each side.

---

## Pricing Architecture (implement before or alongside Phase 2 features)

### Commission split: marketplace vs own students

The most impactful single change. Tutorful and MyTutor charge the same commission
whether the tutor found the student or the platform did — tutors find this deeply unfair.

**Proposed model:**
- **Own students** (invited via practice portal): **0% commission**, free on all tiers
- **Marketplace students** (found through the directory): **10% commission**

This undercuts Tutorful/MyTutor by half on marketplace bookings and gives tutors a
strong reason to consolidate their existing students onto the platform.

Implementation: add a `source` flag to the `Match` model (already exists: `marketplace |
invite | manual`). In the payment webhook, apply commission only when `match.source ===
"marketplace"`. The Stripe `application_fee` calculation is already parameterised — this
is a small code change with large marketing impact.

### Updated subscription tiers

Replace the Faresay Starter/Practice/Clinic tiers with tutor-specific tiers:

| Tier | Price | Limits & features |
|---|---|---|
| **Free** | £0/mo | Up to 8 own students, 0% commission on own, marketplace listing, video, scheduling, messaging |
| **Pro** | £15/mo | Unlimited own students, recurring bookings, parent portal, AI lesson notes, resource sharing, branded emails, configurable cancellation policy |
| **Studio** | £45/mo | Multiple teachers under one account, school/agency B2B features, bulk invoicing, white-label branding |

**Rationale:** TutorBird's paid tier is ~£30+/month for scheduling and invoicing only —
no marketplace, no video, no payments. At £15/month this platform offers considerably
more. The free tier is generous enough to acquire tutors without friction; marketplace
commission on directory-sourced students covers the cost of free-tier users.

Update `Subscription.tier` values (`starter | practice | clinic` → `free | pro | studio`)
and the feature-gate checks throughout the codebase. Update Stripe Price IDs in env vars.

---

## Phase 2 Features

### P2-1: Interactive Whiteboard in the Video Call

**Priority:** High — closes the main "just use Google Meet" objection.

**What:** Embed a collaborative whiteboard directly into the lesson video view, visible
to both teacher and student during the call. Tutors currently open a separate Miro,
Jamboard, or share a screen with Desmos — breaking the flow of the lesson.

**Implementation:**
Daily.co has a native whiteboard/annotation layer via their `useAppMessage` API, or
embed an Excalidraw instance (open source, MIT licence) in an iframe alongside the video
frame. The simpler path is Excalidraw: it requires no backend state (the board is synced
peer-to-peer via a shared room ID), and the room ID can be derived from the Session ID
so it's automatically paired to the correct lesson.

```typescript
// Derive whiteboard room from session ID — no new DB field needed
const whiteboardRoom = `lesson-${session.id}`
const whiteboardUrl = `https://excalidraw.com/#room=${whiteboardRoom},<shared-secret>`
```

For a more integrated feel, self-host the Excalidraw collab server — their Docker image
is straightforward to deploy alongside the app. This keeps all data on your
infrastructure.

**New env vars:** `EXCALIDRAW_SERVER_URL` (if self-hosting), `EXCALIDRAW_ROOM_SECRET`

**Schema changes:** None.

**Gating:** Available on all tiers (it's a core lesson feature, not a Pro upsell).

---

### P2-2: Recurring / Standing Bookings

**Priority:** High — solves the most common daily friction for tutors with regular students.

**What:** A tutor and student agree to meet every Tuesday at 5pm. Instead of re-booking
manually each week, a standing booking auto-creates the next session when the current one
completes, and auto-charges the student's saved payment method.

**Implementation:**

Add to the `Match` model:
```prisma
model RecurringBooking {
  id              String   @id @default(cuid())
  matchId         String
  match           Match    @relation(fields: [matchId], references: [id])
  dayOfWeek       Int      // 0=Sun … 6=Sat
  startTime       String   // "17:00"
  durationMins    Int      @default(60)
  ratePence       Int      // locked rate at time of setup
  active          Boolean  @default(true)
  stripePaymentMethodId String? // student's saved card for auto-charge
  nextScheduledAt DateTime
  createdAt       DateTime @default(now())
  pausedUntil     DateTime? // teacher can pause without cancelling

  @@index([matchId])
  @@index([nextScheduledAt])
}
```

A cron job (`/api/cron/recurring`) runs daily, finds `RecurringBooking` records where
`nextScheduledAt` is within 7 days and no Session exists for that slot yet, creates the
Session, and charges the saved payment method via Stripe PaymentIntents with
`confirm: true` and the stored `stripePaymentMethodId`.

The student must save a payment method at setup time (Stripe SetupIntent flow). Add a
"Set up recurring lesson" UI in the Match/Enrolment detail page.

**Gating:** Pro and Studio tiers only.

---

### P2-3: Parent Portal

**Priority:** High — unique in the market, strong conversion driver for GCSE/A-Level parents.

**Pricing model:** The parent portal is the only charge in the platform paid by the
parent rather than the teacher. The teacher offers it as an add-on to the student's
enrolment; the parent subscribes and pays directly. Suggested price: **£4.99/month per
student**. This keeps it off the teacher's margin entirely — it's extra revenue the
platform earns from parents who want visibility, and it makes the teacher's service look
more professional without costing them anything.

**Philosophy:** the best way to handle anxious parents is to flood them with information.
A parent with full visibility has no reason to message the teacher asking for updates.
Everything they could want to know is surfaced automatically.

**What parents get for £4.99/month:**

- **Full lesson transcripts** — the raw verbatim transcript of every lesson, searchable,
  downloadable as PDF. Parents can see exactly what was discussed without interrupting
  the teacher.
- **AI lesson notes** — the structured summary generated from the transcript (topics
  covered, difficulties noted, homework set). Readable in 30 seconds; the transcript
  is there if they want to go deeper.
- **Attendance record** — every scheduled lesson with its status (completed, cancelled,
  no-show), actual start/end time, and duration. Parents can see at a glance if their
  child is showing up and how long the lessons are running.
- **Invoice management** — full payment history, downloadable receipts per lesson,
  upcoming lesson costs. Parents can manage the payment method directly and receive
  their own invoicing emails, independent of the student's account.
- **Read-only message thread with the teacher** — parents can ask the teacher questions
  directly. Kept separate from the student's own message thread.

Parents do not see the lesson video recording, the student's private messages, or any
notes the teacher keeps privately on the student.

**Implementation:**

Add to the schema:
```prisma
model ParentLink {
  id                   String    @id @default(cuid())
  parentUserId         String
  parentUser           User      @relation("parentLinks", fields: [parentUserId], references: [id])
  studentId            String
  student              Student   @relation(fields: [studentId], references: [id])
  status               String    @default("pending") // pending | active | revoked
  token                String    @unique // invite token emailed to parent
  stripeCustomerId     String?   // parent's Stripe customer
  stripeSubscriptionId String?   @unique // parent's portal subscription
  portalActive         Boolean   @default(false) // true once parent has paid
  createdAt            DateTime  @default(now())
  acceptedAt           DateTime?

  parentThread ParentMessageThread?

  @@index([parentUserId])
  @@index([studentId])
}

// Separate message thread between parent and teacher (not visible to student)
model ParentMessageThread {
  id           String     @id @default(cuid())
  parentLinkId String     @unique
  parentLink   ParentLink @relation(fields: [parentLinkId], references: [id])
  teacherId    String
  createdAt    DateTime   @default(now())
  updatedAt    DateTime   @updatedAt

  messages ParentMessage[]
}

model ParentMessage {
  id            String              @id @default(cuid())
  threadId      String
  thread        ParentMessageThread @relation(fields: [threadId], references: [id])
  senderClerkId String
  body          String              @db.Text
  readAt        DateTime?
  createdAt     DateTime            @default(now())

  @@index([threadId, createdAt])
}
```

**Subscription flow:**

1. Teacher invites parent by email from the student's enrolment page. Parent receives
   invite, creates account (or signs in), is linked to the student.
2. On accepting, parent is prompted to subscribe: "Unlock full lesson visibility for
   £4.99/month." Stripe Checkout creates a subscription on the parent's account
   (`ParentLink.stripeSubscriptionId`). Platform keeps 100% — no teacher share.
3. Stripe webhook sets `ParentLink.portalActive = true` on payment confirmation.
4. On cancellation/lapse, `portalActive` flips to false and portal content is paused
   (not deleted — resuming the subscription restores access immediately).

**Transcript storage:**

Daily.co returns transcripts as JSON via their API. On `meeting-ended` webhook, fetch
and store in a new `LessonTranscript` model:

```prisma
model LessonTranscript {
  id         String   @id @default(cuid())
  sessionId  String   @unique
  session    Session  @relation(fields: [sessionId], references: [id])
  rawJson    Json     // Daily.co transcript format (speaker turns)
  plainText  String   @db.Text // flattened for search/PDF export
  createdAt  DateTime @default(now())
}
```

Transcripts are always stored (the AI lesson notes in P2-4 depend on them regardless of
whether a parent portal is active). The parent portal gates *access* to the transcript,
not its existence.

**Parent dashboard** (`/parent/dashboard`):

- Upcoming lessons tab — scheduled lessons with date, time, subject, teacher name
- Lessons tab — past lessons with status badge, duration, link to notes and transcript
- Invoices tab — all payments with downloadable PDF receipts; payment method management
- Messages tab — thread with the teacher

**Attendance record:**

Derived from the existing `Session` model fields that are already populated by the Daily
webhook: `callStartedAt`, `callEndedAt`, `status`, `joinCount`, `clientJoinedAt`,
`teacherJoinedAt`. No new data needed — just expose it in a parent-readable format
(e.g. "Lesson started 3 minutes late, ran for 58 minutes").

**Parent role:** add `PARENT` to `UserRole` enum. Parent accounts cannot book lessons,
appear in the directory, or access teacher-only features.

**New env vars:** `STRIPE_PRICE_PARENT_PORTAL` — Stripe Price ID for the £4.99/month
parent subscription.

**Schema changes:** `ParentLink` (extended), `ParentMessageThread`, `ParentMessage`,
`LessonTranscript`, `PARENT` role in `UserRole` enum.

**Gating:** Teacher must be on Pro or Studio to offer parent portal to their students.
The parent then pays separately — this prevents free-tier teachers from offering a
premium feature the platform can't sustain at that price point.

---

### P2-4: AI Lesson Notes

**Priority:** High — strong Pro tier anchor, saves tutors 5–10 minutes per lesson.

**What:** After a lesson ends, automatically generate a short structured summary:
what was covered, what the student should practise before next time, any areas of
difficulty noted. The teacher sees a draft in their dashboard within a few minutes of
the call ending and can edit before it's shared with the student (and parent, if linked).

**Implementation:**

Daily.co supports meeting transcription via their `/recordings` API (with transcription
enabled on the room). When the Daily webhook fires `meeting-ended`, trigger a background
job:

1. Fetch the transcript from Daily's API
2. Send to Claude with a structured prompt:
   ```
   You are summarising a private tutoring lesson. From the transcript below, extract:
   - Subject and topic covered
   - Key concepts explained
   - Student questions or areas of difficulty
   - Homework or practice tasks set
   Return JSON matching the LessonNote schema.
   ```
3. Save the result as a `LessonNote` record (new model, linked to Session)
4. Mark as `draft` — teacher must approve before it's visible to student/parent
5. Send teacher a push notification: "Your lesson notes are ready to review"

```prisma
model LessonNote {
  id          String   @id @default(cuid())
  sessionId   String   @unique
  session     Session  @relation(fields: [sessionId], references: [id])
  topicsCovered   String   @db.Text
  difficulty      String?  @db.Text
  homework        String?  @db.Text
  teacherEdit     String?  @db.Text // teacher's amendments
  status      String   @default("draft") // draft | approved | shared
  sharedAt    DateTime?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

**New env vars:** `DAILY_TRANSCRIPTION_ENABLED=true` (toggle on the Daily room config),
`ANTHROPIC_API_KEY` (already present in Faresay).

**Cost note:** A 60-minute lesson transcript is ~10,000 tokens. At Claude Haiku pricing
this is negligible per lesson. Use `claude-haiku-4-5-20251001` for cost efficiency;
the structured output task doesn't need a more powerful model.

**Gating:** Pro and Studio tiers only.

---

### P2-5: Resource & Homework File Sharing

**Priority:** Medium — low effort, high daily utility.

**What:** Teachers can upload files to a per-student library (past papers, worksheets,
revision notes). Students can download them and submit work back. Everything lives in
one place instead of being scattered across email and WhatsApp.

**Implementation:**

Extend the existing `ClientDocument` model (already renamed to `StudentDocument` in
Phase 1) with an `uploadedBy` field and a `studentVisible` flag:

```prisma
// Additions to StudentDocument
uploadedBy      String  // "teacher" | "student"
studentVisible  Boolean @default(true)
fileName        String?
fileSizeBytes   Int?
```

Use Cloudinary (already integrated for profile photos) for file storage. Add an upload
endpoint (`/api/student-documents/upload`) that accepts files up to a configurable
limit (suggest 25MB), stores in Cloudinary under `documents/<matchId>/`, and saves the
record.

Add a "Resources" tab to the student detail page (teacher view) and the lesson history
page (student view).

**Gating:** All tiers (basic resource sharing is a core feature; set a per-tier storage
quota if needed — e.g. 100MB free, unlimited Pro).

---

### P2-6: Configurable Cancellation Policy

**Priority:** Medium — small feature, signals the platform is built for professionals.

**What:** Teachers can set their own cancellation window (24h, 48h, or 72h) and choose
whether late cancellations receive a full refund, 50% refund, or no refund.

**Implementation:**

Add to `Teacher`:
```prisma
cancellationWindowHours  Int    @default(24)  // 24 | 48 | 72
lateCancelRefundPercent  Int    @default(100) // 100 | 50 | 0
```

Update the refund logic in the Stripe webhook handler (currently hardcoded to 24h / full
refund) to read these values from the teacher record. Update the booking confirmation
email and the student-facing booking page to display the teacher's specific policy.

**Gating:** All tiers (policy configuration is basic tutor autonomy).

---

## Phase 2 Effort Estimate

| Feature | Dev days | Who pays |
|---|---|---|
| Commission split (own vs marketplace) | 1 | Teacher (reduced rate) |
| Updated subscription tiers + Stripe price IDs | 1 | Teacher |
| P2-1: Interactive whiteboard (Excalidraw embed) | 3 | Teacher (all tiers) |
| P2-2: Recurring bookings + cron + Stripe saved card | 4 | Teacher (Pro+) |
| P2-3: Parent portal (transcripts, notes, attendance, invoices) | 7 | Parent (£4.99/mo/student) |
| P2-4: AI lesson notes (Daily transcription + Claude) | 3 | Teacher (Pro+) |
| P2-5: Resource & homework file sharing | 2 | Teacher (all tiers) |
| P2-6: Configurable cancellation policy | 1 | Teacher (all tiers) |
| Testing (Phase 2) | 3 | — |
| **Total Phase 2** | **~25 dev-days** | |

23 dev-days is roughly 4.5 weeks solo or 2.5 weeks for two developers.

**Recommended Phase 2 order:** pricing architecture first (commission split + new tiers),
then whiteboard and recurring bookings (highest tutor impact), then AI notes and parent
portal (highest parent/Pro conversion impact), then resource sharing and cancellation
policy (quick wins to fill out the Pro tier).

---

## Competitive Positioning Summary

| Feature | Tutorful | MyTutor | TutorBird | This app (v1) | This app (v2) |
|---|---|---|---|---|---|
| Marketplace / directory | ✅ | ✅ | ❌ | ✅ | ✅ |
| Integrated video | ✅ | ✅ | ❌ | ✅ | ✅ |
| Integrated payments | ✅ | ✅ | manual | ✅ | ✅ |
| Practice management | ❌ | ❌ | ✅ | ✅ | ✅ |
| 0% commission on own students | ❌ | ❌ | ✅ | ✅ | ✅ |
| Marketplace commission | ~20–25% | ~20–25% | n/a | 10% | 10% |
| Recurring bookings | ❌ | ❌ | ✅ | ❌ | ✅ |
| Interactive whiteboard | basic | ✅ | ❌ | ❌ | ✅ |
| Parent portal (transcripts, notes, attendance, invoices) | ❌ | ❌ | ❌ | ❌ | ✅ (£4.99/mo, parent pays) |
| AI lesson notes | ❌ | ❌ | ❌ | ❌ | ✅ |
| Resource / homework sharing | ❌ | ❌ | basic | ❌ | ✅ |
| Group lessons | ❌ | ❌ | ❌ | ✅ | ✅ |
| Mobile app | ❌ | ❌ | ❌ | ✅ | ✅ |
| School / B2B accounts | ❌ | ✅ | ✅ | ✅ | ✅ |
