# Practice Portal — Risk Register

> Companion to the pivot plan (`therapist-portal-pivot.md`) and the practice-portal sibling docs
> (`pp-business-plan.md`). This is the risk register for the **B2B SaaS practice-portal** model — the
> therapist is the buyer, the marketplace is demoted to an opt-in add-on. It does **not** restate the
> old marketplace register (`risk-register.md`), which covered the care-intermediary posture we are
> stepping away from. Living document — review at least quarterly and on any material change.
> Scoring: Likelihood (L) and Impact (I) each 1–5; Rating = L×I (1–8 Low · 9–14 Medium · 15–25 High).
> Owners are roles, not named individuals yet.
> Last updated: 26 June 2026

## How to use
Each risk has an ID, category, description, L, I, Rating, mitigation(s), and owner. Re-score after
mitigations land (residual risk). Numbers are **directional assumptions to validate**, not measured
facts. ⚠️ flags cross-link to the policy, doc, or decision that addresses the risk.

> **Operator note:** the pivot is *generally lighter* on clinical/crisis liability than the
> marketplace (that exposure shifts to the therapist as controller), but it is *heavier* in two
> places people underestimate: (1) the controller→processor data obligations — a DPA with **every**
> therapist — and (2) the commercial reality that selling software to a busy, loyal incumbent-user is
> a switching-cost problem, not just a demand problem. The top risks below cluster there.

---

## A. Market & demand
| ID | Risk | L | I | Rating | Mitigation | Owner |
|----|------|---|---|--------|-----------|-------|
| PP-01 | **Switching inertia** — therapists already run on 4–6 tools they tolerate; "good enough" plus the effort of migrating means they don't move, even when our product is better | 4 | 5 | **20 High** | <15-min onboarding bar; CSV import of existing client lists; white-glove migration for design partners; run *alongside* old tools first, not rip-and-replace; lead with the one acute pain (getting paid / admin) ⚠️ (`therapist-portal-pivot.md` §3) | Product/Growth |
| PP-02 | **Entrenched incumbents** — SimplePractice, Cliniko, Power Diary, Halaxy, WriteUpp have feature depth, integrations, and trust we don't | 4 | 4 | **16 High** | Don't fight on feature breadth; win the **underserved solo / early-career** segment incumbents over-charge and over-serve; wedge = simplicity + AI-native + fair ethos + optional demand ⚠️ (`pp-business-plan.md`) | Founder |
| PP-03 | **Slow B2B sales cycle** — even a tractable funnel is slower-to-cash than assumed; therapists evaluate at quarter/tax-year boundaries, deliberate, ask peers | 3 | 3 | 9 Med | Free-tier removes the buying decision at entry (Option A); design-partner co-build shortens proof; instrument funnel from day 1; rebase cash timeline to be conservative | Founder/Growth |
| PP-04 | **Low switching willingness despite stated interest** — warm "I'd love that" doesn't convert to migration; survey enthusiasm ≠ behaviour | 3 | 4 | 12 Med | Validate with *paid* pilots not interviews; require a real caseload running live before counting a win; track activation (first client invited + first payment), not signups ⚠️ (`pp-business-plan.md` validation) | Growth |
| PP-05 | **Beachhead too narrow or mis-drawn** — UK solo BACP/UKCP/NCS full-timers may be a smaller reachable base than the model assumes | 3 | 3 | 9 Med | Size the segment explicitly before scaling spend; keep clinic/group (Org model) and adjacent modalities as expansion paths; flag count as `[PLACEHOLDER: TAM estimate]` | Founder |

## B. Pricing
| ID | Risk | L | I | Rating | Mitigation | Owner |
|----|------|---|---|--------|-----------|-------|
| PP-06 | **"Why pay subscription AND commission?"** — incumbents charge subscription only and take **no** cut of session fees; a commission on top reads as paying twice and stalls adoption | 4 | 4 | **16 High** | Resolve in packaging: **free tier monetised by commission**, paid tiers buy commission down to ~0% plus features (Option A); or subscription-only 0% (Option B). Never charge a full subscription *and* a material commission on the same tier ⚠️ (`therapist-portal-pivot.md` §4) | Founder |
| PP-07 | **Commission too low to matter / too high to tolerate** — the band that is both worth collecting and not resented may be thin (~1–3% directional) | 3 | 3 | 9 Med | Benchmark vs Halaxy per-transaction fees; A/B the free-tier rate; model contribution per therapist before locking; treat all % as assumptions to validate | Founder/Finance |
| PP-08 | **Price anchoring against "free"** — therapists compare the £29–39 tier to free spreadsheets + bank transfer, not to SimplePractice's £50–70 | 3 | 3 | 9 Med | Anchor on incumbents and on time saved / faster payment (tax-deductible ROI); make the free tier genuinely useful so paid is an upgrade, not a gate | Growth |
| PP-09 | **Add-on pricing cannibalises or confuses** — too many lines (AI, accounting, network) muddy a "simple" promise | 2 | 3 | 6 Low | Keep core pricing legible; sequence add-ons (C/D/E) after the core lands; bundle thoughtfully | Product |

