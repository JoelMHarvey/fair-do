/**
 * Auth setup — runs once before the chromium project.
 *
 * Uses Clerk's backend sign-in token API (requires CLERK_SECRET_KEY) to
 * authenticate programmatically — bypasses the browser form and all Clerk
 * new-device / email-OTP challenges that fire on fresh CI runners.
 *
 * Falls back to UI-based sign-in if CLERK_SECRET_KEY is absent (for local
 * runs where the secret key isn't exported).
 */
import { test as setup } from '@playwright/test'
import path from 'path'
import fs from 'fs'

setup.setTimeout(90_000)

const TEACHER_FILE = path.join(__dirname, '.auth', 'teacher.json')
const STUDENT_FILE = path.join(__dirname, '.auth', 'student.json')

function emptyState(file: string) {
  fs.mkdirSync(path.dirname(file), { recursive: true })
  fs.writeFileSync(file, JSON.stringify({ cookies: [], origins: [] }))
}

// ── Clerk backend token auth ───────────────────────────────────────────────
// Looks up the user by email, creates a short-lived sign-in token, navigates
// to the embedded Clerk sign-in URL with that token so Clerk sets all session
// cookies without any browser UI interaction.

async function clerkUserIdByEmail(email: string, secretKey: string): Promise<string | null> {
  const res = await fetch(
    `https://api.clerk.com/v1/users?email_address=${encodeURIComponent(email)}&limit=1`,
    { headers: { Authorization: `Bearer ${secretKey}` } },
  )
  if (!res.ok) {
    console.warn(`[e2e] Clerk users lookup ${res.status}`)
    return null
  }
  const users = await res.json() as { id: string }[]
  return users[0]?.id ?? null
}

async function clerkSignInToken(userId: string, secretKey: string): Promise<string | null> {
  const res = await fetch('https://api.clerk.com/v1/sign_in_tokens', {
    method: 'POST',
    headers: { Authorization: `Bearer ${secretKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id: userId, expires_in_seconds: 120 }),
  })
  if (!res.ok) {
    const body = await res.text().catch(() => '')
    console.warn(`[e2e] Clerk sign_in_tokens ${res.status}: ${body}`)
    return null
  }
  const data = await res.json() as { token: string }
  return data.token ?? null
}

async function signInViaToken(
  page: import('@playwright/test').Page,
  email: string,
  redirectTo: string,
): Promise<boolean> {
  const secretKey = process.env.CLERK_SECRET_KEY
  if (!secretKey) {
    console.warn('[e2e] CLERK_SECRET_KEY not set — cannot use token auth')
    return false
  }

  const userId = await clerkUserIdByEmail(email, secretKey)
  if (!userId) {
    console.warn(`[e2e] No Clerk user found for ${email}`)
    return false
  }
  console.log(`[e2e] Clerk user ID for ${email}: ${userId}`)

  const token = await clerkSignInToken(userId, secretKey)
  if (!token) return false

  // Clerk processes the ticket at the sign-in URL and redirects to the app.
  await page.goto(`/sign-in?__clerk_ticket=${token}`)
  await page.waitForURL(
    url => !url.pathname.startsWith('/sign-in'),
    { timeout: 20_000 },
  ).catch(() => {})

  if (page.url().includes('/sign-in')) {
    console.warn(`[e2e] Token auth: still on sign-in at ${page.url()}`)
    await page.screenshot({ path: 'test-results/auth-failure.png' }).catch(() => {})
    return false
  }

  console.log(`[e2e] Token auth succeeded → ${page.url()}`)
  return true
}

// ── UI-based fallback ──────────────────────────────────────────────────────

async function signInViaUI(
  page: import('@playwright/test').Page,
  email: string,
  password: string,
  redirectTo: string,
): Promise<boolean> {
  try {
    await page.goto('/sign-in')
    await page.waitForLoadState('networkidle')
    await page.getByLabel(/email/i).fill(email)
    await page.locator('[data-localization-key="formButtonPrimary"]').click()
    await page.waitForSelector('input[type="password"]', { timeout: 10_000 }).catch(() => null)

    if (!page.url().includes('/sign-in')) return true
    if (page.url().includes('/factor-two')) return false

    const hasPassword = await page.locator('input[type="password"]').isVisible().catch(() => false)
    if (!hasPassword) return false

    await page.waitForLoadState('networkidle')
    await page.locator('input[type="password"]').fill(password)
    await page.locator('[data-localization-key="formButtonPrimary"]').click()
    await page.waitForURL(url => !url.pathname.startsWith('/sign-in/factor-one'), { timeout: 15_000 }).catch(() => {})

    if (page.url().includes('/sign-in')) {
      console.warn(`[e2e] UI auth: ended up at ${page.url()}`)
      return false
    }
    return true
  } catch (err) {
    console.warn(`[e2e] UI sign-in threw: ${String(err)}`)
    await page.screenshot({ path: 'test-results/auth-failure.png' }).catch(() => {})
    return false
  }
}

// ── Setup tasks ────────────────────────────────────────────────────────────

setup('sign in as teacher', async ({ page }) => {
  const email = process.env.E2E_TEACHER_EMAIL
  const password = process.env.E2E_TEACHER_PASSWORD

  if (!email || !password) {
    console.warn('[e2e] Skipping teacher auth — E2E_TEACHER_EMAIL/PASSWORD not set')
    emptyState(TEACHER_FILE)
    return
  }

  const ok = process.env.CLERK_SECRET_KEY
    ? await signInViaToken(page, email, '/teacher/dashboard')
    : await signInViaUI(page, email, password, '/teacher/dashboard')

  if (!ok) throw new Error('Teacher sign-in failed — check Clerk secrets and logs')

  await page.context().storageState({ path: TEACHER_FILE })
  console.log('[e2e] Teacher auth saved →', TEACHER_FILE)
})

setup('sign in as student', async ({ page }) => {
  const email = process.env.E2E_STUDENT_EMAIL
  const password = process.env.E2E_STUDENT_PASSWORD

  if (!email || !password) {
    console.warn('[e2e] Skipping student auth — E2E_STUDENT_EMAIL/PASSWORD not set')
    emptyState(STUDENT_FILE)
    return
  }

  const ok = process.env.CLERK_SECRET_KEY
    ? await signInViaToken(page, email, '/dashboard')
    : await signInViaUI(page, email, password, '/dashboard')

  if (!ok) throw new Error('Student sign-in failed — check Clerk secrets and logs')

  await page.context().storageState({ path: STUDENT_FILE })
  console.log('[e2e] Student auth saved →', STUDENT_FILE)
})
