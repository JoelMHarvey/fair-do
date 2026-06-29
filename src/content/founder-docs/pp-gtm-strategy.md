# Practice Portal — Go-To-Market Strategy (B2B SaaS)

> Companion to `therapist-portal-pivot.md` (the strategy source of truth) and a sibling to
> `pp-customer-persona.md` and `pp-financial-model.md`. The pivot plan explains **why** Faresay sells
> a practice portal to therapists; this document explains **how the first 10 → 100 → 1,000 paying
> therapists arrive — in the right order.** Beachhead: UK private-practice therapists. CAC/price
> assumptions tie to `pp-financial-model.md`; the buyer is drawn in `pp-customer-persona.md`.
> Directional throughout — validate each number with real data.
> Last updated: 26 June 2026

> **The test this document must pass:** `therapist-portal-pivot.md` lets a reader *understand* the
> new model. This document should tell the founder *exactly what to do in the first 30 days to sign
> the first paying therapist — in the right order* — and how that motion compounds to 100 and then
> 1,000.

> **Operator note (what makes this funnel different from the marketplace one):** the marketplace GTM
> (`gtm-strategy.md`) had to manufacture *demand* — cold, trust-gated, ad-policy-restricted clients,
> bidding against BetterHelp. This funnel sells to a buyer who is **reachable, has budget
> (tax-deductible), and feels acute admin pain today.** The B2B motion is therefore far more
> tractable, but it is a *different* game: longer consideration than a consumer click, won on trust
> and onboarding, and — crucially — **retention is the whole business**, not acquisition. We do the
> funnel math out loud (§4), rank channels around **warm distribution** (§3), and sequence a 30-day
> plan that signs design partners before it spends a pound on ads (§10).

---

## 1. Beachhead customer

**UK private-practice therapists — BACP / UKCP / NCS registered — who are full-time or going
full-time, and currently stitching together 4–6 disconnected tools** (calendar, Zoom/Teams, bank
transfer, spreadsheet, invoicing app, email).

- **Who they are in detail:** see `pp-customer-persona.md` (the therapist the team returns to when
  the messaging gets hard). The short version: solo or early-career, platform-fatigued, paying for
  several subscriptions that don't talk to each other, losing evenings to admin, and quietly
  embarrassed that booking/payment feels clunky to their clients.
- **Why this segment first:** incumbents (SimplePractice ~£50–70/mo, Cliniko from ~£35/mo, Power
  Diary, Halaxy, WriteUpp) are **built for and priced at established multi-clinician clinics**, and
  over-serve / over-charge the solo and early-career end. That end is under-served, price-sensitive,
  and feels the admin pain most acutely — the classic beachhead.
- **Why them, not the whole market:** they are *reachable* (directories, professional bodies,
  therapist communities, supervisors, training schools), they run a *business* (so the software is a
  deductible expense, not a luxury), and they bring **their own clients** — so we never have to
  manufacture demand for them.
- **Explicitly NOT (yet):** large clinics with entrenched systems and switching committees (that's
  the Clinic tier, later); US therapists (UK-first reuses all the legal work — see
  `therapist-portal-pivot.md` §9).

## 2. Positioning

**"The therapy-practice platform that's actually simple — with an AI assistant, and a way to find
new clients when you want them."**

- **One-liner:** Faresay replaces the five tools you're juggling with one simple place to run your
  practice — clients, calendar, payments, secure video — plus an AI assistant for the admin, and an
  optional way to find new clients when you have room.
- **Message pillars:** (1) **actually simple** — live in under 15 minutes, not a migration project;
  (2) **all-in-one** — calendar + payments + video + invites + client records, no more glue;
  (3) **AI-native** — an assistant that drafts emails, chases unpaid invoices, fills calendar gaps
  (therapist-supervised, never autonomous clinical content); (4) **fair** — "we grow when you grow,"
  free to start, no profiteering on human suffering; (5) **demand on tap** — opt into the
  client-finding network when *you* want more clients, off by default.
- **The wedge, stated plainly:** incumbents win on feature breadth for clinics. We win on
  **simplicity + AI + fair ethos + optional demand** for the solo/early-career therapist they
  over-charge. We are not trying to out-feature SimplePractice; we are trying to be the one a
  drowning solo therapist can actually set up on a Sunday evening.
