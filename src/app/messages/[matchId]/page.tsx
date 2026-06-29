import { redirect, notFound } from 'next/navigation'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import MessageThread from './MessageThread'

export default async function MessagesPage({ params }: { params: Promise<{ matchId: string }> }) {
  const { matchId } = await params
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: { student: true, teacher: true },
  })
  if (!user) redirect('/sign-in')

  const match = await prisma.match.findUnique({
    where: { id: matchId },
    include: {
      teacher: true,
      student: true,
    },
  })
  if (!match) notFound()

  const isStudent = user.student?.id === match.studentId
  const isTeacher = user.teacher?.id === match.teacherId
  if (!isStudent && !isTeacher) redirect('/dashboard')

  // Find or create thread
  let thread = await prisma.messageThread.findUnique({
    where: { matchId },
    include: {
      messages: {
        orderBy: { createdAt: 'asc' },
        take: 100,
      },
    },
  })

  if (!thread) {
    thread = await prisma.messageThread.create({
      data: {
        matchId,
        teacherId: match.teacherId,
        studentId: match.studentId,
      },
      include: {
        messages: { orderBy: { createdAt: 'asc' }, take: 100 },
      },
    })
  }

  const otherName = isStudent
    ? `${match.teacher.firstName} ${match.teacher.lastName}`
    : `${match.student.firstName} ${match.student.lastName}`

  const backHref = isStudent ? '/dashboard' : '/teacher/dashboard'

  return (
    <main className="h-screen bg-sand-50 flex flex-col">
      <nav className="border-b border-sand-200 bg-white px-6 py-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <a href={backHref} className="text-sand-400 hover:text-sand-600">←</a>
          <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 text-xs font-semibold">
            {otherName.split(' ').map(n => n[0]).join('')}
          </div>
          <span className="font-medium text-sand-900">{otherName}</span>
        </div>
        <span className="text-xs text-sand-400">Messages are private and secure</span>
      </nav>

      <MessageThread
        threadId={thread.id}
        currentClerkId={userId}
        initialMessages={thread.messages.map(m => ({
          id: m.id,
          body: m.body,
          senderClerkId: m.senderClerkId,
          createdAt: m.createdAt.toISOString(),
        }))}
      />
    </main>
  )
}
