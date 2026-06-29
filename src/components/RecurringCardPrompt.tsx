'use client'

import { useState } from 'react'

export function RecurringCardPrompt() {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function go() {
    setBusy(true); setError('')
    const res = await fetch('/api/recurring/save-card', { method: 'POST' })
    const d = await res.json().catch(() => ({}))
    if (res.ok && d.checkoutUrl) {
      window.location.href = d.checkoutUrl
    } else {
      setError(d.error ?? 'Could not start card setup.')
      setBusy(false)
    }
  }

  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
      <p className="text-sm font-medium text-amber-900">Keep your regular lessons running</p>
      <p className="text-sm text-amber-800 mt-1">
        Your tutor set up a standing lesson. Authorise a card and each one is booked and
        paid automatically — cancel any time.
      </p>
      <button onClick={go} disabled={busy} className="mt-3 bg-brand-600 text-white text-sm font-medium px-5 py-2 rounded-lg hover:bg-brand-700 transition disabled:opacity-60">
        {busy ? 'Opening…' : 'Save a card'}
      </button>
      {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
    </div>
  )
}
