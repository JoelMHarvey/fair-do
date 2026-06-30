'use client'

import { useState } from 'react'
import { useDict } from '@/components/DictProvider'

export function RecurringCardPrompt() {
  const { recurring_card_prompt } = useDict()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function go() {
    setBusy(true); setError('')
    const res = await fetch('/api/recurring/save-card', { method: 'POST' })
    const d = await res.json().catch(() => ({}))
    if (res.ok && d.checkoutUrl) {
      window.location.href = d.checkoutUrl
    } else {
      setError(d.error ?? recurring_card_prompt.default_error)
      setBusy(false)
    }
  }

  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
      <p className="text-sm font-medium text-amber-900">{recurring_card_prompt.title}</p>
      <p className="text-sm text-amber-800 mt-1">
        {recurring_card_prompt.description}
      </p>
      <button onClick={go} disabled={busy} className="mt-3 bg-brand-600 text-white text-sm font-medium px-5 py-2 rounded-lg hover:bg-brand-700 transition disabled:opacity-60">
        {busy ? recurring_card_prompt.button_busy : recurring_card_prompt.button_idle}
      </button>
      {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
    </div>
  )
}
