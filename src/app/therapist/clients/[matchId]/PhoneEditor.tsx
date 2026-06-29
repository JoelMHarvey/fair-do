'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function PhoneEditor({ matchId, initial }: { matchId: string; initial: string | null }) {
  const router = useRouter()
  const [value, setValue] = useState(initial ?? '')
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function save() {
    setSaving(true); setError(null); setMsg(null)
    try {
      const res = await fetch(`/api/practice/clients/${matchId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: value.trim() }),
      })
      if (!res.ok) {
        const d = await res.json().catch(() => ({}))
        setError(d.error ?? 'Could not save.'); setSaving(false); return
      }
      setMsg(value.trim() ? 'Mobile saved.' : 'Mobile cleared.')
      setSaving(false)
      router.refresh()
    } catch {
      setError('Something went wrong.'); setSaving(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-sand-200 p-5">
      <p className="text-sm text-sand-600 mb-3">
        Add a mobile to send this client a text reminder 24 hours before each session. UK numbers can
        be entered as <span className="font-mono text-sand-800">07…</span>; international as{' '}
        <span className="font-mono text-sand-800">+…</span>. Leave blank to send email reminders only.
      </p>
      <div className="flex items-center gap-2">
        <input
          type="tel"
          value={value}
          onChange={e => setValue(e.target.value)}
          placeholder="07700 900123"
          className="w-48 rounded-xl border border-sand-300 px-3 py-2.5 text-sm focus:border-brand-400 focus:outline-none"
        />
        <button
          onClick={save}
          disabled={saving}
          className="bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-medium rounded-full px-5 py-2.5 text-sm transition"
        >
          Save
        </button>
      </div>
      {msg && <p className="text-sm text-brand-700 mt-2">{msg}</p>}
      {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
    </div>
  )
}
