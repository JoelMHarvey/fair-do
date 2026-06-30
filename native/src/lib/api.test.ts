/**
 * P3 — api.ts behaviour tests
 *
 * Tests the exported `apiFetch` utility and `ApiError` class.
 * fetch is mocked globally — no real network calls.
 *
 * Covers:
 *  - Bearer token attached when token provided
 *  - No Authorization header when token is null
 *  - Non-ok response → ApiError with correct status
 *  - 401 propagated as ApiError(401, ...)
 *  - Successful response → parsed through zod schema
 *  - Malformed JSON response → zod parse throws (propagates up)
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { z } from 'zod'

// Mock expo-constants before importing api.ts (it reads apiUrl at module level).
vi.mock('expo-constants', () => ({
  default: {
    expoConfig: { extra: { apiUrl: 'https://test.fair-do.com' } },
  },
}))

// Mock @clerk/clerk-expo — useApiFetch uses useAuth, but apiFetch doesn't.
// Still must be mocked because the import is at module level.
vi.mock('@clerk/clerk-expo', () => ({
  useAuth: vi.fn(),
}))

import { ApiError, apiFetch } from './api'

// ── ApiError ──────────────────────────────────────────────────────────────────

describe('ApiError', () => {
  it('is an instance of Error', () => {
    const e = new ApiError(404, 'Not found')
    expect(e).toBeInstanceOf(Error)
  })
  it('exposes status + message', () => {
    const e = new ApiError(422, 'Unprocessable')
    expect(e.status).toBe(422)
    expect(e.message).toBe('Unprocessable')
  })
  it('name is ApiError', () => {
    expect(new ApiError(500, 'x').name).toBe('ApiError')
  })
})

// ── apiFetch — bearer token ───────────────────────────────────────────────────

const SimpleSchema = z.object({ ok: z.boolean() })

function mockFetch(body: unknown, status = 200) {
  const res = new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(res))
  return vi.mocked(fetch)
}

beforeEach(() => {
  vi.restoreAllMocks()
})

describe('apiFetch — bearer token', () => {
  it('sets Authorization header when token is provided', async () => {
    const spy = mockFetch({ ok: true })
    await apiFetch('/api/test', 'my-token', SimpleSchema)
    const [url, init] = spy.mock.calls[0]
    expect(url).toBe('https://test.fair-do.com/api/test')
    expect((init?.headers as Record<string, string>)['Authorization']).toBe('Bearer my-token')
  })

  it('omits Authorization header when token is null', async () => {
    const spy = mockFetch({ ok: true })
    await apiFetch('/api/test', null, SimpleSchema)
    const [, init] = spy.mock.calls[0]
    expect((init?.headers as Record<string, string>)['Authorization']).toBeUndefined()
  })

  it('sets Content-Type: application/json unconditionally', async () => {
    const spy = mockFetch({ ok: true })
    await apiFetch('/api/test', null, SimpleSchema)
    const [, init] = spy.mock.calls[0]
    expect((init?.headers as Record<string, string>)['Content-Type']).toBe('application/json')
  })

  it('prepends API_URL to path', async () => {
    const spy = mockFetch({ ok: true })
    await apiFetch('/api/mobile/v1/dashboard', 'tok', SimpleSchema)
    expect((spy.mock.calls[0][0] as string)).toBe('https://test.fair-do.com/api/mobile/v1/dashboard')
  })
})

// ── apiFetch — error handling ─────────────────────────────────────────────────

describe('apiFetch — error responses', () => {
  it('throws ApiError on 401', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(
      new Response('Unauthorized', { status: 401 }),
    ))
    await expect(apiFetch('/api/test', 'bad-token', SimpleSchema)).rejects.toMatchObject({
      name: 'ApiError',
      status: 401,
    })
  })

  it('throws ApiError on 404', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(
      new Response('Not Found', { status: 404 }),
    ))
    await expect(apiFetch('/api/missing', 'tok', SimpleSchema)).rejects.toMatchObject({
      status: 404,
    })
  })

  it('throws ApiError on 500', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(
      new Response('Internal Server Error', { status: 500 }),
    ))
    await expect(apiFetch('/api/test', 'tok', SimpleSchema)).rejects.toMatchObject({
      status: 500,
    })
  })

  it('includes response text in error message', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(
      new Response('{"error":"rate limited"}', { status: 429 }),
    ))
    const err = await apiFetch('/api/test', 'tok', SimpleSchema).catch(e => e)
    expect(err.message).toContain('rate limited')
  })
})

// ── apiFetch — successful parse ───────────────────────────────────────────────

describe('apiFetch — success', () => {
  it('returns parsed data matching schema', async () => {
    mockFetch({ ok: true })
    const result = await apiFetch('/api/test', 'tok', SimpleSchema)
    expect(result).toEqual({ ok: true })
  })

  it('throws ZodError when response does not match schema', async () => {
    mockFetch({ totally: 'wrong shape' })
    await expect(apiFetch('/api/test', 'tok', SimpleSchema)).rejects.toThrow()
  })

  it('passes init options (method, body) through to fetch', async () => {
    const spy = mockFetch({ ok: true })
    await apiFetch('/api/test', 'tok', SimpleSchema, {
      method: 'POST',
      body: JSON.stringify({ x: 1 }),
    })
    const [, init] = spy.mock.calls[0]
    expect(init?.method).toBe('POST')
    expect(init?.body).toBe('{"x":1}')
  })
})

// ── Screen tests ──────────────────────────────────────────────────────────────
//
// React Native screen smoke-renders require @testing-library/react-native +
// jest-expo transforms (React Native components are not valid in Node).
// They cannot run in a Node vitest environment without a significant setup:
//
//   1. Install: jest-expo, @testing-library/react-native, @types/jest
//   2. Replace this vitest config with jest.config.js using the jest-expo preset
//   3. Mock: expo-router (useRouter), @clerk/clerk-expo (useAuth), @tanstack/react-query
//   4. Provide SafeAreaProvider + QueryClientProvider wrappers
//
// Until that setup is done the screen tests live here as .todo so they appear
// in the plan output and drive the work.
//
// ─── Dashboard screen ──
// test.todo('renders loading spinner while query is fetching')
// test.todo('renders teacher name in header once data resolves')
// test.todo('renders each session card from todaySessions')
// test.todo('renders critical AlertBanner when alerts array is non-empty')
// test.todo('renders empty state when todaySessions and upcomingSessions are empty')
//
// ─── Clients screen ──
// test.todo('renders client list from ClientsResponseSchema data')
// test.todo('renders unread-message badge when unreadMessages > 0')
// test.todo('renders empty state when clients array is empty')
//
// ─── Session room screen ──
// test.todo('renders Daily room iframe when isJoinable is true')
// test.todo('renders "session not yet live" message when isJoinable is false')
