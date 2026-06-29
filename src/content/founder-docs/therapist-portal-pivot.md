# Pivot: Faresay → Therapist Practice Portal

> **Status:** Proposal for founder sign-off. Drafted in response to business + marketing feedback
> that *client acquisition is the binding constraint*. This document is the brainstorm **and** the
> robust project plan: it sharpens the idea, makes the strategic calls explicit, maps the pivot onto
> the code we already have, and sequences the build. Companion to `business-plan.md`,
> `gtm-strategy.md`, `financial-model.md`.
> Last updated: 26 June 2026

---

## 0. TL;DR — the pivot in five lines

1. **Stop acquiring clients. Start acquiring therapists.** Today Faresay is a B2C marketplace and
   the hard, expensive side is demand (clients). We flip to **B2B SaaS**: sell therapists a simple
   web portal to run their *own* practice — clients, calendar, pricing, packages, invites, payments.
2. **Therapists bring their own clients.** They already have caseloads, referrals and waitlists. We
   give them the operating system; we don't have to manufacture demand for them.
3. **Revenue = monthly subscription + a small commission** on payments processed through the
   platform. Predictable MRR instead of one-off transactional fees.
4. **Add-ons are the upside:** an AI helper agent, an accounting package, and **access to a central
   client-finding network** — which is simply our existing marketplace, repackaged as an optional
   lead-gen feature instead of the whole business.
5. **We reuse ~80% of what's built.** Profiles, availability, Stripe Connect, video, messaging,
   payments, earnings, org/B2B — already done. The pivot is mostly an *inversion of ownership* and a
   new subscription-billing layer, not a rebuild.

---

## 1. Why pivot — the diagnosis

The marketing/business feedback names one problem: **how do we get clients?** That is not a
marketing-execution failure, it is structural. In a two-sided marketplace the *hard side* is the one
you must subsidise and chase, and in mental-health B2C that side is **demand**:

- **CAC is brutal and trust-gated.** Vulnerable people choosing a therapist is a high-consideration,
  low-frequency, emotionally loaded purchase. Paid acquisition in mental health is expensive and
  restricted (ad-platform policy limits on health targeting), and you're bidding against BetterHelp's
  war chest.
- **Cold-start tax.** A marketplace is worthless to the first client (no therapists they love) and
  worthless to the first therapist (no clients). You pay to solve both sides simultaneously.
- **You don't own a moat.** Matching is replicable; the only durable asset is liquidity, which is
  exactly what's hardest and most expensive to build.

**The reframe:** the people who are *easy to reach, have budget, and feel acute pain* are not clients
— they're **therapists**. Therapists are findable (BACP/UKCP directories, LinkedIn, FB/Slack groups,
professional bodies), they run a business (so software is a tax-deductible expense, not a luxury),
and they are drowning in admin and juggling 4–6 disconnected tools (calendar, video, payments,
invoicing, notes, email). We sell them one simple thing that replaces the mess.

> **Pickaxe logic.** In a gold rush, sell pickaxes. We stop panning for clients and start selling the
> tools — and because every therapist brings their own clients onto the platform, we *accumulate*
> liquidity as a by-product, then switch the marketplace back on as an add-on once it's de-risked.

---

## 2. The new model — who pays, for what

| | **Old (marketplace)** | **New (practice portal)** |
|---|---|---|
| Primary customer | Client (demand) | **Therapist (the practice owner)** |
| Who Faresay acquires | Clients *and* therapists | **Therapists only** |
| Who owns the client relationship | Faresay | **The therapist** |
| How clients arrive | Faresay matches them | **The therapist invites their own** |
| Core revenue | 15% (10% founder) per session | **Subscription + small commission** |
| Marketplace | The whole business | **Optional "find new clients" add-on** |
| Regulatory posture | Care intermediary (controller) | **Software processor** (lighter — see §9) |

**Three revenue lines:**

1. **Subscription (MRR)** — the core. Tiered by practice size / features.
2. **Transaction commission** — a small % on client payments processed through the platform (already
   built via Stripe Connect application fees). See the pricing decision in §4 — this is a real
   tension, not a given.
3. **Add-ons** — AI helper agent, accounting package, client-finding network access. Each is a
   separate recurring or usage line.

---

