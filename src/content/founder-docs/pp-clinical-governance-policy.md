> ⚠️ DRAFT v0.1 (Practice Portal) — for clinical advisor + UK legal review. NOT clinical or legal advice. Must be validated by a UK-qualified clinical lead (⚠️ CLINICAL) and counsel (⚠️ COUNSEL) before use. Last updated: 26 June 2026

# Faresay Practice Portal — Clinical Governance Position

> **Read the pivot first.** Faresay is now **B2B SaaS software** (a practice portal sold to therapists), not a care marketplace. See `pp-uk-legal-brief.md` and `model-comparison.md`. Under this model the **therapist is the provider, the data controller, and holds clinical responsibility** for their own clients. **Faresay does not provide care, does not direct clinical decisions, and does not control the clinical relationship.** This document is therefore deliberately short: it defines Faresay's narrow role and the clinical-governance responsibilities therapists must carry as a condition of using the software.

This document replaces the marketplace Clinical Governance Policy (`uk-clinical-governance-policy.md`) for the practice-portal direction. The marketplace version remains relevant only for a possible future "find clients" add-on, which would re-open provider/intermediary questions (see `pp-uk-legal-brief.md` §9).

---

## 1. The boundary that must not be crossed

1.1 Faresay supplies **software tools** to independent, registered mental-health professionals so they can run their own practice (scheduling, video, messaging, records storage, payments). The **therapist** delivers the clinical service, owns the clinical relationship, exercises clinical judgement, and holds the clinical record.

1.2 **Faresay must stay "software, not provider."** Faresay does not, and must not appear to:
- provide, arrange, or coordinate clinical care;
- make or direct clinical decisions about any individual client;
- set treatment standards, override clinical judgement, or supervise therapists clinically;
- control or own the clinical relationship or the clinical record.

> ⚠️ COUNSEL — This boundary is load-bearing. If Faresay is treated **in substance or appearance** as the provider or controller of clinical care, it risks: (a) being pulled into CQC regulated-activity registration; (b) acquiring a clinical duty of care and crisis/safeguarding liability; and (c) losing its clean **processor** characterisation under UK GDPR. Counsel must review this document and the product to confirm nothing makes Faresay the provider or controller of care rather than a tool one step removed. See `pp-uk-legal-brief.md` §5–§6.

1.3 ⚠️ CLINICAL — Even as a software vendor, Faresay should take an advisor's view (via a qualified clinical/safeguarding advisor) on whether the product's design creates foreseeable clinical risk (e.g. how crisis signposting and records are handled). That advisory input does **not** make Faresay the clinical provider; it is product-safety diligence.

---

## 2. Faresay's limited role

Faresay's clinical-governance footprint is confined to three things:

### 2.1 Provide the software

2.1.1 Faresay provides and maintains the portal tooling to an appropriate security standard (UK GDPR Art 32; see `pp-uk-legal-brief.md` and the Security & Data Protection Policy). Faresay processes client data **only on the therapist's documented instructions** as a **processor** under an Article 28 DPA. Faresay does not hold or control the clinical record; the therapist does.

### 2.2 Verify professional registration

2.2.1 As a condition of access, Faresay verifies that each therapist holds a current, valid, unrestricted registration or accredited-register membership with a relevant UK professional body — e.g. **HCPC** (practitioner psychologists), or a **PSA-accredited register** such as **BACP**, **UKCP**, or **NCPS/NCS** (counsellors/psychotherapists), as applicable.

2.2.2 Verification is a **gate to using the software**, not a clinical assessment of fitness to treat any particular client. Faresay records the registering body, registration/membership number, type and standing, and issue/expiry dates, and re-checks standing on a defined cadence. [PLACEHOLDER: verification method and cadence — e.g. primary-source check against the regulator/register, at onboarding and at least annually.]

> ⚠️ COUNSEL / ⚠️ CLINICAL — "Therapist"/"counsellor" are not statutorily protected titles in the UK. Confirm the minimum acceptable registers/accreditations, whether unaccredited counsellors are admitted, and what (if any) identity/DBS checks are appropriate for a **software customer** (lighter than a marketplace supplier — Faresay is not placing this person with clients). Confirm this verification does **not** imply Faresay vouches for clinical quality in a way that creates a duty of care.

### 2.3 Stay out of clinical care

2.3.1 Faresay does not screen clients, does not assess suitability, does not make referral or crisis decisions, and does not direct treatment. Those are the therapist's responsibilities (Section 3) and, for crisis/safeguarding, are governed by `pp-crisis-safeguarding-policy.md`.

