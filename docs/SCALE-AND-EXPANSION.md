# Scale, Corporate & US Expansion

## Will it scale? (capacity review)

| Layer | Today | Scales to | Notes |
|-------|-------|-----------|-------|
| Vercel (Next.js) | Serverless | Effectively unlimited | Stateless; auto-scales. Watch function concurrency on Hobby → upgrade to Pro. |
| Neon Postgres | eu-west-2, single | 100k+ users | Enable autoscaling + read replicas as load grows. Connection pooling via Neon pooler. |
| Clerk | Dev instance | Millions | Move to production instance + custom domain (clerk.faresay.com). |
| Stripe Connect | Test | Unlimited | No capacity concern; per-account KYC is the bottleneck, not throughput. |
| Daily.co | Pay-as-you-go | Thousands concurrent | EU residency; cost is per participant-minute — model this into pricing. |
| Resend | Free tier | 100/day → upgrade | Verify faresay.com domain; move to paid tier before volume. |
| Rate limiter | In-memory | Single instance only | **Must move to Upstash Redis before scaling horizontally.** |

**Bottlenecks to fix before scale:** (1) Redis rate limiting, (2) Neon autoscaling + pooler, (3) Clerk prod instance, (4) Resend domain + paid tier, (5) background queue for Daily room creation + emails (currently inline/non-blocking — move to a queue like Inngest/QStash for retries).

## Corporate / B2B (Phase 9.12 — foundations laid)
- `Organisation` model + `Client.organisationId` + `creditPoolPence` shipped.
- `/for-business` landing page live (mailto CTA — replace with a proper lead form + sales pipeline).
- **Next build steps:** org admin dashboard, member invite by email domain, pooled-credit drawdown at booking, monthly utilisation invoice (Stripe Invoicing), anonymised reporting.
- **Pricing model:** shared credit pool (pay-per-use) beats per-seat EAP — lower waste, easier sell. Margin = same 15%, plus optional B2B platform fee.

## US expansion (Phase 9.13 — research only, do NOT build yet)
Material differences make this a separate project, not a config flag:
- **Regulation:** HIPAA (not UK GDPR). Requires BAAs with every processor (Stripe, Daily, Neon, Clerk, Resend all offer HIPAA tiers — at higher cost).
- **Licensing:** therapists licensed **per state** (LPC, LCSW, LMFT, PsyD). A therapist licensed in NY can't see a client physically in CA. Matching must be state-aware.
- **Credential bodies:** APA, NASW, state boards — different verification entirely.
- **Payments:** Stripe works, but US health payments often involve insurance/superbills — big scope.
- **Crisis:** 988 Suicide & Crisis Lifeline (not 999/Samaritans).
- **Entity:** likely a US LLC + US bank for Stripe payouts.

**Recommendation:** prove UK profitability first. Treat US as a v2 with its own legal/compliance budget and a state-licensing-aware matching rebuild. Daily.co and Stripe both operate in the US, so the tech stack carries over — the moat is compliance, not code.
