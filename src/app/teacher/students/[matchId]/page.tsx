import Link from 'next/link'
import { redirect, notFound } from 'next/navigation'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { TeacherNav } from '@/components/TeacherNav'
import { PRACTICE_PORTAL_ENABLED, effectiveRatePence, clientEmail } from '@/lib/practice'
import { PageHeader, HelpHint, EmptyState } from '@/components/Guidance'
import { HelpTip } from '@/components/HelpTip'
import RateEditor from './RateEditor'
import ScheduleForm from './ScheduleForm'
import CreatePackageForm from './CreatePackageForm'
import NotesEditor from './NotesEditor'
import PhoneEditor from './PhoneEditor'
import StudentDocuments from './ClientDocuments'
import StudentForms from './ClientForms'
import InviteParentForm from './InviteParentForm'
import { ParentMessages } from '@/components/ParentMessages'
import { PARENT_PORTAL_ENABLED, teacherCanOfferParentPortal } from '@/lib/parent'
import type { FormField } from '@/lib/forms'

const STATUS_CLASS: Record<string, string> = {
  SCHEDULED: 'bg-brand-50 text-brand-700',
  COMPLETED: 'bg-sand-100 text-sand-600',
  CANCELLED: 'bg-red-50 text-red-600',
  NO_SHOW: 'bg-amber-50 text-amber-700',
  IN_PROGRESS: 'bg-brand-100 text-brand-800',
}

export const metadata = { title: 'Student — fair-do' }

