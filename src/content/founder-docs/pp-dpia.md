> ⚠️ DRAFT v0.1 — for UK legal counsel review. NOT legal advice. Risk scoring to be validated by the DPO/solicitor. Last updated: 25 June 2026

# Faresay Practice Portal — Data Protection Impact Assessment (DPIA)

Prepared under **Article 35 of the UK GDPR**, following the ICO's DPIA methodology. A DPIA is **required** here because the processing involves **large-scale processing of special-category (health) data** using new technology — two of the ICO's screening triggers.

| | |
|---|---|
| **Assessment owner** | Joel Harvey, Founder |
| **DPO / data-protection lead** | Joel Harvey, Founder (no statutory DPO required at current scale) |
| **Date started / completed** | 25 June 2026 |
| **Review date** | At least annually, or on material change |

---

## Step 1 — Identify the need for a DPIA

Faresay is a practice-management platform that therapists subscribe to in order to run their practice: managing clients, booking and delivering (video) sessions, taking card payment, and sending email/SMS reminders. Faresay acts as **Processor** for the clinical/client data; the therapist is the **Controller**.

A DPIA is required because the processing involves: (a) **special-category health data**; (b) at **scale** as the platform grows; (c) **vulnerable data subjects** (people seeking mental-health support); and (d) **new technological solutions** (video, automated reminders).

## Step 2 — Describe the processing

**Nature:** collection, storage, transmission, display, payment facilitation, video hosting, messaging, automated reminders, export and deletion.

**Scope:** identity/contact data, scheduling data, payment metadata, messages, intake/consent responses, and **mental-health information**. Data subjects are clients of subscribing therapists (and the therapists themselves). Volume grows with adoption.

**Context:** clients are often vulnerable; there is a clear power/confidentiality dynamic in therapy. Data is among the most sensitive categories that exist. Faresay is UK-first.

**Purposes:** to let independent therapists deliver and administer care efficiently. Faresay's purpose as Processor is limited to providing the software on the Controller's instructions.

**Data flows:** client → therapist's practice on Faresay → stored in UK/EEA database (Neon); payments via Stripe; video via Daily.co; email via Resend; SMS via Twilio; cookieless analytics via Plausible. See Sub-processor List (`pp-sub-processors.md`).

## Step 3 — Consultation

- **Data subjects / therapists:** To be recorded during design-partner onboarding.
- **Internal:** founder/engineering; DPO/solicitor on finalisation.
- **Processors:** reliance on sub-processors' published security/DPA documentation.

## Step 4 — Assess necessity and proportionality

- **Lawful basis (as Controller, own data):** contract, legal obligation, legitimate interests (see ROPA (`pp-ropa.md`)).
- **Lawful basis (clinical data, as Processor):** determined by the therapist-Controller — typically Art 9(2)(h) and/or explicit consent.
- **Data minimisation:** only data needed to run a practice is collected; health data is recorded at the therapist's discretion; reminders contain practitioner + time, not clinical content; analytics are cookieless.
- **Function creep prevention:** Faresay contractually undertakes not to use client data for its own purposes, marketing, or AI training (DPA §3.3).
- **Data-subject rights:** supported via in-product export/deletion and Processor assistance to the Controller (DPA §7).

## Step 5 — Identify and assess risks

| # | Risk to individuals | Likelihood | Severity | Overall |
|---|---|---|---|---|
| R1 | Unauthorised access to health data (external attacker) | Possible | Severe | **High** |
| R2 | Therapist account compromise (weak/stolen credentials) | Possible | Severe | **High** |
| R3 | A therapist sees another therapist's clients (authorisation flaw) | Remote | Severe | Medium |
| R4 | Data exposure via a sub-processor / international transfer | Remote | Severe | Medium |
| R5 | Reminder sent to wrong recipient (email/SMS) | Possible | Moderate | Medium |
| R6 | Excessive retention after a client leaves a practice | Possible | Moderate | Medium |
| R7 | Re-identification via analytics | Remote | Moderate | Low |

## Step 6 — Measures to reduce risk

| # | Measure | Effect | Residual |
|---|---|---|---|
| R1 | TLS in transit; AES-256 at rest; least-privilege access; security logging; pen-test pre/post scaled launch **[target]** | Reduce | Low–Medium |
| R2 | Clerk auth with strong passwords + **MFA**; session controls | Reduce | Low–Medium |
| R3 | Application-level tenant isolation; authorisation checks on every client/session route; code review | Reduce | Low |
| R4 | UK/EEA primary storage; UK IDTA / SCCs for any transfer; sub-processor DPAs; 14-day change notice | Reduce | Low |
| R5 | Confirmed contact fields; managed-client flows; reminders carry minimal content | Reduce | Low |
| R6 | Retention policy: export window + deletion timeline (DPA §11); per-client deletion | Reduce | Low |
| R7 | Cookieless analytics (Plausible) — no personal data collected | Eliminate | Negligible |

## Step 7 — Sign-off and outcomes

| Item | Detail |
|---|---|
| **Residual risk** | Acceptable — residual risks assessed Low after the measures above |
| **Prior consultation with ICO required?** | Only if a high residual risk cannot be mitigated — **not anticipated**. |
| **DPO advice** | to be confirmed |
| **Approved by** | Joel Harvey, Founder — 25 June 2026 |
| **Integrated into project?** | Measures tracked in the Risk Register (`pp-risk-register.md`) and TOMs (`pp-toms.md`). |
| **Next review** | to be confirmed |

---

*Draft prepared to support a UK launch. Risk scoring and sign-off to be validated by the DPO / data-protection solicitor before reliance.*
