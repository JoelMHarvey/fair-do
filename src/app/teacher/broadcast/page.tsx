import { redirect, notFound } from 'next/navigation'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { TeacherNav } from '@/components/TeacherNav'
import { PRACTICE_PORTAL_ENABLED, clientEmail } from '@/lib/practice'
import { PageHeader, HelpHint } from '@/components/Guidance'
import BroadcastForm from './BroadcastForm'
import { hasPaidAccess } from '@/lib/access'

export const metadata = { title: 'Message your students — fair-do' }

export default async function BroadcastPage() {
  if (!PRACTICE_PORTAL_ENABLED) notFound()

  const { userId } = await auth()
  if (!userId) redirect('/sign-in')
  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: { teacher: { include: { subscription: { select: { tier: true, status: true } } } } },
  })
  if (!user?.teacher) redirect('/onboarding')
  const teacher = user.teacher

  const sub = teacher.subscription
  const isPaid = hasPaidAccess({ email: user.email, subscription: sub })

  const [matches, recent, templates] = await Promise.all([
    prisma.match.findMany({
      where: { teacherId: teacher.id, active: true },
      include: {
        student: { include: { user: true } },
        sessions: { orderBy: { scheduledAt: 'desc' }, take: 1, select: { scheduledAt: true } },
      },
    }),
    prisma.broadcast.findMany({
      where: { teacherId: teacher.id },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
    isPaid
      ? prisma.broadcastTemplate.findMany({
          where: { teacherId: teacher.id },
          orderBy: { updatedAt: 'desc' },
          select: { id: true, name: true, subject: true, body: true, channel: true },
        })
      : Promise.resolve([]),
  ])

  // One row per reachable student (has an email), with their most recent session date so
  // the teacher can spot — and skip — students they haven't seen in a while.
  const seen = new Set<string>()
  const students: { studentId: string; firstName: string; lastName: string; email: string; lastSessionAt: string | null }[] = []
  for (const m of matches) {
    const email = clientEmail(m.student)
    if (!email || seen.has(email)) continue
    seen.add(email)
    students.push({
      studentId: m.studentId,
      firstName: m.student.firstName,
      lastName: m.student.lastName,
      email,
      lastSessionAt: m.sessions[0]?.scheduledAt?.toISOString() ?? null,
    })
  }

  const reachable = students.length

  return (
    <main className="min-h-screen bg-sand-50">
      <TeacherNav />

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <PageHeader
          title="Message your clients"
          subtitle="Write one update and reach the students who need it — by email or a calendar invite, on your own letterhead."
          help={{ href: '/teacher/help', label: 'How messaging works' }}
        />

        <div className="mb-6">
          <HelpHint>
            {isPaid ? (
              <>
                Pick exactly who hears from you — recent students are pre-ticked, and anyone you
                haven&rsquo;t seen in a while is left out so old contacts aren&rsquo;t pinged. Send a plain
                email or a calendar invite (a workshop, a group, a change of hours), and save what you write
                as a template to reuse. It goes individually to each student on your letterhead.
              </>
            ) : (
              <>
                This is for something everyone needs to know — a holiday notice, a change of hours, a new
                offering. It goes by email to every <strong>active</strong> student with an email on file
                (that&rsquo;s <strong>{reachable}</strong> right now). Upgrade to the Practice plan to choose
                recipients, send calendar invites, and save templates.
              </>
            )}
          </HelpHint>
        </div>

        <BroadcastForm isPaid={isPaid} reachable={reachable} students={students} templates={templates} />

        {recent.length > 0 && (
          <section className="mt-10">
            <h2 className="font-medium text-sand-900 mb-3">Recent</h2>
            <div className="bg-white rounded-2xl border border-sand-200 overflow-hidden">
              {recent.map((b, i) => (
                <div key={b.id} className={`px-5 py-4 ${i > 0 ? 'border-t border-sand-100' : ''}`}>
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium text-sand-900 truncate">
                      {b.channel === 'event' && <span className="text-brand-600">📅 </span>}
                      {b.subject}
                    </p>
                    <p className="text-xs text-sand-400 shrink-0">
                      {b.createdAt.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} · {b.recipientCount} sent
                    </p>
                  </div>
                  <p className="text-sm text-sand-500 mt-1 line-clamp-2 whitespace-pre-line">{b.body}</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  )
}
