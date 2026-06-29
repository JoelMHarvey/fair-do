'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Show } from '@clerk/nextjs'

type NavLink = { href: string; label: string }

const DEFAULT_LINKS: NavLink[] = [
  { href: '/therapists', label: 'Find a therapist' },
  { href: '/styles', label: 'Therapy styles' },
  { href: '/#how', label: 'How it works' },
  { href: '/faq', label: 'FAQ' },
]

export function MobileMenu({
  isAdmin,
  isFounder,
  links = DEFAULT_LINKS,
  cta = { href: '/sign-up', label: 'Get started' },
}: {
  isAdmin: boolean
  isFounder?: boolean
  links?: NavLink[]
  cta?: NavLink
}) {
  const [open, setOpen] = useState(false)
  const close = () => setOpen(false)

  return (
    <div className="sm:hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? 'Close menu' : 'Open menu'}
        aria-expanded={open}
        className="p-2 -mr-2 text-sand-700 hover:text-brand-700 transition"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          {open ? <><path d="M6 6l12 12" /><path d="M18 6L6 18" /></> : <><path d="M3 6h18" /><path d="M3 12h18" /><path d="M3 18h18" /></>}
        </svg>
      </button>

      {open && (
        <>
          <button className="fixed inset-0 z-40 bg-brand-900/20" aria-hidden onClick={close} tabIndex={-1} />
          <div className="absolute left-0 right-0 top-16 z-50 border-b border-sand-200 bg-sand-50 shadow-lg">
            <nav className="max-w-6xl mx-auto px-5 py-4 flex flex-col gap-1">
              {links.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={close}
                  className="py-3 px-2 rounded-lg text-sand-800 hover:bg-brand-50 hover:text-brand-700 transition"
                >
                  {l.label}
                </Link>
              ))}
              <div className="border-t border-sand-200 mt-2 pt-3 flex flex-col gap-2">
                {isFounder && (
                  <Link href="/founder" onClick={close} className="py-2.5 px-2 rounded-lg font-medium text-brand-700 hover:bg-brand-50 transition">
                    Business docs
                  </Link>
                )}
                {isAdmin && (
                  <Link href="/admin" onClick={close} className="py-2.5 px-2 rounded-lg font-medium text-coral-600 hover:bg-coral-50 transition">
                    Admin
                  </Link>
                )}
                <Show when="signed-out">
                  <Link href="/sign-in" onClick={close} className="py-2.5 px-2 rounded-lg font-medium text-sand-700 hover:bg-brand-50 transition">
                    Sign in
                  </Link>
                  <Link href={cta.href} onClick={close} className="py-3 px-4 rounded-full text-center font-medium bg-brand-600 text-white hover:bg-brand-700 transition">
                    {cta.label}
                  </Link>
                </Show>
                <Show when="signed-in">
                  <Link href="/dashboard" onClick={close} className="py-2.5 px-2 rounded-lg font-medium text-sand-700 hover:bg-brand-50 transition">
                    Dashboard
                  </Link>
                </Show>
              </div>
            </nav>
          </div>
        </>
      )}
    </div>
  )
}
