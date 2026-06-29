# Clinics — Setup, Payment Flow & Testing Plan

**Status:** Phases 2–4 built on PR #25 (`feat/clinic-multi-therapist`) — **parked, not merged, not in prod**. Resume when a design-partner clinic is ready (see §resume below).
**Relationship:** this is the *engineering* plan (payment flow + testing); the founder-facing strategy lives in `src/content/founder-docs/pp-clinic-plan.md`. Read both.

A **clinic** = several therapists under one practice: one admin, a shared team calendar, one seat-based subscription. The solo therapist is the beachhead; clinics come after solo retention is proven.

---

## 1. What already exists (PR #25)

- **Schema:** `Clinic { name, slug, ownerTherapistId, seatsTotal }`; `Therapist.clinicId` (null = solo) + `Therapist.clinicRole` (`admin` | `member`).
- **UI stub:** `/therapist/clinic` — shows the team if a clinic exists, else a "coming soon / register interest" card.
- **Billing tier:** `clinic` already in `src/lib/billing.ts` with **`commissionBps: 0`**.
- **Founder plan:** `pp-clinic-plan.md` (why/when, data model, phases 2–4, open questions).

Phases 2–4 (create/invite/roles · shared calendar · seat billing) are **unbuilt**.

---

## 2. Clinic setup (Phase 2)

- An **admin** therapist creates a clinic (name → slug, becomes `ownerTherapistId`, `clinicRole = admin`).
- Admin **invites** other therapists (reuse the existing invite-token pattern); on accept, `clinicId` + `clinicRole = member` are set.
- **Roles:** `admin` (manage members, billing, view the whole team) vs `member` (own clients + shared-calendar visibility).
- **Leave/remove:** a therapist leaving reverts to solo (`clinicId = null`) — see the commission note in §3.

---

## 3. Clinic PAYMENT FLOW (the part that needs a decision)

There are **two independent money layers** — keep them separate.

### Layer A — Subscription (clinic → Faresay)
- **One seat-based subscription on the clinic**, not per therapist. Stripe **`quantity` = active seats**; the owner is billed. Tier = `clinic` ⇒ **0% session commission**.
- Extends the existing `Subscription` model (attach to the clinic / owner, add quantity + proration).
- Decisions: per-seat £ price · is the owner seat free · proration when adding/removing seats.

### Layer B — Session payments (client → therapist) — **KEY DECISION**
Which Stripe Connect account receives a session charge in a clinic?

| Model | How it works | Pros | Cons |
|------|--------------|------|------|
| **A — Per-therapist Connect (RECOMMENDED)** | Each therapist keeps their **own** Connect account. A client pays the **treating** therapist directly (destination charge, **0%** Faresay commission). The clinic is purely an admin + billing grouping. | Reuses **all** existing booking / payment / refund / payout / slotKey / webhook code **unchanged**; each therapist paid directly; smallest legal/tax change. | The clinic doesn't centrally collect; if it wants to pay associates itself, that's off-platform. |
| **B — Clinic Connect account** | **One** clinic Connect account receives every session charge; the clinic distributes to therapists. | Clinic is merchant of record; central collection; fits employer/associate clinics. | Large rework: clinic-level Connect onboarding, payout splitting, clinic becomes controller **and** merchant (VAT/employment/DPA implications), refund + transfer logic reworked. |

**Recommendation: Model A for first release.** Clinic = grouping + seat subscription; therapists keep their own Connect and get paid directly. Offer Model B later only if design-partner clinics demand central collection. This keeps the money-critical code paths (booking/create, practice/booking, webhook, refund.ts) **untouched**.

- **Commission:** clinic tier = 0% → Faresay takes no session commission; revenue is the seat subscription. Card processing stays Stripe's.
- **Refunds / cancellations:** unchanged under Model A (per-therapist Connect → existing `refund.ts`).

### ⚠️ Commission-resolution correctness (easy to get wrong)
Today commission comes from the **therapist's own subscription**. For a clinic **member** with no personal sub, that falls back to **2.5%** — which would **overcharge** clinic clients. Phase 4 **must** change resolution to: *if `therapist.clinicId`, use the **clinic's** subscription tier (0%)*, not the member's personal sub. This is the single most important correctness item — put a test on it (§5).

---

## 4. What needs to be done

### Phase 2 — Setup (create clinic, invite, roles)

