# fair-do for Schools (Enterprise) — Product & Engineering Plan

**Status: IN BUILD (2026-07-02).** M0–M3 are being implemented on this branch —
see §0 for build status and the M4 items that need dashboard configuration.
Same backend, per-school front-end customisation: branding, academic structure
(years / houses / classes / subjects), staff contact list, mail groups, and calendars.

---

## 0. Build status & go-live configuration

Everything ships **dark** behind `ENTERPRISE_PORTAL_ENABLED` (env) and per-org
`Organisation.plan` (`portal` | `portal_plus`). Code map:

| Piece | Where |
|---|---|
| Tenant resolution | `src/proxy.ts` (host → `x-tenant-slug`/`x-tenant-domain`) → `src/lib/tenant.ts` `getTenant()` |
| School roles | `src/lib/org.ts` (`getMySchool`/`requireSchoolAdmin`/`requireSchoolMember`), `src/lib/school.ts` (page/API context) |
| Theming | `src/lib/theme.ts` (one hex → OKLCH 50–900 ramp, WCAG-AA floors) injected by `src/app/layout.tsx` |
| School console | `src/app/school/*` + `src/app/api/school/*` |
| Public tenant pages | `/contacts`, `/school-calendar` (+ ICS feed `/api/school-calendar/[token]`) |
| Isolation guarantee | `tests/db/tenant-isolation.dbtest.ts` (CI real-DB job) |

### To take a pilot school live (ops checklist — the M4 external pieces)

1. **Vercel**: add wildcard domain `*.fair-do.com` to the project (Domains →
   add `*.fair-do.com`, Cloudflare DNS: `CNAME * cname.vercel-dns.com`,
   proxy OFF for the wildcard record so Vercel can issue certs).
2. **Env**: set `ENTERPRISE_PORTAL_ENABLED=true` (Production).
3. **Create the org** in `/admin/orgs` (or SQL): set `slug`, `plan='portal'`,
   `contactEmail` = the school admin who signs in first.
4. **Clerk**: no per-tenant config needed for subdomain sign-in on satellite
   domains? — verify session behaviour on `{slug}.fair-do.com`; if cookies don't
   span subdomains, set the Clerk cookie domain to `.fair-do.com` in the Clerk
   dashboard (single instance covers all subdomains).
5. **Custom domain (Portal+, later)**: Vercel Domains API + set
   `Organisation.customDomain`; requires the school's IT to CNAME onto Vercel.
6. **SSO (Portal+, later)**: Clerk enterprise connection (SAML/OIDC) per school
   — Microsoft 365 / Google Workspace.
7. **Stripe (annual invoicing, later)**: create `portal`/`portal_plus` Prices;
   invoice via Stripe Invoicing — no code dependency for the pilot (plan is set
   on the org row by the platform admin).

Not built yet (deliberately deferred): custom-domain automation, per-school SSO,
Stripe invoicing lifecycle, onboarding wizard, admin impersonation-view, MIS
roster sync (Wonde/Arbor), native-app tenant theming, Clerk sign-in appearance
theming per tenant.

---

## 1. The idea in one paragraph

A school buys fair-do Enterprise and gets **their own branded tutoring portal** —
`stgeorges.fair-do.com` (or their own domain) — running on the exact same backend as
fair-do.com: bookings, payments, video lessons, messaging, safeguarding, AI lesson
notes, parent portal. The school configures it to mirror how the school actually works:
their logo and colours, their year groups, houses, classes and subject list, a staff
contact directory, mail groups for announcements, and calendars (term dates, school
events, alongside the existing lesson calendar). Nothing is forked; everything a school
changes is **data, not code**.

---

## 2. Why this works (and one warning)

### What already exists that this builds on

