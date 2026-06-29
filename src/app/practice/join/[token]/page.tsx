import Link from 'next/link'
import { notFound } from 'next/navigation'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { Logo } from '@/components/Logo'
import { PRACTICE_PORTAL_ENABLED, practiceDisplayName } from '@/lib/practice'
import { HelpHint } from '@/components/Guidance'
import AcceptInvite from './AcceptInvite'

export const metadata = { title: 'Your invite — fair-do', robots: { index: false, follow: false } }

export default async function JoinPracticePage({ params }: { params: Promise<{ token: string }> }) {
  if (!PRACTICE_PORTAL_ENABLED) notFound()
  const { token } = await params

  const invite = await prisma.studentInvite.findUnique({
    where: { token },
    include: { teacher: true },
  })

  const shell = (children: React.ReactNode) => (
    <main className="min-h-screen bg-gradient-to-b from-brand-50/60 to-sand-50">
      <nav className="border-b border-sand-200 bg-white/80 backdrop-blur px-5 sm:px-8 h-16 flex items-center">
        <Logo />
      </nav>
      <div className="max-w-md mx-auto px-5 py-16">{children}</div>
    </main>
  )

  if (!invite) {
    return shell(
      <div className="bg-white rounded-2xl border border-sand-200 p-8 text-center">
        <h1 className="font-display text-2xl font-semibold text-brand-900 mb-2">This link didn't work</h1>
        <p className="text-sand-600 text-sm">
          No need to worry — links sometimes get cut off or expire. Just ask your tutor to send you a fresh one,
          and you'll be able to pick up right where you left off.
        </p>
      </div>,
    )
  }

  const practiceName = practiceDisplayName(invite.teacher)
  const expired = invite.status !== 'pending' || invite.expiresAt < new Date()

  if (expired) {
    return shell(
      <div className="bg-white rounded-2xl border border-sand-200 p-8 text-center">
        <h1 className="font-display text-2xl font-semibold text-brand-900 mb-2">This invite has expired</h1>
        <p className="text-sand-600 text-sm">
          That's completely fine — invite links only stay active for a little while for your safety. Just ask{' '}
          {practiceName} to send you a new one, and you can accept it then.
        </p>
      </div>,
    )
  }

  const { userId } = await auth()
  const user = userId
    ? await prisma.user.findUnique({ where: { clerkId: userId }, include: { student: true } })
    : null

  const rateLine = invite.customRatePence != null
    ? `Your lesson rate is £${(invite.customRatePence / 100).toFixed(0)}.`
    : null

  return shell(
    <div className="bg-white rounded-2xl border border-sand-200 p-8">
      <p className="text-xs font-semibold uppercase tracking-wide text-coral-600 mb-2">You've been invited</p>
      <h1 className="font-display text-2xl font-semibold text-brand-900 mb-3">
        {practiceName} would like to see you on fair-do
      </h1>
      <p className="text-sand-600 text-sm mb-2">
        fair-do is a simple, secure place to book your lessons, join by video and pay — all in one place.
      </p>
      {invite.note && (
        <blockquote className="border-l-2 border-brand-300 pl-3 text-sand-600 italic text-sm my-4">
          {invite.note}
        </blockquote>
      )}
      {rateLine && <p className="text-sand-700 text-sm font-medium mb-4">{rateLine}</p>}

      <div className="mb-6">
        <HelpHint>
          <span className="block mb-2">
            <strong>{practiceName}</strong> invited you here, and accepting only ever connects you to them — no one else
            can see you or message you.
          </span>
          <span className="block mb-2">
            It's free to accept, and you're never charged anything until you choose to book a lesson.
          </span>
          <span className="block">
            Once you accept, you'll be able to book your lessons and meet {practiceName} over secure, private video —
            all in one place, at your own pace.
          </span>
        </HelpHint>
      </div>

      {userId ? (
        <AcceptInvite token={token} needsName={!user?.student} suggestedFirstName={invite.firstName ?? ''} />
      ) : (
        <div className="space-y-3">
          <Link
            href={`/sign-up?redirect_url=/practice/join/${token}`}
            className="block w-full text-center bg-brand-600 hover:bg-brand-700 text-white font-medium rounded-full py-3 transition"
          >
            Create an account to accept
          </Link>
          <Link
            href={`/sign-in?redirect_url=/practice/join/${token}`}
            className="block w-full text-center text-sm text-sand-600 hover:text-brand-700"
          >
            Already have a fair-do account? Sign in
          </Link>
        </div>
      )}
    </div>,
  )
}
