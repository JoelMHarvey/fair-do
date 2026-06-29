import { defineConfig, devices } from '@playwright/test'

/**
 * E2E tests run against a live staging deployment.
 * Required env vars:
 *   BASE_URL                  — staging app URL (e.g. https://staging.faresay.com)
 *   E2E_THERAPIST_EMAIL       — test therapist Clerk account
 *   E2E_THERAPIST_PASSWORD
 *   E2E_CLIENT_EMAIL          — test client Clerk account
 *   E2E_CLIENT_PASSWORD
 *   E2E_THERAPIST_SLUG        — practiceSlug of seeded test therapist (for self-book tests)
 *   E2E_TEST_SESSION_ID       — seeded session ID for room-access test
 *   E2E_TEST_GUEST_TOKEN      — guestToken for that session
 *   E2E_TEST_MATCH_ID         — seeded match ID for message-thread test
 *   E2E_THERAPIST_FIRST_NAME  — therapist first name for dashboard name assertion
 *   E2E_THERAPIST_LAST_NAME   — therapist last name (optional)
 *
 * Browser binaries: run `npx playwright install --with-deps chromium` once per machine/CI runner.
 * CI job: nightly / pre-deploy (see TEST-PLAN.md §5).
 */
export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false, // staging DB is shared — run sequentially to avoid state collisions
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: [['html', { open: 'never' }], ['list']],
  timeout: 30_000,
  use: {
    baseURL: process.env.BASE_URL ?? 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    // Don't follow redirects automatically for auth-flow assertions
    ignoreHTTPSErrors: true,
  },
  projects: [
    // Auth setup runs first — saves session state for therapist + client roles
    {
      name: 'setup',
      testMatch: /auth\.setup\.ts/,
    },
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        // Reuse auth state saved by setup project
        storageState: 'tests/e2e/.auth/therapist.json',
      },
      dependencies: ['setup'],
      // Exclude setup file and public-only specs (those run unauthenticated in chromium-public)
      testIgnore: /auth\.setup\.ts|self-booking\.spec\.ts|session-room\.spec\.ts/,
    },
    // Unauthenticated project for public-page tests
    {
      name: 'chromium-public',
      use: { ...devices['Desktop Chrome'] },
      testMatch: /self-booking\.spec\.ts|session-room\.spec\.ts/,
    },
  ],
})
