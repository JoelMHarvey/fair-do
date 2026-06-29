'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'

type AvailSlot = { dayOfWeek: number; startTime: string; endTime: string }

type Props = {
  teacherId: string
  teacherName: string
  sessionRatePence: number
  introRatePence: number | null
  groupRatePence: number | null
  groupMaxSize: number
  hasPriorSession: boolean
  creditBalancePence: number
  orgName: string | null
  orgPoolPence: number
  currency: string
  availability: AvailSlot[]
  studentId: string
}

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function getNext8Weeks(): Date[] {
  const dates: Date[] = []
  const now = new Date()
  const start = new Date(now)
  start.setDate(start.getDate() + 1)
  start.setHours(0, 0, 0, 0)
  for (let i = 0; i < 56; i++) {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    dates.push(d)
  }
  return dates
}

function generateSlots(date: Date, avail: AvailSlot[]): string[] {
  const dow = date.getDay()
  const dayAvail = avail.find(a => a.dayOfWeek === dow)
  if (!dayAvail) return []
  const slots: string[] = []
  const [startH, startM] = dayAvail.startTime.split(':').map(Number)
  const [endH, endM] = dayAvail.endTime.split(':').map(Number)
  const startMins = startH * 60 + startM
  const endMins = endH * 60 + endM
  for (let m = startMins; m + 50 <= endMins; m += 60) {
    const hh = String(Math.floor(m / 60)).padStart(2, '0')
    const mm = String(m % 60).padStart(2, '0')
    slots.push(`${hh}:${mm}`)
  }
  return slots
}

