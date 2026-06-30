# US Legal — New York first, then full coverage

> Not legal advice. A checklist of requirements + how to **trigger** each, to make a US education / child-safety attorney engagement efficient. US law is state-specific, with a federal overlay for children's data (COPPA) — confirm everything with counsel.

## The single most important question (raise first)
**Proprietary-school / private-tutoring licensing.** Several US states license or register businesses that *provide* instruction. In NY, the State Education Department's **Bureau of Proprietary School Supervision (BPSS)** licenses certain private schools and supplemental-instruction providers. **Decision (confirmed):** fair-do is a **facilitator marketplace** — tutors are independent contractors who set their own fees and own their teaching materials, and fair-do takes a service fee. On that basis fair-do is **not** an educational institution and does **not** require BPSS or any NY private-school/tutoring licence, and **private tutors do not need a state licence** to tutor. The structure is built to keep fair-do out of the “educational institution” classification. (Have NY counsel re-confirm at incorporation, but proceed on this basis.)

## NY launch — requirements
### 1. Tutor credentials (NY)
- Private tutoring in NY does **not** generally require a state licence to practise — unlike regulated mental-health clinicians. NY **teacher certification** (issued by the NYS Education Department, NYSED) governs *public-school* teaching, not private tutoring. **Confirmed:** there is no NY statutory licensure requirement for private/online tutors.
- fair-do's credential bar (e.g. requiring state teaching certification, a degree, or a subject qualification) is therefore a **platform safeguarding/quality choice**, not a statutory licence requirement. Decide the minimum bar and apply it consistently.
- Where a tutor *does* hold NY teacher certification, **verify** it against the NYSED **TEACH** system / certification lookup before approval (manual v1). Keep the audit trail (we already log CredentialCheck).
- The **non-negotiable** US safeguarding gate is **background screening**: the US analogue of the UK DBS check. `[LEGAL] confirm` the applicable NY criminal-history/background-check route for independent adults tutoring minors online, and whether any state sex-offender-registry check is required.

