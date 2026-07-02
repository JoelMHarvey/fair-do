'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type GroupOption = { id: string; name: string; manualCount: number | null }

const inputCls = 'w-full rounded-xl border border-sand-300 px-3 py-2.5 text-sm focus:border-brand-400 focus:outline-none'

export default function BroadcastComposer({ groups }: { groups: GroupOption[] }) {
  const router = useRouter()
  const [mailGroupId, setMailGroupId] = useState('')
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [confirming, setConfirming] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState<string | null>(null)

  const group = groups.find(g => g.id === mailGroupId)
  const canSend = !!mailGroupId && subject.trim().length > 0 && body.trim().length > 0
  const resetConfirm = () => setConfirming(false)

  async function send() {
    setLoading(true)
    setError(null)
    setDone(null)
    try {
      const res = await fetch('/api/school/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mailGroupId, subject: subject.trim(), body: body.trim() }),
      })
      if (res.status === 429) {
        setError('Sending limit reached (5 broadcasts per hour per school). Please try again later.')
        setLoading(false); setConfirming(false)
        return
      }
      const data = await res.json().catch(() => ({}))
      if (!res.ok) { setError(data.error ?? 'Could not send.'); setLoading(false); setConfirming(false); return }
      setDone(`Sent to ${data.recipientCount} recipient${data.recipientCount !== 1 ? 's' : ''}.`)
      setSubject(''); setBody('')
      setLoading(false); setConfirming(false)
      router.refresh()
    } catch {
      setError('Something went wrong. Please try again.')
      setLoading(false); setConfirming(false)
    }
  }

  if (groups.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-sand-200 p-5">
        <p className="text-sm text-sand-500">No mail groups yet — an admin can create one under <span className="font-medium">Mail groups</span>.</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-sand-200 p-5 space-y-3">
      <label className="block text-xs text-sand-500">
        Send to
        <select
          value={mailGroupId}
          onChange={e => { setMailGroupId(e.target.value); resetConfirm() }}
          className="mt-1 block w-full rounded-xl border border-sand-300 px-3 py-2.5 text-sm text-sand-700 focus:border-brand-400 focus:outline-none"
        >
          <option value="">Choose a mail group…</option>
          {groups.map(g => (
            <option key={g.id} value={g.id}>
              {g.name}{g.manualCount !== null ? ` (${g.manualCount})` : ''}
            </option>
          ))}
        </select>
      </label>

      <input value={subject} onChange={e => { setSubject(e.target.value); resetConfirm() }} maxLength={160} placeholder="Subject" className={inputCls} />
      <textarea value={body} onChange={e => { setBody(e.target.value); resetConfirm() }} rows={8} maxLength={5000} placeholder="Write your announcement… (plain text — line breaks are kept)" className={inputCls} />

      {error && <p className="text-sm text-red-600">{error}</p>}
      {done && <p className="text-sm text-brand-700">{done}</p>}

      {!confirming ? (
        <button onClick={() => setConfirming(true)} disabled={!canSend} className="bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-medium rounded-full px-6 py-2.5 text-sm transition">
          Review &amp; send
        </button>
      ) : (
        <div className="flex items-center gap-3">
          <button onClick={send} disabled={loading} className="bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-medium rounded-full px-6 py-2.5 text-sm transition">
            {loading ? 'Sending…' : `Send to "${group?.name}"`}
          </button>
          <button onClick={resetConfirm} disabled={loading} className="text-sm text-sand-500 hover:text-brand-700">Cancel</button>
        </div>
      )}
    </div>
  )
}
