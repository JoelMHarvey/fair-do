# Security & Resilience

## In place
- **Transport**: HTTPS only (Vercel-managed TLS). HSTS with preload, 2-year max-age.
- **Headers** (`next.config.ts`): CSP (allowlists Clerk, Stripe, Daily.co), X-Frame-Options SAMEORIGIN, X-Content-Type-Options nosniff, Referrer-Policy strict-origin, Permissions-Policy locks camera/mic to first-party.
- **Webhook auth**: Stripe (`constructEvent` signature) and Clerk (svix) both verified.
- **Rate limiting** (`src/lib/ratelimit.ts`): booking 5/min, messages 30/min, gift 5/min, redeem 8/min, complaints 3/5min — per user+IP.
- **Secrets**: server-only keys never `NEXT_PUBLIC_`. Stripe instantiated inside route handlers. `.env*` gitignored.
- **PHI hygiene**: no special-category data in logs (`src/lib/observability.ts` enforces by convention).
- **Authz**: every route checks Clerk session; admin routes check `role === 'ADMIN'`; session/message routes verify participant.

## DDoS protection (do before public launch)

### Cloudflare WAF — exact steps (faresay.com is already on Cloudflare DNS)
1. **DNS → proxy on**: set the `faresay.com` A/CNAME records to **Proxied (orange cloud)**. Currently grey for Vercel SSL — switch SSL/TLS mode to **Full (strict)** first so it doesn't break.
2. **SSL/TLS → Overview** → set encryption mode **Full (strict)**.
3. **Security → WAF → Managed rules** → enable **Cloudflare Managed Ruleset** + **OWASP Core Ruleset** (paranoia level medium).
4. **Security → WAF → Rate limiting rules** → add rule: path `/api/*`, > 60 req/min per IP → **Block** 10 min. Tighter rule on `/api/booking/*` and `/api/redeem`: > 10/min → Block.
5. **Security → Settings** → keep **"I'm Under Attack" mode** one toggle away; enable Bot Fight Mode.
6. **Turnstile** (Cloudflare CAPTCHA) → add a widget; gate `/sign-up` and `/api/gift/create`.

### App-side (code)
- ✅ Per-route rate limiting (in-memory). **Upgrade to Upstash Redis** before scaling to >1 Vercel instance — current limiter is per-instance, so a multi-instance deploy multiplies the effective limit.

## Pre-launch hardening checklist
- [ ] Move rate limiting to Redis (Upstash)
- [ ] Cloudflare WAF + rate rules on `/api/*`
- [ ] Penetration test (engage a firm, ~£2–5k) or run OWASP ZAP + Snyk
- [ ] Add Sentry for error visibility (see OBSERVABILITY.md)
- [ ] CAPTCHA (Cloudflare Turnstile) on sign-up + gift purchase
- [ ] Review Stripe Radar rules for fraud
- [ ] Dependency audit: `npm audit` clean
