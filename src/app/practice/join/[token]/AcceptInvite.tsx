'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AcceptInvite({
  token,
  needsName,
  suggestedFirstName,
}: {
  token: string
  needsName: boolean
  suggestedFirstName: string
}) {
  const router = useRouter()
  const [firstName, setFirstName] = useState(suggestedFirstName)
  const [lastName, setLastName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function accept() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/practice/join/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(needsName ? { firstName, lastName } : {}),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(data.error === 'name_required' ? 'Please enter your name.' : (data.error ?? 'Something went wrong.'))
        setLoading(false)
        return
      }
      router.push(data.redirect ?? '/dashboard')
    } catch {
      setError('Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="space-y-3">
      {needsName && (
        <div className="grid grid-cols-2 gap-3">
          <input
            value={firstName}
            onChange={e => setFirstName(e.target.value)}
            placeholder="First name"
            className="rounded-xl border border-sand-300 px-3 py-2.5 text-sm focus:border-brand-400 focus:outline-none"
          />
          <input
            value={lastName}
            onChange={e => setLastName(e.target.value)}
            placeholder="Last name"
            className="rounded-xl border border-sand-300 px-3 py-2.5 text-sm focus:border-brand-400 focus:outline-none"
          />
        </div>
      )}
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        onClick={accept}
        disabled={loading || (needsName && (!firstName.trim() || !lastName.trim()))}
        className="w-full bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-medium rounded-full py-3 transition"
      >
        {loading ? 'Accepting…' : 'Accept invite'}
      </button>
    </div>
  )
}