## 3. Product — the inversion, concretely

The single biggest conceptual change: **the therapist becomes the admin of their own mini-practice,
and clients become records the therapist manages — invited, not matched.**

Everything we built for a marketplace-owned client now needs a *therapist-owned* equivalent:

- **Client roster (CRM-lite):** the therapist adds/invites clients, sees history, notes, status.
- **Per-client pricing:** each client can have a different rate (we have `sessionRatePence`; we need
  a per-relationship override).
- **Packages / bundles:** sell "6 sessions for £X", block-booked or pre-paid (we have credits + gift
  vouchers — reuse the credit ledger as the package balance).
- **Calendar & appointments:** therapist-managed scheduling, recurring appointments, their own
  availability (we have `Availability` + booking — re-point it at therapist-initiated booking).
- **Session invites:** therapist sends a client a booking/payment/video link by email (we have
  Resend + `.ics` + Daily.co rooms — reuse wholesale).
- **Client-facing experience:** the client sees *"<Therapist>'s practice,"* lightly branded, not the
  Faresay marketplace. Multi-tenant by therapist.
- **Payments & payouts:** client pays the therapist; Faresay takes the small commission (Stripe
  Connect — already built).

> On the **"Substack" note** in the brief: read as *broadcast to your client list* — a simple way for
> a therapist to email their clients (session invites today; optionally light newsletter/updates
> later). We already have Resend wired; this is a thin feature, and a real integration with Substack
> is a later add-on, not core. Flagged as a decision in §11.

### What we reuse vs build

| Capability | Status | Action |
|---|---|---|
| Therapist auth, onboarding, profile | ✅ Built | Re-purpose: profile becomes *practice settings* |
| Availability + calendar | ✅ Built | Re-point to therapist-led scheduling |
| Stripe Connect (KYC, payouts, app-fee) | ✅ Built | Reuse for client→therapist payments + commission |
| Video sessions (Daily.co) | ✅ Built | Reuse as the session room |
| Messaging (thread per relationship) | ✅ Built | Reuse as therapist↔client messaging |
| Email + `.ics` + reminders (Resend, cron) | ✅ Built | Reuse for invites/reminders |
| Earnings dashboard | ✅ Built | Reuse as practice revenue view |
| Credits / vouchers ledger | ✅ Built | **Repurpose as package/bundle balances** |
| Org / B2B (pools, domains, reports) | ✅ Built | Reuse for group practices / clinics (multi-therapist) |
| Reviews, referrals, complaints | ✅ Built | Keep; reframe referrals as *therapist* referrals |
| **Client invite flow (therapist-initiated)** | ⬜ New | Build |
| **Per-client rate override + packages UI** | ⬜ New | Build (data + UI) |
| **Subscription billing (Stripe Billing)** | ⬜ New | Build — the new money layer |
| **Practice-scoped multi-tenancy / client view** | 🔄 Partial | Re-scope client UX to one therapist |
| **AI helper agent** | ⬜ New | Add-on (post-MVP) |
| **Accounting package** | ⬜ New | Add-on — partner/integrate, don't build from scratch |
| **Client-finding network** | ✅ ~Built (marketplace) | Demote to opt-in add-on |

The headline: the marketplace we already shipped *is* the "find new clients" add-on. Nothing is
thrown away — it's resequenced.

---

## 4. Pricing & packaging (and the one real tension)

**Reference market (UK practice-management):** SimplePractice (~£50–70/mo), Cliniko (from ~£35/mo),
Power Diary (~£10–100/mo by size), Halaxy (freemium + per-transaction fees), WriteUpp. Most charge
**subscription only and do *not* take a cut of the therapist's session fees.**

> **The tension:** a per-transaction commission *on top of* a subscription invites the objection
> *"why am I paying twice?"* Practice-mgmt incumbents don't do it. Two clean ways to resolve it:
>
> - **Option A — Free + commission:** £0 entry tier monetised by a 2–3% commission; paid tiers buy
>   the commission down toward 0% plus features. Lowest adoption friction; revenue scales with
>   therapist success (keeps the "we grow when you grow" Faresay ethos). **Recommended.**
> - **Option B — Subscription only:** flat monthly, 0% commission, compete head-on on price/simplicity.
>   Cleaner story, but throws away the Connect app-fee plumbing we already have and caps upside.

