# Marketplace vs Practice Portal — Comparison

> The centrepiece decision doc for the pivot. It sets the OLD model (the B2C therapy
> marketplace in `business-plan.md`) and the NEW model (the B2B SaaS practice portal in
> `therapist-portal-pivot.md`) side by side, even-handedly, so the founder can make the call
> with the trade-offs visible rather than buried. Companion to `therapist-portal-pivot.md`,
> `pp-business-plan.md`, `pp-financial-model.md` and `pp-gtm-strategy.md`.
> Last updated: 26 June 2026

---

## Framing

Both models serve the same mission — *fair-for-therapists, accessible mental-health care, no
company profiting from human suffering* — and both run on largely the same codebase. The
difference is **which side of the market Faresay sells to, and therefore which problem the
company has to solve first.** The marketplace sells *care* to clients and lives or dies on the
hardest, most expensive thing in mental-health B2C: acquiring trust-gated demand. The practice
portal sells *software* to therapists and lives or dies on a far more tractable thing: signing a
reachable, budget-holding buyer who already has their own clients. This document does not
pretend the portal is strictly better — the marketplace has a bigger end-state prize and owns
the demand relationship — but it argues the portal is the better *opening move*, and that the
two are not mutually exclusive: the marketplace becomes an add-on inside the portal, which is
the recommendation below.

---

## 1. Side-by-side

> **Operator note:** every number here is directional and flagged to validate. Treat the table
> as the shape of the bet, not the spreadsheet — the spreadsheet is `pp-financial-model.md`.

| Dimension | OLD — Marketplace | NEW — Practice Portal |
|---|---|---|
| **Primary customer** | The client (demand side) | The therapist (the practice owner) |
| **Who Faresay acquires** | Clients *and* therapists (both sides) | Therapists only |
| **Who owns the client relationship** | Faresay | The therapist |
| **How clients arrive** | Faresay matches them to a therapist | The therapist invites their own existing clients |
| **Revenue model** | 15% commission per completed session (10% for founders) | Subscription (MRR) + small payment commission + add-ons |
| **Revenue character** | Transactional, per-session, variable | Recurring (subscription) + transactional (commission) + recurring (add-ons) |
| **Revenue ceiling** | Bounded by *client* liquidity Faresay can manufacture | Bounded by *therapist* count × their existing caseload + add-on attach |
| **CAC profile** | High, trust-gated, ad-policy-restricted, bidding against BetterHelp | Lower; reachable buyers, clear ROI, tax-deductible spend |
| **Cold-start risk** | Severe — worthless to the first client (no liked therapists) and the first therapist (no clients) | Low — a single therapist gets value alone on day one, no liquidity required |
| **Competitive set** | BetterHelp, Talkspace, Headway/Alma/Grow (US insurance), directories | SimplePractice, Cliniko, Power Diary, Halaxy, WriteUpp |
| **Regulatory posture** | Care intermediary → **data controller**; clinical/crisis liability sits closer to Faresay | Software tool → **data processor**; therapist is **controller**, clinical/crisis liability sits with them |
| **Gross margin** | Thinner — 15% of a session, after processing, support and care-side ops | Higher — software margins on subscription; commission is incremental |
| **Recurring vs transactional** | Mostly transactional (re-earn revenue every session) | Mostly recurring (MRR compounds, churn is the game) |
| **Defensibility / moat** | Liquidity + data/reputation/community flywheel — strong *if* you reach it, but it's the hard, expensive thing | Workflow lock-in (their whole practice runs here) + switching cost + the latent network as an add-on |
| **Time-to-first-revenue** | Long — must seed supply, then win demand, then a session completes | Short — sign one therapist, they run a caseload this week, pay next month |
| **Capital intensity** | High — you subsidise the hard side (demand) to bootstrap liquidity | Low — growth comes from signing one reachable buyer at a time, not two cold sides |
| **Mission / brand fit** | "Fair fees, access for clients" — direct, client-facing | "Fair for therapists; we grow when you grow" — the ethos transfers cleanly |
| **What code is reused** | n/a (it *is* the existing build) | ~80% carries over (see §4); new build is subscriptions + ownership inversion + per-client rates + multi-tenancy |

---

## 2. What each model is best at

Neither model is dominant on every axis. Being honest about each one's genuine strengths is the
point of the exercise.

**The marketplace is best at:**

- **Owning the demand relationship.** Faresay holds the client, the data and the match — which,
  *if* liquidity is ever achieved, is the more valuable end-state asset and the harder thing for
  an entrant to copy.
- **A single, legible consumer story.** "Affordable, trusted therapy" is easy to say, easy to
  market, and emotionally resonant. It's the kind of mission people share.
- **A compounding network flywheel** — the data, reputation and community moats in
  `business-plan.md` §12 are real *at scale*. The prize is bigger if you get there.
- **Direct mission delivery** — it puts care in front of clients, not one step removed behind a
  therapist's practice.

