# fair-do Legal Brief

**Prepared for:** Faresay Ltd founders (internal use)
**Date:** June 2026
**Platform:** fair-do.com — UK online tutoring marketplace

> **Disclaimer:** This document is an internal founders' brief compiled from desk research. It is not legal advice and does not create a solicitor-client relationship. Faresay Ltd must engage a qualified UK solicitor (ideally one specialising in technology, education, and data protection law) to review all platform documentation, contracts, and compliance policies before launch. Law and regulatory guidance change frequently; verify current positions with qualified counsel.

---

## Company structure

**Faresay Ltd trading as fair-do** is the correct legal structure. No new company registration is required. A UK company can lawfully trade under a different name from its registered name without registering a separate entity at Companies House. Trading names are not registered; only company names are.

**Practical implications:**

- Every piece of business communication that reaches customers — website footer, emails, invoices, booking confirmations, T&Cs, privacy policy — must display the full legal name and registration details alongside the trading name. The mandatory disclosure format under Companies Act 2006 ss.82–85 and the Company, Limited Liability Partnership and Business (Names and Trading Disclosures) Regulations 2015 is:

  > *Faresay Ltd, trading as fair-do | Company No. [XXXXXXX] | Registered in England and Wales | Registered office: [full address]*

- "fair-do" does not appear to contain any sensitive or restricted words (such as "Royal", "National", "Authority", or "Chartered") that would require Secretary of State approval.

**Bank account:** The existing Faresay Ltd bank account can be used for fair-do.com without opening a separate account. Notify the bank of the trading name as a matter of good practice (most business current accounts allow this with a simple notification). Ensure invoices and Stripe payouts reference the legal entity name Faresay Ltd.

**Trade mark:** The trading name "fair-do" receives no automatic legal protection. A UK trade mark application to the Intellectual Property Office (IPO) is strongly recommended before or shortly after launch, particularly given the risk of a competitor registering a similar name in class 41 (education and tutoring services). Cost is approximately £170 for one class (online application). Without registration, the platform's only recourse against copycat brands is the slow and expensive action for passing off.

---

## Data protection (UK GDPR)

**Governing law:** UK GDPR (as retained post-Brexit), the Data Protection Act 2018, and the Data (Use and Access) Act 2025 (in force from 5 February 2026, which added a seventh lawful basis — "recognised legitimate interest" — to UK GDPR Art. 6).

### Lawful bases for core processing

| Processing activity | Recommended lawful basis | Notes |
|---|---|---|
| Tutor and student/parent account data (name, email, contact) | Art. 6(1)(b) — contract performance | Necessary to perform the booking contract |
| Payment processing and transaction records | Art. 6(1)(b) — contract performance | Also required by Stripe KYC obligations |
| Lesson scheduling and booking history | Art. 6(1)(b) — contract performance | Core service delivery |
| Fraud prevention, platform security | Art. 6(1)(f) — legitimate interests | Document LIA; minimal data use |
| Dispute resolution, audit logs | Art. 6(1)(f) — legitimate interests | Document LIA |
| Marketing emails to existing customers | Art. 6(1)(f) — legitimate interests (soft opt-in, PECR reg. 22) | Existing customer relationship; easy unsubscribe mandatory |
| Marketing emails to new prospects | Art. 6(1)(a) — consent | Explicit opt-in required; pre-ticked boxes invalid |
| Non-essential cookies and analytics | Art. 6(1)(a) — consent | PECR requires consent; use cookie banner |
| Safeguarding records (incident reports) | Art. 6(1)(c) — legal obligation / Art. 6(1)(f) | Depends on specific record type |

**Art. 6(1)(b) scope warning:** ICO guidance is explicit that Art. 6(1)(b) covers only processing genuinely necessary to perform the contract. Behavioural profiling, recommendation algorithms beyond basic matching, or use of lesson content for platform analytics cannot rely on this basis — use legitimate interests (with LIA) or consent instead.

