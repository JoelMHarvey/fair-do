# Practice Portal — Financial Model (SaaS)

> Companion to the pivot plan (`therapist-portal-pivot.md`) and its sibling docs
> (`pp-business-plan.md`, `model-comparison.md`). This is the **SaaS re-cut** of the old marketplace
> model (`financial-model.md`): we now sell **therapists** a subscription, not **clients** a session.
> Numbers are **directional starting ranges to validate**, not facts — every assumption is flagged
> `[PLACEHOLDER: validate]`. Modelled in **GBP** (UK-first beachhead). Bootstrapped lens: optimise
> for **MRR growth, low CAC payback, and net revenue retention** rather than vanity GMV.
> Last updated: 26 June 2026

---

## 0. The shape of the model in one paragraph

A B2B SaaS practice portal has a much simpler revenue equation than a two-sided marketplace. Revenue
is **paying therapists × ARPU**, where ARPU has three parts: a monthly **subscription**, a small
**commission on the GMV** each therapist processes through us, and **add-on** attach (AI helper,
accounting, client-finding network). The whole game is then (a) signing reachable therapists, (b)
keeping them (churn is the SaaS killer), and (c) lifting ARPU via add-ons. Crucially, the ceiling is
**therapist count × their existing caseloads** — a base we don't have to manufacture — not client
liquidity we have to buy. That contrast is the financial case for the pivot; see §10 and
`model-comparison.md`.

---

## 1. Revenue drivers

| Driver | Symbol | Placeholder | Source |
|--------|--------|-------------|--------|
| Paying therapists | T | model output | growth model |
| Free→paid conversion | c | [PLACEHOLDER: validate — ~8–15%] | funnel |
| Avg subscription / paying therapist / mo | s | [PLACEHOLDER: validate — blended ~£28] | pricing §2 |
| Avg therapist GMV / mo (payments processed) | G | [PLACEHOLDER: validate — ~£3,000] | caseload |
| Commission (basis points on GMV) | b | [PLACEHOLDER: validate — ~50–150 bps blended] | pricing §2 |
| Add-on attach (AI / accounting / network) | a | [PLACEHOLDER: validate — see §2] | add-ons |
| Monthly logo churn | k | [PLACEHOLDER: validate — ~3–5%/mo] | retention |

**ARPU (per paying therapist / month) = s + (G × b) + add-on contribution.**

