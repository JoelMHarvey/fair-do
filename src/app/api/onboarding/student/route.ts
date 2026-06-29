import { auth } from '@clerk/nextjs/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { ensureReferralCode, REFEREE_SIGNUP_PENCE } from '@/lib/referral'
import { isStateLive } from '@/lib/locale'
import { z } from 'zod'

const schema = z.object({
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  dateOfBirth: z.string().optional(),
  questionnaire: z.object({
    subjects: z.array(z.string().max(60)).max(20),
    levels: z.array(z.string().max(40)).max(12).optional(),
    goals: z.array(z.string().max(60)).max(12).optional(),
    frequency: z.string().max(40).optional(),
    availability: z.array(z.string().max(20)).max(7),
  }),
  referralCode: z.string().max(40).optional(),
  usState: z.string().max(4).optional(),
  consentGiven: z.literal(true),
})

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return new Response('Unauthorized', { status: 401 })

  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return new Response('Invalid data', { status: 400 })

  const { firstName, lastName, dateOfBirth, questionnaire, consentGiven, referralCode: bodyRefCode, usState } = parsed.data

  const user = await prisma.user.findUnique({ where: { clerkId: userId } })
  if (!user) return new Response('User not found', { status: 404 })
  if (user.role !== 'STUDENT') return new Response('Not a student', { status: 403 })

  if (user.country === 'US' && !isStateLive(usState)) {
    return Response.json({ error: 'fair-do isn\'t live in that state yet.' }, { status: 422 })
  }

  const existing = await prisma.student.findUnique({ where: { userId: user.id } })
  if (existing) return Response.json({ redirect: '/dashboard' })

  // Referral code: manual entry wins, else the /r/CODE cookie.
  const jar = await cookies()
  const refCode = (bodyRefCode || jar.get('faresay_ref')?.value)?.toUpperCase()

  const newStudent = await prisma.student.create({
    data: {
      userId: user.id,
      firstName,
      lastName,
      country: user.country,
      usState: user.country === 'US' ? (usState ?? null) : null,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
      questionnaire,
      consentGiven,
      consentDate: new Date(),
    },
  })

  // Give every student their own shareable code.
  await ensureReferralCode(newStudent.id, firstName).catch(() => {})

  // If they arrived via a referral, link it + grant the signup credit.
  if (refCode) {
    const referrer = await prisma.student.findUnique({ where: { referralCode: refCode } })
    if (referrer && referrer.id !== newStudent.id) {
      try {
        await prisma.$transaction([
          prisma.referral.create({
            data: {
              code: refCode,
              referrerStudentId: referrer.id,
              refereeStudentId: newStudent.id,
              refereeDiscountPence: REFEREE_SIGNUP_PENCE,
            },
          }),
          prisma.student.update({
            where: { id: newStudent.id },
            data: { referredByCode: refCode, creditBalancePence: { increment: REFEREE_SIGNUP_PENCE } },
          }),
        ])
      } catch {
        // duplicate/invalid — ignore
      }
    }
    jar.delete('faresay_ref')
  }

  return Response.json({ redirect: '/dashboard' }, { status: 201 })
}
