# Faresay Practice Portal — Business Plan

> Internal operating plan for the **pivoted** Faresay: from a B2C therapy **marketplace** to a
> **B2B SaaS practice portal** for therapists. Companion to the pivot plan (`therapist-portal-pivot.md`)
> and its siblings — go-to-market (`pp-gtm-strategy.md`), unit economics (`pp-financial-model.md`),
> the old-vs-new comparison (`model-comparison.md`) and the risk register (`pp-risk-register.md`).
> Numbers here are **directional** and flagged as assumptions to validate — refresh from
> `pp-financial-model.md` and primary sources before any external/investor use.
> Last updated: 26 June 2026

---

## 1. Executive summary
Faresay sells therapists a **very-easy-to-use web portal to run their own private practice** —
clients, calendar, per-client pricing, packages, session invites, secure video, payments and payouts,
all in one place. The buyer is the **therapist**, not the client; therapists bring their own
caseloads, so we never have to manufacture demand for them.

This is a deliberate pivot. Faresay began as a two-sided **marketplace** matching self-pay clients to
vetted therapists. The binding constraint there was always the same: **acquiring paying clients**.
Mental-health B2C acquisition is expensive, trust-gated, restricted by ad-platform health policy, and
bid up by the likes of BetterHelp. Selling *to therapists* inverts the problem onto tractable ground —
therapists are reachable (professional directories, LinkedIn, peer groups), they run a business so
software is a tax-deductible cost rather than a luxury, and they feel acute, daily admin pain juggling
4–6 disconnected tools. We sell them one simple thing that replaces the mess. The full diagnosis and
the strategic case for the pivot live in `therapist-portal-pivot.md`; the side-by-side is in
`model-comparison.md`.

**Three revenue lines:** (1) a monthly **subscription** (recurring MRR — the core); (2) a **small
transaction commission** on client payments processed through the platform (already plumbed via Stripe
Connect application fees); (3) **add-ons** — an AI helper agent, an accounting package, and access to a
central **client-finding network** (the old marketplace, repackaged as opt-in lead-gen).

The build is mostly **resequencing, not rebuilding**: roughly **80% of the existing marketplace code
carries over** — Stripe Connect, Daily.co video, availability/calendar, messaging, email + `.ics`
reminders, earnings, the org/B2B layer for clinics, and the credit ledger that becomes package
balances. The genuinely new work is Stripe Billing subscriptions, the **inversion of client ownership**
(therapists invite their own clients), per-client rates, and practice-scoped multi-tenancy.

Legally, the pivot is **lighter but different**: as a tool rather than a care intermediary, Faresay
becomes a **data processor**; the therapist becomes the **controller** of their clients'
special-category data. That needs a DPA with every therapist and a SaaS subscription agreement, but it
sheds the clinical-liability and care-intermediary posture that stalled the marketplace.

The ethos carries over intact: **fair for therapists; we grow when you grow; no company should profit
from human suffering.** Success is now defined by **MRR, ARPU and retention** — the SaaS game — gated
by a small cohort of design-partner therapists running real caseloads and paying us (§11).

## 2. The problem — acquisition was the binding constraint
The marketing and business feedback that triggered the pivot named one problem: **how do we get
clients?** That is not an execution failure — it is structural.

- **CAC is brutal and trust-gated.** Choosing a therapist is a high-consideration, low-frequency,
  emotionally loaded purchase. Paid acquisition in mental health is expensive *and* restricted
  (ad-platform policy limits on health targeting), and you are bidding against incumbents with far
  deeper pockets.
- **Cold-start tax.** A marketplace is worthless to the first client (no therapists they love) and
  worthless to the first therapist (no clients). You pay to solve both sides at once.
- **No owned moat.** Matching is replicable; the only durable asset is liquidity — exactly the thing
  that is hardest and most expensive to build.

