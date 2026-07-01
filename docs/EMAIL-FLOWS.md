# Email Flows & Templates

Every transactional email fair-do sends lives in one file — `src/lib/email.ts` — as one
function per flow, all built on one shared HTML shell. This doc maps every flow (what
triggers it, who receives it, what it says) and the shell that renders it.

---

## Architecture

**One shared shell.** Every email is built with `layout({ heading, body, cta?, preheader? }, brand?)`.
It renders a consistent header (logo), a white rounded card (heading + body + optional
CTA button), and a footer — so a single change to `layout()` updates every email at once.

**Sender identity.**
- `FROM = "fair-do <onboarding@resend.dev>"` (or `RESEND_FROM` in production) for every send.
- When a teacher has branding enabled (`resolveEmailBrand()`), the *display name* swaps to
  the teacher's practice name while the underlying address stays the same — this preserves
  SPF/DKIM, so branded mail doesn't hurt deliverability.

**Branding rules (`src/lib/email-brand.ts`).** A teacher's own logo/colour/practice name/reply-to
appears on **student- and parent-facing** emails only when:
1. The teacher is on a paid, active subscription (`hasPaidAccess`), **and**
2. `Teacher.brandEnabled` is true.

Otherwise the email renders with the plain fair-do header (disc+smile mark) and `#4f46e5`
indigo as the accent colour. **Platform → teacher** emails (approvals, credential reminders,
ops alerts) are never brandable — they always come from fair-do, to fair-do's own tutors.

**Localisation.** Emails localise to the *recipient's* locale (`User.locale`), not the
request locale — critical since the sender (teacher) and recipient (student/parent) can be
in different locales. A handful of flows are still English-only hardcoded strings
(`sendTeacherRejected`, `sendCredentialSuspended`, `sendParentInvite`, `sendParentReceipt`,
most of the practice-portal flows) — flagged per-flow below as a known gap.

**Failure handling.** `sendEmail()` wraps the Resend client so a `{ error }` response
*throws* instead of silently resolving — callers doing reminder/broadcast accounting via
`.catch()` or `Promise.allSettled` see real failure counts, not false positives.

---

## Flow map

### 1. Platform → Teacher (never branded)

| # | Trigger | Function | Recipient | Subject | Locale |
|---|---|---|---|---|---|
| 1 | Admin approves a tutor application | `sendTeacherApproved` | Teacher | dictionary-driven | ✅ recipient locale |
| 2 | Admin rejects a tutor application | `sendTeacherRejected` | Teacher | "Your fair-do application — next steps" | English only |
| 3 | Admin sends an ad-hoc message during credential review | `sendTeacherAdminMessage` | Teacher | admin-supplied | English only |
| 4 | Cron `credentials` (daily, 08:00) — qualification/DBS expiring soon | `sendCredentialExpiryReminder` | Teacher | "Reminder: your {credential} expires in N days" / "Action needed: expired" | English only |
| 5 | Cron `credentials` (daily, 08:00) — credential expired past grace window | `sendCredentialSuspended` | Teacher | "Your fair-do profile has been paused" | English only |
| 6 | Cron `alerts` (every 15 min) — health check fires or clears | `sendOpsAlert` | Ops inbox | "⚠️ fair-do: N issues" / "✅ issues resolved" | English only (internal) |

### 2. Booking & lesson lifecycle (brandable)

| # | Trigger | Function | Recipient(s) | Subject |
|---|---|---|---|---|
| 7 | Marketplace booking created, or Stripe confirms payment, or cron `recurring` (daily 07:00) auto-charges a standing booking | `sendBookingConfirmed` | Student **+** teacher (two independent sends via `Promise.allSettled`) | "Lesson confirmed — {tutor}, {date}" / "New lesson booked — {date}" |
| 8 | Teacher's own student self-books via a public booking link | `sendSelfBookingConfirm` | Student (double opt-in — booking isn't held until confirmed) | "Confirm your lesson with {practice}" |
| 9 | Teacher manually schedules a session for an existing student | `sendSessionScheduledByTherapist` | Student | "Confirm your lesson…" (needs payment) or "Lesson booked…" (already covered) |
| 10 | Teacher books a weekly series for a student | `sendSessionSeriesScheduled` | Student | "N lessons booked with {tutor} — starting {date}" |
| 11 | Cron `reminders` (hourly) — lesson starting soon | `sendSessionReminder` | Student (+ SMS if enabled) | dictionary-driven |
| 12 | Cron `no-shows` (hourly, :15) — nobody joined / one side no-showed | `sendNoShowNotice` | Student | "About your lesson — {date}" |
| 13 | Lesson cancelled by either party | `sendCancellationNotice` | Student **+** teacher (two sends) | "Lesson cancelled — {date}" (×2, different copy) |

### 3. Teacher's own practice — invites, broadcasts, packages (brandable)