**The practice portal is best at:**

- **A tractable funnel.** It sells to people who are findable, have budget, and feel acute pain
  *today* — removing the binding constraint that stalled the marketplace.
- **Recurring, predictable, fundable revenue.** MRR compounds; you don't re-earn it every
  session. Retention, not constant re-acquisition, becomes the core discipline.
- **Day-one value with no liquidity.** A lone therapist gets a working practice OS immediately;
  there is no two-sided cold start to subsidise.
- **Capital efficiency.** Each new customer is one reachable buyer, not a matched pair won across
  two cold sides at once.
- **A lighter regulatory posture** (processor, not controller — see §3 and
  `therapist-portal-pivot.md` §9), which likely unblocks the cross-border gate
  (`cross-border-legal-gate.md`) that the marketplace tripped over.
- **Latent optionality** — every therapist brings their own clients onto the platform, so
  liquidity *accumulates as a by-product*, ready to re-light the marketplace as an add-on once
  it's de-risked.

The clean way to read this: the marketplace optimises for the *bigger end-state prize*; the
portal optimises for *reaching a viable business at all*, while quietly accumulating the very
asset (liquidity) the marketplace needed.

---

## 3. What carries over vs what changes

**Carries over (mostly unchanged):**

- **The mission and brand.** "Fair for therapists; we grow when you grow; no company should
  profit from human suffering" transfers directly — arguably it lands *better* when the customer
  is the therapist you're being fair to.
- **The high security bar.** Mental-health data is special-category either way; strong security,
  breach process and EU/UK residency stay non-negotiable.
- **The therapist as a trusted, registered professional** (BACP/UKCP/NCS) — central to both
  models, just now the buyer rather than the supply you recruit to serve clients.
- **~80% of the code** (see §4).

**Changes materially:**

- **Who pays and for what** — client paying per session → therapist paying a subscription (+ a
  small commission + add-ons).
- **Who owns the client** — Faresay → the therapist. This "ownership inversion" is the single
  biggest conceptual and data-model change (`therapist-portal-pivot.md` §3, §6).
- **The regulatory role** — controller → **processor**. The therapist becomes the controller of
  their clients' special-category data; Faresay needs an Art. 28 **DPA with every therapist** and
  a SaaS subscription agreement as the primary contract (replacing the contractor agreement).
  Clinical governance and crisis liability shift to the therapist. Lighter overall, but the
  processor obligations and special-category security are real work, not a formality.
- **The competitive set** — from BetterHelp et al. to practice-management incumbents
  (SimplePractice, Cliniko, Power Diary, Halaxy, WriteUpp). The wedge changes from "trust + niche
  fit + fair fees" to "simplicity + AI-native + fair ethos + optional demand."
- **The unit of growth** — from a matched client–therapist pair to a single signed therapist.

---

## 4. What code is reused

The pivot is mostly a *resequencing* of what's already shipped, not a rebuild. From
`therapist-portal-pivot.md` §3 and PROJECT.md:

| Capability | Status | In the portal model |
|---|---|---|
| Therapist auth, onboarding, profile | Built | Becomes *practice settings* |
| Availability + calendar | Built | Re-point to therapist-led scheduling |
| Stripe Connect (KYC, payouts, app-fee) | Built | Client→therapist payments + commission |
| Video sessions (Daily.co) | Built | The session room, unchanged |
| Messaging (thread per relationship) | Built | Therapist↔client messaging |
| Email + `.ics` + reminders (Resend, cron) | Built | Invites / reminders |
| Earnings dashboard | Built | Practice revenue view |
| Credits / vouchers ledger | Built | **Repurposed as package/bundle balances** |
| Org / B2B (pools, domains, reports) | Built | Group practices / clinics (multi-therapist) |
| Reviews, referrals, complaints | Built | Kept; referrals reframed as *therapist* referrals |
| Marketplace directory + matching | Built | **Demoted to the opt-in "find clients" add-on** |
| Client invite flow (therapist-initiated) | New | Build — the ownership inversion |
| Per-client rate override + packages UI | New | Build (data + UI) |
| Subscription billing (Stripe Billing) | New | Build — the new money layer |
| Practice-scoped multi-tenancy | Partial | Re-scope client UX to one therapist |

**The headline:** the marketplace Faresay already shipped *is* the "find new clients" add-on.
Nothing is thrown away — it's resequenced. The genuinely new build is Stripe Billing
subscriptions, therapist-initiated client invites, per-client rates and practice multi-tenancy.

---

## 5. The hybrid option (recommended)

The decision is often framed as "marketplace *or* portal." It isn't. The strongest play is to
**lead with the portal and run the marketplace as an opt-in add-on inside it** — Phase D in
`therapist-portal-pivot.md` §5, the "client-finding network."

How the hybrid de-risks *both* models:

