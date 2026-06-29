import { headers } from 'next/headers'
import { createHmac, timingSafeEqual } from 'crypto'
import { prisma } from '@/lib/prisma'

// Daily.co webhook → call observability. Tracks when a session went live, who joined
// (count), and when it ended — for attendance, no-show handling, and disputes.
// Configure the webhook in Daily to point here; set DAILY_WEBHOOK_SECRET to the HMAC it returns.
export async function POST(req: Request) {
  const raw = await req.text()
  const h = await headers()

  // Verify HMAC (Daily signs `${timestamp}.${body}`). Fail closed: an unset secret means
  // this mutation endpoint would otherwise accept forged attendance events that drive
  // no-show/refund logic — so reject rather than skip verification.
  const secret = process.env.DAILY_WEBHOOK_SECRET
  if (!secret) return new Response('Webhook not configured', { status: 401 })
  {
    const ts = h.get('x-webhook-timestamp') ?? ''
    const sig = h.get('x-webhook-signature') ?? ''
    const expected = createHmac('sha256', secret).update(`${ts}.${raw}`).digest('base64')
    try {
      if (!sig || !timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) {
        return new Response('Invalid signature', { status: 401 })
      }
    } catch {
      return new Response('Invalid signature', { status: 401 })
    }
  }

  let event: { test?: string; type?: string; payload?: { room?: string; user_id?: string } }
  try { event = JSON.parse(raw) } catch { return new Response('Bad payload', { status: 400 }) }

  // Daily sends a test ping when you register the webhook.
  if (event.test) return new Response('OK', { status: 200 })

  const room = event.payload?.room
  if (!room || !room.startsWith('faresay-')) return new Response('OK', { status: 200 })
  const sessionId = room.slice('faresay-'.length)
  const joinerId = event.payload?.user_id ?? ''

  try {
    if (event.type === 'participant.joined') {
      const s = await prisma.session.findUnique({ where: { id: sessionId }, select: { id: true, callStartedAt: true, status: true } })
      if (s) {
        await prisma.session.update({
          where: { id: sessionId },
          data: {
            joinCount: { increment: 1 },
            ...(s.callStartedAt ? {} : { callStartedAt: new Date() }),
            ...(s.status === 'SCHEDULED' ? { status: 'IN_PROGRESS', startedAt: new Date() } : {}),
            ...(joinerId.startsWith('student_') ? { studentJoinedAt: new Date() } : {}),
            ...(joinerId.startsWith('teacher_') ? { teacherJoinedAt: new Date() } : {}),
          },
        })
      }
    } else if (event.type === 'participant.left' || event.type === 'meeting.ended') {
      await prisma.session.updateMany({ where: { id: sessionId }, data: { callEndedAt: new Date() } })
    }
  } catch (e) {
    console.error('[webhooks/daily] failed for', sessionId, e)
  }

  return new Response('OK', { status: 200 })
}
