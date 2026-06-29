import { redirect, notFound } from 'next/navigation'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Logo } from '@/components/Logo'
import BookingForm from './BookingForm'

export default async function BookPage({ params }: { params: Promise<{ therapistId: string }> }) {
  const { therapistId } = await params
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const [user, teacher] = await Promise.all([
    prisma.user.findUnique({
      where: { clerkId: userId },
      include: { student: true },
    }),
    prisma.teacher.findUnique({
      where: { id: therapistId, status: 'ACTIVE' },
      include: { availability: true },
    }),
  ])

  if (!user || !user.student) redirect('/dashboard')
  if (!teacher) notFound()

  const priorSessions = await prisma.session.count({
    where: { teacherId: teacher.id, studentId: user.student.id, status: { not: 'CANCELLED' } },
  })
  const hasPriorSession = priorSessions > 0
  const showIntro = !hasPriorSession && teacher.introRatePence != null && teacher.introRatePence < teacher.sessionRatePence
  const cur = teacher.country === 'US' ? '$' : '£'

  // Resolve corporate org (membership or email-domain match) so the form can show pool coverage.
  let org = user.student.organisationId
    ? await prisma.organisation.findUnique({ where: { id: user.student.organisationId } })
    : null
  if (!org) {
    const domain = user.email.split('@')[1]?.toLowerCase()
    if (domain) org = await prisma.organisation.findFirst({ where: { domain, active: true } })
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-brand-50/60 to-sand-50">
      <nav className="border-b border-sand-200 bg-white/80 backdrop-blur px-5 sm:px-8 h-16 flex items-center justify-between">
        <Logo />
        <Link href="/therapists" className="text-sm text-sand-500 hover:text-brand-700">← Back to tutors</Link>
      </nav>

      <div className="max-w-2xl mx-auto px-5 sm:px-6 py-10">
        <div className="bg-white rounded-3xl border border-sand-200 p-6 mb-5 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-brand-100 flex items-center justify-center text-brand-700 font-display font-semibold text-lg">
              {teacher.firstName[0]}{teacher.lastName[0]}
            </div>
            <div className="flex-1">
              <p className="font-display text-lg font-semibold text-brand-900">{teacher.firstName} {teacher.lastName}</p>
              <p className="text-sm text-sand-500">
                {teacher.qualificationBody} · {cur}{(teacher.sessionRatePence / 100).toFixed(0)} per 50-min lesson
              </p>
            </div>
            {showIntro && (
              <span className="text-xs font-medium bg-coral-50 text-coral-600 border border-coral-200 px-3 py-1.5 rounded-full">
                {cur}{(teacher.introRatePence! / 100).toFixed(0)} first lesson
              </span>
            )}
          </div>
        </div>

        <BookingForm
          teacherId={teacher.id}
          teacherName={`${teacher.firstName} ${teacher.lastName}`}
          sessionRatePence={teacher.sessionRatePence}
          introRatePence={teacher.introRatePence}
          groupRatePence={teacher.groupRatePence}
          groupMaxSize={teacher.groupMaxSize}
          hasPriorSession={hasPriorSession}
          creditBalancePence={user.student.creditBalancePence}
          orgName={org?.active ? org.name : null}
          orgPoolPence={org?.active ? org.creditPoolPence : 0}
          currency={cur}
          availability={teacher.availability.map(a => ({
            dayOfWeek: a.dayOfWeek,
            startTime: a.startTime,
            endTime: a.endTime,
          }))}
          studentId={user.student.id}
        />
      </div>
    </main>
  )
}
