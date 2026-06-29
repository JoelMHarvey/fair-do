> ⚠️ DRAFT v0.1 — for professional sign-off by security + legal review. NOT legal advice. Must be validated before use. Last updated: 26 June 2026

# Faresay UK Security & Data Protection Policy

Faresay is a **B2B SaaS practice portal**: software that an independent therapist uses to run their practice. Because the Portal handles **mental-health information** — among the most sensitive categories of personal data that exist — Faresay applies a correspondingly high standard of security and data protection across its people, processes and technology.

This policy sets out the controls Faresay maintains to protect the confidentiality, integrity and availability of the data it processes. It supports Faresay's obligations under the **UK GDPR** (in particular **Article 32 — Security of processing**) and the **Data Protection Act 2018 (DPA 2018)**. Client clinical data is **special-category** health data under Article 9 UK GDPR; Faresay is registered with the **Information Commissioner's Office (ICO)**.

> Read alongside the [Privacy Policy](pp-privacy-policy.md), the [Data Processing Agreement](pp-dpa.md), and the [UK Legal Brief](pp-uk-legal-brief.md). This is an internal operational policy; controller-facing commitments live in the Privacy Policy and the DPA.

⚠️ **SECURITY / COUNSEL — overarching honesty note.** This is a first draft. Faresay is **bootstrapped** and early-stage; **several controls below describe a target state, not a control that is fully implemented today.** Each such item is flagged with ⚠️. Counsel and a security specialist must validate the controller/processor analysis, the UK/EU data-residency and transfer model, the DPO assessment, and all breach-notification obligations before this policy is relied upon. Do not represent target-state controls as live.

---

## 1. Purpose & scope

### 1.1 Purpose
This policy defines how Faresay protects the data it processes, establishes accountability for security and data protection, and demonstrates — for **UK GDPR Article 32** — that Faresay implements appropriate **technical and organisational measures (TOMs)** proportionate to the risk to individuals.

