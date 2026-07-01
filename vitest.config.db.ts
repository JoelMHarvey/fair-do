import { defineConfig } from 'vitest/config'
import tsconfigPaths from 'vite-tsconfig-paths'

// Real-database integration tests. Unlike the default suite (which mocks
// @/lib/prisma), these run the REAL Prisma client against a throwaway Postgres —
// so they exercise schema, constraints, cascades, and multi-table transactions
// that mocks can't catch. Requires DATABASE_URL (a disposable DB); wired in CI
// with a postgres service. Run: `npm run test:db`.
export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: 'node',
    alias: { 'server-only': '/dev/null' },
    include: ['tests/db/**/*.dbtest.ts'],
    globalSetup: ['tests/db/global-setup.ts'],
    fileParallelism: false, // one shared DB — run files serially
    hookTimeout: 60_000,
    testTimeout: 30_000,
  },
})