- **It removes the marketplace's cold-start tax.** The portal accumulates therapists and their
  caseloads first. By the time the directory re-lights, there is already real supply *and* real
  in-platform demand — the liquidity the marketplace could never afford to buy is now a free
  by-product of selling software.
- **It hedges the portal's commercial risk.** If subscription ARPU disappoints, the network
  add-on (finder fee / rev-share on first bookings) opens a second revenue line that the
  incumbents structurally can't match — none of SimplePractice, Cliniko or Power Diary bring
  their customers *demand*.
- **It keeps the bigger prize alive without betting on it.** The marketplace's end-state moat
  (data, reputation, community) is preserved as upside, but Faresay no longer has to win two cold
  sides at once to unlock it. The network switches on only once it demonstrably supplies
  incremental bookings — sequenced *after* the core OS proves retention.
- **It sequences the legal posture safely.** Lead as a processor (lighter); add the
  demand-matching layer only once the controller/processor model is legally settled, rather than
  carrying full care-intermediary liability from day one.
- **It turns the existing asset into a head start.** Any therapists already warmed up from
  marketplace recruitment are warm design-partner leads for the portal *today*
  (`therapist-portal-pivot.md` §7), and the directory code is already built.

The risk to manage: don't let the add-on pull focus before the core earns it. The discipline is
sequencing — Phase A (Practice OS) must prove retention *before* Phase D re-lights the network.
Detail in `pp-gtm-strategy.md` and `pp-business-plan.md`.

---

## 6. Recommendation

**Lead with the practice portal; keep the marketplace as the re-lightable add-on (the hybrid).**

The rationale, briefly:

1. **It dissolves the binding constraint.** Client acquisition was structural, not an execution
   miss. Selling to therapists swaps an expensive, trust-gated, two-sided demand problem for a
   reachable, budget-holding, single-sided buyer.
2. **The revenue is better-shaped for a bootstrapped company** — recurring, predictable,
   fundable, compounding — and grows by signing one buyer rather than winning a pair.
3. **The reuse is real.** ~80% of the build carries over; the pivot is mostly an ownership
   inversion plus a subscription layer, so time-to-first-revenue is short.
4. **The mission and the moat both survive.** The ethos transfers; the marketplace's bigger prize
   is preserved as optional upside that de-risks itself as the portal accumulates liquidity.
5. **The regulatory posture gets lighter** and likely unblocks the cross-border gate that stalled
   the marketplace.

This is not a claim that the marketplace was wrong — it built the asset that makes the add-on
credible. It's a claim about *order of operations*: sell the pickaxes first, accumulate liquidity
as a by-product, then switch the marketplace back on once it's free to win.

---

## 7. Key decisions and assumptions to validate

These are the things that, if wrong, change the recommendation. Most map to the founder
decisions in `therapist-portal-pivot.md` §11 and the model in `pp-financial-model.md`.

**Decisions (founder):**

- **Scope:** full pivot with marketplace demoted to add-on (recommended) vs running both models
  in parallel.
- **Pricing model:** Option A (Free + commission, paid tiers buy it down — recommended) vs
  Option B (subscription only, 0% commission). Resolves the "why pay twice?" tension.
- **Add-on order:** AI helper first (differentiation) vs client-network first (most code reuse,
  fastest). Recommended: AI helper first, network close behind.
- **Brand & geography:** keep "Faresay" and stay UK-first (both recommended).

**Assumptions to validate (flag as directional until tested):**

- **Subscription ARPU and tiers** — Starter £0, Practice ~£29–39/mo, Clinic from ~£79/mo are all
  [PLACEHOLDER: validate against willingness-to-pay and incumbent pricing].
- **Commission acceptance** — that therapists tolerate a small payment commission on a free tier
  (or accept 0% on paid tiers) without the "pay twice" objection killing conversion.
- **Therapist CAC and channel conversion** — that professional communities, directories and
  referral loops convert at a cost the recurring revenue pays back (the whole tractability claim).
- **Retention / churn** — the SaaS game. Month-2 retention >80% among design partners is the
  early bar (`therapist-portal-pivot.md` §5, Phase B).
- **Switching cost** — that a Phase-A MVP genuinely replaces 4–6 tools well enough that
  therapists migrate (CSV import, <15-min setup, run-alongside-old-tools at first).
- **Add-on attach rates** — AI helper ≥25% attach; network supplying *measurable* incremental
  bookings before it's worth re-lighting.
- **The processor re-characterisation** — that legal review confirms the controller→processor
  shift and a workable DPA-with-every-therapist before onboarding at scale.

> **Operator note:** the single sentence the whole recommendation must pass is the one from the
> pivot plan — *a reachable therapist can be signed, set up in under fifteen minutes, run their
> existing clients through Faresay this week, and pay us next month, without us finding a single
> client for them.* If that holds in practice, the portal is the right opening move and the
> marketplace is the upside. Validate it with design partners before committing spend.