> **Operator note:** the people who are *easy to reach, have budget, and feel acute pain* are not
> clients — they are **therapists**. The pivot doesn't abandon the mission; it changes who we sell to
> so the funnel becomes one we can actually win. The marketplace asset isn't discarded — it becomes the
> "find new clients" add-on (Phase D) and accumulates liquidity as a by-product.

## 3. The solution — a practice OS for therapists
**Positioning:** *the therapy-practice platform that's actually simple — with an AI assistant, and a
way to find new clients when you want them.*

The single biggest conceptual change is the **inversion of ownership**: the therapist becomes the
admin of their own mini-practice, and clients become records the therapist **invites and manages**,
not leads Faresay matches. Everything we built for a marketplace-owned client now has a
therapist-owned equivalent.

**"Easy to use" is the core product promise** — it is the wedge, not a nicety. Incumbents
(SimplePractice et al.) are powerful but heavy; the under-served solo and early-career segment is
over-charged and under-served by tools built for large clinics. Faresay wins on **simplicity +
AI-native + fair ethos + optional demand**.

## 4. Product
The portal gives a solo therapist everything needed to run a practice end-to-end:

| Capability | What it does |
|---|---|
| **Client roster (CRM-lite)** | Add/invite clients, see history, notes, status |
| **Calendar & appointments** | Therapist-led scheduling, recurring appointments, own availability |
| **Per-client pricing** | Each client can have a different rate (per-relationship override) |
| **Packages / bundles** | Sell "6 sessions for £X", pre-paid or block-booked (reuses the credit ledger) |
| **Session invites** | Send a client a booking/payment/video link by email (Resend + `.ics` + Daily.co) |
| **Secure video** | The session room (Daily.co) |
| **Payments & payouts** | Client pays the therapist; Faresay takes the small commission (Stripe Connect) |
| **Practice revenue view** | Earnings/dashboard reframed as practice revenue |
| **Client-facing experience** | The client sees *"<Therapist>'s practice"*, lightly branded — multi-tenant by therapist |

Product detail and the inversion mechanics are in `therapist-portal-pivot.md` §3 and §6; the
client-facing flows reuse the existing `product-requirements-document.md` re-cut for a single-practice
context.

> **Operator note:** the test the product must pass — a reachable therapist can be signed, set up in
> **under fifteen minutes**, run their existing clients through Faresay *this week*, and pay us next
> month, without us finding a single client for them. The <15-minute setup bar is the product
> specification, not a marketing line.

## 5. Market & buyer
**Beachhead:** UK private-practice therapists who are **full-time or going full-time**, registered with
a recognised body (BACP / UKCP / NCS), platform-fatigued, currently stitching together calendar + Zoom
+ bank transfer + spreadsheets + invoicing. Acute admin pain, has budget, reachable.

**Why this buyer is tractable where clients weren't:**
- **Reachable** — professional directories, LinkedIn, therapist Facebook/Slack/Discord groups,
  r/therapists, professional bodies, clinical supervisors, training schools, insurers.
- **Has budget** — software is a tax-deductible business expense, not a discretionary consumer spend.
- **Feels the pain daily** — 4–6 disconnected tools is a concrete, nameable problem with a clear ROI
  pitch ("save 5 hrs/week, look professional, get paid faster").

**Ideal Customer Profile (ICP):** a solo or small-practice UK therapist with an existing caseload (or a
waitlist), going independent or recently independent, who values simplicity over feature sprawl and is
sympathetic to a fair-economics ethos. Full segmentation and sizing belong in `pp-financial-model.md`
and the GTM persona work in `pp-gtm-strategy.md`. [PLACEHOLDER: UK private-practice therapist
population and serviceable segment — size with primary sources before external use.]

> **Operator note:** the market here is **supply-bounded, not demand-bounded** — revenue scales with
> therapist count × their existing caseload, a base we don't have to manufacture. This is the whole
> point of the pivot.

## 6. Business model & pricing
**Three revenue lines** (detail and the "why pay twice?" tension in `therapist-portal-pivot.md` §4):

