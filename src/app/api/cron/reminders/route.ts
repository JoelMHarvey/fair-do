import { prisma } from '@/lib/prisma'
import { sendSessionReminder } from '@/lib/email'
import { sendSms } from '@/lib/sms'
import { clientEmail, practiceDisplayName } from '@/lib/practice'
import { recordCronRun } from '@/lib/cron-run'
import { bearerOk } from '@/lib/bearer'

// Vercel Cron hits this hourly. Sends a 24h reminder for sessions ~24–25h out
// that haven't been reminded yet. Guarded by CRON_SECRET.
export async function GET(req: Request) {
  // Require the secret unconditionally — if it's unset, refuse (never expose publicly).
  if (!bearerOk(req.headers.get('authorization'), process.env.CRON_SECRET)) {
    return new Response('Unauthorized', { status: 401 })
  }

  const now = new Date()
  const windowStart = new Date(now.getTime() + 24 * 60 * 60 * 1000)
  const windowEnd = new Date(now.getTime() + 25 * 60 * 60 * 1000)

  const sessions = await prisma.session.findMany({
    where: {
      status: 'SCHEDULED',
      reminderSentAt: null,
      scheduledAt: { gte: windowStart, lt: windowEnd },
    },
    include: { teacher: true, student: { include: { user: true } } },
    take: 200,
  })

  let sent = 0
  let texted = 0
  for (const s of sessions) {
    try {
      const cEmail = clientEmail(s.student) // managed students may have none
      if (cEmail) {
        await sendSessionReminder({
          clientEmail: cEmail,
          clientFirstName: s.student.firstName,
          therapistFirstName: s.teacher.firstName,
          therapistLastName: s.teacher.lastName,
          sessionId: s.id,
          scheduledAt: s.scheduledAt,
        })
        sent++
      }
      // SMS reminder when the client gave a mobile (no-op if Twilio is unconfigured).
      if (s.student.phone) {
        const when = s.scheduledAt.toLocaleString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
        const ok = await sendSms(
          s.student.phone,
          `Reminder: your lesson with ${practiceDisplayName(s.teacher)} is ${when}. Reply to your tutor to reschedule.`,
        )
        if (ok) texted++
      }
      // Mark handled regardless so a no-email client isn't reselected each run.
      await prisma.session.update({ where: { id: s.id }, data: { reminderSentAt: new Date() } })
    } catch (e) {
      console.error('[cron/reminders] failed for session', s.id, e)
    }
  }

  await recordCronRun('reminders', true, undefined, JSON.stringify({ checked: sessions.length, sent, texted }))
  return Response.json({ checked: sessions.length, sent, texted })
}
