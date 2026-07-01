import { describe, it, expect, beforeEach, afterAll } from 'vitest'
import { prisma, truncateAll, makeUser, makeStudent, makeTeacher } from './helpers'
import { eraseUserByClerkId } from '@/lib/erasure'

beforeEach(truncateAll)
afterAll(async () => { await prisma.$disconnect() })

describe('eraseUserByClerkId (real DB)', () => {
  it('pseudonymises the student, scrubs authored content, retains financials, keeps the counterparty', async () => {
    // Student side
    const su = await makeUser({ clerkId: 'ck_student', email: 'kid@x.test', role: 'STUDENT' })
    const student = await makeStudent(su.id, { contactEmail: 'kid@x.test' })
    // Teacher (counterparty)
    const tu = await makeUser({ clerkId: 'ck_teacher', role: 'TEACHER' })
    const teacher = await makeTeacher(tu.id)
    // Shared relationship + message thread
    const match = await prisma.match.create({ data: { teacherId: teacher.id, studentId: student.id } })
    const thread = await prisma.messageThread.create({ data: { matchId: match.id, teacherId: teacher.id, studentId: student.id } })
    await prisma.message.create({ data: { threadId: thread.id, senderClerkId: 'ck_student', body: 'hi teacher' } })
    // Financial (must be retained)
    await prisma.payment.create({ data: { studentId: student.id, stripePaymentIntentId: 'pi_keepme', amountTotalPence: 5000, platformFeePence: 0, teacherPayoutPence: 5000, status: 'paid' } })
    // Device (delete) + safeguarding-ish complaint (retain, anonymise)
    await prisma.pushSubscription.create({ data: { clerkId: 'ck_student', endpoint: 'https://push/1', p256dh: 'k', auth: 'a' } })
    await prisma.complaint.create({ data: { reporterClerkId: 'ck_student', category: 'billing', body: 'charged twice' } })

    const res = await eraseUserByClerkId('ck_student')
    expect(res).toMatchObject({ userId: su.id, role: 'STUDENT', scrubbed: ['student'] })

    // Identity pseudonymised
    const u2 = await prisma.user.findUnique({ where: { id: su.id } })
    expect(u2?.email).toBe(`deleted+${su.id}@anon.invalid`)
    expect(u2?.clerkId).toBe(`deleted_${su.id}`)
    const s2 = await prisma.student.findUnique({ where: { id: student.id } })
    expect(s2?.firstName).toBe('Deleted')
    expect(s2?.contactEmail).toBeNull()
    expect(s2?.dateOfBirth).toBeNull()

    // Authored message scrubbed, thread kept
    const msgs = await prisma.message.findMany({ where: { threadId: thread.id } })
    expect(msgs).toHaveLength(1)
    expect(msgs[0].body).toBe('[deleted]')
    expect(msgs[0].senderClerkId).toBe('deleted')

    // Financial RETAINED
    const pay = await prisma.payment.findUnique({ where: { stripePaymentIntentId: 'pi_keepme' } })
    expect(pay).not.toBeNull()

    // Device deleted; complaint retained but anonymised
    expect(await prisma.pushSubscription.count({ where: { clerkId: 'ck_student' } })).toBe(0)
    const comp = await prisma.complaint.findFirst()
    expect(comp?.reporterClerkId).toBe('deleted')
    expect(comp?.body).toBe('charged twice') // record kept for safeguarding/audit

    // Counterparty untouched
    const t2 = await prisma.teacher.findUnique({ where: { id: teacher.id } })
    expect(t2?.firstName).toBe('Alice')
  })

  it('is idempotent — a second run finds nothing and no-ops', async () => {
    const su = await makeUser({ clerkId: 'ck_x', role: 'STUDENT' })
    await makeStudent(su.id)
    await eraseUserByClerkId('ck_x')
    expect(await eraseUserByClerkId('ck_x')).toBeNull() // clerkId was rewritten
  })
})
