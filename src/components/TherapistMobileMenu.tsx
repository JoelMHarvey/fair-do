'use client'

import { useState } from 'react'
import Link from 'next/link'

type NavLink = { href: string; label: string }

export function TherapistMobileMenu({ links }: { links: NavLink[] }) {
  const [open, setOpen] = useState(false)
  const close = () => setOpen(false)

  return (
    <div className="sm:hidden">
      <button
        onClick={() => setOpen(v => !v)}
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
          <div className="absolute left-0 right-0 top-16 z-50 border-b border-sand-200 bg-white shadow-lg">
            <nav className="max-w-4xl mx-auto px-5 py-3 flex flex-col">
              {links.map(l => (
                <Link key={l.href} href={l.href} onClick={close} className="py-3 px-2 rounded-lg text-sand-800 hover:bg-sand-50 transition">
                  {l.label}
                </Link>
              ))}
              <Link href="/therapist/help" onClick={close} className="py-3 px-2 rounded-lg font-medium text-brand-700 hover:bg-brand-50 transition">
                Help
              </Link>
              <Link href="/sign-out" onClick={close} className="py-3 px-2 rounded-lg text-sand-500 hover:bg-sand-50 transition border-t border-sand-100 mt-1">
                Sign out
              </Link>
            </nav>
          </div>
        </>
      )}
    </div>
  )
}
