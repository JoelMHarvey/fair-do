'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useDict } from '@/components/DictProvider'

export type Recurring = {
  id: string
  dayOfWeek: number
  startTime: string
  durationMins: number
  active: boolean
  hasCard: boolean
}

const inp = 'rounded-xl border border-sand-200 px-3 py-2 text-sm focus:border-brand-400 focus:outline-none'

export function RecurringBookingCard({ matchId, initial }: { matchId: string; initial: Recurring[] }) {
  const { recurring_booking_card } = useDict()
  const DAYS = recurring_booking_card.days
  const router = useRouter()
  const [items, setItems] = useState<Recurring[]>(initial)
  const [day, setDay] = useState(1)
  const [time, setTime] = useState('17:00')
  const [duration, setDuration] = useState(60)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function add() {
    setBusy(true); setError('')
    const res = await fetch('/api/recurring', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ matchId, dayOfWeek: day, startTime: time, durationMins: duration }),
    })
    if (res.ok) {
      const { booking } = await res.json()
      setItems(prev => [...prev, { id: booking.id, dayOfWeek: day, startTime: time, durationMins: duration, active: true, hasCard: false }])
      router.refresh()
    } else {
      const d = await res.json().catch(() => ({})); setError(d.error ?? recurring_booking_card.error_default)
    }
    setBusy(false)
  }

  async function toggle(r: Recurring) {
    const next = !r.active
    setItems(prev => prev.map(x => x.id === r.id ? { ...x, active: next } : x))
    await fetch('/api/recurring', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: r.id, active: next }) }).catch(() => {})
  }

  async function remove(id: string) {
    setItems(prev => prev.filter(x => x.id !== id))
    await fetch('/api/recurring', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) }).catch(() => {})
  }

  return (
    <div>
      {items.length > 0 && (
        <ul className="space-y-2 mb-4">
          {items.map(r => (
            <li key={r.id} className="flex items-center justify-between gap-3 bg-white rounded-xl border border-sand-200 px-4 py-3">
              <div>
                <p className="text-sm font-medium text-sand-900">{recurring_booking_card.every_prefix} {DAYS[r.dayOfWeek]} {recurring_booking_card.at} {r.startTime}</p>
                <p className="text-xs text-sand-400">
                  {r.durationMins} {recurring_booking_card.min} ·{' '}
                  {!r.hasCard ? <span className="text-amber-600">{recurring_booking_card.status_waiting}</span>
                    : r.active ? <span className="text-brand-700">{recurring_booking_card.status_active}</span>
                    : <span className="text-sand-500">{recurring_booking_card.status_paused}</span>}
                </p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                {r.hasCard && (
                  <button onClick={() => toggle(r)} className="text-sm text-sand-600 hover:text-brand-700">{r.active ? recurring_booking_card.pause : recurring_booking_card.resume}</button>
                )}
                <button onClick={() => remove(r.id)} className="text-sm text-sand-400 hover:text-red-500">{recurring_booking_card.cancel}</button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="flex flex-wrap items-end gap-2">
        <label className="text-xs text-sand-500">{recurring_booking_card.day_label}
          <select value={day} onChange={e => setDay(Number(e.target.value))} className={`block mt-1 ${inp}`}>
            {DAYS.map((d, i) => <option key={i} value={i}>{d}</option>)}
          </select>
        </label>
        <label className="text-xs text-sand-500">{recurring_booking_card.time_label}
          <input type="time" value={time} onChange={e => setTime(e.target.value)} className={`block mt-1 ${inp}`} />
        </label>
        <label className="text-xs text-sand-500">{recurring_booking_card.minutes_label}
          <input type="number" min={15} max={240} step={5} value={duration} onChange={e => setDuration(Number(e.target.value))} className={`block mt-1 w-20 ${inp}`} />
        </label>
        <button onClick={add} disabled={busy} className="bg-brand-600 text-white text-sm font-medium px-4 py-2 rounded-xl hover:bg-brand-700 transition disabled:opacity-60">
          {busy ? recurring_booking_card.setting_up : recurring_booking_card.set_up}
        </button>
      </div>
      {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
      <p className="text-xs text-sand-400 mt-2">{recurring_booking_card.footer_note}</p>
    </div>
  )
}
