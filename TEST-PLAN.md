# Faresay — Test Suite Plan

**Status:** T0–T3 complete · T4 parked (code built, tests not yet written) · **Current coverage:** 64+ automated tests (P0 unit, P1 integration, P2 E2E, P3 native) · **Owner:** Joel Harvey

This plan adds an automated test suite to Faresay. It is **risk-ordered**: the money paths, auth/data-isolation, and the bugs the launch audit surfaced come first. Each tier ships independently and is wired into CI as it lands.

---

## 1. Why / goal

- No tests today. The app handles real money (Stripe Connect), special-category health data, and video sessions — the highest-stakes paths must be regression-proof before paid bookings open.
- The launch-readiness audit found real defects (webhook idempotency, refund routing, double-booking race, self-book timezone). **Every confirmed audit finding becomes a regression test** so it can't silently return.
- A green suite in CI is the gate for opening `BOOKINGS_ENABLED` and for shipping the native app against the mobile API.

## 2. Stack & strategy

| Layer | Tool | Notes |
|-------|------|-------|
| Unit (pure logic) | **Vitest** | TS-native, fast, no DB. The biggest, cheapest win. |
| Integration (API routes + DB) | **Vitest** + **Prisma against a test Postgres** | Use a disposable DB: a **Neon branch** per CI run, or a local Postgres via testcontainers/Docker. Reset between tests (truncate or per-test transaction rollback). |
| External services | **Mock at the boundary** | Stripe, Clerk, Daily, Resend, Twilio wrapped/mocked via `vi.mock`. Never call live third parties in tests. |
| E2E | **Playwright** | A handful of real-browser happy-paths against a seeded staging DB. |
| Native | **Vitest** + zod schema tests | DTO parse round-trips + API client behaviour. |
| CI | **GitHub Actions** | Run unit + integration on every PR; E2E on a nightly/pre-deploy job. |

**Conventions:** co-locate unit tests as `*.test.ts` next to the source; integration tests under `tests/integration/`; E2E under `tests/e2e/`. Add `test`, `test:watch`, `test:integration`, `test:e2e`, `test:coverage` scripts. Factory helpers + a `seed` util for DB fixtures.

---

## 3. Tiers (risk-ordered)

### P0 — Pure-logic unit tests (no DB) · highest ROI, do first
Fast, deterministic, lock the money math + audit fixes. Target files:

- `src/lib/billing.ts` / `practice.ts` — `commissionPence` / `commissionBps` per tier (Starter 250bps, Practice 100, Clinic 0, non-sub fallback 250); rounding; fee never < 0 or > amount; `commissionBpsForTier`, `tierByPriceId`.
- `src/lib/refund.ts` — **regression:** internal (`credit_`/`org_`) vs card routing; `reverse_transfer`/`refund_application_fee` **only** when `payment.transferred` (the bug I fixed); non-`paid` payment returns false.
- `src/lib/self-book.ts` + self-book route validation — **regression:** slot validated in `Availability.timezone`, not server-local (the BST bug); clash logic; double-opt-in token compare.
- `src/lib/credentials-expiry.ts` — `daysUntil`, `expiryState` boundaries (expiring vs expired vs ok).
- `src/lib/currency.ts` / `fx-rates.ts` — conversion + GBP/USD selection; **regression:** GBP credit vs USD-rate therapist.
- `src/lib/voucher.ts` — code generation/format/uniqueness; `rate.ts`; `matching.ts` scoring + region/`stripeOnboarded` filter.
- `src/lib/practice.ts` — `clientEmail`, `practiceDisplayName`, `generateInviteToken` (length/entropy), `DIRECTORY_ENABLED` gating.

### P1 — API integration tests (route + test DB) · the money & auth paths
- **Stripe webhook** (`src/app/api/webhooks/stripe/route.ts`) — **regression (blocker):** event marked processed only after effects; on a forced handler failure the `ProcessedStripeEvent` row is rolled back and 500 returned so Stripe retries; duplicate delivery short-circuits; `transferred` set from metadata; covers gift / org_topup / package / subscription / booking branches.
- **booking/create** — **regression:** 422 + pending-session cleanup when Connect not `charges_enabled`; happy path sets `transferred` correctly.
- **Mobile read API** (`src/app/api/mobile/v1/*`) — **IDOR / data-isolation:** therapist A cannot read therapist B's dashboard/clients/calendar/earnings/sessions; 401 without a valid Clerk subject; `getMobileTherapist` returns null → clean 401/403. (Critical now the mobile surface is live.)
- **session cancel/complete**, **refund via cancel** — refund routing end-to-end with a mocked Stripe.
- **self-book confirm** + **practice/booking** — slot clash → 409; ownership checks on `matchId`/`clientId`.
- **cron** (`no-shows`, `reminders`) — **regression:** no-show not marked resolved when refund failed; reminder not marked sent when send failed (after the `email.ts` fix).

