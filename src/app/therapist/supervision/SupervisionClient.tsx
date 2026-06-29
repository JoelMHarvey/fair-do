'use client'

import { useState } from 'react'

type Log = { id: string; date: string; supervisorName: string | null; durationMins: number; notes: string | null }

const MIN_MONTH_MINS = 90 // BACP: 1.5 hours/month

export default function SupervisionClient({ initial }: { initial: Log[] }) {
  const [logs, setLogs] = useState<Log[]>(initial)
  const [date, setDate] = useState('')
  const [supervisorName, setSupervisorName] = useState('')
  const [hours, setHours] = useState('')
  const [notes, setNotes] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const now = new Date()
  const monthMins = logs
    .filter(l => { const d = new Date(l.date); return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear() })
    .reduce((s, l) => s + l.durationMins, 0)
  const metMin = monthMins >= MIN_MONTH_MINS
  const fmtH = (mins: number) => `${(mins / 60).toFixed(mins % 60 === 0 ? 0 : 1)}h`
  const fmtD = (s: string) => new Date(s).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })

  async function add() {
    setError('')
    const h = Number(hours)
    if (!date || !Number.isFinite(h) || h <= 0) { setError('Enter a date and how long.'); return }
    setBusy(true)
    const res = await fetch('/api/practice/supervision', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date, supervisorName: supervisorName || undefined, durationMins: Math.round(h * 60), notes: notes || undefined }),
    })
    if (res.ok) {
      const { log } = await res.json()
      setLogs(l => [log, ...l].sort((a, b) => +new Date(b.date) - +new Date(a.date)))
      setHours(''); setNotes('')
    } else setError('Could not save that entry.')
    setBusy(false)
  }

  async function remove(id: string) {
    setLogs(l => l.filter(x => x.id !== id))
    await fetch('/api/practice/supervision', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) }).catch(() => {})
  }

  return (
    <div>
      <div className={`rounded-2xl border p-5 mb-6 ${metMin ? 'bg-brand-50 border-brand-200' : 'bg-amber-50 border-amber-200'}`}>
        <p className="text-sm text-sand-600">This month</p>
        <p className="font-display text-3xl font-semibold text-brand-900 mt-0.5">{fmtH(monthMins)}</p>
        <p className={`text-sm mt-1 ${metMin ? 'text-brand-700' : 'text-amber-700'}`}>
          {metMin ? '✓ Meets the BACP minimum (1.5 hours/month).' : `${fmtH(Math.max(0, MIN_MONTH_MINS - monthMins))} short of the BACP minimum (1.5 hours/month).`}
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-sand-200 p-4 shadow-sm space-y-2.5 mb-6">
        <div className="flex gap-2">
          <input type="date" value={date} onChange={e => setDate(e.target.value)} className="flex-1 min-w-0 border border-sand-200 rounded-lg px-3 py-2 text-sm text-sand-700" />
          <input type="number" step="0.25" value={hours} onChange={e => setHours(e.target.value)} placeholder="Hours" className="w-24 border border-sand-200 rounded-lg px-3 py-2 text-sm" />
        </div>
        <input value={supervisorName} onChange={e => setSupervisorName(e.target.value)} placeholder="Supervisor (optional)" className="w-full border border-sand-200 rounded-lg px-3 py-2 text-sm" />
        <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} placeholder="Notes (optional) — kept separate from client records" className="w-full border border-sand-200 rounded-lg px-3 py-2 text-sm" />
        {error && <p className="text-coral-600 text-xs">{error}</p>}
        <button onClick={add} disabled={busy} className="w-full bg-brand-600 text-white text-sm font-medium py-2 rounded-full hover:bg-brand-700 transition disabled:opacity-40">
          {busy ? 'Saving…' : 'Log supervision'}
        </button>
      </div>

      {logs.length > 0 && (
        <div className="bg-white rounded-2xl border border-sand-200 overflow-hidden">
          {logs.map((l, i) => (
            <div key={l.id} className={`flex items-start justify-between gap-3 px-5 py-4 ${i > 0 ? 'border-t border-sand-100' : ''}`}>
              <div className="min-w-0">
                <p className="text-sm font-medium text-sand-900">{fmtD(l.date)} · {fmtH(l.durationMins)}{l.supervisorName ? ` · ${l.supervisorName}` : ''}</p>
                {l.notes && <p className="text-xs text-sand-500 mt-0.5 whitespace-pre-wrap">{l.notes}</p>}
              </div>
              <button onClick={() => remove(l.id)} aria-label="Remove entry" className="text-sand-400 hover:text-red-500 text-sm shrink-0">Remove</button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