**Recommended packaging (Option A flavour) — validate the numbers:**

| Tier | Price | For | Commission |
|---|---|---|---|
| **Starter** | £0 | New / part-time therapists, ≤N active clients | ~2–3% on payments |
| **Practice** | ~£29–39/mo | Full-time solo practice, unlimited clients | ~1% (or 0%) |
| **Clinic** | from ~£79/mo | Multi-therapist practices (reuse Org model) | 0% |
| *Add-on* — AI helper | ~£15–25/mo | Scheduling/notes/drafting assistant | — |
| *Add-on* — Accounting | ~£10–15/mo | Invoices, expenses, year-end (partner integ.) | — |
| *Add-on* — Client network | rev-share or ~£20/mo | Listing in the Faresay directory for leads | small finder fee |

The "very easy to use" requirement is the actual product: the wedge against SimplePractice et al. is
**simplicity + AI-native + the fair ethos + optional demand**. Positioning: *"The therapy-practice
platform that's actually simple — with an AI assistant, and a way to find new clients when you want
them."*

---

## 5. Phased roadmap

> Principle: ship the **smallest thing a real therapist will pay for** first (core practice OS +
> subscription billing), prove retention, then layer add-ons. Each phase ends with a paying-customer
> milestone, not a feature count.

### Phase A — Practice OS MVP (the new core)
*Goal: a solo therapist can run their whole practice and pay us a subscription.*
- A1. Data model: `Practice`/per-therapist tenancy, `ClientRelationship` with per-client rate,
  `Package` (reuse credit ledger), invite tokens. *(see §6)*
- A2. **Therapist-led client invite flow** — add a client by email → secure invite → client sets up.
- A3. **Practice dashboard** — roster, today's calendar, revenue, outstanding invoices.
- A4. **Per-client pricing + packages** UI (single rate today → override + bundle balance).
- A5. **Therapist-initiated booking** (book *for* a client / send a self-book link).
- A6. **Stripe Billing subscription** — the new money layer (tiers, trials, dunning).
- A7. Re-scope client UX to *one practice* (drop marketplace matching from the default path).
- **Milestone:** 5 design-partner therapists running live caseloads, paying (even £1) for a month.

### Phase B — Polish, retention, billing of clients
- B1. Recurring/standing appointments; calendar sync (Google/Outlook, read at least).
- B2. Invoices/receipts to clients; package consumption tracking; refunds.
- B3. Client broadcast (session invites + light updates via Resend) — the "Substack-lite".
- B4. Onboarding wizard so a therapist is live in <15 minutes (the simplicity bar).
- B5. Migration helper: import an existing client list (CSV).
- **Milestone:** 25 paying therapists; >80% month-2 retention; NPS from design partners.

### Phase C — Add-on 1: AI helper agent (differentiation)
- C1. Assistant for scheduling, reminders, drafting client emails, summarising sessions
  (therapist-supervised; **no autonomous clinical content**).
- C2. Smart admin: fill-the-gaps in calendar, chase unpaid invoices, suggest follow-ups.
- C3. Strict data-governance guardrails (special-category data; see §9).
- **Milestone:** add-on attach rate ≥25% of paying therapists.

### Phase D — Add-on 2: Client-finding network (re-light the marketplace)
- D1. Opt-in directory listing (reuse `/therapists`, matching, reviews already built).
- D2. Lead → invite handoff: a found client becomes a managed client in the therapist's practice.
- D3. Finder fee / rev-share on first booking only (we already have referral plumbing).
- **Milestone:** network supplies measurable incremental bookings; therapists *ask* to be listed.

### Phase E — Add-on 3: Accounting
- E1. **Integrate, don't build:** FreeAgent/Xero/QuickBooks connection + a simple
  invoices/expenses/year-end view tailored to therapists. Build bespoke only if integration gaps it.
- **Milestone:** add-on attach + reduced churn among full-time practices.

---

## 6. Data model deltas (Prisma)

Building on the current schema (`User`, `Therapist`, `Client`, `Match`, `Session`, `Payment`,
`Organisation`, `GiftVoucher`, credit ledger):

- **`Practice` (or extend `Therapist`)** — the tenant. Branding, slug, settings. `Organisation`
  already models multi-member clinics — reuse it for group practices.
