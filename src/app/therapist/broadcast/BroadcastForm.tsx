'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'

type Student = { studentId: string; firstName: string; lastName: string; email: string; lastSessionAt: string | null }
type Template = { id: string; name: string; subject: string; body: string; channel: string }

const STALE_DAYS = 90
const DAY_MS = 86_400_000

function daysSince(iso: string | null): number | null {
  if (!iso) return null
  return Math.floor((Date.now() - new Date(iso).getTime()) / DAY_MS)
}

function lastSeenLabel(iso: string | null): string {
  const d = daysSince(iso)
  if (d === null) return 'never seen'
  if (d <= 0) return 'seen today'
  if (d === 1) return 'seen yesterday'
  if (d < 30) return `seen ${d}d ago`
  if (d < 365) return `seen ${Math.floor(d / 30)}mo ago`
  return `seen ${Math.floor(d / 365)}y ago`
}

const inputCls = 'w-full rounded-xl border border-sand-300 px-3 py-2.5 text-sm focus:border-brand-400 focus:outline-none'

export default function BroadcastForm({
  isPaid, reachable, students, templates: initialTemplates,
}: { isPaid: boolean; reachable: number; students: Student[]; templates: Template[] }) {
  const router = useRouter()
  const [channel, setChannel] = useState<'email' | 'event'>('email')
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  // Event fields
  const [title, setTitle] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [durationMins, setDurationMins] = useState(60)
  const [location, setLocation] = useState('')
  const [joinUrl, setJoinUrl] = useState('')

  const [templates, setTemplates] = useState<Template[]>(initialTemplates)
  const [confirming, setConfirming] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState<string | null>(null)

  // Pre-tick students seen within the staleness window; leave stale/never-seen unticked.
  const [selected, setSelected] = useState<Set<string>>(() => {
    const s = new Set<string>()
    for (const c of students) {
      const d = daysSince(c.lastSessionAt)
      if (d !== null && d <= STALE_DAYS) s.add(c.studentId)
    }
    return s
  })

  const resetConfirm = () => setConfirming(false)
  function toggle(id: string) {
    setSelected(prev => {
      const n = new Set(prev)
      if (n.has(id)) n.delete(id)
      else n.add(id)
      return n
    })
    resetConfirm()
  }
  function selectAll() { setSelected(new Set(students.map(c => c.studentId))); resetConfirm() }
  function selectNone() { setSelected(new Set()); resetConfirm() }
  function selectRecent() {
    setSelected(new Set(students.filter(c => { const d = daysSince(c.lastSessionAt); return d !== null && d <= STALE_DAYS }).map(c => c.studentId)))
    resetConfirm()
  }

  const selectedCount = isPaid ? selected.size : reachable
  const eventTitleForApi = title.trim()

  const canSend = useMemo(() => {
    if (selectedCount === 0) return false
    if (channel === 'event') return eventTitleForApi.length > 0 && !!date && !!time
    return subject.trim().length > 0 && body.trim().length > 0
  }, [selectedCount, channel, eventTitleForApi, date, time, subject, body])

  function applyTemplate(id: string) {
    const t = templates.find(x => x.id === id)
    if (!t) return
    setChannel(t.channel === 'event' ? 'event' : 'email')
    if (t.channel === 'event') setTitle(t.subject)
    else setSubject(t.subject)
    setBody(t.body)
    resetConfirm()
  }

  async function saveTemplate() {
    const name = window.prompt('Name this template (e.g. "Holiday hours")')?.trim()
    if (!name) return
    const payload = {
      name,
      subject: channel === 'event' ? eventTitleForApi || 'Invitation' : subject.trim() || 'Update',
      body: body.trim(),
      channel,
    }
    try {
      const res = await fetch('/api/practice/broadcast/templates', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) { setError(data.error ?? 'Could not save template.'); return }
      setTemplates(prev => [data.template, ...prev])
    } catch { setError('Could not save template.') }
  }

  async function deleteTemplate(id: string) {
    setTemplates(prev => prev.filter(t => t.id !== id))
    await fetch(`/api/practice/broadcast/templates?id=${id}`, { method: 'DELETE' }).catch(() => {})
  }

  async function send() {
    setLoading(true); setError(null); setDone(null)
    try {
      const payload: Record<string, unknown> = { subject: channel === 'event' ? eventTitleForApi : subject.trim(), body: body.trim() }
      if (isPaid) {
        payload.studentIds = [...selected]
        payload.channel = channel
        if (channel === 'event') {
          payload.event = {
            title: eventTitleForApi,
            startISO: new Date(`${date}T${time}`).toISOString(),
            durationMins,
            ...(location.trim() ? { location: location.trim() } : {}),
            ...(joinUrl.trim() ? { joinUrl: joinUrl.trim() } : {}),
          }
        }
      }
      const res = await fetch('/api/practice/broadcast', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) { setError(data.error ?? 'Could not send.'); setLoading(false); setConfirming(false); return }
      setDone(`${channel === 'event' ? 'Invite' : 'Message'} sent to ${data.recipientCount} student${data.recipientCount !== 1 ? 's' : ''}.`)
      setSubject(''); setBody(''); setTitle(''); setDate(''); setTime(''); setLocation(''); setJoinUrl('')
      setConfirming(false); setLoading(false)
      router.refresh()
    } catch {
      setError('Something went wrong. Please try again.'); setLoading(false); setConfirming(false)
    }
  }

  // ---- Free tier: the original send-to-all email form ----
  if (!isPaid) {
    return (
      <div className="bg-white rounded-2xl border border-sand-200 p-5 space-y-3">
        <input value={subject} onChange={e => { setSubject(e.target.value); resetConfirm() }} maxLength={160} placeholder="Subject" className={inputCls} />
        <textarea value={body} onChange={e => { setBody(e.target.value); resetConfirm() }} rows={8} maxLength={5000} placeholder="Write your update… (plain text — line breaks are kept)" className={inputCls} />
        {error && <p className="text-sm text-red-600">{error}</p>}
        {done && <p className="text-sm text-brand-700">{done}</p>}
        {!confirming ? (
          <button onClick={() => setConfirming(true)} disabled={!canSend} className="bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-medium rounded-full px-6 py-2.5 text-sm transition">Review &amp; send</button>
        ) : (
          <div className="flex items-center gap-3">
            <button onClick={send} disabled={loading} className="bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-medium rounded-full px-6 py-2.5 text-sm transition">{loading ? 'Sending…' : `Send to ${reachable} student${reachable !== 1 ? 's' : ''}`}</button>
            <button onClick={resetConfirm} disabled={loading} className="text-sm text-sand-500 hover:text-brand-700">Cancel</button>
          </div>
        )}
        {reachable === 0 && <p className="text-xs text-sand-400">No students with an email yet — invite or import students first.</p>}
      </div>
    )
  }

  // ---- Paid tier: recipients + channel + templates ----
  return (
    <div className="space-y-5">
      {/* Channel + templates */}
      <div className="bg-white rounded-2xl border border-sand-200 p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex rounded-full border border-sand-200 p-0.5 bg-sand-50">
            {(['email', 'event'] as const).map(c => (
              <button key={c} onClick={() => { setChannel(c); resetConfirm() }}
                className={`px-4 py-1.5 rounded-full text-sm transition ${channel === c ? 'bg-white shadow-sm text-brand-700 font-medium' : 'text-sand-500'}`}>
                {c === 'email' ? 'Email' : 'Calendar invite'}
              </button>
            ))}
          </div>
          {templates.length > 0 && (
            <select defaultValue="" onChange={e => { if (e.target.value) applyTemplate(e.target.value); e.target.value = '' }} className="rounded-xl border border-sand-300 px-3 py-2 text-sm text-sand-700 focus:border-brand-400 focus:outline-none">
              <option value="">Load template…</option>
              {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          )}
        </div>

        {channel === 'event' ? (
          <div className="space-y-3">
            <input value={title} onChange={e => { setTitle(e.target.value); resetConfirm() }} maxLength={160} placeholder="Event title (e.g. Group session, Open evening)" className={inputCls} />
            <div className="grid grid-cols-2 gap-3">
              <label className="text-xs text-sand-500">Date<input type="date" value={date} onChange={e => { setDate(e.target.value); resetConfirm() }} className={inputCls} /></label>
              <label className="text-xs text-sand-500">Start time<input type="time" value={time} onChange={e => { setTime(e.target.value); resetConfirm() }} className={inputCls} /></label>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <label className="text-xs text-sand-500">Duration (mins)<input type="number" min={10} max={600} value={durationMins} onChange={e => setDurationMins(Number(e.target.value) || 60)} className={inputCls} /></label>
              <label className="text-xs text-sand-500">Location (optional)<input value={location} onChange={e => setLocation(e.target.value)} maxLength={200} placeholder="In person / address" className={inputCls} /></label>
            </div>
            <input value={joinUrl} onChange={e => setJoinUrl(e.target.value)} maxLength={500} placeholder="Join link (optional, e.g. video call URL)" className={inputCls} />
            <textarea value={body} onChange={e => { setBody(e.target.value); resetConfirm() }} rows={4} maxLength={5000} placeholder="A note to include (optional)" className={inputCls} />
          </div>
        ) : (
          <div className="space-y-3">
            <input value={subject} onChange={e => { setSubject(e.target.value); resetConfirm() }} maxLength={160} placeholder="Subject" className={inputCls} />
            <textarea value={body} onChange={e => { setBody(e.target.value); resetConfirm() }} rows={8} maxLength={5000} placeholder="Write your update… (plain text — line breaks are kept)" className={inputCls} />
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3">
          <button onClick={saveTemplate} className="text-sm text-brand-700 hover:text-brand-800 underline underline-offset-4">Save as template</button>
          {templates.length > 0 && (
            <details className="text-sm">
              <summary className="text-sand-500 cursor-pointer">Manage templates ({templates.length})</summary>
              <ul className="mt-2 space-y-1">
                {templates.map(t => (
                  <li key={t.id} className="flex items-center justify-between gap-2 text-sand-600">
                    <span className="truncate">{t.name} <span className="text-sand-400 text-xs">· {t.channel === 'event' ? 'invite' : 'email'}</span></span>
                    <button onClick={() => deleteTemplate(t.id)} className="text-xs text-red-500 hover:text-red-700 shrink-0">Delete</button>
                  </li>
                ))}
              </ul>
            </details>
          )}
        </div>
      </div>

      {/* Recipients */}
      <div className="bg-white rounded-2xl border border-sand-200 p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-sand-900">Recipients <span className="text-sand-400 font-normal">· {selected.size} of {reachable}</span></h3>
          <div className="flex items-center gap-3 text-xs">
            <button onClick={selectRecent} className="text-brand-700 hover:text-brand-800">Recent only</button>
            <button onClick={selectAll} className="text-sand-500 hover:text-brand-700">All</button>
            <button onClick={selectNone} className="text-sand-500 hover:text-brand-700">None</button>
          </div>
        </div>
        {reachable === 0 ? (
          <p className="text-xs text-sand-400">No students with an email yet — invite or import students first.</p>
        ) : (
          <div className="max-h-72 overflow-y-auto divide-y divide-sand-100 -mx-1">
            {students.map(c => {
              const stale = (() => { const d = daysSince(c.lastSessionAt); return d === null || d > STALE_DAYS })()
              return (
                <label key={c.studentId} className="flex items-center gap-3 px-1 py-2 cursor-pointer">
                  <input type="checkbox" checked={selected.has(c.studentId)} onChange={() => toggle(c.studentId)} className="rounded border-sand-300 text-brand-600 focus:ring-brand-400" />
                  <span className="flex-1 min-w-0">
                    <span className="text-sm text-sand-800">{c.firstName} {c.lastName}</span>
                    <span className="text-xs text-sand-400 ml-2 truncate">{c.email}</span>
                  </span>
                  <span className={`text-xs shrink-0 ${stale ? 'text-amber-600' : 'text-sand-400'}`}>{lastSeenLabel(c.lastSessionAt)}</span>
                </label>
              )
            })}
          </div>
        )}
      </div>

      {/* Send */}
      <div className="bg-white rounded-2xl border border-sand-200 p-5 space-y-3">
        {error && <p className="text-sm text-red-600">{error}</p>}
        {done && <p className="text-sm text-brand-700">{done}</p>}
        {!confirming ? (
          <button onClick={() => setConfirming(true)} disabled={!canSend} className="bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-medium rounded-full px-6 py-2.5 text-sm transition">Review &amp; send</button>
        ) : (
          <div className="flex items-center gap-3">
            <button onClick={send} disabled={loading} className="bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-medium rounded-full px-6 py-2.5 text-sm transition">
              {loading ? 'Sending…' : `Send ${channel === 'event' ? 'invite' : 'email'} to ${selected.size} student${selected.size !== 1 ? 's' : ''}`}
            </button>
            <button onClick={resetConfirm} disabled={loading} className="text-sm text-sand-500 hover:text-brand-700">Cancel</button>
          </div>
        )}
        {!canSend && selected.size === 0 && <p className="text-xs text-sand-400">Select at least one student.</p>}
      </div>
    </div>
  )
}
