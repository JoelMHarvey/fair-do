> ⚠️ DRAFT v0.1 — for UK legal counsel review. NOT legal advice. Counsel must finalise before use. Last updated: 26 June 2026

# Faresay Practice Portal — Data Processing Agreement (UK GDPR, Article 28)

This Data Processing Agreement (the "**DPA**") forms part of, and is incorporated into, the Faresay Practice Portal Subscription Terms of Service (`pp-terms-of-service.md`) (the "**Agreement**") between Faresay and the Customer. It sets out the terms on which Faresay processes personal data on the Customer's behalf in connection with the Service, as required by **Article 28 of the UK GDPR**.

In this DPA:

- **"Controller"** means the **Customer** — the mental-health professional or practice that subscribes to the Service and determines the purposes and means of processing its clients' personal data.
- **"Processor"** means **Faresay** — Faresay Ltd, company number 17302034, registered office 167-169 Great Portland Street, London W1W 5PF — which processes that personal data on the Controller's behalf.
- **"Client Personal Data"** means personal data of the Controller's clients (and other individuals whose data the Controller processes through the Service) that Faresay processes on the Controller's behalf.
- **"Data Protection Law"** means the **UK GDPR**, the **Data Protection Act 2018**, and any other applicable UK data-protection law, together with guidance and codes issued by the Information Commissioner's Office (**ICO**).
- **"Sub-processor"** means any third party engaged by Faresay to process Client Personal Data.
- Terms such as "personal data", "processing", "data subject", "controller", "processor", "special category data", and "personal data breach" have the meanings given in the UK GDPR.

Where the Controller and Faresay roles differ for account, billing, and product-usage data (for which Faresay is an independent controller), that processing is governed by the Privacy Policy (`pp-privacy-policy.md`), not this DPA.

> ⚠️ COUNSEL / DPO — Confirm the controller/processor mapping, that this DPA is executed before any real Client Personal Data is processed, and that it meets all Article 28(3) requirements. See `pp-uk-legal-brief.md`.

---

## 1. Roles and scope

1.1 The parties agree that, in respect of Client Personal Data, the **Controller is the Customer** and the **Processor is Faresay**. Faresay processes Client Personal Data only to provide the Service and only as a processor on the Controller's behalf.

1.2 The Controller is responsible for establishing a **lawful basis** (and, for special-category data, an **Article 9 condition**) for the processing, for the lawfulness of its instructions, and for the rights and freedoms of data subjects. Faresay does not determine the purposes or essential means of processing Client Personal Data.

1.3 This DPA applies for as long as Faresay processes Client Personal Data on the Controller's behalf (the "**Term**"), and survives termination of the Agreement to the extent Faresay retains any Client Personal Data.

---

## 2. Details of processing (Article 28(3) and Annex A)

The required particulars are set out in **Annex A** and summarised here:

2.1 **Subject-matter:** the provision of the Faresay practice-portal Service to the Controller.

2.2 **Duration:** the Term (clause 1.3) — for as long as the Controller subscribes and until deletion or return under Section 11.

2.3 **Nature and purpose:** hosting, storage, organisation, retrieval, transmission, and processing of Client Personal Data to enable the Controller to manage clients, schedule appointments, deliver secure video sessions, take card payments, send reminders/notifications, and keep practice records.

