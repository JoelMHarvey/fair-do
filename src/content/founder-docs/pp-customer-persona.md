# Practice Portal — Customer Personas

> The buyer has changed. In the marketplace the customer was the *client*; in the practice portal it
> is the **therapist**. This is a companion to the pivot plan (`therapist-portal-pivot.md`) and a
> sibling to `pp-gtm-strategy.md` — when marketing or product gets hard, come back here and ask:
> *what would Priya search, read, trust, and click?* Personas are illustrative archetypes — refine
> with real therapist interviews.
> Last updated: 26 June 2026

---

## How to read this doc

We sell to therapists, not clients, so these personas map onto the **pricing tiers** rather than onto
a marketing corridor. Each persona is written to a tier in `therapist-portal-pivot.md` §4:

| Persona | Stage | Tier they buy | Role in the model |
|---|---|---|---|
| **Hannah** — early-career, caseload-building | New / part-time | **Starter (£0)** + commission | The free-tier wedge; the top of the funnel |
| **Priya** — established full-time solo | Mature solo | **Practice (~£29–39/mo)** | The core ARPU persona; retention is the game |
| **David** — group-practice / clinic owner | Owner-operator | **Clinic (from ~£79/mo)** | Multi-seat MRR; the high-LTV account |
| **Nadia** — wants help finding clients | Any stage, under-booked | their base tier **+ Client-network add-on** | The marketplace, re-lit as opt-in lead-gen |

> **Operator note:** all prices and counts below are the directional numbers from the pivot plan and
> are **assumptions to validate** with design partners — not commitments. Where a number is a genuine
> unknown it is marked `[PLACEHOLDER: ...]`.

---

## Primary persona — "Priya" (the core ARPU persona, the one we build for)

**Priya, 44 · BACP-accredited integrative therapist · full-time solo private practice · Bristol**

- **Snapshot:** left the NHS / an agency four years ago and now runs her own practice full-time —
  ~22 clients a week, a mix of in-person and online, self-pay plus a couple of EAP/insurer referrals.
  She *is* the business: clinician, receptionist, bookkeeper, marketer and IT support. Competent and
  fully booked, but quietly drowning in admin and faintly embarrassed by how held-together-with-tape
  her systems are.
- **Her current stack (the pain made concrete):** Google Calendar for sessions, Zoom for online work,
  a paper diary as backup, bank transfer + the occasional "I'll bring cash", a Word invoice template,
  a spreadsheet for income (for the accountant), WhatsApp for reminders, and her clinical notes in a
  separate locked app. **Five or six tools, none of them talking to each other.**
- **A day in her admin life:** 8:15am, coffee, cross-checks the calendar against the paper diary
  because a client rebooked by text and she's not sure it landed. Between sessions she chases two
  unpaid invoices (hates doing it, does it badly), retypes an invoice number, and copies a Zoom link
  into an email *again*. A new enquiry comes in; she'll reply tonight because there's no time now.
  6:30pm: updates the income spreadsheet from memory, realises she forgot to send a receipt, and
  worries vaguely about whether bank-transfer-and-spreadsheet is really GDPR-defensible for
  mental-health data. None of this is therapy. All of it is unpaid.
- **Jobs to be done:**
  - *"Give me one place to run my practice so I stop stitching five tools together."*
  - *"Make me look as professional as the clinic down the road — branded invites, clean invoices,
    a proper booking link."*
  - *"Get me paid on time without me having to be the awkward one chasing money."*
  - *"Give me back the two evenings a week I lose to admin."*
- **Pains:** context-switching tax; double-entry between tools; payment-chasing she finds
  emotionally costly; no single view of "who owes me what"; a nagging sense her data handling is
  amateurish; platform fatigue — she's tried bits of SimplePractice/Cliniko and found them
  **over-built, US-shaped and overpriced** for a solo UK practice.