| # | Trigger | Function | Recipient | Subject |
|---|---|---|---|---|
| 14 | Teacher adds or bulk-imports a student to their practice | `sendClientInvite` | Student | "{practice} has invited you to book lessons on fair-do" |
| 15 | Teacher broadcasts a free-text message to students | `sendClientBroadcast` | Student(s) | teacher-supplied subject |
| 16 | Teacher invites students to a named event (with a personal `.ics` per recipient) | `sendClientEventInvite` | Student(s) | "Invitation: {title}" |
| 17 | Teacher offers a lesson package | `sendPackageOffered` | Student | "{practice} — your {package name}" |

### 4. Parent portal (never branded — parent pays fair-do directly)

| # | Trigger | Function | Recipient | Subject |
|---|---|---|---|---|
| 18 | Teacher invites a parent to follow a student | `sendParentInvite` | Parent | "Follow {student}'s tutoring on fair-do" |
| 19 | Stripe webhook confirms a parent-portal or parent-purchased-package payment | `sendParentReceipt` | Parent | "Receipt — {amount} for {student}'s tutoring" |

### 5. Gifts (never branded — platform-issued)

| # | Trigger | Function | Recipient | Subject |
|---|---|---|---|---|
| 20 | Stripe webhook confirms a gift voucher purchase (sent twice if gifted to someone else — recipient + purchaser receipt) | `sendGiftVoucher` | Recipient, and purchaser if different | localised gift/receipt subject |

---

## Cron cadence (`vercel.json`)

| Path | Schedule | Drives |
|---|---|---|
| `/api/cron/reminders` | `0 * * * *` (hourly) | #11 session reminder |
| `/api/cron/no-shows` | `15 * * * *` (hourly, :15) | #12 no-show notice |
| `/api/cron/credentials` | `0 8 * * *` (daily, 08:00) | #4 expiry reminder, #5 suspension |
| `/api/cron/alerts` | `*/15 * * * *` (every 15 min) | #6 ops alert |
| `/api/cron/recurring` | `0 7 * * *` (daily, 07:00) | #7 standing-booking confirmation |
| `/api/cron/fx` | `30 6 * * *` (daily) | no email — currency-rate refresh only |
| `/api/cron/inbox` | `*/5 * * * *` (every 5 min) | no direct send — feeds `sendOpsAlert` via `inbox-process.ts` |

---

## Template detail

