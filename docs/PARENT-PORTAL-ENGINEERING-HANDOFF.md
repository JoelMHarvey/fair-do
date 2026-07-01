# Parent Portal — Engineering Handoff

**Status:** Core infrastructure is built and ships behind `PARENT_PORTAL_ENABLED=true`.
Several features remain incomplete. This document is the canonical hand-off for the
engineering team to take the parent portal from skeleton to production-ready.

---

## What this feature is

Parents pay £4.99/month (family subscription, not per-child) for a read-only view of
their child's tutoring: upcoming lessons, lesson history, attendance, AI lesson notes,
homework set, lesson transcripts, invoices, and a direct message thread with the tutor.

The teacher controls access entirely — they invite the parent by email from the student's
detail page, and they choose whether to share their credentials. The parent then subscribes
via Stripe. The platform keeps 100% of the subscription fee.

Teachers must be on Pro or School tier to offer the parent portal. Free-tier teachers cannot.

---

## Architecture decisions already locked

- **Billing is per-family, not per-child.** One `ParentSubscription` at `£4.99/mo` covers
  all children a parent is linked to. `ParentLink.portalActive` is driven off that family
  record by `syncFamilyPortalAccess()` in `src/lib/parent.ts`.
- **Per-family soft-cap at 6 children** (`FAMILY_SOFT_CAP`). Beyond that, the account is
  flagged for review but access continues. This catches abuse (one account hoarding
  unrelated students) without blocking legitimate large families.
- **Family subscription, one Stripe price.** `STRIPE_PRICE_PARENT_PORTAL` env var holds
  the Stripe Price ID. The existing Stripe webhook at `/api/webhooks/stripe` already
  handles `checkout.session.completed` with `meta.type === 'parent_portal'` and activates
  the family portal.
- **Transcripts are always stored** (when Daily transcription is enabled), gated
  downstream. `LessonTranscript` exists on every session regardless of whether a parent
  portal is active — this is correct, since AI lesson notes also depend on transcripts.
- **Parent messages are separate from student messages.** `ParentMessageThread` →
  `ParentMessage` is a distinct model from the student-facing `MessageThread` → `Message`.
  Students cannot see parent↔teacher messages.
- **`PARENT` is a first-class `UserRole`.** Parents cannot book lessons, appear in the
  directory, or access any teacher features. All parent routes check `user.role === 'PARENT'`.

---

## What is already built

All code is on `main`. Set `PARENT_PORTAL_ENABLED=true` and `STRIPE_PRICE_PARENT_PORTAL=<price_id>` to enable.

### Schema (`prisma/schema.prisma`)
| Model | Purpose |
|---|---|
| `ParentLink` | One row per teacher↔student↔parent relationship. `status: pending/active/revoked`, `token` for invite, `portalActive` flag |
| `ParentSubscription` | One row per parent account. Holds Stripe subscription + `status: inactive/active/past_due/canceled` |
| `ParentMessageThread` | One thread per `ParentLink` (i.e. per teacher, per child) |
| `ParentMessage` | Individual messages in a parent↔teacher thread |
| `LessonTranscript` | Raw Daily.co transcript JSON + flattened plain text. Unique per session |
| `LessonNote` | AI-generated lesson summary (topics, difficulty, homework). Status: `draft/approved/shared` |
| `Package` | Lesson package (N sessions at a fixed price). Linked to teacher + optional student |

Additional fields on existing models:
- `UserRole.PARENT` — parent user role
- `Teacher.showCredentialToParents` (Boolean, default false) — teacher opt-in to show their qualifications on the parent dashboard
- `User.parentSubscription` / `User.parentLinks` — relations to the parent billing models

### API routes
| Route | Purpose |
|---|---|
| `POST /api/teacher/parent/invite` | Teacher invites parent by email for a given matchId. Creates `ParentLink` + sends invite email |
| `GET/POST /api/parent/accept` | Parent accepts the invite token, links their account |
| `POST /api/parent/subscribe` | Creates Stripe Checkout for the £4.99/mo family subscription |
| `POST /api/parent/messages/send` | Parent or teacher sends a message in a parent thread |

The Stripe webhook (`/api/webhooks/stripe`) handles:
- `checkout.session.completed` with `meta.type === 'parent_portal'` → activates the family subscription, calls `syncFamilyPortalAccess()`
- Subscription renewal/cancellation events → `customer.subscription.updated/deleted` handlers (these already exist and check `ParentSubscription` by `stripeSubscriptionId`)

### Pages
| Route | Purpose |
|---|---|
| `/parent/accept/[token]` | Invite acceptance page. Creates parent account if needed, links to student |
| `/parent/subscribe` | Subscribe wall (shown to parents who have accepted but not yet paid). Lists children, shows price, calls `/api/parent/subscribe` |
| `/parent/dashboard` | Main parent dashboard. Child tabs, upcoming lessons, lesson history + attendance, AI lesson notes (when shared), invoices, parent↔teacher messages |
| `/pricing/parents` | Public-facing parent portal pricing page |

