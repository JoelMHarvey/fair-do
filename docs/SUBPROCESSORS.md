# Sub-processor register

Third parties that process personal data on fair-do's behalf. Required for the
UK-GDPR processor obligations (Art. 28) and for the sub-processor list the privacy
policy must disclose. **Confirm a signed DPA is in place with each before launch**
and keep the "DPA" column current.

Derived from actual `process.env.*` usage + integration code (not just the policy).
The privacy policy currently lists only Clerk/Stripe/Daily/Resend/Plausible — the
rest below must be added to it.

| Sub-processor | Purpose | Personal data processed | Region | DPA |
|---|---|---|---|---|
| **Vercel** | Hosting / edge / serverless | All request data in transit; logs | US/EU edge | ☐ confirm |
| **Neon** | Postgres database | All stored PII (see DATA-RETENTION.md) | EU (AWS) — confirm region | ☐ confirm |
| **Clerk** | Auth / identity | Name, email, password (hashed by Clerk), sessions | US | ☐ confirm |
| **Stripe** | Payments + Connect payouts | Name, email, card (PCI, Stripe-side), payout/bank details | US/EU | ☐ confirm |
| **Daily.co** | Lesson video + transcription | Video/audio of lessons, join metadata; **transcripts of minors** | US | ☐ confirm |
| **Anthropic (Claude)** | AI lesson notes, support-inbox agent, assistant | **Lesson transcripts of minors**, support message content | US | ☐ **priority** — minors' content |
| **Resend** | Transactional email | Name, email, message content in emails | US/EU | ☐ confirm |
| **Twilio** | SMS lesson reminders | Phone number, reminder content | US | ☐ confirm |
| **Cloudinary** | Image/doc hosting | Teacher photos, brand logos, uploaded student documents | US/EU | ☐ confirm |
| **Upstash (Redis)** | Rate limiting | IP + user id in rate-limit keys (transient) | Global edge | ☐ confirm |
| **Sentry** | Error monitoring | Error context (can incidentally include ids/PII) — `sendDefaultPii:false` set | US/EU | ☐ confirm (when enabled) |
| **Onfido** | Credential / DBS checks | Teacher identity + qualification/DBS references | UK/EU | ☐ confirm (when enabled) |
| **IMAP mailbox provider** | Support inbox ingest | Inbound support email content + sender addresses | provider-dependent | ☐ confirm |
| **GitHub** | Inbox agent files issues (`GH_PAT`) | Support-derived summaries (should be PII-free) | US | ☐ confirm no PII in issues |
| **Plausible** | Analytics (cookieless) | No personal data (aggregate, no PII) | EU | ☐ N/A (no PII) |

## Notes
- **Anthropic** is the highest-priority gap: lesson transcripts of children are sent
  for note generation (`src/lib/lesson-notes.ts`). Ensure the DPA covers this, or gate
  AI notes off (`AI_NOTES_ENABLED=false`) until it does.
- **Daily** transcription can be disabled per-room if transcript processing isn't wanted.
- Keep this list in sync with the privacy policy's published sub-processor section.
- When adding any new third party that touches personal data, add a row here + update
  the policy before shipping.