export default function BookingForm({
  teacherId, teacherName, sessionRatePence, introRatePence,
  groupRatePence, groupMaxSize, hasPriorSession, creditBalancePence,
  orgName, orgPoolPence, currency, availability,
}: Props) {
  const router = useRouter()
  const bookingsOpen = process.env.NEXT_PUBLIC_BOOKINGS_ENABLED === 'true'
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [seats, setSeats] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const groupAvailable = groupMaxSize > 1 && groupRatePence != null
  const isGroup = seats > 1
  const useIntro = !isGroup && !hasPriorSession && introRatePence != null && introRatePence < sessionRatePence
  const ratePence = isGroup
    ? groupRatePence! * seats
    : useIntro ? introRatePence! : sessionRatePence
  const payWithOrg = orgName != null && orgPoolPence >= ratePence
  const payWithCredit = !payWithOrg && creditBalancePence >= ratePence
  const internalPay = payWithOrg || payWithCredit

  const availableDates = useMemo(() => {
    const allDates = getNext8Weeks()
    const availDows = new Set(availability.map(a => a.dayOfWeek))
    return allDates.filter(d => availDows.has(d.getDay()))
  }, [availability])

  const slots = useMemo(() =>
    selectedDate ? generateSlots(selectedDate, availability) : [],
    [selectedDate, availability])

  function formatDate(d: Date) {
    return d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })
  }

  async function book() {
    if (!selectedDate || !selectedTime) return
    setSubmitting(true)
    setError('')
    const [h, m] = selectedTime.split(':').map(Number)
    const scheduledAt = new Date(selectedDate)
    scheduledAt.setHours(h, m, 0, 0)

    const res = await fetch('/api/booking/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ teacherId, scheduledAt: scheduledAt.toISOString(), seats }),
    })

    if (!res.ok) {
      const msg = await res.json().then(d => d?.error).catch(() => null)
      setError(msg || 'Booking failed. Please try again.')
      setSubmitting(false)
      return
    }

    const data = await res.json()
    if (data.paidWithCredit) {
      router.push(`/session/${data.sessionId}?booked=true`)
      return
    }
    window.location.href = data.checkoutUrl
  }

  const rate = ratePence / 100
  const fullRate = sessionRatePence / 100

  const dateBtn = (selected: boolean) =>
    `flex flex-col items-center py-2.5 px-1 rounded-xl border text-xs transition ${
      selected ? 'border-brand-500 bg-brand-50 text-brand-700 font-medium' : 'border-sand-200 bg-white text-sand-600 hover:border-brand-300'
    }`

  return (
    <div className="space-y-5">
      {!bookingsOpen && (
        <div className="bg-brand-50 border border-brand-200 rounded-2xl p-5 text-sm text-brand-800">
          <p className="font-medium mb-1">Booking opens soon</p>
          <p>We&apos;re onboarding our first tutors. You can explore and create an account now — we&apos;ll email you the moment booking goes live.</p>
        </div>
      )}
      <div className="bg-white rounded-3xl border border-sand-200 p-6 shadow-sm">
        <h2 className="font-display text-lg font-semibold text-brand-900 mb-4">Pick a date</h2>
        <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 max-h-64 overflow-y-auto pr-1">
          {availableDates.map((d, i) => (
            <button
              key={i}
              onClick={() => { setSelectedDate(d); setSelectedTime(null) }}
              className={dateBtn(selectedDate?.toDateString() === d.toDateString())}
            >
              <span className="text-sand-400 text-[10px] mb-0.5">{DAY_LABELS[d.getDay()]}</span>
              <span>{d.getDate()}</span>
              <span className="text-sand-400 text-[10px]">{d.toLocaleDateString('en-GB', { month: 'short' })}</span>
            </button>
          ))}
        </div>
      </div>

      {selectedDate && (
        <div className="bg-white rounded-3xl border border-sand-200 p-6 shadow-sm">
          <h2 className="font-display text-lg font-semibold text-brand-900 mb-4">
            Available times — {formatDate(selectedDate)}
          </h2>
          {slots.length === 0 ? (
            <p className="text-sand-400 text-sm">No slots on this day.</p>
          ) : (
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
              {slots.map(t => (
                <button
                  key={t}
                  onClick={() => setSelectedTime(t)}
                  className={`py-2 rounded-lg border text-sm transition ${
                    selectedTime === t ? 'border-brand-500 bg-brand-50 text-brand-700 font-medium' : 'border-sand-200 text-sand-600 hover:border-brand-300'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {groupAvailable && selectedDate && selectedTime && (
        <div className="bg-white rounded-3xl border border-sand-200 p-6 shadow-sm">
          <h2 className="font-display text-lg font-semibold text-brand-900 mb-1">Group lesson?</h2>
          <p className="text-sm text-sand-500 mb-4">{currency}{(groupRatePence! / 100).toFixed(0)}/person — great for siblings or study groups.</p>
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: groupMaxSize }, (_, i) => i + 1).map(n => (
              <button
                key={n}
                onClick={() => setSeats(n)}
                className={`px-4 py-2 rounded-full border text-sm transition ${
                  seats === n ? 'border-brand-500 bg-brand-50 text-brand-700 font-medium' : 'border-sand-200 text-sand-600 hover:border-brand-300'
                }`}
              >
                {n === 1 ? 'Just me' : `${n} people`}
              </button>
            ))}
          </div>
        </div>
      )}

      {selectedDate && selectedTime && (
        <div className="bg-white rounded-3xl border border-sand-200 p-6 shadow-sm">
          <h2 className="font-display text-lg font-semibold text-brand-900 mb-4">Confirm &amp; pay</h2>

          {useIntro && (
            <div className="bg-coral-50 border border-coral-200 rounded-xl px-4 py-2.5 mb-4 text-sm text-coral-600 font-medium">
              🎉 First-lesson rate applied — save {currency}{(fullRate - rate).toFixed(2)}
            </div>
          )}

          <div className="space-y-2 mb-5 text-sm">
            <div className="flex justify-between text-sand-700">
              <span>Lesson with {teacherName}</span>
              <span>{formatDate(selectedDate)} at {selectedTime}</span>
            </div>
            <div className="flex justify-between text-sand-700">
              <span>Duration</span>
              <span>50 minutes</span>
            </div>
            {useIntro && (
              <div className="flex justify-between text-sand-400">
                <span>Standard rate</span>
                <span className="line-through">{currency}{fullRate.toFixed(2)}</span>
              </div>
            )}
            <hr className="border-sand-200 my-2" />
            <div className="flex justify-between font-semibold text-brand-900 text-base">
              <span>Total</span>
              <span>{currency}{rate.toFixed(2)}</span>
            </div>
            {payWithOrg && (
              <p className="text-xs text-brand-600 font-medium">
                Covered by {orgName} (company credit)
              </p>
            )}
            {payWithCredit && (
              <p className="text-xs text-brand-600 font-medium">
                Covered by your credit balance ({currency}{(creditBalancePence / 100).toFixed(2)} available)
              </p>
            )}
            <p className="text-xs text-sand-400">
              {internalPay ? 'No card needed.' : 'Secure payment via Stripe.'} Cancel 24h before for a full refund.
            </p>
          </div>
          {error && <p className="text-coral-600 text-sm mb-3">{error}</p>}
          <button
            onClick={book}
            disabled={submitting || !bookingsOpen}
            className="w-full bg-brand-600 text-white py-3.5 rounded-full font-medium hover:bg-brand-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-brand-600/20"
          >
            {!bookingsOpen
              ? 'Booking opens soon'
              : submitting
              ? 'Booking…'
              : payWithOrg
                ? 'Book with company credit'
                : payWithCredit
                  ? `Book with credit — ${currency}${rate.toFixed(2)}`
                  : `Pay ${currency}${rate.toFixed(2)} →`}
          </button>
        </div>
      )}
    </div>
  )
}