2.4 **Types of personal data:** including client identity and contact details, appointment and scheduling data, communications/notes the Controller records, billing and payment metadata, and — critically — **special-category health data** (information relating to the client's mental and physical health and care).

2.5 **Categories of data subjects:** the Controller's **clients** (including clients added by the Controller who do not themselves log in, where the Controller asserts a lawful basis on their behalf), and other individuals whose data the Controller chooses to process through the Service (for example client emergency contacts).

---

## 3. Processing only on documented instructions

3.1 Faresay will process Client Personal Data **only on the documented instructions** of the Controller, including with regard to international transfers, unless required to do otherwise by UK law (in which case Faresay will inform the Controller of that legal requirement before processing, unless the law prohibits it on important grounds of public interest).

3.2 The Controller's instructions are: (a) the Agreement and this DPA; (b) the Controller's use and configuration of the Service; and (c) any further written instructions agreed by the parties. Faresay will not use Client Personal Data for its own purposes.

3.3 Faresay will inform the Controller without undue delay if, in its opinion, an instruction infringes Data Protection Law (without obligation to provide legal advice).

---

## 4. Confidentiality

4.1 Faresay will ensure that persons authorised to process Client Personal Data are bound by an appropriate **duty of confidentiality** (contractual or statutory) and process the data only as necessary to perform Faresay's obligations.

4.2 Faresay will limit access to Client Personal Data to personnel who need it to provide the Service, and will ensure they are trained on their data-protection and confidentiality obligations.

---

## 5. Security (Article 32)

5.1 Faresay will implement appropriate **technical and organisational measures** to ensure a level of security appropriate to the risk, taking account of the special-category nature of the data, including as appropriate:

- encryption of Client Personal Data in transit and at rest;
- measures to ensure ongoing confidentiality, integrity, availability, and resilience of processing systems;
- the ability to restore availability and access in a timely manner after an incident (backups and recovery);
- access controls, authentication, logging, and least-privilege principles; and
- a process for regularly testing and evaluating the effectiveness of these measures.

5.2 The current security measures are described in **Annex B** and in the Security & Data Protection Policy (`pp-security-data-protection-policy.md`). Faresay may update them provided the level of security is not materially reduced.

> ⚠️ COUNSEL — The Article 32 measures for special-category health data are a high bar and non-negotiable. Confirm Annex B reflects the actual implemented controls (encryption, residency, access control, backups, pen-testing) before use.

---

## 6. Sub-processors

6.1 **General authorisation.** The Controller provides **general written authorisation** for Faresay to engage Sub-processors to process Client Personal Data, subject to this Section. The Sub-processors authorised at the date of this DPA are listed in **Annex C**:

| Sub-processor | Purpose | Location | Transfer mechanism (if outside UK) |
|---|---|---|---|
| **Clerk** | Authentication / identity & account management | [PLACEHOLDER: e.g. US] | UK IDTA / UK Addendum to SCCs [PLACEHOLDER: confirm] |
| **Daily.co** | Secure video sessions | [PLACEHOLDER: e.g. US] | UK IDTA / UK Addendum to SCCs [PLACEHOLDER: confirm] |
| **Resend** | Transactional email (reminders/notifications) | [PLACEHOLDER: e.g. US] | UK IDTA / UK Addendum to SCCs [PLACEHOLDER: confirm] |
| **Neon** | Database hosting (practice/client data) | [PLACEHOLDER: confirm EU/UK region] | [PLACEHOLDER: confirm region; IDTA only if non-UK] |
| **Stripe** | Card-payment processing | [PLACEHOLDER] | [PLACEHOLDER: note Stripe may act as an independent controller for payments — confirm] |

> ⚠️ COUNSEL — Confirm each Sub-processor's processing region and the correct transfer mechanism for any non-UK leg, and confirm Stripe's role (processor vs independent controller for payment data) is correctly characterised and carved out where appropriate.

6.2 **Flow-down.** Faresay will impose on each Sub-processor, by written contract, data-protection obligations **no less protective** than those in this DPA, in particular the Article 28(3) and Article 32 requirements. Faresay remains **fully liable** to the Controller for any Sub-processor's failure to fulfil its data-protection obligations.

6.3 **Change notice.** Faresay will give the Controller **prior notice** (at least **[PLACEHOLDER: e.g. 14 days']**) of any intended addition or replacement of a Sub-processor, giving the Controller the opportunity to **object on reasonable data-protection grounds**. If the Controller objects and the parties cannot resolve the objection, the Controller may terminate the affected Service in accordance with the Agreement.

---

## 7. International transfers

7.1 Faresay will not transfer Client Personal Data outside the United Kingdom except in accordance with the Controller's instructions (clause 3.1) and a **valid transfer mechanism** under Data Protection Law, namely an **adequacy regulation**, the **UK International Data Transfer Agreement (IDTA)**, the **UK Addendum to the EU Standard Contractual Clauses**, or another lawful mechanism, together with any transfer risk assessment and supplementary measures required.

7.2 Where Faresay engages a non-UK Sub-processor (Annex C), Faresay will ensure an appropriate transfer mechanism is in place for that transfer.

7.3 The Controller authorises the transfers described in Annex C on the basis of the mechanisms stated there, as updated under Section 6.

> ⚠️ COUNSEL — Confirm the transfer mechanism and any transfer risk assessment for each non-UK Sub-processor (Clerk, Daily.co, Resend, and Neon if non-UK). Prefer UK/EU data residency for Neon where possible.

---

## 8. Assistance to the Controller

8.1 **Data-subject requests.** Taking account of the nature of the processing, Faresay will assist the Controller by **appropriate technical and organisational measures**, insofar as possible, to respond to requests from data subjects exercising their rights (access, rectification, erasure, restriction, portability, objection). If Faresay receives such a request directly from a data subject, it will not respond except on the Controller's instruction, and will promptly notify the Controller.

8.2 **Other Article 28(3)(f) assistance.** Taking account of the nature of processing and the information available to it, Faresay will assist the Controller in ensuring compliance with its obligations under Articles 32–36 of the UK GDPR, including: security of processing; **personal-data breach** notification and communication; **data protection impact assessments (DPIAs)**; and prior consultation with, and other queries from, the **ICO** or any other regulator.

8.3 Faresay may charge a reasonable fee for assistance that goes materially beyond what is required to provide the Service, on prior notice.

---

## 9. Personal-data breach notification

9.1 Faresay will notify the Controller **without undue delay** after becoming aware of a personal-data breach affecting Client Personal Data, and in any event within **[PLACEHOLDER: e.g. 48 hours]** of becoming aware.

9.2 The notification will, to the extent known, describe: the nature of the breach (including categories and approximate numbers of data subjects and records affected); the likely consequences; the measures taken or proposed to address it and mitigate its effects; and a contact point for further information. Faresay will provide further information in phases as it becomes available.

9.3 The Controller, as controller, is responsible for any notification to the **ICO** and to affected data subjects required under Articles 33–34 of the UK GDPR. Faresay will provide reasonable assistance (clause 8.2).

---

## 10. Audit and records

10.1 Faresay will make available to the Controller all information **reasonably necessary to demonstrate compliance** with the obligations in Article 28 and this DPA.

10.2 Faresay will allow for and contribute to **audits**, including inspections, conducted by the Controller or an auditor it mandates, subject to: reasonable prior notice (at least **[PLACEHOLDER: e.g. 30 days]** except where required sooner by the ICO); frequency of no more than **[PLACEHOLDER: e.g. once per year]** except where required by a regulator or following a breach; conduct during business hours, with minimal disruption and appropriate confidentiality; and the Controller bearing its own costs. Faresay may satisfy audit requests by providing **current third-party certifications or audit reports** (for example SOC 2 / ISO 27001) where these reasonably address the request.

10.3 Faresay will maintain records of processing carried out on behalf of the Controller as required by Article 30(2).

---

## 11. Deletion or return on termination

11.1 On termination or expiry of the Agreement, Faresay will, **at the Controller's choice**, **delete or return** all Client Personal Data, and delete existing copies, unless UK law requires continued storage.

11.2 The Controller may **export** its Client Personal Data through the Service during the Term and for **[PLACEHOLDER: e.g. 30 days]** after termination. After that export window, Faresay will delete Client Personal Data within **[PLACEHOLDER: e.g. a further 30 days]**, subject to clause 11.1.

11.3 Faresay may retain Client Personal Data to the extent, and for the period, required by UK law, and will continue to protect it under this DPA for so long as it is retained.

> ⚠️ COUNSEL / ⚠️ CLINICAL — The Controller remains responsible for retaining the clinical record for its professional retention period; confirm the export window gives the Controller sufficient time to take its records before deletion.

---

## 12. Liability

12.1 Each party's liability under or in connection with this DPA is subject to the limitations and exclusions of liability set out in the Agreement (`pp-terms-of-service.md`, Section 11), except to the extent Data Protection Law requires otherwise.

12.2 Liability as between the parties reflects each party's role: the Controller is responsible for the lawfulness of the processing, its instructions, lawful basis, consent, and data-subject rights; Faresay is responsible for processing in accordance with this DPA and Data Protection Law obligations applicable to processors. Each party will indemnify the other for losses arising from its own breach of this DPA or of Data Protection Law applicable to its role, subject to clause 12.1.

> ⚠️ COUNSEL — Confirm the per-role liability/indemnity split and its interaction with Article 82 UK GDPR (which can make either party liable to data subjects regardless of contractual allocation) and with the Agreement's liability cap.

---

## 13. General

13.1 This DPA forms part of the Agreement. In the event of conflict between this DPA and the rest of the Agreement **on a data-protection matter**, this DPA prevails. In the event of conflict between this DPA and an applicable Standard Contractual Clauses / IDTA mechanism, that mechanism prevails to the extent of the conflict.

13.2 This DPA is governed by the **laws of England & Wales**, and the courts of **England & Wales** have exclusive jurisdiction, consistent with the Agreement.

13.3 Faresay may update this DPA on reasonable notice to reflect changes in Data Protection Law, regulatory guidance, or Sub-processors, provided no update materially reduces the protection of Client Personal Data.

---

## Annex A — Details of processing

- **Controller:** the Customer (mental-health professional / practice) — [PLACEHOLDER: captured at onboarding].
- **Processor:** Faresay — Faresay Ltd.
- **Subject-matter:** provision of the Faresay practice-portal Service.
- **Duration:** the Term (clause 1.3).
- **Nature and purpose:** practice management — client records, scheduling, secure video, card payments, reminders/notifications.
- **Types of personal data:** identity and contact details; appointment/scheduling data; client communications and notes; billing/payment metadata; **special-category health data**.
- **Categories of data subjects:** the Controller's clients (including non-logging-in clients), and related individuals (e.g. emergency contacts).

> ⚠️ COUNSEL — Finalise Annex A against the actual data captured in the Service.

## Annex B — Technical and organisational security measures (Article 32)

[PLACEHOLDER: summarise the implemented controls — encryption in transit/at rest, data residency, access control and authentication, logging and monitoring, backups and recovery, vulnerability management and penetration testing, personnel training, incident response. Cross-reference `pp-security-data-protection-policy.md`.]

## Annex C — Authorised Sub-processors

As listed in clause 6.1. [PLACEHOLDER: maintain a current, dated Sub-processor list, with purpose, location, and transfer mechanism for each — Clerk, Daily.co, Resend, Neon, Stripe.]

---

*End of draft. ⚠️ This document is a v0.1 first draft for UK legal counsel review and is not legal advice. Counsel must finalise before use.*
