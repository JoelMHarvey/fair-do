import { describe, it, expect, beforeEach, afterAll } from 'vitest'
import { prisma, truncateAll, makeUser, makeStudent, makeTeacher } from './helpers'

beforeEach(truncateAll)
afterAll(async () => { await prisma.$disconnect() })

// These verify DB-enforced constraints that mock-based tests can never exercise.
describe('DB constraints (real DB)', () => {
  it('ProcessedStripeEvent id is unique — a redelivered event id is rejected (webhook idempotency)', async () => {
    await prisma.processedStripeEvent.create({ data: { id: 'evt_1', type: 'checkout.session.completed' } })
    await expect(
      prisma.processedStripeEvent.create({ data: { id: 'evt_1', type: 'checkout.session.completed' } }),
    ).rejects.toThrow()
  })

  it('PushSubscription.endpoint is unique', async () => {
    const u = await makeUser()
    await prisma.pushSubscription.create({ data: { clerkId: u.clerkId, endpoint: 'https://push/dup', p256dh: 'k', auth: 'a' } })
    await expect(
      prisma.pushSubscription.create({ data: { clerkId: u.clerkId, endpoint: 'https://push/dup', p256dh: 'k2', auth: 'a2' } }),
    ).rejects.toThrow()
  })

  it('Match is unique per (teacherId, studentId) — no duplicate relationship', async () => {
    const tu = await makeUser({ role: 'TEACHER' })
    const teacher = await makeTeacher(tu.id)
    const su = await makeUser({ role: 'STUDENT' })
    const student = await makeStudent(su.id)
    await prisma.match.create({ data: { teacherId: teacher.id, studentId: student.id } })
    await expect(
      prisma.match.create({ data: { teacherId: teacher.id, studentId: student.id } }),
    ).rejects.toThrow()
  })

  it('Payment.studentId FK is enforced — cannot reference a missing student', async () => {
    await expect(
      prisma.payment.create({ data: { studentId: 'does_not_exist', stripePaymentIntentId: 'pi_x', amountTotalPence: 1, platformFeePence: 0, teacherPayoutPence: 1, status: 'paid' } }),
    ).rejects.toThrow()
  })
})
