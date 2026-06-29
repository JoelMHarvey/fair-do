'use client'

import { useState, useRef, useEffect } from 'react'

// A small "?" icon that reveals a plain-English explanation. Use next to any
// label, field, or button a non-technical therapist might not understand.
export function HelpTip({ children, label = 'More info' }: { children: React.ReactNode; label?: string }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (!open) return
    const onDoc = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    const onEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', onDoc)
    document.addEventListener('keydown', onEsc)
    return () => { document.removeEventListener('mousedown', onDoc); document.removeEventListener('keydown', onEsc) }
  }, [open])

  return (
    <span ref={ref} className="relative inline-flex align-middle">
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        aria-label={label}
        aria-expanded={open}
        className="inline-flex items-center justify-center w-[18px] h-[18px] rounded-full bg-sand-200 text-sand-700 text-[11px] font-bold leading-none hover:bg-brand-100 hover:text-brand-700 transition ml-1"
      >
        ?
      </button>
      {open && (
        <span
          role="tooltip"
          className="absolute z-50 left-1/2 -translate-x-1/2 top-6 w-64 bg-white border border-sand-200 rounded-xl shadow-lg p-3 text-sm text-sand-700 font-normal leading-relaxed"
        >
          {children}
        </span>
      )}
    </span>
  )
}