Each entry below is the actual heading/body copy from `email.ts`, with `{tokens}` marking
interpolated values. Every template renders inside the shared `layout()` shell (logo header,
white card, footer, optional pill-shaped CTA button in `#4f46e5` or the teacher's brand colour).

### 1 · `sendTeacherApproved`
- **Heading / body / CTA:** dictionary-driven (`email.teacher_approved` in `src/messages/*.json`) — localises to the teacher's own locale.
- **CTA →** `/teacher/dashboard`

### 2 · `sendTeacherRejected`
- **Heading:** `Hi {firstName},`
- **Body:** "We weren't able to verify your {qualificationBody} credentials with the details provided — often this is an expired qualification or a reference entry error. Please re-apply with updated details, or email support@fair-do.com if you believe this is a mistake."
- **CTA:** none

### 3 · `sendTeacherAdminMessage`
- **Heading:** the admin-supplied subject
- **Body:** "Hi {firstName}," + the admin's free-text message (newlines → `<br>`) + "— The fair-do team"
- **CTA:** none

### 4 · `sendCredentialExpiryReminder`
- **Heading (not yet expired):** "Your {qualification/DBS} credential expires soon"
- **Heading (expired):** "Your {qualification/DBS} credential has expired"
- **Body:** states the expiry date and days remaining; expired case warns the profile will be paused if not renewed
- **CTA →** `/teacher/profile` ("Update my details")

### 5 · `sendCredentialSuspended`
- **Heading:** "Your profile has been paused"
- **Body:** explains the credential expired past the grace window; existing bookings are unaffected and must still be honoured; renew to reactivate
- **CTA →** `/teacher/profile` ("Update my details")

### 6 · `sendOpsAlert`
- **Heading:** "fair-do monitoring alert" (firing) / "fair-do: all clear" (resolved)
- **Body:** bulleted list of firing issues (amber) and resolved issues (indigo)
- **CTA →** `/admin/health` ("Open health dashboard")

### 7 · `sendBookingConfirmed` (two independent sends)
- **Student copy** — Heading: "You're booked, {firstName}". Body: tutor name, date/time, amount paid, note that the `.ics` is attached and the room opens 10 min early, cancellation link. **CTA →** `/session/{id}` ("View lesson"). Attaches a calendar invite.
- **Teacher copy** — Heading: "New lesson, {firstName}". Body: student name + date/time. Always plain fair-do branding, always `en-GB`, regardless of the student's locale/brand.

### 8 · `sendSelfBookingConfirm`
- **Heading:** "Confirm your booking"
- **Body:** "You requested a lesson with {practice} on {when}. Tap below to confirm — your booking isn't held until you do." Ignorable if not requested.
- **CTA →** the confirm URL ("Confirm my lesson")

### 9 · `sendSessionScheduledByTherapist`
- **Heading:** `Hi {firstName},`
- **Body (needs payment):** "{practice} has scheduled a lesson for you… Tap below to confirm and pay securely." **CTA:** "Confirm & pay"
- **Body (already covered):** same layout, no payment step, tutor arranges payment directly. **CTA:** "View lesson"

### 10 · `sendSessionSeriesScheduled`
- **Heading:** `Hi {firstName},`
- **Body:** "{practice} has scheduled a weekly series for you." — lesson count, first date, and whether it's drawn from a package (no further payment) or paid directly with the tutor.
- **CTA →** "View your next lesson"

### 11 · `sendSessionReminder`
- Fully dictionary-driven (`email.session_reminder`) — heading/body/CTA/cancel-link text all localise to the student's locale.

### 12 · `sendNoShowNotice`
- **Heading:** `Hi {firstName},`
- **Body:** three variants by `reason` —
  - `student-no-show`: lesson wasn't attended, non-refundable, offers a support contact
  - `teacher-no-show`: apology, tutor didn't join
  - `no-one-joined`: neutral "didn't take place"
  - Refund note appended when `refunded: true`.
- **CTA →** `/tutors` ("Book another lesson") — omitted for the student-no-show case.

### 13 · `sendClientInvite`
- **Heading:** `Hi {firstName ?? "there"},`
- **Body:** "{practice} would like to see you on fair-do — a simple, secure place to book lessons, join by video and pay, all in one spot." Optional custom rate line and personal note.
- **CTA →** the accept URL ("Accept your invite")

### 14 · `sendClientBroadcast`
- **Heading:** the teacher-supplied subject
- **Body:** "Hi {firstName}," + free-text message + "You're receiving this because you're a student of {practice} on fair-do."
- **CTA:** none

### 15 · `sendClientEventInvite`
- **Heading:** the event title
- **Body:** optional note, then when/where/join-link rows, note that a personal `.ics` is attached
- **CTA:** none (the calendar attachment is the primary action)

### 16 · `sendPackageOffered`
- **Heading:** `Hi {firstName},`
- **Body:** package name, session count, price per lesson, total price — "Pay once below — then each lesson you book draws from your package, no card needed."
- **CTA →** the payment URL ("Buy package")

### 17 · `sendCancellationNotice` (two independent sends)
- **Student copy** — Heading: "Lesson cancelled". Body: confirms the cancelled lesson; refund note (full refund, 5–10 business days) or a note that no refund applies inside the cancellation window. **CTA →** `/tutors` ("Find another time")
- **Teacher copy** — Heading: "Lesson cancelled". Body: states who cancelled (student/teacher). Always plain fair-do branding.

### 18 · `sendParentInvite`
- **Heading:** "Stay in the loop on {student}'s lessons"
- **Body:** "{teacher} has invited you to follow {student}'s tutoring on fair-do. The parent portal gives you full visibility — upcoming lessons, attendance, invoices, and a direct line to the tutor — for £4.99/month. Cancel any time."
- **CTA →** the accept URL ("Open the parent portal")

### 19 · `sendParentReceipt`
- **Heading:** "Payment received"
- **Body:** "Thanks — we've received {amount} for {description} ({student}). Your itemised receipt is available to view and download below."
- **CTA →** the receipt URL ("View receipt")

### 20 · `sendGiftVoucher`
- Fully dictionary-driven (`email.gift_voucher`) — two modes: recipient-facing gift email (with the code in a highlighted box, optional personal message as a blockquote) or purchaser-facing receipt. Localises to the recipient's locale.
- **CTA →** `/redeem`

---

## Known gaps

- **English-only templates:** #2, #3, #5, #9, #10, #12, #13, #14, #15, #16, #17, #18, #19,
  #20-receipt-path are hardcoded English strings rather than dictionary-driven. Lower
  priority than the booking/reminder path since most affected flows are teacher-initiated
  (teacher writes the content) or platform-to-teacher, but student-facing ones (#9, #10,
  #12, #13, #16, #17) are candidates for i18n if non-English student volume grows.
  Translations for all 16 (es/fr/de/it/pt), ready to merge, live in
  [Email Templates — Translations](/founder/email-templates-i18n) — not yet wired into
  `email.ts`.
- **Parent portal emails (#18, #19) are never brandable** — by design, since the parent
  pays fair-do directly rather than the teacher, this is consistent, not a gap.
- **No template preview/testing tool.** Templates are only visible by reading `email.ts` or
  triggering a real send through Resend. A local preview harness (render each `layout()`
  call to static HTML without sending) would help catch visual regressions before they
  reach production — flagged as a follow-up, not built here.
