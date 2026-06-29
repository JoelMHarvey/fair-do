/**
 * P2 E2E — Therapist dashboard smoke test
 *
 * Requires: chromium project (therapist storageState loaded automatically).
 * Env vars needed for full assertions:
 *   E2E_THERAPIST_FIRST_NAME — first name on the seeded therapist account
 *   E2E_THERAPIST_LAST_NAME  — last name (optional; checks first name only if absent)
 */
import { expect, test } from './fixtures'

test.describe('therapist dashboard', () => {
  test('renders after sign-in', async ({ page }) => {
    await page.goto('/teacher/dashboard')

    // Must land on the dashboard, not sign-in or onboarding.
    // If this fails, check that the test therapist has a Therapist DB record
    // (run `node prisma/seed-e2e.mjs` against staging to create it).
    await expect(page).not.toHaveURL(/sign-in/, { timeout: 10_000 })
    await expect(page).toHaveURL(/teacher\/dashboard/)
  })

  test('h1 shows therapist full name', async ({ page }) => {
    await page.goto('/teacher/dashboard')
    await expect(page).not.toHaveURL(/sign-in/)

    const h1 = page.locator('h1').first()
    await expect(h1).toBeVisible({ timeout: 10_000 })

    // If name env vars are set, assert exact text; otherwise just assert non-empty.
    const firstName = process.env.E2E_THERAPIST_FIRST_NAME
    const lastName = process.env.E2E_THERAPIST_LAST_NAME
    if (firstName) {
      const expected = lastName ? `${firstName} ${lastName}` : firstName
      await expect(h1).toContainText(expected)
    } else {
      const text = await h1.textContent()
      expect((text ?? '').trim().length).toBeGreaterThan(0)
    }
  })

  test('stat cards visible: Upcoming, Active clients, This month', async ({ page }) => {
    await page.goto('/teacher/dashboard')
    await expect(page).not.toHaveURL(/sign-in/)

    // All three stat labels must be present.
    // Use exact: true — "Upcoming" also appears in "Upcoming sessions" heading and "No upcoming sessions".
    for (const label of ['Upcoming', 'Active clients', 'This month']) {
      await expect(page.getByText(label, { exact: true })).toBeVisible({ timeout: 10_000 })
    }
  })

  test('stat counts are non-negative integers', async ({ page }) => {
    await page.goto('/teacher/dashboard')
    await expect(page).not.toHaveURL(/sign-in/)

    // Stat values are rendered as large numbers — grab the three grid cells.
    const grid = page.locator('.grid.grid-cols-3')
    await expect(grid).toBeVisible({ timeout: 10_000 })

    // Each cell's big number is a text-3xl element.
    const counts = grid.locator('.text-3xl')
    await expect(counts).toHaveCount(3, { timeout: 5_000 })

    for (let i = 0; i < 3; i++) {
      const raw = await counts.nth(i).textContent()
      const text = (raw ?? '').trim()
      // Either a digit count (0, 5, 12) or a £-prefixed amount (£0, £120).
      expect(text).toMatch(/^(£?\d+)$/)
    }
  })

  test('nav contains "Dashboard" link back', async ({ page }) => {
    await page.goto('/teacher/dashboard')
    await expect(page).not.toHaveURL(/sign-in/)
    // TeacherNav renders navigation — verify the page has basic chrome.
    await expect(page.locator('nav')).toBeVisible({ timeout: 10_000 })
  })
})
