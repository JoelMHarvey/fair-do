/** Teacher credential-visibility toggle (show certs on the parent portal). */
import { describe, it, expect, vi, beforeEach } from 'vitest'

const m = vi.hoisted(() => ({ auth: vi.fn(), userFind: vi.fn(), teacherUpdate: vi.fn() }))
vi.mock('@clerk/nextjs/server', () => ({ auth: m.auth }))
vi.mock('@/lib/prisma', () => ({ prisma: { user: { findUnique: m.userFind }, teacher: { update: m.teacherUpdate } } }))

import { POST } from '@/app/api/teacher/credential-visibility/route'

const req = (body: object) => new Request('http://localhost/x', { method: 'POST', body: JSON.stringify(body) })

beforeEach(() => {
  Object.values(m).forEach(fn => fn.mockReset())
  m.auth.mockResolvedValue({ userId: 'clerk_1' })
})

it('403 when not a teacher', async () => {
  m.userFind.mockResolvedValue({ teacher: null })
  expect((await POST(req({ show: true }))).status).toBe(403)
})

it('400 on a non-boolean payload', async () => {
  m.userFind.mockResolvedValue({ teacher: { id: 't1' } })
  expect((await POST(req({ show: 'yes' }))).status).toBe(400)
})

it('updates showCredentialToParents', async () => {
  m.userFind.mockResolvedValue({ teacher: { id: 't1' } })
  m.teacherUpdate.mockResolvedValue({})
  const res = await POST(req({ show: true }))
  expect(res.status).toBe(200)
  expect(m.teacherUpdate).toHaveBeenCalledWith({ where: { id: 't1' }, data: { showCredentialToParents: true } })
})
