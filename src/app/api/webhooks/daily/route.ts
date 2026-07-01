import { headers } from 'next/headers'
import { createHmac, timingSafeEqual } from 'crypto'
import { prisma } from '@/lib/prisma'
import { fetchDailyTranscript } from '@/lib/daily'
import { AI_NOTES_ENABLED, teacherCanGetAiNotes, generateLessonNote } from '@/lib/lesson-notes'
import { sendPushToClerkId } from '@/lib/push'

// Store the finished transcript and (if enabled + the teacher is eligible) draft AI
// lesson notes. Best-effort: any failure is logged, never fails the webhook.
async function ingestTranscript(sessionId: string, transcriptId: string | undefined) {
  if (!transcriptId) return
  const fetched = await fetchDailyTranscript(transcriptId)
  if (!fetched) return

  await prisma.lessonTranscript.upsert({
    where: { sessionId },
    update: { rawJson: fetched.rawJson as object, plainText: fetched.plainText },
    create: { sessionId, rawJson: fetched.rawJson as object, plainText: fetched.plainText },
  })

  if (!AI_NOTES_ENABLED) return
  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    select: {
      teacherId: true, studentId: true, matchId: true,
      lessonNote: { select: { id: true } },
      teacher: { select: { user: { select: { clerkId: true } } } },
    },
  })
  if (!session || session.lessonNote) return // already have a note
  if (!(await teacherCanGetAiNotes(session.teacherId))) return

  const draft = await generateLessonNote(fetched.plainText)
  if (!draft) return
  await prisma.lessonNote.create({
    data: {
      sessionId,
      teacherId: session.teacherId,
      studentId: session.studentId,
      topicsCovered: draft.topicsCovered,
      difficulty: draft.difficulty,
      homework: draft.homework,
      status: 'draft',
    },
  })

  // Tell the teacher a draft is waiting to review (P2-4 step 5). Best-effort.
  if (session.teacher?.user?.clerkId) {
    sendPushToClerkId(session.teacher.user.clerkId, {
      title: 'Lesson notes ready',
      body: 'Your AI lesson notes are ready to review.',
      url: `/teacher/students/${session.matchId}`,
    }).catch(() => {})
  }
}

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

  let event: { test?: string; type?: string; payload?: { room?: string; room_name?: string; user_id?: string; transcript_id?: string; transcriptId?: string } }
  try { event = JSON.parse(raw) } catch { return new Response('Bad payload', { status: 400 }) }

  // Daily sends a test ping when you register the webhook.
  if (event.test) return new Response('OK', { status: 200 })

  const room = event.payload?.room ?? event.payload?.room_name
  if (!room || !room.startsWith('fair-do-')) return new Response('OK', { status: 200 })
  const sessionId = room.slice('fair-do-'.length)
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
    } else if (event.type === 'transcript.ready' || event.type === 'transcript.ready-to-download') {
      await ingestTranscript(sessionId, event.payload?.transcript_id ?? event.payload?.transcriptId)
    }
  } catch (e) {
    console.error('[webhooks/daily] failed for', sessionId, e)
  }

  return new Response('OK', { status: 200 })
}
