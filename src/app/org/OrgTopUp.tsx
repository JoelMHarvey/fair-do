'use client'

import { useState } from 'react'

const PRESETS = [50000, 100000, 250000] // £500, £1,000, £2,500

export default function OrgTopUp() {
  const [amount, setAmount] = useState(100000)
  const [custom, setCustom] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const amountPence = custom ? Math.round(parseFloat(custom) * 100) : amount

  async function topup() {
    setBusy(true)
    setError('')
    const res = await fetch('/api/org/topup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amountPence }),
    })
    if (!res.ok) {
      const d = await res.json().catch(() => ({}))
      setError(d.error ?? 'Something went wrong')
      setBusy(false)
      return
    }
    const data = await res.json()
    window.location.href = data.checkoutUrl
  }

  const input = 'w-full border border-sand-300 rounded-xl px-4 py-2.5 text-sand-900 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-400'

  return (
    <div>
      <div className="grid grid-cols-3 gap-2 mb-2">
        {PRESETS.map(p => (
          <button
            key={p}
            onClick={() => { setAmount(p); setCustom('') }}
            className={`py-3 rounded-xl border font-medium transition ${
              !custom && amount === p ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-sand-200 text-sand-700 hover:border-brand-300'
            }`}
          >
            £{(p / 100).toLocaleString()}
          </button>
        ))}
      </div>
      <input className={input} type="number" placeholder="Or custom amount (£)" value={custom} onChange={e => setCustom(e.target.value)} />
      {error && <p className="text-red-600 text-sm mt-3">{error}</p>}
      <button
        onClick={topup}
        disabled={busy || amountPence < 5000}
        className="w-full mt-4 bg-brand-600 text-white py-3 rounded-full font-medium hover:bg-brand-700 transition disabled:opacity-40 shadow-lg shadow-brand-600/20"
      >
        {busy ? 'Redirecting…' : `Top up ${`£${(amountPence / 100).toLocaleString()}`}`}
      </button>
    </div>
  )
}
