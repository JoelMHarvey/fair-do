/**
 * P2-4 — teacher lesson-note review route.
 * Teacher edits an AI draft and shares it; access + status transitions are locked.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'

const m = vi.hoisted(() => ({
  auth: vi.fn(),
  userFind: vi.fn(),
  noteFind: vi.fn(),
  noteUpdate: vi.fn(),
}))

vi.mock('@clerk/nextjs/server', () => ({ auth: m.auth }))
vi.mock('@/lib/lesson-notes', () => ({ AI_NOTES_ENABLED: true }))
vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: { findUnique: m.userFind },
    lessonNote: { findFirst: m.noteFind, update: m.noteUpdate },
  },
}))

import { POST } from '@/app/api/teacher/lesson-notes/route'

function req(body: object) {
  return new Request('http://localhost/x', { method: 'POST', body: JSON.stringify(body) })
}

beforeEach(() => {
  Object.values(m).forEach(fn => fn.mockReset())
  m.auth.mockResolvedValue({ userId: 'clerk_1' })
})

it('403 when the caller is not a teacher', async () => {
  m.userFind.mockResolvedValue({ id: 'u1', teacher: null })
  const res = await POST(req({ sessionId: 's1', action: 'save', topicsCovered: 'x' }))
  expect(res.status).toBe(403)
})

it('404 when the note is not the teacher’s', async () => {
  m.userFind.mockResolvedValue({ id: 'u1', teacher: { id: 't1' } })
  m.noteFind.mockResolvedValue(null)
  const res = await POST(req({ sessionId: 's1', action: 'save', topicsCovered: 'x' }))
  expect(res.status).toBe(404)
})

it('save edits the fields and marks the draft approved', async () => {
  m.userFind.mockResolvedValue({ id: 'u1', teacher: { id: 't1' } })
  m.noteFind.mockResolvedValue({ id: 'n1', status: 'draft' })
  m.noteUpdate.mockResolvedValue({ status: 'approved' })
  const res = await POST(req({ sessionId: 's1', action: 'save', topicsCovered: 'Quadratics', homework: 'Ex 4' }))
  expect(res.status).toBe(200)
  expect(m.noteUpdate).toHaveBeenCalledWith(expect.objectContaining({
    where: { id: 'n1' },
    data: expect.objectContaining({ topicsCovered: 'Quadratics', homework: 'Ex 4', status: 'approved' }),
  }))
})

it('share sets status shared + sharedAt', async () => {
  m.userFind.mockResolvedValue({ id: 'u1', teacher: { id: 't1' } })
  m.noteFind.mockResolvedValue({ id: 'n1', status: 'approved' })
  m.noteUpdate.mockResolvedValue({ status: 'shared' })
  const res = await POST(req({ sessionId: 's1', action: 'share', topicsCovered: 'Quadratics' }))
  expect(res.status).toBe(200)
  const arg = m.noteUpdate.mock.calls[0][0]
  expect(arg.data.status).toBe('shared')
  expect(arg.data.sharedAt).toBeInstanceOf(Date)
})
