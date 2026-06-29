'use client'

import { useState } from 'react'

export default function SubscribeButton({ parentLinkId }: { parentLinkId: string }) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function go() {
    setBusy(true)
    setError('')
    const res = await fetch('/api/parent/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ parentLinkId }),
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
    <div className="text-right">
      <button
        onClick={go}
        disabled={busy}
        className="bg-brand-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-brand-700 transition disabled:opacity-60"
      >
        {busy ? '…' : 'Subscribe'}
      </button>
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  )
}
