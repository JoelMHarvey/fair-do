'use client'

import { useState } from 'react'

export default function CopyLink({ url, label = 'Copy link' }: { url: string; label?: string }) {
  const [copied, setCopied] = useState(false)

  async function copy() {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      /* clipboard unavailable — ignore */
    }
  }

  return (
    <button onClick={copy} className="text-xs font-medium text-brand-700 hover:underline">
      {copied ? 'Copied ✓' : label}
    </button>
  )
}