**Schema** (additive, safe `prisma db push`):
```prisma
model Clinic {
  id                String      @id @default(cuid())
  name              String
  slug              String      @unique
  ownerTherapistId  String      @unique
  seatsTotal        Int         @default(1)
  members           Therapist[] @relation("ClinicMembers")
  subscription      Subscription?
  createdAt         DateTime    @default(now())
}
// Add to Therapist:
//   clinicId    String?  @map("clinic_id")
//   clinicRole  String?  // "admin" | "member"
//   clinic      Clinic?  @relation("ClinicMembers", fields: [clinicId], references: [id])
```

**New lib:**
- `src/lib/clinic.ts` — `createClinic`, `inviteToClinic`, `acceptClinicInvite`, `removeFromClinic`; reuses `generateInviteToken` from `practice.ts`.

**New API routes:**
| Route | Method | Who | Action |
|---|---|---|---|
| `/api/clinic/create` | POST | therapist (no clinic yet) | Creates `Clinic`, sets `ownerTherapistId`, sets caller `clinicRole=admin` |
| `/api/clinic/invite` | POST | admin | Generates `InviteToken` (type `clinic_member`), emails link |
| `/api/clinic/accept/[token]` | GET | invited therapist | Validates token, sets `clinicId` + `clinicRole=member`, redeems token |
| `/api/clinic/leave` | POST | member | Clears `clinicId` / `clinicRole`; reverts to solo |
| `/api/clinic/remove` | POST | admin | Removes a member (same reverts as leave) |

**UI:**
- `src/app/therapist/clinic/page.tsx` — replace stub with real team list (admin view: invite button + member list; member view: team roster only).

**Feature gate:** check `CLINICS_ENABLED` env var (or reuse `PRACTICE_PORTAL_ENABLED`) at the top of each route.

---

### Phase 3 — Shared calendar

**New API routes:**
- `GET /api/clinic/calendar` — returns all sessions across clinic members for the next N days; admin-only; respects per-member client privacy (member names visible to admin).

**Extend existing route:**
- `GET /api/calendar/[token]` — extend token schema to support `type: "clinic"` + `clinicId`; generates merged ICS of all members' sessions.

**UI:**
- `src/app/therapist/clinic/calendar/page.tsx` — colour-coded team calendar (each member a different hue); uses existing `FullCalendar` or similar already in the UI.

---

### Phase 4 — Billing + commission fix (the critical items)

**Commission resolution fix** (CLINIC-PLAN §3 correctness item — highest risk):
```ts
// src/lib/clinic.ts
export async function resolveCommissionForTherapist(
  therapist: { subscription: { status: string; commissionBps: number } | null; clinicId: string | null },
  db: PrismaClient,
): Promise<{ bps: number; feePence: (amountPence: number) => number }> {
  if (therapist.clinicId) {
    const clinic = await db.clinic.findUnique({
      where: { id: therapist.clinicId },
      include: { subscription: true },
    })
    const bps = commissionBpsForTier(clinic?.subscription?.tier)  // clinic tier → 0bps
    return { bps, feePence: (a) => Math.round(a * bps / 10000) }
  }
  const { bps, feePence } = commissionPence(1, therapist.subscription)
  return { bps, feePence: (a) => Math.round(a * bps / 10000) }
}
```

**Wire the fix** into both payment routes (replacing the current `commissionPence(ratePence, therapist.subscription)` call):
- `src/app/api/booking/create/route.ts` line 143
- `src/app/api/practice/booking/route.ts` line 257

**Seat-based subscription:**
- `src/app/api/clinic/billing/subscribe/route.ts` — create/update Stripe subscription with `quantity = activeSeats`; proration = `always_invoice`.
- `src/app/api/webhooks/stripe/route.ts` — handle `customer.subscription.updated` for clinic seat quantity changes.

**Clinic reporting:**
- `GET /api/clinic/reporting` — aggregate sessions/revenue across members; admin-only.

---

### Cross-cutting (all phases)

- **IDOR guards on every clinic route:** middleware checks `therapist.clinicId === route.clinicId`; admin actions require `clinicRole === 'admin'`; members cannot cross-read other clinics.
- **Solo regression guard:** `clinicId = null` everywhere in booking/commission/calendar stays untouched (covered by existing P0/P1 tests).
- **DPA/data-controller note:** clinic = data controller for its members' clients; each member-level client `Match` retains `therapistId`; clinic admin can view but not export raw clinical notes.
- **Deploy:** schema is additive; `prisma db push` safe. Existing rows get `clinicId = null` (default).