- **`ClientRelationship`** (evolve `Match`) — therapist↔client link with:
  `customRatePence?`, `packageBalance`, `status` (invited/active/archived), `invitedAt`,
  `source` (manual | imported | network). Today `Match` is marketplace-matched; we make it
  therapist-owned and add the rate override.
- **`Package`** — `name`, `sessionsTotal`, `pricePence`, `balance`. The credit ledger
  (`creditBalancePence`, `GiftVoucher`) already does pre-paid balances — generalise it.
- **`Invite`** — token, email, expiry, status; powers therapist-initiated client onboarding.
- **`Subscription`** — Stripe Billing: `stripeSubscriptionId`, `tier`, `status`, `addOns[]`,
  `commissionBps`. New. Drives feature gating and the commission rate used at payment time.
- **`Payment`** — already has `platformFeePence`; switch its source from a fixed 15% to the
  therapist's `Subscription.commissionBps`.
- **Client self-serve marketplace fields** (`questionnaire`, matching) become **optional** /
  add-on-scoped rather than required in the default flow.

> Most of this is *additive*. The riskiest change is re-pointing client ownership from Faresay to the
> therapist — do it behind a feature flag, migrate, then flip the default.

---

## 7. Go-to-market for a B2B SaaS

The whole reason to pivot is that **this funnel is tractable** where the old one wasn't.

- **Beachhead:** UK private-practice therapists who are *full-time or going full-time*, BACP/UKCP/NCS
  registered, currently stitching together calendar + Zoom + bank transfer + spreadsheets. Acute
  admin pain, has budget, reachable.
- **Channels (warm-first, mirrors `gtm-strategy.md` logic but B2B):**
  1. **Direct + design partners** — recruit 5–10 therapists by hand for the MVP; co-build.
  2. **Professional communities** — BACP/UKCP directories, therapist FB/Slack/Discord groups, r/therapists, LinkedIn. Value-first (admin tips, templates), not spammy.
  3. **Content/SEO** — "how to run a private therapy practice," "best practice-management software UK" (intent-rich, low trust-barrier vs consumer mental-health terms).
  4. **Referral loop** — therapists refer peers (we already have therapist referral plumbing; £/credit incentive).
  5. **Partnerships** — training bodies, supervisors, professional insurers as channel partners.
