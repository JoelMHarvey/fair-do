# Practice Portal — Design-Partner Validation Plan

> The portal's equivalent of the marketplace `validation-experiment.md`: prove the bet **with a
> handful of real therapists** before any further build-out or spend. Companion to
> `model-comparison.md`, `therapist-portal-pivot.md`, `practice-portal-golive.md` (ops) and
> `pp-gtm-strategy.md`. Last updated: 26 June 2026

---

## The one bet to prove (everything hangs on this sentence)
> **A reachable therapist can be signed, set up in under 15 minutes, run their existing clients
> through Faresay this week, and pay us next month — without us finding a single client for them.**

If that holds with 5–8 real therapists, the portal is the right opening move. If it doesn't, no
amount of building fixes it. This plan tests it directly and cheaply.

## What we are NOT testing yet
Not price optimisation, not scale, not the marketplace add-on, not subscription-billing conversion
mechanics. Just: **do real therapists adopt it, run their practice on it, and say (and start to
show) they'd pay.** Pricing is a conversation at the end, not a paywall during the pilot.

## ⚠️ Gate before any real client data touches the platform
The portal model makes Faresay a **data processor** and the therapist the **controller** of
special-category (mental-health) client data (`model-comparison.md` §3). **Before** a design partner
imports/invites real clients:
- A **Data Processing Agreement (Art. 28)** signed with each design-partner therapist.
- Provisional confirmation of the controller→processor characterisation from counsel.
- Security posture intact (EU/UK residency, breach process).

This is non-negotiable — pilot with **dummy/test clients** until the DPA is in place per partner.
(Owner: founder + counsel. See `pp-risk-register.md`.)

## Who to recruit (5–8 design partners)
- **Profile:** UK, registered (BACP/UKCP/NCS/BPS), **solo or small private practice**, currently on
  0–2 tools or actively frustrated with their current setup (SimplePractice/Cliniko/spreadsheets).
- **The acute-pain ones convert best:** admin overload, juggling calendar + payments + notes by hand.
- **Where to find them (warm-first):**
  1. Therapists already in the marketplace recruitment pipeline — warmest leads, ask today
     (`therapist-portal-pivot.md` §7).
  2. Personal/professional referrals + the founder's network.
  3. Professional communities (BACP forums, therapist Facebook/LinkedIn groups) — relationship, not spam.
- **The offer:** free during the pilot, **white-glove onboarding by the founder**, direct line to
  shape the product, locked founder pricing afterwards.

## The protocol (per partner, ~4–6 weeks)
1. **Onboard (timed):** turn on `PRACTICE_PORTAL_ENABLED`, sign them up, **CSV-import their existing
   client list** (the import flow is built), set practice details. **Target: usable in < 15 min.**
2. **Invite real clients** (after DPA): the therapist invites their own clients by email
   (ownership-inversion flow). Measure **invite → accept** rate.
3. **Run real sessions this week:** book at the per-client rate. **Offline mode works with no Stripe**
   — video room + reminders fire — so they can run genuine sessions before billing is wired.
4. **Use as their practice OS for 4–6 weeks:** scheduling, video, messaging, reminders, per-client
   rates/packages. Weekly 15-min founder check-in.
5. **Exit interview + real price ask:** would they pay £29–39/mo? Put a number in front of them and
   watch the reaction (and, ideally, take a card on a founder-pricing plan).

## Metrics & gates
| Stage | Metric | Early bar |
|-------|--------|-----------|
| **Activation** | Setup time; clients imported/invited; first real session | < 15 min · ≥ 5 clients · first session within 7 days |
| **Engagement** | Sessions run/week; weekly-active; tools replaced | Runs their real caseload here; replaces ≥ 2 old tools |
| **Retention** | Still actively using at week 4 / week 8 | **> 80% week-4** (the SaaS bar, `therapist-portal-pivot.md` §5) |
| **Monetisation** | % who say they'd pay; % who actually start a paid/founder plan | ≥ half say yes; ≥ some actually pay |
| **PMF signal** | "How disappointed if Faresay went away?" (Sean Ellis) | **> 40% "very disappointed"** |

## Decision rules (set now)
- **KILL / rethink** if: setup routinely **> 30 min**, or invite→accept is low, or **< half run a real
  session in week 1**, or **week-4 retention < ~50%**, or nobody will pay at the end.
- **PASS → build Phase A→B properly** if: most partners **activate < 15 min + run real clients in
  week 1 + week-4 retention > ~80% + ≥ half would pay** (and a couple actually do) + PMF signal > 40%.

## Timeline (~6–8 weeks)
- **Wk 0:** finalise the DPA template + processor memo; line up 5–8 partners; turn the flag on for them.
- **Wk 1–2:** onboard + import + first sessions (the activation read — most kills happen here).
- **Wk 3–6:** real usage; weekly check-ins; log metrics.
- **Wk 7–8:** exit interviews + price ask; decide.

## What's already built (so the pilot needs little new)
Merged + gated behind `PRACTICE_PORTAL_ENABLED`: client invites, **CSV import**, managed clients,
per-client rates, therapist-initiated booking (**offline mode**), video, messaging, reminders,
broadcast, packages, billing-portal stub. **Subscription billing is NOT needed for the pilot** —
partners are free; the price ask is a conversation + a manual Stripe link if they convert.

## Recruitment & interview assets to draft next (say the word)
- Cold/warm **outreach message** to therapists + the 90-second pitch.
- **Onboarding checklist** (the <15-min path) + a dummy-client dataset for pre-DPA testing.
- **Weekly check-in** questions + the **exit-interview / price-ask** script.
- The **design-partner DPA** template (with counsel).

## Linked documents
- `model-comparison.md` (the decision) · `therapist-portal-pivot.md` (the plan) ·
  `practice-portal-golive.md` (ops runbook) · `pp-gtm-strategy.md` · `pp-risk-register.md`
