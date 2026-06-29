'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { CURRENCIES } from '@/lib/currency'

// Override the auto-detected display currency. Self-contained (reads its own
// cookie) so it doesn't force the footer's pages to render dynamically. "Auto"
// clears the override and falls back to geo detection. Display-only.
export function CurrencySwitcher() {
  const router = useRouter()
  const [cur, setCur] = useState('')
  useEffect(() => {
    const m = document.cookie.match(/(?:^|;\s*)ccy=([A-Za-z]{3})/)
    if (m) setCur(m[1].toUpperCase())
  }, [])
  return (
    <label className="inline-flex items-center gap-1.5 text-xs text-sand-500">
      <span>Currency</span>
      <select
        value={cur}
        onChange={e => {
          const v = e.target.value
          setCur(v)
          document.cookie = v
            ? `ccy=${v}; path=/; max-age=31536000; samesite=lax`
            : 'ccy=; path=/; max-age=0'
          router.refresh()
        }}
        className="bg-transparent border border-sand-200 rounded-md px-1.5 py-1 text-xs text-sand-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
        aria-label="Display currency"
      >
        <option value="">Auto</option>
        {Object.keys(CURRENCIES).map(c => <option key={c} value={c}>{c}</option>)}
      </select>
    </label>
  )
}
