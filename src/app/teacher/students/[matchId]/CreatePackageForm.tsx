'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function CreatePackageForm({ matchId, standardRatePence }: { matchId: string; standardRatePence: number }) {
  const router = useRouter()
  const [name, setName] = useState('')
  const [sessions, setSessions] = useState('6')
  const [price, setPrice] = useState('')
  const [buyable, setBuyable] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState<string | null>(null)

  const n = parseInt(sessions, 10) || 0
  const suggested = n > 0 ? Math.round((n * standardRatePence) / 100) : 0

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setDone(null)
    const pricePence = Math.round(parseFloat(price) * 100)
    if (Number.isNaN(pricePence) || pricePence <= 0) {
      setError('Enter a valid price.')
      setLoading(false)
      return
    }
    try {
      const res = await fetch('/api/practice/packages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matchId, name: name.trim(), sessionsTotal: n, pricePence, buyableByParent: buyable }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(data.error ?? 'Could not create the package.')
        setLoading(false)
        return
      }
      setDone(
        data.buyable
          ? 'Package created — the parent can now buy it from their portal.'
          : data.mode === 'payment'
            ? 'Package created — we’ve emailed your client a link to buy it.'
            : 'Package created and marked active.',
      )
      setName('')
      setPrice('')
      setLoading(false)
      router.refresh()
    } catch {
      setError('Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={submit} className="bg-white rounded-2xl border border-sand-200 p-5 space-y-3">
      <p className="text-sm text-sand-600">Offer a pre-paid bundle. Your client buys once, then each booking draws a session from it.</p>
      <input
        value={name}
        onChange={e => setName(e.target.value)}
        required
        maxLength={120}
        placeholder="Package name (e.g. 6-session block)"
        className="w-full rounded-xl border border-sand-300 px-3 py-2.5 text-sm focus:border-brand-400 focus:outline-none"
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-sand-500 mb-1">Sessions</label>
          <input
            type="number" min="2" max="100" step="1" required
            value={sessions}
            onChange={e => setSessions(e.target.value)}
            className="w-full rounded-xl border border-sand-300 px-3 py-2.5 text-sm focus:border-brand-400 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-xs text-sand-500 mb-1">Total price {suggested > 0 && <span className="text-sand-400">· standard £{suggested}</span>}</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sand-400 text-sm">£</span>
            <input
              type="number" min="1" step="1" required
              value={price}
              onChange={e => setPrice(e.target.value)}
              placeholder={suggested > 0 ? String(suggested) : 'Total'}
              className="w-full rounded-xl border border-sand-300 pl-7 pr-3 py-2.5 text-sm focus:border-brand-400 focus:outline-none"
            />
          </div>
        </div>
      </div>
      <label className="flex items-center gap-2 text-sm text-sand-600">
        <input type="checkbox" checked={buyable} onChange={e => setBuyable(e.target.checked)} className="rounded border-sand-300" />
        Offer for the parent to buy from their portal (instead of charging the student)
      </label>
      {error && <p className="text-sm text-red-600">{error}</p>}
      {done && <p className="text-sm text-brand-700">{done}</p>}
      <button
        type="submit"
        disabled={loading || !name.trim() || !price.trim()}
        className="bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-medium rounded-full px-6 py-2.5 text-sm transition"
      >
        {loading ? 'Creating…' : 'Create package'}
      </button>
    </form>
  )
}