1. **Subscription (MRR)** — the core, tiered by practice size / features.
2. **Transaction commission** — a small % on client payments processed through the platform.
3. **Add-ons** — AI helper, accounting package, client-finding network access; each a separate
   recurring or usage line.

> **The one real tension:** practice-management incumbents charge **subscription only and take no cut**
> of the therapist's session fees. A commission *on top of* a subscription invites the objection *"why
> am I paying twice?"* We resolve it by **monetising a free tier with commission** and driving
> commission toward **0% on paid tiers** — so therapists who pay a subscription don't also pay a cut,
> and free-tier users pay only as they earn. This keeps the "we grow when you grow" ethos intact.

**Recommended packaging (Option A — "Free + commission") — ALL DIRECTIONAL, validate the numbers:**

| Tier | Price | For | Commission |
|---|---|---|---|
| **Starter** | £0 | New / part-time, capped active clients | ~2–3% on payments |
| **Practice** | ~£29–39/mo | Full-time solo, unlimited clients | ~1% (or 0%) |
| **Clinic** | from ~£79/mo | Multi-therapist practices (reuse the Org model) | 0% |
| *Add-on* — AI helper | ~£15–25/mo | Scheduling / notes / drafting assistant | — |
| *Add-on* — Accounting | ~£10–15/mo | Invoices, expenses, year-end (partner integration) | — |
| *Add-on* — Client network | rev-share or ~£20/mo | Listing in the Faresay directory for leads | small finder fee |

This compares against the reference market — **SimplePractice (~£50–70/mo), Cliniko (from ~£35/mo),
Power Diary (~£10–100/mo by size), Halaxy (freemium + per-transaction fees), WriteUpp** — by being
cheaper at the entry point and simpler throughout. The free tier is the adoption wedge; ARPU grows
through paid-tier conversion and add-on attach. Full driver model and scenarios: `pp-financial-model.md`.

## 7. Competition
The category is **practice-management software**, not consumer therapy apps.

| Competitor | Indicative price | Model | Note |
|---|---|---|---|
| **SimplePractice** | ~£50–70/mo | Subscription only, no commission | Feature-rich, heavy, US-centric heritage |
| **Cliniko** | from ~£35/mo | Subscription only | Strong allied-health base |
| **Power Diary** | ~£10–100/mo by size | Subscription only | Scales by practice size |
| **Halaxy** | Freemium + per-transaction fees | Freemium + transaction | Closest to a commission-style model |
| **WriteUpp** | Subscription | Subscription only | UK-focused |

**Most charge subscription only and take no commission** — hence the pricing tension above, and why
the resolution matters. **Faresay's wedge:**
- **Simplicity** — a portal a therapist is live on in under fifteen minutes, not a configuration
  project.
- **AI-native** — the AI helper as a first-class differentiator, not a bolt-on (Phase C).
- **Fair ethos** — "fair for therapists; we grow when you grow" — a brand position none of the
  incumbents own.
- **Optional demand** — the client-finding network: incumbents sell you tools; we can also, optionally,
  help you find clients.

The beachhead is the **under-served solo / early-career segment** that incumbents over-charge and build
heavy tooling for. Competitive detail and counter-positioning live in `pp-gtm-strategy.md`.

## 8. Go-to-market (summary)
The whole reason to pivot is that **this funnel is tractable**. In brief:

- **Direct + design partners** — recruit 5–10 therapists by hand for the MVP and co-build; start with
  anyone already warm from marketplace recruitment.
- **Professional communities** — directories, therapist FB/Slack/Discord groups, r/therapists,
  LinkedIn; value-first, not spammy.
- **Content / SEO** — intent-rich, low-trust-barrier terms ("how to run a private therapy practice",
  "best practice-management software UK") versus the consumer mental-health terms that were so costly.
- **Referral loop** — therapists refer peers (referral plumbing already built).
- **Partnerships** — training bodies, supervisors, professional insurers as channel partners.

Full channel strategy, messaging, persona and funnel: **`pp-gtm-strategy.md`**.

