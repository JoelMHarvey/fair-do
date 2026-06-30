# Data retention & erasure (GDPR)

How fair-do fulfils the right to erasure (Art. 17) and data portability (Art. 20).

## Strategy: pseudonymisation + retention

We do **not** hard-delete a user's records. Instead, on erasure we **scrub every
PII field the user contributed** and keep the rows with the subject's identity
anonymised. This is GDPR-compliant under the Art. 17(3) exemptions and avoids two
failure modes of naive deletion:

- **Legal retention** — financial records (`Payment`, `Subscription`,
  `ParentSubscription`) must be kept for tax/accounting (HMRC ~6 years), and
  safeguarding records (`Complaint`, `CredentialCheck`) for legal obligation.
- **Shared data** — `Session`, `Message`, `Match`, `LessonNote`, message threads
  are co-owned with a counterparty. Hard-deleting on one party's request would
  destroy the other party's legitimately-held data. We anonymise the leaving
  party's identity and keep the row for the counterparty.

## What happens on erasure (`src/lib/erasure.ts`)

Triggered by: the Clerk `user.deleted` webhook, or `POST /api/account/delete`
(self-service, requires typed `DELETE` confirmation). Idempotent; runs in one
transaction.

| Data | Action |
|---|---|
| `User` | email → `deleted+{id}@anon.invalid`, clerkId → `deleted_{id}`, locale → null |
| `Student` / `Teacher` profile | names → "Deleted", contact/DOB/tokens/bio/brand/qualif refs scrubbed; **id kept** so financial FKs stay valid |
| Messages / ParentMessages they authored | body → `[deleted]`, senderClerkId → `deleted` (thread kept for counterparty) |
| `Match.notes`, `LessonNote` free text | scrubbed (row kept) |
| `LessonTranscript` (student's voice) | deleted on student erasure |
| `StudentForm`, `StudentDocument` | deleted (student's personal data) |
| `Availability`, `Broadcast(Template)`, `StudentInvite` | deleted (teacher's own, no retention need) |
| `PushSubscription`, `NativeDevice`, `PendingSelfBooking` | deleted |
| `Complaint`, `CredentialCheck`, `Setting`, `InboxMessage`, `GiftVoucher` | **retained**, actor id / email / free-text scrubbed |
| `Payment`, `Subscription`, `ParentSubscription` | **retained untouched** (financial); identity reachable only via the now-anonymised profile |
| `Review` | rating retained, free-text `comment` cleared |
| `ParentLink` | `inviteEmail` anonymised (relationship history kept) |

## Data export (`src/lib/data-export.ts`)

`GET /api/account/export` returns the signed-in user's own data as a downloadable
JSON bundle (account, profile, sessions, lesson notes, payments summary, reviews,
packages, parent links, complaints they filed). Excludes other users' PII and
security tokens (Clerk/Stripe ids, room/guest/calendar tokens, push keys).

## Decisions for legal sign-off

These defaults are engineering-reasonable but should be confirmed by counsel:

1. **Retention windows.** We retain financial/safeguarding rows indefinitely
   (anonymised). If a fixed window is required (e.g. delete financial rows 7 years
   after last activity), add a scheduled job — not yet built.
2. **Managed students** (no Clerk account) have no self-service path; erasure for
   them must be initiated by the tutor/admin (route not yet built).
3. **Backups.** Pseudonymisation applies to the live DB; PII may persist in Neon
   backups until they rotate out. Document the backup retention window (see DR).
