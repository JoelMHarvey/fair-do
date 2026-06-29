'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth, SignInButton } from '@clerk/nextjs'

export default function AcceptInvite({ token }: { token: string }) {
  const router = useRouter()
  const { isLoaded, isSignedIn } = useAuth()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function accept() {
    setBusy(true)
    setError('')
    const res = await fetch('/api/parent/accept', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    })
    if (res.ok) {
      router.push('/parent/subscribe')
    } else {
      const d = await res.json().catch(() => ({}))
      setError(d.error ?? 'Something went wrong.')
      setBusy(false)
    }
  }

  if (!isLoaded) return null

  if (!isSignedIn) {
    return (
      <SignInButton mode="modal" forceRedirectUrl={`/parent/accept/${token}`}>
        <button className="w-full bg-brand-600 text-white font-medium px-6 py-3 rounded-full hover:bg-brand-700 transition">
          Sign in to continue
        </button>
      </SignInButton>
    )
  }

  return (
    <div>
      <button
        onClick={accept}
        disabled={busy}
        className="w-full bg-brand-600 text-white font-medium px-6 py-3 rounded-full hover:bg-brand-700 transition disabled:opacity-60"
      >
        {busy ? 'Linking…' : 'Accept & continue'}
      </button>
      {error && <p className="text-sm text-red-600 mt-3">{error}</p>}
    </div>
  )
}
