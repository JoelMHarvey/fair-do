import { randomBytes } from 'crypto'
import { prisma } from '@/lib/prisma'
import { grantReferralFreeMonth } from '@/lib/referral-credit'

const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'
export const THERAPIST_REFERRAL_BONUS_PENCE = 2500 // £25 to the referring teacher

export function generateTherapistCode(firstName: string): string {
  const bytes = randomBytes(4)
  let suffix = ''
  for (let i = 0; i < 4; i++) suffix += ALPHABET[bytes[i] % ALPHABET.length]
  const stem = firstName.replace(/[^a-zA-Z]/g, '').slice(0, 6).toUpperCase() || 'TEACHER'
  return `T-${stem}-${suffix}`
}

export async function ensureTherapistReferralCode(teacherId: string, firstName: string): Promise<string> {
  const existing = await prisma.teacher.findUnique({ where: { id: teacherId }, select: { referralCode: true } })
  if (existing?.referralCode) return existing.referralCode
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = generateTherapistCode(firstName)
    try {
      await prisma.teacher.update({ where: { id: teacherId }, data: { referralCode: code } })
      return code
    } catch { /* collision — retry */ }
  }
  throw new Error('Could not allocate teacher referral code')
}

/** Link a new teacher to their referrer by code. Safe to call once at onboarding. */
export async function linkTherapistReferral(refereeTeacherId: string, code: string): Promise<void> {
  const referrer = await prisma.teacher.findUnique({ where: { referralCode: code.toUpperCase() } })
  if (!referrer || referrer.id === refereeTeacherId) return
  try {
    await prisma.$transaction([
      prisma.teacherReferral.create({
        data: { code: code.toUpperCase(), referrerTeacherId: referrer.id, refereeTeacherId, bonusPence: THERAPIST_REFERRAL_BONUS_PENCE },
      }),
      prisma.teacher.update({ where: { id: refereeTeacherId }, data: { referredByCode: code.toUpperCase() } }),
    ])
  } catch { /* duplicate/invalid — ignore */ }
}

/**
 * When a referred teacher runs their first paid lesson, reward the referrer with a
 * FREE MONTH (we take no commission, so cash bonuses don't fit). Applied to their live
 * subscription if they're already paid, otherwise banked for when they upgrade. Idempotent.
 */
export async function rewardTherapistReferralOnFirstSession(refereeTeacherId: string): Promise<void> {
  const referral = await prisma.teacherReferral.findUnique({ where: { refereeTeacherId } })
  if (!referral || referral.status !== 'pending') return
  await prisma.teacherReferral.update({
    where: { id: referral.id },
    data: { status: 'rewarded', rewardedAt: new Date() },
  })
  await grantReferralFreeMonth(referral.referrerTeacherId)
}
