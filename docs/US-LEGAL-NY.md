# US Legal — New York first, then full coverage

> Not legal advice. A checklist of requirements + how to **trigger** each, to make a US healthcare-attorney engagement efficient. US law is state-specific and federal (HIPAA) — confirm everything with counsel.

## The single most important question (raise first)
**Corporate Practice of Medicine / Professionals (CPOM).** Several US states restrict non-licensed individuals or companies from owning, controlling, or profiting from a business that *provides* professional clinical services. A **marketplace** that merely *facilitates* (therapists are independent contractors, set their own fees, own their clinical work, Faresay takes a service fee) usually sits outside CPOM — but this is **the** legal risk for a US therapy platform and must be confirmed for NY. If counsel says CPOM applies, the standard fix is a **"friendly PC" + MSO** structure (a professional corporation owned by a licensed clinician, with Faresay as a Management Services Organization). Decide this before incorporating.

## NY launch — requirements
### 1. Therapist licensing (NY)
- NY mental-health clinicians are licensed by the **NYS Office of the Professions (NYSED)**: **LMHC** (mental health counselor), **LCSW**, **LMSW**, **LMFT**, **Licensed Psychologist**.
- A therapist may treat a client **physically located in NY** if the therapist holds the relevant **current NY license** (telehealth is permitted).
- **Verify** each therapist against the NYS **License Verification** lookup before approval (manual v1). Keep the audit trail (we already log CredentialCheck).

### 2. Federal — HIPAA
- **BAAs** (Business Associate Agreements) signed with every vendor handling PHI: Stripe, Daily.co, Neon, Clerk, Resend, Cloudinary — each has a HIPAA tier that must be requested/enabled (higher cost).
- **Notice of Privacy Practices (NOPP)** published + acknowledged.
- HIPAA **Security Rule** (encryption, access controls — largely in place) + **Privacy Rule**.

### 3. NY state privacy / records
- **NY SHIELD Act** — data security requirements for NY residents' private info.
- **NY Mental Hygiene Law §33.13** — confidentiality of clinical records.
- **42 CFR Part 2** — only if substance-use treatment is offered (stricter). Avoid in v1 if possible.

### 4. Telehealth consent
- NY generally requires **informed consent** for telehealth. Add a NY telehealth-consent step (mirror the UK Article-9 consent pattern; counsel to provide wording).

### 5. Entity, banking, payments
- **US entity** — commonly a **Delaware LLC** (then foreign-qualify in NY) or a **NY LLC**. Needs a **registered agent**.
- **EIN** from the IRS → **US business bank account** → **Stripe US** + **Stripe Connect** for US therapist payouts (cash-pay only v1; **no insurance/superbills**).

### 6. Crisis / safety
- **988** Suicide & Crisis Lifeline + Crisis Text Line (already in lib/locale for US). Not a crisis service — same signposting model as UK.

### 7. Other
- **18+** only. **No false/medical claims** in marketing (FTC). Therapy services are generally **not subject to NY sales tax** (confirm). Entity owes federal + NY income/franchise tax.

## How to TRIGGER each (action → who/where)
| Requirement | Action to start it |
|---|---|
| CPOM decision + NY docs | **Engage a US healthcare/telehealth attorney admitted in NY.** This unlocks most of the list — they confirm CPOM, draft NY T&Cs, NOPP, telehealth consent, US therapist agreement. |
| US entity | Formation agent (Stripe Atlas / Clerky / Firstbase) → Delaware LLC + registered agent → **EIN** (IRS, free) → foreign-qualify in NY. |
| US bank + payments | Open US business bank (Mercury/Brex/traditional) → **Stripe US** account → enable Connect → request **HIPAA** terms. |
| HIPAA BAAs | Request a BAA from each vendor (Stripe, Daily.co, Neon, Clerk, Resend, Cloudinary); enable their HIPAA tier. |
| Therapist verification | Use NYSED **License Verification** for each applicant (manual now; explore a verification vendor later). |
| ICO-equivalent | None federally; HIPAA + NY SHIELD govern. (No US "ICO registration".) |

## Full US coverage — the scaling framework
Each new state is a repeat of the NY pattern. To add a state:
1. Confirm that state's **licensing boards** + **telehealth rules** + any **CPOM** nuance with counsel.
2. Confirm Stripe payouts + tax treatment in that state.
3. Add the state code to **`LAUNCH_US_STATES`** (or `NEXT_PUBLIC_ACTIVE_US_STATES`) — onboarding + matching open up automatically.
4. Recruit licensed therapists in that state.

**Accelerators for multi-state scale:**
- **PSYPACT** — interstate compact letting psychologists practise telehealth across member states (~40 states). A PSYPACT-authorised psychologist can serve clients in any member state — big lever for psychologists.
- **Counseling Compact** — same idea for LPCs/LMHCs (rolling out across states).
- These compacts mean some therapists can serve **many** states on one credential — prioritise recruiting compact-holders as coverage grows.
- Model: store each therapist's licensed states (today `licenseState` is single — extend to an array when scaling beyond NY) and match a client to any therapist licensed in the client's state.

## Build note (for when we scale past NY)
- `Therapist.licenseState` is currently a single string (NY launch). For multi-state therapists (compacts), migrate to `licenseStates String[]` and match on `client.usState ∈ therapist.licenseStates`. Flagged in code; trivial migration when needed.
