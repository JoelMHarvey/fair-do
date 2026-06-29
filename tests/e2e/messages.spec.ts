/**
 * P2 E2E — Therapist message thread
 *
 * Verifies that a therapist can open a message thread and send a message.
 * Runs in the chromium project (therapist storageState loaded).
 *
 * Required env vars:
 *   E2E_TEST_MATCH_ID — ID of a seeded active match on staging
 *
 * If the var is absent the test is skipped.
 */
import { expect, test } from './fixtures'

const MATCH_ID = process.env.E2E_TEST_MATCH_ID

test.describe('message thread', () => {
  test.beforeEach(({ }, testInfo) => {
    if (!MATCH_ID) {
      testInfo.skip(true, 'Skipped — E2E_TEST_MATCH_ID not set')
    }
  })

  test('thread page loads without redirect', async ({ page }) => {
    await page.goto(`/messages/${MATCH_ID}`)
    await expect(page).not.toHaveURL(/sign-in/, { timeout: 10_000 })
    await expect(page).toHaveURL(new RegExp(`messages/${MATCH_ID}`))
  })

  test('renders empty-state or existing messages', async ({ page }) => {
    await page.goto(`/messages/${MATCH_ID}`)
    await expect(page).not.toHaveURL(/sign-in/)

    // Either "No messages yet" (empty thread) or at least one message bubble.
    const noMessages = page.getByText('No messages yet', { exact: false })
    const messageBubble = page.locator('[class*="rounded-2xl"]').filter({ hasText: /\S/ })

    await Promise.race([
      expect(noMessages).toBeVisible({ timeout: 10_000 }),
      expect(messageBubble.first()).toBeVisible({ timeout: 10_000 }),
    ])
  })

  test('therapist can send a message and it appears in the thread', async ({ page }) => {
    await page.goto(`/messages/${MATCH_ID}`)
    await expect(page).not.toHaveURL(/sign-in/)

    const uniqueText = `E2E test message ${Date.now()}`

    // MessageThread renders a textarea for message input.
    const textarea = page.locator('textarea')
    await expect(textarea).toBeVisible({ timeout: 10_000 })
    await textarea.fill(uniqueText)

    // POST to /api/messages/send is triggered by the Send button or Enter key.
    const [response] = await Promise.all([
      page.waitForResponse(
        res => res.url().includes('/api/messages/send') && res.status() < 400,
        { timeout: 10_000 },
      ),
      textarea.press('Enter'),
    ])

    expect(response.status()).toBeLessThan(400)

    // The sent message must appear in the thread.
    await expect(page.getByText(uniqueText, { exact: false })).toBeVisible({ timeout: 5_000 })

    // Textarea is cleared after send.
    await expect(textarea).toHaveValue('', { timeout: 3_000 })
  })
})
