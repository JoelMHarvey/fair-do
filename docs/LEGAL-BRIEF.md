# Legal / Compliance Brief — prep for solicitor + Companies House

> Not legal advice. This is a checklist to make the solicitor conversation efficient and complete, and to capture decisions. Defer all substance to the solicitor.

## What Faresay is (one paragraph for the solicitor)
A UK online marketplace connecting clients with **independent, self-employed, professionally-registered therapists** (BACP/UKCP/BPS/NCS). Faresay is **not** a therapy provider and **not** a crisis service — it facilitates discovery, booking, payment (Stripe Connect, 85–90% to therapist), and encrypted video (Daily.co, EU residency). It processes **special-category health data** (UK GDPR Article 9). Therapists are independent contractors who hold their own PI insurance.

## Companies House
- [ ] Register **Faresay Ltd** (£50 online).
- [ ] **SIC code** — likely candidates to confirm with accountant/solicitor:
  - `86900` Other human health activities, or
  - `96090` Other service activities n.e.c., or
  - `62012`/`63120` if positioned as a tech platform.
  Online therapy marketplace most commonly sits under **86900**. Confirm.
- [ ] Registered office address (can use an accountant's/formation agent's address for privacy).
- [ ] Director(s) + PSC details.
- [ ] After incorporation: business bank account (needed for Stripe live payouts).

## Data protection (the core of the conversation)
1. **Lawful basis** — confirm:
   - Article 6 basis for general processing (likely **contract** + **legitimate interests**).
   - Article 9 condition for health data (likely **explicit consent**, Art 9(2)(a)) — we already capture explicit, versioned, timestamped consent at onboarding. Confirm wording is sufficient.
2. **DPIA** — a Data Protection Impact Assessment is effectively required for large-scale special-category processing. Ask solicitor to confirm scope + provide/review a template.
3. **ICO registration** — register as a data controller (~£60/yr, likely Tier 2). Confirm tier.
4. **Controller vs processor** — confirm Faresay is **controller**; therapists may be **independent/joint controllers** for clinical notes. Clarify who controls what (esp. session content, therapist's own records).
5. **Data Processing Agreements (DPAs)** — need signed DPAs with every processor:
   - Clerk (auth, US — SCCs), Neon (DB, EU), Stripe (payments), Daily.co (video, EU), Resend (email, US — SCCs), Cloudinary (images, if used).
   - Ask solicitor to confirm SCCs / UK addendum are in place for US transfers.
6. **Retention** — we use 7 years post-last-session (BACP/UKCP norm). Confirm appropriate + lawful.
7. **Data subject rights** — access/erasure flow (note: erasure limited by retention obligations). Confirm our handling.

## Documents to commission / review (get fixed-fee quotes)
- [ ] **Platform Terms of Service** (client-facing) — incl. "not a crisis service", cancellation/refund (24h), limitation of liability, governing law (England & Wales).
- [ ] **Privacy Notice** — must cover special-category data, processors, transfers, retention, rights. (Draft live at /privacy — get it reviewed.)
- [ ] **Therapist contractor agreement** — independent contractor status, **mandatory current registration**, **PI insurance requirement**, conduct/safeguarding obligations, IP/notes ownership, fee split, payout terms.
- [ ] **Cookie/consent** — we use essential cookies only; confirm no banner required.
- [ ] **Complaints & safeguarding policy** — we have a /complaints flow + /help crisis page; ask solicitor to confirm the safeguarding escalation path is adequate (duty of care, vulnerable users).

## Safeguarding / clinical risk (raise explicitly)
- We are not a crisis service and signpost 999/Samaritans/SHOUT/NHS 111 (/help + onboarding).
- Confirm: our obligations if a user discloses risk; whether we need a clinical governance lead; insurance for the platform (separate from therapists' PI).
- Confirm whether **professional indemnity / public liability** for Faresay Ltd itself is advisable.

## Trademark (parallel, cheap)
- [ ] UKIPO **class 44** (medical/therapy services) search + application for "Faresay" (free search at trademarks.ipo.gov.uk; ~£170 to file).
- [ ] Consider class 42 (software/SaaS) too.

## Sequence to go-live
1. Companies House → Faresay Ltd + bank account.
2. Solicitor: lawful basis confirmed + DPIA + docs drafted.
3. ICO registration.
4. DPAs signed with all processors.
5. **Then** Stripe live (needs the Ltd + bank anyway).
6. Recruit/verify therapists → soft launch.

## What can progress NOW (not gated on legal)
- Resend domain verification, Clerk production instance, Cloudflare WAF, Cloudinary — all safe to set up.
- **Soft therapist recruitment** — build the founding-therapist pipeline now (interest + intent), onboard once live. See docs/RECRUITMENT.md.
