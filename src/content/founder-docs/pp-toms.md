> ⚠️ DRAFT v0.1 — for UK legal counsel review. NOT legal advice. Some controls describe target state; each is flagged. Last updated: 25 June 2026

# Faresay Practice Portal — Technical & Organisational Measures (TOMs)

This document is **Annex 2** to the Data Processing Agreement (`pp-dpa.md`). It describes the technical and organisational security measures Faresay maintains under **Article 32 of the UK GDPR**, appropriate to the risk of processing **special-category (mental-health) data**.

> Faresay is early-stage and bootstrapped. Controls marked **[target]** are planned or partially implemented and being matured; all others are in place today. This annex is reviewed at least annually and on material change.

---

## 1. Pseudonymisation and encryption

- **Encryption in transit:** all traffic to and from the platform is served over **TLS 1.2+ (HTTPS)**. Video sessions use the encrypted transport provided by the video sub-processor.
- **Encryption at rest:** the primary database (Neon Postgres) and object/file storage encrypt data at rest using the provider's managed encryption (AES-256).
- **Secrets:** API keys and credentials are held as environment secrets in the hosting platform, never committed to source control.
- **Card data:** never stored by Faresay — card details are tokenised by **Stripe** (PCI-DSS Level 1 provider).

## 2. Confidentiality

- **Access control:** access to production data is least-privilege and limited to personnel who require it. Authentication to the platform is handled by **Clerk** with support for strong passwords and multi-factor authentication.
- **Therapist–client isolation:** application-level authorisation ensures a Customer can access only their own clients, sessions and records.
- **Staff confidentiality:** all personnel with data access are bound by confidentiality obligations.
- **Background checks [target]:** appropriate vetting for any future staff with production access.

## 3. Integrity

- **Audit logging:** security-relevant events and administrative actions are logged.
- **Change control:** code changes go through version control (Git) and review before deploying to production; infrastructure is managed as code where practical.
- **Input validation:** server-side validation and rate-limiting on public endpoints (e.g. self-booking) to mitigate abuse and injection.
- **Dependency hygiene [target]:** automated dependency and vulnerability scanning.

## 4. Availability and resilience

- **Managed infrastructure:** hosting (Vercel) and database (Neon) are managed, redundant cloud services with provider-level high availability.
- **Backups:** the database provider maintains automated backups and point-in-time recovery.
- **Restore testing [target]:** periodic test of backup restoration.

## 5. Resilience and recovery (Art 32(1)(c))

- **Incident response:** a documented process to detect, triage, contain and notify on a Personal Data Breach, including the **48-hour** Customer-notification commitment in the DPA.
- **Business continuity [target]:** documented recovery objectives (RPO/RTO) as the service scales.

## 6. Testing and evaluation (Art 32(1)(d))

- **Review cadence:** TOMs and security posture reviewed at least annually.
- **Penetration testing [target]:** independent testing prior to, or shortly after, scaled launch.

## 7. Data minimisation and retention

- Only data necessary to run the practice is collected. Health data is recorded at the Customer's discretion.
- Retention and deletion follow the DPA (export window + deletion timeline) and the Privacy Policy (`pp-privacy-policy.md`).

## 8. Sub-processor security

- Sub-processors are selected for their security posture and bound by contractual data-protection obligations no less protective than the DPA. See Sub-processor List (`pp-sub-processors.md`).

## 9. Organisational measures

- **Data protection by design and default** is applied to new features (e.g. cookieless analytics; SMS used only for appointment reminders).
- **Policies:** this annex is supported by the Security & Data Protection Policy (`pp-security-data-protection-policy.md`), Clinical Governance Policy (`pp-clinical-governance-policy.md`) and Crisis & Safeguarding Policy (`pp-crisis-safeguarding-policy.md`).
- **ICO registration:** Faresay is registered (or registering) with the ICO and pays the data-protection fee. *ICO registration applied for 26 June 2026 — registration number to follow.*

---

*Draft prepared to support a UK launch. To be validated by a security specialist and data-protection solicitor before reliance.*