### 1.2 Scope
This policy applies to:
- All Faresay personnel: founders, employees, contractors, and any worker with access to Faresay systems or data.
- All Faresay information systems: the **practice-portal application**, supporting infrastructure, code repositories, administrative tooling, and corporate accounts.
- All data Faresay processes — both data for which Faresay is the **controller** (therapist account, billing, usage, support data) and data for which Faresay is a **processor** (therapist's client data, including special-category mental-health data).
- Sub-processors that process Faresay data on Faresay's behalf (Section 5).

### 1.3 The controller / processor split ⚠️ COUNSEL
Faresay's customer is the **therapist**. Faresay holds **two roles**:

- **Faresay is the CONTROLLER** of data about its customer and visitors: therapist **account/identity**, **billing/subscription**, **usage/analytics**, and **support** data.
- **Faresay is a PROCESSOR** of the therapist's **clients' data** (intake, session, clinical notes, mental-health information). The **therapist is the controller** of that client data; Faresay processes it **only on the therapist's documented instructions** under an **Article 28 Data Processing Agreement** (see [pp-dpa.md](pp-dpa.md)).

This split determines which obligations in this policy fall on Faresay as controller versus on the therapist as controller (with Faresay assisting as processor). ⚠️ **COUNSEL** — confirm the mapping; Faresay must not be treated as controller of client clinical data.

---

## 2. Data classification

| Class | Examples | Faresay's role | Handling baseline |
|---|---|---|---|
| **Class 1 — Highest: client mental-health / special-category data** | The fact a person is a client; intake/assessment; session content; clinical notes; safeguarding/crisis information; messages relating to care. | **Processor** (therapist is controller) | Strict least-privilege; encryption in transit and at rest; full audit logging; never in non-production; processor breach regime (notify controller — Section 8). |
| **Class 2 — Confidential** | Therapist account & identity; authentication data; billing data; professional registration/verification; security configuration. | **Controller** | RBAC; encryption in transit and at rest; logged access. |
| **Class 3 — Internal** | Internal documents, non-sensitive operational data. | Controller | Access limited to personnel; standard controls. |
| **Class 4 — Public** | Marketing pages; therapist profile data the therapist agrees to publish. | Mixed | Integrity controls; no confidentiality requirement. |

Notes:
- Even the bare fact that an individual is a **client** of a therapist on Faresay is **Class 1** special-category data.
- For Class 1 data, the **therapist (controller)** sets the lawful basis and permitted uses; Faresay processes only on documented instructions under the DPA.
- Payment card data: Faresay uses a **PCI-DSS-compliant payment processor** so Faresay does not store raw card data. [PLACEHOLDER: payment processor]. ⚠️ **SECURITY** — confirm cardholder-data flows and PCI scope.

---

## 3. Governance, roles & responsibilities

### 3.1 Accountability
Faresay's leadership (founder/management) is ultimately accountable for information security and data protection and for approving this policy.

### 3.2 Key roles
- **Security Lead** — [PLACEHOLDER: named individual]. Owns this policy, risk treatment, vendor security review, incident response, and the security roadmap. In an early-stage bootstrapped company this is initially a founder; ⚠️ **SECURITY** — confirm whether a fractional/virtual CISO or external advisor is engaged.
- **Data Protection point of contact** — [PLACEHOLDER: named individual]. Owns DPIAs, records of processing (UK GDPR Art 30), data-subject-rights assistance, and the ICO relationship.
- **All personnel** — follow this policy, complete training, report incidents promptly, protect credentials and devices.

### 3.3 DPO assessment ⚠️ COUNSEL
Faresay processes **special-category health data on a large scale as a processor**. This is a strong trigger for the **mandatory appointment of a Data Protection Officer (DPO)** under **UK GDPR Article 37(1)(c)**, which can apply to **processors** as well as controllers where core activities consist of large-scale special-category processing.

- ⚠️ **COUNSEL** — formally assess whether a statutory DPO is **required**. Given Faresay's core activity is processing therapists' clients' mental-health data at scale, the assessment is likely to conclude a DPO **is** required.
- If required: appoint a DPO, document the appointment and their independence, publish their contact details, and notify the ICO. ⚠️ — **target state; not yet appointed.**
- Record the assessment and its outcome whatever the conclusion (accountability under Art 5(2)).

### 3.4 Review
Security risks are tracked in the [risk register](pp-risk-register.md). Material decisions, exceptions and accepted risks are recorded with an owner and review date.

---

## 4. Article 32 technical & organisational measures

This section sets out Faresay's TOMs for **UK GDPR Article 32**. It is a planning aid, not a confirmation of compliance. ⚠️ items are target-state.

### 4.1 Access control (Art 32(1)(b))
- **Least privilege** — minimum access for the role; admin access is the exception, justified and time-bound.
- **RBAC** — access granted by role wherever the platform supports it.
- **Need-to-know for Class 1** — access to client mental-health data restricted to roles with genuine operational need and logged.
- **MFA** required for all administrative and production access, code repositories (GitHub), the hosting/database provider (Neon), authentication provider (Clerk), DNS, and email.
- **Separation of duties** — production access, deployment rights and security administration separated where headcount allows. ⚠️ **SECURITY** — document compensating controls given small team size.
- **Joiner/mover/leaver** — access provisioned by role on a documented request; reviewed on role change; revoked promptly on departure (target: same business day; immediately for involuntary departures); periodic access reviews ([PLACEHOLDER: quarterly]). ⚠️ — **target state.**

### 4.2 Encryption (Art 32(1)(a))
- **In transit** — **TLS 1.2+/1.3** enforced for all connections; HTTP→HTTPS redirect; HSTS. Edge/TLS via [PLACEHOLDER: Vercel/Cloudflare]; backend, API and database connections (Neon) also encrypted.
- **At rest** — Class 1 and Class 2 data encrypted at rest with strong, industry-standard algorithms (e.g. AES-256) via the database/storage provider (**Neon**); backups encrypted at rest.
- **Key management** — API keys, database credentials and secrets held in a platform secrets/environment-variable store, never committed to source control; access restricted and logged; rotation on a defined schedule and on suspected compromise. ⚠️ **SECURITY** — define rotation cadence and ownership.

### 4.3 Confidentiality, integrity, availability & resilience (Art 32(1)(b)–(c))
- Access control, RBAC, MFA — Section 4.1.
- **Audit logging** — access to and changes affecting Class 1 and Class 2 data logged with identity, timestamp and action (accountability, Art 5(2)). ⚠️ **SECURITY** — confirm logging covers **reads** of client data, not just writes.
- **No sensitive data in logs** — Class 1 content and secrets must never be written to application logs.
- **Backups & DR** — regular encrypted backups with restore testing; defined **RPO/RTO** [PLACEHOLDER]; documented recovery procedure. ⚠️ — **target state for formal RPO/RTO and restore testing.**

### 4.4 Data residency (Art 32 + transfers)
- **Preferred residency:** UK or EU regions for all personal data, especially Class 1. **Neon** offers UK/EU regions — these must be **selected and verified** for the production database.
- **US sub-processors** — Clerk, Daily and Resend are US-based; transfers handled per Section 5.2.
- ⚠️ **SECURITY** — maintain a **data-flow map** showing where each data class is stored, processed and transmitted, including sub-processor location and the transfer mechanism relied on.

### 4.5 Secure development & testing (Art 32(1)(d))
- Secure-by-design; **DPIA** completed for the large-scale special-category processing (Art 35) — ⚠️ **COUNSEL**, target state.
- Code in version control (GitHub); changes via peer-reviewed pull requests; protected main branch; secret scanning; dependency scanning (Dependabot/equivalent); OWASP Top 10 protections; environment separation with **no production Class 1 data in non-production**.
- ⚠️ **SECURITY** — formalise SAST/DAST and independent penetration testing as the team matures.

---

## 5. Sub-processors & Article 28 terms ⚠️ COUNSEL

### 5.1 Sub-processor register
Faresay maintains a register of all sub-processors, the data classes they handle, and their locations. [PLACEHOLDER: link.]

| Sub-processor | Location | Purpose | Data class |
|---|---|---|---|
| **Clerk** | US | Authentication / identity for therapist accounts | Class 2 (therapist account) |
| **Daily** | US | Video session delivery | Class 1 (client session, in transit) |
| **Resend** | US | Transactional / account email | Class 2 (therapist), incidental Class 1 |
| **Neon** | US / **EU (select EU/UK region)** | Application database & storage | Class 1 & Class 2 |
| **[PLACEHOLDER: payment provider]** | [PLACEHOLDER] | Subscription billing + card commission | Class 2 (billing) |

### 5.2 Article 28 DPAs and transfer mechanisms ⚠️ COUNSEL
- A **Data Processing Agreement compliant with UK GDPR Article 28** is **required with every sub-processor** that handles personal data, including the **Art 28(3) terms**: processing only on documented instructions, confidentiality, Art 32 security, sub-processor controls and flow-down, assistance with data-subject rights and breaches, and deletion/return of data on termination.
- These terms must **flow down** from the **DPA Faresay signs with each therapist** (Faresay as processor) to each sub-processor (Faresay's sub-processors) — see [pp-dpa.md](pp-dpa.md).
- For **non-UK** sub-processors (**Clerk, Daily, Resend**, and **Neon** where a non-UK/EU region is used), a **UK transfer mechanism** — IDTA, or SCCs with the UK Addendum, plus a **transfer risk assessment** — is **required** in addition to the DPA before any personal data is shared.
- ⚠️ **SECURITY / COUNSEL** — confirm a **signed DPA and a valid transfer mechanism** are in place for each provider **before** transmitting Class 1/Class 2 data. Do not transmit Class 1 data to any provider without both. ⚠️ — **several of these are target state today.**

---

## 6. Logging, monitoring & vulnerability management

- **Audit & monitoring** — infrastructure, authentication and application logs collected and reviewed; alerting on suspicious activity (failed-login spikes, privilege changes). [PLACEHOLDER: tooling]. ⚠️ — **target state for centralised monitoring/alerting.**
- **Log retention** — [PLACEHOLDER: period, aligned with storage-limitation and ICO guidance]. ⚠️ **COUNSEL.**
- **Patch management** — OS, dependencies and platform components kept current; critical vulnerabilities remediated on an SLA (target: [PLACEHOLDER: critical within 7 days]).
- **Penetration testing** — independent test before scaled launch and at least annually / on major change. [PLACEHOLDER: provider/cadence]. ⚠️ **SECURITY — not yet performed.**
- **Coordinated disclosure** — vulnerability reporting channel ([PLACEHOLDER: security@faresay.com]) and triage process.

---

## 7. Personnel & physical security

- **Background checks** — pre-engagement screening proportionate to role and access to Class 1 data, subject to UK law (e.g. DBS where appropriate). ⚠️ **COUNSEL** — confirm lawful basis and limits.
- **Confidentiality agreements** — all personnel with access to Class 1/Class 2 data sign confidentiality / NDA terms.
- **Training** — security and data-protection training at onboarding and at least annually (phishing, UK GDPR fundamentals, handling mental-health data). ⚠️ — **target state for formal annual programme.**
- **Endpoint security** — full-disk encryption, screen lock, current OS/security updates, reputable endpoint protection; lost/stolen devices reported immediately.
- **Remote-first** — Faresay relies on **cloud-hosted** infrastructure; physical data-centre security is inherited from providers (Neon, and the hosting/edge provider) and evidenced via their certifications (SOC 2 / ISO 27001).
- **Acceptable use** — systems used only for authorised purposes; no credential sharing; no exporting Class 1 data outside approved systems; **no use of unapproved tools (including AI/LLM tools) on Class 1/Class 2 data** without authorisation. ⚠️ **SECURITY** — define an approved-tools list.

---

## 8. Incident response & breach notification ⚠️ COUNSEL

### 8.1 Incident response
- Documented process: detection, triage, containment, eradication, recovery, notification, post-incident review. ⚠️ — **target state for the fully documented runbook.**
- All personnel must report suspected incidents immediately to the Security Lead. [PLACEHOLDER: channel.]
- Incidents are logged and assessed for severity and for whether a notifiable personal-data breach has occurred.

### 8.2 Breach notification — role-dependent
The notification path **depends on Faresay's role** for the affected data:

- **Faresay's own controller data** (therapist account, billing, usage, support): where a breach is likely to result in a risk to rights and freedoms, Faresay notifies the **ICO without undue delay and, where feasible, within 72 hours** (UK GDPR Art 33), and notifies affected individuals where there is a high risk (Art 34).
- **Therapist's client data (Faresay as processor):** Faresay notifies the **controller — the therapist — without undue delay** after becoming aware (UK GDPR Art 33(2)), with the information the therapist needs to meet **their** ICO and data-subject obligations. Faresay does **not** notify the ICO directly for client data; that is the therapist-controller's duty, which Faresay assists.

A record of all personal-data breaches (facts, effects, remedial action) is maintained whether or not notified.

⚠️ **COUNSEL** — confirm the notification routing above, the contractual timelines for processor→controller notification in the DPA, and the contact details/escalation path.

---

## 9. Data retention, minimisation & secure disposal

- **Minimisation** — Faresay collects and retains only the data necessary for the purposes in the [Privacy Policy](pp-privacy-policy.md) and the [DPA](pp-dpa.md).
- **Controller data** retained per a defined retention schedule (Privacy Policy Section 7). [PLACEHOLDER: schedule.]
- **Client (processor) data** retained only as long as the **therapist (controller)** instructs; returned or deleted on the controller's instruction or on termination, per the DPA.
- **Secure disposal** — data securely deleted/anonymised at end of retention; providers' certified-destruction processes relied upon; backups age out per backup retention policy.
- ⚠️ **COUNSEL / CLINICAL** — reconcile retention with UK GDPR storage limitation (Art 5(1)(e)) and the therapist's clinical-records retention rules, which differ.

---

## 10. Alignment to a recognised framework (future goal)

As a **bootstrapped, early-stage** company, formal certification is a **future goal**, not a current state. Candidate frameworks:
- **Cyber Essentials / Cyber Essentials Plus** — UK government-backed baseline; pragmatic early target.
- **ISO/IEC 27001** — recognised ISMS certification; strong signal for UK healthtech and therapist trust.
- **SOC 2 (Type II)** — where partner due diligence demands it.

⚠️ **SECURITY** — agree the target framework and a realistic roadmap (likely Cyber Essentials early, ISO 27001 as the company scales).

---

## 11. Policy review

- Reviewed at least **annually** and after any major change to systems, processing, regulation, or following a significant incident.
- The Security Lead owns the review; the Data Protection point of contact and counsel review data-protection aspects.

| Version | Date | Author | Notes |
|---|---|---|---|
| v0.1 (DRAFT) | 26 June 2026 | [PLACEHOLDER: author] | Initial practice-portal draft (controller/processor split) for security + legal sign-off. |

---

> **End of draft.** ⚠️ This v0.1 draft must be validated by qualified security and legal professionals, with all `[PLACEHOLDER: …]` items resolved and ⚠️ target-state controls either implemented or honestly disclosed, before it is relied upon or published. Not legal advice.