| Capability | Where it lives today |
|---|---|
| Org entity with domain auto-enrol, credit pool, discounts | `Organisation` — `prisma/schema.prisma:366`; `src/lib/org.ts` |
| School-tier subscription (£79) + org billing waterfall (pool → credit → Stripe) | `Subscription` model, `src/lib/billing.ts`, Phase 9.12 |
| Org self-serve portal + admin management | `/org`, `/admin/orgs/[id]` |
| Per-entity branding pattern (logo URL + hex colour, validated, Cloudinary) | Per-tutor email branding — `src/lib/email-brand.ts`, `Teacher.brand*` fields |
| Runtime-themeable design tokens | Tailwind v4 CSS-first `@theme` block — `src/app/globals.css:3-42`. Tokens are already CSS custom properties, so per-tenant theming is a CSS-variable override, not a Tailwind rebuild |
| Broadcast messaging (tutor → all students) | `Broadcast` / `BroadcastTemplate` models |
| Calendar plumbing: ICS feeds, .ics invites, availability grid | `Teacher.calendarToken`, booking emails, `/availability` |
| Roles, safeguarding, GDPR, audit trails, i18n, mobile API | Site-wide |

The delta is **not** a new product — it is a tenancy layer plus five configuration
surfaces on top of a working platform. That's what makes it viable.

### The warning: stay a tutoring portal, not a school intranet

"Year, house, class, subject, staff contacts, mail groups, calendars" is also the
feature list of an MIS/intranet (SIMS, Arbor, Bromcom, Firefly). We will not win — and
should not fight — that battle. Every one of those features exists in v1 **in service of
tutoring**:

- **Structure** (year/house/class/subject) → scopes which students see which tutors,
  powers reporting ("Year 11 maths intervention group: 84% attendance"), and feeds
  mail-group membership.
- **Staff contacts** → so parents/students know who owns tutoring at the school and
  tutors know who to escalate to (incl. the DSL for safeguarding).
- **Mail groups** → announcement lists derived from structure ("all Year 10 parents"),
  used by the existing broadcast system.
- **Calendars** → term dates and school events so bookings avoid holidays, plus the
  existing lesson calendar, exported as ICS.

If a school asks for homework, behaviour points, or registers — that's the MIS's job.
The pitch is: *"your school's tutoring programme, under your brand, with zero admin."*

### Who buys it and why

- **Buyer:** deputy head / head of raising standards (budget holder for intervention
  and catch-up tutoring), with the bursar signing. Entry via the existing `/for-schools`
  page and outbound motion (`docs/OUTBOUND-SALES-MOTION.md`).
- **Their problem:** schools run tutoring through spreadsheets + email + whatever the
  tutor uses. No branding, no oversight, no safeguarding audit trail, no reporting to
  governors/parents.
- **Funding models supported by the existing billing waterfall:** school-funded (credit
  pool), parent-funded (Stripe direct), or mixed (school discount on parent bookings).

---

## 3. Product definition (v1)

**Tenant = a school.** One `Organisation` record becomes a full tenant.

### What a school admin can customise (the five surfaces)

1. **Branding** — logo, brand colour (we derive the full 50–900 palette from one hex),
   optional accent colour, school name, welcome message, footer contact line. Applied to
   the portal UI *and* outbound emails. Custom subdomain `{slug}.fair-do.com`; custom
   domain (CNAME) in a later milestone.
2. **Academic structure** — year groups (Year 7–13, or custom names), houses, classes
   (form groups and/or teaching sets), and the school's subject list (mapped to fair-do's
   marketplace subjects so matching still works). Students are assigned to
   year/house/class(es) at import or by the admin.
3. **Staff contact directory** — name, role/title, department, email, phone (optional),
   photo (optional), visibility (students / parents / tutors / public). Staff are
   directory entries, *not* fair-do accounts, unless invited. Special flagged roles:
   tutoring coordinator, DSL (Designated Safeguarding Lead) — the DSL is surfaced in
   safeguarding flows for that tenant.
