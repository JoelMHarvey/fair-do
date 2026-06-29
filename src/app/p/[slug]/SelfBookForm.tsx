'use client'

import { useEffect, useMemo, useRef, useState } from 'react'

const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY
// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare global { interface Window { turnstile?: any } }

type Avail = { dayOfWeek: number; startTime: string; endTime: string }
const DAY = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function next28(): Date[] {
  const out: Date[] = []
  const start = new Date(); start.setHours(0, 0, 0, 0); start.setDate(start.getDate() + 1)
  for (let i = 0; i < 28; i++) { const d = new Date(start); d.setDate(start.getDate() + i); out.push(d) }
  return out
}

function slotsFor(date: Date, avail: Avail[], booked: Set<string>): string[] {
  const day = avail.filter(a => a.dayOfWeek === date.getDay())
  const now = Date.now()
  const out: string[] = []
  for (const a of day) {
    const [sh, sm] = a.startTime.split(':').map(Number)
    const [eh, em] = a.endTime.split(':').map(Number)
    for (let m = sh * 60 + sm; m + 50 <= eh * 60 + em; m += 60) {
      const d = new Date(date); d.setHours(Math.floor(m / 60), m % 60, 0, 0)
      if (d.getTime() > now && !booked.has(d.toISOString())) out.push(`${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`)
    }
  }
  return out
}

