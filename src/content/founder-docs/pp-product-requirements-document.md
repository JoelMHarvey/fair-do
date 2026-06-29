# Practice Portal — Product Requirements

> Companion to the pivot plan (therapist-portal-pivot.md) and its sibling docs
> (pp-business-plan.md, pp-customer-persona.md). This is the product-requirements view of the
> **practice portal**: what we are building, for whom, in what order, and what already exists in the
> codebase versus what is still planned. Where the marketplace PRD (product-requirements-document.md)
> describes a two-sided market Faresay owns, this describes a single-tenant tool a therapist owns.
> Directional numbers are flagged as assumptions to validate; genuine unknowns use `[PLACEHOLDER: …]`.
> Last updated: 26 June 2026

## 1. Vision & overview

The Faresay practice portal is a very-easy-to-use web portal for a therapist to run their **own**
private practice in one place: clients (CRM-lite), per-client pricing, packages, calendar and
appointments, session invites with secure video, and payments with payouts. The therapist is the
customer; they bring their own clients. **"Easy to use" is the core product promise** — the wedge
against entrenched practice-management incumbents (SimplePractice, Cliniko, Power Diary, Halaxy,
WriteUpp) is simplicity, an AI-native posture, the fair Faresay ethos, and *optional* demand via the
client-finding network.

Revenue comes from three lines: a monthly **subscription** (the core MRR), a **small commission** on
payments processed through the platform, and **add-ons** (an AI helper, an accounting package, and
access to the client-finding network — the old marketplace, repackaged as opt-in lead-gen). See
pp-business-plan.md for the full commercial model and therapist-portal-pivot.md for the strategic
rationale.

> **Operator note:** roughly 80% of the marketplace code carries over — Stripe Connect
> (payments/payouts/KYC), Daily.co video, availability/calendar, messaging, email + `.ics`
> reminders, earnings, and the org/B2B model for clinics. The genuinely new build is Stripe Billing
> subscriptions, the client-invite "ownership inversion", per-client rates, and practice
> multi-tenancy. The pivot is mostly a resequencing, not a rewrite.

## 2. Goals & non-goals

**Goals**
- Let a solo therapist run their **whole** practice end-to-end (clients → booking → video →
  payment → payout) without stitching together 4–6 disconnected tools.
- Make **the therapist the owner** of every client relationship: clients are *invited*, not matched
  (the ownership-inversion principle — see §4).
- Get a real therapist **set up and live in under 15 minutes** (the simplicity bar; see §9).
- Earn predictable **MRR** via subscription, plus a small commission on processed payments, plus
  add-on attach.
- Hold a **high security bar** for special-category (mental-health) data while operating as a data
  **processor**, not a controller (see §6, §8).

**Non-goals (initial)**
- Faresay providing clinical care, clinical governance, or crisis intervention — these shift to the
  therapist as controller (signpost / surface support material only).
- Building an accounting engine from scratch (Phase E **integrates** Xero/FreeAgent — see §5).
- Insurance billing / claims (cash-pay practices first).
- Multi-region from day one — UK-first; US groundwork in the schema is deferred to v2.
- Marketplace-style client acquisition as the default path — demand becomes the opt-in client
  network add-on (Phase D), not the core.

## 3. Personas

The buyer is the **therapist**, not the client — the inverse of the marketplace PRD. Full detail in
pp-customer-persona.md; in brief:

- **Therapist (the practice owner — primary buyer):** UK private-practice therapist, BACP/UKCP/NCS
  registered, full-time or going full-time, platform-fatigued, currently juggling calendar + Zoom +
  bank transfer + spreadsheets + invoicing. Has budget (software is a tax-deductible business
  expense), feels acute admin pain, and is reachable via directories, LinkedIn, therapist
  communities, supervisors, and training bodies. Wants to look professional, get paid faster, and
  save time — optionally finding new clients when they choose to.
