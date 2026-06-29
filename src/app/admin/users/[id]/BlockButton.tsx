'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function BlockButton({ userId, email, banned }: { userId: string; email: string; banned: boolean }) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function toggle() {
    if (busy) return
    const ban = !banned
    const verb = ban ? 'Block' : 'Unblock'
    if (!window.confirm(`${verb} ${email}?${ban ? ' They’ll be signed out and unable to sign in.' : ''}`)) return
    setBusy(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin/users/${userId}/ban`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ban }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) { setError(data.error ?? 'Failed'); setBusy(false); return }
      router.refresh()
    } catch {
      setError('Failed'); setBusy(false)
    }
  }

  return (
    <span className="inline-flex items-center gap-2">
      <button
        onClick={toggle}
        disabled={busy}
        className={`text-xs px-2 py-1 rounded-md border disabled:opacity-50 ${
          banned
            ? 'border-sand-200 text-sand-600 hover:bg-sand-50'
            : 'border-red-300 text-red-700 hover:bg-red-50'
        }`}
      >
        {busy ? '…' : banned ? 'Unblock user' : 'Block user'}
      </button>
      {error && <span className="text-[10px] text-red-600">{error}</span>}
    </span>
  )
}