### P2 — E2E happy paths (Playwright)
1. Therapist sign-in → dashboard renders.
2. Therapist books a client → Stripe (test) → session created.
3. Client opens session room via magic-link `?k=` token → room access (constant-time token path).
4. Therapist ↔ client message round-trip.
5. Self-booking double-opt-in flow.

### P3 — Native app
- zod DTO schemas in `native/src/dtos/*` parse representative API payloads (and reject malformed).
- `native/src/lib/api.ts` — attaches bearer token, handles 401, ret/timeout behaviour (mocked fetch).
- Smoke-render key screens (React Native Testing Library) with mocked query data.

### P4 — Clinics (`feat/clinic-multi-therapist`, gate behind `CLINICS_ENABLED`)

Full spec in `docs/CLINIC-PLAN.md §5`. Summary:

**P0 unit** (`src/lib/practice.test.ts`, `src/lib/clinic.test.ts`):
- Commission resolution for a **clinic member** → uses clinic tier (0bps), never the solo-starter fallback (250bps). *(The §3 correctness item — currently documented as `test.todo` in `practice.test.ts`.)*
- Slug generation, invite-token format/expiry, accept/leave/remove helpers.
- `resolveCommissionForTherapist` — 4 cases: clinic member (0bps), clinic member with personal sub (still 0bps), solo (own sub bps), inactive clinic (250bps fallback).

**P1 integration** (`tests/integration/clinic-*.test.ts`):
- CRUD: create clinic · invite + accept · leave · admin-remove (403 for non-admin).
- IDOR: clinic-A admin cannot read clinic-B calendar; member cannot call admin routes; unauthenticated → 401.
- Commission: clinic-member booking → 0bps in Stripe metadata; refund still routes to member's Connect.
- Seat billing: add/remove member → correct Stripe `quantity` + proration.

**P2 E2E** (`tests/e2e/clinic.spec.ts`, chromium, requires two seeded therapists):
- Admin creates clinic → invites 2nd → both on team calendar → client books member → payment to member's Connect → admin sees in reporting.

**Regression gate:** all existing P0/P1/E2E tests must stay green (solo path unchanged).

---

## 4. Audit findings → regression tests (traceability)

| Audit finding | Test that locks it |
|---|---|
| Webhook claimed event before effects (blocker, fixed) | P1 webhook: forced failure rolls back marker → 500 |
| Refund `reverse_transfer` unconditional (fixed) | P0 refund: spread only when `transferred` |
| booking/create charged when Connect not enabled (fixed) | P1 booking: 422 + cleanup |
| Resend swallows send failures (open) | P1 cron/reminders + a `email.ts` wrapper unit test |
| Double-book race, no DB unique (open) | P1 practice/booking: concurrent insert → 409 (after unique index) |
| Self-book server-local time (open) | P0 self-book: BST slot accepted/rejected correctly |
| Mobile API IDOR (unverified in audit) | P1 mobile: cross-therapist access denied |

(Open items get a failing test first → fix → green: test-driven closure of the audit backlog.)

---

## 5. CI (GitHub Actions)

- **On PR:** install → `prisma generate` → spin a Neon branch (or Postgres service) → `prisma migrate deploy` → `test` + `test:integration` → coverage report. Block merge on failure.
- **Nightly / pre-deploy:** `test:e2e` against staging.
- Cache `node_modules` + Prisma engine. Mask all secrets; tests use test-mode keys only.

## 6. Coverage targets (pragmatic, not vanity)

- P0 money/refund/commission/timezone libs: **~90%+** line coverage.
- API route handlers (P1): every route has at least an auth-fail + happy-path test; money/webhook routes fully branch-covered.
- Overall: start by gating "no untested new money/auth code," ratchet a global threshold up over time. Don't chase 100%.

## 7. Milestones

| | Target | Scope |
|---|---|---|
| **T0** | ½–1 wk | Vitest + CI wired; P0 pure-logic suite (billing, refund, commission, expiry, currency). Locks the fixed money bugs. |
| **T1** | 1–2 wks | Test-DB harness + P1 webhook, booking, mobile-IDOR, cron regressions. Drives open audit fixes test-first. |
| **T2** | 1 wk | Playwright E2E happy paths (P2). |
| **T3** | Ongoing | Native DTO/api tests (P3); coverage ratchet; new code lands with tests. |
| **T4** | On clinic merge | P4 clinic suite: `clinic-crud`, `clinic-idor`, `clinic-commission`, `clinic-billing` integration tests + `clinic.spec.ts` E2E. Gate: `CLINICS_ENABLED`. |

> **T0–T3 are complete.** T4 is **parked** — clinic Phases 2–4 are built on PR #25 (`feat/clinic-multi-therapist`) but not yet merged. Resume T4 when the clinic feature is activated for a design-partner. See `docs/CLINIC-PLAN.md §resume` for the full checklist.

## 8. Effort / cost note

~3–5 person-weeks to reach a solid P0+P1+basic-E2E suite. This is the QA line item flagged in the build-cost estimate; it is also the gate that lets paid bookings open with confidence.
