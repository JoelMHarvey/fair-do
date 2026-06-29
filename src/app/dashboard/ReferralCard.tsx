'use client'

import { useState } from 'react'

export default function ReferralCard({ code, link, rewardPounds }: { code: string; link: string; rewardPounds: number }) {
  const [copied, setCopied] = useState(false)

  function copy() {
    navigator.clipboard.writeText(link).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className="bg-gradient-to-br from-brand-600 to-brand-700 rounded-2xl p-6 mb-8 text-white">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="font-display text-xl font-semibold mb-1">Give £{rewardPounds}, get £{rewardPounds}</h2>
          <p className="text-brand-100 text-sm max-w-md">
            Share your link. Your friend gets £{rewardPounds} off their first session, and you get £{rewardPounds} credit when they book. Everyone wins.
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 mt-4">
        <code className="flex-1 bg-brand-800/60 rounded-lg px-4 py-2.5 text-sm font-mono truncate">{link}</code>
        <button
          onClick={copy}
          className="bg-white text-brand-800 px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-brand-50 transition shrink-0"
        >
          {copied ? 'Copied ✓' : 'Copy'}
        </button>
      </div>
      <p className="text-brand-200 text-xs mt-2">Your code: <span className="font-mono">{code}</span></p>
    </div>
  )
}
