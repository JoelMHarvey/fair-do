# Competitor Feature Analysis & What to Adopt

> Faresay vs the practice-management incumbents (SimplePractice, Cliniko, Halaxy, Power Diary/Zanda,
> WriteUpp, Jane, Pabau). What they have, what we have, and a prioritised list of features to adopt —
> filtered through our model (UK-first · therapist-owned records · Faresay = processor, not the
> clinical-record holder). Researched June 2026 (web). Last updated: 26 June 2026

---

## 1. The competitive set (one-liners)
- **SimplePractice** (US leader): all-in-one, best-in-class client portal + telehealth, insurance/claims depth, Measurement-Based Care, AI Note Taker. $49–99/mo.
- **Cliniko** (AU/UK): polished UX, flat per-practitioner pricing, strong API/marketplace, two-way Google+Outlook sync, Stripe. $45+/mo.
- **Halaxy** (AU/UK): **free core + usage credits** model, deep funding-body claiming, built-in measures (DASS/K10).
- **Power Diary / Zanda** (AU): built for group practices; **signature strength = SMS** (two-way chat, waitlist-via-SMS), BizzyAI scribe.
- **WriteUpp** (UK — our closest incumbent): UK-born, video built in, **Healthcode** insurer billing, **PHQ-9/GAD-7/CORE-10** built in, Smart Forms, AI scribe add-on. £19.95–45.95/mo.
- **Jane / Pabau / Carepatron / TM3:** Jane (great UX + AI scribe, Stripe-only); **Pabau (UK, native GoCardless + Stripe)**; Carepatron (generous free + free AI scribe, Stripe-only); TM3 (UK, physio-centric, Healthcode).

