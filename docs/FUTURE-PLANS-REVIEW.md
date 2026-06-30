# Future plans vs. the current build — review

Reviews the `fair-do_future/` strategy docs (master plan, scale/reinvestment, milestone pricing, student monetisation, starter tier, values copy, free→paid) against what's actually built, and against the stated roadmap. **Ordered by severity.**

**Roadmap (confirmed):** UK launch → clinics → US → Europe (**ES, IT, FR** first) → build the public **directory once >100 tutors**. The build already gates the directory behind `DIRECTORY_ENABLED` (good — matches "directory later").

---

## 🔴 Critical — money model contradicts itself

> **RESOLVED — updated to current model.** The per-tier 2.5%/1%/0% commission buy-down has been removed. The build now takes **0% on a tutor's own students** and **10% only on marketplace (directory-sourced) bookings**, with tiers **Free £0/mo · Pro £29/mo · School £79/mo**. Item 1's "keep 100%" contradiction no longer applies to a tutor's own students; items 2 and 4 below are likewise mooted by the source-based commission. The notes are retained for historical context.

**1. The build takes a lesson commission; the brand says it doesn't.** *(historical — see RESOLVED note)*
- **Build** (`src/lib/billing.ts`): **Free £0/mo, Pro £29/mo, School £79/mo.** Commission is **0% on own students** and **10% only on marketplace bookings** (`MARKETPLACE_COMMISSION_BPS`, `commissionForSource`) — independent of tier. The marketplace fee is a real Stripe **application fee** fair-do keeps.
- **Values copy (11)** and the live pricing/marketing: *"keep 100% of every lesson. We don't take a percentage."*
- Under the current model this holds for a tutor's **own** students (0%); the only fee is **10% on directory-sourced (marketplace) bookings**, where the messaging is "a small fee only when we find you the student." Make sure every surface carries that nuance so "keep 100%" is never naked.
- *(Original critique, now historical: previously every tier carried a commission and only the top tier was 0%, which contradicted "keep 100%". The recommended fix — go to 0% on own students — has shipped.)*

**2. Pricing architecture is a different model entirely.**
- **Docs (07 / 09 / 12):** one **flat fee** (£30 → £15 floor), **lock-in for life**, **milestone step-downs** (250/500/1,000…), **free starter** until ~**3 active students**, convert on cap with grace.
- **Build:** three fixed tiers (Free £0 / Pro £29 / School £79) differentiated by features (commission is now source-based, not tier-based); Free cap is **10 active students**, not 3; **no lock-in**, **no milestone schedule**.
- Gaps to build for the documented model:
  - `Subscription.lockedRatePence` + `lockedAt` (07 Rule 5 — store the rate at signup, bill it for life).
  - A **milestone table** (tutor-count → new-joiner rate) + logic that reads the *current* milestone rate for new signups only.
  - **Free-starter active-student cap** as a *feature boundary* (12) — currently a flat "up to 10" feature bullet, not an enforced, grace-handled cap.
  - Reconcile the **cap number**: docs say ~3, build says 10.

**3. Stale "keep 90%" in a live email.** `src/lib/email.ts` (`sendTeacherApproved`) still tells approved tutors *"you keep 90% of every lesson"* — pre-pivot, and contradicts the current **0% on own students / 10% on marketplace** model. Fix the copy to match (keep 100% on own students; a 10% fee only on directory-sourced bookings).

**4. Schema default drift.** *(Mooted under the current model.)* `Subscription.commissionBps` is no longer the live commission lever — commission is now computed by booking **source** (`commissionForSource`: 0% own, 10% marketplace), not from a per-tier basis-points field. Any residual `commissionBps` default in the schema is inert.

---

## 🟠 Important — stale doc & roadmap alignment

**5. `00-MASTER-PLAN.md` is entirely pre-pivot.** It describes a *two-sided marketplace*, *"we take 15%, not 65%"*, *"founding tutors keep 90%"*, students-first liquidity. None of that matches the current model (tutor practice tool, keep-100%/flat-fee, directory-later) **or your own roadmap.** Either rewrite it to the pivoted model or archive it — right now it's the loudest, most contradictory document in the set, and it's the one titled "master plan."

**6. i18n languages don't match the roadmap.** You said Europe = **ES, IT, FR**. The committed `docs/I18N-PLAN.md` targets **FR, DE, IT** (German, not Spanish). **Swap German → Spanish** so the plan matches the roadmap.

**7. Clinics order.** Roadmap puts **clinics before US**. `CLINIC-PLAN.md` exists (foundation on a draft branch) — good — but it's parked "after solo retention." That's consistent, just confirm clinics genuinely precede the US push in sequencing.

---

## 🟡 Worth noting

**8. "Keep 100%" needs the card-processing nuance everywhere.** Even at 0% commission, Stripe takes ~1.5%+20p. The values page here says "keep 100%… you cover only standard card processing, which we keep none of" — make sure *every* surface (pricing, about, marketing) carries that same precise nuance, so "100%" is never naked.

**9. Student monetisation (08) is well-aligned.** "Students pay fair-do nothing by default; never a per-lesson %; keep options open" matches the build (students pay the tutor via Stripe; gift vouchers exist; org credit pools exist). No change needed — just keep the payment rails flexible as the doc says (they are).

**10. Reinvestment/scale (06) is strategy, not build** — nothing to fix, but two cheap things it calls for that the build already has or half-has: status/health monitoring (`/admin/health`, alerts cron ✅), support deflection (help pages exist; the **inbox agent** is the big lever — keep it for the support-wall problem the doc centres on).

---

## ✅ Already aligned with the plans

- Directory gated until later (`DIRECTORY_ENABLED`) — matches ">100 tutors first."
- Free tier exists (free to start) — matches "remove the join barrier."
- Full verification at every tier (credential workflow) — matches the "free never means unvetted" guardrail.
- Tutor owns students / can leave with them — matches the values promise.
- Students pay the tutor directly, no student-side platform fee — matches monetisation default.
- Lock-in *narrative* is brand-safe; just not yet built.

---

## Suggested order of action

1. **Decide the commission question (#1)** — it gates the values page, the pricing page, and the whole brand claim. Recommend going to **0%** to match the entire doc set; I can make that one-line change on request.
2. Fix the **stale "90%" email** (#3) and the **schema default** (#4) — quick.
3. **Rewrite/archive `00-MASTER-PLAN`** (#5) and **swap i18n to ES/IT/FR** (#6).
4. Build the **lock-in + milestone + free-cap** pricing model (#2) when you move pricing from the current tiers to the documented model — sizeable; spec it like the other plans first.
</content>