4. **Mail groups** — named lists with membership either **rule-based** ("all parents of
   Year 10", "all students in Churchill house", "all tutors working with this school")
   or **manual** (picked members). Used as audiences for the existing broadcast system;
   school admins get a broadcast composer.
5. **Calendars** — term dates, holidays (INSET days), and school events; multiple named
   calendars (whole-school, per-year, exam timetable). Rendered in the portal, exported
   as ICS, and **enforced in booking**: term dates warn/block lesson bookings on
   holidays (school-configurable: warn vs block).

### What stays shared (the point of "same backend")

Booking, payments (Stripe Connect), video (Daily), messaging, AI notes, parent portal,
safeguarding tooling, complaints, credential verification, admin, cron jobs, mobile API.
One codebase, one database, one deployment.

### Personas and permissions

| Persona | Access |
|---|---|
| **School admin** (new) | Full tenant config: branding, structure, staff, mail groups, calendars, member management, broadcasts, reports, pool top-up |
| **School staff** (new, optional) | Read-only reports + broadcast to their own groups (e.g. head of Year 10) |
| Student (existing) | Sees the branded portal; browses/books only tutors approved for the school (or the open marketplace if the school allows) |
| Parent (existing) | Branded parent portal; school may pre-pay so parents see £0 |
| Tutor (existing) | Unchanged back-office; sees which school a student belongs to + school escalation contacts |
| fair-do platform admin (existing) | Everything, cross-tenant |

### Explicitly out of scope for v1

Custom domains with automated TLS (M4), per-school SAML SSO (M4), MIS roster sync via
Wonde/Arbor API (post-GA; CSV import covers v1), timetable/room booking, homework or
behaviour tracking, per-school feature code forks (never).

---

## 4. Commercial model (proposal — founder decision)

| Tier | Price | What it is |
|---|---|---|
| School (existing) | £79/mo | What exists today: credit pool, domain auto-enrol, discounts, `/org` portal |
| **Enterprise: Portal** | **£2,400/yr** (≈£200/mo) | Branded subdomain, structure, staff directory, mail groups, calendars, school-admin console, reports |
| **Enterprise: Portal+** | **£4,800/yr** | Portal + custom domain, SSO (Microsoft 365 / Google Workspace), priority onboarding, MIS CSV templates, per-department reporting |

- Annual invoicing (schools budget annually; Stripe invoicing, not checkout).
- Commission on lessons is unchanged — the enterprise fee is for the portal, so it
  doesn't cannibalise the fair-pricing story.
- **Pilot:** 2–3 design-partner schools at 50% off year one in exchange for feedback and
  a case study. Do not build M3/M4 until at least one pilot school is live on M1/M2.
- Rough viability: 20 schools on Portal ≈ £48k ARR against ~10–14 engineer-weeks of
  build — before any uplift from lesson volume those schools bring.

---

## 5. Architecture decisions (lock these before building)

**D1 — Extend `Organisation`; do not create a new tenant model.**
It already has `domain`, `creditPoolPence`, `discountPercent`, admin pages, and billing
integration. Add `slug`, `plan`, branding fields, and settings JSON. A parallel
`School`/`Tenant` model would duplicate the billing waterfall and org resolution in
`src/lib/org.ts`.

**D2 — Tenant resolution by subdomain in the middleware.**
`src/proxy.ts` (already the locale/auth boundary) reads the `Host` header:
`{slug}.fair-do.com` → look up org by slug (cache in Redis/Upstash, ~60s TTL) → set an
`x-tenant` header consumed by server components/layouts. Apex `fair-do.com` = no tenant
= the marketplace, untouched. Vercel wildcard domain `*.fair-do.com`. Custom domains
later via the Vercel Domains API (M4).

**D3 — Theming is runtime CSS-variable override, not a Tailwind build.**
Tailwind v4 tokens in `src/app/globals.css` are plain CSS custom properties
(`--color-brand-600` etc.). A tenant-aware root layout injects one `<style>` block that
overrides `--color-brand-50…900` (+ coral accent) generated from the school's single
brand hex by a small colour-ramp utility (`src/lib/theme.ts`, new — OKLCH lightness
ramp so contrast/accessibility holds for any input colour). Logo swaps in
`src/components/Logo.tsx` behind a tenant prop. **Zero per-tenant CSS builds.**
Reuse the hex/URL validation already written in `src/lib/email-brand.ts`.

**D4 — Configuration as data; one codebase forever.**
Everything in §3 is rows in new tenant-scoped tables. No school-specific branches,
env vars, or components. A school with no config renders identically to today.

**D5 — RBAC via a membership table, not new `UserRole` values.**
New model `OrgMembership (userId, organisationId, role: ADMIN | STAFF)` for school-side
roles; students keep `Student.organisationId` (already exists). A user's platform role
(`STUDENT/TEACHER/PARENT/ADMIN`) is unchanged — school-admin is *additive*, so a parent
can also be the school's tutoring coordinator. Guard helper `requireOrgAdmin(orgId)` in
`src/lib/org.ts` beside the existing `getMyOrg()`.

**D6 — Tenant scoping discipline.**
Every new model carries `organisationId` + index. All new queries go through helpers
that take the tenant from `x-tenant` server-side (never from the client). Add a
`tests/db/tenant-isolation.dbtest.ts` real-DB test that asserts cross-tenant reads fail
— same pattern as the existing GDPR-erasure db tests.

**D7 — Feature flag: `ENTERPRISE_PORTAL_ENABLED`.**
Ships dark, same convention as `PARENT_PORTAL_ENABLED` / `STUDIO_PORTAL_ENABLED`.
Per-org gate is `Organisation.plan`.

---

## 6. Data model changes (Prisma sketch)

Extend `Organisation` (`prisma/schema.prisma:366`):

```prisma
model Organisation {
  // ...existing fields unchanged...
  slug            String?  @unique      // subdomain: {slug}.fair-do.com
  plan            String   @default("school") // school | portal | portal_plus
  brandLogoUrl    String?               // Cloudinary, same validation as email-brand
  brandColor      String?               // #rrggbb → ramp generated at render
  accentColor     String?
  welcomeMessage  String?  @db.Text
  footerLine      String?
  customDomain    String?  @unique      // M4
  settings        Json?                 // booking policy: block-vs-warn on holidays, marketplace visibility, etc.

  memberships     OrgMembership[]
  yearGroups      YearGroup[]
  houses          House[]
  schoolClasses   SchoolClass[]
  subjects        OrgSubject[]
  staffContacts   StaffContact[]
  mailGroups      MailGroup[]
  calendars       OrgCalendar[]
}

model OrgMembership {
  id             String   @id @default(cuid())
  organisationId String
  organisation   Organisation @relation(fields: [organisationId], references: [id])
  userId         String
  role           String   // ADMIN | STAFF
  createdAt      DateTime @default(now())
  @@unique([organisationId, userId])
  @@index([userId])
}

model YearGroup {  // "Year 7" … custom names allowed
  id String @id @default(cuid())
  organisationId String
  name  String
  order Int
  @@unique([organisationId, name])
  @@index([organisationId])
}

model House {
  id String @id @default(cuid())
  organisationId String
  name  String
  color String?   // house colour, shown as a chip
  @@unique([organisationId, name])
  @@index([organisationId])
}

model SchoolClass { // form group or teaching set
  id String @id @default(cuid())
  organisationId String
  name        String  // "10B", "Set 1 Maths"
  kind        String  // form | set
  yearGroupId String?
  subjectId   String? // for teaching sets
  @@unique([organisationId, name])
  @@index([organisationId])
}

model OrgSubject { // the school's subject list, mapped to marketplace subjects
  id String @id @default(cuid())
  organisationId   String
  name             String   // "Mathematics"
  marketplaceKey   String?  // maps to Teacher.subjects[] values so matching works
  examBoard        String?  // AQA | Edexcel | OCR — feeds Phase 19 curriculum work
  @@unique([organisationId, name])
  @@index([organisationId])
}

model StudentOrgProfile { // structure assignment; keeps Student untouched
  id String @id @default(cuid())
  organisationId String
  studentId      String  @unique
  yearGroupId    String?
  houseId        String?
  classIds       String[]
  @@index([organisationId])
}

model StaffContact { // directory entry, NOT an account
  id String @id @default(cuid())
  organisationId String
  name       String
  title      String   // "Head of Year 10"
  department String?
  email      String
  phone      String?
  photoUrl   String?
  isDSL      Boolean @default(false) // surfaced in safeguarding flows
  isTutoringCoordinator Boolean @default(false)
  visibility String  @default("parents") // students | parents | tutors | public
  order      Int     @default(0)
  @@index([organisationId])
}

model MailGroup {
  id String @id @default(cuid())
  organisationId String
  name  String
  rule  Json?   // {audience:"parents", yearGroupId?, houseId?, classId?} — null = manual
  @@unique([organisationId, name])
  @@index([organisationId])
}

model MailGroupMember { // manual members only; rule-based resolved at send time
  id String @id @default(cuid())
  mailGroupId String
  email       String
  name        String?
  @@unique([mailGroupId, email])
}

model OrgCalendar {
  id String @id @default(cuid())
  organisationId String
  name     String  // "Term dates", "Year 11 exams"
  color    String?
  icsToken String  @unique @default(cuid()) // read-only ICS feed
  events   OrgCalendarEvent[]
  @@index([organisationId])
}

model OrgCalendarEvent {
  id String @id @default(cuid())
  calendarId String
  calendar   OrgCalendar @relation(fields: [calendarId], references: [id])
  title    String
  startsAt DateTime
  endsAt   DateTime
  allDay   Boolean @default(true)
  kind     String  @default("event") // term | holiday | inset | exam | event
  @@index([calendarId, startsAt])
}
```

Also: add `organisationId String?` + index to **`Broadcast`** (school-sent
announcements reuse the broadcast pipeline with a `mailGroupId` audience).
Migrations for every change — the schema-drift CI job enforces this.

---

## 7. Delivery plan — milestones for the dev team

Estimates assume one engineer familiar with the codebase; gates for every PR are the
existing CI: `tsc --noEmit`, `eslint`, `vitest` (unit + integration), `next build`,
real-DB tests, schema-drift guard, migrations included.

### M0 — Tenancy foundation (~2–3 weeks) · *everything else depends on this*

| # | Ticket | Acceptance criteria |
|---|---|---|
| 0.1 | Schema: extend `Organisation` (slug, plan, branding, settings) + `OrgMembership`; migration | Drift guard green; existing org flows unaffected |
| 0.2 | Subdomain tenant resolution in `src/proxy.ts` + `getTenant()` server helper; Redis-cached slug lookup | `{slug}.fair-do.localhost:3000` resolves the tenant; apex unchanged; unknown slug → 404 page with fair-do branding |
| 0.3 | Vercel wildcard domain `*.fair-do.com` + preview-env strategy documented in `docs/LAUNCH.md` | Works on prod + preview deploys |
| 0.4 | `requireOrgAdmin()` / `requireOrgMember()` guards in `src/lib/org.ts`; school-admin invite flow (email link, same pattern as parent invite) | Non-members get 403; invite accept creates `OrgMembership` |
| 0.5 | Tenant-isolation real-DB test (`tests/db/tenant-isolation.dbtest.ts`) | Cross-tenant read/write attempts fail for every new model |
| 0.6 | Feature flag `ENTERPRISE_PORTAL_ENABLED`; per-org `plan` gate helper | Ships dark |

### M1 — Branding & the school shell (~1–2 weeks) · *the demo-able moment*

| # | Ticket | Acceptance criteria |
|---|---|---|
| 1.1 | `src/lib/theme.ts` — OKLCH ramp generator: one hex → `--color-brand-50…900` overrides; unit-tested for contrast (WCAG AA on white/sand) | Any valid hex produces an accessible ramp |
| 1.2 | Tenant-aware root layout: inject theme `<style>`, swap logo, school name in nav/footer/`<title>`/theme-color | Portal renders fully in school branding; apex untouched |
| 1.3 | School-admin console shell at `/school` (tenant-scoped; nav pattern copied from `/teacher` layout) + branding editor (logo upload via existing Cloudinary widget, colour pickers with live preview) | Admin saves branding; portal reflects it without deploy |
| 1.4 | Extend `email-brand.ts` resolution: org branding applies to emails for that tenant's students/parents | Booking-confirm email carries school logo/colour |
| 1.5 | Branded sign-in: Clerk appearance vars driven by tenant theme | Sign-in on subdomain looks like the school |

### M2 — Academic structure, members & staff directory (~2–3 weeks)

| # | Ticket | Acceptance criteria |
|---|---|---|
| 2.1 | Schema: `YearGroup`, `House`, `SchoolClass`, `OrgSubject`, `StudentOrgProfile`, `StaffContact`; migrations | Drift guard green |
| 2.2 | `/school/structure` CRUD (years, houses, classes, subjects) with a one-click "UK secondary preset" (Years 7–13) | Admin sets up a school in <10 min |
| 2.3 | Member management: `/school/members` — list students (existing domain auto-enrol + invite), assign year/house/class | Assignments visible on student rows |
| 2.4 | **CSV import** for students + assignments (extend `/teacher/students/import` pattern); template download; dry-run preview | 500-row file imports with per-row error report |
| 2.5 | `/school/staff` CRUD + public-facing `/contacts` page on the tenant portal (visibility-filtered); DSL flag surfaced on tenant `/help` and complaint flows | Parent sees staff list; DSL shown in safeguarding routes for that tenant |
| 2.6 | Subject mapping: `OrgSubject.marketplaceKey` filters/boosts tutor matching for tenant students; tenant `/tutors` directory scoped per org `settings` (approved-tutors-only vs open marketplace) | Tenant student sees the school's configured view |
| 2.7 | Reports v1: `/school/reports` — lessons, attendance, spend by year group/subject; CSV export (extend existing org monthly-usage table) | Deputy head can answer "what did Year 11 maths cost this term?" |

### M3 — Mail groups, broadcasts & calendars (~2–3 weeks)

| # | Ticket | Acceptance criteria |
|---|---|---|
| 3.1 | Schema: `MailGroup`, `MailGroupMember`, `Broadcast.organisationId`; migrations | Drift guard green |
| 3.2 | `/school/mail-groups` — rule builder (audience × year/house/class) + manual lists; live member-count preview; rule resolution at send time | "All Year 10 parents" resolves correctly as membership changes |
| 3.3 | School broadcast composer reusing `Broadcast` pipeline + Resend; per-tenant branding; rate-limited; unsubscribe honoured for non-transactional sends | Announcement lands branded in inboxes; audit row stored |
| 3.4 | Schema: `OrgCalendar`, `OrgCalendarEvent`; migrations | Drift guard green |
| 3.5 | `/school/calendars` CRUD + **ICS import** (term-date files) and per-calendar read-only ICS feed URL (reuse `calendarToken` pattern) | Google/Outlook subscribe works |
| 3.6 | Portal calendar page merging school calendars + the student's lessons | One view, colour-coded per calendar |
| 3.7 | Booking-flow integration: holiday/term rules warn or block per org `settings.bookingPolicy` | Booking on an INSET day shows the school's warning/block |

### M4 — Enterprise hardening & Portal+ (~2–3 weeks, start only after a pilot school is live)

| # | Ticket | Acceptance criteria |
|---|---|---|
| 4.1 | Custom domains: Vercel Domains API + `Organisation.customDomain`, verification UI | School portal on `tutoring.stgeorges.sch.uk` |
| 4.2 | SSO: Clerk enterprise connections (Microsoft 365 / Google Workspace) per org | Staff/students sign in with school accounts |
| 4.3 | Annual invoicing: Stripe invoices for `portal`/`portal_plus` plans; renewal cron + dunning alert (reuse `CronRun`/`AlertState`) | Invoice lifecycle visible in `/admin/orgs/[id]` |
| 4.4 | Onboarding wizard: brand → preset structure → CSV import → first broadcast, with progress checklist | New school live in under an hour |
| 4.5 | Platform-admin tenant tools: impersonate-view (read-only), per-tenant usage in `/admin/orgs/[id]` | Support can see what a school sees |
| 4.6 | Load/perf pass: tenant lookup cache hit rate, no N+1 on themed layout; Sentry tags carry `orgId` | p95 unchanged on apex |

**Post-GA (explicitly deferred):** MIS roster sync (Wonde/Arbor APIs), per-school
timetable awareness, native-app tenant theming (`native/`), multi-school trusts
(MAT parent orgs), curriculum heatmaps per class (joins Phase 19).

---

## 8. Security, compliance & safeguarding notes

- **Controller/processor shift.** For school-managed students the *school* is the data
  controller and fair-do the processor — we need a school-facing DPA template (extend
  `docs/LEGAL-BRIEF.md` scope with Harper James; DfE "Data protection in schools"
  guidance applies). This is a legal-track task to run in parallel with M0, not after.
- **Children's data at greater scale.** CSV import means bulk under-18 data. DPIA
  addendum required before the first pilot import (existing DPIA is Phase 6.2).
- **Safeguarding.** Tenant `/help` and complaint routes must surface the school's DSL
  (`StaffContact.isDSL`) alongside — never instead of — the platform-wide
  NSPCC/Childline lines and the escalation path in `docs/SAFEGUARDING-RUNBOOK.md`.
- **Tenant isolation is the headline security risk.** Mitigations: D6 helper discipline,
  the real-DB isolation test as a CI gate, `orgId` on Sentry events, and a pen-test pass
  (extends the pre-launch item in `docs/SECURITY.md`) before the second school onboards.
- **Broadcast abuse.** School broadcasts are rate-limited per org, DKIM-signed via the
  existing Resend domain, and audit-logged; manual mail-group members require the
  admin to affirm consent basis at import (legitimate interest for school comms).
- **Theming input hygiene.** Colours validated `#rrggbb`, logos restricted to Cloudinary
  URLs (reuse `email-brand.ts` validators); welcome/footer text rendered as text, never
  HTML — no stored-XSS via tenant config. CSP in `next.config.ts` already restricts
  script/img origins; keep tenant assets within it.

---

## 9. Open questions (founder decisions needed)

| # | Question | Recommendation |
|---|---|---|
| 1 | Pricing/packaging in §4 — agree numbers? | Start Portal £2,400/yr; adjust after 3 pilot conversations |
| 2 | Can tenant students see the open marketplace, or only school-approved tutors? | Per-org setting, default **approved-only** (schools will demand vetting control) |
| 3 | Do school staff get platform accounts in v1, or directory-only? | Directory-only + `OrgMembership` for admins; full staff accounts wait for SSO (M4) |
| 4 | Independent (private) schools first, or state schools? | Independents first: single decision-maker, parent-funded, less procurement friction; state schools once DPA/DfE pack exists |
| 5 | Brand the product? ("fair-do for Schools" vs a separate name) | Keep fair-do brand — trust transfers, and `/for-schools` already ranks |
| 6 | Pilot targets | Use `docs/OUTBOUND-SALES-MOTION.md` contacts; aim for 2 signed design partners before M2 completes |

---

## 10. Definition of done (GA)

- Two pilot schools live ≥ 1 term: branded portal, structure configured, ≥1 CSV import,
  ≥3 broadcasts sent, term calendar enforced in booking, monthly report exported.
- Zero cross-tenant data incidents; isolation db-test + pen-test pass green.
- Apex marketplace metrics (conversion, p95 latency) unchanged from pre-M0 baseline.
- School DPA template signed by both pilots; DPIA addendum filed.
- Onboarding wizard gets a new school demo-ready in < 1 hour without engineering help.
