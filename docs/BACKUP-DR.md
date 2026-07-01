# Backup & disaster recovery

The application is stateless (Vercel) — the only durable state is the **Neon
Postgres** database and a few external systems of record (Stripe, Clerk, Cloudinary).
This doc is the recovery posture and runbook. **Items marked ☐ need the founder to
confirm the actual Neon plan settings.**

## What holds state

| System | State | Recovery source of truth |
|---|---|---|
| **Neon Postgres** | All app data | Neon PITR + branch snapshots (below) |
| **Stripe** | Payments, subscriptions, Connect accounts | Stripe is authoritative; the DB mirrors it and is re-syncable via webhooks |
| **Clerk** | User identities / auth | Clerk is authoritative for identity |
| **Cloudinary** | Uploaded images/docs | Cloudinary storage (no second copy) |
| **Vercel** | None (stateless) | Redeploy from GitHub |

## Neon backups

Neon provides continuous WAL-based **point-in-time restore (PITR)** and branch
snapshots. Confirm and record:

- ☐ **PITR retention window** on the current plan (free ≈ 24h; paid ≈ 7–30 days).
  For a platform handling payments + children's data, target **≥ 7 days**.
- ☐ Whether a **daily branch snapshot** is scheduled (belt-and-braces over PITR).
- ☐ Region + whether backups are in the same region (residency for UK-GDPR).

**RPO / RTO targets (proposed — confirm):** RPO ≤ 5 min (PITR is continuous),
RTO ≤ 1 hour (restore a branch + repoint `DATABASE_URL`).

## Restore runbook

1. **Assess** — is it data loss (bad migration / accidental delete) or a Neon
   outage? For an outage, check Neon status; PITR restore only helps for data loss.
2. **Create a restore branch** in the Neon console at the target timestamp
   (just before the incident). This is non-destructive — it does not touch the
   current branch.
3. **Verify** the restore branch has the expected data (connect with `psql`, spot-check
   recent rows).
4. **Repoint the app**: update `DATABASE_URL` (pooled) + `DIRECT_URL` (non-pooler) in
   Vercel to the restore branch, redeploy. Or promote the restore branch to primary.
5. **Reconcile Stripe/Clerk drift**: any payments/signups between the restore point and
   now are safe in Stripe/Clerk — replay Stripe webhooks (Stripe Dashboard → resend
   events) and let the Clerk `user.created` webhook re-create any missing user rows.
6. **Post-incident**: confirm crons resumed (check `/admin/health` / `/api/metrics`),
   watch the `app_errors` alert, write up the incident.

## Migrations safety

Schema changes are the most likely self-inflicted DR event. Before any prod schema
change: **take a Neon branch snapshot first** (see docs/MIGRATIONS.md), then
`prisma migrate deploy`. Never `db push` to prod without a snapshot.

## Gaps / TODO

- ☐ Confirm & document the Neon PITR retention window (raise plan if < 7 days).
- ☐ Cloudinary has no second copy — consider periodic export of uploaded documents,
  or treat uploads as non-critical (users can re-upload).
- No automated restore test yet — do a **quarterly restore drill** (restore to a
  branch, verify, discard) to validate this runbook.
- PII in old backups persists past a GDPR erasure until the backup rotates out of the
  retention window — note this in erasure responses (see DATA-RETENTION.md).
