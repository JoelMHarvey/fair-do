# US Expansion — Plan

UK and US are the **same product, different compliance + matching rules**. The moat is trust + compliance (background checks, child-safety, student-data), not code — but the code foundation (region-awareness) can be built now, in parallel with UK legal.

## The two things that make US genuinely different
1. **Per-state child-safety + licensing nuance.** US rules vary by state: background-check/screening requirements for adults working with minors, student-data-privacy laws, and (in some states) private-school/tutoring registration. **Confirmed:** private tutoring does **not** require a state teaching licence, so US matching is **not** state-locked the way regulated therapy is. The real per-state variables are background-check routes and student-data law — the data model stays region/state-aware so we can gate those where a state demands it.
2. **COPPA + state student-data law, not UK GDPR.** No HIPAA (tutoring isn't healthcare). Federal **COPPA** governs collecting data from under-13s — verifiable parental consent and direct parental notice. Sign **data-processing terms** with every vendor that touches student data — Stripe, Daily.co, Neon, Clerk, Resend, Cloudinary (no exact "BAA" equivalent; confirm the mechanism). Different consent/notice model (parental consent + COPPA notice, not Art 9 consent).

## Strategy (de-risk the launch)
- **Launch in ONE state first** (pick by demand + friction — e.g. California, Texas, New York, or Florida). Limits the verification/compliance surface to one state.
- **Private-pay only v1.** Do **not** touch school-district contracts, public/Title-I funding, or anything that imports school-data compliance initially — it's a huge separate scope. Out-of-pocket private lessons, same as UK.
- **Separate US legal entity** (US LLC) + US bank for Stripe US payouts. Parallel to Faresay Ltd (trading as fair-do).
- **988** (Suicide & Crisis Lifeline) + Crisis Text Line replace 999/Samaritans for distress signposting (fair-do is not a crisis service, but owes a duty of care to minor students).

## What we BUILD NOW (code — no legal needed)
A clean **region/locale abstraction** so one codebase serves both markets:
1. `country` on Teacher + Student (`UK` | `US`), default `UK`.
2. US tutor fields: `licenseState` (where relevant), state teaching certification + certificate number — optional, since many private tutors are unlicensed.
3. Student `usState` (US) so matching can be state-scoped where a state requires it.
4. `lib/locale.ts` — per-country: currency symbol + formatting (£/pence, $/cents), distress helplines, credential/qualification list, registration label, legal copy hooks. (Money is already integer minor units — pence→cents is a symbol/format swap.)
5. **State-aware matching** — US students match US tutors per state where a state requires it (default: not hard-locked).
6. Per-region **/help** (988 + Crisis Text Line for US) and onboarding safety screen.
7. Region-aware copy on marketing/onboarding (currency, qualification names, "registered" vs "certified").

## What's GATED (legal/ops — not buildable yet)
- Vendor data-processing terms (COPPA / student-privacy) with all vendors.
- US LLC, US bank, Stripe US (Connect for US tutors).
- Choice of launch state(s).
- Parental-consent / COPPA notices, US T&Cs, US tutor agreement (US attorney).
- US background-check / credential verification process per state.
- ~~Whether any state private-school/tutoring licensure applies~~ — **confirmed: none for the marketplace or private tutors.**

## Phasing
- **Phase A (now):** region/locale foundation + state-aware matching + per-region safety/currency. Inert for UK (defaults unchanged); US paths dormant until enabled.
- **Phase B (legal):** US entity, vendor data terms, Stripe US, attorney docs, pick launch state.
- **Phase C (go-live US):** enable US region, recruit + background-check tutors in the launch state, soft launch.

## Risks / honest notes
- Per-state child-safety/background-check rules mean national scale = repeat the verification build per state. Start narrow. (Licensure is not required for private tutors.)
- COPPA / student-data compliance and per-state background checks add cost and process. Model them before committing.
- Don't let US work destabilise the UK launch — keep US paths behind a region flag and default everything to UK.
