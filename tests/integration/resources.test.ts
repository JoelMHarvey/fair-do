/**
 * P2-5 — resource sharing route auth.
 * Teacher and student both upload to a match they own; only the teacher toggles
 * visibility; students can only delete their own uploads.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'

const m = vi.hoisted(() => ({
  auth: vi.fn(),
  userFind: vi.fn(),
  matchFind: vi.fn(),
  docCreate: vi.fn(),
  docFind: vi.fn(),
  docUpdate: vi.fn(),
  docDelete: vi.fn(),
  subFind: vi.fn(),
  docAgg: vi.fn(),
}))

vi.mock('@clerk/nextjs/server', () => ({ auth: m.auth }))
vi.mock('@/lib/resources', () => ({
  RESOURCES_ENABLED: true,
  MAX_RESOURCE_BYTES: 25 * 1024 * 1024,
  RESOURCE_CATEGORIES: ['worksheet', 'homework', 'past-paper', 'notes', 'submission', 'other'],
  FREE_TIER_STORAGE_BYTES: 100 * 1024 * 1024,
  STORAGE_UNLIMITED_TIERS: new Set(['pro', 'school', 'enterprise', 'practice', 'clinic']),
}))
vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: { findUnique: m.userFind },
    match: { findUnique: m.matchFind },
    subscription: { findUnique: m.subFind },
    studentDocument: { create: m.docCreate, findUnique: m.docFind, update: m.docUpdate, delete: m.docDelete, aggregate: m.docAgg },
  },
}))
vi.mock('@/lib/ratelimit', () => ({
  checkRateLimit: vi.fn(async () => ({ allowed: true })),
  rateLimitResponse: vi.fn(() => new Response('rl', { status: 429 })),
}))
vi.mock('next/headers', () => ({ headers: vi.fn(async () => ({ get: () => null })) }))

import { POST, PATCH, DELETE } from '@/app/api/resources/route'

const req = (body: object) => new Request('http://localhost/x', { method: 'POST', body: JSON.stringify(body) })
const create = { matchId: 'mt1', label: 'sheet.pdf', url: 'https://cdn/x.pdf', category: 'worksheet', fileName: 'sheet.pdf', fileSizeBytes: 1000 }

beforeEach(() => {
  Object.values(m).forEach(fn => fn.mockReset())
  m.auth.mockResolvedValue({ userId: 'clerk_1' })
  m.matchFind.mockResolvedValue({ teacherId: 't1', studentId: 's1' })
  m.subFind.mockResolvedValue({ tier: 'pro', status: 'active' }) // unlimited by default
  m.docAgg.mockResolvedValue({ _sum: { fileSizeBytes: 0 } })
})

describe('POST /api/resources', () => {
  it('403 when the caller owns neither side of the match', async () => {
    m.userFind.mockResolvedValue({ teacher: { id: 't_other' }, student: null })
    const res = await POST(req(create))
    expect(res.status).toBe(403)
  })

  it('teacher upload is tagged uploadedBy=teacher', async () => {
    m.userFind.mockResolvedValue({ teacher: { id: 't1' }, student: null })
    m.docCreate.mockResolvedValue({ id: 'd1' })
    const res = await POST(req(create))
    expect(res.status).toBe(201)
    expect(m.docCreate).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ uploadedBy: 'teacher', studentVisible: true }) }))
  })

  it('student upload is tagged uploadedBy=student', async () => {
    m.userFind.mockResolvedValue({ teacher: null, student: { id: 's1' } })
    m.docCreate.mockResolvedValue({ id: 'd2' })
    const res = await POST(req({ ...create, category: 'submission' }))
    expect(res.status).toBe(201)
    expect(m.docCreate).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ uploadedBy: 'student' }) }))
  })

  it('413 when a free-tier teacher is over the storage quota', async () => {
    m.userFind.mockResolvedValue({ teacher: { id: 't1' }, student: null })
    m.subFind.mockResolvedValue({ tier: 'free', status: 'active' }) // not unlimited
    m.docAgg.mockResolvedValue({ _sum: { fileSizeBytes: 100 * 1024 * 1024 } }) // already at cap
    const res = await POST(req({ ...create, fileSizeBytes: 1 }))
    expect(res.status).toBe(413)
    expect(m.docCreate).not.toHaveBeenCalled()
  })

  it('allows a paid (unlimited) teacher regardless of usage', async () => {
    m.userFind.mockResolvedValue({ teacher: { id: 't1' }, student: null })
    m.subFind.mockResolvedValue({ tier: 'pro', status: 'active' })
    m.docAgg.mockResolvedValue({ _sum: { fileSizeBytes: 500 * 1024 * 1024 } })
    m.docCreate.mockResolvedValue({ id: 'd9' })
    const res = await POST(req(create))
    expect(res.status).toBe(201)
  })
})

describe('PATCH /api/resources (visibility)', () => {
  it('403 when a student tries to toggle visibility', async () => {
    m.docFind.mockResolvedValue({ matchId: 'mt1' })
    m.userFind.mockResolvedValue({ teacher: null, student: { id: 's1' } })
    const res = await PATCH(req({ id: 'd1', studentVisible: false }))
    expect(res.status).toBe(403)
    expect(m.docUpdate).not.toHaveBeenCalled()
  })

  it('teacher can toggle visibility', async () => {
    m.docFind.mockResolvedValue({ matchId: 'mt1' })
    m.userFind.mockResolvedValue({ teacher: { id: 't1' }, student: null })
    m.docUpdate.mockResolvedValue({})
    const res = await PATCH(req({ id: 'd1', studentVisible: false }))
    expect(res.status).toBe(200)
    expect(m.docUpdate).toHaveBeenCalled()
  })
})

describe('DELETE /api/resources', () => {
  it('403 when a student deletes a teacher-uploaded file', async () => {
    m.docFind.mockResolvedValue({ matchId: 'mt1', uploadedBy: 'teacher' })
    m.userFind.mockResolvedValue({ teacher: null, student: { id: 's1' } })
    const res = await DELETE(req({ id: 'd1' }))
    expect(res.status).toBe(403)
    expect(m.docDelete).not.toHaveBeenCalled()
  })

  it('student can delete their own upload', async () => {
    m.docFind.mockResolvedValue({ matchId: 'mt1', uploadedBy: 'student' })
    m.userFind.mockResolvedValue({ teacher: null, student: { id: 's1' } })
    m.docDelete.mockResolvedValue({})
    const res = await DELETE(req({ id: 'd1' }))
    expect(res.status).toBe(200)
    expect(m.docDelete).toHaveBeenCalled()
  })
})
