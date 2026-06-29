# Practice Portal — Business Model Canvas

> Companion to the pivot plan (`therapist-portal-pivot.md`) and its sibling docs
> (`pp-financial-model.md`, `model-comparison.md`). This canvas describes the **new** model: Faresay
> as a **B2B SaaS practice portal** for therapists — not the B2C marketplace. Where the old
> `business-model-canvas.md` split everything across two sides of a marketplace, this one has a single
> paying customer: the **therapist**. Directional numbers here are assumptions to validate, not
> commitments; the financial model supersedes any rough figures.
> Last updated: 26 June 2026

Faresay is now a **single-sided B2B SaaS**: we sell therapists a very-easy-to-use web portal to run
their *own* practice. The therapist is the **buyer**; their clients are **end-users**, invited by the
therapist, not acquired by Faresay. The **core product promise is simplicity** — one tool that
replaces the 4–6 disconnected tools a solo therapist currently juggles.

> **Operator note:** the mental shift from the marketplace canvas is "ownership inversion". The
> therapist owns the client relationship; we own the rails. We no longer manufacture demand — we sell
> the pickaxe and accumulate liquidity as a by-product (re-lit later as the client-finding add-on).

---

## 1. Customer Segments

The therapist is the customer in every segment. Clients are **end-users, not buyers** — they
experience the product as *"<Therapist>'s practice"*, lightly branded, and never pay Faresay directly.

| Segment | Who | Why they buy | Notes |
|---|---|---|---|
| **Solo private-practice therapist (beachhead)** | UK BACP/UKCP/NCS-registered, full-time or going full-time, stitching together calendar + Zoom + bank transfer + spreadsheets + invoicing | Acute admin pain; has budget (tax-deductible); reachable; wants to look professional and get paid faster | The wedge segment incumbents over-charge and under-serve |
| **Early-career / part-time therapist** | Newly qualified, building a caseload, price-sensitive, few clients | Low/no entry cost; grow into paid tiers; later may *want* demand (client network) | Lands on the **Starter (£0)** tier; monetised by commission |
| **Group practices / clinics** | Multi-therapist practices needing shared admin, pooled scheduling, reporting | Manage several clinicians in one place; reuse the existing Org/B2B model | Higher-value **Clinic** tier; multi-tenant by practice |
| *(End-users — not a buyer segment)* | The therapist's own clients | They get secure booking, payment and video; they buy from the *therapist*, not Faresay | Faresay is a **processor** of their special-category data (see §9 of `therapist-portal-pivot.md`) |

## 2. Value Propositions

**To therapists (the buyer)**
- **Simple, all-in-one practice OS** — clients (CRM-lite), calendar/appointments, per-client pricing,
  packages/bundles, session invites + secure video, payments & payouts, in one place. "Easy to use"
  is the product, not a feature.
- **Fair pricing & ethos** — *"fair for therapists; we grow when you grow."* A genuine free tier for
  those starting out; no profiteering from the under-served end.
- **AI assistant (add-on)** — scheduling, reminders, drafting client emails, summarising sessions —
  therapist-supervised, **no autonomous clinical content**.
- **Optional client-finding (add-on)** — when a therapist *wants* more clients, opt into the Faresay
  network (the old marketplace, repackaged as lead-gen). Demand is opt-in upside, not the core sell.
- **Look professional, get paid faster, save ~5 hrs/week** — the concrete ROI pitch.

**To clients (end-users — experienced, not sold)**
- A clean, secure way to book, pay and meet their therapist online — under *their therapist's*
  practice brand, not a marketplace.

## 3. Channels

A B2B SaaS funnel — tractable where the old consumer funnel was not (intent-rich, low trust-barrier
terms; reachable buyers).

- **Direct + design partners** — recruit 5–10 therapists by hand for the MVP and co-build. Start with
  anyone already warm from marketplace recruitment.
- **Professional communities** — BACP/UKCP directories, therapist Facebook/Slack/Discord groups,
  r/therapists, LinkedIn. Value-first (admin tips, templates), not spammy.
- **Content / SEO** — "how to run a private therapy practice," "best practice-management software UK"
  — intent-rich and far lower trust-barrier than consumer mental-health terms.
- **Referral loop** — therapists refer peers (existing referral plumbing; £/credit incentive).
- **Partnerships as channels** — training schools, clinical supervisors, professional bodies and
  insurers as routes to reachable buyers.
- **The web app** — `faresay.com` as the practice portal and sign-up surface.

## 4. Customer Relationships

- **Self-serve SaaS** — sign up, set up in <15 minutes, run a real caseload this week. The simplicity
  bar *is* the onboarding strategy.
- **White-glove for design partners** — high-touch co-build with the first 5–10; CSV import and
  hands-on migration to lower switching cost.
- **Onboarding wizard + migration helper** — import an existing client list; live fast.
- **Retention is the game** — this is a subscription, so success/retention support, in-product
  guidance, and low-friction billing (trials, dunning) matter more than one-off sales.
- **Tool, not care provider** — comms and T&Cs are explicit that Faresay is software; clinical
  governance and crisis duty of care sit with the therapist. Crisis/safeguarding material is surfaced
  as *support*, not provided as a service.

## 5. Revenue Streams

Three lines (see `pp-financial-model.md` for the numbers; all figures here are **directional,
to validate**):

