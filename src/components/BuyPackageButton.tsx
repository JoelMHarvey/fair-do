'use client'

import { useState } from 'react'

export function BuyPackageButton({ packageId, label }: { packageId: string; label: string }) {
  const [busy, setBusy] = useState(false)

  async function buy() {
    setBusy(true)
    const res = await fetch('/api/parent/packages/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ packageId }),
    })
    const d = await res.json().catch(() => ({}))
    if (res.ok && d.checkoutUrl) {
      window.location.href = d.checkoutUrl
    } else {
      setBusy(false)
      alert(d.error ?? 'Could not start checkout.')
    }
  }

  return (
    <button
      onClick={buy}
      disabled={busy}
      className="bg-brand-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-brand-700 transition disabled:opacity-60"
    >
      {busy ? '…' : label}
    </button>
  )
}
