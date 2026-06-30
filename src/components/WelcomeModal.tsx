'use client'

import { useEffect, useState } from 'react'
import { useDict } from '@/components/DictProvider'

const KEY = 'fair-do_welcome_seen_v1'

// One-time friendly orientation the first time a therapist lands on the dashboard.
// Dismissed per device via localStorage — no backend, can't block anyone.
export function WelcomeModal({ firstName }: { firstName?: string }) {
  const { welcome_modal } = useDict()
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
          {welcome_modal.greeting}{firstName ? `, ${firstName}` : ''}
        </h2>
        <p className="text-sand-600 mb-6">{welcome_modal.intro}</p>

        <ul className="space-y-4 mb-7">
          {welcome_modal.steps.map((step, i) => (
            <li key={i} className="flex gap-3">
              <span className="shrink-0 w-7 h-7 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-sm font-semibold" aria-hidden>{i + 1}</span>
              <span className="text-sm text-sand-700"><strong className="text-sand-900">{step.title}</strong> {step.body}</span>
            </li>
          ))}
        </ul>

        <div className="bg-sand-50 rounded-xl p-3 text-xs text-sand-600 mb-6">
          {welcome_modal.help_before}<strong>{welcome_modal.help_link}</strong>{welcome_modal.help_after}
        </div>

        <button
          onClick={close}
          className="w-full bg-brand-600 text-white py-3 rounded-full font-medium hover:bg-brand-700 transition shadow-sm"
        >
          {welcome_modal.cta}
        </button>
      </div>
    </div>
  )
}
