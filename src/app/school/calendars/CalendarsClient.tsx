'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type Event = { id: string; title: string; kind: string; startsAt: string; endsAt: string; allDay: boolean }
type Calendar = { id: string; name: string; color: string | null; icsToken: string; events: Event[] }
type PreviewEvent = { title: string; startsAt: string; endsAt: string; allDay: boolean }

const KINDS = ['term', 'holiday', 'inset', 'exam', 'event'] as const
const KIND_LABELS: Record<string, string> = { term: 'Term', holiday: 'Holiday', inset: 'INSET', exam: 'Exams', event: 'Event' }
const KIND_CHIP: Record<string, string> = {
  term: 'bg-brand-50 text-brand-700',
  holiday: 'bg-coral-50 text-coral-600',
  inset: 'bg-amber-50 text-amber-700',
  exam: 'bg-sand-100 text-sand-700',
  event: 'bg-sand-50 text-sand-500',
}

const inputCls = 'rounded-xl border border-sand-300 px-3 py-2 text-sm focus:border-brand-400 focus:outline-none'

const DAY_MS = 86_400_000

// endsAt is stored exclusive for all-day spans — show the human (inclusive) range.
function spanLabel(e: { startsAt: string; endsAt: string; allDay: boolean }): string {
  const fmt = (d: Date) => d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' })
  const start = new Date(e.startsAt)
  if (!e.allDay) {
    const t = (d: Date) => d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' })
    return `${fmt(start)} ${t(start)}–${t(new Date(e.endsAt))}`
  }
  const lastDay = new Date(new Date(e.endsAt).getTime() - DAY_MS)
  return lastDay.getTime() <= start.getTime() ? fmt(start) : `${fmt(start)} – ${fmt(lastDay)}`
}

