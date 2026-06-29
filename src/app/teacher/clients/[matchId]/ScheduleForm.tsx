'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type PackageOption = { id: string; name: string; remaining: number }

export default function ScheduleForm({
  matchId,
  ratePence,
  packages = [],
}: {
  matchId: string
  ratePence: number
  packages?: PackageOption[]
}) {
  const router = useRouter()
  const [when, setWhen] = useState('')
  const [duration, setDuration] = useState('50')
  const [payment, setPayment] = useState('charge') // 'charge' | package id
  const [repeat, setRepeat] = useState('1') // weekly occurrences
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState<string | null>(null)
  const [payLink, setPayLink] = useState<string | null>(null)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setDone(null)
    setPayLink(null)
    try {
      const usePackageId = payment !== 'charge' ? payment : undefined
      const repeatWeekly = parseInt(repeat, 10) || 1
      const res = await fetch('/api/practice/booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          matchId,
          scheduledAt: new Date(when).toISOString(),
          durationMins: parseInt(duration, 10) || 50,
          ...(usePackageId ? { usePackageId } : {}),
          ...(repeatWeekly > 1 ? { repeatWeekly } : {}),
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(data.error ?? 'Could not schedule the session.')
        setLoading(false)
        return
      }
      setDone(
        data.mode === 'payment'
          ? 'Scheduled — we’ve emailed your client a secure link to confirm and pay.'
          : data.mode === 'package'
            ? `Scheduled from the package${typeof data.sessionsLeft === 'number' ? ` — ${data.sessionsLeft} session${data.sessionsLeft !== 1 ? 's' : ''} left.` : '.'}`
            : data.mode === 'series-package'
              ? `${data.created} weekly sessions booked from the package${typeof data.sessionsLeft === 'number' ? ` — ${data.sessionsLeft} left.` : '.'}`
              : data.mode === 'series-offline'
                ? `${data.created} weekly sessions scheduled — we’ve emailed your client the details.`
                : 'Scheduled — we’ve emailed your client the session details.',
      )
      if (data.mode === 'payment' && data.checkoutUrl) setPayLink(data.checkoutUrl)
      setRepeat('1')
      setWhen('')
      setLoading(false)
      router.refresh()
    } catch {
      setError('Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={submit} className="bg-white rounded-2xl border border-sand-200 p-5 space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-sand-500 mb-1">Date &amp; time</label>
          <input
            type="datetime-local"
            required
            value={when}
            onChange={e => setWhen(e.target.value)}
            className="w-full rounded-xl border border-sand-300 px-3 py-2.5 text-sm focus:border-brand-400 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-xs text-sand-500 mb-1">Duration</label>
          <select
            value={duration}
            onChange={e => setDuration(e.target.value)}
            className="w-full rounded-xl border border-sand-300 px-3 py-2.5 text-sm focus:border-brand-400 focus:outline-none bg-white"
          >
            <option value="30">30 minutes</option>
            <option value="50">50 minutes</option>
            <option value="60">60 minutes</option>
            <option value="90">90 minutes</option>
          </select>
        </div>
      </div>
      <div>
        <label className="block text-xs text-sand-500 mb-1">Repeat</label>
        <select
          value={repeat}
          onChange={e => setRepeat(e.target.value)}
          className="w-full rounded-xl border border-sand-300 px-3 py-2.5 text-sm focus:border-brand-400 focus:outline-none bg-white"
        >
          <option value="1">One-off session</option>
          <option value="4">Weekly × 4</option>
          <option value="6">Weekly × 6</option>
          <option value="8">Weekly × 8</option>
          <option value="12">Weekly × 12</option>
        </select>
        {repeat !== '1' && (
          <p className="text-xs text-sand-400 mt-1">
            A weekly series uses a package or is arranged offline — to charge per session, book individually.
          </p>
        )}
      </div>
      {packages.length > 0 && (
        <div>
          <label className="block text-xs text-sand-500 mb-1">Payment</label>
          <select
            value={payment}
            onChange={e => setPayment(e.target.value)}
            className="w-full rounded-xl border border-sand-300 px-3 py-2.5 text-sm focus:border-brand-400 focus:outline-none bg-white"
          >
            <option value="charge">Charge per session — £{(ratePence / 100).toFixed(0)}</option>
            {packages.map(p => (
              <option key={p.id} value={p.id}>Use package: {p.name} ({p.remaining} left)</option>
            ))}
          </select>
        </div>
      )}
      {payment === 'charge' && (
        <p className="text-xs text-sand-500">This session: <span className="font-medium text-sand-700">£{(ratePence / 100).toFixed(0)}</span></p>
      )}
      {error && <p className="text-sm text-red-600">{error}</p>}
      {done && <p className="text-sm text-brand-700">{done}</p>}
      {payLink && (
        <p className="text-xs text-sand-500 break-all">
          Payment link to share: <a href={payLink} target="_blank" rel="noreferrer" className="text-brand-700 hover:underline">{payLink}</a>
        </p>
      )}
      <button
        type="submit"
        disabled={loading || !when}
        className="bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-medium rounded-full px-6 py-2.5 text-sm transition"
      >
        {loading ? 'Scheduling…' : 'Schedule session'}
      </button>
    </form>
  )
}
