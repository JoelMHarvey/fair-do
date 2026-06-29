'use client'

import { useState } from 'react'

export function ReferralLinkCard({
  title, subtitle, code, link, footnote,
}: { title: string; subtitle: string; code: string; link: string; footnote?: string }) {
  const [copied, setCopied] = useState(false)
  function copy() {
    navigator.clipboard.writeText(link).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }
  return (
    <div className="bg-gradient-to-br from-brand-600 to-brand-700 rounded-2xl p-6 text-white">
      <h2 className="font-display text-xl font-semibold mb-1">{title}</h2>
      <p className="text-brand-100 text-sm max-w-md">{subtitle}</p>
      <div className="flex items-center gap-2 mt-4">
        <code className="flex-1 bg-brand-800/60 rounded-lg px-4 py-2.5 text-sm font-mono truncate">{link}</code>
        <button onClick={copy} className="bg-white text-brand-800 px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-brand-50 transition shrink-0">
          {copied ? 'Copied ✓' : 'Copy'}
        </button>
      </div>
      <p className="text-brand-200 text-xs mt-2">Your code: <span className="font-mono">{code}</span></p>
      {footnote && <p className="text-brand-100 text-xs mt-3">{footnote}</p>}
    </div>
  )
}
