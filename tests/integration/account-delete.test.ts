import { describe, it, expect, vi, beforeEach } from 'vitest'

const m = vi.hoisted(() => ({
  auth: vi.fn(),
  deleteUser: vi.fn(),
  erase: vi.fn(),
}))

vi.mock('@clerk/nextjs/server', () => ({
  auth: m.auth,
  clerkClient: async () => ({ users: { deleteUser: m.deleteUser } }),
}))
vi.mock('@/lib/erasure', () => ({ eraseUserByClerkId: m.erase }))
vi.mock('@/lib/ratelimit', () => ({
  checkRateLimit: vi.fn(async () => ({ allowed: true })),
  rateLimitResponse: vi.fn(() => new Response('rl', { status: 429 })),
}))
vi.mock('next/headers', () => ({ headers: vi.fn(async () => ({ get: () => null })) }))

import { POST } from '@/app/api/account/delete/route'

const req = (body: unknown) => new Request('http://localhost/x', { method: 'POST', body: JSON.stringify(body) })

beforeEach(() => {
  Object.values(m).forEach(fn => fn.mockReset())
  m.auth.mockResolvedValue({ userId: 'ck1' })
  m.erase.mockResolvedValue({ userId: 'u1', role: 'STUDENT', scrubbed: ['student'] })
  m.deleteUser.mockResolvedValue({})
})

describe('POST /api/account/delete', () => {
  it('401 when unauthenticated', async () => {
    m.auth.mockResolvedValue({ userId: null })
    expect((await POST(req({ confirm: 'DELETE' }))).status).toBe(401)
  })

  it('400 without the typed confirmation', async () => {
    expect((await POST(req({ confirm: 'yes' }))).status).toBe(400)
    expect(m.erase).not.toHaveBeenCalled()
  })

  it('erases data then deletes the Clerk identity', async () => {
    const res = await POST(req({ confirm: 'DELETE' }))
    expect(res.status).toBe(200)
    expect(m.erase).toHaveBeenCalledWith('ck1')
    expect(m.deleteUser).toHaveBeenCalledWith('ck1')
  })

  it('500 and does NOT delete the Clerk identity if erasure fails', async () => {
    m.erase.mockRejectedValue(new Error('db'))
    const res = await POST(req({ confirm: 'DELETE' }))
    expect(res.status).toBe(500)
    expect(m.deleteUser).not.toHaveBeenCalled()
  })
})
