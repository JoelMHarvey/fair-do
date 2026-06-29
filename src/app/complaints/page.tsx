'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Logo } from '@/components/Logo'

const CATEGORIES = [
  { value: 'safeguarding', label: 'Safeguarding concern', hint: 'Risk of harm to someone' },
  { value: 'conduct', label: 'Tutor conduct', hint: 'Professional or ethical issue' },
  { value: 'billing', label: 'Billing or payment', hint: 'Charges, refunds, credit' },
  { value: 'technical', label: 'Technical problem', hint: 'Video, booking, the app' },
  { value: 'other', label: 'Something else', hint: '' },
]

export default function ComplaintsPage() {
  const [category, setCategory] = useState('')
  const [body, setBody] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  async function submit() {
    setSubmitting(true)
    setError('')
    const res = await fetch('/api/complaints', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ category, body }),
    })
    if (res.ok) setDone(true)
    else {
      const d = await res.json().catch(() => ({}))
      setError(d.error === 'Unauthorized' ? 'Please sign in to submit via this form — or email us at legal@fair-do.com.' : (d.error ?? 'Something went wrong'))
    }
    setSubmitting(false)
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-brand-50/40 to-sand-50">
      <nav className="border-b border-sand-200 bg-white/80 backdrop-blur px-5 sm:px-8 h-16 flex items-center justify-between">
        <Logo />
        <Link href="/" className="text-sm text-sand-500 hover:text-brand-700">← Home</Link>
      </nav>

      <div className="max-w-xl mx-auto px-5 sm:px-6 py-12">
        <h1 className="font-display text-3xl font-semibold text-brand-900 mb-2">Raise a concern</h1>
        <p className="text-sand-600 mb-6">
          We take every complaint seriously. You&apos;ll get an acknowledgement within 2 business days and a full response within 10.
        </p>

        {done ? (
          <div className="bg-white rounded-3xl border border-sand-200 p-8 text-center shadow-sm">
            <div className="text-4xl mb-3">✓</div>
            <h2 className="font-display text-xl font-semibold text-brand-900 mb-2">Complaint received</h2>
            <p className="text-sand-600">Thank you. Our team will be in touch within 2 business days.</p>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-sand-200 p-6 sm:p-8 shadow-sm space-y-5">
            <div>
              <label className="block text-sm font-medium text-sand-700 mb-2">What&apos;s this about?</label>
              <div className="space-y-2">
                {CATEGORIES.map(c => (
                  <button
                    key={c.value}
                    onClick={() => setCategory(c.value)}
                    className={`w-full text-left px-4 py-3 rounded-xl border transition ${
                      category === c.value ? 'border-brand-500 bg-brand-50' : 'border-sand-200 hover:border-brand-300'
                    }`}
                  >
                    <p className="text-sm font-medium text-sand-800">{c.label}</p>
                    {c.hint && <p className="text-xs text-sand-500">{c.hint}</p>}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-sand-700 mb-1.5">Tell us what happened</label>
              <textarea
                className="w-full border border-sand-300 rounded-xl px-4 py-3 text-sand-900 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-400"
                rows={6}
                value={body}
                onChange={e => setBody(e.target.value)}
                placeholder="Include dates, names, and anything that helps us understand."
              />
            </div>

            {error && <p className="text-red-600 text-sm">{error}</p>}

            <button
              onClick={submit}
              disabled={!category || body.trim().length < 10 || submitting}
              className="w-full bg-brand-600 text-white py-3.5 rounded-full font-medium hover:bg-brand-700 transition disabled:opacity-40 shadow-lg shadow-brand-600/20"
            >
              {submitting ? 'Submitting…' : 'Submit complaint'}
            </button>

            <p className="text-xs text-sand-500 text-center">
              Not a member, can&apos;t sign in, or reporting a safeguarding concern about someone on fair-do?
              Email us directly at <a href="mailto:legal@fair-do.com" className="text-brand-700 hover:underline">legal@fair-do.com</a>.
            </p>
          </div>
        )}
      </div>
    </main>
  )
}