- **Client (the therapist's client — a managed record, not a buyer):** an existing or referred
  client the therapist invites onto the platform. Experiences *"<Therapist>'s practice"*, lightly
  branded, not the Faresay marketplace. Books, pays, and joins secure video sessions.
- **Clinic admin / group-practice owner (later):** runs a multi-therapist practice; reuses the
  existing Organisation model. Relevant from the Clinic tier onward.
- **Faresay ops / support:** onboards design partners, handles billing and subscription issues,
  manages the DPA and sub-processor chain. No clinical or trust-&-safety verification role in the
  portal model.

## 4. The ownership-inversion principle

The single biggest conceptual change from the marketplace: **the therapist is the admin of their own
mini-practice, and clients are records the therapist manages — invited, not matched.** Everything the
marketplace built for a *Faresay-owned* client now has a *therapist-owned* equivalent.

Concretely, this principle drives every requirement below:

- **Relationships are therapist-initiated.** A `Match` now carries a `source` of `marketplace`,
  `invite`, or `manual`. In the portal, the therapist sends an invite and the accepted invite creates
  the relationship — Faresay never inserts itself between therapist and client.
- **Pricing is per-relationship.** The therapist's standard rate is a default; each client can carry a
  `customRatePence` override that wins when set.
- **The client experience is single-tenant.** A client sees one practice, not a directory. Marketplace
  matching, questionnaires, and discovery are demoted to the opt-in network add-on.
- **Faresay's role narrows.** From care intermediary (data **controller**) to software the therapist
  uses (data **processor**) — lighter clinical liability, but real Art. 28 processor obligations
  (see §6, §8).

> **Operator note:** the riskiest part of the inversion is re-pointing client *ownership* from
> Faresay to the therapist. This is why the whole portal sits behind a single feature flag
> (`PRACTICE_PORTAL_ENABLED`, default off) so the marketplace flows stay untouched while the portal
> is built and migrated — flip the default only when it is proven.

## 5. Feature requirements by phase

> Principle (from the pivot plan): ship the **smallest thing a real therapist will pay for** first —
> the core practice OS plus subscription billing — prove retention, then layer add-ons. Each phase
> ends with a paying-customer milestone, not a feature count. Status tags below: **[BUILT]** = in the
> codebase today behind the flag; **[PLANNED]** = specified, not yet built.

### Phase A — Practice OS MVP (the new core)
*Goal: a solo therapist can run their whole practice and pay us a subscription.*

- **A1. Client invites (ownership inversion) — [BUILT].** Therapist adds a client by email; a secure,
  URL-safe, 14-day token invite is created and emailed (Resend). Accepting creates/links a `Client`
  and an active `Match` with `source=invite`. Implemented in `src/lib/practice.ts`,
  `src/app/api/practice/clients/route.ts` (create/resend), and
  `src/app/api/practice/join/[token]/route.ts` (accept). Guards in place: rate-limited (20/min per
  user+IP), duplicate-active-client rejected (409), still-valid pending invites are **resent** rather
  than stacked, email failure does not lose the invite (link recoverable from the roster), and a
  therapist cannot accept their own invite.
- **A2. Per-client rates — [BUILT].** Each relationship can carry a `customRatePence` override; the
  effective rate is resolved by `effectiveRatePence()` (per-client override, else
  `therapist.sessionRatePence`). Set at invite time, carried onto the `Match` on accept, and shown on
  the roster.
- **A3. Client roster (CRM-lite) — [BUILT].** `src/app/therapist/clients/page.tsx` lists active
  clients (effective rate, session count, upcoming count, invite source) and pending invites
  (awaiting status, custom rate, invited date), plus the invite form. Gated by
  `PRACTICE_PORTAL_ENABLED` (`notFound()` when off).
- **A4. Subscription billing (Stripe Billing) — [PLANNED].** The new money layer: tiers
  (Starter / Practice / Clinic), trials, dunning. The `Subscription` model already exists (tier,
  status, `commissionBps`, `addOns[]`, Stripe customer/subscription IDs) — the Stripe Billing
  integration, webhooks, feature gating, and the upgrade/checkout UI are still to build. Commission at
  payment time should switch from the fixed 15% marketplace fee to the therapist's
  `Subscription.commissionBps`.
- **A5. Therapist-initiated booking — [PLANNED].** Book *for* a client, or send a self-book link, off
  the therapist's own availability — re-pointing the existing `Availability` + booking flow at
  therapist-led scheduling. The roster currently links to the existing `/book/<therapistId>` page as
  an interim path.
- **A7. Re-scope client UX to one practice — [PLANNED/PARTIAL].** Drop marketplace matching from the
  default client path so an invited client sees only their therapist's practice.
- **Milestone:** 5 design-partner therapists running live caseloads, paying (even £1) for a month.

### Phase B — Polish, retention, client billing & packages
- **B1. Packages / bundles — [PLANNED].** Pre-paid session bundles (e.g. "6 for £270"). The `Package`
  model exists (`sessionsTotal`, `sessionsUsed`, `pricePence`, `status`); needs purchase, consumption
  tracking against sessions, and UI. Reuse the existing credit/voucher ledger as the balance.
- **B2. Recurring / standing appointments — [PLANNED].** Repeating slots; calendar sync (Google/Outlook,
  read at minimum).
- **B3. Client billing — [PLANNED].** Invoices/receipts to clients, package consumption, refunds.
- **B4. Client broadcast ("Substack-lite") — [PLANNED].** Email a client list — session invites today,
  light updates later — via the existing Resend wiring.
- **B5. Onboarding wizard + CSV import — [PLANNED].** Get a therapist live in <15 minutes; import an
  existing client list.
- **Milestone:** 25 paying therapists; >80% month-2 retention.

### Phase C — Add-on: AI helper — [PLANNED]
- Therapist-supervised assistant for scheduling, reminders, drafting client emails, summarising
  sessions, chasing unpaid invoices. **No autonomous clinical content or decisions.** Strict
  special-category data governance; gated behind the settled processor model (see §8).
- **Milestone:** add-on attach rate ≥25% of paying therapists.

### Phase D — Add-on: Client-finding network (re-light the marketplace) — [PLANNED]
- Opt-in directory listing (reuse `/therapists`, matching, reviews already built). A found client
  becomes a *managed* client via the invite handoff (`Match.source=marketplace` → therapist-owned).
  Finder fee / rev-share on first booking only (reuse referral plumbing).
- **Milestone:** the network supplies measurable incremental bookings; therapists *ask* to be listed.

### Phase E — Add-on: Accounting — [PLANNED]
- **Integrate, don't build:** FreeAgent/Xero/QuickBooks connection plus a simple
  invoices/expenses/year-end view tailored to therapists.
- **Milestone:** add-on attach + reduced churn among full-time practices.

## 6. Data model

The portal models are additive and gated behind `PRACTICE_PORTAL_ENABLED`; existing marketplace flows
are untouched. See `prisma/schema.prisma` and the deltas in therapist-portal-pivot.md §6.

| Model | Status | Purpose / key fields |
|---|---|---|
| `ClientInvite` | **[BUILT]** | Therapist-initiated invite. `therapistId`, `email`, `firstName?`, unique `token`, `customRatePence?`, `note?`, `status` (pending/accepted/revoked/expired), `acceptedClientId?`, `expiresAt`, `acceptedAt?`. Accepting creates/links a `Client` and an active `Match`. |
| `Match` (extended) | **[BUILT]** | The therapist↔client relationship. New fields: `source` (`marketplace`/`invite`/`manual`, default `marketplace`), `customRatePence?` (per-client rate override → falls back to `therapist.sessionRatePence`), `invitedAt?`. Unique on `(therapistId, clientId)`. |
| `Subscription` | **[BUILT — model only; integration PLANNED]** | The therapist's Faresay subscription. `stripeCustomerId?`, `stripeSubscriptionId?`, `tier` (starter/practice/clinic), `status` (inactive/trialing/active/past_due/canceled), `commissionBps` (default 200 = 2%), `addOns[]` (ai_helper/accounting/client_network), `currentPeriodEnd?`. Drives feature gating and the commission rate at payment time. |
| `Package` | **[BUILT — model only; flows PLANNED]** | Pre-paid bundle. `therapistId`, `clientId?`, `name`, `sessionsTotal`, `sessionsUsed`, `pricePence`, `status` (active/completed/cancelled). |

> **Operator note:** most of this is additive. The `Match` extension is the load-bearing change — it
> turns a marketplace-matched link into a therapist-owned one without a new table. `Subscription` and
> `Package` rows exist in the schema but their Stripe Billing and consumption flows are still to be
> built. `Payment.platformFeePence` should switch its source from the fixed 15% to
> `Subscription.commissionBps` when billing lands.

## 7. Key user flows

1. **Therapist invites a client (the inversion in action) — [BUILT].**
   Roster → "Invite a client" (email, optional first name, optional custom rate, optional note) →
   API creates/resends a `ClientInvite` with a 14-day token and emails the accept link
   (`/practice/join/<token>`) → invite shows under "Pending invites" as *Awaiting*.
2. **Client accepts the invite — [BUILT].**
   Client opens the link, signs in (Clerk) → `/api/practice/join/[token]` validates the token (404 if
   unknown, 410 if expired/used), ensures a `User` row (creating one if the Clerk webhook lagged),
   collects first/last name if missing (422 `name_required`), creates/links the `Client`, then creates
   or reactivates a `Match` with `source=invite` and the invite's `customRatePence` → marks the invite
   accepted → redirects the client to their dashboard. The relationship is now therapist-owned.
3. **Therapist books a session — [PLANNED, interim BUILT].**
   From the roster, "Book →" currently links to the existing `/book/<therapistId>` page (interim).
   Target: therapist-initiated booking *for* a client, or a self-book link, off the therapist's own
   availability, charged at the effective rate.
4. **Session, payment & payout — [REUSED].**
   Daily.co room, `.ics` + reminders, and Stripe Connect payment/payout all carry over from the
   marketplace; the only change is the commission source (subscription `commissionBps`, not 15%).
5. **Therapist subscribes / upgrades — [PLANNED].**
   Choose a tier → Stripe Billing checkout → webhook activates the `Subscription`, sets
   `commissionBps`, and unlocks tier features and add-ons.

## 8. Non-functional requirements

- **Security & privacy (special-category data).** Encryption in transit/at rest, RBAC, MFA option,
  audit logging, data minimisation. The bar stays as high as the marketplace even though our role is
  lighter — see uk-security-data-protection-policy.md (needs a processor-model re-cut, not a rewrite).
- **Data role: processor, not controller.** The therapist is the **controller** of their clients'
  mental-health data; Faresay is the **processor**. Requires an Art. 28 **DPA with every therapist**,
  plus a **SaaS subscription agreement** as the primary contract (replacing the contractor agreement),
  and the existing sub-processor chain documented (Neon, Stripe, Daily, Resend, Clerk). DPIA for the
  processor role. ⚠️ COUNSEL: get the controller→processor re-characterisation reviewed before
  onboarding therapists.
- **Clinical governance & crisis liability shift to the therapist** (their registration, PI insurance,
  duty of care). Faresay surfaces support material; it does not provide care. T&Cs must be explicit
  that Faresay is a tool, not a care provider. ⚠️ COUNSEL.
- **Feature-flag isolation.** Everything portal-specific is gated by `PRACTICE_PORTAL_ENABLED`
  (default off), returning `notFound()` / 404 when disabled, so the marketplace is unaffected.
- **Reliability, performance, accessibility.** Resilient booking/video/payments; fast roster and
  booking; WCAG 2.2 AA target.
- **Geography.** UK-first; US groundwork in the schema deferred to v2 ⚠️ COUNSEL.
- **AI add-on governance (Phase C).** Special-category data through an AI assistant needs explicit
  governance, a no-autonomous-clinical-decisions line, and DPA coverage — sequenced after the
  processor model is legally settled.

## 9. "Easy to use" UX requirements

Simplicity is the product, not a nicety. The bar to hold:

- **<15-minute setup.** A therapist signs up, sets their practice name and standard rate, invites their
  first client, and is ready to take a real session within fifteen minutes — no training, no migration
  project. (Onboarding wizard + CSV import in Phase B serve this directly.)
- **Run alongside existing tools at first.** No big-bang migration; a therapist can move one client over
  and keep the rest where they are until they trust it (lowers switching cost).
- **Sensible defaults, minimal required fields.** Invite needs only an email; first name, custom rate,
  and note are optional. The standard rate pre-fills the per-client rate.
- **Plain language, no jargon.** "Your clients", "Invite a client", "Awaiting", "Book →" — the
  language a therapist already uses, not CRM-speak.
- **Forgiving flows.** Resend rather than duplicate invites; recover an invite link from the roster if
  email fails; clear, human error messages ("That person is already one of your clients.", "This invite
  has expired or already been used.").
- **Single-tenant clarity for the client.** The client sees *"<Therapist>'s practice"*, not a Faresay
  directory — no marketplace noise.

## 10. Reused vs new components

| Capability | Status | Note |
|---|---|---|
| Therapist auth, onboarding, profile | Reused | Profile becomes *practice settings* |
| Availability + calendar | Reused | Re-point to therapist-led scheduling (Phase A5) |
| Stripe Connect (KYC, payouts, app-fee) | Reused | Client→therapist payments + commission |
| Daily.co video | Reused | The session room |
| Messaging (thread per relationship) | Reused | Therapist↔client messaging |
| Email + `.ics` + reminders (Resend, cron) | Reused | Invites/reminders (`sendClientInvite`) |
| Earnings dashboard | Reused | Practice revenue view |
| Credits / vouchers ledger | Reused | Repurpose as package/bundle balances |
| Org / B2B | Reused | Group practices / clinics |
| Reviews, referrals, complaints | Reused | Keep; referrals reframed as therapist referrals |
| Client invite flow | **New — BUILT** | `practice.ts`, `practice/clients`, `practice/join/[token]` |
| Per-client rate override | **New — BUILT** | `Match.customRatePence` + `effectiveRatePence()` |
| Client roster page | **New — BUILT** | `therapist/clients/page.tsx` |
| Subscription billing (Stripe Billing) | **New — PLANNED** | `Subscription` model exists; integration to build |
| Packages UI + consumption | **New — PLANNED** | `Package` model exists; flows to build |
| Therapist-initiated booking | **New — PLANNED** | Interim links to `/book/<therapistId>` |
| Practice-scoped client UX | **Partial — PLANNED** | Drop marketplace matching from default path |
| AI helper / accounting / client network | **New — PLANNED** | Add-ons (Phases C/E/D) |

## 11. Success metrics

- **Activation:** % of signed-up therapists who invite ≥1 client and run a real session; % set up in
  <15 minutes.
- **Conversion & MRR:** free→paid conversion (if Option A), paying-therapist count, MRR, ARPU.
- **Retention (the SaaS game):** month-2 and month-N retention, churn, logo vs revenue retention.
- **Engagement / GMV:** clients per therapist, sessions per therapist, payment volume processed (drives
  commission).
- **Add-on attach:** AI helper / accounting / client-network attach rates.
- **Invite funnel health:** invite → accept conversion; time-to-accept; expired-invite rate.
- **Phase milestones:** 5 paying design partners (A) → 25 paying, >80% month-2 retention (B) → ≥25%
  AI-add-on attach (C). Quantify in pp-business-plan.md.

## 12. Open questions

- **Pricing tension (the live one):** commission *on top of* subscription invites a "why pay twice?"
  objection that incumbents avoid. Resolve via Option A (Free + commission, paid buys it down toward
  0%) — recommended — vs Option B (subscription only, 0% commission). Validate all tier numbers
  (Starter £0, Practice ~£29–39, Clinic from ~£79; add-ons ~£10–25). ⚠️ Directional — validate.
- **Starter cap:** what is the active-client cap (N) on the free tier? `[PLACEHOLDER: N]`.
- **Booking ownership (A5):** therapist books *for* the client vs self-book link — default and balance?
- **"Substack" intent:** session invites now / light broadcast soon / real Substack integration later —
  confirm scope per pivot §11.
- **Marketplace coexistence:** run both models in parallel, or fully demote the marketplace to the
  network add-on before GA? Affects when `PRACTICE_PORTAL_ENABLED` flips to default-on.
- **Commission switchover:** confirm `Payment.platformFeePence` reads `Subscription.commissionBps` once
  billing lands, with a safe default before a therapist subscribes.
- **DPA & contract:** Art. 28 DPA template + SaaS subscription agreement ready at launch; ⚠️ COUNSEL on
  the controller→processor re-characterisation and tool-not-care-provider T&Cs.
- **Invite security review:** confirm 14-day TTL, token entropy (24 random bytes), and rate limits are
  acceptable for special-category onboarding ⚠️ SECURITY.
- **Geography:** UK-only first (recommended) vs design multi-region from day one (US schema groundwork
  exists) ⚠️ COUNSEL.