- **Why it closes:** B2B SaaS has a clear ROI pitch ("save 5 hrs/week, look professional, get paid
  faster, optionally find clients"), a tax-deductible price, and reachable buyers — none of which the
  consumer funnel had.
- **Migration of the existing asset:** any therapists already recruited for the marketplace are
  *warm design-partner leads* for the portal. Start there day one.

---

## 8. Unit economics (replace, then validate in `financial-model.md`)

- **Old:** revenue = 15% × session price × sessions. Bounded by *client* liquidity (the thing we
  can't get).
- **New:** revenue per therapist = subscription + (commission × their GMV) + add-on attach. Bounded
  by *therapist* count × their existing caseload — a base we don't have to manufacture.
- **Illustrative (validate):** 100 paying therapists × ~£30 MRR = £3k MRR core; + commission on their
  payment volume; + add-on attach. **Compounding, recurring, fundable** — and it grows by signing one
  reachable buyer, not by winning two cold sides at once.
- **Levers:** ARPU via add-ons (AI/accounting/network), churn (retention is the SaaS game), and the
  free→paid conversion if we run Option A.

---

## 9. Legal & regulatory shift — *generally lighter, but a real change*

Moving from "the entity that arranges care" to "software a therapist uses to run their practice"
**reduces** clinical-liability exposure but **changes our data role**:

- **Controller → Processor.** Under UK GDPR the *therapist* becomes the data **controller** of their
  clients' (special-category, mental-health) data; **Faresay becomes a data processor**. We need a
  **Data Processing Agreement with every therapist**, Art. 28 compliant, plus our existing
  sub-processor chain (Neon, Stripe, Daily, Resend, Clerk).
- **Clinical governance & crisis liability shift to the therapist** (their registration, their PI
  insurance, their duty of care). Our crisis/safeguarding policy becomes *support material we surface*
  rather than a service we provide. Lighter — but we must be explicit in T&Cs that we are a tool, not
  a care provider.
- **Security bar stays high.** We still process special-category data → strong security, breach
  process, DPIA for the processor role, data-residency (already EU/UK).
- **Reuse:** `uk-security-data-protection-policy.md`, `uk-privacy-policy.md`,
  `uk-clinical-governance-policy.md`, `uk-crisis-safeguarding-policy.md` all need a processor-model
  re-cut, not a rewrite. Add a **Data Processing Agreement** template + a **SaaS subscription
  agreement** (replaces the contractor agreement as the primary contract).
- **AI add-on** raises the bar again: special-category data through an AI assistant needs explicit
  governance, a clear no-autonomous-clinical-decisions line, and DPA coverage. Sequence it after the
  processor model is legally settled.

> Net: the pivot likely *unblocks* the cross-border/legal gate that stalled the marketplace
> (`cross-border-legal-gate.md`) because we are no longer the care intermediary — but get the
> controller/processor re-characterisation reviewed before launch.

---

## 10. Risks & mitigations

| Risk | Mitigation |
|---|---|
| Incumbents (SimplePractice, Cliniko, Power Diary) are entrenched | Win on **simplicity + AI + fair ethos + optional demand**; beachhead the underserved solo/early-career segment incumbents over-serve and over-charge |
| "Why pay commission on top of subscription?" | Resolve pricing per §4 (lean to Free + commission, or 0% on paid tiers) |
| Switching cost — therapists won't migrate tools | CSV import, white-glove onboarding for design partners, <15-min setup, run alongside their old tools at first |
| We lose the consumer mission/brand equity | The ethos *transfers* ("fair for therapists; we grow when you grow"); marketplace lives on as the network add-on |
| Processor/DPA obligations underestimated | Legal review of the controller→processor shift *before* onboarding therapists; DPA template ready at launch |
| Thin MVP doesn't replace 5 tools → no switch | Sequence so Phase A covers calendar+payments+video+invites end-to-end (the must-haves) before polish |
| AI add-on data governance | Build guardrails first; therapist-supervised only; gate behind settled processor model |
| Building accounting from scratch burns runway | Integrate (FreeAgent/Xero), don't build |

---

## 11. Decisions needed from the founder

1. **Scope of pivot:** fully re-position to B2B SaaS with the marketplace demoted to an opt-in add-on
   (recommended), or run both models in parallel for a while?
2. **Pricing model:** Option A (Free + commission, paid buys it down — recommended) vs Option B
   (subscription only, 0% commission)?
3. **"Substack" intent:** is it (a) send session invites by email [in MVP], (b) a light client
   newsletter/broadcast [Phase B], or (c) a real Substack integration [later add-on]? Default
   assumption: (a) now, (b) soon, (c) later.
4. **Brand:** keep "Faresay" and position as the fair therapist platform (recommended — the ethos
   transfers), or sub-brand the product?
5. **Geography:** UK-only first (recommended; reuses all UK legal work), or design multi-region from
   day one (US groundwork already exists in the schema)?
6. **Add-on build order:** AI helper first (differentiation) vs client-network first (reuses the most
   code, fastest to ship)? Recommended: AI helper for differentiation, network close behind.

---

## 12. Immediate next steps (first 30 days)

1. **Founder decisions** in §11 (unblocks everything).
2. **Recruit 5 design-partner therapists** — start with anyone already warm from marketplace
   recruitment. Co-build the MVP with them.
3. **Spike the data-model inversion** behind a flag: `ClientRelationship` ownership + per-client rate
   + invite token (§6).
4. **Stand up Stripe Billing** for subscriptions (the one genuinely new money primitive).
5. **Legal:** brief solicitor on the controller→processor re-characterisation + DPA template
   (§9) — add questions to `uk-questions-for-solicitor.md`.
6. **Re-cut positioning** for B2B in `gtm-strategy.md` and `customer-persona.md` (therapist as buyer).
7. **Build Phase A end-to-end** for one design partner running a real caseload; charge them.

> The test this plan must pass: a single, reachable buyer (a therapist) can be signed, set up in
> under fifteen minutes, run their existing clients through Faresay this week, and pay us next month —
> without us having to find a single client for them. Everything above serves that sentence.
