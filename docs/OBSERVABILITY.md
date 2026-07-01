# Observability

## In place
- **Health check**: `GET /api/health` pings the DB, returns 200/503. Point an uptime monitor here.
- **Error wrapper**: `src/lib/observability.ts` `logError(scope, err, ctx)` — single seam, Sentry-ready.
- **Vercel logs**: all `console.error` captured in the Vercel dashboard → Logs.

## To wire up (setup steps)
1. **Sentry** — ✅ CODE WIRED. `@sentry/nextjs` installed; init in `src/instrumentation.ts` +
   `src/instrumentation-client.ts`; `logError()` forwards to `Sentry.captureException`;
   `onRequestError` (in `src/instrumentation.ts`) forwards uncaught route/RSC 500s to
   `Sentry.captureRequestError`. **Error capture is inert only until `SENTRY_DSN` is set**
   — setting it is all that's needed for capture. (`withSentryConfig` is intentionally
   removed from `next.config.ts` — it broke Turbopack route collection; that only
   affects source-map upload, not error capture.)
   To activate: create a Sentry project, then add to Vercel env:
   - `SENTRY_DSN` (server) + `NEXT_PUBLIC_SENTRY_DSN` (client)
2. **Uptime + alerting** — BetterUptime / Checkly monitor on `https://fair-do.com/api/health`, 1-min interval, alert to email/Slack/SMS.
3. **Vercel Analytics** — `npm install @vercel/analytics`, add `<Analytics/>` to root layout. Traffic + Web Vitals.
4. **Stripe + Daily dashboards** — payment failure and room-creation error alerts.

## Call observability (Daily.co)
- **In-app capture** — `/api/webhooks/daily` records, per lesson: `callStartedAt`, `callEndedAt`, `joinCount` (and flips status to IN_PROGRESS on first join). Used for attendance, no-show handling, and dispute evidence. The lesson page shows a call summary ("both joined · 48 min" / "no one joined").
- **Setup:** in Daily, create a webhook → URL `https://fair-do.com/api/webhooks/daily`, events `participant.joined`, `participant.left`, `meeting.ended`. Set `DAILY_WEBHOOK_SECRET` (the HMAC Daily returns) in Vercel for signature verification.
- **Daily dashboard** — per-room network quality (packet loss, jitter, bitrate) for deep call-quality debugging.
- **Future:** auto-set NO_SHOW + auto-refund when `joinCount < 2` after the lesson window; forward degraded-call events to Sentry.

## Self-hosted route-error alerting (implemented — no Sentry needed)
Independent of Sentry, so ops get paged even without a Sentry plan:
- `logError()` and the `onRequestError` hook write a truncated, PII-free line to the
  `ErrorEvent` table (`src/lib/error-log.ts`). This captures both handled errors
  (`[booking/create]`, `[stripe webhook]`, …) and **uncaught route/RSC 500s** — the
  class that previously only appeared in raw Vercel logs.
- The **alerts cron** (every 15 min) counts `ErrorEvent`s in the last 20 min and
  emails the founder when the count exceeds `ALERT_APP_ERRORS` (default 10), with the
  same fire-once / all-clear dedup as other alerts. It also prunes rows older than 24h.
- Tune with `ALERT_APP_ERRORS` in Vercel env.

## Key signals to alert on
- `/api/health` non-200
- Spike in `[booking/create]` or `[stripe webhook]` errors → **now alerted** via the `app_errors` breach above
- Daily.co room creation failures (lessons stuck without `dailyRoomUrl`)
- Webhook signature failures (possible tampering)