export default function CalendarsClient({ calendars, appUrl }: { calendars: Calendar[]; appUrl: string }) {
  const router = useRouter()
  const [openId, setOpenId] = useState<string | null>(calendars[0]?.id ?? null)
  const [error, setError] = useState<string | null>(null)

  // New calendar
  const [newName, setNewName] = useState('')
  const [newColor, setNewColor] = useState('#4f46e5')
  const [creating, setCreating] = useState(false)

  // New event (per open calendar)
  const [evTitle, setEvTitle] = useState('')
  const [evKind, setEvKind] = useState<string>('holiday')
  const [evStart, setEvStart] = useState('')
  const [evEnd, setEvEnd] = useState('')
  const [addingEvent, setAddingEvent] = useState(false)

  // ICS import
  const [icsText, setIcsText] = useState('')
  const [icsKind, setIcsKind] = useState<string>('holiday')
  const [icsPreview, setIcsPreview] = useState<PreviewEvent[] | null>(null)
  const [importing, setImporting] = useState(false)

  const [copied, setCopied] = useState<string | null>(null)

  async function api(url: string, init?: RequestInit): Promise<{ ok: boolean; data: Record<string, unknown> }> {
    setError(null)
    try {
      const res = await fetch(url, { headers: { 'Content-Type': 'application/json' }, ...init })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) setError((data as { error?: string }).error ?? 'Something went wrong.')
      return { ok: res.ok, data }
    } catch {
      setError('Something went wrong. Please try again.')
      return { ok: false, data: {} }
    }
  }

  async function createCalendar() {
    if (!newName.trim()) return
    setCreating(true)
    const { ok } = await api('/api/school/calendars', {
      method: 'POST',
      body: JSON.stringify({ name: newName.trim(), color: newColor }),
    })
    setCreating(false)
    if (ok) { setNewName(''); router.refresh() }
  }

  async function deleteCalendar(c: Calendar) {
    if (!window.confirm(`Delete "${c.name}" and its ${c.events.length} event${c.events.length !== 1 ? 's' : ''}? Anyone subscribed to its feed loses it.`)) return
    const { ok } = await api(`/api/school/calendars/${c.id}`, { method: 'DELETE' })
    if (ok) router.refresh()
  }

  async function addEvent(calendarId: string) {
    if (!evTitle.trim() || !evStart) return
    setAddingEvent(true)
    const { ok } = await api(`/api/school/calendars/${calendarId}/events`, {
      method: 'POST',
      body: JSON.stringify({
        event: { title: evTitle.trim(), kind: evKind, startDate: evStart, ...(evEnd ? { endDate: evEnd } : {}) },
      }),
    })
    setAddingEvent(false)
    if (ok) { setEvTitle(''); setEvStart(''); setEvEnd(''); router.refresh() }
  }

  async function deleteEvent(calendarId: string, eventId: string) {
    const { ok } = await api(`/api/school/calendars/${calendarId}/events?eventId=${eventId}`, { method: 'DELETE' })
    if (ok) router.refresh()
  }

  async function previewImport(calendarId: string) {
    if (!icsText.trim()) return
    setImporting(true)
    const { ok, data } = await api(`/api/school/calendars/${calendarId}/events`, {
      method: 'POST',
      body: JSON.stringify({ ics: icsText, kind: icsKind, commit: false }),
    })
    setImporting(false)
    if (ok && Array.isArray(data.preview)) setIcsPreview(data.preview as PreviewEvent[])
  }

  async function commitImport(calendarId: string) {
    setImporting(true)
    const { ok } = await api(`/api/school/calendars/${calendarId}/events`, {
      method: 'POST',
      body: JSON.stringify({ ics: icsText, kind: icsKind, commit: true }),
    })
    setImporting(false)
    if (ok) { setIcsText(''); setIcsPreview(null); router.refresh() }
  }

  function onIcsFile(file: File | null) {
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => { setIcsText(String(reader.result ?? '')); setIcsPreview(null) }
    reader.readAsText(file)
  }

  async function copyFeed(c: Calendar) {
    const url = `${appUrl}/api/school-calendar/${c.icsToken}`
    try {
      await navigator.clipboard.writeText(url)
      setCopied(c.id)
      setTimeout(() => setCopied(null), 2000)
    } catch { window.prompt('Copy the subscribe link:', url) }
  }

  return (
    <div className="space-y-5">
      {error && <p className="text-sm text-red-600">{error}</p>}

      {/* Calendar list */}
      <div className="space-y-3">
        {calendars.map(c => {
          const open = openId === c.id
          return (
            <div key={c.id} className="bg-white rounded-2xl border border-sand-200">
              <button onClick={() => setOpenId(open ? null : c.id)} className="w-full flex items-center gap-3 p-4 sm:px-5 text-left">
                <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: c.color ?? '#4f46e5' }} />
                <span className="flex-1 min-w-0">
                  <span className="text-sm font-medium text-sand-900">{c.name}</span>
                  <span className="text-xs text-sand-400 ml-2">{c.events.length} event{c.events.length !== 1 ? 's' : ''}</span>
                </span>
                <span className="text-sand-400 text-sm">{open ? '▾' : '▸'}</span>
              </button>

              {open && (
                <div className="px-4 sm:px-5 pb-5 space-y-5 border-t border-sand-100 pt-4">
                  {/* Subscribe + delete */}
                  <div className="flex flex-wrap items-center gap-3 text-xs">
                    <button onClick={() => copyFeed(c)} className="text-brand-700 hover:text-brand-800 underline underline-offset-4">
                      {copied === c.id ? 'Copied!' : 'Copy subscribe link (ICS)'}
                    </button>
                    <span className="text-sand-300">·</span>
                    <span className="text-sand-400">Paste into Google/Outlook &ldquo;subscribe by URL&rdquo; — it stays up to date.</span>
                    <button onClick={() => deleteCalendar(c)} className="ml-auto text-red-500 hover:text-red-700">Delete calendar</button>
                  </div>

                  {/* Events */}
                  {c.events.length === 0 ? (
                    <p className="text-sm text-sand-400">No events yet — add term dates below or import an .ics file.</p>
                  ) : (
                    <div className="divide-y divide-sand-100 -mx-1">
                      {c.events.map(e => (
                        <div key={e.id} className="flex items-center gap-3 px-1 py-2">
                          <span className={`text-[11px] px-2 py-0.5 rounded-full shrink-0 ${KIND_CHIP[e.kind] ?? KIND_CHIP.event}`}>
                            {KIND_LABELS[e.kind] ?? e.kind}
                          </span>
                          <span className="flex-1 min-w-0 text-sm text-sand-800 truncate">{e.title}</span>
                          <span className="text-xs text-sand-500 shrink-0">{spanLabel(e)}</span>
                          <button onClick={() => deleteEvent(c.id, e.id)} className="text-xs text-red-500 hover:text-red-700 shrink-0">Remove</button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add event */}
                  <div className="bg-sand-50 rounded-xl p-3 space-y-2">
                    <p className="text-xs font-medium text-sand-600">Add an event (all-day)</p>
                    <div className="flex flex-wrap gap-2">
                      <input value={evTitle} onChange={e => setEvTitle(e.target.value)} maxLength={160} placeholder="Title (e.g. October half term)" className={`${inputCls} flex-1 min-w-40`} />
                      <select value={evKind} onChange={e => setEvKind(e.target.value)} className={inputCls}>
                        {KINDS.map(k => <option key={k} value={k}>{KIND_LABELS[k]}</option>)}
                      </select>
                      <input type="date" value={evStart} onChange={e => setEvStart(e.target.value)} className={inputCls} aria-label="Start date" />
                      <input type="date" value={evEnd} onChange={e => setEvEnd(e.target.value)} className={inputCls} aria-label="End date (inclusive, optional)" />
                      <button onClick={() => addEvent(c.id)} disabled={addingEvent || !evTitle.trim() || !evStart} className="bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white rounded-full px-4 py-2 text-sm transition">
                        {addingEvent ? 'Adding…' : 'Add'}
                      </button>
                    </div>
                    <p className="text-[11px] text-sand-400">Holiday and INSET days are the ones checked when a lesson is booked.</p>
                  </div>

                  {/* ICS import */}
                  <div className="bg-sand-50 rounded-xl p-3 space-y-2">
                    <p className="text-xs font-medium text-sand-600">Import term dates (.ics)</p>
                    <div className="flex flex-wrap items-center gap-2">
                      <input type="file" accept=".ics,text/calendar" onChange={e => onIcsFile(e.target.files?.[0] ?? null)} className="text-xs text-sand-500" />
                      <label className="text-xs text-sand-500 flex items-center gap-1.5">
                        Import as
                        <select value={icsKind} onChange={e => setIcsKind(e.target.value)} className={inputCls}>
                          {KINDS.map(k => <option key={k} value={k}>{KIND_LABELS[k]}</option>)}
                        </select>
                      </label>
                    </div>
                    <textarea
                      value={icsText}
                      onChange={e => { setIcsText(e.target.value); setIcsPreview(null) }}
                      rows={3}
                      placeholder="…or paste the .ics file contents here"
                      className="w-full rounded-xl border border-sand-300 px-3 py-2 text-xs font-mono focus:border-brand-400 focus:outline-none"
                    />
                    {icsPreview === null ? (
                      <button onClick={() => previewImport(c.id)} disabled={importing || !icsText.trim()} className="bg-white border border-sand-300 hover:border-brand-400 disabled:opacity-50 text-sand-700 rounded-full px-4 py-2 text-sm transition">
                        {importing ? 'Reading…' : 'Preview import'}
                      </button>
                    ) : (
                      <div className="space-y-2">
                        <div className="max-h-40 overflow-y-auto divide-y divide-sand-100 bg-white rounded-xl border border-sand-200 px-3">
                          {icsPreview.map((e, i) => (
                            <div key={i} className="flex items-center gap-3 py-1.5 text-xs">
                              <span className="flex-1 min-w-0 text-sand-800 truncate">{e.title}</span>
                              <span className="text-sand-500 shrink-0">{spanLabel(e)}</span>
                            </div>
                          ))}
                        </div>
                        <div className="flex items-center gap-3">
                          <button onClick={() => commitImport(c.id)} disabled={importing} className="bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white rounded-full px-4 py-2 text-sm transition">
                            {importing ? 'Importing…' : `Import ${icsPreview.length} event${icsPreview.length !== 1 ? 's' : ''} as ${KIND_LABELS[icsKind]}`}
                          </button>
                          <button onClick={() => setIcsPreview(null)} disabled={importing} className="text-sm text-sand-500 hover:text-brand-700">Back</button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* New calendar */}
      <div className="bg-white rounded-2xl border border-sand-200 p-5 space-y-3">
        <h2 className="font-display text-lg text-sand-900">New calendar</h2>
        <div className="flex flex-wrap items-center gap-2">
          <input value={newName} onChange={e => setNewName(e.target.value)} maxLength={80} placeholder='Name (e.g. "Term dates", "Year 11 exams")' className={`${inputCls} flex-1 min-w-52 py-2.5`} />
          <input type="color" value={newColor} onChange={e => setNewColor(e.target.value)} className="h-10 w-12 rounded-xl border border-sand-300 p-1 bg-white" aria-label="Calendar colour" />
          <button onClick={createCalendar} disabled={creating || !newName.trim()} className="bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-medium rounded-full px-6 py-2.5 text-sm transition">
            {creating ? 'Creating…' : 'Create calendar'}
          </button>
        </div>
      </div>
    </div>
  )
}
