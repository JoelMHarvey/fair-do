import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Logo } from '@/components/Logo'
import { PRACTICE_PORTAL_ENABLED, practiceDisplayName } from '@/lib/practice'
import { LocalPrice } from '@/components/LocalPrice'
import SelfBookForm from './SelfBookForm'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const t = await prisma.teacher.findUnique({ where: { practiceSlug: slug }, select: { firstName: true, lastName: true, practiceName: true } })
  if (!t) return { title: 'Book — fair-do' }
  return { title: `Book with ${practiceDisplayName(t)} — fair-do`, robots: { index: false, follow: false } }
}

const BOOKING_BANNER: Record<string, { tone: 'good' | 'bad'; text: string }> = {
  confirmed: { tone: 'good', text: '✓ Your lesson is confirmed — we\'ve emailed you the details.' },
  expired: { tone: 'bad', text: 'That confirmation link has expired. Please book again below.' },
  invalid: { tone: 'bad', text: 'That confirmation link isn\'t valid. Please book again below.' },
  taken: { tone: 'bad', text: 'Sorry — that time was taken before you confirmed. Please pick another.' },
  unavailable: { tone: 'bad', text: 'This studio isn\'t taking bookings right now.' },
  error: { tone: 'bad', text: 'Something went wrong confirming your booking. Please try again.' },
}

export default async function PracticeBookingPage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ booking?: string }> }) {
  if (!PRACTICE_PORTAL_ENABLED) notFound()
  const { slug } = await params
  const banner = BOOKING_BANNER[(await searchParams).booking ?? '']

  const teacher = await prisma.teacher.findUnique({
    where: { practiceSlug: slug },
    include: { availability: true },
  })
  if (!teacher || teacher.status !== 'ACTIVE') notFound()

  const upcoming = await prisma.session.findMany({
    where: { teacherId: teacher.id, scheduledAt: { gte: new Date() }, status: { not: 'CANCELLED' } },
    select: { scheduledAt: true },
  })

  const notTaking = !teacher.availableForNew || teacher.availability.length === 0

  return (
    <main className="min-h-screen bg-gradient-to-b from-brand-50 via-sand-50 to-sand-50">
      <nav className="bg-white/80 backdrop-blur border-b border-sand-200 px-5 sm:px-8 h-16 flex items-center">
        <Logo />
      </nav>
      <div className="max-w-xl mx-auto px-5 sm:px-8 py-12">
        {banner && (
          <div className={`rounded-2xl px-5 py-4 mb-6 text-sm border ${banner.tone === 'good' ? 'bg-brand-50 border-brand-200 text-brand-800' : 'bg-coral-50 border-coral-200 text-coral-700'}`}>
            {banner.text}
          </div>
        )}
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl font-semibold text-brand-900">Book with {teacher.firstName} {teacher.lastName}</h1>
          {teacher.tagline && <p className="text-sand-600 mt-2">{teacher.tagline}</p>}
          <p className="text-sand-500 text-sm mt-2">{practiceDisplayName(teacher)} · from <LocalPrice minor={teacher.sessionRatePence} base={teacher.country === 'US' ? 'USD' : 'GBP'} whole /> / lesson · {teacher.qualificationBody} qualified</p>
        </div>

        {notTaking ? (
          <div className="bg-white rounded-3xl border border-sand-200 p-8 text-center text-sand-500 shadow-sm">
            {teacher.firstName} isn't taking new bookings online right now.
          </div>
        ) : (
          <SelfBookForm
            slug={slug}
            availability={teacher.availability.map(a => ({ dayOfWeek: a.dayOfWeek, startTime: a.startTime, endTime: a.endTime }))}
            booked={upcoming.map(s => s.scheduledAt.toISOString())}
          />
        )}
      </div>
    </main>
  )
}
