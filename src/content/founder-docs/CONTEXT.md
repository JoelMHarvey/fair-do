# Faresay — Shared Context Fact Sheet

> Single source of truth for all Faresay documents. Every doc in this folder must stay consistent
> with these facts. If a fact changes, update it here first.

## The company
- **Faresay** — an online **therapy / mental-health marketplace** connecting clients with
  licensed mental-health professionals (psychologists, clinical social workers / counsellors,
  psychotherapists).
- **The core product is trust.** Every therapist is **manually verified** — licensed,
  identity-verified, interviewed, and quality-reviewed before listing. **Matching (fit) sits on
  top of trust**, not the other way round.
- **Current footprint:** United Kingdom. **Sequencing:** **UK first → English-speaking
  expatriates worldwide → broader markets (including the US) later.**
- **Beachhead after UK:** **internationally mobile English-speaking professionals** — in Japan,
  Singapore, Hong Kong, the UAE, Thailand, Vietnam, and Europe — seeking culturally-compatible
  therapists for relocation stress, isolation, identity, and belonging.
- **Stage / posture:** **bootstrapped**, capital-efficient, internal operating focus (no
  near-term external raise).
- **Expansion is gated by Stage 0 proof-of-concept** (see below) — no geographic expansion until
  it is met.

## Business model
- **Cash-pay** marketplace — clients pay out of pocket; Faresay is **not** billing insurance.
- **Marketplace take rate: 15%** of the session fee (therapist keeps 85%). **Founding therapists
  pay 10%** (keep up to **90%**).
- **Marketplace, not a provider** — Faresay provides the **platform**; the **clinician** provides
  the clinical service and owns the clinical relationship and clinical record.
- **Fee characterisation (important):** position the platform fee as a **technology + marketing
  platform fee** (software, discovery, scheduling, payments, client acquisition) — **not** a split
  of the clinician's professional fee. This framing matters for fee-splitting / corporate-practice
  law and must be confirmed with counsel in any market entered.

## Stage 0 — proof-of-concept gate (UK)
Geographic expansion (expat corridors, then broader markets) is **gated** on hitting all of:
- **25 therapists** onboarded and verified.
- **100 paying clients.**
- **CAC < £100.**
- **Payback ~4 sessions.**
- **Retention > 60% at month 2.**

Until these are met, the work is UK build-out and trust/verification operations — not expansion.

## Expat phase — key regulatory dependency
- The beachhead is internationally mobile English-speaking professionals abroad seeking
  culturally-compatible UK/English-speaking therapists.
- **Cross-border licensure / jurisdiction (per corridor)** is the key regulatory dependency:
  which therapist licence is valid for a client physically located in Japan, Singapore, the UAE,
  etc., and which jurisdiction's law governs the session. Confirm per corridor with counsel.
- **Active legal workstream is the UK legal pack** (`uk-legal-regulatory-brief.md`) plus
  per-corridor cross-border analysis — **not** US machinery.

## US — later, optional phase (only if/when a US move is triggered)
The following is **deferred**, not the near-term plan. Revisit only if a US entry is decided:
- Likely **MSO (Faresay's commercial entity) + "friendly PC"** where a state's
  corporate-practice-of-medicine (CPOM) / corporate-practice-of-psychology doctrine requires it.
- Therapists licensed in the **state where the client is located**; leverage interstate compacts
  (**PSYPACT**, **Counseling Compact**, **Social Work Licensure Compact**).
- US healthcare-regulatory counsel to validate entity structure, fee characterisation, and
  per-state requirements (see the legal skill: `.claude/skills/faresay-legal-authority/`).

## Data protection posture
- **UK now (active):** UK GDPR + Data Protection Act 2018; clinical data is **special-category**
  health data. ICO registration.
- **Expat phase:** cross-border data transfers per corridor (which privacy regime applies to a
  client located abroad) — analyse alongside the cross-border licensure question.
- **US (later, optional):** **HIPAA** (covered-entity vs business-associate status TBC with
  counsel) plus state health-privacy laws (e.g. Washington **My Health My Data Act**, CCPA/CPRA).
  Deferred until/unless a US move is triggered.
- Sensitive mental-health data → high security + confidentiality bar throughout.

## Voice & standards for these documents
- Professional, clear, plain-English where possible.
- Every legal/clinical document is a **DRAFT for professional (legal/clinical) review** — not
  legal or clinical advice. Mark clearly. Flag every point that genuinely needs counsel or a
  clinical advisor with `⚠️ COUNSEL` / `⚠️ CLINICAL`.
- Use `[PLACEHOLDER: …]` for company specifics not yet known (registered entity name, address,
  DPO contact, governing law venue, etc.). Do not invent facts.
- Cross-reference sibling docs by filename where relevant.

## Document set (this folder)
1. `business-model-canvas.md`
2. `product-requirements-document.md`
3. `therapist-agreement.md` ⚠️ counsel
4. `terms-of-service.md` ⚠️ counsel
5. `privacy-policy.md` ⚠️ counsel
6. `clinical-governance-policy.md` ⚠️ clinical
7. `crisis-safeguarding-policy.md` ⚠️ clinical
8. `financial-model.md` (+ `financial-model.csv`) — follows market research
9. `risk-register.md`
10. `security-data-protection-policy.md` ⚠️ counsel/security
