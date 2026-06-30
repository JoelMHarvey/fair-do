'use client'

import { useState } from 'react'

export default function SubscribeButton({ label = 'Subscribe' }: { label?: string }) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function go() {
    setBusy(true)
    setError('')
    const res = await fetch('/api/parent/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    })
    const d = await res.json().catch(() => ({}))
    if (res.ok && d.checkoutUrl) {
      window.location.href = d.checkoutUrl
    } else if (res.ok && d.already) {
      window.location.href = '/parent/dashboard'
    } else {
      setError(d.error ?? 'Could not start checkout.')
      setBusy(false)
    }
  }

  return (
    <div className="text-center">
      <button
        onClick={go}
        disabled={busy}
        className="w-full bg-brand-600 text-white font-medium px-4 py-3 rounded-xl hover:bg-brand-700 transition disabled:opacity-60"
      >
        {busy ? '…' : label}
      </button>
      {error && <p className="text-xs text-red-600 mt-2">{error}</p>}
    </div>
  )
}
