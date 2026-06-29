# Pivot — Project Plan & Tracker

> The **living build tracker** for the practice-portal pivot. Strategy lives in the pivot plan
> (`therapist-portal-pivot.md`) and the model comparison (`model-comparison.md`); this doc tracks
> **what's built, in progress, and next**, and is updated as we ship. Everything new is gated behind
> the `PRACTICE_PORTAL_ENABLED` flag — the live marketplace is untouched until it's switched on.
> Last updated: [PLACEHOLDER: keep current as we go]

## Legend
✅ Done (in PR #10) · 🔄 In progress · ⬜ Planned · 🔴 Blocked

---

## Phase A — Practice OS MVP  ·  ✅ COMPLETE
*Goal: a solo therapist can invite their own clients, price them, schedule sessions, and pay Faresay.*
*All items shipped (behind the flag). Next: Phase B (retention/polish) — or switch on a design partner.*

| # | Item | Status | Notes |
|---|------|--------|-------|
| A1 | Data model (additive) | ✅ | `ClientInvite`, `Subscription`, `Package`; `Match.source/customRatePence/invitedAt`; `Therapist.practiceName/practiceSlug` |
| A2 | Therapist-led client invites | ✅ | `POST /api/practice/clients` → emailed 14-day secure link; `/practice/join/[token]` accept → active `source=invite` Match |
| A3 | Client roster | ✅ | `/therapist/clients` — active clients + pending invites + inline invite form; dashboard link |
| A4a | Per-client pricing | ✅ | `/therapist/clients/[matchId]` rate editor; `PATCH /api/practice/clients/[matchId]` |
| A5 | Therapist-initiated booking | ✅ | `POST /api/practice/booking` — online (Stripe pay-link) + offline (room now, pay later) modes |
| A6 | Stripe Billing subscriptions | ✅ | Starter/Practice/Clinic tiers; subscribe + portal; webhook sync; commission drives per-session fee |
| A4b | Packages / bundles UI | ✅ | Create a pre-paid bundle (pay-link or offline); sessions draw it down at booking (`usePackageId`); shown on the client page |
| A7 | Practice dashboard polish | ✅ | Quick actions, active-package summary, Today badges on the therapist dashboard |
| A8 | Directory listing toggle ("accepting new clients") | 🔄 | Reuses existing `availableForNew`; quick toggle in portal + public-profile QR (see Requests) |
| A9 | Client QR codes | 🔄 | QR of the invite/booking link the therapist can show or send (see Requests) |

---

## Founder-facing docs & portal
| # | Item | Status | Notes |
|---|------|--------|-------|
| D1 | Pivot plan | ✅ | `therapist-portal-pivot.md` |
| D2 | Practice-portal doc set | ✅ | business plan, GTM, personas, BMC, PRD, market research, risk register, financial model |
| D3 | Model comparison | ✅ | `model-comparison.md` |
| D4 | Portal search | ✅ | Search across all docs (title + body) on `/founder` |
| D5 | This project tracker | 🔄 | Kept updated as we ship |
| D6 | Go-live runbook | ✅ | `practice-portal-golive.md` — step-by-step to enable a design partner |

---

## Requested features (current)
| # | Item | Status | Plan |
|---|------|--------|------|
| R1 | Toggle "accepting new clients" → visible in directory to solicit clients | 🔄 | Surface `availableForNew` as a one-tap toggle in the practice portal; directory (`/therapists`, `/availability`, matching) already filters on it. Frame it as the on-ramp to the client-finding network (Phase D). |
| R2 | Send a QR code to the client | ✅ | Server-rendered QR (via `qrcode`) of (a) each pending invite's accept link, and (b) the therapist's public booking page. |
| R3 | Accountless (managed) clients | ✅ | Therapist adds a client with no login (`Client.userId` now optional + `contactEmail`); manage bookings/packages/receipts for them; online pay-link can be emailed or shared. `POST /api/practice/clients/managed`; toggle in the add-client form. |

---

## Phase B — Polish, retention, client billing  ·  ✅ COMPLETE
| # | Item | Status | Notes |
|---|------|--------|-------|
| B1 | Recurring/standing appointments | ✅ | Weekly series (×4/6/8/12) via package draw-down or offline; clash-skipping; one summary email. Calendar sync still ⬜ |
| B2 | Invoices/receipts | ✅ (receipts) | Printable itemised receipt `/receipt/[paymentId]` (client/therapist/admin); links from client dashboard + therapist client page. Package-payment receipts need a Payment→therapist link (follow-up) |
| B3 | Client broadcast | ✅ | `/therapist/broadcast` — send one update to all reachable clients; logged in `Broadcast`; dashboard "Message clients" action |
| B4 | <15-min onboarding wizard | ✅ | `/therapist/setup` — data-driven checklist (plan, payments, rate, first client, +discoverable); dashboard progress banner |
| B5 | CSV import of an existing client list | ✅ | Paste a list → batch invites (dedupes vs existing clients/invites); `/therapist/clients/import` |

## Phase C — AI helper agent (add-on)  ·  Phase D — Client-finding network  ·  Phase E — Accounting
| Phase | Status | Notes |
|---|---|---|
| C — AI helper | ⬜ | Scheduling/reminders/drafting; therapist-supervised; strict data governance |
| D — Client network | ⬜ | Re-light the marketplace as an opt-in add-on; R1's toggle is the first step |
| E — Accounting | ⬜ | Integrate Xero/FreeAgent, don't build |

---

## Go-live checklist (before PRACTICE_PORTAL_ENABLED=true in prod)
- ⬜ `prisma db push` to add the new columns/tables (Match, Therapist, **Client.userId now nullable + Client.contactEmail** + new models) — **required or marketplace queries break**
- ⬜ Stripe: create Practice/Clinic recurring Prices → set `STRIPE_PRICE_PRACTICE`, `STRIPE_PRICE_CLINIC`
- ⬜ Stripe webhook: ensure `customer.subscription.*` events are enabled
- ⬜ Legal: controller→processor re-characterisation + DPA template (see pivot plan §9)
- ⬜ Decide pricing model (free+commission vs subscription-only) and confirm tier numbers
- ⬜ `PRACTICE_PORTAL_ENABLED=true`

## Open decisions (from the founder)
1. Pricing model: free + commission (recommended) vs subscription-only.
2. Keep marketplace dormant as the Phase D add-on (recommended) vs fully retire.
3. "Substack"/broadcast scope: invites now → light newsletter → real integration later.
4. Brand: keep Faresay, position as the fair therapist platform (recommended).

## Self-review (hardening pass)
Independent review of the branch — fixes applied:
- **Email HTML injection** (high): escape therapist/client free text (names, invite note, package name) in all practice emails.
- **Commission resync** (high): the `customer.subscription.updated` webhook now re-maps tier + commission when a plan changes in the Stripe portal.
- **Package draw-down** (med): recurring-series shortfall reconciled; failed refunds now log loudly (CRITICAL) instead of being swallowed.
- **Rate limits** (low): added to `billing/subscribe` + `billing/portal` (they create Stripe customers/sessions).
- Confirmed clean: no cross-tenant IDOR on action routes; accountless-client null migration complete; flag gates consistent.
- Known follow-ups: therapist-side package receipts need `Payment.therapistId`; calendar sync; managed-client → account upgrade.

## Changelog
- PR #10: A1–A6 shipped; full doc set + comparison + portal search; project tracker added.
- R1 (directory toggle) + R2 (client QR codes) shipped.
- A4b (packages/bundles) shipped — create + pay + draw-down at booking.
- A7 (dashboard polish) shipped — **Phase A complete.** Next: Phase B, or enable a design partner.
