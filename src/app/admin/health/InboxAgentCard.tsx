'use client'

import { useState } from 'react'

type Level = 'off' | 'draft' | 'ack' | 'assist'

const LEVELS: { key: Level; label: string; desc: string }[] = [
  { key: 'off', label: 'Off', desc: 'Nothing polled, nothing sent.' },
  { key: 'draft', label: 'Draft', desc: 'Triages mail into drafts for you to send. No outbound.' },
  { key: 'ack', label: 'Acknowledge', desc: 'Auto-sends only “a human is on it”. Fixes still drafted.' },
  { key: 'assist', label: 'Assist', desc: 'Also auto-sends high-confidence, allow-listed fixes.' },
]

export default function InboxAgentCard({
  initialLevel,
  configured,
  draftCount,
  escalatedCount,
}: {
  initialLevel: Level
  configured: boolean
  draftCount: number
  escalatedCount: number
}) {
  const [level, setLevel] = useState<Level>(initialLevel)
  const [saving, setSaving] = useState<Level | null>(null)
  const [error, setError] = useState('')

  async function choose(next: Level) {
    if (next === level) return
    setSaving(next)
    setError('')
    const res = await fetch('/api/admin/inbox-agent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ level: next }),
    })
    setSaving(null)
    if (res.ok) setLevel(next)
    else setError('Could not change the level — try again.')
  }

  return (
    <div className="bg-white rounded-2xl border border-sand-200 p-6">
      <div className="flex items-center justify-between mb-1">
        <h2 className="font-display text-lg font-semibold text-brand-900">Inbox agent</h2>
        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${level === 'off' ? 'bg-sand-100 text-sand-600' : 'bg-brand-100 text-brand-700'}`}>
          {level === 'off' ? 'Off' : `Live · ${level}`}
        </span>
      </div>
      <p className="text-sm text-sand-500 mb-4">
        Triages support@ / hello@ / enquiries@ — acknowledges, suggests fixes, escalates the serious ones.
      </p>

      {!configured && (
        <div className="mb-4 text-sm rounded-lg bg-amber-50 border border-amber-200 text-amber-700 px-3 py-2">
          Not fully configured — set <code>ANTHROPIC_API_KEY</code> and the support <code>IMAP_*</code> creds before raising above Off.
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {LEVELS.map(l => {
          const active = level === l.key
          return (
            <button
              key={l.key}
              onClick={() => choose(l.key)}
              disabled={saving !== null}
              className={`text-left rounded-xl border p-3 transition disabled:opacity-50 ${
                active ? 'border-brand-500 bg-brand-50 ring-1 ring-brand-200' : 'border-sand-200 hover:border-brand-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className={`text-sm font-medium ${active ? 'text-brand-800' : 'text-sand-800'}`}>{l.label}</span>
                {saving === l.key && <span className="text-xs text-sand-400">saving…</span>}
                {active && saving === null && <span className="text-xs text-brand-600">● current</span>}
              </div>
              <p className="text-xs text-sand-500 mt-0.5">{l.desc}</p>
            </button>
          )
        })}
      </div>

      {error && <p className="text-sm text-coral-600 mt-3">{error}</p>}

      <div className="flex gap-5 mt-4 pt-4 border-t border-sand-100 text-sm">
        <span className="text-sand-600">{draftCount} draft{draftCount === 1 ? '' : 's'} awaiting review</span>
        <span className={escalatedCount > 0 ? 'text-coral-600 font-medium' : 'text-sand-600'}>
          {escalatedCount} escalated
        </span>
      </div>
    </div>
  )
}
