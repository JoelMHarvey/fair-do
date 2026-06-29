# Two-Way Calendar Sync — Plan (scoping)

> We already ship a **one-way ICS subscribe feed** (a therapist's Faresay sessions appear in
> Google/Apple/Outlook, auto-updating, no OAuth). This doc scopes the harder, more valuable next step:
> **reading the therapist's existing calendar so Faresay won't double-book them**, and (optionally)
> writing Faresay sessions as real editable events. **Not built — decide before building.**
> Last updated: 26 June 2026

---

## What "two-way" actually means (two separate features)
1. **Busy-time read (conflict prevention) — the valuable half.** Before Faresay offers a slot or
   confirms a booking, check the therapist's *existing* calendar (dentist, school run, another
   client) and **don't let Faresay book over it.** Solves the real pain: "Faresay booked me when I
   was busy elsewhere."
2. **Event write-back (editable events).** Push each Faresay session *into* their Google/Outlook
   calendar as a real event they can edit/colour/move — and keep it in sync if either side changes.
   Nicer, but the ICS feed already covers "see my sessions" for most people.

The one-way feed (shipped) gives **#2 read-only**. This plan is about **#1** and **full #2**.

## Recommended phasing
| Phase | What | Complexity | When |
|-------|------|-----------|------|
| **0 — done** | One-way ICS subscribe feed (all providers, no OAuth) | shipped | — |
| **1** | **Google busy-time read** → prevent double-booking (FreeBusy query at slot/booking time) | Medium | when a design partner hits the double-booking pain |
| **2** | Full two-way event sync (create/update/delete + watch for changes) | Hard | only if therapists demand editable, reconciled events |
| **3** | Outlook (Microsoft Graph) + Apple (CalDAV) parity | Hard | later, by demand |

Build Phase 1 first — it's most of the value for a fraction of the work.

## Approach (Google, Phase 1)
- **OAuth 2.0 "Connect Google Calendar"** button in therapist settings. Scope: `calendar.freebusy`
  (or `calendar.readonly`) — read-only busy times, the least-sensitive option.
- Store an **encrypted refresh token** per therapist; refresh access tokens as needed.
- At **slot generation / booking confirmation**, call the **FreeBusy API** for their primary
  calendar over the candidate window; exclude busy intervals. Cache briefly.
- Disconnect = revoke token + delete it.

## Data model (additive)
- `Therapist.googleRefreshToken` (**encrypted at rest**), `googleCalendarId`, `googleConnectedAt`.
- Phase 2 only: `Session.googleEventId` (map Faresay session ↔ Google event), plus a watch-channel
  table (id, expiry) for change notifications.

## The hard parts (be honest before committing)
- **Google app verification.** Calendar is a **sensitive scope** → the OAuth consent screen needs
  Google's **brand/verification review** (days–weeks). Unverified = a scary warning + a 100-user
  cap. `calendar.readonly`/`freebusy` is sensitive (verification) but *not* "restricted" (which would
  add a costly annual CASA security assessment). Using **freebusy-only keeps you in the lighter tier.**
- **Watch channels expire (~7 days)** → Phase 2 needs a renewal cron + reconciliation.
- **Two sources of truth** (Phase 2) → sync/dedup/delete reconciliation is genuinely fiddly.
- **Token security** → encrypt refresh tokens; rotate; handle revocation.
- **Which calendar?** Therapists often have several — let them pick; default primary.
- **Per-provider rebuild** → Outlook (MS Graph) and Apple (CalDAV, no clean API) are separate efforts.

## Strong alternative: a calendar-API aggregator (Nylas / Cronofy)
Instead of building + maintaining native Google + Microsoft + Apple integrations, a provider like
**Cronofy** or **Nylas** wraps all of them behind **one API**, and handles OAuth, app verification,
token storage, FreeBusy, write-back, and watch-channel renewal **for you**.
- **Pros:** weeks → days; one integration covers Google/Outlook/iCloud; they carry the verification +
  maintenance burden; built-in real-time sync + conflict checks.
- **Cons:** paid per connected account (cost scales with therapists); a third-party processor in the
  data path (**add to the sub-processor list + DPA** — `pp-dpa.md`); some vendor lock-in.
- **Recommendation:** for a small team, **seriously prefer an aggregator** over hand-building three
  calendar integrations. Hand-build only if cost-per-seat or data-path concerns rule it out.

## Decision gate (don't build yet)
The shipped ICS feed already answers *"let me see Faresay in my calendar."* Phase 1 answers the
different, harder ask: *"stop Faresay booking me when I'm busy elsewhere."* **Build Phase 1 only when a
design partner actually reports that double-booking pain** — and when you do, **price the aggregator
route first** (Cronofy/Nylas) against hand-building. Wait for the pull; this is a real cost + a
data-protection surface, not a quick win.

## Linked documents
- `pp-product-requirements-document.md` (scheduling) · `pp-dpa.md` (sub-processor if aggregator) ·
  `pp-validation-plan.md` (the signal to build on) · `pp-clinic-plan.md` (clinic calendar reuses this)
