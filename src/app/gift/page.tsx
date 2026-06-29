'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Logo } from '@/components/Logo'

const PRESETS = [4000, 8000, 12000]

export default function GiftPage() {
  const [amount, setAmount] = useState(8000)
  const [custom, setCustom] = useState('')
  const [purchaserEmail, setPurchaserEmail] = useState('')
  const [recipientEmail, setRecipientEmail] = useState('')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const amountPence = custom ? Math.round(parseFloat(custom) * 100) : amount

  async function buy() {
    setSubmitting(true)
    setError('')
    const res = await fetch('/api/gift/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amountPence, purchaserEmail, recipientEmail, message }),
    })
    if (!res.ok) {
      const d = await res.json().catch(() => ({}))
      setError(d.error ?? 'Something went wrong')
      setSubmitting(false)
      return
    }
    const data = await res.json()
    window.location.href = data.checkoutUrl
  }

  const input = 'w-full border border-sand-300 rounded-xl px-4 py-3 text-sand-900 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent'
  const valid = amountPence >= 1000 && amountPence <= 50000 && /\S+@\S+/.test(purchaserEmail)

  return (
    <main className="min-h-screen bg-gradient-to-b from-coral-50/40 to-sand-50">
      <nav className="border-b border-sand-200 bg-white/80 backdrop-blur px-5 sm:px-8 h-16 flex items-center justify-between">
        <Logo />
        <Link href="/" className="text-sm text-sand-500 hover:text-brand-700">← Home</Link>
      </nav>

      <div className="max-w-lg mx-auto px-5 sm:px-6 py-12">
        <div className="text-center mb-8">
          <h1 className="font-display text-4xl font-semibold text-brand-900 mb-2">Gift therapy</h1>
          <p className="text-sand-600">Give someone the space to feel better — on their terms, in their time.</p>
        </div>

        {/* How it works */}
        <div className="bg-white rounded-3xl border border-sand-200 p-6 mb-5 shadow-sm">
          <h2 className="font-display text-lg font-semibold text-brand-900 mb-4">How it works</h2>
          <ol className="space-y-3">
            {[
              ['You choose an amount', 'Pay securely. We create a voucher code — vouchers never expire.'],
              ['They get the code', 'Sent by email (or to you, to share however feels right).'],
              ['They redeem in their own time', 'It becomes account credit, used against any therapist they choose. No pressure, no deadline.'],
            ].map(([t, b], i) => (
              <li key={t} className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-700 text-xs font-semibold">{i + 1}</span>
                <div>
                  <p className="text-sm font-medium text-sand-800">{t}</p>
                  <p className="text-sm text-sand-500">{b}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        {/* Sensitivity note */}
        <div className="bg-brand-50 border border-brand-200 rounded-2xl p-5 mb-6 text-sm text-sand-700">
          <p className="font-medium text-brand-800 mb-1">A gentle word</p>
          <p>
            Therapy is personal, and being given it can feel complicated. We never tell the recipient it&apos;s &quot;because they need help&quot; — just that someone cares. They redeem privately, choose their own therapist, and are never pressured to use it. If they never do, that&apos;s okay too.
          </p>
        </div>

        <div className="bg-white rounded-3xl border border-sand-200 p-6 sm:p-8 shadow-sm space-y-6">
          <div>
            <label className="block text-sm font-medium text-sand-700 mb-2">Amount</label>
            <div className="grid grid-cols-3 gap-2 mb-2">
              {PRESETS.map(p => (
                <button
                  key={p}
                  onClick={() => { setAmount(p); setCustom('') }}
                  className={`py-3 rounded-xl border font-medium transition ${
                    !custom && amount === p ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-sand-200 text-sand-700 hover:border-brand-300'
                  }`}
                >
                  £{p / 100}
                </button>
              ))}
            </div>
            <input className={input} type="number" placeholder="Or enter custom amount (£)" value={custom} onChange={e => setCustom(e.target.value)} />
          </div>

          <div>
            <label className="block text-sm font-medium text-sand-700 mb-1.5">Your email</label>
            <input className={input} type="email" value={purchaserEmail} onChange={e => setPurchaserEmail(e.target.value)} placeholder="you@email.com" />
          </div>

          <div>
            <label className="block text-sm font-medium text-sand-700 mb-1.5">
              Recipient email <span className="text-sand-400 font-normal">— leave blank to receive the code yourself</span>
            </label>
            <input className={input} type="email" value={recipientEmail} onChange={e => setRecipientEmail(e.target.value)} placeholder="them@email.com" />
          </div>

          <div>
            <label className="block text-sm font-medium text-sand-700 mb-1.5">Message <span className="text-sand-400 font-normal">— optional</span></label>
            <textarea className={input} rows={3} value={message} onChange={e => setMessage(e.target.value)} placeholder="Thinking of you 💚" maxLength={300} />
          </div>

          {error && <p className="text-coral-600 text-sm">{error}</p>}

          <button
            onClick={buy}
            disabled={!valid || submitting}
            className="w-full bg-brand-600 text-white py-3.5 rounded-full font-medium hover:bg-brand-700 transition disabled:opacity-40 shadow-lg shadow-brand-600/20"
          >
            {submitting ? 'Redirecting…' : `Buy gift — £${(amountPence / 100).toFixed(2)}`}
          </button>
          <p className="text-xs text-sand-400 text-center">Secure payment via Stripe. Vouchers never expire.</p>
        </div>
      </div>
    </main>
  )
}
