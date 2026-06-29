import { ldJson } from '@/lib/jsonld'
import { LocalPrice } from '@/components/LocalPrice'
import { notFound } from 'next/navigation'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { getRetentionStats, getTherapistRating } from '@/lib/metrics'
import Link from 'next/link'
import { Logo } from '@/components/Logo'
import type { Metadata } from 'next'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const teacher = await prisma.teacher.findUnique({ where: { id, status: 'ACTIVE' } })
  if (!teacher) return { title: 'Tutor not found' }
  return {
    title: `${teacher.firstName} ${teacher.lastName} — fair-do`,
    description: teacher.tagline ?? teacher.bio.slice(0, 160),
  }
}

const DAY = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export default async function TutorProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { userId } = await auth()

  const teacher = await prisma.teacher.findUnique({
    where: { id, status: 'ACTIVE' },
    include: { availability: true },
  })
  if (!teacher) notFound()

  const retention = await getRetentionStats(teacher.id)
  const rating = await getTherapistRating(teacher.id)
  const reviews = rating.count > 0
    ? await prisma.review.findMany({
        where: { teacherId: teacher.id, comment: { not: null } },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: { id: true, rating: true, comment: true, createdAt: true },
      })
    : []
  const availableDays = [...new Set(teacher.availability.map(a => DAY[a.dayOfWeek]))].join(', ')

  let isStudent = false
  if (userId) {
    const user = await prisma.user.findUnique({ where: { clerkId: userId }, include: { student: true } })
    isStudent = user?.role === 'STUDENT' && !!user.student
  }

  const cur = teacher.country === 'US' ? '$' : '£'
  const priceBase = teacher.country === 'US' ? 'USD' : 'GBP'

  const links = [
    { label: 'Website', url: teacher.websiteUrl },
    { label: 'LinkedIn', url: teacher.linkedinUrl },
  ].filter(l => l.url)

  const showIntro = teacher.introRatePence != null && teacher.introRatePence < teacher.sessionRatePence

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: ldJson({
            '@context': 'https://schema.org',
            '@type': 'Person',
            name: `${teacher.firstName} ${teacher.lastName}`,
            jobTitle: teacher.professionalTitle || 'Tutor',
            description: teacher.bio,
            url: `https://fair-do.co.uk/tutors/${teacher.id}`,
          }),
        }}
      />

      <main className="min-h-screen bg-gradient-to-b from-brand-50/50 to-sand-50">
        <nav className="border-b border-sand-200 bg-white/80 backdrop-blur px-5 sm:px-8 h-16 flex items-center justify-between">
          <Logo />
          <div className="flex items-center gap-4 text-sm">
            {userId ? (
              <Link href="/dashboard" className="text-sand-500 hover:text-brand-700">Dashboard</Link>
            ) : (
              <>
                <Link href="/sign-in" className="text-sand-500 hover:text-brand-700">Sign in</Link>
                <Link href="/sign-up" className="bg-brand-600 text-white px-4 py-2 rounded-full hover:bg-brand-700 transition">Get started</Link>
              </>
            )}
          </div>
        </nav>

        <div className="max-w-3xl mx-auto px-5 sm:px-6 py-10 sm:py-14">
          {/* Header */}
          <div className="bg-white rounded-3xl border border-sand-200 p-7 sm:p-8 mb-5 shadow-sm">
            <div className="flex items-start gap-5 flex-wrap">
              <div className="w-20 h-20 rounded-2xl bg-brand-100 overflow-hidden flex items-center justify-center text-brand-700 font-display font-semibold text-2xl shrink-0">
                {teacher.profileImageUrl
                  ? <img src={teacher.profileImageUrl} alt="" className="w-full h-full object-cover" />
                  : <>{teacher.firstName[0]}{teacher.lastName[0]}</>}
              </div>
              <div className="flex-1 min-w-[200px]">
                <h1 className="font-display text-2xl font-semibold text-brand-900">
                  {teacher.firstName} {teacher.lastName}
                </h1>
                {teacher.professionalTitle && <p className="text-brand-700 text-sm font-medium mt-0.5">{teacher.professionalTitle}</p>}
                {teacher.tagline && <p className="text-sand-600 mt-1">{teacher.tagline}</p>}
                <div className="flex items-center gap-2 flex-wrap mt-3">
                  <span className="text-xs font-medium bg-brand-50 text-brand-700 px-2.5 py-1 rounded-full border border-brand-200">
                    {teacher.credentialVerified ? `✓ ${teacher.qualificationBody} verified` : `${teacher.qualificationBody} qualified`}
                  </span>
                  {rating.count > 0 && (
                    <span className="text-xs font-medium bg-amber-50 text-amber-700 px-2.5 py-1 rounded-full border border-amber-200">
                      ★ {rating.average} ({rating.count})
                    </span>
                  )}
                  {teacher.isFoundingMember && (
                    <span className="text-xs font-medium bg-coral-50 text-coral-600 px-2.5 py-1 rounded-full border border-coral-200">
                      ★ Founding tutor
                    </span>
                  )}
                  {retention.isHighContinuity && (
                    <span className="text-xs font-medium bg-coral-50 text-coral-600 px-2.5 py-1 rounded-full border border-coral-200">
                      ★ Students keep coming back
                    </span>
                  )}
                  {teacher.availableForNew && (
                    <span className="text-xs font-medium bg-sand-100 text-sand-600 px-2.5 py-1 rounded-full">
                      Accepting new students
                    </span>
                  )}
                </div>
              </div>
              <div className="text-right">
                {showIntro ? (
                  <>
                    <p className="font-display text-3xl font-semibold text-brand-900"><LocalPrice minor={teacher.introRatePence!} base={priceBase} whole approxClassName="text-base font-normal text-sand-400" /></p>
                    <p className="text-xs text-coral-600">first lesson</p>
                    <p className="text-xs text-sand-400 mt-0.5">then <LocalPrice minor={teacher.sessionRatePence} base={priceBase} whole /></p>
                  </>
                ) : (
                  <>
                    <p className="font-display text-3xl font-semibold text-brand-900"><LocalPrice minor={teacher.sessionRatePence} base={priceBase} whole approxClassName="text-base font-normal text-sand-400" /></p>
                    <p className="text-xs text-sand-500">per lesson</p>
                  </>
                )}
              </div>
            </div>

            {teacher.introVideoUrl && (
              <a href={teacher.introVideoUrl} target="_blank" rel="noopener noreferrer"
                 className="inline-flex items-center gap-2 mt-5 text-sm text-brand-700 hover:text-brand-800 font-medium">
                ▶ Watch intro video
              </a>
            )}
          </div>

          {/* Bio */}
          <div className="bg-white rounded-3xl border border-sand-200 p-7 mb-5 shadow-sm">
            <h2 className="font-display text-lg font-semibold text-brand-900 mb-3">About {teacher.firstName}</h2>
            <p className="text-sand-700 leading-relaxed whitespace-pre-line">{teacher.bio}</p>
            {links.length > 0 && (
              <div className="flex flex-wrap gap-3 mt-5 pt-5 border-t border-sand-100">
                {links.map(l => (
                  <a key={l.label} href={l.url!} target="_blank" rel="noopener noreferrer"
                     className="text-sm text-brand-700 hover:text-brand-800 underline underline-offset-2">
                    {l.label} ↗
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
            <div className="bg-white rounded-3xl border border-sand-200 p-6 shadow-sm">
              <h2 className="text-sm font-semibold text-sand-500 mb-3 uppercase tracking-wide">Subjects</h2>
              <div className="flex flex-wrap gap-2">
                {teacher.subjects.map(s => (
                  <span key={s} className="text-sm bg-sand-100 text-sand-700 px-3 py-1 rounded-full">{s}</span>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-3xl border border-sand-200 p-6 shadow-sm">
              <h2 className="text-sm font-semibold text-sand-500 mb-3 uppercase tracking-wide">Teaching styles</h2>
              <div className="flex flex-wrap gap-2">
                {teacher.teachingStyles.map(a => (
                  <span key={a} className="text-sm bg-sand-100 text-sand-700 px-3 py-1 rounded-full">{a}</span>
                ))}
              </div>
            </div>
          </div>

          {teacher.languages.length > 1 && (
            <div className="bg-white rounded-3xl border border-sand-200 p-6 mb-5 shadow-sm">
              <h2 className="text-sm font-semibold text-sand-500 mb-3 uppercase tracking-wide">Languages</h2>
              <div className="flex flex-wrap gap-2">
                {teacher.languages.map(l => (
                  <span key={l} className="text-sm bg-sand-100 text-sand-700 px-3 py-1 rounded-full">{l}</span>
                ))}
              </div>
            </div>
          )}

          {reviews.length > 0 && (
            <div className="bg-white rounded-3xl border border-sand-200 p-6 mb-5 shadow-sm">
              <h2 className="text-sm font-semibold text-sand-500 mb-4 uppercase tracking-wide">
                Reviews <span className="text-amber-600">★ {rating.average}</span> <span className="text-sand-400 normal-case">· {rating.count}</span>
              </h2>
              <div className="space-y-4">
                {reviews.map(r => (
                  <div key={r.id} className="border-b border-sand-100 last:border-0 pb-4 last:pb-0">
                    <p className="text-amber-500 text-sm mb-1">{'★'.repeat(r.rating)}<span className="text-sand-200">{'★'.repeat(5 - r.rating)}</span></p>
                    <p className="text-sand-700 text-sm">{r.comment}</p>
                    <p className="text-xs text-sand-400 mt-1">{new Date(r.createdAt).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-white rounded-3xl border border-sand-200 p-6 mb-8 shadow-sm">
            <h2 className="text-sm font-semibold text-sand-500 mb-2 uppercase tracking-wide">Availability</h2>
            <p className="text-sand-700">{availableDays || 'Contact for availability'}</p>
            {teacher.groupMaxSize > 1 && teacher.groupRatePence && (
              <p className="text-sm text-brand-700 mt-2">
                Offers group lessons — up to {teacher.groupMaxSize} people at {cur}{(teacher.groupRatePence / 100).toFixed(0)}/person
              </p>
            )}
          </div>

          {/* CTA */}
          {isStudent ? (
            <Link
              href={`/book/${teacher.id}`}
              className="block w-full text-center bg-brand-600 text-white font-medium py-4 rounded-full hover:bg-brand-700 transition text-lg shadow-lg shadow-brand-600/20"
            >
              {showIntro
                ? `Book first lesson — ${cur}${(teacher.introRatePence! / 100).toFixed(0)}`
                : `Book a lesson — ${cur}${(teacher.sessionRatePence / 100).toFixed(0)}`}
            </Link>
          ) : (
            <div className="bg-white rounded-3xl border border-sand-200 p-8 text-center shadow-sm">
              <p className="text-sand-600 mb-4">Create a free account to book with {teacher.firstName}.</p>
              <Link href="/sign-up" className="inline-block bg-brand-600 text-white font-medium px-8 py-3 rounded-full hover:bg-brand-700 transition">
                Get started — it&apos;s free
              </Link>
            </div>
          )}

          <p className="text-center text-xs text-sand-400 mt-4">
            Cancel free up to 24 hours before · Secure payment via Stripe
          </p>
        </div>
      </main>
    </>
  )
}
