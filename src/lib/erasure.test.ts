import { describe, it, expect, vi, beforeEach } from 'vitest'

const m = vi.hoisted(() => ({
  userFind: vi.fn(), userUpdate: vi.fn(),
  msgUpdateMany: vi.fn(), pmsgUpdateMany: vi.fn(),
  complaintUpdateMany: vi.fn(), credUpdateMany: vi.fn(), settingUpdateMany: vi.fn(), inboxUpdateMany: vi.fn(),
  pushDeleteMany: vi.fn(), deviceDeleteMany: vi.fn(),
  voucherUpdateMany: vi.fn(), pendingDeleteMany: vi.fn(),
  sessionFindMany: vi.fn(), matchFindMany: vi.fn(),
  transcriptDeleteMany: vi.fn(), noteUpdateMany: vi.fn(), formDeleteMany: vi.fn(), docDeleteMany: vi.fn(),
  reviewUpdateMany: vi.fn(), studentUpdate: vi.fn(), matchUpdateMany: vi.fn(),
  broadcastDeleteMany: vi.fn(), templateDeleteMany: vi.fn(), inviteDeleteMany: vi.fn(), availDeleteMany: vi.fn(),
  teacherUpdate: vi.fn(), parentLinkUpdateMany: vi.fn(),
  transaction: vi.fn(),
}))

vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: { findUnique: m.userFind, update: m.userUpdate },
    message: { updateMany: m.msgUpdateMany },
    parentMessage: { updateMany: m.pmsgUpdateMany },
    complaint: { updateMany: m.complaintUpdateMany },
    credentialCheck: { updateMany: m.credUpdateMany },
    setting: { updateMany: m.settingUpdateMany },
    inboxMessage: { updateMany: m.inboxUpdateMany },
    pushSubscription: { deleteMany: m.pushDeleteMany },
    nativeDevice: { deleteMany: m.deviceDeleteMany },
    giftVoucher: { updateMany: m.voucherUpdateMany },
    pendingSelfBooking: { deleteMany: m.pendingDeleteMany },
    session: { findMany: m.sessionFindMany },
    match: { findMany: m.matchFindMany, updateMany: m.matchUpdateMany },
    lessonTranscript: { deleteMany: m.transcriptDeleteMany },
    lessonNote: { updateMany: m.noteUpdateMany },
    studentForm: { deleteMany: m.formDeleteMany },
    studentDocument: { deleteMany: m.docDeleteMany },
    review: { updateMany: m.reviewUpdateMany },
    student: { update: m.studentUpdate },
    broadcast: { deleteMany: m.broadcastDeleteMany },
    broadcastTemplate: { deleteMany: m.templateDeleteMany },
    studentInvite: { deleteMany: m.inviteDeleteMany },
    availability: { deleteMany: m.availDeleteMany },
    teacher: { update: m.teacherUpdate },
    parentLink: { updateMany: m.parentLinkUpdateMany },
    $transaction: m.transaction,
  },
}))

import { eraseUserByClerkId } from '@/lib/erasure'

beforeEach(() => {
  Object.values(m).forEach(fn => fn.mockReset())
  m.sessionFindMany.mockResolvedValue([])
  m.matchFindMany.mockResolvedValue([])
  m.transaction.mockResolvedValue([])
})

describe('eraseUserByClerkId', () => {
  it('returns null for an unknown clerk id', async () => {
    m.userFind.mockResolvedValue(null)
    expect(await eraseUserByClerkId('nope')).toBeNull()
  })

  it('pseudonymises a student: scrubs identity, anonymises the user row, keeps no payment touch', async () => {
    m.userFind.mockResolvedValue({ id: 'u1', clerkId: 'ck1', email: 'kid@x.com', role: 'STUDENT', student: { id: 's1' }, teacher: null })
    const res = await eraseUserByClerkId('ck1')

    expect(res).toEqual({ userId: 'u1', role: 'STUDENT', scrubbed: ['student'] })
    // identity row anonymised
    expect(m.userUpdate).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: 'u1' },
      data: expect.objectContaining({ email: 'deleted+u1@anon.invalid', clerkId: 'deleted_u1' }),
    }))
    // student profile scrubbed
    expect(m.studentUpdate).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: 's1' },
      data: expect.objectContaining({ firstName: 'Deleted', contactEmail: null, dateOfBirth: null }),
    }))
    // authored messages redacted, not deleted
    expect(m.msgUpdateMany).toHaveBeenCalledWith(expect.objectContaining({
      where: { senderClerkId: 'ck1' },
      data: expect.objectContaining({ body: '[deleted]', senderClerkId: 'deleted' }),
    }))
    // student's own transcripts removed
    expect(m.transcriptDeleteMany).toHaveBeenCalled()
    // a single transaction wraps the work
    expect(m.transaction).toHaveBeenCalledTimes(1)
    // teacher-only ops not run for a student
    expect(m.teacherUpdate).not.toHaveBeenCalled()
  })

  it('pseudonymises a teacher: scrubs profile + deletes teacher-only personal rows', async () => {
    m.userFind.mockResolvedValue({ id: 'u2', clerkId: 'ck2', email: 't@x.com', role: 'TEACHER', student: null, teacher: { id: 't1' } })
    const res = await eraseUserByClerkId('ck2')

    expect(res?.scrubbed).toContain('teacher')
    expect(m.teacherUpdate).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: 't1' },
      data: expect.objectContaining({ firstName: 'Deleted', bio: '', phone: null, availableForNew: false }),
    }))
    expect(m.availDeleteMany).toHaveBeenCalledWith({ where: { teacherId: 't1' } })
    expect(m.studentUpdate).not.toHaveBeenCalled()
  })

  it('always scrubs safeguarding actor ids + deletes devices (retains the records)', async () => {
    m.userFind.mockResolvedValue({ id: 'u3', clerkId: 'ck3', email: 'p@x.com', role: 'PARENT', student: null, teacher: null })
    await eraseUserByClerkId('ck3')
    expect(m.complaintUpdateMany).toHaveBeenCalledWith({ where: { reporterClerkId: 'ck3' }, data: { reporterClerkId: 'deleted' } })
    expect(m.pushDeleteMany).toHaveBeenCalledWith({ where: { clerkId: 'ck3' } })
    expect(m.parentLinkUpdateMany).toHaveBeenCalledWith(expect.objectContaining({ where: { parentUserId: 'u3' } }))
  })
})
