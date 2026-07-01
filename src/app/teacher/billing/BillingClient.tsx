'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type Tier = {
  id: string
  name: string
  pricePence: number
  commissionBps: number
  blurb: string
  features: string[]
}

export default function BillingClient({
  tiers,
  currentTierId,
  hasCustomer,
}: {
  tiers: Tier[]
  currentTierId: string | null
  hasCustomer: boolean
}) {
  const router = useRouter()
  const [busy, setBusy] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function choose(tierId: string) {
    setBusy(tierId)
    setError(null)
    try {
      const res = await fetch('/api/practice/billing/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier: tierId }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(data.error ?? 'Could not start checkout.')
        setBusy(null)
        return
      }
      if (data.checkoutUrl) {
        window.location.assign(data.checkoutUrl)
        return
      }
      router.refresh() // free tier — activated server-side
      setBusy(null)
    } catch {
      setError('Something went wrong. Please try again.')
      setBusy(null)
    }
  }

  async function manage() {
    setBusy('portal')
    setError(null)
    try {
      const res = await fetch('/api/practice/billing/portal', { method: 'POST' })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(data.error ?? 'Could not open the billing portal.')
        setBusy(null)
        return
      }
      window.location.href = data.url
    } catch {
      setError('Something went wrong. Please try again.')
      setBusy(null)
    }
  }

  return (
    <div>
      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {tiers.map(t => {
          const isCurrent = t.id === currentTierId
          const pct = (t.commissionBps / 100).toFixed(t.commissionBps % 100 ? 1 : 0)
          return (
            <div
              key={t.id}
              className={`bg-white rounded-2xl border p-5 flex flex-col ${isCurrent ? 'border-brand-400 ring-1 ring-brand-200' : 'border-sand-200'}`}
            >
              <p className="font-display text-lg font-semibold text-brand-900">{t.name}</p>
              <p className="text-2xl font-semibold text-sand-900 mt-1">
                {t.id === 'enterprise' ? 'Custom' : t.pricePence === 0 ? 'Free' : `£${(t.pricePence / 100).toFixed(0)}`}
                {t.id !== 'enterprise' && t.pricePence > 0 && <span className="text-sm font-normal text-sand-400">/mo</span>}
              </p>
              <p className="text-xs text-sand-500 mt-1 mb-3">{t.blurb}</p>
              <ul className="text-sm text-sand-600 space-y-1.5 mb-5 flex-1">
                {t.features.map(f => (
                  <li key={f} className="flex gap-2">
                    <span className="text-brand-500">✓</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              {t.id === 'enterprise' ? (
                <a
                  href="mailto:support@fair-do.com?subject=Enterprise plan"
                  className="w-full text-center rounded-full py-2.5 text-sm font-medium transition border border-brand-200 text-brand-700 hover:bg-brand-50"
                >
                  Contact sales
                </a>
              ) : (
                <button
                  onClick={() => choose(t.id)}
                  disabled={isCurrent || busy !== null}
                  className={`w-full rounded-full py-2.5 text-sm font-medium transition ${
                    isCurrent
                      ? 'bg-sand-100 text-sand-500 cursor-default'
                      : 'bg-brand-600 hover:bg-brand-700 text-white disabled:opacity-50'
                  }`}
                >
                  {isCurrent ? 'Current plan' : busy === t.id ? 'Starting…' : t.pricePence === 0 ? 'Choose Free' : `Choose ${t.name} (${pct}%)`}
                </button>
              )}
            </div>
          )
        })}
      </div>

      {hasCustomer && (
        <button
          onClick={manage}
          disabled={busy !== null}
          className="mt-5 text-sm text-brand-700 hover:underline disabled:opacity-50"
        >
          {busy === 'portal' ? 'Opening…' : 'Manage billing & invoices →'}
        </button>
      )}
    </div>
  )
}