## 9. Unit economics (summary)
- **Old:** revenue = 15% × session price × sessions — bounded by *client* liquidity (the thing we
  couldn't get).
- **New:** revenue per therapist = **subscription + (commission × their GMV) + add-on attach** —
  bounded by therapist count × their existing caseload, a base we don't have to manufacture.
- **Illustrative (validate):** 100 paying therapists × ~£30 MRR ≈ £3k MRR core, plus commission on
  their payment volume, plus add-on attach. Compounding, recurring, and it grows by signing **one
  reachable buyer**, not by winning two cold sides at once.
- **Key levers:** **ARPU** (add-on attach: AI / accounting / network), **churn** (retention is the
  SaaS game), and **free→paid conversion** under Option A.

Full driver model, scenarios, CAC/payback and break-even: **`pp-financial-model.md`**.

## 10. Operations & technology
**Reuse ~80% of the existing build.** The pivot is mostly an inversion of ownership plus a new billing
layer, not a rebuild.

| Capability | Status | Action |
|---|---|---|
| Therapist auth, onboarding, profile | ✅ Built | Re-purpose: profile → *practice settings* |
| Availability + calendar | ✅ Built | Re-point to therapist-led scheduling |
| Stripe Connect (KYC, payouts, app-fee) | ✅ Built | Reuse for client→therapist payments + commission |
| Video (Daily.co) | ✅ Built | Reuse as the session room |
| Messaging | ✅ Built | Reuse as therapist↔client messaging |
| Email + `.ics` + reminders (Resend, cron) | ✅ Built | Reuse for invites/reminders |
| Earnings dashboard | ✅ Built | Reuse as practice revenue view |
| Credits / vouchers ledger | ✅ Built | **Repurpose as package/bundle balances** |
| Org / B2B (pools, domains, reports) | ✅ Built | Reuse for clinics (multi-therapist) |
| **Client invite flow (therapist-initiated)** | ⬜ New | Build — the ownership inversion |
| **Per-client rate override + packages UI** | ⬜ New | Build |
| **Subscription billing (Stripe Billing)** | ⬜ New | Build — the new money layer |
| **Practice-scoped multi-tenancy** | 🔄 Partial | Re-scope client UX to one therapist |

**Stack:** Next.js 16, TypeScript, Tailwind v4, Prisma 6, Neon, Clerk, Stripe Connect + **Stripe
Billing (new)**, Daily.co, Resend. The riskiest change is re-pointing client ownership from Faresay to
the therapist — do it behind a feature flag, migrate, then flip the default. Data-model deltas are in
`therapist-portal-pivot.md` §6.

> **Operator note:** the discipline here is to **resequence, not rebuild**. Every capability that
> already exists is reused or repurposed; only four genuinely new primitives are built. That is what
> makes the pivot capital-efficient.

## 11. Legal & regulatory — the processor model
Moving from "the entity that arranges care" to "software a therapist uses to run their practice"
**reduces** clinical-liability exposure but **changes our data role**.

- **Controller → Processor.** Under UK GDPR the **therapist** becomes the data **controller** of their
  clients' special-category (mental-health) data; **Faresay becomes a data processor**. We need an
  **Art. 28 Data Processing Agreement with every therapist**, plus our existing sub-processor chain
  (Neon, Stripe, Daily, Resend, Clerk).
- **Primary contract changes.** A **SaaS subscription agreement** replaces the contractor/therapist
  agreement as the principal contract; the DPA sits alongside it.
- **Clinical governance & crisis liability shift to the therapist** — their registration, their PI
  insurance, their duty of care. Our crisis/safeguarding material becomes *support we surface*, not a
  service we provide; T&Cs must be explicit that Faresay is a **tool, not a care provider**.
- **Security bar stays high.** We still process special-category data → strong security, breach
  process, a **DPIA for the processor role**, UK/EU data residency (already in place).
- **AI add-on raises the bar again** — special-category data through an AI assistant needs explicit
  governance, a clear **no-autonomous-clinical-decisions** line, and DPA coverage. Sequence it *after*
  the processor model is legally settled.
- **Reuse, not rewrite.** `uk-security-data-protection-policy.md`, `uk-privacy-policy.md`,
  `uk-clinical-governance-policy.md` and `uk-crisis-safeguarding-policy.md` need a processor-model
  re-cut.

> **Operator note:** the pivot likely **unblocks** the cross-border/legal gate that stalled the
> marketplace (`cross-border-legal-gate.md`) — we are no longer the care intermediary. **UK-first;** US
> groundwork already exists in the schema, deferred to v2. Get the controller→processor
> re-characterisation reviewed by counsel **before** onboarding therapists. ⚠️ COUNSEL.

## 12. Milestones & roadmap (phases A–E)
> Principle: ship the **smallest thing a real therapist will pay for** first, prove retention, then
> layer add-ons. Each phase ends with a paying-customer milestone, not a feature count. Full detail in
> `therapist-portal-pivot.md` §5.

- **Phase A — Practice OS MVP (the new core).** Tenancy + `ClientRelationship` (per-client rate) +
  packages + invite tokens; therapist-led client invite flow; practice dashboard; per-client pricing;
  therapist-initiated booking; **Stripe Billing subscription**; re-scope client UX to one practice.
  **Milestone:** 5 design-partner therapists running live caseloads, paying (even £1) for a month.
- **Phase B — Polish, retention, client billing + packages.** Recurring appointments + calendar sync;
  invoices/receipts + package consumption + refunds; client broadcast (invites + light updates);
  <15-minute onboarding wizard; CSV import. **Milestone:** 25 paying therapists; >80% month-2
  retention.
- **Phase C — Add-on 1: AI helper.** Therapist-supervised assistant for scheduling, reminders,
  drafting client emails, summarising sessions (no autonomous clinical content); strict data
  governance. **Milestone:** add-on attach rate ≥25% of paying therapists.
- **Phase D — Add-on 2: client-finding network (re-light the marketplace).** Opt-in directory listing;
  lead→invite handoff (a found client becomes a managed client); finder fee / rev-share on first
  booking. **Milestone:** the network supplies measurable incremental bookings; therapists *ask* to be
  listed.
- **Phase E — Add-on 3: accounting.** **Integrate, don't build** — FreeAgent / Xero / QuickBooks plus a
  simple therapist-tailored invoices/expenses/year-end view. **Milestone:** add-on attach + reduced
  churn among full-time practices.

## 13. Key risks
Top risks below; the full register with owners and mitigations is in **`pp-risk-register.md`**.

| Risk | Mitigation |
|---|---|
| Entrenched incumbents (SimplePractice, Cliniko, Power Diary) | Win on **simplicity + AI + fair ethos + optional demand**; beachhead the under-served solo/early-career segment |
| "Why pay commission on top of subscription?" | Free + commission, **0% on paid tiers** (§6) |
| Switching cost — therapists won't migrate tools | CSV import, white-glove onboarding, <15-min setup, run alongside old tools at first |
| Thin MVP doesn't replace 5 tools → no switch | Phase A covers calendar + payments + video + invites end-to-end before polish |
| Processor / DPA obligations underestimated | Legal review of controller→processor shift **before** onboarding; DPA template ready at launch |
| AI add-on data governance | Guardrails first; therapist-supervised only; gate behind settled processor model |
| Building accounting from scratch burns runway | Integrate (FreeAgent / Xero), don't build |
| Losing consumer mission / brand equity | Ethos transfers ("fair for therapists; we grow when you grow"); marketplace lives on as the network add-on |

## 14. Linked documents
- `therapist-portal-pivot.md` — the strategy source of truth for the new model.
- `pp-gtm-strategy.md` — go-to-market: channels, persona, funnel, messaging.
- `pp-financial-model.md` — unit economics, drivers, scenarios, break-even.
- `pp-risk-register.md` — full risk register with owners and mitigations.
- `model-comparison.md` — old marketplace vs new practice-portal, side by side.