### Teacher-side UI
- `src/app/teacher/students/[matchId]/InviteParentForm.tsx` — email form on the student detail page. Teachers enter the parent's email and click "Send invite." Calls `POST /api/teacher/parent/invite`.

### Core logic
`src/lib/parent.ts` — all gating, sync, and grouping logic:
- `PARENT_PORTAL_ENABLED` — feature flag
- `teacherCanOfferParentPortal(teacherId)` — checks teacher subscription tier
- `parentHasActivePortal(parentUserId)` — checks family subscription status
- `syncFamilyPortalAccess(parentUserId, active)` — propagates sub status to all `ParentLink.portalActive` flags + updates the abuse flag
- `groupLinksByChild(links)` — groups multiple tutor links under a single child for the dashboard tabs
- `generateParentToken()` — Web Crypto URL-safe 24-byte hex token

---

## What is NOT yet built (open work)

### 1. Lesson transcripts in the parent dashboard (HIGH)

**What's missing:** `LessonTranscript` is in the schema and recorded per session, but the
parent dashboard does not query or display transcripts.

**Daily transcription must also be enabled at room creation.** Currently the Daily room is
created in `src/lib/daily.ts` at booking time; transcription is not turned on. This needs
to be added when creating the room:

```typescript
// In createDailyRoom() — add to the room config:
transcription: {
  provider: 'daily-speechmatics',  // or 'rev' depending on account plan
  language: 'en',
}
```

**The Daily `meeting-ended` webhook must fetch and store the transcript.** Currently the
`meeting-ended` event in `/api/webhooks/daily/route.ts` marks the session complete. It
needs an additional step:

```typescript
// After session is marked complete:
if (process.env.DAILY_TRANSCRIPTION_ENABLED === 'true') {
  const tx = await fetchDailyTranscript(roomName)  // GET /api/v1/recordings/{id}/transcription
  if (tx) {
    await prisma.lessonTranscript.upsert({
      where: { sessionId: session.id },
      create: { sessionId: session.id, rawJson: tx.raw, plainText: tx.text },
      update: { rawJson: tx.raw, plainText: tx.text },
    })
  }
}
```

**Parent dashboard change** — add a "Transcript" expandable section under each past lesson:

```tsx
// In /parent/dashboard/page.tsx — include transcript on session query:
past = await prisma.session.findMany({
  where: { ... },
  include: { teacher: true, lessonNote: true, transcript: true },
  ...
})

// In the lesson history render:
{s.transcript && (
  <details className="mt-2">
    <summary className="text-xs text-brand-700 cursor-pointer">View transcript</summary>
    <pre className="text-xs text-sand-600 mt-1 whitespace-pre-wrap">{s.transcript.plainText}</pre>
  </details>
)}
```

**New env vars:**
- `DAILY_TRANSCRIPTION_ENABLED=true`
- The Daily.co account must have transcription enabled in the dashboard settings

**Gating:** transcripts are only shown when `DAILY_TRANSCRIPTION_ENABLED` is on AND a
`LessonTranscript` record exists for the session (some sessions will pre-date the feature).

---

### 2. Lesson package purchasing by parents (HIGH)

**What's missing:** The `Package` model exists (teacher creates a package, student draws
sessions from it), but there is no parent-facing flow to browse available packages and
pay for them.

**Design:** When a teacher creates a package tied to a specific student (or a general
package), parents who are linked to that student and have an active portal should be
able to see and purchase it. Packages should appear in a "Packages" tab on the parent
dashboard.

**Schema change needed — seller-initiated vs buyer-initiated packages:**
Add a `buyableByParent` flag to `Package`:

```prisma
// Add to Package model:
buyableByParent  Boolean  @default(false)
description      String?  @db.Text
```

Teachers tick "Allow parent to purchase" when creating a package for a student.

**New API route:** `POST /api/parent/packages/checkout`

```typescript
// Input: { packageId }
// Guards: parentLinkId must link this parent to the package's student
// Creates a Stripe Checkout (one-off payment, not subscription)
// On webhook: sets Package.status = 'active', Package.studentId = match.studentId
// (or credits the student's creditBalancePence for the N sessions)
```

**Parent dashboard — "Packages" tab:**

```tsx
// Query available packages for any of the child's teachers:
const availablePackages = await prisma.package.findMany({
  where: {
    teacherId: { in: teacherIds },
    studentId: student.id,
    buyableByParent: true,
    status: 'active',
  },
})
```

Show: package name, sessions remaining vs total, expiry (if any), price, "Buy now" button.

