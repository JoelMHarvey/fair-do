# Observability

## In place
- **Health check**: `GET /api/health` pings the DB, returns 200/503. Point an uptime monitor here.
- **Error wrapper**: `src/lib/observability.ts` `logError(scope, err, ctx)` — single seam, Sentry-ready.
- **Vercel logs**: all `console.error` captured in the Vercel dashboard → Logs.

## To wire up (setup steps)
1. **Sentry** — ✅ CODE WIRED. `@sentry/nextjs` installed; init in `src/instrumentation.ts` +
   `src/instrumentation-client.ts`; `logError()` forwards to `Sentry.captureException`;
   `next.config.ts` wrapped with `withSentryConfig`. **All inert until env is set.**
   To activate: create a Sentry project, then add to Vercel env:
   - `SENTRY_DSN` (server) + `NEXT_PUBLIC_SENTRY_DSN` (client)
   - `SENTRY_ORG`, `SENTRY_PROJECT`, `SENTRY_AUTH_TOKEN` (for source-map upload in CI)
2. **Uptime + alerting** — BetterUptime / Checkly monitor on `https://faresay.com/api/health`, 1-min interval, alert to email/Slack/SMS.
3. **Vercel Analytics** — `npm install @vercel/analytics`, add `<Analytics/>` to root layout. Traffic + Web Vitals.
4. **Stripe + Daily dashboards** — payment failure and room-creation error alerts.

## Call observability (Daily.co)
- **In-app capture** — `/api/webhooks/daily` records, per session: `callStartedAt`, `callEndedAt`, `joinCount` (and flips status to IN_PROGRESS on first join). Used for attendance, no-show handling, and dispute evidence. The session page shows a call summary ("both joined · 48 min" / "no one joined").
- **Setup:** in Daily, create a webhook → URL `https://faresay.com/api/webhooks/daily`, events `participant.joined`, `participant.left`, `meeting.ended`. Set `DAILY_WEBHOOK_SECRET` (the HMAC Daily returns) in Vercel for signature verification.
- **Daily dashboard** — per-room network quality (packet loss, jitter, bitrate) for deep call-quality debugging.
- **Future:** auto-set NO_SHOW + auto-refund when `joinCount < 2` after the session window; forward degraded-call events to Sentry.

## Key signals to alert on
- `/api/health` non-200
- Spike in `[booking/create]` or `[stripe webhook]` errors
- Daily.co room creation failures (sessions stuck without `dailyRoomUrl`)
- Webhook signature failures (possible tampering)
