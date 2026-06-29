import { prisma } from '@/lib/prisma'
import { sendCredentialExpiryReminder, sendCredentialSuspended } from '@/lib/email'
import { daysUntil, currentBucket, GRACE_DAYS } from '@/lib/credentials-expiry'
import { recordCronRun } from '@/lib/cron-run'
import { bearerOk } from '@/lib/bearer'
import type { Prisma } from '@prisma/client'

// Daily. Monitors teacher qualification expiry:
//  - nudges the teacher at 60/30/14/7/1 days before, and on expiry
//  - after a grace window past expiry, auto-suspends from new bookings
//  - auto-restores once a valid (future) date is back on file
// Guarded by CRON_SECRET. Emails/state changes are best-effort and idempotent
// via the qualReminderStage dedup field.

type Stage = number | null
type KindResult = { email?: 'reminder' | 'expired'; stage: Stage }

// Decide whether to nudge for one credential, and the new dedup stage.
// Stage encoding: 60/30/14/7/1 = pre-expiry bucket emailed · 0 = expired email sent
// · -1 = suspended email sent · null = nothing/renewed.
function evaluate(days: number | null, stored: Stage): KindResult {
  if (days == null) return { stage: null } // no date on file → clear
  if (days <= 0) {
    if (stored === 0 || stored === -1) return { stage: stored } // already told them
    return { email: 'expired', stage: 0 }
  }
  const b = currentBucket(days)
  if (b == null) return { stage: null } // further out than widest bucket → re-arm
  if (stored === 0 || stored === -1) return { stage: b } // renewed from expired → arm, don't nag
  if (stored == null) return { email: 'reminder', stage: b }
  if (b < stored) return { email: 'reminder', stage: b } // crossed into a more-urgent bucket
  if (b > stored) return { stage: null } // renewed further out → re-arm
  return { stage: stored } // same bucket already emailed
}

export async function GET(req: Request) {
  if (!bearerOk(req.headers.get('authorization'), process.env.CRON_SECRET)) {
    return new Response('Unauthorized', { status: 401 })
  }

  const now = new Date()
  const teachers = await prisma.teacher.findMany({
    where: { status: { in: ['ACTIVE', 'SUSPENDED'] } },
    include: { user: { select: { email: true } } },
    take: 500,
  })

  let reminded = 0, suspended = 0, restored = 0
  for (const t of teachers) {
    // Skip admin-suspended teachers (manual SUSPENDED, not a credential auto-suspend).
    if (t.status === 'SUSPENDED' && !t.credentialSuspended) continue

    const qualDays = daysUntil(t.qualificationExpiry, now)
    const email = t.user?.email
    const data: Prisma.TeacherUpdateInput = {}

    // 1. Auto-restore: a credential-suspended teacher now has a valid (future) qualification date.
    const qualValid = qualDays != null && qualDays > 0
    if (t.credentialSuspended && qualValid) {
      await prisma.teacher.update({
        where: { id: t.id },
        data: { status: 'ACTIVE', credentialSuspended: false, availableForNew: true, qualReminderStage: null },
      })
      restored++
      continue
    }

    // 2. Auto-suspend: an expired qualification has passed the grace window.
    const qualSusp = qualDays != null && qualDays <= -GRACE_DAYS
    if (t.status === 'ACTIVE' && qualSusp && !t.credentialSuspended) {
      await prisma.teacher.update({
        where: { id: t.id },
        data: {
          status: 'SUSPENDED', credentialSuspended: true, availableForNew: false,
          qualReminderStage: -1,
        },
      })
      suspended++
      if (email) {
        try { await sendCredentialSuspended({ email, firstName: t.firstName, kind: 'registration', body: t.qualificationBody ?? undefined, expiry: t.qualificationExpiry! }) }
        catch (e) { console.error('[cron/credentials] suspend email failed', t.id, e) }
      }
      continue
    }

    // 3. Reminders (only for live teachers) — qualification expiry only.
    if (t.status === 'ACTIVE') {
      const qual = evaluate(qualDays, t.qualReminderStage)
      if (qual.stage !== t.qualReminderStage) data.qualReminderStage = qual.stage
      if (qual.email && email && t.qualificationExpiry) {
        try {
          await sendCredentialExpiryReminder({ email, firstName: t.firstName, kind: 'registration', body: t.qualificationBody ?? undefined, expiry: t.qualificationExpiry, daysUntil: qualDays! })
          reminded++
        } catch (e) { console.error('[cron/credentials] qual reminder failed', t.id, e) }
      }
    }

    if (Object.keys(data).length) {
      await prisma.teacher.update({ where: { id: t.id }, data }).catch(e => console.error('[cron/credentials] stage update failed', t.id, e))
    }
  }

  await recordCronRun('credentials', true, undefined, JSON.stringify({ checked: teachers.length, reminded, suspended, restored }))
  return Response.json({ checked: teachers.length, reminded, suspended, restored })
}
