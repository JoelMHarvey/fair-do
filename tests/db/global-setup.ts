import { execSync } from 'node:child_process'

// Push the current schema onto the throwaway test database once, before any
// db tests run. Uses db push (not migrate) so the test DB always matches
// schema.prisma exactly, independent of migration reconciliation state.
export default function setup() {
  if (!process.env.DATABASE_URL) {
    throw new Error(
      'Real-DB tests need DATABASE_URL pointing at a DISPOSABLE Postgres.\n' +
      'Locally: start a throwaway Postgres and set DATABASE_URL (+ DIRECT_URL).\n' +
      'CI provides it via a postgres service.',
    )
  }
  // Prisma's datasource declares directUrl; default it to the same DB for tests.
  if (!process.env.DIRECT_URL) process.env.DIRECT_URL = process.env.DATABASE_URL

  execSync('npx prisma db push --skip-generate --accept-data-loss --force-reset', {
    stdio: 'inherit',
    env: process.env,
  })
}
