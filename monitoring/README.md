# Faresay — Observability, Monitoring & Alerting

Three layers, one data source:

1. **In-app dashboard** — `/admin/health` (admin-only). Live view of DB, endpoints, scheduled jobs, business counts, Plausible traffic and the support inbox. Auto-refreshes. Zero extra infra.
2. **Metrics endpoint** — `GET /api/metrics` returns the same data as JSON, guarded by `METRICS_TOKEN`. This is what Grafana (or any external monitor) reads.
3. **Alerting** — `/api/cron/alerts` runs every 15 min, checks thresholds, and emails the founder via Resend on state change (fires once, re-pings after `ALERT_REPEAT_HOURS`, sends an all-clear on resolve).

Error tracking is separate and already wired: **Sentry** (`src/lib/observability.ts`, `SENTRY_DSN`). This stack covers liveness/throughput/business state; Sentry covers exceptions.

---

## Environment variables

| Var | Required | Purpose |
|---|---|---|
| `METRICS_TOKEN` | for Grafana | Bearer token guarding `/api/metrics`. Generate a long random string. Without it the endpoint returns 401. |
| `PLAUSIBLE_API_KEY` | for traffic panel | Plausible → Settings → API Keys. |
| `PLAUSIBLE_SITE_ID` | for traffic panel | Your site domain, e.g. `faresay.com`. |
| `PLAUSIBLE_API_HOST` | optional | Defaults `https://plausible.io`. |
| `IMAP_HOST` / `IMAP_PORT` / `IMAP_USER` / `IMAP_PASSWORD` | for inbox panel | Read unread count of support@faresay.com. Gmail: `imap.gmail.com` / `993` / `support@faresay.com` / **App Password** (needs 2FA; normal password won't work). |
| `IMAP_MAILBOX` | optional | Defaults `INBOX`. |
| `ALERT_EMAIL` | optional | Alert recipient. Defaults `FOUNDER_EMAIL`. |
| `ALERT_DB_LATENCY_MS` | optional | DB-slow threshold (default 1500). |
| `ALERT_UNREAD_MAIL` | optional | Unread-mail threshold (default 15). |
| `ALERT_OPEN_COMPLAINTS` | optional | Open-complaints threshold (default 3). |
| `ALERT_REPEAT_HOURS` | optional | Re-ping interval for an ongoing breach (default 12). |

Already present and reused: `CRON_SECRET` (guards all crons), `RESEND_API_KEY` (alert email), `DATABASE_URL`, `SENTRY_DSN`.

Every integration is **env-gated**: missing keys → that panel shows "not configured" and the rest works.

### support@faresay.com (Cloudflare → Gmail)

Currently on Cloudflare Email Routing. To enable the unread panel, route support@ to a Gmail mailbox, enable 2FA on it, create an **App Password**, and set the `IMAP_*` vars. Until then the panel reads "not configured" — nothing else is affected.

---

## `/api/metrics` response shape

```json
{
  "ts": "ISO",
  "db": { "up": true, "latencyMs": 42 },
  "counts": { "therapistsActive": 0, "therapistsPending": 0, "sessionsToday": 0, "openComplaints": 0, "...": 0 },
  "revenueTodayPence": 0,
  "crons": [{ "name": "reminders", "lastRunAt": "ISO", "ok": true, "ageMins": 12, "stale": false }],
  "endpoints": [{ "name": "health", "ok": true, "status": 200, "latencyMs": 88 }],
  "plausible": { "configured": true, "visitors30d": 0, "pageviews30d": 0, "visitorsToday": 0, "currentVisitors": 0 },
  "mailbox": { "configured": false }
}
```

Test it:

```bash
curl -s -H "Authorization: Bearer $METRICS_TOKEN" https://faresay.com/api/metrics | jq
```

---

## Grafana Cloud setup

Free tier is enough.

### 1. Infinity datasource (app metrics)
- Install the **Infinity** datasource (`yesoreyeram-infinity-datasource`).
- Auth → **Bearer token** = your `METRICS_TOKEN`.
- Base URL = `https://faresay.com`.
- Allowed hosts = `https://faresay.com`.
- Import `grafana/faresay-dashboard.json` and pick this datasource when prompted.

Each panel queries `/api/metrics` (type JSON, source URL) with a root selector, e.g. `counts`, `endpoints`, `crons`, `db`, `plausible`, `mailbox`.

### 2. Neon Postgres datasource (direct DB / history)
- Add a **PostgreSQL** datasource pointing at the Neon host from `DATABASE_URL` (host `ep-…eu-west-2.aws.neon.tech`, db `neondb`, SSL `require`).
- Use a **read-only** Neon role for Grafana (don't reuse the app role).
- Lets you graph trends over time (signups/day, sessions/week) that the snapshot endpoint can't.

### 3. Alerting
- App-side alerting (Resend email) already runs via `/api/cron/alerts` — no Grafana config needed.
- Optionally add Grafana alert rules on top (e.g. on the Postgres datasource) and route to your preferred contact point.

---

## What's monitored vs alerted

| Signal | Dashboard | Email alert |
|---|---|---|
| DB up / latency | ✅ | ✅ down, or > `ALERT_DB_LATENCY_MS` |
| Endpoint health (`/`, `/api/health`, `/therapists`, `/pricing`) | ✅ | ✅ any failing |
| Cron freshness (reminders, no-shows, credentials) | ✅ | ✅ stale (> 2.5× cadence) |
| Support inbox unread | ✅ | ✅ > `ALERT_UNREAD_MAIL` |
| Open complaints | ✅ | ✅ ≥ `ALERT_OPEN_COMPLAINTS` |
| Therapists / clients / sessions / revenue / subscriptions | ✅ | — |
| Plausible traffic | ✅ | — |
| Exceptions | (Sentry) | (Sentry) |
