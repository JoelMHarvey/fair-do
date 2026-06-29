import { randomBytes } from 'crypto'
import { prisma } from '@/lib/prisma'

const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'

export const REFERRAL_REWARD_PENCE = 1000      // referrer gets £10 credit when referee books
export const REFEREE_SIGNUP_PENCE = 1000        // referee starts with £10 credit

export function generateReferralCode(firstName: string): string {
  const bytes = randomBytes(4)
  let suffix = ''
  for (let i = 0; i < 4; i++) suffix += ALPHABET[bytes[i] % ALPHABET.length]
  const stem = firstName.replace(/[^a-zA-Z]/g, '').slice(0, 6).toUpperCase() || 'FRIEND'
  return `${stem}-${suffix}`
}

/** Ensure a student has a unique referral code; returns it. */
export async function ensureReferralCode(studentId: string, firstName: string): Promise<string> {
  const existing = await prisma.student.findUnique({ where: { id: studentId }, select: { referralCode: true } })
  if (existing?.referralCode) return existing.referralCode
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = generateReferralCode(firstName)
    try {
      await prisma.student.update({ where: { id: studentId }, data: { referralCode: code } })
      return code
    } catch {
      // unique collision — retry with a new suffix
    }
  }
  throw new Error('Could not allocate referral code')
}

/**
 * Reward the referrer when their referee completes a (first) booking.
 * Idempotent: only rewards a referral once.
 */
export async function rewardReferralOnBooking(refereeStudentId: string): Promise<void> {
  const referral = await prisma.referral.findUnique({ where: { refereeStudentId } })
  if (!referral || referral.status !== 'pending') return

  await prisma.$transaction([
    prisma.referral.update({ where: { id: referral.id }, data: { status: 'rewarded', rewardedAt: new Date() } }),
    prisma.student.update({
      where: { id: referral.referrerStudentId },
      data: { creditBalancePence: { increment: referral.rewardPence } },
    }),
  ])
}
