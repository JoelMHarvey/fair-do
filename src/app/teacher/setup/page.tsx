import Link from 'next/link'
import type { ReactNode } from 'react'
import { redirect, notFound } from 'next/navigation'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { TeacherNav } from '@/components/TeacherNav'
import { PRACTICE_PORTAL_ENABLED } from '@/lib/practice'
import { PageHeader, HelpHint } from '@/components/Guidance'
import { HelpTip } from '@/components/HelpTip'

export const metadata = { title: 'Set up your studio — fair-do' }

type Step = { title: string; detail: string; href: string; cta: string; done: boolean; optional?: boolean; tip?: ReactNode }

export default async function StudioSetupPage() {
  if (!PRACTICE_PORTAL_ENABLED) notFound()

  const { userId } = await auth()
  if (!userId) redirect('/sign-in')
  const user = await prisma.user.findUnique({ where: { clerkId: userId }, include: { teacher: true } })
  if (!user?.teacher) redirect('/onboarding')
  const teacher = user.teacher

  const [subscription, studentCount, inviteCount] = await Promise.all([
    prisma.subscription.findUnique({ where: { teacherId: teacher.id } }),
    prisma.match.count({ where: { teacherId: teacher.id, active: true } }),
    prisma.studentInvite.count({ where: { teacherId: teacher.id, status: 'pending' } }),
  ])
  const hasPlan = !!subscription && (subscription.status === 'active' || subscription.status === 'trialing')
  const hasStudents = studentCount + inviteCount > 0

  const steps: Step[] = [
    { title: 'Choose your plan', detail: 'Pick Starter (free), Practice or School — this sets your commission.', href: '/teacher/billing', cta: 'Choose a plan', done: hasPlan, tip: 'Your plan decides the small fee we take on each lesson. Starter is free to begin with — you can change plan any time.' },
    { title: 'Connect payments', detail: 'Set up Stripe so you can take card payments and get paid out.', href: '/onboarding/teacher', cta: 'Connect Stripe', done: teacher.stripeOnboarded, tip: 'Stripe is our secure payments partner. You\'ll enter your name, bank details and ID so you can take card payments and have the money paid out to your bank.' },
    { title: 'Set your rate', detail: 'Confirm your standard lesson rate (you can set per-student rates too).', href: '/teacher/profile', cta: 'Review rate', done: teacher.sessionRatePence > 0, tip: 'This is the standard price students pay for a lesson. You can still set a different price for individual students later.' },
    { title: 'Add your first student', detail: 'Invite one student, or import your whole list at once.', href: '/teacher/students', cta: 'Add students', done: hasStudents, tip: 'We\'ll send each student a private invite to join your studio. Nothing is shared publicly.' },
    { title: 'Get discoverable', detail: 'List your profile in the directory so new students can find and book you.', href: '/teacher/students', cta: 'Manage listing', done: teacher.availableForNew, optional: true, tip: 'Optional. Turn this on when you\'d like new students to find you in our directory and book a first lesson.' },
  ]

  const core = steps.filter(s => !s.optional)
  const doneCore = core.filter(s => s.done).length
  const allCoreDone = doneCore === core.length
  const pct = Math.round((doneCore / core.length) * 100)

  return (
    <main className="min-h-screen bg-sand-50">
      <TeacherNav />

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <PageHeader
          title="Set up your studio"
          subtitle="These few steps get you ready to take bookings and payments. Once they're done, students can find, book and pay you in one place."
          help={{ href: '/teacher/help', label: 'How setup works' }}
        />

        <div className="mb-6">
          <HelpHint>
            There's no right order — do the steps that suit you now and come back for the rest whenever you like. Nothing is final, and you can change everything later.
          </HelpHint>
        </div>

        {/* Progress */}
        <div className="bg-white rounded-2xl border border-sand-200 p-5 mb-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-sand-800">
              {allCoreDone ? 'You\'re all set 🎉' : `${doneCore} of ${core.length} done`}
            </p>
            <p className="text-xs text-sand-400">{pct}%</p>
          </div>
          <div className="h-2 rounded-full bg-sand-100 overflow-hidden">
            <div className="h-full bg-brand-500 transition-all" style={{ width: `${pct}%` }} />
          </div>
        </div>

        {/* Steps */}
        <div className="space-y-3">
          {steps.map((s, i) => (
            <div
              key={s.title}
              className={`bg-white rounded-2xl border p-5 flex items-start gap-4 ${s.done ? 'border-sand-200' : 'border-sand-200'}`}
            >
              <div className={`mt-0.5 w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 ${s.done ? 'bg-brand-500 text-white' : 'bg-sand-100 text-sand-500'}`}>
                {s.done ? '✓' : i + 1}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-sand-900">
                  {s.title}
                  {s.tip && <HelpTip>{s.tip}</HelpTip>}
                  {s.optional && <span className="text-xs font-normal text-sand-400"> · optional</span>}
                </p>
                <p className="text-sm text-sand-500 mt-0.5">{s.detail}</p>
              </div>
              {!s.done && (
                <Link href={s.href} className="text-sm font-medium text-brand-600 hover:text-brand-700 shrink-0 self-center">
                  {s.cta} →
                </Link>
              )}
            </div>
          ))}
        </div>

        {allCoreDone && (
          <div className="mt-6 text-center">
            <Link href="/teacher/dashboard" className="inline-block bg-brand-600 hover:bg-brand-700 text-white font-medium rounded-full px-6 py-3 transition">
              Go to your dashboard
            </Link>
          </div>
        )}
      </div>
    </main>
  )
}
