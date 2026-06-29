import { randomBytes } from 'crypto'
import { prisma } from '@/lib/prisma'

// A per-teacher secret token for their ICS subscribe feed URL.
export async function ensureCalendarToken(teacherId: string, existing: string | null): Promise<string> {
  if (existing) return existing
  const token = randomBytes(24).toString('base64url')
  await prisma.teacher.update({ where: { id: teacherId }, data: { calendarToken: token } })
  return token
}

export function calendarFeedUrl(token: string, appUrl: string): string {
  return `${appUrl.replace(/\/$/, '')}/api/calendar/${token}`
}