---

## 5. Testing plan

Mirrors the repo's existing `vitest` + Playwright setup (`TEST-PLAN.md`). See also the "Clinics" section in `TEST-PLAN.md`.

### P0 — unit (no DB)

**File: `src/lib/practice.test.ts`** (already added — `commissionPence — clinic-member correctness` block)
- Documents current bug: `commissionPence(10000, null)` → 250bps (wrong for a clinic member).
- `test.todo` for each correct behaviour: clinic member resolves via clinic tier → 0bps; solo therapist unaffected.

**File: `src/lib/clinic.test.ts`** (create when `src/lib/clinic.ts` lands in Phase 2):
- `createClinic` — slug generated from name (unique, lowercase, hyphenated).
- `inviteToClinic` — token is 48-char hex, expiry = 14 days.
- `acceptClinicInvite` — expired/used token → throws; valid token sets `clinicId` + `clinicRole=member`.
- `removeFromClinic` — clears `clinicId`/`clinicRole`; therapist reverts to solo.
- `resolveCommissionForTherapist` (Phase 4):
  - clinic member, no personal sub → 0bps (clinic tier).
  - clinic member with starter personal sub → still 0bps (clinic overrides).
  - solo therapist (clinicId=null) → uses own subscription bps unchanged.
  - clinic subscription inactive → 250bps fallback.
- Seat count helper: `activeSeats(clinicId)` = count of members with `clinicRole !== null`.
- Proration math: add 1 seat mid-period → correct prorated pence (if implemented in lib).

**File: `src/lib/billing.test.ts`** (already covers `commissionBpsForTier('clinic') === 0`; no changes needed unless seat-pricing helpers are added to `billing.ts`).

### P1 — integration (route + test DB)

**File: `tests/integration/clinic-crud.test.ts`** (new):
- `POST /api/clinic/create` — creates `Clinic` row, sets caller `clinicRole=admin`.
- `POST /api/clinic/invite` — emits invite token (mock Resend); admin-only (403 for member).
- `GET /api/clinic/accept/[token]` — valid → member added; expired → 422; wrong clinic → 403.
- `POST /api/clinic/leave` — member reverts to solo; admin cannot leave (must transfer ownership first).
- `POST /api/clinic/remove` — admin removes member; non-admin → 403.

**File: `tests/integration/clinic-idor.test.ts`** (new):
- Clinic-A admin cannot GET `/api/clinic/calendar` for clinic B.
- Clinic-A member cannot call `/api/clinic/remove` (admin-only).
- No cross-clinic session visibility in calendar endpoint.
- Unauthenticated → 401 on all clinic routes.

**File: `tests/integration/clinic-commission.test.ts`** (new, Phase 4):
- Booking by a clinic **member** → `commissionBps = 0` in Stripe metadata.
- Refund for that booking routes to the member's Connect (unchanged from solo path).
- Booking by a **solo** therapist alongside → their commission unaffected (regression).

**File: `tests/integration/clinic-billing.test.ts`** (new, Phase 4):
- Subscribe clinic to seat plan → `stripe.subscriptions.create` called with `quantity=1`.
- Add second member → `stripe.subscriptions.update` called with `quantity=2` + proration.
- Remove member → `quantity` decremented.
- Clinic ICS feed token-gated: valid clinic token → merged ICS; mismatched token → 403.

### P2 — E2E (Playwright)

**File: `tests/e2e/clinic.spec.ts`** (new, chromium project — requires two seeded therapist accounts):
1. Admin therapist creates a clinic → `/therapist/clinic` shows team page.
2. Admin invites 2nd therapist → invite email link accepted → both appear on team calendar.
3. Client books the **member** therapist → payment reaches member's Connect, not admin's.
4. Admin sees the session in clinic reporting view.

### Regression

**Existing tests must stay green** when clinic code lands:
- `src/lib/practice.test.ts` — all existing `commissionPence` tests (solo paths).
- `tests/integration/booking-create.test.ts` — solo booking flow unchanged.
- `tests/integration/practice-booking.test.ts` — solo booking flow unchanged.
- `tests/e2e/therapist-dashboard.spec.ts` — solo dashboard unchanged.

