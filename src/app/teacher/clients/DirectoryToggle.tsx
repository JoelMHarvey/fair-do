'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function DirectoryToggle({ initial }: { initial: boolean }) {
  const router = useRouter()
  const [on, setOn] = useState(initial)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function toggle() {
    const next = !on
    setBusy(true)
    setError(null)
    setOn(next) // optimistic
    try {
      const res = await fetch('/api/practice/listing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ availableForNew: next }),
      })
      if (!res.ok) {
        setOn(!next) // revert
        const d = await res.json().catch(() => ({}))
        setError(d.error ?? 'Could not update.')
        setBusy(false)
        return
      }
      setBusy(false)
      router.refresh()
    } catch {
      setOn(!next)
      setError('Something went wrong.')
      setBusy(false)
    }
  }

  return (
    <div className="flex items-center justify-between gap-4">
      <div className="min-w-0">
        <p className="text-sm font-medium text-sand-900">Accepting new clients</p>
        <p className="text-xs text-sand-500 mt-0.5">
          {on
            ? 'Your profile, calendar and booking are listed in the Faresay directory so new clients can find and book you.'
            : 'You’re hidden from the directory. Turn this on to be discoverable and take on new clients.'}
        </p>
        {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
      </div>
      <button
        role="switch"
        aria-checked={on}
        onClick={toggle}
        disabled={busy}
        className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition disabled:opacity-60 ${on ? 'bg-brand-600' : 'bg-sand-300'}`}
      >
        <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition ${on ? 'translate-x-5' : 'translate-x-0.5'}`} />
      </button>
    </div>
  )
}
