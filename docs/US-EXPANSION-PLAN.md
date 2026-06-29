# US Expansion — Plan

UK and US are the **same product, different compliance + matching rules**. The moat is compliance, not code — but the code foundation (region-awareness) can be built now, in parallel with UK legal.

## The two things that make US genuinely different
1. **Per-state licensing.** A therapist licensed in California can only see clients **physically located in California** at session time. This is non-negotiable and shapes the data model + matching: US matching is **state-scoped**, not nationwide. Credential bodies differ per state and per profession (LPC, LCSW, LMFT, LMHC, PsyD, plus the state license number + state board).
2. **HIPAA, not UK GDPR.** Requires signed **BAAs** (Business Associate Agreements) with every vendor that touches PHI — Stripe, Daily.co, Neon, Clerk, Resend, Cloudinary all offer HIPAA tiers (higher cost, must request). Different consent/notice model (Notice of Privacy Practices, not Art 9 consent).

## Strategy (de-risk the launch)
- **Launch in ONE state first** (pick by demand + licensing friction — e.g. California, Texas, New York, or Florida). Limits the licensing/verification surface to one board.
- **Cash-pay only v1.** Do **not** touch insurance/superbills initially — it's a huge separate scope. Out-of-pocket private-pay sessions, same as UK.
- **Separate US legal entity** (US LLC) + US bank for Stripe US payouts. Parallel to Faresay Ltd.
- **988** (Suicide & Crisis Lifeline) + Crisis Text Line replace 999/Samaritans.

## What we BUILD NOW (code — no legal needed)
A clean **region/locale abstraction** so one codebase serves both markets:
1. `country` on Therapist + Client (`UK` | `US`), default `UK`.
2. US therapist fields: `licenseState`, US credential bodies (LPC/LCSW/LMFT/LMHC/PsyD) + license number.
3. Client `state` (US) so matching can be state-scoped.
4. `lib/locale.ts` — per-country: currency symbol + formatting (£/pence, $/cents), crisis helplines, credential-body list, registration label, legal copy hooks. (Money is already integer minor units — pence→cents is a symbol/format swap.)
5. **State-aware matching** — US clients only match US therapists licensed in their state.
6. Per-region **/help** (988 + Crisis Text Line for US) and onboarding crisis screen.
7. Region-aware copy on marketing/onboarding (currency, body names, "registered" vs "licensed").

## What's GATED (legal/ops — not buildable yet)
- HIPAA BAAs with all vendors; HIPAA tiers enabled.
- US LLC, US bank, Stripe US (Connect for US therapists).
- Choice of launch state(s).
- Notice of Privacy Practices, US T&Cs, US therapist agreement (US attorney).
- US credential verification process per state board.

## Phasing
- **Phase A (now):** region/locale foundation + state-aware matching + per-region crisis/currency. Inert for UK (defaults unchanged); US paths dormant until enabled.
- **Phase B (legal):** US entity, HIPAA BAAs, Stripe US, attorney docs, pick launch state.
- **Phase C (go-live US):** enable US region, recruit therapists in the launch state, soft launch.

## Risks / honest notes
- Per-state licensing means national scale = repeat the verification build per state. Start narrow.
- HIPAA raises vendor costs materially. Model it before committing.
- Don't let US work destabilise the UK launch — keep US paths behind a region flag and default everything to UK.