**Stripe Price:** packages are one-off payments (not subscriptions). Use `mode: 'payment'`
in the Checkout session. Add `meta.type = 'parent_package'` and `meta.packageId` to
route the webhook correctly.

**New webhook handler:** in `/api/webhooks/stripe/route.ts`, handle
`checkout.session.completed` with `meta.type === 'parent_package'`:

```typescript
if (meta.type === 'parent_package') {
  await prisma.package.update({
    where: { id: meta.packageId },
    data: { status: 'active' },  // or create a Payment record
  })
}
```

---

### 3. Goal setting per student (MEDIUM)

**What's missing:** Phase 18.3. No `targetGrade`, `examBoard`, or `examDate` fields exist.

**Schema change:**

```prisma
// Add to Match model:
targetGrade   String?   // e.g. "A*", "Grade 5", "Pass"
examBoard     String?   // e.g. "AQA", "Edexcel", "OCR", "WJEC"
examDate      DateTime?
```

Run `prisma db push` after adding.

**Teacher UI:** add three optional fields to the student detail page
(`/teacher/students/[matchId]`): target grade (free text), exam board (dropdown: AQA /
Edexcel / OCR / WJEC / Pearson / Other), exam date (date picker). Save via a
`PATCH /api/practice/students/[matchId]` request (this route already exists for notes).

**Parent dashboard:** show a "Goal" band above the lesson history when these fields are set:

```tsx
{match?.targetGrade && (
  <div className="bg-brand-50 rounded-xl border border-brand-100 px-4 py-3 mb-6 text-sm">
    <span className="font-medium text-brand-800">Target:</span>{' '}
    {match.examBoard && `${match.examBoard} `}{match.targetGrade}
    {match.examDate && ` · exam ${fmtDate(match.examDate)}`}
  </div>
)}
```

The parent dashboard query needs the `match` record. Fetch the first active link's match:

```typescript
const match = await prisma.match.findFirst({
  where: { teacherId: selected.links[0].teacherId, studentId: student.id },
  select: { targetGrade: true, examBoard: true, examDate: true },
})
```

---

### 4. Progress graph (MEDIUM)

**What's missing:** Phase 18.4. A visual chart of sessions completed, topics covered, and
(optionally) attendance over time.

**Approach:** use a lightweight chart library already available in the Next.js stack
(Recharts is already in `package.json`). Do not pull in a new dependency.

**Data source:** all data is already in `Session` + `LessonNote`:
- Sessions completed per month: count `Session` records grouped by month
- Topics covered: pull `LessonNote.topicsCovered` strings and tag-parse or display verbatim
- Attendance rate: `(callStartedAt != null) / total sessions`

**New component:** `src/components/ParentProgressChart.tsx`

```tsx
// Client component (recharts needs the browser)
'use client'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

type Props = { data: { month: string; sessions: number }[] }
export function ParentProgressChart({ data }: Props) {
  return (
    <ResponsiveContainer width="100%" height={120}>
      <BarChart data={data}>
        <XAxis dataKey="month" tick={{ fontSize: 11 }} />
        <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
        <Tooltip />
        <Bar dataKey="sessions" fill="var(--color-brand-600)" radius={[3, 3, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
```

Compute the monthly rollup in the parent dashboard page server component (no new API
route needed) and pass it as props. Cap at 6 months of history.

**Export as PDF** (Phase 18.4 stretch goal): use the browser print dialog (`window.print()`)
with a print-only CSS class that hides the nav and formats the progress data cleanly.
No PDF library needed.

---

### 5. Parent navigation (MEDIUM)

**What's missing:** The parent dashboard currently has only a Logo + "Sign out" link.
The user spec asks for a "separate menu" for parents.

**New component:** `src/components/ParentNav.tsx`

```tsx
// Sticky top nav for parent-role users. Separate from TeacherNav / SiteNav.
// Links: Dashboard, Packages, Messages, Account (Stripe billing portal)
export function ParentNav({ childName }: { childName?: string }) { ... }
```

Tab structure (map to sections of `/parent/dashboard` via hash or query params):
- **Dashboard** — upcoming lessons + lesson history (current default view)
- **Packages** — buy and track lesson packages (item 2 above)
- **Invoices** — payment history
- **Messages** — direct thread(s) with tutor(s)
- **Account** — link to Stripe Customer Portal so parent can update their card or cancel

**Stripe Customer Portal link** — generate on the server side (one request to Stripe, redirect to the portal URL). Add `GET /api/parent/billing-portal`:

```typescript
const portalSession = await stripe.billingPortal.sessions.create({
  customer: sub.stripeCustomerId,
  return_url: `${appUrl}/parent/dashboard`,
})
return redirect(portalSession.url)
```

---

## Environment variables