| Line | What | Directional pricing | Note |
|---|---|---|---|
| **1. Subscription (MRR) — the core** | Tiered by practice size / features | Starter **£0**; Practice **~£29–39/mo**; Clinic **from ~£79/mo** | Predictable recurring revenue; replaces one-off transactional fees |
| **2. Transaction commission** | Small % on client payments processed through the platform (Stripe Connect application fee — already built) | ~**2–3%** on Starter; **~1% or 0%** on paid tiers | Paid tiers *buy the commission down* — resolves the "why pay twice?" tension |
| **3. Add-ons** | Recurring/usage lines stacked on a subscription | AI helper **~£15–25/mo**; Accounting **~£10–15/mo**; Client network **rev-share or ~£20/mo** (+ small finder fee) | The ARPU upside; attach-rate is the lever |

> **Operator note — the real tension:** practice-management incumbents charge **subscription only and
> take no cut** of session fees, so a commission *on top* invites *"why am I paying twice?"*. The
> recommended resolution (Option A) is a **free tier monetised by commission**, with paid tiers at
> **0% / near-0%** — revenue then scales with the therapist's success, in keeping with the ethos.
> See §4 of `therapist-portal-pivot.md` and the model split in `model-comparison.md`.

## 6. Key Resources

- **The practice portal itself** — the all-in-one OS: roster/CRM-lite, calendar, per-client pricing,
  packages, invites, secure video, payments/payouts, subscription billing.
- **~80% reused codebase** — Stripe Connect (payments/payouts/KYC), Daily.co video,
  availability/calendar, messaging, email + `.ics` reminders, earnings, org/B2B, credit ledger →
  packages. The hard plumbing already exists.
- **The latent marketplace asset** — the existing directory/matching, ready to re-light as the
  client-finding network once de-risked; therapist caseloads accumulate liquidity as a by-product.
- **Brand & ethos** — *"fair for therapists; we grow when you grow; no company should profit from
  human suffering."* Transfers cleanly from the marketplace.
- **Processor-grade security & compliance posture** — strong security for special-category data, DPA
  machinery, breach process (the credible-trust asset for a clinical tool).
- **Lean team + founder-market fit** — capital-efficient, bootstrapped.

## 7. Key Activities

- **Acquire therapists** (only — no longer two cold sides). Sign one reachable buyer at a time.
- **Build & run the practice OS** — reliability of the booking/payment/video/invite core; the
  <15-minute setup bar.
- **Build the new money layer** — Stripe Billing subscriptions, per-client rates, packages, the
  client-invite "ownership inversion", practice multi-tenancy (the genuinely new build).
- **Retention & success** — onboarding, migration, in-product guidance; the SaaS game is keeping
  subscribers.
- **Sequence the add-ons** — AI helper (differentiation), then re-light the client network, then
  accounting (integrate, don't build).
- **Maintain the processor compliance posture** — DPAs, security, DPIA for the processor role, AI
  data-governance before the assistant ships.

## 8. Key Partnerships

- **Stripe** — Connect (client→therapist payments, payouts, KYC, commission via app-fee) **and**
  Billing (the new subscription layer).
- **Daily.co** — secure session video.
- **Resend** — transactional email, `.ics` invites/reminders, client broadcast.
- **Clerk** — auth. **Neon** — database. (All also sub-processors under the therapist's DPA.)
- **Accounting partners** — FreeAgent / Xero / QuickBooks: **integrate, don't build** the accounting
  add-on.
- **Channel partners** — training bodies, clinical supervisors, professional bodies and insurers as
  routes to therapists.
- **Counsel** — UK-first; controller→processor re-characterisation, the Art. 28 DPA template, and the
  SaaS subscription agreement.
- **Hosting / infra** — Vercel (web), plus the managed providers above.

## 9. Cost Structure

- **Product & engineering** — the new build (Stripe Billing, ownership inversion, per-client rates,
  multi-tenancy) on top of maintaining the reused 80%. The dominant cost.
- **Payment-processing fees** — Stripe's cut on processed client payments.
- **Infra & video** — hosting, database, Daily.co session minutes, email.
- **Sales & marketing / CAC** — now a **B2B** therapist-acquisition cost (content, community,
  partnerships, design-partner white-glove) — structurally lower and more tractable than the old
  consumer CAC against BetterHelp.
- **Compliance** — UK legal (processor model, DPA template, SaaS agreement), security for
  special-category data, AI governance for the assistant. Lighter than the marketplace's
  care-intermediary posture, but the processor obligations are real.
- **G&A** — bootstrapped, tight burn.

---

### How this canvas differs from the marketplace canvas

The shift is structural, not cosmetic. See `model-comparison.md` for the full side-by-side; in brief:

- **One customer, not two.** The marketplace canvas split every block across **Clients** and
  **Therapists** and lived or died on **two-sided liquidity**. This canvas has a **single buyer — the
  therapist** — and clients are end-users we never have to acquire.
- **Revenue flips from a take-rate to recurring SaaS.** Marketplace = a **15% (10% founding) platform
  fee** per session, bounded by client liquidity we couldn't manufacture. Portal = **subscription MRR
  + small commission + add-ons**, bounded by therapist count × their *existing* caseloads.
- **Demand becomes optional.** What *was* the whole business — matching clients to therapists — is
  demoted to the **opt-in client-finding add-on**.
- **Lighter regulatory posture.** Marketplace positioned Faresay as a **care intermediary / data
  controller**; the portal makes Faresay a **software processor** (the therapist is controller). See
  §9 of `therapist-portal-pivot.md`.
- **The CAC lever changes.** The marketplace's primary lever was the **expat niche** (to lower
  consumer CAC); the portal's is that **B2B buyers are simply reachable** — findable, budgeted, and in
  acute admin pain.

> **Operator note:** nothing is thrown away. The marketplace canvas isn't wrong — it's *resequenced*.
> The directory we already shipped becomes the "find new clients" add-on, and the fair-therapist ethos
> carries straight over. For the numbers behind every block here, see `pp-financial-model.md`.
