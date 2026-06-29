import { redirect } from 'next/navigation'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { getMatchesForClient } from '@/lib/matching'
import Link from 'next/link'
import { Logo } from '@/components/Logo'
import { SiteNav } from '@/components/SiteNav'
import { SiteFooter } from '@/components/SiteFooter'
import { LocalPrice } from '@/components/LocalPrice'
import { getVisitorCurrency } from '@/lib/visitor-currency'
import { DIRECTORY_ENABLED } from '@/lib/practice'
import { getRates } from '@/lib/fx-rates'
import TherapistResults from './TherapistResults'

export const metadata = {
  title: 'Find a tutor — fair-do',
  description: 'Browse qualified UK tutors on fair-do. Verified credentials, fair pricing, secure video lessons.',
  // While the directory is hidden, don't let search engines index the (near-empty) listing.
  ...(DIRECTORY_ENABLED ? {} : { robots: { index: false, follow: false } }),
}

// Public directory shown to logged-out visitors — browse before signing up.
async function PublicDirectory() {
  const raw = await prisma.teacher.findMany({
    // Only list teachers who can actually take a booking + payment (Stripe KYC done).
    where: { status: 'ACTIVE', availableForNew: true, country: 'UK', stripeOnboarded: true },
    select: {
      id: true, firstName: true, lastName: true, tagline: true,
      profileImageUrl: true, qualificationBody: true, credentialVerified: true, isFoundingMember: true,
      subjects: true, sessionRatePence: true, stripeAccountId: true,
    },
    orderBy: { createdAt: 'desc' },
  })
  const teachers = process.env.ALLOW_DEMO_DATA === 'true'
    ? raw
    : raw.filter(t => !t.stripeAccountId?.startsWith('acct_demo_'))

  const ratingRows = teachers.length
    ? await prisma.review.groupBy({
        by: ['teacherId'],
        where: { teacherId: { in: teachers.map(t => t.id) } },
        _avg: { rating: true },
        _count: { rating: true },
      })
    : []
  const ratingMap = new Map(ratingRows.map(r => [r.teacherId, {
    avg: Math.round((r._avg.rating ?? 0) * 10) / 10, count: r._count.rating,
  }]))

  return (
    <>
      <SiteNav />
      <main className="min-h-screen bg-gradient-to-b from-brand-50 via-sand-50 to-sand-50">
        <div className="max-w-5xl mx-auto px-5 sm:px-8 py-14">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h1 className="font-display text-4xl font-semibold text-brand-900">Find your tutor</h1>
            <p className="text-sand-700 mt-3">
              Every tutor is qualified and verified by us. Browse below,
              then create a free account to get personally matched and book.
            </p>
          </div>

          {teachers.length === 0 ? (
            <div className="bg-white rounded-3xl border border-sand-200 p-10 text-center shadow-sm max-w-lg mx-auto">
              <p className="text-brand-900 font-medium mb-2">We&apos;re onboarding our first tutors</p>
              <p className="text-sm text-sand-500 mb-6">fair-do is brand new. Create an account and we&apos;ll let you know the moment your matches are ready.</p>
              <Link href="/sign-up" className="inline-block bg-brand-600 text-white px-6 py-3 rounded-full font-medium hover:bg-brand-700 transition shadow-sm">
                Join the list
              </Link>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {teachers.map(t => {
                  const rating = ratingMap.get(t.id)
                  return (
                    <Link
                      key={t.id}
                      href={`/tutors/${t.id}`}
                      className="bg-white rounded-3xl border border-sand-200 p-6 shadow-sm hover:border-brand-300 hover:shadow-md transition flex flex-col"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-brand-100 overflow-hidden flex items-center justify-center text-brand-700 font-display font-semibold text-xl shrink-0">
                          {t.profileImageUrl
                            ? <img src={t.profileImageUrl} alt={`${t.firstName} ${t.lastName}`} className="w-full h-full object-cover" />
                            : <>{t.firstName[0]}{t.lastName[0]}</>}
                        </div>
                        <div className="min-w-0">
                          <h2 className="font-display font-semibold text-brand-900 truncate">{t.firstName} {t.lastName}</h2>
                          <p className="text-xs text-sand-500 mt-0.5">{t.credentialVerified ? `✓ ${t.qualificationBody} verified` : `${t.qualificationBody} qualified`}</p>
                        </div>
                      </div>
                      {t.tagline && <p className="text-sm text-sand-600 mt-4 line-clamp-2">{t.tagline}</p>}
                      <div className="flex items-center gap-2 flex-wrap mt-4">
                        {rating && rating.count > 0 && (
                          <span className="text-xs font-medium bg-amber-50 text-amber-700 px-2.5 py-1 rounded-full border border-amber-200">★ {rating.avg} ({rating.count})</span>
                        )}
                        {t.isFoundingMember && (
                          <span className="text-xs font-medium bg-coral-50 text-coral-600 px-2.5 py-1 rounded-full border border-coral-200">★ Founding</span>
                        )}
                      </div>
                      <div className="mt-auto pt-4 flex items-center justify-between">
                        <span className="text-sm text-sand-700">from <LocalPrice minor={t.sessionRatePence} base="GBP" whole /></span>
                        <span className="text-sm font-medium text-brand-700">View profile →</span>
                      </div>
                    </Link>
                  )
                })}
              </div>

              <div className="text-center mt-12">
                <p className="text-sand-600 mb-4">Ready to get matched to the right tutor for you?</p>
                <Link href="/sign-up" className="inline-block bg-brand-600 text-white px-7 py-3.5 rounded-full font-medium hover:bg-brand-700 transition shadow-sm">
                  Create a free account
                </Link>
              </div>
            </>
          )}
        </div>
      </main>
      <SiteFooter />
    </>
  )
}

export default async function TutorsPage() {
  const { userId } = await auth()
  if (!userId) return <PublicDirectory />

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: { student: true },
  })

  if (!user) redirect('/onboarding')
  if (user.role !== 'STUDENT' || !user.student) redirect('/dashboard')

  const matches = await getMatchesForClient(user.student.id)
  const [ccy, rates] = await Promise.all([getVisitorCurrency(), getRates()])
  const q = user.student.questionnaire as { reason?: string; reasons?: string[] } | null
  const reasonText = q?.reasons?.length ? q.reasons.join(', ') : q?.reason

  return (
    <main className="min-h-screen bg-gradient-to-b from-brand-50/50 to-sand-50">
      <nav className="border-b border-sand-200 bg-white/80 backdrop-blur px-5 sm:px-8 h-16 flex items-center justify-between sticky top-0 z-40">
        <Logo />
        <div className="flex items-center gap-4 text-sm">
          <Link href="/availability" className="text-sand-500 hover:text-brand-700">Calendar view</Link>
          <Link href="/dashboard" className="text-sand-500 hover:text-brand-700">← Dashboard</Link>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-5 sm:px-6 py-10">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-semibold text-brand-900 mb-2">Your matches</h1>
          {reasonText && (
            <p className="text-sand-600">
              Tutors suited to <span className="text-brand-700 font-medium">{reasonText.toLowerCase()}</span>
            </p>
          )}
        </div>

        {matches.length === 0 ? (
          <div className="bg-white rounded-3xl border border-sand-200 p-10 text-center shadow-sm">
            <p className="text-sand-600 mb-2">No tutors available right now</p>
            <p className="text-sm text-sand-400">We&apos;re growing our network — check back soon.</p>
          </div>
        ) : (
          <TherapistResults therapists={matches} currency={ccy} rates={rates} />
        )}
      </div>
    </main>
  )
}
