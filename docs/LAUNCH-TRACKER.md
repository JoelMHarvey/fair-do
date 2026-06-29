# Faresay — Launch Tracker (UK + US)

Build is code-complete for both markets. What remains is legal + ops + supply. Work top-down.

Legend: 🔴 blocking · 🟠 do soon · 🟢 parallel/anytime · ✅ done

---

## UK — go-live path (primary market)

### 1. Legal (the gate) — `docs/LEGAL-BRIEF.md`
- [ ] 🔴 Companies House — register **Faresay Ltd** + business bank account
- [ ] 🔴 Solicitor: lawful basis (Art 6/9) confirmed · **DPIA** · sign-off on /privacy
- [ ] 🔴 **ICO** registration (data controller, ~£60/yr)
- [ ] 🔴 **DPAs** signed — Clerk, Neon, Stripe, Daily, Resend, Cloudinary
- [ ] 🟠 T&Cs · therapist contractor agreement · complaints/safeguarding policy (solicitor)
- [ ] 🟢 UKIPO trademark — class 44 + 42

### 2. Ops switches (mostly not gated on legal)
- [ ] 🔴 **Stripe → live** (needs Ltd + bank) — then I verify a real booking end-to-end
- [ ] 🟠 **Resend** — verify faresay.com domain + `RESEND_FROM` (do now; stops spam)
- [ ] 🟠 **Clerk** production instance + clerk.faresay.com
- [ ] 🟢 **Cloudflare** WAF + Turnstile + Upstash Redis rate limiting
- [ ] 🟢 **Cloudinary** env vars (turns therapist photos on)
- [ ] 🟢 Sentry DSN · `COMPLAINTS_EMAIL` · confirm Vercel Cron (reminders)

### 3. Data
- [ ] 🟠 `node prisma/remove-demo-therapists.mjs` before real clients
- [ ] 🔴 Set ADMIN account(s)

### 4. Supply & demand — `docs/RECRUITMENT.md` + `docs/MARKETING.md`
- [ ] 🔴 Recruit 15–25 BACP/UKCP therapists (can start the *pipeline* now)
- [ ] 🟠 Onboard + verify them
- [ ] 🟠 Recruit beta clients (referral loop + founding promo live)
- [ ] 🟢 Video content (Veo/ElevenLabs/CapCut packs in Apple Notes)

**UK go-live order:** Companies House → solicitor → ICO → DPAs → Stripe live → recruit → launch.

---

## US — NY first, then scale — `docs/US-EXPANSION-PLAN.md` + `docs/US-LEGAL-NY.md`

### Code — ✅ done
- ✅ Region model, NY-only launch gate (`LAUNCH_US_STATES`), US onboarding (state + license bodies), state-aware matching, region-aware /help (988) + currency.

### 1. Legal (the gate)
- [ ] 🔴 **Engage a NY healthcare/telehealth attorney** — this unlocks the rest:
  - confirm **CPOM** (corporate practice) — decide friendly-PC/MSO before incorporating
  - NY T&Cs · Notice of Privacy Practices · telehealth consent · US therapist agreement
- [ ] 🔴 **US entity** — Delaware LLC + registered agent → **EIN** → foreign-qualify in NY
- [ ] 🔴 **HIPAA BAAs** — Stripe, Daily, Neon, Clerk, Resend, Cloudinary (enable HIPAA tiers)
- [ ] 🔴 **US bank** → **Stripe US** + Connect (cash-pay only v1)
- [ ] 🟠 NYSED license-verification process for therapist onboarding

### 2. Launch NY
- [ ] Recruit NY-licensed therapists (LMHC/LCSW/LMFT/Psychologist)
- [ ] Flip US region live for NY (already gated to NY)

### 3. Scale to full coverage
- [ ] Per new state: confirm licensing + telehealth + CPOM → add code to `LAUNCH_US_STATES`
- [ ] Prioritise **PSYPACT** (psychologists) + **Counseling Compact** (LPCs) holders — multi-state on one credential
- [ ] Build: migrate `Therapist.licenseState` → `licenseStates[]` for compact-holders

**US go-live order:** NY attorney (CPOM + docs) → US entity + EIN + bank → Stripe US + BAAs → recruit NY therapists → launch NY → add states.

---

## Single most important next action per market
- **UK:** finish solicitor conversation + register Faresay Ltd.
- **US:** engage a NY healthcare attorney (decides CPOM, unlocks everything else).

Everything else flows from those two engagements. The code is ready for both.
