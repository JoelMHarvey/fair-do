import Link from 'next/link'
import { redirect, notFound } from 'next/navigation'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { TherapistNav } from '@/components/TherapistNav'
import { PRACTICE_PORTAL_ENABLED, practiceDisplayName, effectiveRatePence, ensurePracticeSlug } from '@/lib/practice'
import { BookingLinkCard } from '@/components/BookingLinkCard'
import { qrSvg } from '@/lib/qr'
import { PageHeader, HelpHint } from '@/components/Guidance'
import AddClientForm from './AddClientForm'
import DirectoryToggle from './DirectoryToggle'
import CopyLink from './CopyLink'

export const metadata = { title: 'Your students — fair-do' }

export default async function PracticeClientsPage() {
  if (!PRACTICE_PORTAL_ENABLED) notFound()

  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: { teacher: true },
  })
  if (!user?.teacher) redirect('/onboarding')
  const teacher = user.teacher

  const now = new Date()
  const [matches, pendingInvites] = await Promise.all([
    prisma.match.findMany({
      where: { teacherId: teacher.id, active: true },
      include: {
        student: true,
        sessions: { where: { status: { not: 'CANCELLED' } }, select: { id: true, scheduledAt: true } },
      },
      orderBy: { startedAt: 'desc' },
    }),
    prisma.studentInvite.findMany({
      where: { teacherId: teacher.id, status: 'pending', expiresAt: { gt: now } },
      orderBy: { createdAt: 'desc' },
    }),
  ])

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://fair-do.co.uk'
  const bookingSlug = await ensurePracticeSlug(teacher)
  const fmt = (p: number) => `£${(p / 100).toFixed(0)}`

  // QR codes (server-rendered SVG). Public profile + each pending invite's accept link.
  const profileUrl = `${appUrl}/tutors/${teacher.id}`
  const [profileQr, inviteQrs] = await Promise.all([
    qrSvg(profileUrl),
    Promise.all(pendingInvites.map(inv => qrSvg(`${appUrl}/practice/join/${inv.token}`))),
  ])
  const inviteQrByIndex = (i: number) => inviteQrs[i]

  return (
    <main className="min-h-screen bg-sand-50">
      <TherapistNav />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <PageHeader
          title="Your students"
          subtitle={`${practiceDisplayName(teacher)} · ${matches.length} active. Add students, set their price, and book lessons — all from here.`}
          help={{ href: '/teacher/help#add-student', label: 'How adding students works' }}
        />

        <div className="mb-8">
          <HelpHint>
            <strong>Two ways to add a student:</strong> invite one by email (they get a private link), or
            <Link href="/teacher/students/import" className="text-brand-800 underline"> import your whole list</Link> at once. You manage the relationship and their records.
          </HelpHint>
        </div>

        <BookingLinkCard url={`${appUrl}/p/${bookingSlug}`} />

        {/* Invite a student */}
        <section className="mb-10">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-medium text-sand-900">Invite a student</h2>
            <Link href="/teacher/students/import" className="text-sm text-brand-700 hover:underline">Import a list →</Link>
          </div>
          <AddClientForm defaultRatePence={teacher.sessionRatePence} />
        </section>

        {/* Grow your studio — directory listing + booking QR */}
        <section className="mb-10">
          <h2 className="font-medium text-sand-900 mb-3">Grow your studio</h2>
          <div className="bg-white rounded-2xl border border-sand-200 p-5 space-y-4">
            <DirectoryToggle initial={teacher.availableForNew} />
            {teacher.availableForNew && (
              <div className="border-t border-sand-100 pt-4 flex items-center gap-4">
                <div className="w-24 shrink-0 [&>svg]:w-full [&>svg]:h-auto rounded-lg overflow-hidden border border-sand-200" dangerouslySetInnerHTML={{ __html: profileQr }} />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-sand-900">Your booking QR</p>
                  <p className="text-xs text-sand-500 mt-0.5 mb-1.5">
                    Add it to a card, window or social post — anyone who scans lands on your profile and can book.
                  </p>
                  <CopyLink url={profileUrl} label="Copy booking link" />
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Pending invites */}
        {pendingInvites.length > 0 && (
          <section className="mb-10">
            <h2 className="font-medium text-sand-900 mb-3">Pending invites</h2>
            <div className="bg-white rounded-2xl border border-sand-200 overflow-hidden">
              {pendingInvites.map((inv, i) => (
                <div key={inv.id} className={`flex items-center gap-4 px-5 py-4 ${i > 0 ? 'border-t border-sand-100' : ''}`}>
                  <div
                    className="w-16 shrink-0 [&>svg]:w-full [&>svg]:h-auto rounded-md overflow-hidden border border-sand-200"
                    title="Scan to accept the invite"
                    dangerouslySetInnerHTML={{ __html: inviteQrByIndex(i) }}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-sand-900 truncate">{inv.firstName ? `${inv.firstName} · ` : ''}{inv.email}</p>
                    <p className="text-xs text-sand-400 mt-0.5">
                      {inv.customRatePence != null ? `${fmt(inv.customRatePence)}/lesson · ` : ''}invited {inv.createdAt.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                    </p>
                    <div className="mt-1">
                      <CopyLink url={`${appUrl}/practice/join/${inv.token}`} label="Copy invite link" />
                    </div>
                  </div>
                  <span className="text-xs font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full shrink-0 self-start">Awaiting</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-sand-400 mt-2">
              Invite links are valid for 14 days. The accept link is {appUrl}/practice/join/…
            </p>
          </section>
        )}

        {/* Active students */}
        <section>
          <h2 className="font-medium text-sand-900 mb-3">Active students</h2>
          {matches.length === 0 ? (
            <div className="bg-white rounded-2xl border border-sand-200 p-8 text-center text-sand-400 text-sm">
              No students yet. Invite your first one above.
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-sand-200 overflow-hidden">
              {matches.map((m, i) => {
                const upcoming = m.sessions.filter(s => s.scheduledAt >= now).length
                return (
                  <Link
                    key={m.id}
                    href={`/teacher/students/${m.id}`}
                    className={`flex items-center justify-between px-5 py-4 hover:bg-sand-50 transition ${i > 0 ? 'border-t border-sand-100' : ''}`}
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-sand-900 truncate">{m.student.firstName} {m.student.lastName}</p>
                      <p className="text-xs text-sand-400 mt-0.5">
                        {fmt(effectiveRatePence(m, teacher))}/lesson
                        {m.customRatePence != null && <span className="text-brand-600"> · custom</span>}
                        {' · '}{m.sessions.length} lesson{m.sessions.length !== 1 ? 's' : ''}
                        {upcoming > 0 && <span className="text-brand-600"> · {upcoming} upcoming</span>}
                        {m.source === 'invite' && <span className="text-sand-400"> · invited</span>}
                      </p>
                    </div>
                    <span className="text-sm text-brand-600 font-medium shrink-0">Manage →</span>
                  </Link>
                )
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  )
}
