'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function RateEditor({
  matchId,
  customRatePence,
  standardRatePence,
}: {
  matchId: string
  customRatePence: number | null
  standardRatePence: number
}) {
  const router = useRouter()
  const [value, setValue] = useState(customRatePence != null ? (customRatePence / 100).toFixed(0) : '')
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function save(custom: boolean) {
    setSaving(true)
    setError(null)
    setMsg(null)
    const customRatePence = custom ? Math.round(parseFloat(value) * 100) : null
    if (custom && (Number.isNaN(customRatePence!) || customRatePence! < 0)) {
      setError('Enter a valid amount.')
      setSaving(false)
      return
    }
    try {
      const res = await fetch(`/api/practice/clients/${matchId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customRatePence }),
      })
      if (!res.ok) {
        const d = await res.json().catch(() => ({}))
        setError(d.error ?? 'Could not save.')
        setSaving(false)
        return
      }
      if (!custom) setValue('')
      setMsg(custom ? 'Custom rate saved.' : 'Reset to standard rate.')
      setSaving(false)
      router.refresh()
    } catch {
      setError('Something went wrong.')
      setSaving(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-sand-200 p-5">
      <p className="text-sm text-sand-600 mb-3">
        Standard rate: <span className="font-medium text-sand-800">£{(standardRatePence / 100).toFixed(0)}</span>.
        Set a different rate just for this client, or leave blank to use your standard.
      </p>
      <div className="flex items-center gap-2">
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sand-400 text-sm">£</span>
          <input
            type="number"
            min="0"
            step="1"
            value={value}
            onChange={e => setValue(e.target.value)}
            placeholder={(standardRatePence / 100).toFixed(0)}
            className="w-32 rounded-xl border border-sand-300 pl-7 pr-3 py-2.5 text-sm focus:border-brand-400 focus:outline-none"
          />
        </div>
        <button
          onClick={() => save(true)}
          disabled={saving || !value.trim()}
          className="bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-medium rounded-full px-5 py-2.5 text-sm transition"
        >
          Save
        </button>
        {customRatePence != null && (
          <button
            onClick={() => save(false)}
            disabled={saving}
            className="text-sm text-sand-500 hover:text-brand-700"
          >
            Reset to standard
          </button>
        )}
      </div>
      {msg && <p className="text-sm text-brand-700 mt-2">{msg}</p>}
      {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
    </div>
  )
}
