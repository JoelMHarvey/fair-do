import { headers } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { PRACTICE_PORTAL_ENABLED } from '@/lib/practice'
import { checkRateLimit } from '@/lib/ratelimit'
import { finalizeSelfBooking } from '@/lib/self-book'
import { isUniqueViolation } from '@/lib/slots'

// Email confirm link for a pending self-booking (double opt-in). Validates the
// one-time token, re-checks the slot is still free, then commits the booking.
export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://fair-do.co.uk'
  const redirect = (status: string, slug?: string | null) =>
    Response.redirect(`${appUrl}/${slug ? `p/${slug}` : ''}?booking=${status}`, 303)

  if (!PRACTICE_PORTAL_ENABLED) return new Response('Not found', { status: 404 })

  const ip = (await headers()).get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown'
  const rl = await checkRateLimit(`self-book-confirm:${ip}`, { limit: 30, windowMs: 60_000 })
  if (!rl.allowed) return redirect('error')

  const token = new URL(req.url).searchParams.get('token')
  if (!token) return redirect('invalid')

  const pending = await prisma.pendingSelfBooking.findUnique({ where: { token } })
  if (!pending) return redirect('invalid')
  if (pending.expiresAt < new Date()) {
    await prisma.pendingSelfBooking.delete({ where: { id: pending.id } }).catch(() => {})
    return redirect('expired')
  }

  const teacher = await prisma.teacher.findUnique({ where: { id: pending.teacherId }, include: { user: true } })
  if (!teacher || teacher.status !== 'ACTIVE' || !teacher.availableForNew) {
    await prisma.pendingSelfBooking.delete({ where: { id: pending.id } }).catch(() => {})
    return redirect('unavailable', teacher?.practiceSlug)
  }

  // Re-check the slot is still free at confirm time (someone may have booked it).
  const clash = await prisma.session.findFirst({
    where: { teacherId: teacher.id, scheduledAt: pending.scheduledAt, status: { not: 'CANCELLED' } },
    select: { id: true },
  })
  if (clash) {
    await prisma.pendingSelfBooking.delete({ where: { id: pending.id } }).catch(() => {})
    return redirect('taken', teacher.practiceSlug)
  }

  try {
    await finalizeSelfBooking({
      teacher, firstName: pending.firstName, lastName: pending.lastName,
      email: pending.email, phone: pending.phone, scheduledAt: pending.scheduledAt, note: pending.note,
    })
  } catch (e) {
    // Lost the slot race at confirm time — the DB unique guard rejected it.
    if (isUniqueViolation(e)) {
      await prisma.pendingSelfBooking.delete({ where: { id: pending.id } }).catch(() => {})
      return redirect('taken', teacher.practiceSlug)
    }
    console.error('[self-book/confirm] finalize failed', e)
    return redirect('error', teacher.practiceSlug)
  }

  await prisma.pendingSelfBooking.delete({ where: { id: pending.id } }).catch(() => {})
  return redirect('confirmed', teacher.practiceSlug)
}
