'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function InviteParentForm({ matchId }: { matchId: string }) {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'done'>('idle')
  const [error, setError] = useState('')

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('sending')
    setError('')
    const res = await fetch('/api/teacher/parent/invite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ matchId, parentEmail: email }),
    })
    if (res.ok) {
      const d = await res.json().catch(() => ({}))
      setStatus('done')
      setEmail('')
      if (d.emailed === false) setError('Invite saved, but the email didn’t send — try resending.')
      router.refresh()
    } else {
      const d = await res.json().catch(() => ({}))
      setError(d.error ?? 'Something went wrong.')
      setStatus('idle')
    }
  }

  return (
    <form onSubmit={submit} className="flex flex-col sm:flex-row gap-2">
      <input
        type="email"
        required
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder="parent@email.com"
        className="flex-1 rounded-xl border border-sand-200 px-3 py-2.5 text-sm focus:border-brand-400 focus:outline-none"
      />
      <button
        type="submit"
        disabled={status === 'sending'}
        className="bg-brand-600 text-white text-sm font-medium px-5 py-2.5 rounded-xl hover:bg-brand-700 transition disabled:opacity-60"
      >
        {status === 'sending' ? 'Sending…' : 'Invite parent'}
      </button>
      {status === 'done' && !error && <p className="text-sm text-brand-700 self-center">Invite sent ✓</p>}
      {error && <p className="text-sm text-red-600 self-center">{error}</p>}
    </form>
  )
}