## C. Product
| ID | Risk | L | I | Rating | Mitigation | Owner |
|----|------|---|---|--------|-----------|-------|
| PP-10 | **Thin MVP doesn't replace enough tools to justify switching** — if Phase A doesn't cover calendar + payments + video + invites end-to-end, the therapist still needs their old stack, so they don't move | 4 | 5 | **20 High** | Sequence Phase A to deliver the **must-have set whole** (invite → book → pay → meet → invoice) before any polish; define "good enough to drop tool X" per tool and ship to that line ⚠️ (`therapist-portal-pivot.md` §5) | Product |
| PP-11 | **"Easy to use" not actually achieved** — simplicity is the core promise and the only durable wedge; if setup or daily use is fiddly, the differentiator evaporates | 3 | 4 | 12 Med | Onboarding wizard, <15-min live bar as an explicit acceptance test; usability testing with design partners every phase; ruthless scope cuts to protect the simplicity bar | Product/Design |
| PP-12 | **Ownership-inversion migration breaks data** — re-pointing client ownership from Faresay to the therapist (`Match` → `ClientRelationship`) is the riskiest schema change | 3 | 4 | 12 Med | Do it behind a feature flag; migrate then flip default; additive changes first; backup + rollback plan ⚠️ (`therapist-portal-pivot.md` §6) | Engineering |
| PP-13 | **Reuse assumption (~80%) overstated** — Stripe Billing, per-client rates, invite flow, multi-tenancy are genuinely new and may be larger than scoped | 3 | 3 | 9 Med | Spike the new primitives early (Stripe Billing + invite token + per-client rate); re-estimate after the spike; don't bank the 80% in the plan's timeline | Engineering/Founder |

## D. Data, privacy & legal
| ID | Risk | L | I | Rating | Mitigation | Owner |
|----|------|---|---|--------|-----------|-------|
| PP-14 | **Special-category data breach** — mental-health client data is the highest-sensitivity category; a breach is existential for trust and triggers ICO action | 3 | 5 | **15 High** | Re-cut `uk-security-data-protection-policy.md` for the processor role; encryption, RBAC, MFA, logging, pen testing; processor-role DPIA; incident-response runbook (ICO 72h) ⚠️ SECURITY | Security Lead/DPO |
| PP-15 | **Controller→processor obligations underestimated** — under UK GDPR the therapist is controller, Faresay is processor; the Art. 28 duties (instructions, sub-processor chain, breach support, audit) are real work | 4 | 4 | **16 High** | Legal review of the re-characterisation **before** onboarding therapists; processor obligations built into product and policy, not bolted on ⚠️ COUNSEL (`therapist-portal-pivot.md` §9) | Legal/DPO |
| PP-16 | **DPA-with-every-therapist friction or gap** — we need an Art. 28 DPA signed by *each* therapist-controller; missing/unsigned DPAs mean unlawful processing at scale | 4 | 4 | **16 High** | Art. 28 DPA template ready **at launch**, accepted in-product as part of signup (click-through, versioned, logged); block live processing until accepted; SaaS subscription agreement as primary contract ⚠️ COUNSEL | Legal/Product |
| PP-17 | **Sub-processor chain non-compliance** — Neon, Stripe, Daily, Resend, Clerk must be flowed-down, disclosed, and change-notified to controllers | 2 | 4 | 8 Low | Sub-processor inventory + DPAs; disclosed list in the DPA; change-notification mechanism; data-residency held EU/UK ⚠️ COUNSEL/SECURITY | Security/Legal |
| PP-18 | **AI add-on governance** — special-category data through an AI assistant raises the bar: autonomous clinical content, training-data leakage, and DPA coverage gaps | 3 | 4 | 12 Med | Sequence AI add-on **after** the processor model is legally settled; hard "no autonomous clinical decisions" line; therapist-supervised only; explicit DPA coverage + guardrails ⚠️ COUNSEL (`therapist-portal-pivot.md` §5/§9) | Product/Legal |
| PP-19 | **"Tool, not care provider" line blurs** — if product UX, marketing, or the network add-on implies Faresay arranges care, the lighter processor posture collapses back toward intermediary liability | 2 | 4 | 8 Low | Explicit "we are a tool, not a care provider" framing in T&Cs and UI; clinical governance/crisis material surfaced as *therapist* support, not a Faresay service ⚠️ COUNSEL | Legal/Product |

