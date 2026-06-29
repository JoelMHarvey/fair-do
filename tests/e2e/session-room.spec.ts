/**
 * P2 E2E — Session room guest-token access
 *
 * Verifies that a self-booked (account-less) client can open the session room
 * via the signed ?k= link without any Clerk authentication.
 *
 * Runs in the chromium-public project (no storageState loaded).
 *
 * Required env vars:
 *   E2E_TEST_SESSION_ID   — ID of a seeded SCHEDULED session in staging
 *   E2E_TEST_GUEST_TOKEN  — guestToken value stored on that session row
 *
 * If either var is absent the test is skipped (not failed) so the suite stays
 * green in environments where staging is not wired up.
 */
import { test, expect } from '@playwright/test'

const SESSION_ID = process.env.E2E_TEST_SESSION_ID
const GUEST_TOKEN = process.env.E2E_TEST_GUEST_TOKEN

test.describe('session room — guest token access', () => {
  test.beforeEach(({ }, testInfo) => {
    if (!SESSION_ID || !GUEST_TOKEN) {
      testInfo.skip(true, 'Skipped — E2E_TEST_SESSION_ID / E2E_TEST_GUEST_TOKEN not set')
    }
  })

  test('valid ?k= token grants room access without Clerk auth', async ({ page }) => {
    const url = `/session/${SESSION_ID}?k=${GUEST_TOKEN}`
    await page.goto(url)

    // Must NOT be redirected to sign-in or dashboard (those mean token rejected).
    await expect(page).not.toHaveURL(/sign-in/, { timeout: 10_000 })
    await expect(page).not.toHaveURL(/^.*\/dashboard$/)

    // The session room nav always renders the "faresay" brand text.
    await expect(page.getByText('faresay', { exact: true })).toBeVisible({ timeout: 10_000 })
  })

  test('missing ?k= token redirects unauthenticated user to sign-in', async ({ page }) => {
    await page.goto(`/session/${SESSION_ID}`)
    // Without a valid token and without Clerk auth → redirect to /sign-in.
    await expect(page).toHaveURL(/sign-in/, { timeout: 10_000 })
  })

  test('wrong ?k= value redirects to sign-in', async ({ page }) => {
    // Token must be the exact length + value; a different token is rejected.
    const badToken = 'a'.repeat(GUEST_TOKEN!.length)
    // Only run if the bad token is actually different from the real one.
    test.skip(badToken === GUEST_TOKEN, 'Bad token happens to equal real token — skipping')

    await page.goto(`/session/${SESSION_ID}?k=${badToken}`)
    await expect(page).toHaveURL(/sign-in/, { timeout: 10_000 })
  })

  test('session room renders "← Dashboard" back link', async ({ page }) => {
    await page.goto(`/session/${SESSION_ID}?k=${GUEST_TOKEN}`)
    await expect(page).not.toHaveURL(/sign-in/)
    // Guest clients see the back link pointing to /dashboard.
    await expect(page.getByText('← Dashboard', { exact: false })).toBeVisible({ timeout: 10_000 })
  })
})