---

## 3. Therapist responsibilities (condition of use)

As a term of using the Faresay practice portal, each therapist warrants that **they** — as the provider, controller, and clinically responsible professional for their own clients — maintain the following. These obligations sit in the B2B SaaS subscription agreement and DPA (see `pp-uk-legal-brief.md` §2, §4).

### 3.1 Own clinical governance

3.1.1 The therapist is responsible for the quality, safety, and ethics of their own clinical service, and for compliance with the standards of their professional body. Faresay sets no clinical standard above the therapist's own professional obligations.

### 3.2 Supervision and CPD

3.2.1 The therapist maintains clinical supervision and continuing professional development as required by their professional body, and can evidence this. Faresay does **not** supervise and is not the therapist's clinical supervisor.

### 3.3 Scope of practice

3.3.1 The therapist works only within their competence, training, and registration/accreditation, and only with client populations and presentations they are competent to treat — referring or signposting elsewhere where a client's needs fall outside their scope or outside what can be safely delivered remotely. ⚠️ CLINICAL — confirm any product-side prompts that help (but do not direct) the therapist here.

### 3.4 Informed consent

3.4.1 The therapist obtains and documents the client's informed consent to treatment, including the limits of remote delivery, confidentiality and its limits (safeguarding disclosures), how records are kept, fees, and what to do in a crisis (see `pp-crisis-safeguarding-policy.md`). Consent to **clinical treatment** (the therapist's responsibility) is distinct from any consent/lawful basis for **data processing**, which the therapist (as controller) is responsible for and which the DPA supports.

### 3.5 Record-keeping standards

3.5.1 The therapist is the **controller and custodian of the clinical record**. They keep records that are accurate, contemporaneous, adequate, secure, and retained for the period required by their professional body and UK law, then securely disposed of. Faresay's storage tooling is a processor service operated on the therapist's instructions; it does not transfer record ownership or responsibility to Faresay. [PLACEHOLDER: retention periods — set by the therapist per their discipline; confirm what the product stores and under what DPA terms.] ⚠️ COUNSEL.

### 3.6 Professional-body compliance and indemnity

3.6.1 The therapist remains bound by, and complies with, the ethical and practice standards of the body that registers/accredits them (**BACP / UKCP / NCS / BPS / HCPC**, as applicable), including standards for remote delivery, and holds their own professional indemnity insurance appropriate to their practice. Where this document and a therapist's professional standards ever appear to conflict, the therapist follows their professional and legal obligations.

### 3.7 Crisis and safeguarding

3.7.1 The therapist owns crisis management and safeguarding for their own clients. This is governed by `pp-crisis-safeguarding-policy.md`, which forms part of these terms.

---

## 4. Roles at a glance

> ⚠️ CLINICAL / ⚠️ COUNSEL — Indicative; confirm the split keeps Faresay as a tool, not a provider/controller of care.

| Area | Therapist (provider / controller) | Faresay (software vendor / processor) |
|---|---|---|
| Clinical decisions for clients | **Owns / accountable** | None |
| Clinical standards, supervision, CPD | **Owns / maintains** | None (does not supervise) |
| Scope of practice / suitability | **Owns** | May provide neutral product prompts only |
| Informed consent | **Obtains & documents** | Provides tooling |
| Clinical record | **Owns / controls / retains** | Provides secure storage (processor) |
| Professional-body compliance & indemnity | **Owns** | Verifies registration as access gate |
| Crisis & safeguarding | **Owns** (see `pp-crisis-safeguarding-policy.md`) | Signposting + lawful data-sharing mechanism only |
| Software security & availability | Uses securely | **Owns** (Art 32) |

---

## 5. Related documents

- `pp-uk-legal-brief.md` — practice-portal legal brief (processor role, DPA, liability shift).
- `pp-crisis-safeguarding-policy.md` — crisis & safeguarding (therapist-owned; Faresay limited role).
- `model-comparison.md` · `therapist-portal-pivot.md` · `pp-risk-register.md`.
- B2B SaaS subscription agreement + Article 28 DPA (the instruments that bind therapists to Sections 2–3). [PLACEHOLDER: links once drafted.]
- `uk-clinical-governance-policy.md` — superseded marketplace version (retain for possible future "find clients" add-on only).

---

*End of DRAFT v0.1 (Practice Portal). ⚠️ Validate with a UK-qualified clinical lead and counsel before use. Do not let any clause make Faresay the provider or controller of clinical care.*
