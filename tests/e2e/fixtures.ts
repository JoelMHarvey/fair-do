/**
 * Shared Playwright fixtures and helpers for the fair-do E2E suite.
 */
import { test as base, expect, type Page } from '@playwright/test'
import path from 'path'

export { expect }

// Guards a test when required env vars are absent, skipping cleanly instead of failing.
export function requireEnvOrSkip(test: typeof base, ...names: string[]): void {
  test.skip(
    names.some(n => !process.env[n]),
    `Skipped — missing env: ${names.filter(n => !process.env[n]).join(', ')}`,
  )
}

// Extend base test with a 'clientPage' fixture that loads client auth state.
export const test = base.extend<{ clientPage: Page }>({
  clientPage: async ({ browser }, use) => {
    const clientFile = path.join(__dirname, '.auth', 'client.json')
    const context = await browser.newContext({ storageState: clientFile })
    const page = await context.newPage()
    await use(page)
    await context.close()
  },
})

// Wait for a network response from a given path prefix.
export async function waitForApiResponse(page: Page, pathPrefix: string) {
  return page.waitForResponse(
    res => res.url().includes(pathPrefix) && res.status() < 400,
    { timeout: 10_000 },
  )
}
