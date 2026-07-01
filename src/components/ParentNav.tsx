'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Logo } from '@/components/Logo'

// Sticky nav for parent-role users — separate from TeacherNav / SiteNav.
// Section links jump within the single dashboard page; Account opens Stripe billing.
export function ParentNav({ signOutLabel = 'Sign out' }: { signOutLabel?: string }) {
  const [busy, setBusy] = useState(false)

  async function openBilling() {
    setBusy(true)
    const res = await fetch('/api/parent/billing-portal', { method: 'POST' })
    const d = await res.json().catch(() => ({}))
    if (res.ok && d.url) {
      window.location.href = d.url
    } else {
      setBusy(false)
      alert(d.error ?? 'Could not open billing.')
    }
  }

  return (
    <nav className="border-b border-sand-200 bg-white/80 backdrop-blur px-5 sm:px-8 h-16 flex items-center justify-between sticky top-0 z-40">
      <Logo />
      <div className="flex items-center gap-4 sm:gap-5 text-sm">
        <a href="#lessons" className="hidden sm:inline text-sand-600 hover:text-brand-700">Lessons</a>
        <a href="#packages" className="hidden sm:inline text-sand-600 hover:text-brand-700">Packages</a>
        <a href="#invoices" className="hidden sm:inline text-sand-600 hover:text-brand-700">Invoices</a>
        <a href="#messages" className="hidden sm:inline text-sand-600 hover:text-brand-700">Messages</a>
        <button onClick={openBilling} disabled={busy} className="text-sand-600 hover:text-brand-700 disabled:opacity-50">
          {busy ? '…' : 'Account'}
        </button>
        <Link href="/sign-out" className="text-sand-500 hover:text-brand-700">{signOutLabel}</Link>
      </div>
    </nav>
  )
}
