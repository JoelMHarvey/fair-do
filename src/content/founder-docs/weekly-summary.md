# Weekly Build Summary

A short, dated record of what shipped. Most recent week first.

## Week of 23–28 June 2026

### Jun 23 — US expansion
Region model + locale, US-region Stripe Connect, NY-first launch gate, region-aware currency everywhere. Plus reviews & ratings, availability calendar, language filter, blog, auto no-show refund, Daily call observability.

### Jun 24 — Launch-readiness
Pre-launch hardening sweep (gating, safety, SEO, mobile nav, error pages). Public therapist directory, Plausible analytics, Stripe `account.updated`/refund webhooks.

### Jun 25 — The pivot (biggest day)
Rebuilt as a B2B SaaS **practice portal** for therapists. Phases A+B shipped: Stripe Billing subscriptions, client invites/roster, packages, self-booking page, broadcast, CSV import, payment receipts, onboarding wizard, intake/consent forms, outcome measures, supervision records, in-app calendar/agenda, client notes/docs, SMS reminders, installable PWA + web-push, help-first guidance UX, compliance gates, and the founder docs portal (policies + Art 28 DPA).

### Jun 26 — Security + observability
Distributed rate-limiting (Upstash), self-book Turnstile + email double-opt-in, refund-reversal / XSS / ICS-injection fixes, webhook idempotency rollback. Metrics endpoint + `/admin/health` dashboard + alerting. Breathing-lotus hero, compare page, removed the legacy 15% marketplace fee.

### Jun 27 — Tests, native, inbox agent
Full automated test suite + CI + Playwright E2E (much Clerk auth wrangling). Native app foundation M0–M3 (video, messages, push, biometric lock, Sentry). Support-inbox triage agent P1–P4 (ships OFF). Founder system diagrams + brand-assets page, credential-verification workflow, Cloudinary CSP fix, booking launch-audit fixes.

### Jun 28 — Pricing, paid features, admin, prod cutover
0% session commission ("keep 100%"), £29 Practice price fix, therapist bears the Stripe fee, referral free-month. New paid features: branded letterhead, earnings insights, **targeted broadcast** (recipients / calendar invites / templates), **in-app AI assistant**. **Admin user console** (online status, per-user setup, role elevate/revoke, impersonation) + full-access allowlist. Recovered the Clerk **dev→prod migration** (onboarding relink, Stripe self-heal, DB/env fixes) and fixed allowlist access end-to-end (paid features, nav links, admin APIs). CI Node bump.