- **Not:** a clinic EHR; a notes-and-compliance heavyweight; the cheapest box-ticker. And the
  client-finding network is a *feature you can switch on*, never the headline — the headline is
  running your own practice well.

> **Operator note — resolve the "why pay twice?" objection in the message, not just the pricing.**
> Incumbents charge subscription only and take *no* commission, so a commission on top invites a
> "why am I paying twice?" reaction. Lead with **Starter £0** (monetised by a small commission) and
> **0% commission on paid tiers** (see `pp-financial-model.md` and `therapist-portal-pivot.md` §4).
> The fair-ethos framing — "you only pay us more as you earn more, and paid tiers take nothing per
> session" — turns the objection into the brand.

## 3. Acquisition channels (ranked by fit · cost · control)

**Warm-first, mirroring the marketplace GTM logic but inverted for B2B.** A brand-new domain doesn't
rank, and therapist communities ban self-promotion just as expat ones did. The first paying
therapists come from **hand-recruited design partners and warm community relationships**, not cold
organic. SEO and content are investments you *start now and harvest in months 6–18*, not your Stage-0
engine.

| Channel | Motion | Cost | Role in first 100 |
|---------|--------|------|-------------------|
| **Direct + design partners** | Recruit 5–10 therapists by hand, co-build the MVP, run their real caseloads live | Founder time + heavy support | **PRIMARY (first 10)** — warm, high-trust, gives proof + testimonials |
| **Warm marketplace migrations** | Therapists already recruited for the marketplace are warm portal leads — invite them as design partners day one | Founder time | **PRIMARY (first 10)** — the warmest list we own (see §11) |
| **Professional communities / directories** | BACP/UKCP/NCS directories, therapist Facebook/Slack/Discord groups, r/therapists, LinkedIn — **value-first** (admin tips, templates), relationships and posting permission, *not* broadcast | Founder time | **PRIMARY (10→100)** — where the ICP already gathers; earn permission, don't spam |
| **Therapist referral loop** | Founding therapists refer peers; built-in referral plumbing + a £/credit incentive | Referral reward | **PRIMARY (compounding)** — peer trust is the highest-converting B2B channel here |
| **Content / SEO** | "how to run a private therapy practice", "best practice-management software UK", "SimplePractice alternative UK" — intent-rich, low trust-barrier vs consumer terms | Founder time | **Months 6–18 compounding** — seed now, don't count on for Stage 0 |
| **Partnerships** | Training bodies/schools, clinical supervisors, professional indemnity insurers as channel partners | Founder time / rev-share | **After first ~100** — warm, scalable, but a post-proof motion |
| **Small paid search** | Google Ads on "{competitor} alternative", "therapy practice software UK" as a **fast funnel-validation read**, not a scaling lever | ~£300–450/mo cap | **Support** — cheap read on whether the page converts; B2B intent terms are higher-trust than consumer mental-health terms |

> Principle: **earn the first 10 from your own hands** (design partners + warm marketplace
> migrations), the next 90 from **communities + the referral loop**, validated by a small paid read.
> Content/SEO and partnerships are slow-compounding assets you seed now and harvest later — they
> **cannot** be the Stage-0 proof engine. Unlike the consumer funnel, B2B intent terms aren't
> ad-policy-restricted, so paid is a clean, cheap read here.

## 4. Funnel math — does the plan actually close? (work backwards from 100)

