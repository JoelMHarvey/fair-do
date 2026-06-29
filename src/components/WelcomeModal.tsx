'use client'

import { useEffect, useState } from 'react'

const KEY = 'faresay_welcome_seen_v1'

// One-time friendly orientation the first time a therapist lands on the dashboard.
// Dismissed per device via localStorage — no backend, can't block anyone.
export function WelcomeModal({ firstName }: { firstName?: string }) {
  const [show, setShow] = useState(false)

  useEffect(() => {
    try { if (!localStorage.getItem(KEY)) setShow(true) } catch { /* ignore */ }
  }, [])

  function close() {
    try { localStorage.setItem(KEY, '1') } catch { /* ignore */ }
    setShow(false)
  }

  if (!show) return null

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-brand-900/40 backdrop-blur-sm">
      <div className="bg-white rounded-3xl border border-sand-200 shadow-xl max-w-md w-full p-7 sm:p-8">
        <div className="text-3xl mb-3" aria-hidden>👋</div>
        <h2 className="font-display text-2xl font-semibold text-brand-900 mb-1">
          Welcome{firstName ? `, ${firstName}` : ''}
        </h2>
        <p className="text-sand-600 mb-6">fair-do is your whole practice in one place. Here&apos;s the gist — it takes a few minutes to set up.</p>

        <ul className="space-y-4 mb-7">
          <li className="flex gap-3">
            <span className="shrink-0 w-7 h-7 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-sm font-semibold" aria-hidden>1</span>
            <span className="text-sm text-sand-700"><strong className="text-sand-900">Add your students.</strong> Invite them by email, or import your whole list. They&apos;re yours — no one else sees them.</span>
          </li>
          <li className="flex gap-3">
            <span className="shrink-0 w-7 h-7 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-sm font-semibold" aria-hidden>2</span>
            <span className="text-sm text-sand-700"><strong className="text-sand-900">Book lessons.</strong> Pick a time; we create a private video room and email your student automatically.</span>
          </li>
          <li className="flex gap-3">
            <span className="shrink-0 w-7 h-7 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-sm font-semibold" aria-hidden>3</span>
            <span className="text-sm text-sand-700"><strong className="text-sand-900">Get paid.</strong> Connect payments when you&apos;re ready and the money lands in your bank automatically.</span>
          </li>
        </ul>

        <div className="bg-sand-50 rounded-xl p-3 text-xs text-sand-600 mb-6">
          Stuck at any point? There&apos;s a <strong>Help</strong> link at the top of every page — and no question is too small.
        </div>

        <button
          onClick={close}
          className="w-full bg-brand-600 text-white py-3 rounded-full font-medium hover:bg-brand-700 transition shadow-sm"
        >
          Let&apos;s get started →
        </button>
      </div>
    </div>
  )
}
