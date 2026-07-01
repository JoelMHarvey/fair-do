# Database migrations

## Background

Until now the only migration on disk was `0001_init`, which described the
**pre-rebrand** schema (`Therapist`, `Client`, …). The live schema (`Teacher`,
`Student`, parent portal, subscriptions, lesson notes, recurring, etc.) was
applied to production with `prisma db push` and never captured as a migration.

Consequence: `prisma migrate deploy` (run in the Vercel build) replayed only the
old schema, so a database built from the repo did **not** match the app — the
root cause of repeated production schema-drift 500s.

This directory now contains a single **baseline** migration
(`20260701000000_baseline`) generated from the current `schema.prisma`. It is the
authoritative starting point. From here, schema changes go through normal Prisma
migrations.

---

## ⚠ CURRENT STATE: `migrate deploy` is temporarily OFF the Vercel build

The Vercel `buildCommand` was reverted to `npx prisma generate && next build` (no
`migrate deploy`). Reason: when the baseline first deployed, `migrate deploy` tried
to run it against the already-populated prod DB, failed (`CREATE TABLE Teacher…`
already exists), and left a **failed migration** — Prisma then refused all deploys
with **`P3009`**. Dropping `migrate deploy` restores deployability; schema changes
are applied manually via `db push` (the historical workflow) until reconciliation.

**To re-enable auto-migrations:** complete the reconciliation below, then restore
the build command to `npx prisma generate && npx prisma migrate deploy && next build`.

### Recovering from P3009 (do this once, with DIRECT_URL)

```bash
# 0. Backup / Neon branch snapshot first.
# 1. Clear the failed baseline record so Prisma stops refusing.
DATABASE_URL="$DIRECT_URL" npx prisma migrate resolve --rolled-back 20260701000000_baseline
# 2. Bring the DB fully to the current schema (idempotent).
DATABASE_URL="$DIRECT_URL" npx prisma db push
# 3. Mark BOTH migrations as applied (they match the live schema; don't re-run).
DATABASE_URL="$DIRECT_URL" npx prisma migrate resolve --applied 20260701000000_baseline
DATABASE_URL="$DIRECT_URL" npx prisma migrate resolve --applied 20260701010000_error_event
# 4. Confirm clean.
DATABASE_URL="$DIRECT_URL" npx prisma migrate status   # → "No pending migrations"
# 5. Restore `migrate deploy` in vercel.json (see above).
```

---

## One-time reconciliation of EXISTING databases (production, staging/UAT)

These databases already contain the current tables (built via `db push`), so the
baseline must be **marked as applied without running it**. Do this once per
existing environment, ideally during a quiet window and after a backup / Neon
branch snapshot.

Use the **direct (non-pooler)** connection string for all of these
(`DIRECT_URL` — the Neon host **without** `-pooler`; Prisma Migrate needs
advisory locks that PgBouncer doesn't support).

```bash
# 0. SAFETY: take a Neon branch/snapshot first.

# 1. Bring the DB fully up to the current schema (adds anything still missing,
#    e.g. Payment.fundingOrgId and the new indexes from the latest PRs).
DATABASE_URL="$DIRECT_URL" npx prisma db push

# 2. Inspect existing migration state. If a `_prisma_migrations` row for the old
#    `0001_init` exists (or a failed row), it must be cleared so the baseline can
#    be the sole history.
DATABASE_URL="$DIRECT_URL" psql "$DIRECT_URL" -c 'SELECT migration_name, finished_at, rolled_back_at FROM "_prisma_migrations";'
#    If rows exist for 0001_init / anything pre-baseline:
DATABASE_URL="$DIRECT_URL" psql "$DIRECT_URL" -c 'DELETE FROM "_prisma_migrations";'
#    (If the table does not exist yet, that's fine — resolve will create it.)

# 3. Mark the baseline as already applied (does NOT run the SQL).
DATABASE_URL="$DIRECT_URL" npx prisma migrate resolve --applied 20260701000000_baseline

# 4. Verify clean state — should report "No pending migrations".
DATABASE_URL="$DIRECT_URL" npx prisma migrate status
```

After this, the Vercel build's `prisma migrate deploy` is a correct no-op on
these environments, and prod schema is reproducible from the repo.

---

## Fresh environments (new dev clone, new Neon branch)

Nothing special — the baseline builds the whole schema:

```bash
DATABASE_URL="$DIRECT_URL" npx prisma migrate deploy   # runs the baseline
# or for local iteration:
DATABASE_URL="$DIRECT_URL" npx prisma migrate dev
```

---

## Making schema changes from now on

1. Edit `prisma/schema.prisma`.
2. `npx prisma migrate dev --name <change>` (creates + applies a migration locally).
3. Commit the generated `prisma/migrations/<ts>_<change>/` folder.
4. Deploy — Vercel build runs `prisma migrate deploy` and applies it everywhere.

**Stop using `prisma db push` for production schema changes** (it leaves no
history and reintroduces drift). `db push` is fine for throwaway local spikes
only.