| Variable | Value | Status |
|---|---|---|
| `PARENT_PORTAL_ENABLED` | `true` | **Must set to enable all parent routes** |
| `STRIPE_PRICE_PARENT_PORTAL` | Stripe Price ID for `£4.99/mo` recurring | **Must create in Stripe and set** |
| `DAILY_TRANSCRIPTION_ENABLED` | `true` | Set when Daily transcription is configured |

---

## Feature flag and tier gating summary

| Gate | Where enforced |
|---|---|
| `PARENT_PORTAL_ENABLED=true` | `src/lib/parent.ts` — every parent route and API checks this first |
| Teacher must be Pro/School | `teacherCanOfferParentPortal()` — checked in the invite API |
| Parent must have paid | `parentHasActivePortal()` — checked in the dashboard page; redirects to `/parent/subscribe` if false |
| `Teacher.showCredentialToParents` | Parent dashboard filters tutors by this flag before showing credential info |

---

## Data access model and privacy

The parent dashboard queries sessions and payments by `studentId`. This is correct:
parents see data for their child, not for the teacher's other students.

**What parents can see:**
- Upcoming and past session dates, times, duration, teacher name
- Attendance record (derived from `callStartedAt`/`callEndedAt` on each session)
- AI lesson notes (only when `LessonNote.status === 'shared'` — teacher explicitly shares)
- Lesson transcripts (when Daily transcription is on and teacher has shared notes — same gate)
- All payments related to that student
- The teacher's credentials (only when `Teacher.showCredentialToParents === true`)
- Message threads between themselves and the teacher

**What parents cannot see:**
- The teacher's private notes on the student (`Match.teacherNotes` / `NotesEditor`)
- The student's own message thread with the teacher (`MessageThread`)
- Any notes in `draft` or `approved` status (only `shared` is visible)
- Other students of the same teacher
- Lesson video recordings (not stored; Daily.co rooms are session-scoped and expire)

---

## Testing checklist

Before enabling `PARENT_PORTAL_ENABLED=true` in production, verify:

- [ ] Teacher on Free tier — invite button hidden / invite API returns 403
- [ ] Teacher on Pro tier — invite button visible, invite sent, email received
- [ ] Parent accepts invite — `ParentLink.status` flips to `active`, role set to `PARENT`
- [ ] Parent subscribes — Stripe Checkout completes, webhook fires, `ParentSubscription.status = 'active'`, `ParentLink.portalActive = true`
- [ ] Parent dashboard loads correct child data — no cross-student data leak
- [ ] Multi-child parent — child tabs appear, switching tab shows correct lessons/payments
- [ ] Parent cancels subscription — `portalActive` flips to false, dashboard redirects to `/parent/subscribe`
- [ ] Teacher revokes parent link — `ParentLink.status = 'revoked'`, parent loses access
- [ ] Lesson note shared — visible in parent dashboard; draft/approved note hidden
- [ ] Transcript shown (when DAILY_TRANSCRIPTION_ENABLED) — only on sessions with a `LessonTranscript` record
- [ ] IDOR check — parent cannot access another student's data by changing `child` query param

---

## Launch order recommendation

Given what's already built, the recommended order to reach a shippable parent portal:

1. **Enable the flag** — set `PARENT_PORTAL_ENABLED=true`. Everything built above goes live.
   The invite → accept → subscribe → dashboard flow is complete.

2. **Transcripts (item 1)** — highest parent value, differentiates from every competitor.
   Needs Daily transcription turned on + webhook fetch + dashboard display. ~3 dev-days.

3. **Parent navigation (item 5)** — quick win, makes the portal feel complete. ~1 dev-day.

4. **Goal setting (item 3)** — low effort, high visibility on dashboard. ~1 dev-day.

5. **Lesson package purchasing (item 2)** — enables upsell revenue per family beyond the
   £4.99 subscription. ~3 dev-days.

6. **Progress graph (item 4)** — nice to have, data is already available. ~2 dev-days.

Total remaining: ~10 dev-days to reach full-feature parity with the product spec.

---

## Legal notes

- Parent portal handles data about children (students under 18). This falls within the
  heightened protection rules in UK GDPR. Get lawyer sign-off on the parent consent
  wording before public launch.
- The teacher is the data controller; fair-do is the processor. The `ParentLink` invite
  flow means the teacher is the one choosing to share data with the parent — this is
  consistent with the data controller relationship.
- Lesson transcripts are personal data. The privacy notice must cover transcript storage,
  access by parents, and retention period. Recommend: transcripts auto-deleted 12 months
  after the session, or on teacher account closure.
- The £4.99 subscription is a contract with the parent. T&Cs must cover what happens on
  cancellation (access pauses, data retained), what happens if the teacher leaves the
  platform (portal access ends for that teacher's link), and the refund policy.
