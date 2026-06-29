'use client'

import { useState } from 'react'

export default function ImpersonateButton({ userId, email }: { userId: string; email: string }) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function go() {
    if (busy) return
    if (!window.confirm(`Sign in as ${email}? You'll be acting as this user until you sign out.`)) return
    setBusy(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin/users/${userId}/impersonate`, { method: 'POST' })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || !data.url) { setError(data.error ?? 'Failed'); setBusy(false); return }
      window.location.href = data.url
    } catch {
      setError('Failed'); setBusy(false)
    }
  }

  return (
    <span className="inline-flex items-center gap-2">
      <button
        onClick={go}
        disabled={busy}
        className="text-xs px-2 py-1 rounded-md border border-amber-300 text-amber-700 hover:bg-amber-50 disabled:opacity-50"
      >
        {busy ? '…' : 'Sign in as user'}
      </button>
      {error && <span className="text-[10px] text-red-600">{error}</span>}
    </span>
  )
}