export default async function StudentDetailPage({ params }: { params: Promise<{ matchId: string }> }) {
  if (!PRACTICE_PORTAL_ENABLED) notFound()
  const { matchId } = await params

  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const user = await prisma.user.findUnique({ where: { clerkId: userId }, include: { teacher: true } })
  if (!user?.teacher) redirect('/onboarding')
  const teacher = user.teacher

  const match = await prisma.match.findUnique({
    where: { id: matchId },
    include: {
      student: { include: { user: true } },
      sessions: { orderBy: { scheduledAt: 'desc' }, include: { payment: true } },
      documents: { orderBy: { createdAt: 'asc' } },
      forms: { orderBy: { sentAt: 'desc' } },
    },
  })
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://fair-do.com'
  if (!match || match.teacherId !== teacher.id) notFound()

  // Parent portal (P2-3): show the invite card only when the feature is on and the
  // teacher is on a plan that can offer it.
  const showParentPortal = PARENT_PORTAL_ENABLED && (await teacherCanOfferParentPortal(teacher.id))
  const parentLinks = showParentPortal
    ? await prisma.parentLink.findMany({
        where: { studentId: match.studentId, status: { in: ['pending', 'active'] } },
        include: { parentThread: { include: { messages: { orderBy: { createdAt: 'asc' } } } } },
        orderBy: { createdAt: 'asc' },
      })
    : []

  const packages = await prisma.package.findMany({
    where: { teacherId: teacher.id, studentId: match.studentId },
    orderBy: { createdAt: 'desc' },
  })
  const activePackages = packages
    .filter(p => p.status === 'active' && p.sessionsUsed < p.sessionsTotal)
    .map(p => ({ id: p.id, name: p.name, remaining: p.sessionsTotal - p.sessionsUsed }))

  const fmt = (p: number) => `£${(p / 100).toFixed(0)}`
  const rate = effectiveRatePence(match, teacher)
  const now = new Date()
  const PKG_STATUS: Record<string, string> = {
    unpaid: 'bg-amber-50 text-amber-700',
    active: 'bg-brand-50 text-brand-700',
    completed: 'bg-sand-100 text-sand-600',
    cancelled: 'bg-red-50 text-red-600',
  }

  return (
    <main className="min-h-screen bg-sand-50">
      <TeacherNav />

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <PageHeader
          title={`${match.student.firstName} ${match.student.lastName}`}
          subtitle={
            [
              clientEmail(match.student) ?? 'No account · managed by you',
              match.source === 'invite' ? 'invited' : null,
              !match.student.userId ? 'managed' : null,
            ].filter(Boolean).join(' · ')
          }
          help={{ href: '/teacher/help', label: 'How students work' }}
        />

        {/* Per-student rate */}
        <section className="mb-8">
          <h2 className="font-medium text-sand-900 mb-3 flex items-center">
            Lesson rate
            <HelpTip label="About the per-student rate">
              This is the price charged when you book this student&rsquo;s lessons. Leave it blank to
              use your default rate. You can change it any time.
            </HelpTip>
          </h2>
          <RateEditor
            matchId={match.id}
            customRatePence={match.customRatePence}
            standardRatePence={teacher.sessionRatePence}
          />
        </section>

        {/* Mobile for SMS reminders */}
        <section className="mb-8">
          <h2 className="font-medium text-sand-900 mb-3 flex items-center">
            Mobile for reminders
            <HelpTip label="About text reminders">
              When a mobile is on file, this student gets a text 24 hours before each lesson, in
              addition to the email reminder. Only ever used for appointment reminders.
            </HelpTip>
          </h2>
          <PhoneEditor matchId={match.id} initial={match.student.phone} />
        </section>

        {/* Schedule a lesson */}
        <section className="mb-8">
          <h2 className="font-medium text-sand-900 mb-3">Schedule a lesson</h2>
          <div className="mb-3">
            <HelpHint tone="note">
              There are two ways a student can pay. <strong>Online</strong> means they pay by card
              through a secure link we email them — handy once your card payments are set up.
              <strong> Offline</strong> means you arrange payment yourself (for example before Stripe
              is connected); we still email the lesson details and video link. Either way, the
              lesson shows up below.
            </HelpHint>
          </div>
          <ScheduleForm matchId={match.id} ratePence={rate} packages={activePackages} />
        </section>

        {/* Notes */}
        <section className="mb-8">
          <h2 className="font-medium text-sand-900 mb-3 flex items-center">
            Notes
            <HelpTip label="About notes">
              Private working notes only you can see. Keep your full records (lesson notes,
              assessments, etc.) in your own secure system — link to them below.
            </HelpTip>
          </h2>
          <NotesEditor matchId={match.id} initial={match.notes} />
        </section>

        {/* Parent portal (P2-3) */}
        {showParentPortal && (
          <section className="mb-8">
            <h2 className="font-medium text-sand-900 mb-3 flex items-center">
              Parent portal
              <HelpTip label="About the parent portal">
                Invite a parent to follow this student&rsquo;s lessons — attendance, invoices,
                and a direct line to you. The parent pays £4.99/month directly; it doesn&rsquo;t
                affect your earnings.
              </HelpTip>
            </h2>
            {parentLinks.length > 0 && (
              <ul className="mb-3 space-y-1.5">
                {parentLinks.map(p => (
                  <li key={p.id} className="text-sm text-sand-700 flex items-center gap-2">
                    <span>{p.inviteEmail}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${p.portalActive ? 'bg-brand-50 text-brand-700 border border-brand-200' : 'bg-sand-100 text-sand-500'}`}>
                      {p.portalActive ? 'Active' : p.status === 'active' ? 'Linked · not subscribed' : 'Invited'}
                    </span>
                  </li>
                ))}
              </ul>
            )}
            <InviteParentForm matchId={match.id} />
            {parentLinks.filter(p => p.status === 'active').map(p => (
              <div key={p.id} className="mt-4 border-t border-sand-100 pt-4">
                <p className="text-xs text-sand-500 mb-2">Messages with {p.inviteEmail}</p>
                <ParentMessages
                  parentLinkId={p.id}
                  viewerClerkId={userId}
                  initial={(p.parentThread?.messages ?? []).map(m => ({ id: m.id, body: m.body, senderClerkId: m.senderClerkId, createdAt: m.createdAt.toISOString() }))}
                />
              </div>
            ))}
          </section>
        )}

        {/* Documents (external links) */}
        <section className="mb-8">
          <h2 className="font-medium text-sand-900 mb-3 flex items-center">
            Documents
            <HelpTip label="About documents">
              Link to documents you keep in your own storage (Google Drive, OneDrive, etc.). fair-do
              stores only the link — never the document.
            </HelpTip>
          </h2>
          <div className="mb-3">
            <HelpHint tone="note">
              For lesson notes, homework, resources, or progress records — keep the file in your own
              system and add a link here for quick access.
            </HelpHint>
          </div>
          <StudentDocuments
            matchId={match.id}
            initial={match.documents.map(d => ({ id: d.id, label: d.label, url: d.url, category: d.category }))}
          />
        </section>

        {/* Forms (intake / consent) */}
        <section className="mb-8">
          <h2 className="font-medium text-sand-900 mb-3 flex items-center">
            Forms
            <HelpTip label="About forms">
              Send an intake or consent form for your student to complete online before a lesson.
              Their answers come straight back to you here.
            </HelpTip>
          </h2>
          <StudentForms
            matchId={match.id}
            appUrl={appUrl}
            initial={match.forms.map(f => ({ id: f.id, title: f.title, status: f.status, token: f.token, fields: f.fields as unknown as FormField[], responses: f.responses as Record<string, unknown> | null }))}
          />
        </section>

        {/* Packages */}
        <section className="mb-8">
          <h2 className="font-medium text-sand-900 mb-3">Packages</h2>
          {packages.length > 0 && (
            <div className="bg-white rounded-2xl border border-sand-200 overflow-hidden mb-3">
              {packages.map((p, i) => (
                <div key={p.id} className={`flex items-center justify-between px-5 py-4 ${i > 0 ? 'border-t border-sand-100' : ''}`}>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-sand-900 truncate">{p.name}</p>
                    <p className="text-xs text-sand-400 mt-0.5">
                      {p.sessionsUsed}/{p.sessionsTotal} used · {fmt(p.pricePence)}
                      {' · '}{fmt(Math.round(p.pricePence / p.sessionsTotal))}/lesson
                    </p>
                  </div>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${PKG_STATUS[p.status] ?? 'bg-sand-100 text-sand-600'}`}>
                    {p.status === 'active' ? `${p.sessionsTotal - p.sessionsUsed} left` : p.status}
                  </span>
                </div>
              ))}
            </div>
          )}
          <CreatePackageForm matchId={match.id} standardRatePence={teacher.sessionRatePence} />
        </section>

        {/* Lessons */}
        <section>
          <h2 className="font-medium text-sand-900 mb-3">Lessons</h2>
          {match.sessions.length === 0 ? (
            <EmptyState
              icon="📅"
              title="No lessons yet"
              body="When you book a lesson it'll appear here with a video link you can both join — just use the schedule form above to set the first one up."
            />
          ) : (
            <div className="bg-white rounded-2xl border border-sand-200 overflow-hidden">
              {match.sessions.map((s, i) => {
                const isUpcoming = s.scheduledAt >= now && s.status === 'SCHEDULED'
                return (
                  <div key={s.id} className={`flex items-center justify-between px-5 py-4 ${i > 0 ? 'border-t border-sand-100' : ''}`}>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-sand-900">
                        {s.scheduledAt.toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}
                      </p>
                      <p className="text-xs text-sand-400 mt-0.5">
                        {s.durationMins} mins
                        {s.payment ? ` · ${fmt(s.payment.amountTotalPence)} paid` : ' · payment pending'}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_CLASS[s.status] ?? 'bg-sand-100 text-sand-600'}`}>
                        {s.status.replace('_', ' ').toLowerCase()}
                      </span>
                      {s.payment && (
                        <Link href={`/receipt/${s.payment.id}`} className="text-sm text-sand-500 hover:text-brand-700">
                          Receipt
                        </Link>
                      )}
                      {isUpcoming && (
                        <Link href={`/session/${s.id}`} className="text-sm text-brand-600 hover:text-brand-700 font-medium">
                          View →
                        </Link>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  )
}