### Legitimate Interests Assessments (LIAs)

Wherever Art. 6(1)(f) is relied upon, a written LIA must be completed and retained. The LIA must: (1) identify the legitimate interest; (2) demonstrate the processing is necessary for that interest; (3) balance Faresay's interest against the data subject's reasonable expectations and rights. This is not a tick-box — it requires genuine analysis. ICO publishes a LIA template.

### Retention periods

Define and publish specific retention periods for each data category. Suggested starting points:

| Data category | Suggested retention period | Rationale |
|---|---|---|
| Active account data | Duration of account plus 30 days after deletion request | Contract performance |
| Transaction/payment records | 6 years from transaction date | Companies Act accounting records; HMRC requirement |
| Lesson transcripts and notes | 12 months after lesson, or until parent/student requests deletion (whichever is earlier) | Limited educational utility; data minimisation |
| DBS verification records | Date of check plus 3 years | Platform audit; data minimisation — record check number and date only, not certificate content |
| Safeguarding incident records | 7 years (or until subject's 25th birthday if incident relates to a minor, whichever is longer) | Aligned with school safeguarding record-keeping guidance |
| Marketing consent records | Until consent withdrawn plus 12 months | Evidence of lawful basis |

### Data minimisation

Collect only what is necessary for the stated purpose. In practice this means:

- Do not collect tutor's full home address unless required for Stripe KYC verification.
- Do not store lesson recordings by default — make recording an opt-in with explicit consent.
- For child accounts, collect only fields required to provide the service (name, year group, subjects); avoid collecting additional demographic data.
- For DBS records: store certificate number, issue date, and level of check only. Do not retain a copy of the certificate itself beyond the verification step.

---

## Special category data edge case

Under Art. 9 UK GDPR, "special category data" includes data revealing physical or mental health conditions, disabilities, or data about a person's specific vulnerabilities. Tutoring data is ordinarily **not** special category — scheduling, payment, and lesson history are ordinary personal data.

**The SEN edge case:** If a tutor works specifically with students who have Special Educational Needs (SEN) — dyslexia, ADHD, autism spectrum conditions, hearing/visual impairment — this can become Art. 9 data in two ways:

1. A tutor's profile lists "SEN specialist" or "ADHD support" as a subject area — this implies something about the students matched to them.
2. Lesson notes or parent notes shared via the platform describe a student's learning difficulty or disability.

**Consequence:** Processing Art. 9 data requires a separate explicit basis under Art. 9(2), most likely explicit consent (Art. 9(2)(a)) or, in limited cases, substantial public interest under DPA 2018 Schedule 1.

**Recommended mitigant:** The platform should treat this as a design constraint, not a documentation exercise:

- Do not store lesson content or notes at the platform level — let tutors and students manage their own records.
- The platform stores scheduling, payment, and communication metadata only.
- If subject labels (e.g., "SEN", "ADHD support") appear on tutor profiles or in search filters, treat this as a signal that the students matched are potentially in a sensitive category. Apply Art. 9 documentation and explicit consent requirements to any processing that links a specific student to such a subject area.
- Add a note to the privacy notice flagging this edge case and clarifying what Faresay does and does not store.

---

## Child safety and minor users

### UK GDPR Article 8 — digital consent age

The digital consent age in the UK is **13**. Children aged 13–17 can consent to their own data processing for digital services; children under 13 cannot — parental or guardian consent is required.

**Implementation requirements:**

- The sign-up flow must ask for date of birth.
- If the student is under 13: block account creation and require a parent/guardian to create the account on the child's behalf, providing their own consent.
- If the student is 13–17: allow registration with reduced-data defaults (see below) and without parental consent for GDPR purposes — but consider requiring a parent/guardian email for safeguarding notifications regardless (this is a separate, non-GDPR consideration).
- Adult accounts (18+): standard GDPR processing applies.

### ICO Age Appropriate Design Code (Children's Code)

The platform is clearly within scope of the ICO's Children's Code (DPA 2018, s.123), which applies to services "likely to be accessed by children." The platform explicitly markets to students including minors.

Key obligations:

- **Best interests default:** Privacy settings for child accounts must default to the most protective option. This is not optional.
- **No behavioural advertising or profiling of children.** Do not use a child's lesson history, search behaviour, or engagement data for commercial targeting — not even via third-party analytics platforms (including Google Analytics, Intercom, or similar tools if they receive child user data).
- **No nudge techniques:** No dark patterns designed to extend session time or increase data sharing for child users.
- **Geolocation off by default:** Do not collect precise location data from child accounts; if location is used at all (e.g., for matching to local tutors), use broad region only and set it off by default.
- **Data minimisation for children:** Stricter than for adults — collect only what is strictly necessary.

### Parent portal

The parent portal (allowing parents to see lesson transcripts and notes) is a genuine compliance feature, not just a product feature. Document it in the Children's Code compliance assessment as a mitigating control: parents can monitor lesson content, which reduces the risk of inappropriate activity going undetected.

**Data sharing with parents vs. student privacy:** For students aged 13–17, there is tension between parental oversight and the student's own data rights. Recommended approach: by default, parents can see scheduling and payment data; access to lesson notes and transcripts requires the student's own consent as well as the parent's (or an explicit platform policy disclosed at account creation). Take legal advice on the boundary before launch.

---

## Tutor onboarding and DBS

### January 2026 change — self-employed DBS access

A Statutory Instrument amending Part V of the Police Act 1997 came into force on **21 January 2026**, creating a new legal route for self-employed workers carrying out regulated activity with children to apply for an Enhanced DBS check (including the Children's Barred List) directly through a DBS Umbrella Body — without requiring an employer intermediary. Before this change, self-employed tutors could only obtain a Basic DBS check (no barred list check). This is a significant improvement to the safeguarding landscape for tutoring platforms.

### What level of DBS check is required

| Tutor type | DBS level required | Notes |
|---|---|---|
| Tutor working with under-18s (regular contact — same child 3+ times in 30 days) | Enhanced DBS + Children's Barred List check | Regulated activity — strongest check available |
| Tutor working with under-18s (occasional, one-off) | Enhanced DBS (no barred list mandatory, but recommended) | Platform should require barred list regardless |
| Adult-only tutor (university students, professionals, adults only) | Basic DBS check | No access to Children's Barred List in any case |

**Platform policy recommendation:** Require an Enhanced DBS with Children's Barred List as a condition of any tutor having access to under-18 student profiles, regardless of how "occasional" their tutoring is. The cost to the tutor is modest (currently £38 for Enhanced); the reputational and legal risk of not requiring it is not modest.

### Platform DBS obligations vs. tutor responsibility

Tutors are independent contractors. The legal obligation to obtain DBS clearance rests with the tutor personally (applying via an Umbrella Body). The platform does not employ tutors and is not required to process DBS applications on their behalf under the Safeguarding Vulnerable Groups Act 2006.

However, the platform must not simply take tutors at their word. Practical requirements:

1. **Verification at onboarding:** Require tutors to upload their Enhanced DBS certificate (or provide the certificate number and date). Verify currency — DBS certificates do not expire in law but should be renewed every three years or when a tutor's role changes materially.
2. **DBS Update Service:** Strongly encourage (or require as a condition of remaining on the platform) tutors to subscribe to the DBS Update Service (£16/year for tutors). This allows Faresay to perform real-time status checks against the certificate, so that if a tutor is added to a barred list after their certificate was issued, the platform will be informed. Without this, a certificate issued years ago provides limited current assurance.
3. **Audit log:** Maintain an internal record of: tutor name, DBS certificate number, issue date, level of check, date platform verified, date of last Update Service check. This log must be retained per GDPR (certificate number and dates are personal data — store securely, minimise access, apply retention schedule).
4. **Renewal reminders:** Send automated reminders at the two-year mark, prompting tutors to renew before the three-year recommended interval.

---

## Safeguarding

### Platform duty of care

The platform has an independent duty of care as the operator of a service that facilitates contact between adults and children for financial reward. This is not displaced by the fact that tutors are independent contractors. The duty arises in:

- Common law (negligence): a foreseeable risk of harm to identifiable children from the platform's operations.
- Online Safety Act 2023 (see below): statutory duty to assess and mitigate risks of harm to children on the service.
- ICO Children's Code: duty to prioritise children's best interests in service design.

### What the duty requires in practice

- **DBS verification** (see above) — the most important single safeguarding control.
- **Code of conduct for tutors:** Tutors must agree to a safeguarding code of conduct before going live, covering: all lessons via platform video (not WhatsApp, personal Zoom, etc.); no out-of-platform private messaging with students; parents may observe any lesson; camera must show only an appropriate background environment; no collection of students' personal contact details.
- **Reporting mechanism:** An in-platform reporting tool — accessible from within the lesson interface and the dashboard — for students, parents, and tutors to report safeguarding concerns. Reports must be triaged quickly (within one working day for serious concerns).
- **Designated Safeguarding Lead (DSL):** Appoint a named individual within Faresay Ltd as DSL. Not currently a legal requirement for private tutoring platforms (it is a legal requirement in schools), but strongly recommended. The DSL must know how to escalate concerns to statutory agencies: Local Authority Designated Officer (LADO) for allegations against adults working with children; police and children's services for immediate risk.
- **Published safeguarding policy:** Publish a Safeguarding and Child Protection Policy on the platform website. It must cover: how concerns are reported, escalation path to statutory agencies, record-keeping obligations, and staff/tutor training requirements.
- **Suspension authority:** The platform must reserve the right in its T&Cs to suspend or remove a tutor account immediately and without advance notice pending a safeguarding investigation. This must be enforceable — ensure it is clearly drafted in the tutor agreement.

### Online Safety Act 2023 — Ofcom obligations

fair-do.com is almost certainly within scope as a "user-to-user service" (tutors and students communicate via the platform). Ofcom's Protection of Children Codes of Practice came into force on **25 July 2025**.

Key obligations already in force:

- Complete a **children's risk assessment** at least annually — document the risks of harm to children from content and interactions on the service, and what mitigations are in place.
- Implement **highly effective age assurance** proportionate to the risk profile of the service.
- Apply **safe messaging defaults** for child accounts: strangers cannot initiate contact with a verified child account outside the structured lesson/booking context.
- Proactively identify and remove **illegal content** (including child sexual abuse material). Mandatory reporting to the National Crime Agency applies.
- Maintain an **accessible complaints mechanism** — signpost it clearly in the footer, help centre, and T&Cs.
- Ofcom enforcement: fines up to £18 million or 10% of global annual turnover (whichever is greater); criminal liability for senior managers for the most serious non-compliance.

---

## Tutor contractor status

### Independent contractor, not employee

Tutors are independent contractors. This must be established by both contractual terms and actual working practice — courts and HMRC look at the reality of the relationship, not just what the contract says.

**Key characteristics that support independent contractor status:**

| Factor | What the platform should do |
|---|---|
| Substitution | Tutor agreement must include a genuine right to send a substitute (qualified, with DBS clearance). Even if rarely exercised in practice, the contractual right matters. |
| Control | Platform sets quality standards and a code of conduct (acceptable for a marketplace), but does not dictate teaching methods, curriculum, lesson structure, or session content. |
| Mutual obligation | No obligation on the platform to offer bookings; no obligation on the tutor to accept them. Tutors can decline students; platforms can remove listings. This is the marketplace model. |
| Exclusivity | Tutors must be free to work for other platforms and private clients simultaneously. Do not include exclusivity clauses. |
| Equipment and insurance | Tutors use their own equipment. Professional indemnity insurance is the tutor's own responsibility (strongly recommend requiring it as a condition of onboarding). |
| Tax and National Insurance | Explicitly state in the tutor agreement that tutors are solely responsible for their own income tax, National Insurance contributions, and VAT compliance. |

**Worker status risk (Uber v Aslam [2021] UKSC 5):** The Supreme Court found Uber drivers were "workers" rather than independent contractors, entitling them to minimum wage and holiday pay. The determining factors were that Uber set prices, controlled the customer relationship, and restricted driver behaviour extensively. fair-do.com should be designed to avoid these characteristics — tutors set their own rates, own their student relationships, and have genuine autonomy over how they teach. Take specific legal advice on the tutor agreement before onboarding begins.

### IR35

IR35 (off-payroll working rules under Chapter 10 ITEPA 2003) applies only to workers who operate through a personal service company (PSC/limited company intermediary). The majority of private tutors trade as sole traders; IR35 does not apply to sole traders. Tutors who operate through limited companies should assess their own IR35 position using HMRC's CEST tool — this is their responsibility, not the platform's.

### Professional indemnity insurance

Require tutors to hold valid professional indemnity insurance as a condition of platform membership. Minimum recommended level: £1 million per claim. This protects both the tutor and reduces Faresay's exposure in the event of a claim arising from tutor conduct.

---

## Payments and financial regulation

### FCA authorisation

Under the Payment Services Regulations 2017 (implementing PSD2 in UK law), any business that collects, holds, or transfers funds on behalf of others must be FCA-authorised or registered as a Payment Services Provider (PSP). Operating without authorisation is a criminal offence.

**The platform avoids this requirement by using Stripe Connect correctly.** Stripe Payments UK Ltd holds FCA authorisation. Using Stripe Connect in the standard marketplace configuration means:

- Funds flow from the student/parent directly to the tutor's connected Stripe account.
- The platform receives its commission as an application fee deducted by Stripe from the payment before the tutor receives the net amount.
- Funds never sit in a Faresay-controlled account.
- Faresay does not execute payments, issue refunds, or hold funds in its own name.

Under this structure, Faresay is not providing regulated payment services and does not need its own FCA authorisation. The T&Cs must make clear that payment services are provided by Stripe Payments UK Ltd (FCA reference number: 900461) and that payment complaints should be directed to Stripe.

**Do not break this structure:** If the platform ever holds funds in a Faresay bank account before distributing to tutors (even briefly), this changes the analysis entirely and may require FCA authorisation. Seek advice before making any change to payment flows.

### VAT considerations

The platform itself should monitor its own VAT registration threshold (currently £90,000 rolling 12-month taxable turnover). Platform fees (commission, subscription fees) count toward this threshold.

**Tutor VAT:** Tutors who exceed the £90,000 VAT registration threshold must register for VAT themselves and charge VAT on their tutoring fees. The tutor agreement must make clear this is the tutor's own responsibility. Note: private tuition in a subject ordinarily taught in a school or university is VAT-exempt under VATA 1994 Sch.9 Group 6 if provided by an individual teacher acting in their own name — however, whether this exemption applies to tuition arranged through a marketplace is a nuanced question. Tutor should take their own VAT advice.

### Stripe platform fee structure

The recommended configuration is Stripe Connect with "destination charges" or "separate charges and transfers," with the platform fee collected via Stripe's application fee mechanism. This is a well-documented Stripe architecture; follow Stripe's current documentation carefully. Ensure the Stripe Connect agreement is in place and that tutor KYC requirements (Stripe requires identity verification for connected accounts receiving payouts) are collected during onboarding.

---

## Consumer rights

### Consumer Contracts (Information, Cancellation and Additional Charges) Regulations 2013

These Regulations apply to all distance contracts (including online bookings) where the customer is a consumer. Both subscriptions (e.g., Pro/bundle plans) and individual lesson bookings are affected.

**14-day cooling-off right:**

- Consumers have 14 days from contract conclusion to cancel without penalty.
- For lesson subscriptions or bundle packages: the 14-day right applies to the package.
- For individual lessons: if the consumer requests the lesson starts within the 14-day window, they retain the right to cancel but must pay proportionately for any service already delivered. If the lesson is fully delivered within the 14 days and the consumer explicitly acknowledged in writing that they would lose the right to cancel upon full performance, the right is extinguished.

**Required design action:** The booking confirmation flow must include an explicit acknowledgement checkbox:

> *"I understand I am requesting this lesson to start within my 14-day cancellation period, and that if the lesson is fully completed, I will lose my right to cancel this booking. [Confirm]*"

This acknowledgement must be active (checked by the user), not pre-ticked, and must appear before payment is confirmed.

**Pre-contract information:** Before payment, display: lesson description, tutor name, total price (inclusive of any VAT or fees), identity of the trader (Faresay Ltd trading as fair-do), and how to exercise cancellation rights. Email confirmation constitutes the required "durable medium."

**Refund timeline:** Refunds following a valid cancellation must be issued within 14 days of the cancellation. Configure Stripe refunds to be triggered automatically (or with minimal manual intervention) within this window.

**Lesson cancellation policy:** A separate, tutor-facing cancellation policy should specify: minimum notice period for lesson cancellation (e.g., 24 hours); consequences of late cancellation (partial fee retention); and what happens if the tutor cancels (full refund to student). This must be visible to the student before booking.

**Consumer Rights Act 2015:** Services must be performed with reasonable care and skill. If a tutor delivers a lesson that is materially below the standard a reasonable consumer would expect, the student/parent has a right to a repeat performance or, if that is not possible, a price reduction. The T&Cs must not attempt to exclude these statutory rights.

---

## Intellectual property

### Who owns lesson content?

Under the Copyright, Designs and Patents Act 1988, copyright in original works (lesson notes, study materials, worksheets, recordings) vests in the author at the moment of creation. Copyright ownership, as between tutors and students:

- **Tutor-created materials** (worksheets, presentations, notes prepared by the tutor): owned by the tutor.
- **Student-created materials** (essays, notes taken during lessons, written work): owned by the student (or, if under 18, the student — copyright is not affected by age).
- **Lesson recordings:** Jointly created content — complex ownership. The simplest approach is a contractual assignment or licence at the point of consent to record.

### What Faresay needs from users

The platform must not display, store, or make available any user content without a licence. The T&Cs must include:

- A licence grant from tutors to Faresay Ltd: non-exclusive, royalty-free, worldwide licence to reproduce, store, display, and transmit tutor-created content (including profiles, sample materials, and lesson-related content) to the extent necessary to operate the platform.
- An equivalent licence grant from students/parents covering content they submit (reviews, feedback, lesson notes shared via the platform).
- Both licences should terminate when the account is deleted (subject to Faresay's data retention obligations).

### No AI training on lesson content

The T&Cs must explicitly state that Faresay Ltd will not use lesson recordings, transcripts, or lesson notes to train AI models without separate, explicit, informed consent from both the tutor and the student/parent. This is both a legal safeguard (UK GDPR and Copyright Act considerations) and a strong trust signal to a market that is rightly sensitive about lesson content confidentiality.

### Lesson recordings — consent

Recording a lesson without the consent of all participants is unlawful (Regulation of Investigatory Powers Act 2000; UK GDPR). Consent must be:

- Obtained from the tutor and from the parent/guardian (for minor students) before each recorded lesson, or via a clear opt-in setting applied to all lessons.
- Granular: separate consent for (a) the student's own access to their recording; (b) the parent's access; (c) any dispute resolution use by Faresay.
- Revocable: users must be able to opt out of recording, and existing recordings must be deleted on request (subject to a legitimate interests retention period for safeguarding purposes).

---

## Terms of Service checklist

The platform T&Cs must cover all of the following:

1. **Parties and nature of the relationship:** Faresay Ltd (trading as fair-do) is a marketplace facilitator connecting independent tutors with students/parents. Faresay is not an employer of tutors, not a party to the lesson contract between tutor and student, and not a provider of education.
2. **Tutor independent contractor status:** Tutors are independent contractors; they are solely responsible for their own tax, National Insurance, insurance, DBS clearance, and professional obligations.
3. **Consumer cancellation rights:** 14-day cooling-off period; early commencement acknowledgement; lesson cancellation policy; refund timeframe.
4. **Payment terms:** Payment processed by Stripe Payments UK Ltd; platform fee disclosed; payout timing to tutors; what happens to funds if a lesson is cancelled.
5. **IP licence grants:** Tutor and student/parent licences (as described above); platform IP ownership; no AI training without consent.
6. **Lesson recordings:** Consent required; ownership; retention and deletion policy.
7. **DBS and safeguarding:** Tutors represent and warrant they hold a valid Enhanced DBS certificate before accepting any under-18 bookings; obligation to notify platform immediately if status changes; platform's right to suspend pending safeguarding investigation.
8. **User-generated content and reviews:** Platform's right to moderate and remove content that is defamatory, false, or otherwise unlawful; obligation not to suppress genuine negative reviews; review authenticity policy.
9. **Acceptable use and conduct:** Online safety code of conduct for tutors; no out-of-platform contact with students; no recording without consent; no sharing of student personal data.
10. **Account suspension and termination:** Platform's right to suspend or terminate immediately for safeguarding concerns, fraud, or material breach; no liability to suspended users during investigation.
11. **Limitation of liability:** Faresay's liability limited to the fees paid for the booking in question; no liability for tutor conduct (correctly placed on the tutor); no exclusion of liability for death, personal injury, or fraud. Note: liability limitation clauses are subject to Consumer Rights Act 2015 fairness test for consumer-facing T&Cs.
12. **Governing law and jurisdiction:** English law; courts of England and Wales.

---

## Privacy policy checklist

The privacy policy must be published at or before the point of data collection and must cover:

1. **Identity and contact details of the data controller:** Faresay Ltd, registered address, DPO contact (or nominated privacy contact) email address.
2. **What personal data is collected:** Explicitly list categories — contact information, payment data (note: full card details are held by Stripe, not Faresay), booking history, lesson metadata, DBS check details (tutors), age/date of birth (students), parental consent records.
3. **Lawful basis for each category of processing:** Map each processing activity to its Art. 6 basis (and Art. 9 basis where applicable). Do not use a single basis for all processing.
4. **How data is used:** Be specific — e.g., "to match students with tutors," "to process payments via Stripe," "to verify tutor DBS clearance," "to send booking confirmation emails."
5. **Third-party data sharing:** Name each third party and what data is shared: Stripe (payment processing), video platform provider (lesson delivery), Clerk or similar (authentication), analytics providers. For each, state the basis for sharing and whether data is transferred outside the UK.
6. **International transfers:** If any data is transferred outside the UK (e.g., US-based SaaS providers), document the transfer mechanism (adequacy decision, SCCs with UK Addendum, or other).
7. **Retention periods:** Specific periods for each data category (see table above).
8. **Data subject rights:** List all rights under UK GDPR: access, rectification, erasure, restriction, portability, objection, right to withdraw consent, right to complain to ICO. Provide a mechanism to exercise each right.
9. **Children's data:** Separate section explaining age gate, parental consent for under-13s, and reduced data collection for 13–17 year olds.
10. **Cookies:** Either in the privacy policy or a separate cookie policy: list all cookies set, their purpose, duration, and whether third-party; link to cookie consent mechanism.

---

## ICO and regulatory registrations

### ICO registration — mandatory before launch

Faresay Ltd must register with the Information Commissioner's Office as a data controller and pay the annual data protection fee. Failure to register is a **criminal offence** under s.137 DPA 2018.

| Detail | Information |
|---|---|
| Registration portal | ico.org.uk/registration |
| Time required | Approximately 15 minutes |
| Annual fee (Tier 1: under £632k turnover or fewer than 10 staff) | £52/year (£47 by Direct Debit) |
| What to register | Faresay Ltd as data controller; fair-do.com as the processing activity |
| When to register | Before any personal data is collected — including during beta testing |

Faresay Ltd may already be registered as a data controller for the Faresay therapy platform. If so, the registration should be updated to include fair-do.com processing activities rather than re-registering. Check the ICO register for the current registration status.

### No Ofsted registration required

Online-only tutoring marketplaces with no physical teaching premises are not required to register with Ofsted. The 20-hour threshold that triggers Ofsted registration applies to physical tuition centres. No action needed.

### FCA — no registration required

As noted above, using Stripe Connect correctly means Faresay does not itself provide regulated payment services. No FCA registration or authorisation is required.

### Companies House — no action required

No new company registration is needed. Check that the existing Faresay Ltd filing obligations (confirmation statement, annual accounts) are current.

---

## Recommended next steps

Prioritised pre-launch checklist:

1. **ICO registration** — register or update existing registration before any beta data is collected. Criminal liability attaches to the company and potentially to directors personally.

2. **Engage a UK solicitor** — instruct a solicitor with technology and education law experience to: (a) draft or review the tutor independent contractor agreement; (b) draft or review the consumer-facing T&Cs; (c) review the privacy policy; (d) advise on the Children's Code compliance approach. Budget £3,000–£8,000 for a competent review of these documents.

3. **Data processing agreements (DPAs):** Enter into UK GDPR-compliant data processing agreements with every third-party processor that handles personal data on Faresay's behalf:
   - **Stripe** — Stripe's DPA is available online; review and accept via the Stripe Dashboard.
   - **Video platform** (e.g., Daily.co or equivalent) — obtain and sign a DPA before any lessons go live.
   - **Authentication provider** (e.g., Clerk) — obtain and sign a DPA.
   - **Analytics/monitoring tools** — for each tool receiving user data, obtain a DPA and confirm transfer mechanism for US-based providers.

4. **Cookie consent implementation:** Implement a UK PECR-compliant cookie consent banner before launch. Non-essential cookies (analytics, marketing pixels) must not fire before consent is given. Use a consent management platform (CMP) — OneTrust, Cookiebot, or similar. This is an ICO enforcement priority.

5. **Age gate and parental consent flow:** Design and build the under-13 parental consent flow before accepting any registrations. This is a Children's Code requirement that cannot be retrofitted after launch.

6. **Safeguarding policy:** Draft and publish the Safeguarding and Child Protection Policy, appoint a DSL, and build the in-platform reporting tool. Consider a brief safeguarding awareness session for any Faresay staff who will be reviewing reports.

7. **Stripe Connect configuration:** Confirm the payment flow architecture with a Stripe integration engineer before go-live. Specifically confirm that: (a) funds never enter a Faresay-controlled account; (b) the application fee mechanism is correctly configured; (c) tutor KYC/identity verification is collected during onboarding.

8. **Tutor agreement:** Draft the independent contractor agreement with the substitution clause, IR35 guidance note, tax responsibility clause, DBS requirement, professional indemnity insurance requirement, and safeguarding code of conduct incorporated or annexed.

9. **Online Safety Act compliance file:** Create and retain a children's risk assessment document before 25 July 2025 (already past — this should be done immediately). Ofcom can request evidence of risk assessment; absence of documentation is itself an enforcement risk.

10. **Trade mark application:** File a UK trade mark application for "fair-do" at the IPO in class 41 (education, tutoring). This can follow the solicitor engagement rather than precede launch, but should not be delayed beyond three months post-launch given the risk of prior use claims by others.

---

*Last updated: June 2026. Review this brief with legal counsel before launch and re-review following any material change in applicable law or platform features.*