### 2. Federal — children's data (COPPA)
- HIPAA does **not** apply — fair-do is not a healthcare covered entity and tutoring data is not PHI. `[LEGAL] confirm` no HIPAA nexus exists (none expected for general tutoring).
- **COPPA** (Children's Online Privacy Protection Act) applies to online services that collect personal information from children **under 13**. Core requirements: a COPPA-compliant **privacy notice**, **direct notice to parents**, and **verifiable parental consent** before collecting an under-13's data; data minimisation; and parental access/deletion rights.
- **Vendor data terms:** sign data-processing terms with every vendor that handles student (especially children's) data — Stripe, Daily.co, Neon, Clerk, Resend, Cloudinary — binding each to COPPA / student-privacy obligations. This replaces the HIPAA BAA model; there is no exact "BAA" equivalent. `[LEGAL] confirm` the correct contractual mechanism per vendor.
- Reasonable **data security** (encryption, access controls — largely in place).

### 3. NY state privacy / records
- **NY SHIELD Act** — data-security requirements for NY residents' private information (applies regardless of sector).
- **NY Education Law §2-d** + Part 121 regulations — student-data privacy and security; primarily bind schools and their contractors. `[LEGAL] confirm` whether a private tutoring marketplace falls within §2-d (it may not, if fair-do is not contracting with a school/district) — and what applies if fair-do later sells into schools.
- **Special-needs / IEP data** — if a tutor supports a student with a disability or special educational need, that information is sensitive: treat it as restricted and obtain explicit parental consent. This is the tutoring analogue of the stricter clinical-records rules; there is no direct **42 CFR Part 2** equivalent. `[LEGAL] confirm` handling, and avoid storing such data at platform level in v1 if possible.

### 4. Online-lesson & parental consent
- For **minor students**, obtain **verifiable parental/guardian consent** before lessons and before collecting a child's data (mirrors the UK parental-consent pattern and satisfies COPPA for under-13s). Counsel to provide wording.
- Add a consent step covering: online (video) lesson delivery, recording (if any), and parental oversight rights. `[LEGAL] confirm` NY-specific wording.

### 5. Entity, banking, payments
- **US entity** — commonly a **Delaware LLC** (then foreign-qualify in NY) or a **NY LLC**. Needs a **registered agent**.
- **EIN** from the IRS → **US business bank account** → **Stripe US** + **Stripe Connect** for US tutor payouts (private-pay only v1; **no** school-district contracts or public/Title-I funding, which carry extra compliance).

### 6. Safeguarding / child safety
- fair-do is **not** a crisis or welfare service, but it owes a **duty of care to minor students**. Keep US distress signposting (**988** Suicide & Crisis Lifeline + Crisis Text Line, already in lib/locale for US) for users who need it — same signposting model as UK.
- **Mandated-reporter / child-abuse reporting:** `[LEGAL] confirm` NY (and per-state) rules on reporting suspected child abuse, and whether fair-do or its tutors are mandated reporters — and define fair-do's internal reporting path either way.
- **Background screening** for tutors working with minors (see §1).

### 7. Other
- **Minors are core users.** fair-do serves under-18 students, so build for parental consent and minor safety rather than an 18+ gate. `[LEGAL] confirm` any NY age/consent specifics.
- **No false/deceptive claims** in marketing (FTC).
- **Sales tax:** tutoring/educational instruction is generally **not** subject to NY sales tax (confirm). Entity owes federal + NY income/franchise tax.

## How to TRIGGER each (action → who/where)
| Requirement | Action to start it |
|---|---|
| Licensing/structure decision + NY docs | **Engage a US education / child-safety attorney admitted in NY.** This unlocks most of the list — they confirm whether any NY proprietary-school/tutoring licensure applies, draft NY T&Cs, parental-consent / COPPA notices, and the US tutor agreement. |
| US entity | Formation agent (Stripe Atlas / Clerky / Firstbase) → Delaware LLC + registered agent → **EIN** (IRS, free) → foreign-qualify in NY. |
| US bank + payments | Open US business bank (Mercury/Brex/traditional) → **Stripe US** account → enable Connect → confirm student-data terms. |
| Vendor data terms | Request COPPA / student-privacy data-processing terms from each vendor (Stripe, Daily.co, Neon, Clerk, Resend, Cloudinary). |
| Tutor credential check | Use NYSED **TEACH** lookup where a tutor claims NY certification; apply fair-do's credential + background-check bar to each applicant (manual now; explore a verification vendor later). |
| Privacy registration | None federally except COPPA; NY SHIELD + (possibly) Education Law §2-d govern. (No US "ICO registration".) |

## Full US coverage — the scaling framework
Each new state is a repeat of the NY pattern. To add a state:
1. Confirm that state's **background-check rules**, any **private-school/tutoring licensure**, and **student-data-privacy laws** with counsel.
2. Confirm Stripe payouts + tax treatment in that state.
3. Add the state code to **`LAUNCH_US_STATES`** (or `NEXT_PUBLIC_ACTIVE_US_STATES`) — onboarding + matching open up automatically.
4. Recruit tutors in that state (and run background checks).

**Accelerators for multi-state scale:**
- **Interstate Teacher Mobility Compact** — a multi-state compact easing recognition of teacher licences across member states. Relevant **only** for tutors who hold (and rely on) a state teaching licence. Since private tutoring generally does **not** require state licensure, treat this as a recruiting/marketing signal rather than a hard requirement. `[LEGAL] confirm` its relevance to fair-do's model.
- Unlike regulated therapy, a private tutor usually needs **no** state licence to teach a private student across state lines — so US tutoring matching is far **less** state-locked than therapy. The harder per-state variable is **background-check and student-data law**, not professional licensure.
- Model: store each tutor's certifications / eligible states where relevant (today `licenseState` is single — extend to an array only if state-specific gating proves necessary) and match accordingly.

## Build note (for when we scale past NY)
- `Teacher.licenseState` is currently a single string (NY launch). If state-specific gating proves necessary (e.g. a state that *does* require licensure, or state-scoped background-check rules), migrate to `licenseStates String[]` and match on `student.usState ∈ teacher.licenseStates`. Flagged in code; trivial migration when needed. **Note:** for most private tutoring, hard state-scoping may not be legally required at all — `[LEGAL] confirm` before building state locks.
