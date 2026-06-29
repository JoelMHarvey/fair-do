import { redirect } from 'next/navigation'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Logo } from '@/components/Logo'
import AvailabilityGrid from './AvailabilityGrid'

const START_HOUR = 8
const END_HOUR = 20 // last session start considered

function hm(t: string) {
  const [h, m] = t.split(':').map(Number)
  return h * 60 + m
}

export default async function AvailabilityPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const user = await prisma.user.findUnique({ where: { clerkId: userId }, include: { student: true } })
  if (!user) redirect('/onboarding')
  if (user.role !== 'STUDENT' || !user.student) redirect('/dashboard')

  // Region-scope like matching (same country; US in-state).
  const where: { status: 'ACTIVE'; availableForNew: true; country: typeof user.country; licenseState?: string } = {
    status: 'ACTIVE', availableForNew: true, country: user.country,
  }
  if (user.country === 'US' && user.student.usState) where.licenseState = user.student.usState

  const teachers = await prisma.teacher.findMany({
    where,
    select: { id: true, firstName: true, lastName: true, sessionRatePence: true, introRatePence: true, country: true, availability: true },
  })

  // Build next 7 days × hourly slots → which teachers are free.
  const now = new Date()
  const days: { date: string; label: string; dow: number }[] = []
  for (let i = 0; i < 7; i++) {
    const d = new Date(now)
    d.setDate(now.getDate() + i)
    days.push({
      date: d.toISOString().slice(0, 10),
      label: i === 0 ? 'Today' : d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric' }),
      dow: d.getDay(),
    })
  }
  const hours: number[] = []
  for (let h = START_HOUR; h <= END_HOUR; h++) hours.push(h)

  // slotMap[`${date}|${hour}`] = [{id, name, rate, country}]
  const slotMap: Record<string, { id: string; name: string; ratePence: number; country: string }[]> = {}
  for (const day of days) {
    for (const hour of hours) {
      const startMin = hour * 60
      const free = teachers.filter(t =>
        t.availability.some(a => a.dayOfWeek === day.dow && hm(a.startTime) <= startMin && hm(a.endTime) >= startMin + 50),
      )
      if (free.length) {
        slotMap[`${day.date}|${hour}`] = free.map(t => ({
          id: t.id,
          name: `${t.firstName} ${t.lastName}`,
          ratePence: t.introRatePence ?? t.sessionRatePence,
          country: t.country,
        }))
      }
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-brand-50/50 to-sand-50">
      <nav className="border-b border-sand-200 bg-white/80 backdrop-blur px-5 sm:px-8 h-16 flex items-center justify-between sticky top-0 z-40">
        <Logo />
        <div className="flex items-center gap-4 text-sm">
          <Link href="/tutors" className="text-sand-500 hover:text-brand-700">List view</Link>
          <Link href="/dashboard" className="text-sand-500 hover:text-brand-700">← Dashboard</Link>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-5 sm:px-6 py-10">
        <h1 className="font-display text-3xl font-semibold text-brand-900 mb-1">Find a time that works</h1>
        <p className="text-sand-600 mb-8">Tap any slot to see who&apos;s free then. Numbers show how many tutors are available.</p>

        {teachers.length === 0 ? (
          <div className="bg-white rounded-3xl border border-sand-200 p-10 text-center shadow-sm">
            <p className="text-sand-600">No tutors available right now — check back soon.</p>
          </div>
        ) : (
          <AvailabilityGrid days={days} hours={hours} slotMap={slotMap} />
        )}
      </div>
    </main>
  )
}