- **What would make her switch:**
  - She can be **live in under fifteen minutes** and import her existing client list (CSV) without a
    migration project.
  - It genuinely replaces calendar + video + payments + invites **end-to-end** — not 80% of them,
    leaving her still running Zoom on the side.
  - It is *visibly* simpler than the incumbents (the wedge is **simplicity**, per
    `therapist-portal-pivot.md` §4).
  - The price is sane for a solo practice and **tax-deductible**, and the ethos resonates ("fair for
    therapists; we grow when you grow").
  - A peer she trusts — a supervisor, a CPD-group friend — already uses it. Therapists buy on word of
    mouth (see channels in `pp-gtm-strategy.md`).
- **What would make her churn:**
  - Anything that loses or scrambles a booking, a payment, or a client record — trust is total or
    nothing for special-category data.
  - It turns out to be *another* tool she has to babysit rather than the one that replaces the mess.
  - Surprise pricing, or the **"why am I paying a commission on top of a subscription?"** objection
    landing wrong (the central tension in the pivot plan — resolve via 0%/near-0% on her paid tier).
  - A clumsy client-facing experience that makes *her* look unprofessional to *her* clients.
- **Tier & add-ons:** **Practice (~£29–39/mo)**, ~1% or 0% commission. Prime candidate for the **AI
  helper** add-on (chase invoices, draft client emails, fill calendar gaps) and, at year-end, the
  **Accounting** add-on. Not a natural client-network buyer — she's full.

**Her one-line job-to-be-done:** *"Give me one simple, professional place to run my whole practice so
I can spend my evenings on therapy and my family, not admin."*

---

## Wedge persona — "Hannah" (the free-tier front door)

**Hannah, 29 · qualified ~18 months · BACP registered (working toward accreditation) · part-time, building a caseload · Leeds**

- **Snapshot:** finished training, still in placement-adjacent / low-fee work, building toward
  full-time. Has **6–9 clients** and wants more. Money is tight; every subscription is scrutinised.
  Allergic to anything that looks like a big monthly commitment before the income exists to justify it.
- **A day in her admin life:** juggles two part-time roles around her private clients. Books by
  text and a free calendar app, takes payment by bank transfer, writes invoices by hand when a client
  asks. The admin volume is low — so a £50/mo tool feels absurd — but the *fiddliness per client* is
  high, and she's terrified of looking unprofessional with the few clients she has.
- **Jobs to be done:**
  - *"Let me start for free and only pay when I'm actually earning."*
  - *"Make me look legitimate and organised even though I'm just starting out."*
  - *"Don't make me learn a complicated system — I haven't got time or money for that."*
- **Pains:** price sensitivity above all; fear of commitment to a tool before the practice is real;
  imposter-y worry about professionalism; no budget for SimplePractice/Cliniko, so she's defaulting to
  free consumer tools that don't fit.
- **What would make her switch:** a genuine **£0 Starter tier** that does the basics properly (invite
  a client, take a payment, send a session link), with the platform taking only a **small
  commission** when she actually gets paid — so the cost scales with her, not ahead of her. The
  free-tier-monetised-by-commission model in `therapist-portal-pivot.md` §4 is built for exactly her.
- **What would make her churn (or never convert):** an active-client cap that bites too early and
  feels punitive; a commission that feels high relative to the near-zero admin she has; being pushed
  to upgrade before she's ready; or simply outgrowing us to an incumbent if we don't make the
  Starter→Practice step feel like a natural promotion.
- **Tier & add-ons:** **Starter (£0)**, ~2–3% commission, capped active clients. The whole point of
  Hannah is the **upgrade path**: as her caseload crosses the cap and her income steadies, she becomes
  Priya and moves to **Practice**. She is the top of the funnel, not the revenue — and that's the
  design.

**Her one-line job-to-be-done:** *"Let me look professional and get paid from day one, for free, and
start paying you properly once I'm actually busy."*

> **Operator note:** Hannah's economics only work if the free tier is *cheap to serve and a real
> on-ramp*, not a charity. Watch two numbers: the **active-client cap** (set so it nudges, not
> strangles — `[PLACEHOLDER: cap value to test]`) and the **free→paid conversion rate**, the single
> most important lever in the funnel.

---

## Account persona — "David" (the Clinic tier)

**David, 51 · counselling psychologist · owner of a 6-therapist group practice · Manchester**

- **Snapshot:** runs a small clinic — himself plus **five associate therapists** (a mix of employed
  and self-employed), a part-time practice administrator, two consulting rooms and an online offer.
  He stopped being mainly a clinician a while ago; he's a small-business owner now. His pain is not
  *his* admin — it's **coordination, oversight and money flowing the right way** across a team.
- **A day in his admin life:** the administrator fields enquiries and allocates them to whichever
  associate has capacity; David has no real-time view of utilisation. Associates each track their own
  sessions; reconciling who-saw-whom against who-got-paid at month-end is a spreadsheet ordeal.
  Payments land in one account and have to be split out to self-employed associates. He worries about
  consistency (are all six handling client data the same, defensible way?) and about a key associate
  leaving and taking clients — and the records — with them.
- **Jobs to be done:**
  - *"Give me one system the whole practice runs on, with a view across all therapists."*
  - *"Handle multi-therapist scheduling, allocation and payouts without a month-end spreadsheet."*
  - *"Let me onboard and offboard associates cleanly — practice owns the records, not individuals."*
  - *"Help me show the practice is run properly: consistent process, defensible data handling."*
- **Pains:** no consolidated view; manual revenue-splitting across associates; inconsistent tooling
  per therapist; governance/continuity risk when people come and go; the administrator is a
  single point of failure.
- **What would make him switch:** multi-therapist tenancy that **reuses the existing Org/B2B model**
  (`therapist-portal-pivot.md` §3) — shared calendar/roster, per-therapist payouts via Stripe
  Connect, practice-level reporting, role-based access for the administrator. **0% commission** at his
  volume so the maths works at scale. White-glove onboarding for the team.
- **What would make him churn:** missing the multi-seat essentials (per-associate payouts,
  permissions, a consolidated dashboard) and falling back to a "real" clinic system; per-seat pricing
  that punishes growth; or any data-governance gap he can't stand behind to his associates and their
  clients.
- **Tier & add-ons:** **Clinic (from ~£79/mo)**, 0% commission, priced by seats/size. Strong
  candidate for **Accounting** (multi-therapist reconciliation is his sharpest pain) and **AI helper**
  rolled out across the team. Highest LTV, slowest sale, lowest churn once embedded — the account
  worth white-gloving. Sales motion and team-onboarding live in `pp-gtm-strategy.md`.

**His one-line job-to-be-done:** *"Give my whole practice one system to run on, with the oversight and
clean payouts a multi-therapist clinic needs — without a finance department."*

---

## Add-on persona — "Nadia" (the client-network buyer)

**Nadia, 38 · CBT therapist, NCS registered · solo, online-first · Edinburgh**

- **Snapshot:** competent and good at the work, but **under-booked** — ~10 clients when she has room
  for 18. Already runs her practice on the portal (she's a Practice-tier therapist). Her binding
  constraint isn't admin; it's **demand**. She has gaps in her week and lost income she'd like back.
- **Snapshot of her need:** she doesn't want to become a marketer, run ads, or wrangle a directory
  profile across six sites. She wants *a few good-fit clients to arrive* — and she's willing to share
  a slice of the first booking for them.
- **Jobs to be done:**
  - *"Fill the gaps in my week with clients who are a genuine fit for what I do."*
  - *"Do it without me having to become a marketer or pay for ads I don't understand."*
  - *"When a new client arrives, drop them straight into the practice I already run here."*
- **Pains:** quiet, irregular income from an under-filled calendar; client acquisition is exactly the
  hard, trust-gated problem the *marketplace* tried (and struggled) to solve — but for Nadia it's a
  side-feature she opts into, not a business she has to build.
- **What would make her switch on the add-on:** an **opt-in directory listing** that reuses the
  existing marketplace matching and reviews (`therapist-portal-pivot.md` §5, Phase D), where a found
  client becomes a managed client *inside* her practice with no copy-paste, and she only pays on
  outcomes (**finder fee / rev-share on the first booking**, not a flat tax on clients she already
  had).
- **What would make her churn off it:** poor-fit or no-show leads; a finder fee that outweighs the
  value of a marginal client; or feeling the network is competing with her rather than feeding her.
- **Tier & add-ons:** her base tier (**Starter** or **Practice**) **+ Client-network add-on**
  (rev-share or ~£20/mo + small finder fee). She is why the old marketplace isn't thrown away — it's
  **re-lit as opt-in lead-gen**, monetising the liquidity the portal accumulates as a by-product.

**Her one-line job-to-be-done:** *"Send me a few good-fit clients to fill my week — straight into the
practice I already run — and take your cut only when it actually works."*

> **Operator note:** Nadia is a *layer on top of* the other personas, not a separate buyer. She is
> almost always a Hannah or a Priya first. Don't sell the network until the core practice OS has
> earned trust — leading with lead-gen re-creates the marketplace's cold-start problem we pivoted to
> escape.

---

## Anti-persona — who this is NOT for

- **The large, multi-site clinic or NHS trust** that needs enterprise EHR, complex insurance billing,
  clinical-coding, integrations and procurement sign-off. That's a different (heavier) product and a
  procurement sale we're not built for — leave it to the enterprise incumbents.
- **The therapist who wants Faresay to find *all* their clients for them.** We are a practice OS that
  therapists bring their *own* clients to; the network is opt-in lead-gen on top, not a managed
  client-acquisition service. If demand is their only need and they have no caseload, they're a
  marketplace client of the old model we deliberately moved away from.
- **The "free forever, no payments through the platform" therapist** who wants the software but will
  always take money off-platform. With no processed volume there's no commission and (on Starter) no
  subscription — there's no business in them. Fine as goodwill; not a customer to optimise for.
- **Non-UK therapists, for now.** UK-first (BACP/UKCP/NCS, UK GDPR processor model). US groundwork
  exists in the schema but is a v2 concern (`therapist-portal-pivot.md` §9) — don't let US demand pull
  the roadmap early.
- **The buyer who wants notes/EHR as the centre of gravity.** Our core promise is *running the
  practice simply* (calendar, payments, invites, packages). Deep clinical documentation is adjacent;
  if that's the whole reason they'd buy, we're not their fit yet.

---

## How to use these personas

- **Channels & messaging:** write to Priya's 6:30pm spreadsheet and Hannah's £0 anxiety, not to "the
  practice-management market." Channel detail and the B2B funnel live in `pp-gtm-strategy.md`.
- **Tier design:** each persona is a tier's reason to exist (Starter→Hannah, Practice→Priya,
  Clinic→David) plus the add-on layer (Nadia). If a proposed feature doesn't move one of them, ask why
  we're building it.
- **Pricing tension:** Priya's churn trigger *is* the "why pay twice?" objection — keep her paid-tier
  commission at or near 0% (`therapist-portal-pivot.md` §4).
- **Funnel:** Hannah is volume, Priya is ARPU, David is LTV, Nadia is attach. The free→paid
  (Hannah→Priya) conversion and Practice→Clinic graduation are the two transitions to instrument.
- **Refine:** replace these archetypes with **real therapist interviews** as soon as we have design
  partners. [RESEARCH NEEDED: 5–10 interviews with design-partner therapists to validate the day-in-
  the-life, switch triggers, churn triggers, and willingness-to-pay per tier.]
