# fair-do — Technical Due Diligence & Handover Readiness Review

_Date: 2026-07-01 · Scope: whole application (web + native API + ops) · Method: read-only multi-dimension audit + verification_

## Verdict

**Conditionally handover-ready — not yet.** The product is genuinely well-built for a solo/AI-assisted codebase: modern stack, strict TypeScript passing clean, near-zero `any`/`@ts-ignore`, consistent patterns, a real test pyramid (353 tests), strong observability *code*, and a thoughtful privacy model. It is held back from a clean handover by a small number of high-impact operational and compliance gaps — most of which are documentation/process, not code rewrites.

### Scorecard

| Dimension | Rating |
|---|---|
| Architecture & code quality | 4 / 5 |
| Testing & CI/CD | 3 / 5 |
| Dependencies / data model / compliance | 3 / 5 |
| Operations & handover readiness | 2.5 / 5 |
| Security (separate review, fixes in PR #49) | Strong baseline; criticals fixed |
| **Overall** | **~3.1 / 5 — "good build, not yet operable by a new owner"** |

---

## Blocking items (must fix before handover)

1. **Migration history is dead and misleading.** `prisma/migrations/` contains only `0001_init`, which builds the **pre-rebrand** schema (`Therapist`, `Client`, enum `CLIENT/THERAPIST`). The live schema (`Teacher`, `Student`, parent portal, lesson notes, recurring, subscriptions) exists only because it was applied with `prisma db push`. Yet `vercel.json` build runs `prisma migrate deploy` — a no-op beyond `0001`. **A fresh DB built from the repo produces a schema the app cannot query.** Root cause of the repeated prod-500s this period.
   → Baseline a fresh migration from current schema (`prisma migrate diff`), or commit to `db push` explicitly and remove `migrate deploy` from the build. Document whichever is chosen.

2. **No GDPR erasure / export, and `user.deleted` is not handled** (Clerk webhook only handles `user.created`). PII — including **minors'** names, DOB, phone, and verbatim lesson transcripts — persists indefinitely with no deletion path. The privacy policy promises rights the app cannot fulfil. Zero `onDelete` cascades make manual erasure brittle. **Highest compliance risk given children's data.**

3. **Production error visibility is effectively off.** Sentry is code-wired but inert unless `SENTRY_DSN` is set, and `withSentryConfig` was removed from `next.config.ts`. The alerts cron only checks DB/4-endpoint/cron/inbox/complaint thresholds — **not** route-level 500s. A booking/webhook handler throwing 500 is invisible except in raw Vercel logs (exactly what happened repeatedly). → Set `SENTRY_DSN`; add route-error alerting.

4. **No single source of truth for configuration.** ~76 env vars across 11+ services, **no `.env.example`**, and the only env doc (`docs/LAUNCH.md`) is **stale and contradicts code** (`STRIPE_PRICE_PRACTICE/CLINIC` vs the actual `STRIPE_PRICE_PRO/SCHOOL`; several phantom vars). Which feature flags are on in prod lives only in the Vercel dashboard.

5. **No backup / disaster-recovery documentation.** Recovery posture relies on Neon defaults, undocumented. No PITR statement, no restore runbook.

---

## High-priority (fix soon after handover)

- **Real-DB testing gap.** All 16 integration suites mock Prisma; 0 tests touch Postgres. A 100%-green suite cannot catch schema drift, constraints, or transactions — the exact failure class seen in prod. Add a thin layer of DB-backed tests (testcontainers / Neon branch).
- **CI gaps.** No `next build` and no lint in CI; E2E (Playwright, 20 tests) runs nightly-against-staging only, never on PRs. `npm run lint` currently **fails (33 errors)** and is unenforced.
- **Sub-processor register incomplete.** Code ships PII to **Anthropic** (minors' lesson transcripts → Claude), **Sentry, Cloudinary, Upstash, Neon, Vercel** — none in the published list (only Clerk/Stripe/Daily/Resend/Plausible are). Update policy + DPAs.
- **Unindexed hot table.** `Session` has no index on `matchId`/`teacherId`/`studentId`/`scheduledAt`/`status`; `Payment.studentId` and `MessageThread` also unindexed. Will seq-scan as data grows (reminder/no-show crons hit `Session` hard).

---

## Medium / low

- **Verified bug:** `src/components/HealthDashboard.tsx:84-86` reads `therapistsActive/Pending/Suspended`; `src/lib/monitoring.ts` returns `teachersActive/…`. Admin tutor stats render 0 permanently.
- **Rebrand residue:** ~30 `therap*` references (mostly comments), `AddClientForm.tsx`, Cloudinary folder `fair-do/therapists`, legacy tier names `starter/practice/clinic` (works via `LEGACY_TIER_IDS` map), `package.json` name `faresay`, 84 "faresay" mentions repo-wide.
- **Stale runbook step:** docs tell operators to run `prisma/remove-demo-tutors.mjs` — file doesn't exist (it's `remove-demo-therapists.mjs`).
- **Tier-gating set duplicated** across ~6 files — centralise.
- **README is create-next-app boilerplate** — no local-setup guide.
- **Prisma 6 → 7** major pending (not urgent); no `LICENSE`/proprietary notice in repo.
- **Dead/legacy columns:** `Session.startedAt/endedAt` superseded by `callStartedAt/callEndedAt`; legacy per-link Stripe fields on `ParentLink`.
- **Referral signup credit** sybil-farmable for free lessons (product decision — see security review).

---

## What's genuinely good (de-risks the buy)

- Strict TS passes clean; 11 TODOs, 7 `any`, 0 `@ts-ignore` across ~26.6k LOC.
- Consistent architecture: Prisma singleton (126 sites), `auth()` + zod conventions, small focused modules, colocated tests.
- Money stored as integer pence throughout; **PCI SAQ-A clean** (all card data via Stripe hosted Checkout, no PAN handling).
- Strong webhook discipline: signature verification, idempotency (`ProcessedStripeEvent`), correct rollback-on-failure.
- Real consent capture (`consentGiven`/`consentDate`, enforced via zod), first-class parent/minor model, AI notes require teacher review before sharing.
- Permissive licences only (no GPL/AGPL obligations); committed lockfile; dependencies near-current.
- Genuinely good observability *code* (health, metrics, alert cron with dedup + all-clear) — it just needs the env wired.
- Security baseline strong; the critical findings from the security review are fixed in PR #49.

---

## Suggested remediation order

1. Reconcile migrations (or formalise `db push`) + document the deploy model.  ← unblocks safe environments
2. Wire Sentry + route-error alerting.  ← restores prod visibility
3. `.env.example` + corrected config doc + recorded prod flag state.
4. GDPR: `user.deleted` handler + account-deletion/export flow + cascade strategy.
5. Update sub-processor list + DPAs (Anthropic et al.).
6. CI: add typecheck-is-there + `next build` + lint gate; fix the 33 lint errors; run E2E on PRs.
7. Quick wins: HealthDashboard field fix, add `Session`/`Payment` indexes, fix stale runbook script names, finish rebrand residue.
8. Backup/DR runbook.