**The most important section.** Count what 100 paying therapists actually requires, by tier of the
motion. B2B conversion here is *higher* than consumer (warm, value-clear, deductible) but the buying
cycle is *longer* (they're moving their whole practice). Directional rates — measure your own and
re-run this.

**Tier 1 — the first 10 (design partners, founder-led, hand-to-hand):**

| Stage | Conversion | Volume needed for 10 |
|-------|-----------|----------------------|
| Paying therapist (live caseload) | — | **10** |
| Onboarded → paying after trial | ~70% | **~14 onboarded** |
| Agreed → onboarded (set up, live) | ~70% | **~20 agreed to try** |
| Warm conversation → agreed | ~40% | **~50 conversations** |

**~50 warm conversations to land 10 paying design partners.** Sourced from the warm marketplace list
+ direct outreach to named therapists — *not* from a cold funnel. This is a founder-bandwidth job,
not a marketing-spend job.

**Tier 2 — the next 90 (communities + referral + paid read):**

| Stage | Conversion | Volume needed for 90 |
|-------|-----------|----------------------|
| Paying therapist | — | **90** |
| Trial start → paid | ~30% | **~300 trials** |
| Signup/lead → trial start | ~50% | **~600 leads** |
| Targeted visitor → lead | ~4% | **~15,000 targeted visitors** |

**~15,000 targeted visitors over the run to 100 ≈ a real but achievable number — IF most leads come
warm.** The load-bearing fact: a brand-new domain cannot supply 15,000 *cold* targeted visitors from
SEO in 6 months (new domains don't rank fast). So the top of this funnel must be **warm** — community
relationships and the referral loop carry it, paid search provides the conversion read, and SEO is
the months-6–18 harvest that *eventually* lowers the cost of Tier 2 and feeds Tier 3.

- **Therefore the plan closes only if the referral loop fires.** 10 happy design partners each
  referring 2–3 peers, who each refer more, is what turns ~50 conversations into 100 paying
  therapists without 15,000 cold strangers needing to find the page. Retention (§8) is what keeps the
  loop alive — a churned therapist refers no one.
- **Where 1,000 comes from:** Tier 2's referral + community motion, *plus* the partnerships channel
  (a single training body or insurer can introduce dozens), *plus* SEO finally compounding. We do not
  assume paid scales us to 1,000 — the unit economics (`pp-financial-model.md`) won't carry cold paid
  at £0–39 ARPU.
- These rates are starting assumptions. Instrument every stage and re-run the table.

> **Operator note — the SaaS funnel has a second half.** Signing a therapist is only half the job;
> the **trial → paid** and **paid → retained** conversions (§7, §8) are where MRR is actually made or
> lost. A consumer funnel ends at "paid once"; here it *begins* there.

## 5. CAC assumptions & founder bandwidth (tie to `pp-financial-model.md`)

- **Stage-0 ceiling: blended CAC < ~£150 per paying therapist.** Aim materially lower via
  warm/referral distribution — the first 10 should be ~£0 cash CAC (founder time only).
- **Why the ceiling is what it is:** at ~£29–39 MRR on the Practice tier (plus commission/add-ons),
  payback at CAC £150 is ~4–5 months of subscription — acceptable for recurring revenue *only if
  retention holds* (see §8). Cold paid that costs more than that per signup doesn't pay back; warm
  and referral channels are the only mix that keeps CAC under the line. Full math:
  `pp-financial-model.md`.
- **Metrics to track per channel:** **cost per qualified lead → lead→trial → trial→paid → CAC →
  month-3 retention.** Leading indicators (cost-per-lead, trial→paid) drive in-flight channel
  decisions; retention is the *product/offer* gate that decides whether the whole model funds itself.

### What the solo founder does NOT do in the first 60 days

Founder bandwidth is the scarcest resource. **Cut all of this for the first 60 days:**

- ~~Content treadmill (LinkedIn/blog 2–3×/week)~~ — seed a few cornerstone SEO pages, then stop; harvest is months away.
- ~~Maintaining presence in 5+ community groups~~ — listen and build admin relationships in 2–3, don't broadcast.
- ~~Partnership pilots with training bodies / insurers~~ — post-proof work; a warm intro you can't service is wasted.
- ~~Scaling paid spend~~ — paid is a *read*, capped, until the page and trial→paid both convert.

**Do only TWO things, ruthlessly:**

1. **Onboard and retain the design partners** — get them live on real caseloads, fix what breaks,
   make them love it. **Their success is the entire proof and the referral engine.**
2. **Have the next warm conversations** — work the ~50-conversation list (§4) and the referral
   introductions the happy partners generate.

## 6. First-customer trust mechanic (you launch with zero logos)

At launch there are no case studies and no peer using it, so a therapist is asked to move their
*livelihood* onto an unknown tool. Trust has to be *borrowed* from the founder and de-risked
operationally:

- **Founder-as-guarantee:** real name, face, and direct line on the site — *"I'll personally set up
  your practice with you and you can leave with your data any time."*
- **White-glove migration, free:** the founder imports their client list (CSV), sets up their rates
  and calendar, and sits with them on the first live booking. Switching cost is the #1 objection;
  remove it by doing the switch *for* them.
- **Run alongside, no rip-and-replace:** they keep their old tools for a month and move over at their
  pace — no bridge burned, no risk.
- **Free to start + first-paid-month money-back:** the Starter tier is £0, and the first paid month
  is refundable — the decision to upgrade carries no risk.
- **Design-partner status as social proof, early:** name the founding therapists (with permission),
  carry their testimonials and credentials, and let prospects talk to them. Peer reassurance beats
  any landing-page claim. The logo/case-study flywheel starts *after* these first 10 — it can't be
  the thing that wins them.

## 7. Conversion mechanics — free → paid and trials (the SaaS money step)

Acquisition gets a therapist to *try*; conversion turns the trial into MRR. This is where the
Option-A pricing (Starter £0 + commission; Practice 0% commission) does real work — and where most
B2B SaaS quietly leaks revenue.

- **Two entry doors, one upgrade path:**
  - **Free-tier-led (land):** Starter £0, capped active clients, ~2–3% commission. Removes all
    adoption friction; the therapist runs a few real clients at zero subscription cost. Monetised by
    commission until they grow.
  - **Trial-led (expand):** a time-boxed trial of the **Practice** tier (unlimited clients, 0%
    commission, full features). Use trials to *demonstrate the upgrade is cheaper* once they have
    real volume — at enough sessions, 0% commission beats 2–3%, so the upgrade pays for itself.
- **Make the upgrade self-evident, not a sales pitch:** surface a live "you'd save £X/mo on the
  Practice tier at your current volume" prompt — the maths makes the case, the fair ethos makes it
  trustworthy.
- **Activation is the leading indicator of paid conversion:** a therapist who has (a) invited ≥1 real
  client, (b) taken ≥1 payment, and (c) run ≥1 session through Faresay almost always converts and
  retains. **Drive every onboarding to those three milestones in week one** — that's the real trial
  goal, not "logged in."
- **Trial→paid targets (directional, validate):** ≥30% trial→paid overall; ≥60% for *activated*
  trials. Below that, the problem is activation/onboarding, not price — fix the onboarding before
  discounting.
- **Dunning is revenue:** Stripe Billing failed-payment recovery (retries + reminders) protects MRR
  you've already earned. Build it with the subscription layer, not later.

## 8. Retention — the SaaS game

In the marketplace, acquisition was the binding constraint. In SaaS, **retention is the business** —
recurring revenue only compounds if therapists stay, and (per §4) only retained therapists refer the
peers who supply the next tier. ARPU and growth both sit downstream of churn.

- **Onboarding *is* retention.** The <15-minute live-in promise and the three activation milestones
  (§7) are the single biggest churn lever — a therapist who never gets their clients in never stays.
- **Stickiness compounds with use:** once a therapist's whole caseload, calendar, payment history,
  and packages live in Faresay, leaving means re-migrating everything — switching cost now works *for*
  us. Per-client rates, package balances, and client records are the moat.
- **Add-ons deepen retention and lift ARPU:** the AI helper (drafting, chasing invoices, filling
  gaps) and accounting integration each create a daily-habit dependency. Target attach rate ≥25% of
  paying therapists (mirrors `therapist-portal-pivot.md` Phase C/E milestones).
- **The fair ethos is a retention asset:** "we grow when you grow," 0% commission on paid tiers, and
  data portability (leave any time, take your data) remove the resentment that drives SaaS churn.
- **Targets (directional, validate in `pp-financial-model.md`):** >80% month-3 logo retention among
  design partners; net revenue retention >100% once add-ons attach; surface an early-warning churn
  signal (a therapist whose usage drops for 2 weeks) and have the founder reach out personally while
  the base is small.

## 9. Criteria for success / failure

**Per channel (kill or scale) — leading indicators, readable in weeks:**

- **Scale** a channel when **cost-per-qualified-lead clears the bar** *and* its leads hit the
  activation/trial→paid rates (§7). Referral and community should clear it cheapest.
- **Kill / pause** a channel when cost-per-lead stays above the CAC line (§5) after its window, or it
  produces leads that don't activate (sign up but never invite a client).
- **Retention (>80% m3, design partners)** is the **product/offer** health gate, not a same-month
  channel kill-switch — but it is the *master* gate for whether to scale spend at all.

**Stage-0 go/no-go (the master gate):** proceed from "design partners" to "scale the funnel" **only**
when: **10 paying therapists running live caseloads · trial→paid ≥30% (≥60% activated) · month-3
retention >80% · ≥1 working referral (a partner has referred a peer who paid) · CAC under the line.**
If any miss → **fix onboarding / activation / pricing before spending to scale.** Do not buy growth on
top of a funnel that doesn't retain.

## 10. The first 30 days — a sequenced plan (not 7 parallel tasks)

Do these **in order** — each week unblocks the next. (Mirrors `therapist-portal-pivot.md` §12, made
GTM-specific.)

**Week 1 — warm list + first conversations.**
1. **Build the warm list:** every therapist already recruited for the marketplace (§11) + named
   therapists from directories/community you can reach directly. Aim for ~50 (§4).
2. **Start the conversations** — not a pitch, a co-build invite: *"I'm building the simple practice
   tool you've been wishing existed; will you help me shape it and be one of the first to run your
   practice on it?"* Book the first 5–10 design-partner calls.

**Week 2 — one page + trust + instrumentation.**
3. Stand up **ONE** landing page with the §2 positioning, the §6 trust mechanic (founder guarantee,
   free white-glove migration, run-alongside, money-back), and a "become a design partner" CTA.
4. **Instrument the funnel end-to-end** (Plausible + a lead → trial → activated → paid tracker) so
   every stage — including the three activation milestones (§7) — is visible from day one.

**Week 3 — onboard the first partners, for real.**
5. **Sign 5 design partners and migrate them yourself** — CSV import, rates, calendar, sit on the
   first live booking. Drive each to the three activation milestones in the same week.
6. **Turn on the £10–15/day paid read** on B2B intent terms as a *page-conversion check*, not a
   scaling lever.

**Week 4 — read, fix, seed the loop, gate.**
7. **Read the funnel.** Find the worst-converting / worst-activating stage and fix that one thing.
8. **Ask the happy partners for referrals** and seed 2–3 cornerstone SEO pages (then stop — harvest
   is months away).
9. **Honest 30-day gate:** **< 3 design partners live on real caseloads → stop and fix the offer /
   onboarding / migration friction before recruiting more.** Do not add channels or spend on top of a
   motion that isn't landing its warmest, easiest leads.

## 11. Migrating the warm marketplace therapists (your unfair advantage)

The pivot doesn't start cold. **Every therapist already recruited for the marketplace is a warm
design-partner lead for the portal** — they know Faresay, trust the founder, and already felt the
admin pain we now solve. This is the single warmest list we own, and it should be worked **day one**
(§10, Week 1).

- **Reframe the relationship, honestly:** *"We're building you something better — a tool to run your
  *own* practice, with your own clients, where you keep the relationship and we just make the admin
  disappear."* The ethos transfers cleanly ("fair for therapists; we grow when you grow").
- **Their existing clients seed the network:** as marketplace-recruited therapists move their
  caseloads in, the client-finding network (Phase D) accumulates liquidity as a by-product —
  exactly the pivot's "pickaxe logic" (`therapist-portal-pivot.md` §1).
- **Lowest-friction migration:** these therapists are already KYC'd through Stripe Connect, already
  have profiles and availability — so onboarding them is faster than a net-new therapist. Use them to
  pressure-test the migration flow before opening it wider.
- **They are also your first testimonials and referrers:** a marketplace therapist who becomes a happy
  portal design partner is the most credible voice to the next 90 (§4, §6).

## 12. First marketing plan (operational table — directional)

| Channel | Budget | Goal |
|---------|--------|------|
| Design partners + warm marketplace migrations | Founder time | First 10 paying therapists on live caseloads — the proof and the referral seed |
| Professional communities / directories | Founder time | Value-first relationships + posting permission; qualified leads (10→100) |
| Therapist referral loop | £/credit reward | The compounding engine — happy partners refer peers |
| Paid search (B2B intent) | £10–15/day (~£300–450/mo, capped) | Fast read on page + trial→paid conversion |
| Content / SEO (background) | Founder time (low) | Seed cornerstone pages now; harvest organic in months 6–18 |
| Partnerships (training bodies/supervisors/insurers) | Founder time / rev-share | Warm, scalable channel — **post-proof**, not Stage 0 |

> This becomes a full **marketing plan** (content calendar, ad campaigns, lifecycle/onboarding
> emails, churn-save flows, analytics) once the funnel retains — a later, operational document, not
> this one.

## 13. Linked documents

- `therapist-portal-pivot.md` (why + the model) · `pp-customer-persona.md` (who the buyer is) ·
  `pp-financial-model.md` (CAC / pricing / MRR math)
- `gtm-strategy.md` (the marketplace GTM this inverts) · `business-plan.md` · `model-comparison.md`