Sensitivity is highest on **s** (tier mix), **add-on attach** (the ARPU multiplier), and **k**
(churn — it compounds against everything). GMV-commission is real but second-order at our scale
because per-therapist GMV is modest (a solo therapist isn't a high-volume merchant).

---

## 2. Pricing tiers recap (directional — see `therapist-portal-pivot.md` §4)

We lean to **Option A — Free + commission** (lowest adoption friction; the commission keeps the
"we grow when you grow" ethos; resolves the "why pay twice?" objection by making the free tier the
commission-bearing tier and buying commission *down* on paid tiers).

| Tier | Price | Commission | Modelled blended weight | Note |
|------|-------|-----------|-------------------------|------|
| **Starter** | £0 | ~2–3% on payments | [PLACEHOLDER: validate — ~50% of actives] | Not a paying logo; monetised by commission only |
| **Practice** | ~£29–39/mo | ~1% (or 0%) | [PLACEHOLDER: validate — ~40% of payers] | The core paying tier |
| **Clinic** | from ~£79/mo | 0% (multi-therapist) | [PLACEHOLDER: validate — ~10% of payers] | Reuses the Org/B2B model |
| *Add-on* — AI helper | ~£15–25/mo | — | attach [PLACEHOLDER: validate — ~25%] | Phase C |
| *Add-on* — Accounting | ~£10–15/mo | — | attach [PLACEHOLDER: validate — ~15%] | Phase E (integrate, don't build) |
| *Add-on* — Client network | rev-share or ~£20/mo | small finder fee | attach [PLACEHOLDER: validate — ~20%] | Phase D (the old marketplace, opt-in) |

> **Operator note:** "paying therapist" means a logo on a paid tier (Practice/Clinic) **or** a free
> therapist generating enough commission to matter. For the headline MRR/ARR build below we count
> **paid-tier subscriptions plus add-ons as MRR**, and treat commission as a separate (smaller,
> lumpier) revenue line — that's the honest way to read a freemium book.

---

## 3. Assumptions table (all `[PLACEHOLDER: validate]`)

These are the inputs the whole model swings on. None are facts yet — they are starting points to
test against the first 25–50 design-partner therapists.

| Assumption | Starting value | Confidence | Why it matters |
|------------|---------------|-----------|----------------|
| Free→paid conversion (c) | **~10%** | [PLACEHOLDER: validate] | Sets how big the free funnel must be |
| Avg therapist GMV/mo (G) | **~£3,000** | [PLACEHOLDER: validate] | ~£55 × ~14 sessions/wk-ish caseload; drives commission |
| Blended commission (b) | **~75 bps** (0.75%) | [PLACEHOLDER: validate] | Weighted across Starter (high) and paid (low/0) |
| Subscription ARPU (s, payers) | **~£35/mo** | [PLACEHOLDER: validate] | Practice-heavy mix with some Clinic |
| AI helper attach | **~25%** @ ~£20/mo | [PLACEHOLDER: validate] | The biggest ARPU lever |
| Accounting attach | **~15%** @ ~£12/mo | [PLACEHOLDER: validate] | Sticky; reduces churn |
| Client-network attach | **~20%** @ ~£20/mo | [PLACEHOLDER: validate] | Re-lit marketplace as add-on |
| Monthly logo churn (k) | **~4%** | [PLACEHOLDER: validate] | ⇒ ~25-month avg lifetime |
| Blended CAC (per paying therapist) | **~£150** | [PLACEHOLDER: validate] | Warm/community-led B2B should beat this |
| Gross margin (after COGS, §6) | **~80%** | [PLACEHOLDER: validate] | SaaS-standard target |

> **Operator note — the GMV number is doing a lot of work.** £3,000/mo assumes a roughly two-thirds-
> full solo caseload at UK list prices. A part-time therapist might be £1,000–1,500; a full clinic
> chair, £5,000+. Model it as a band, and replace it with measured data the moment we have a cohort.

---

## 4. Illustrative MRR / ARR build (100 / 500 / 1,000 paying therapists)

Worked with the §3 starting values. **MRR = subscription + add-on attach.** Commission on GMV is
shown separately (it's smaller and lumpier). Show the maths out loud.

**Per-payer monthly economics (the building block):**

- Subscription ARPU: **s = £35**
- Add-on contribution per payer (blended attach × price):
  - AI: 0.25 × £20 = **£5.00**
  - Accounting: 0.15 × £12 = **£1.80**
  - Network: 0.20 × £20 = **£4.00**
  - Add-on subtotal = **£10.80/payer/mo**
- **Subscription + add-on ARPU = £35 + £10.80 = £45.80/payer/mo**
- Commission per payer: G × b = £3,000 × 0.0075 = **£22.50/payer/mo** (this is *gross* commission
  before processing-fee pass-through; net contribution is smaller — see §6).

| Stage | Paying therapists (T) | Subs+add-on MRR (T × £45.80) | Commission/mo (T × £22.50) | **Total monthly revenue** | **ARR (Subs+add-on × 12)** |
|-------|----------------------|------------------------------|-----------------------------|---------------------------|-----------------------------|
| Early | **100** | £4,580 | £2,250 | **£6,830** | **£54,960** |
| Mid | **500** | £22,900 | £11,250 | **£34,150** | **£274,800** |
| Scale | **1,000** | £45,800 | £22,500 | **£68,300** | **£549,600** |

> **Operator note:** at 1,000 paying therapists this is roughly **£550k subscription/add-on ARR** plus
> **~£270k/yr commission** — call it **~£820k total run-rate** at these assumptions. That sanity-checks
> against the pivot doc's quick "100 × £30 ≈ £3k MRR core" line (§8 of `therapist-portal-pivot.md`):
> we land a little higher because add-ons lift ARPU above bare subscription. The headline ARR number
> is **add-on-attach-sensitive** — see §8.

A useful reframe of ARPU: at these inputs, **blended ARPU including commission ≈ £68.30/payer/mo
(~£820/yr)**. Add-ons and commission together roughly **double** the bare £35 subscription — which is
exactly why §8 leans on attach as the primary growth lever.

---

## 5. Unit economics (per paying therapist)

| Metric | Formula | Value (starting assumptions) |
|--------|---------|------------------------------|
| Monthly contribution / payer | ARPU × gross margin | (£45.80 + ~£14 net comm.) × 0.80 ≈ **£47.84** |
| Avg lifetime (months) | 1 ÷ k | 1 ÷ 0.04 = **25 months** |
| **LTV** | monthly contribution × lifetime | £47.84 × 25 ≈ **£1,196** |
| **CAC** | blended acquisition £ / new payer | **~£150** [PLACEHOLDER: validate] |
| **LTV:CAC** | LTV ÷ CAC | £1,196 ÷ £150 ≈ **8.0:1** |
| **CAC payback** | CAC ÷ monthly contribution | £150 ÷ £47.84 ≈ **3.1 months** |

> **Operator note — read this with healthy suspicion.** An 8:1 LTV:CAC and 3-month payback look
> *too* good, and they are entirely a function of two soft inputs: **CAC** (will B2B-community
> acquisition really come in at £150?) and **churn** (4%/mo ⇒ 25-month life — early SaaS often churns
> faster before the product is sticky). Halve the lifetime (k = 8%/mo ⇒ 12.5 months) and LTV roughly
> halves to ~£598, dropping LTV:CAC to ~4:1 — still healthy, but earthbound. Treat ≥3:1 as the bar
> and ≤12-month payback as the comfort zone; everything above that is upside to *prove*, not bank.

Note the commission contribution above uses the **net** figure (~£14/payer after processing
pass-through, §6), not the gross £22.50, so LTV isn't flattered by money that goes straight to Stripe.

---

## 6. Cost structure

Costs split into per-therapist variable COGS (which set gross margin) and the fixed/semi-fixed base
(which break-even has to cover).

**Variable / COGS (per paying therapist):**

| Cost line | Starting assumption | Note |
|-----------|--------------------|------|
| Infra / hosting per therapist | ~£1–3/mo [PLACEHOLDER: validate] | Neon + compute + Daily.co video minutes; scales sub-linearly |
| Stripe Billing fee (on subscription) | ~1.5% + ~£0.20 / charge | On the *subscription* charge itself |
| Stripe Connect fee (on client payments) | ~1.5% + £0.20 / payment (UK) | **Pass-through** — netted out of commission; this is why net commission (~£14) < gross (£22.50) |
| Support (per active therapist) | ~£2–4/mo [PLACEHOLDER: validate] | Front-loaded at onboarding; falls with self-serve maturity |
| COGS of add-ons | AI: LLM inference/usage; Accounting: integration/partner rev-share | AI is genuinely variable (token cost); accounting is a partner margin share, not build cost |

**Fixed / semi-fixed (monthly, the break-even hurdle):**

| Cost line | Starting assumption | Note |
|-----------|--------------------|------|
| Core team | [PLACEHOLDER: validate] | The dominant line; bootstrapped = small |
| Software / tooling | ~£300–800/mo [PLACEHOLDER: validate] | Clerk, Resend, observability, etc. |
| Compliance / legal | step-cost [PLACEHOLDER: validate] | DPA template, processor DPIA, security (special-category data) — see `therapist-portal-pivot.md` §9 |
| Insurance (tech / cyber E&O) | [PLACEHOLDER: validate] | Lighter than the marketplace's care-intermediary posture |

> **Operator note:** SaaS COGS are blissfully low *except the AI helper*. LLM inference is real,
> usage-linked variable cost — price the AI add-on with a margin over inference, and watch heavy users.
> The accounting add-on is mostly a partner integration (Xero/FreeAgent), so its "COGS" is a rev-share,
> not engineering burn — that's the point of integrating rather than building (`therapist-portal-pivot.md` §5, Phase E).

---

## 7. Path to break-even (sketch)

Break-even = monthly contribution covers fixed costs. With **contribution ≈ £47.84/payer/mo**:

**Paying therapists needed = Fixed monthly cost ÷ £47.84.**

| Assumed fixed cost / mo | Payers to break even | Roughly equivalent stage |
|--------------------------|----------------------|--------------------------|
| £5,000 (lean, founder-led) | ~105 | Just past the 100-payer "Early" stage above |
| £15,000 (small team) | ~314 | Between the Early and Mid stages |
| £30,000 (funded team) | ~627 | Past the 500-payer "Mid" stage |

The maths: at £15,000/mo fixed, £15,000 ÷ £47.84 ≈ **314 paying therapists**. Each is one reachable
buyer with their own caseload — not two cold marketplace sides — which is precisely why this curve is
*walkable* where the marketplace's wasn't.

> **Operator note:** the lean row matters most for a bootstrapped pivot. If we can run founder-led at
> ~£5k/mo of true fixed cost, **break-even sits roughly at the 100-payer milestone** — the same
> milestone Phase B targets (`therapist-portal-pivot.md` §5, "25 paying therapists" en route).
> Contribution-positive-per-logo from day one, then it's a counting exercise to fixed-cost coverage.

---

## 8. Sensitivity levers

The three inputs the founder can actually pull, and what they do to the model. Base = §4/§5 values.

**Lever 1 — ARPU via add-on attach.** Add-ons contribute £10.80/payer at base attach. Push the AI
attach from 25%→40% (£5.00→£8.00) and overall ARPU rises £3/payer ⇒ at 1,000 payers that's
**+£36k/yr ARR** and it flows almost entirely to contribution (high-margin). Add-on attach is the
single best ARR lever because it lifts ARPU *without* new acquisition spend.

| AI attach | Add-on ARPU | Subs+add-on ARPU | ARR @ 1,000 payers |
|-----------|-------------|------------------|--------------------|
| 15% | £8.80 | £43.80 | £525,600 |
| 25% (base) | £10.80 | £45.80 | £549,600 |
| 40% | £13.80 | £48.80 | £585,600 |

**Lever 2 — churn.** Churn compounds against LTV and therefore against every acquisition pound.

| Monthly churn (k) | Avg lifetime | LTV (@ £47.84/mo) | LTV:CAC (@ £150) |
|-------------------|--------------|-------------------|------------------|
| 3% | 33 mo | ~£1,579 | ~10.5:1 |
| 4% (base) | 25 mo | ~£1,196 | ~8.0:1 |
| 6% | 17 mo | ~£797 | ~5.3:1 |
| 8% | 12.5 mo | ~£598 | ~4.0:1 |

Retention is the SaaS game: a 3→8% churn swing more than **halves** LTV. Onboarding (<15-min setup),
the accounting add-on (sticky), and packages all buy churn down.

**Lever 3 — free→paid conversion.** Conversion sets how big the free top-of-funnel must be to hit a
payer target. At c = 10%, **1,000 payers needs ~10,000 free signups**; at c = 15%, only ~6,700; at
c = 8%, ~12,500. Conversion doesn't change per-payer economics but it changes the **CAC of the funnel**
and the marketing volume required — a powerful indirect lever.

> **Operator note:** the levers interact. The healthiest path is **high attach + low churn**: add-ons
> raise ARPU *and* (the sticky ones) lower churn, compounding LTV from both ends. The single most
> dangerous combination is **high churn + optimistic CAC** — it quietly turns an 8:1 model into a 3:1
> one. Watch those two before anything else.

---

## 9. What the model still needs (before relying on it)

- Replace **G (therapist GMV/mo)**, **c (conversion)**, **s (tier mix)**, and **attach rates** with
  measured numbers from the first 25–50 design-partner therapists.
- Measure **real early churn** — assume it's worse than 4%/mo until proven; cohort it.
- Pin **CAC by channel** (direct/design-partner vs community vs referral vs content) — the pivot's
  whole premise is that B2B-therapist CAC beats consumer CAC; prove it.
- Reconcile **fixed-cost and compliance step-costs** with the processor-model legal work
  (`therapist-portal-pivot.md` §9).

---

## 10. Contrast with the marketplace model (the ceiling problem)

The old model's revenue was **N clients × S sessions × P price × 15% take** — and its binding
constraint was **client liquidity**, the side we had to buy, against BetterHelp's budget, under
ad-policy limits (`financial-model.md`; `therapist-portal-pivot.md` §1). Revenue was bounded by demand
we couldn't manufacture cheaply.

The SaaS model's ceiling is **therapists × their existing caseloads** — a base each therapist *brings
with them*. We sign one reachable buyer (with budget, with acute admin pain) and they arrive with their
own clients. The revenue is **recurring (MRR), compounding (add-ons + retention), and fundable** rather
than transactional and liquidity-gated.

> **Operator note:** the marketplace isn't deleted — it's **demoted to the client-network add-on**, and
> it now accumulates liquidity as a *by-product* of therapists onboarding their own clients, instead of
> being the whole business we had to subsidise. That inverts the cold-start problem. For the full
> side-by-side — revenue ceilings, CAC, defensibility — see `model-comparison.md`.

---

*Cross-links: `therapist-portal-pivot.md` (strategy source of truth), `pp-business-plan.md` (the
operating plan this model feeds), `model-comparison.md` (marketplace vs SaaS side-by-side),
`financial-model.md` (the original marketplace model this re-cuts).*