export default function SelfBookForm({ slug, availability, booked }: { slug: string; availability: Avail[]; booked: string[] }) {
  const bookedSet = useMemo(() => new Set(booked), [booked])
  const dates = useMemo(() => next28().filter(d => availability.some(a => a.dayOfWeek === d.getDay())), [availability])
  const [date, setDate] = useState<Date | null>(null)
  const [time, setTime] = useState<string | null>(null)
  const [firstName, setFirstName] = useState(''); const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState(''); const [phone, setPhone] = useState(''); const [note, setNote] = useState('')
  const [busy, setBusy] = useState(false); const [error, setError] = useState(''); const [done, setDone] = useState(false)
  const [pending, setPending] = useState(false)
  const [tsToken, setTsToken] = useState('')
  const tsRef = useRef<HTMLDivElement>(null)

  const slots = useMemo(() => date ? slotsFor(date, availability, bookedSet) : [], [date, availability, bookedSet])
  const fmtDate = (d: Date) => d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })

  // Render the Turnstile widget once the details step is shown (if configured).
  useEffect(() => {
    if (!TURNSTILE_SITE_KEY || !date || !time || !tsRef.current) return
    let cancelled = false
    function render() {
      if (cancelled || !window.turnstile || !tsRef.current || tsRef.current.childElementCount) return
      window.turnstile.render(tsRef.current, {
        sitekey: TURNSTILE_SITE_KEY,
        callback: (t: string) => setTsToken(t),
        'expired-callback': () => setTsToken(''),
        'error-callback': () => setTsToken(''),
      })
    }
    if (window.turnstile) { render() } else {
      const existing = document.querySelector('script[data-turnstile]')
      if (existing) { existing.addEventListener('load', render) } else {
        const s = document.createElement('script')
        s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'
        s.async = true; s.defer = true; s.dataset.turnstile = '1'; s.onload = render
        document.head.appendChild(s)
      }
    }
    return () => { cancelled = true }
  }, [date, time])

  async function book() {
    if (!date || !time || !firstName.trim() || !lastName.trim() || !/.+@.+\..+/.test(email)) { setError('Please complete your name, email, and a time.'); return }
    if (TURNSTILE_SITE_KEY && !tsToken) { setError('Please complete the verification below.'); return }
    const [h, m] = time.split(':').map(Number)
    const when = new Date(date); when.setHours(h, m, 0, 0)
    setBusy(true); setError('')
    const res = await fetch('/api/practice/self-book', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug, scheduledAt: when.toISOString(), firstName: firstName.trim(), lastName: lastName.trim(), email: email.trim(), phone: phone.trim() || undefined, note: note.trim() || undefined, turnstileToken: tsToken || undefined }),
    })
    const d = await res.json().catch(() => ({}))
    if (res.ok && d.pending) setPending(true)
    else if (res.ok) setDone(true)
    else { setError(d.error || 'Could not book that time.'); setTsToken(''); window.turnstile?.reset?.() }
    setBusy(false)
  }

  if (pending) {
    return (
      <div className="bg-white rounded-3xl border border-sand-200 p-8 text-center shadow-sm">
        <div className="text-4xl mb-3">✉️</div>
        <h2 className="font-display text-xl font-semibold text-brand-900 mb-1">Check your email</h2>
        <p className="text-sand-600">We&apos;ve sent a confirmation link to <strong>{email.trim()}</strong>. Tap it to confirm your lesson — it isn&apos;t held until you do.</p>
      </div>
    )
  }

  if (done) {
    return (
      <div className="bg-white rounded-3xl border border-sand-200 p-8 text-center shadow-sm">
        <div className="text-4xl mb-3">✓</div>
        <h2 className="font-display text-xl font-semibold text-brand-900 mb-1">You&apos;re booked</h2>
        <p className="text-sand-600">We&apos;ve emailed you the details, and the video link opens just before your lesson.</p>
      </div>
    )
  }

  if (dates.length === 0) {
    return <div className="bg-white rounded-3xl border border-sand-200 p-8 text-center text-sand-500 shadow-sm">No times are available right now — please check back soon.</div>
  }

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-3xl border border-sand-200 p-6 shadow-sm">
        <h2 className="font-display text-lg font-semibold text-brand-900 mb-4">Pick a date</h2>
        <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 max-h-56 overflow-y-auto pr-1">
          {dates.map((d, i) => (
            <button key={i} onClick={() => { setDate(d); setTime(null) }} className={`flex flex-col items-center py-2.5 rounded-xl border text-xs transition ${date?.toDateString() === d.toDateString() ? 'border-brand-500 bg-brand-50 text-brand-700 font-medium' : 'border-sand-200 text-sand-600 hover:border-brand-300'}`}>
              <span className="text-sand-400 text-[10px]">{DAY[d.getDay()]}</span>
              <span>{d.getDate()}</span>
              <span className="text-sand-400 text-[10px]">{d.toLocaleDateString('en-GB', { month: 'short' })}</span>
            </button>
          ))}
        </div>
      </div>

      {date && (
        <div className="bg-white rounded-3xl border border-sand-200 p-6 shadow-sm">
          <h2 className="font-display text-lg font-semibold text-brand-900 mb-4">Times — {fmtDate(date)}</h2>
          {slots.length === 0 ? <p className="text-sand-400 text-sm">No times left on this day.</p> : (
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
              {slots.map(t => (
                <button key={t} onClick={() => setTime(t)} className={`py-2 rounded-lg border text-sm transition ${time === t ? 'border-brand-500 bg-brand-50 text-brand-700 font-medium' : 'border-sand-200 text-sand-600 hover:border-brand-300'}`}>{t}</button>
              ))}
            </div>
          )}
        </div>
      )}

      {date && time && (
        <div className="bg-white rounded-3xl border border-sand-200 p-6 shadow-sm space-y-3">
          <h2 className="font-display text-lg font-semibold text-brand-900">Your details</h2>
          <div className="grid grid-cols-2 gap-2">
            <input aria-label="First name" value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="First name" className="border border-sand-300 rounded-xl px-3 py-2.5 text-sm" />
            <input aria-label="Last name" value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Last name" className="border border-sand-300 rounded-xl px-3 py-2.5 text-sm" />
          </div>
          <input aria-label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" className="w-full border border-sand-300 rounded-xl px-3 py-2.5 text-sm" />
          <input aria-label="Mobile for text reminders (optional)" type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="Mobile (optional — for text reminders)" className="w-full border border-sand-300 rounded-xl px-3 py-2.5 text-sm" />
          <textarea value={note} onChange={e => setNote(e.target.value)} rows={2} placeholder="Anything you'd like your tutor to know (optional)" className="w-full border border-sand-300 rounded-xl px-3 py-2.5 text-sm" />
          {TURNSTILE_SITE_KEY && <div ref={tsRef} className="flex justify-center min-h-[65px]" />}
          {error && <p className="text-coral-600 text-sm">{error}</p>}
          <button onClick={book} disabled={busy} aria-busy={busy} className="w-full bg-brand-600 text-white py-3 rounded-full font-medium hover:bg-brand-700 transition disabled:opacity-60 shadow-sm inline-flex items-center justify-center gap-2">
            {busy && <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" aria-hidden />}
            {busy ? 'Booking your lesson…' : `Book ${fmtDate(date)} at ${time}`}
          </button>
        </div>
      )}
    </div>
  )
}
