'use client'

import { useState } from 'react'

type Doc = { id: string; label: string; url: string; category: string }

export const CATEGORIES: { value: string; label: string }[] = [
  { value: 'lesson-notes', label: 'Lesson notes' },
  { value: 'homework', label: 'Homework / assignment' },
  { value: 'resource', label: 'Resource / worksheet' },
  { value: 'progress', label: 'Progress record' },
  { value: 'other', label: 'Other' },
]
const LABEL = Object.fromEntries(CATEGORIES.map(c => [c.value, c.label]))

export default function ClientDocuments({ matchId, initial }: { matchId: string; initial: Doc[] }) {
  const [docs, setDocs] = useState<Doc[]>(initial)
  const [label, setLabel] = useState('')
  const [url, setUrl] = useState('')
  const [category, setCategory] = useState('lesson-notes')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function add() {
    setError('')
    if (!label.trim() || !/^https?:\/\//i.test(url.trim())) { setError('Enter a label and a full https link.'); return }
    setBusy(true)
    const res = await fetch(`/api/practice/clients/${matchId}/documents`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ label: label.trim(), url: url.trim(), category }),
    })
    if (res.ok) {
      const { document } = await res.json()
      setDocs(d => [...d, document])
      setLabel(''); setUrl('')
    } else setError('Could not add that link.')
    setBusy(false)
  }

  async function remove(id: string) {
    setDocs(d => d.filter(x => x.id !== id))
    await fetch(`/api/practice/clients/${matchId}/documents`, {
      method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }),
    }).catch(() => {})
  }

  return (
    <div>
      {docs.length > 0 && (
        <div className="bg-white rounded-2xl border border-sand-200 overflow-hidden mb-3">
          {docs.map((d, i) => (
            <div key={d.id} className={`flex items-center justify-between gap-3 px-5 py-3.5 ${i > 0 ? 'border-t border-sand-100' : ''}`}>
              <div className="min-w-0">
                <a href={d.url} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-brand-700 hover:underline truncate block">
                  🔗 {d.label}
                </a>
                <span className="text-xs text-sand-400">{LABEL[d.category] ?? d.category}</span>
              </div>
              <button onClick={() => remove(d.id)} aria-label="Remove link" className="text-sand-400 hover:text-red-500 text-sm shrink-0">Remove</button>
            </div>
          ))}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-sand-200 p-4 shadow-sm space-y-2.5">
        <select value={category} onChange={e => setCategory(e.target.value)} className="w-full border border-sand-200 rounded-lg px-3 py-2 text-sm bg-white text-sand-800">
          {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
        </select>
        <input value={label} onChange={e => setLabel(e.target.value)} placeholder="Label (e.g. “Intake — Jan 2026”)" className="w-full border border-sand-200 rounded-lg px-3 py-2 text-sm" />
        <input value={url} onChange={e => setUrl(e.target.value)} placeholder="https://… link to the document in your own storage" className="w-full border border-sand-200 rounded-lg px-3 py-2 text-sm" />
        {error && <p className="text-coral-600 text-xs">{error}</p>}
        <button onClick={add} disabled={busy} className="w-full bg-brand-600 text-white text-sm font-medium py-2 rounded-full hover:bg-brand-700 transition disabled:opacity-40">
          {busy ? 'Adding…' : 'Add link'}
        </button>
      </div>
    </div>
  )
}
