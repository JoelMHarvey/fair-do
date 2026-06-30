# fair-do — Launch Tracker (UK + US)

Build is code-complete for both markets. What remains is legal + ops + supply. Work top-down.

Legend: 🔴 blocking · 🟠 do soon · 🟢 parallel/anytime · ✅ done

---

## UK — go-live path (primary market)

### 1. Legal (the gate) — `docs/LEGAL-BRIEF.md`
- [ ] 🔴 Companies House — **Faresay Ltd already exists** (the old Faresay entity); register the **fair-do** trading name + open/confirm the business bank account
- [ ] 🔴 Solicitor: lawful basis (Art 6) confirmed · **DPIA** · sign-off on /privacy
- [ ] 🔴 **ICO** registration (data controller, ~£60/yr)
- [ ] 🔴 **DPAs** signed — Clerk, Neon, Stripe, Daily, Resend, Cloudinary
- [ ] 🟠 T&Cs · tutor contractor agreement · complaints/safeguarding policy (solicitor)
- [ ] 🟢 UKIPO trademark — class 41 + 42

### 2. Ops switches (mostly not gated on legal)
- [ ] 🔴 **Stripe → live** (needs Ltd + bank) — then I verify a real booking end-to-end
- [ ] 🟠 **Resend** — verify fair-do.com domain + `RESEND_FROM` (do now; stops spam)
- [ ] 🟠 **Clerk** production instance + clerk.fair-do.com
- [ ] 🟢 **Cloudflare** WAF + Turnstile + Upstash Redis rate limiting
- [ ] 🟢 **Cloudinary** env vars (turns tutor photos on)
- [ ] 🟢 Sentry DSN · `COMPLAINTS_EMAIL` · confirm Vercel Cron (reminders)

### 3. Data
- [ ] 🟠 `npm run seed:remove-demo` before real students
- [ ] 🔴 Set ADMIN account(s)

### 4. Supply & demand — `docs/RECRUITMENT.md` + `docs/MARKETING.md`
- [ ] 🔴 Recruit 15–25 QTS / qualified tutors (can start the *pipeline* now)
- [ ] 🟠 Onboard + verify them
- [ ] 🟠 Recruit beta students (referral loop + founding promo live)
- [ ] 🟢 Video content (Veo/ElevenLabs/CapCut packs in Apple Notes)

**UK go-live order:** Companies House → solicitor → ICO → DPAs → Stripe live → recruit → launch.

---

## US — NY first, then scale — `docs/US-EXPANSION-PLAN.md` + `docs/US-LEGAL-NY.md`

### Code — ✅ done
- ✅ Region model, NY-only launch gate (`LAUNCH_US_STATES`), US onboarding (state + credential bodies), state-aware matching, region-aware /help + currency.

### 1. Legal (the gate)
- [ ] 🔴 **Engage a NY education/tutoring attorney** — this unlocks the rest:
  - confirm **business structure** — decide entity/operating model before incorporating
  - NY T&Cs · privacy notice · safeguarding consent · US tutor agreement
- [ ] 🔴 **US entity** — Delaware LLC + registered agent → **EIN** → foreign-qualify in NY
- [ ] 🔴 **FERPA-aligned DPAs** — Stripe, Daily, Neon, Clerk, Resend, Cloudinary (enable education-grade tiers)
- [ ] 🔴 **US bank** → **Stripe US** + Connect (cash-pay only v1)
- [ ] 🟠 NY credential-verification process for tutor onboarding

### 2. Launch NY
- [ ] Recruit NY-based qualified tutors (state-certified teachers / subject specialists)
- [ ] Flip US region live for NY (already gated to NY)

### 3. Scale to full coverage
- [ ] Per new state: confirm tutor vetting + background checks + business setup → add code to `LAUNCH_US_STATES`
- [ ] Prioritise multi-state teaching-credential / reciprocity holders — qualified across several states on one credential
- [ ] Build: migrate `Tutor.credentialState` → `credentialStates[]` for reciprocity-holders

**US go-live order:** NY attorney (structure + docs) → US entity + EIN + bank → Stripe US + DPAs → recruit NY tutors → launch NY → add states.

---

## Single most important next action per market
- **UK:** finish solicitor conversation + confirm Faresay Ltd trading as fair-do (no new incorporation).
- **US:** engage a NY education/tutoring attorney (decides structure, unlocks everything else).

Everything else flows from those two engagements. The code is ready for both.
