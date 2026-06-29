'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Logo } from '@/components/Logo'

export default function RedeemPage() {
  const [code, setCode] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState<number | null>(null)

  async function redeem() {
    setSubmitting(true)
    setError('')
    const res = await fetch('/api/redeem', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    })
    const data = await res.json().catch(() => ({}))
    if (res.ok) {
      setSuccess(data.amountPence)
    } else {
      setError(data.error ?? 'Could not redeem')
    }
    setSubmitting(false)
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-brand-50/50 to-sand-50">
      <nav className="border-b border-sand-200 bg-white/80 backdrop-blur px-5 sm:px-8 h-16 flex items-center justify-between">
        <Logo />
        <Link href="/dashboard" className="text-sm text-sand-500 hover:text-brand-700">Dashboard</Link>
      </nav>

      <div className="max-w-md mx-auto px-5 sm:px-6 py-16">
        {success != null ? (
          <div className="bg-white rounded-3xl border border-sand-200 p-8 text-center shadow-sm">
            <div className="text-5xl mb-4">✓</div>
            <h1 className="font-display text-2xl font-semibold text-brand-900 mb-2">£{(success / 100).toFixed(2)} added</h1>
            <p className="text-sand-600 mb-6">Your credit is ready. It&apos;ll apply automatically at your next booking.</p>
            <Link href="/therapists" className="inline-block bg-brand-600 text-white px-8 py-3 rounded-full font-medium hover:bg-brand-700 transition">
              Find a therapist
            </Link>
          </div>
        ) : (
          <>
            <div className="text-center mb-8">
              <h1 className="font-display text-3xl font-semibold text-brand-900 mb-2">Redeem a voucher</h1>
              <p className="text-sand-600">Enter your code to add credit to your account.</p>
            </div>
            <div className="bg-white rounded-3xl border border-sand-200 p-6 sm:p-8 shadow-sm">
              <input
                className="w-full border border-sand-300 rounded-xl px-4 py-3.5 text-center text-lg font-mono tracking-wider text-sand-900 bg-white focus:outline-none focus:ring-2 focus:ring-brand-400 uppercase"
                placeholder="FARE-XXXX-XXXX"
                value={code}
                onChange={e => setCode(e.target.value)}
              />
              {error && <p className="text-coral-600 text-sm mt-3 text-center">{error}</p>}
              <button
                onClick={redeem}
                disabled={code.trim().length < 4 || submitting}
                className="w-full mt-5 bg-brand-600 text-white py-3.5 rounded-full font-medium hover:bg-brand-700 transition disabled:opacity-40 shadow-lg shadow-brand-600/20"
              >
                {submitting ? 'Redeeming…' : 'Redeem'}
              </button>
            </div>
          </>
        )}
      </div>
    </main>
  )
}