## E. Commercial
| ID | Risk | L | I | Rating | Mitigation | Owner |
|----|------|---|---|--------|-----------|-------|
| PP-20 | **Churn** — SaaS lives or dies on retention; a thin product or unrealised value means therapists leave after the trial / free period | 4 | 4 | **16 High** | Retention is the game: activation milestone (live caseload), month-2 retention target >80%, onboarding to value fast; add-ons and switching cost (their data lives here) raise stickiness ⚠️ (`pp-business-plan.md`) | Product/Growth |
| PP-21 | **CAC creeps up / payback too long** — even a tractable B2B funnel can get expensive if warm channels saturate and we lean on paid | 3 | 4 | 12 Med | Warm-first channels (design partners, communities, referral loop, partnerships) before paid; track CAC payback; lean spend; organic/content for intent-rich B2B terms ⚠️ (`pp-business-plan.md`) | Founder/Growth |
| PP-22 | **Free-tier abuse / unprofitable free users** — a £0 commission-monetised tier attracts low-volume or non-paying-through-platform therapists who cost support but never generate commission | 3 | 3 | 9 Med | Cap active clients on free tier; commission only realises on platform-processed payments (off-platform use generates no cost-of-payouts); support tiered by plan; monitor free→paid conversion | Finance/Product |
| PP-23 | **Disintermediation** — therapists use Faresay to set up, then take clients/payments off-platform to avoid commission | 3 | 3 | 9 Med | Keep platform value high (admin, invites, video, payments-in-one-place); make on-platform the path of least resistance; 0% commission on paid tiers removes the incentive to leave | Product |

## F. Execution
| ID | Risk | L | I | Rating | Mitigation | Owner |
|----|------|---|---|--------|-----------|-------|
| PP-24 | **Building accounting from scratch burns runway** — a full accounting package is a deep, regulated, low-differentiation build | 3 | 4 | 12 Med | **Integrate, don't build** (FreeAgent / Xero / QuickBooks); ship a thin therapist-tailored view over the integration; build bespoke only where the integration gaps ⚠️ (`therapist-portal-pivot.md` §5 Phase E) | Engineering/Founder |
| PP-25 | **Scope creep** — every therapist wants their one missing feature; the "simple" product accretes into another bloated incumbent | 3 | 4 | 12 Med | Phase gates with paying-customer milestones, not feature counts; protect the simplicity bar as an explicit constraint; say no by default; sequence add-ons behind the core | Founder/Product |
| PP-26 | **Founder bandwidth / key-person** — solo bootstrapped founder runs product + sales + compliance + support at once; predictable degradation | 4 | 3 | 12 Med | Ruthless focus on the core loop; line up fractional compliance / clinical input; document; selective outsourcing; concentrate on a narrow beachhead not many fronts | Founder |
| PP-27 | **Two-money-systems complexity** — running Stripe Connect (payments/payouts/commission) and Stripe Billing (subscriptions) together adds reconciliation and edge-case surface | 2 | 3 | 6 Low | Reuse proven Connect plumbing; isolate Billing behind clear boundaries; test dunning, refunds, proration; monitor reconciliation | Engineering/Finance |

## G. Strategic
| ID | Risk | L | I | Rating | Mitigation | Owner |
|----|------|---|---|--------|-----------|-------|
| PP-28 | **Losing consumer brand equity / mission drift** — pivoting from "help people find therapy" to "sell therapists software" risks diluting the mission and the brand built around it | 3 | 3 | 9 Med | The ethos **transfers** intact ("fair for therapists; we grow when you grow; no company should profit from human suffering"); the marketplace lives on as the network add-on, so the consumer mission is *deferred, not abandoned* ⚠️ (`therapist-portal-pivot.md` §11 brand decision) | Founder |
| PP-29 | **Pivot whiplash / half-in-half-out** — running both models in parallel splits focus and confuses positioning, getting neither done well | 3 | 4 | 12 Med | Commit to the B2B re-position with marketplace demoted to opt-in add-on (recommended decision); avoid parallel-model drift; clear single positioning ⚠️ (`therapist-portal-pivot.md` §11 scope decision) | Founder |
| PP-30 | **Marketplace liquidity never matures into a real add-on** — the "accumulate liquidity as a by-product, re-light later" thesis may not produce enough density to be a credible demand product | 2 | 3 | 6 Low | Treat the network add-on as upside, not a load-bearing assumption; the core SaaS must stand alone economically; re-light only when density is real | Founder |

---

### Top risks to watch (rating ≥ 15)
- **PP-01** switching inertia · **PP-10** thin MVP doesn't justify a switch · **PP-06** "why pay
  twice?" · **PP-02** entrenched incumbents · **PP-15** controller→processor obligations ·
  **PP-16** DPA-with-every-therapist · **PP-20** churn · **PP-14** special-category data breach.

These cluster in three places: **adoption/switching** (PP-01/PP-02/PP-10/PP-06 — the real fight is
switching cost, resolved by a whole must-have MVP, a <15-min onboard, and a pricing model that
doesn't read as paying twice), **data/legal** (PP-14/PP-15/PP-16 — the processor model and the
DPA-with-every-therapist are the genuinely *heavier* part of the pivot; settle them before
onboarding at scale), and **SaaS retention economics** (PP-20). These map to
`therapist-portal-pivot.md` (§3 product, §4 pricing, §5 roadmap, §9 legal), the security and privacy
policies (PP-14, re-cut for the processor role), and the GTM / unit-economics sections of
`pp-business-plan.md` (PP-01/PP-03/PP-20/PP-21). Re-score quarterly and on any material change.
