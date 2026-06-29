'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const sel = 'rounded-xl border border-sand-200 px-3 py-2 text-sm focus:border-brand-400 focus:outline-none'

export function CancellationPolicyCard({ windowHours, lateRefundPercent }: { windowHours: number; lateRefundPercent: number }) {
  const router = useRouter()
  const [win, setWin] = useState(windowHours)
  const [pct, setPct] = useState(lateRefundPercent)
  const [busy, setBusy] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  async function save() {
    setBusy(true)
    setError('')
    setSaved(false)
    const res = await fetch('/api/teacher/cancellation-policy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ windowHours: win, lateRefundPercent: pct }),
    })
    if (res.ok) {
      setSaved(true)
      router.refresh()
    } else {
      const d = await res.json().catch(() => ({}))
      setError(d.error ?? 'Could not save.')
    }
    setBusy(false)
  }

  return (
    <div className="bg-white rounded-2xl border border-sand-200 p-5">
      <h3 className="font-medium text-sand-900 mb-1">Cancellation policy</h3>
      <p className="text-sm text-sand-500 mb-4">
        Students get a full refund if they cancel in time. You choose how much notice you
        need and what a late cancellation refunds.
      </p>
      <div className="flex flex-wrap gap-4">
        <label className="text-sm text-sand-700">
          <span className="block mb-1 text-xs text-sand-500">Notice required</span>
          <select className={sel} value={win} onChange={e => setWin(Number(e.target.value))}>
            <option value={24}>24 hours</option>
            <option value={48}>48 hours</option>
            <option value={72}>72 hours</option>
          </select>
        </label>
        <label className="text-sm text-sand-700">
          <span className="block mb-1 text-xs text-sand-500">Late-cancellation refund</span>
          <select className={sel} value={pct} onChange={e => setPct(Number(e.target.value))}>
            <option value={100}>Full refund</option>
            <option value={50}>50% refund</option>
            <option value={0}>No refund</option>
          </select>
        </label>
      </div>
      <div className="mt-4 flex items-center gap-3">
        <button onClick={save} disabled={busy} className="bg-brand-600 text-white text-sm font-medium px-5 py-2 rounded-lg hover:bg-brand-700 transition disabled:opacity-60">
          {busy ? 'Saving…' : 'Save policy'}
        </button>
        {saved && <span className="text-sm text-brand-700">Saved ✓</span>}
        {error && <span className="text-sm text-red-600">{error}</span>}
      </div>
    </div>
  )
}