## 2. Where Faresay already stands (we're closer than it looks)
**Built:** client invite/import/**managed (accountless) clients** · per-client rates · packages · therapist-led scheduling · **agenda + month calendar + one-way ICS feed** · Daily.co secure video · Stripe card + **offline payment mode** · receipts · per-client notes · **external document links** (6 clinical doc types — link-only) · **outcome tracking (PHQ-9/GAD-7) with trend + severity** · messaging + **broadcast** · email reminders · registration verification · **installable phone app (PWA) + push** · earnings.

**Our deliberate difference:** we **don't hold the clinical record** (therapist keeps docs in their own storage; we store links) — lighter processor posture. Several incumbents are heavyweight EHRs; we're a lean, mobile-first practice OS. Keep that.

## 3. Gap analysis → what to adopt (prioritised)

### 🟢 ADOPT NOW — high value, on-brand, UK-differentiating
| Feature | Why | Effort |
|---|---|---|
| **GoCardless Direct Debit** for recurring client fees | **The single biggest UK lever.** Direct Debit is the UK default for weekly/monthly therapy; cheaper than card on higher-value sessions; "removes the money talk from the room." **WriteUpp, Jane, Carepatron are Stripe-led — only Pabau has native GoCardless.** We're already Stripe; adding GoCardless makes us the obvious UK choice. | Medium |
| **CORE-10** (and SWEMWBS) outcome measure | **CORE-10 is *the* UK counselling measure**; PHQ-9/GAD-7 is the NHS Talking Therapies pairing. We already have the OutcomeScore engine — adding CORE-10 is just new measure types + bands. Instant UK credibility. | **Tiny** (extend existing) |
| **Customisable intake / consent forms** ("Smart Forms") | Table-stakes everywhere; we don't have it. Client completes intake + consent online *before* the first session, auto-filed. Also strengthens the consent/lawful-basis story for the DPA. | Medium |
| **SMS appointment reminders** | We have email only. SMS materially cuts no-shows; UK therapists expect it (WriteUpp/Power Diary lead here). Via Twilio/MessageBird. | Medium |
| **Client self-booking page** (public booking link) | We're therapist-initiated only. A branded "book with me" link (client picks from real availability) is table-stakes — and the on-ramp to the future client-compare/switch direction. | Medium-High |
| **Supervision records log** | **BACP/UKCP mandate supervision (min 1.5 hrs/month) and can audit it.** Almost no competitor makes this first-class → a genuine Faresay edge + compliance hook. Light: a supervision log (date, supervisor, hours, notes), stored separately from client notes. | **Light** |

### 🟡 CONSIDER — strong, but sequence after the above / needs care
| Feature | Note |
|---|---|
| **AI note-taking / scribe** | Everyone's adding it (SimplePractice, Jane, BizzyAI, Carepatron-free). Big demand. **Do it our way:** transcribe → draft a note the therapist reviews and saves to **their own** record (not held by us) — keeps the processor-light posture + avoids us storing transcripts. Differentiator if framed right; watch AI cost + data-protection (transcripts are special-category). |
| **Two-way SMS chat** | Power Diary's signature. Beyond reminders — clients reply, free inbound. Good, but after basic SMS reminders. |
| **Indemnity-insurance + registration expiry tracking + reminders** | We store registrationExpiry; add PII insurance + renewal reminders. Cheap compliance nicety (both are BACP conditions of registration). |
| **Two-way Google/Outlook calendar sync** | Already scoped (`pp-calendar-sync-plan.md`) — busy-time read to prevent double-booking. Build when a partner asks. |
| **Group video** (couples/family/group sessions) | Daily.co supports it; extends rate types we already have (groupRatePence). |
| **Therapist reporting** (income trend, retention, no-show rate) | Light analytics on data we already hold. |
| **Healthcode insurer billing** (AXA/Bupa/Vitality) + **EAP billing** | Real UK revenue path but complex (Healthcode integration, CCSD codes, EAP auth numbers/caps). Later — but it's a serious moat if done. |
| **Xero / accounting export** | Common ask; CSV export is the cheap first step. |

### 🔴 SKIP (for now) — off-strategy or clinic-tier
- **US insurance claims / superbills / ERA-EOB** — irrelevant in the UK.
- **E-prescribing** — not talk therapy.
- **Inventory / POS / memberships / before-after photos** — aesthetics (Pabau), not us.
- **Multi-location clinic management / roles** — that's the **clinic branch** (`pp-clinic-plan.md`), post-solo-validation.
- **Heavyweight EHR charting** — deliberately not us; we link to external records.

## 4. The three bets that would actually win the UK
1. **GoCardless Direct Debit** — the clearest wedge against Stripe-led incumbents (WriteUpp/Jane/Carepatron). UK therapists *want* DD for recurring clients.
2. **Supervision records** — a BACP-mandated, auditable need that incumbents under-serve. Cheap to build, uniquely "gets" UK therapists.
3. **Model-aligned AI scribe** — the feature everyone is racing on, delivered *without* us holding the transcript/record — turning our processor-light posture into a selling point, not a limitation.

Pair those with the quick table-stakes catch-ups (**CORE-10, intake forms, SMS reminders, self-booking**) and Faresay is competitive with WriteUpp on essentials *and* differentiated on the things UK therapists actually complain about.

## 5. Small but important corrections (get these right in product/copy)
- **"NCS" is now "NCPS"** (National Counselling & Psychotherapy Society) — fix wherever we list bodies.
- **Power Diary is now "Zanda"**; its AI is **BizzyAI** (not "Mai").
- **ICO registration** (£52/yr; £47 by DD) is a therapist legal requirement — worth a one-line nudge in onboarding/help.

## 6. Suggested order of build
1. CORE-10 (+ SWEMWBS) — days. 2. Supervision records — days. 3. SMS reminders — ~1 wk.
4. Intake/consent Smart Forms — ~2 wks. 5. GoCardless Direct Debit — ~2 wks. 6. Client self-booking — ~2–3 wks.
Then revisit AI scribe + two-way calendar sync + Healthcode as the validated, higher-effort bets.

## Linked documents
- `pp-product-requirements-document.md` · `pp-gtm-strategy.md` · `pp-calendar-sync-plan.md` ·
  `pp-clinic-plan.md` · `pp-validation-plan.md` · `pp-dpa.md`