---

## 6. Open decisions (answer before Phase 2)

1. **Connect model A vs B** (recommend A).
2. **Client ownership** — therapist owns, clinic admin can view (per the founder plan).
3. **Data controller** — clinic vs each therapist (counsel; likely the clinic as one controller with therapists as staff) → DPA variant.
4. **Pricing** — per-seat £; is the owner seat free?
5. **Gate** — reuse `PRACTICE_PORTAL_ENABLED` or add `CLINICS_ENABLED`.

---

## 7. Merge plan

Phases 2–4 are built on `feat/clinic-multi-therapist` (PR #25). Test with a real small clinic as a design partner, gate behind the flag, then merge. The `Clinic` table is additive → `prisma db push` at deploy. Until then, `/pricing`'s "Clinic" tier stays *coming soon* with the register-interest CTA already on the stub page.

---

## 8. Resume checklist {#resume}

When a design-partner clinic is ready, work through these steps in order.

### Infrastructure (do once, before any testing)

- [ ] **`STRIPE_PRICE_CLINIC`** — create a per-seat recurring price in Stripe (Live + Test), add env var to Vercel (all environments).
- [ ] **`PRACTICE_PORTAL_ENABLED=true`** — confirm set in staging Vercel env (gates all clinic routes).
- [ ] **`prisma db push`** on staging — applies `ClinicInvite` model + new `Clinic` billing fields (additive, safe).
- [ ] **Resend domain** — `sendClinicInviteEmail` sends from `FROM` env; confirm `RESEND_FROM` is a verified sender.

### E2E test accounts (staging / faresay.com with test Clerk)

- [ ] Create `test_clinic_admin@faresay.com` at `faresay.com/sign-up` (test Clerk instance).
- [ ] Create `test_clinic_member@faresay.com` at `faresay.com/sign-up`.
- [ ] Run `seed-e2e.mjs` for each account pair to get DB records + Match IDs.
- [ ] Add GitHub staging secrets: `E2E_CLINIC_ADMIN_EMAIL`, `E2E_CLINIC_MEMBER_EMAIL`, `E2E_CLINIC_ADMIN_MATCH_ID`.

### Manual smoke test on staging

- [ ] Admin creates a clinic via `/therapist/clinic` → confirm slug, team page renders.
- [ ] Admin invites member → invite email arrives → member accepts link → both appear on team page.
- [ ] Admin removes member → member reverted to solo, seat count decremented.
- [ ] Member clicks Leave → reverts to solo.
- [ ] Admin subscribes via `/api/clinic/billing/subscribe` → Stripe subscription created with `quantity=seatsTotal`.
- [ ] Clinic member books a client → confirm `commissionBps=0` in Stripe payment metadata.
- [ ] `GET /api/clinic/calendar` returns sessions for all members (admin-only; 403 for member).

### Tests to write (T4 — `TEST-PLAN.md §P4`)

- [ ] `src/lib/clinic.test.ts` — unit tests for `createClinic`, `inviteToClinic`, `acceptClinicInvite`, `leaveClinic`, `removeMember`, `resolveCommission` (4 cases).
- [ ] `src/lib/practice.test.ts` — convert the 4 `test.todo` clinic-commission items to real tests using `resolveCommission`.
- [ ] `tests/integration/clinic-crud.test.ts` — create, invite, accept, leave, remove (auth + happy path).
- [ ] `tests/integration/clinic-idor.test.ts` — cross-clinic read blocked; member cannot call admin routes; unauthed → 401.
- [ ] `tests/integration/clinic-commission.test.ts` — clinic-member booking → 0bps in Stripe metadata; solo regression.
- [ ] `tests/integration/clinic-billing.test.ts` — subscribe → `stripe.subscriptions.create` with `quantity=1`; add seat → `quantity=2`.
- [ ] `tests/e2e/clinic.spec.ts` — admin creates → invites → member accepts → client books → admin sees in calendar.

### Merge

- [ ] All smoke tests above pass.
- [ ] T4 tests written and green.
- [ ] PR #25 reviewed and merged to main.
- [ ] `prisma db push` on production.
- [ ] `STRIPE_PRICE_CLINIC` (Live price ID) set in Vercel production env.
- [ ] `/pricing` clinic tier CTA updated from "register interest" to "get started".
