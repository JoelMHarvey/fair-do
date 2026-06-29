'use client'

import { useState } from 'react'

export default function NotesEditor({ matchId, initial }: { matchId: string; initial: string | null }) {
  const [notes, setNotes] = useState(initial ?? '')
  const [saved, setSaved] = useState(initial ?? '')
  const [busy, setBusy] = useState(false)
  const dirty = notes !== saved

  async function save() {
    setBusy(true)
    const res = await fetch(`/api/practice/clients/${matchId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notes: notes.trim() || null }),
    })
    if (res.ok) setSaved(notes)
    setBusy(false)
  }

  return (
    <div className="bg-white rounded-2xl border border-sand-200 p-4 shadow-sm">
      <textarea
        value={notes}
        onChange={e => setNotes(e.target.value)}
        rows={4}
        placeholder="Private working notes about this client — only you can see these."
        className="w-full border border-sand-200 rounded-xl px-3 py-2.5 text-sm text-sand-800 bg-sand-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-100 focus:border-brand-400 resize-y"
      />
      <div className="flex items-center justify-between mt-2">
        <p className="text-xs text-sand-400">Quick notes only — keep full clinical records in your own system.</p>
        <button
          onClick={save}
          disabled={!dirty || busy}
          className="text-sm font-medium bg-brand-600 text-white px-4 py-1.5 rounded-full hover:bg-brand-700 transition disabled:opacity-40"
        >
          {busy ? 'Saving…' : dirty ? 'Save' : 'Saved'}
        </button>
      </div>
    </div>
  )
}
