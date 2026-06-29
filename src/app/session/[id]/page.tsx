import { redirect, notFound } from 'next/navigation'
import { timingSafeEqual } from 'crypto'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { createMeetingToken } from '@/lib/daily'
import Link from 'next/link'
import { Logo } from '@/components/Logo'
import CancelButton from './CancelButton'
import RoomPoll from './RoomPoll'
import ReviewForm from './ReviewForm'
import WhiteboardButton from './WhiteboardButton'
import { WHITEBOARD_ENABLED, whiteboardUrl, whiteboardEmbeddable } from '@/lib/whiteboard'

export default async function SessionPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ booked?: string; k?: string }>
}) {
  const { id } = await params
  const { booked, k } = await searchParams
  const { userId } = await auth()

  const session = await prisma.session.findUnique({
    where: { id },
    include: { teacher: true, student: true },
  })
  if (!session) notFound()

  let isStudent = false
  let isTeacher = false
  if (userId) {
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: { student: true, teacher: true },
    })
    if (user) {
      isStudent = user.student?.id === session.studentId
      isTeacher = user.teacher?.id === session.teacherId
    }
  }
  // Account-less self-booked student reaching their room via the signed email link.
  if (!isStudent && !isTeacher && k && session.guestToken
      && k.length === session.guestToken.length
      && timingSafeEqual(Buffer.from(k), Buffer.from(session.guestToken))) {
    isStudent = true
  }
  if (!isStudent && !isTeacher) redirect(userId ? '/dashboard' : '/sign-in')

  const scheduledAt = new Date(session.scheduledAt)
  const now = new Date()
  const minutesUntil = Math.floor((scheduledAt.getTime() - now.getTime()) / 60000)
  const isLive = minutesUntil <= 10 && minutesUntil > -70
  const hoursUntil = (scheduledAt.getTime() - now.getTime()) / 3_600_000
  const canCancel = session.status === 'SCHEDULED' && minutesUntil > 10

  // Call observability (from Daily webhooks)
  const bothJoined = session.joinCount >= 2
  const callMins = session.callStartedAt && session.callEndedAt
    ? Math.max(0, Math.round((session.callEndedAt.getTime() - session.callStartedAt.getTime()) / 60000))
    : null

  // Identified Daily token so the webhook can attribute who joined (student vs teacher).
  let roomUrl = session.dailyRoomUrl
  if (isLive && session.dailyRoomName && roomUrl) {
    const roleId = isStudent ? `student_${session.studentId}` : `teacher_${session.teacherId}`
    const name = isStudent ? session.student.firstName : `${session.teacher.firstName} (teacher)`
    const token = await createMeetingToken({ roomName: session.dailyRoomName, userId: roleId, userName: name })
    if (token) roomUrl = `${session.dailyRoomUrl}?t=${token}`
  }

  // Review: student can rate once the session time has passed (and it wasn't cancelled).
  const sessionHappened = minutesUntil < 0 && session.status !== 'CANCELLED'
  const existingReview = isStudent && sessionHappened
    ? await prisma.review.findUnique({ where: { sessionId: session.id } })
    : null
  const canReview = isStudent && sessionHappened && !existingReview
  const refundable = hoursUntil >= 24

  const backHref = isStudent ? '/dashboard' : '/teacher/dashboard'
  const wbUrl = WHITEBOARD_ENABLED ? whiteboardUrl(session.id) : null

  // Teacher-only: quick access to this student's notes + external document links during the session.
  const studentDocs = isTeacher
    ? await prisma.studentDocument.findMany({ where: { matchId: session.matchId }, orderBy: { createdAt: 'asc' } })
    : []
  const matchNotes = isTeacher
    ? (await prisma.match.findUnique({ where: { id: session.matchId }, select: { notes: true } }))?.notes ?? null
    : null
  const DOC_LABEL: Record<string, string> = {
    'session-notes': 'Lesson notes', assessment: 'Assessment', formulation: 'Learning summary',
    'treatment-plan': 'Lesson plan', risk: 'Safeguarding', outcomes: 'Progress measures', other: 'Other',
  }

  return (
    <main className="min-h-screen bg-brand-900 flex flex-col">
      <nav className="bg-brand-800/60 border-b border-brand-700/40 px-5 sm:px-8 h-16 flex items-center justify-between shrink-0">
        <Link href={backHref} className="flex items-center gap-2">
          <span className="font-display text-lg font-semibold text-white tracking-tight">fair-do</span>
        </Link>
        <div className="flex items-center gap-4">
          <span className="text-sm text-brand-100/80 hidden sm:inline">
            {session.teacher.firstName} {session.teacher.lastName} ·{' '}
            {scheduledAt.toLocaleString('en-GB', { dateStyle: 'short', timeStyle: 'short' })}
          </span>
          {isTeacher && (matchNotes || studentDocs.length > 0) && (
            <details className="relative">
              <summary className="cursor-pointer list-none text-sm text-brand-100/90 hover:text-white">📋 Student info</summary>
              <div className="absolute right-0 top-8 z-50 w-72 bg-white rounded-xl shadow-xl border border-sand-200 p-4 text-left">
                {matchNotes && (
                  <div className="mb-3">
                    <p className="text-xs font-semibold text-sand-500 uppercase tracking-wide mb-1">Notes</p>
                    <p className="text-sm text-sand-700 whitespace-pre-wrap max-h-40 overflow-y-auto">{matchNotes}</p>
                  </div>
                )}
                {studentDocs.length > 0 && (
                  <div className="mb-2">
                    <p className="text-xs font-semibold text-sand-500 uppercase tracking-wide mb-1">Documents</p>
                    <ul className="space-y-1.5">
                      {studentDocs.map(d => (
                        <li key={d.id}>
                          <a href={d.url} target="_blank" rel="noopener noreferrer" className="text-sm text-brand-700 hover:underline block truncate">
                            🔗 {d.label} <span className="text-xs text-sand-400">· {DOC_LABEL[d.category] ?? d.category}</span>
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                <Link href={`/teacher/students/${session.matchId}`} className="text-sm font-medium text-brand-600 hover:text-brand-700">Open student →</Link>
              </div>
            </details>
          )}
          {wbUrl && <WhiteboardButton url={wbUrl} embeddable={whiteboardEmbeddable()} />}
          <Link href={backHref} className="text-sm text-brand-100/80 hover:text-white transition">
            ← Dashboard
          </Link>
        </div>
      </nav>

      {booked && (
        <div className="bg-brand-500 text-white text-center py-3 text-sm font-medium shrink-0">
          Payment confirmed — lesson booked for{' '}
          {scheduledAt.toLocaleString('en-GB', { dateStyle: 'full', timeStyle: 'short' })}
        </div>
      )}

      <div className="flex-1 flex flex-col">
        {!session.dailyRoomUrl ? (
          <div className="flex-1 flex items-center justify-center">
            <RoomPoll />
            <div className="text-center text-brand-100/70 px-4">
              <div className="w-10 h-10 mx-auto mb-4 rounded-full border-2 border-brand-600 border-t-white animate-spin" />
              <p className="text-lg font-medium text-white mb-1">Setting up your private room…</p>
              <p className="text-sm">This usually takes under a minute — the page refreshes itself.</p>
              <p className="text-xs text-brand-100/50 mt-4">Still waiting after a few minutes? Email support@fair-do.co.uk</p>
            </div>
          </div>
        ) : isLive ? (
          <iframe
            src={roomUrl ?? undefined}
            allow="camera; microphone; fullscreen; speaker; display-capture"
            className="flex-1 w-full border-none"
          />
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center max-w-sm px-4">
              {minutesUntil > 0 ? (
                <>
                  <p className="font-display text-5xl font-semibold text-white mb-2">{minutesUntil}<span className="text-2xl text-brand-200 ml-1">min</span></p>
                  <p className="text-brand-100/80 mb-1">until your lesson</p>
                  <p className="text-sm text-brand-100/60">
                    {scheduledAt.toLocaleString('en-GB', { dateStyle: 'full', timeStyle: 'short' })}
                  </p>
                  <p className="text-xs text-brand-100/40 mt-3">The room opens 10 minutes before the start.</p>
                </>
              ) : (
                <>
                  <p className="font-display text-2xl font-semibold text-white mb-2">Lesson ended</p>
                  {session.callStartedAt ? (
                    <p className="text-sm text-brand-100/60">
                      {bothJoined ? 'Both of you joined' : 'Only one person joined'}{callMins != null ? ` · ${callMins} min call` : ''}.
                    </p>
                  ) : sessionHappened ? (
                    <p className="text-sm text-coral-300">No one joined this lesson. If you were charged and the lesson didn&apos;t happen, <Link href="/complaints" className="underline">let us know</Link>.</p>
                  ) : (
                    <p className="text-sm text-brand-100/60">This room closed 70 minutes after the scheduled start.</p>
                  )}
                </>
              )}
              <Link
                href={backHref}
                className="inline-block mt-6 bg-white text-brand-900 px-6 py-2.5 rounded-full text-sm font-medium hover:bg-brand-50 transition"
              >
                Back to dashboard
              </Link>

              {canCancel && (
                <div className="mt-8">
                  <CancelButton sessionId={id} refundable={refundable} />
                  {!refundable && (
                    <p className="text-xs text-coral-300 mt-3">
                      Within 24 hours — cancelling now is non-refundable.
                    </p>
                  )}
                </div>
              )}

              {canReview && (
                <div className="mt-8">
                  <ReviewForm sessionId={id} teacherName={session.teacher.firstName} />
                </div>
              )}
              {existingReview && (
                <p className="mt-6 text-sm text-brand-100/60">You rated this lesson {existingReview.rating}★ — thank you.</p>
              )}

              {sessionHappened && (
                <p className="mt-6 text-xs text-brand-100/50">
                  Problem with the call quality?{' '}
                  <Link href="/complaints" className="text-brand-200 underline">Report it</Link> — it helps us fix issues fast.
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
