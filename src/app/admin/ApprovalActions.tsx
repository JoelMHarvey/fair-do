'use client'

import { useState } from 'react'

const CHECKS = [
  { key: 'name', label: 'Name matches qualification records' },
  { key: 'number', label: 'Qualification reference verified' },
  { key: 'inDate', label: 'Qualification is current (not expired/lapsed)' },
] as const

type CheckKey = (typeof CHECKS)[number]['key']

export default function ApprovalActions({
  teacherId,
  teacherName,
}: {
  teacherId: string
  teacherName: string
}) {
  const [checks, setChecks] = useState<Record<CheckKey, boolean>>({ name: false, number: false, inDate: false })
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState<'approve' | 'reject' | null>(null)
  const [done, setDone] = useState<'approved' | 'rejected' | null>(null)
  const [error, setError] = useState('')

  // Ad-hoc "email the tutor" compose (e.g. ask for a certificate before approving).
  const [emailing, setEmailing] = useState(false)
  const [emSubject, setEmSubject] = useState('Your fair-do application')
  const [emBody, setEmBody] = useState('')
  const [emStatus, setEmStatus] = useState<'sending' | 'sent' | null>(null)
  const [emError, setEmError] = useState('')

  const allChecked = CHECKS.every(c => checks[c.key])

  async function sendTherapistEmail() {
    setEmError('')
    if (!emSubject.trim() || !emBody.trim()) { setEmError('Add a subject and a message.'); return }
    setEmStatus('sending')
    const res = await fetch('/api/admin/therapist/email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ teacherId, subject: emSubject.trim(), body: emBody.trim() }),
    })
    if (res.ok) {
      setEmStatus('sent'); setEmBody('')
      setTimeout(() => { setEmailing(false); setEmStatus(null) }, 1500)
    } else {
      setEmStatus(null)
      const d = await res.json().catch(() => ({}))
      setEmError(d.error ?? 'Could not send.')
    }
  }

  async function act(action: 'approve' | 'reject') {
    setError('')
    // Approve needs the checklist; reject needs a written reason — both keep the audit log meaningful.
    if (action === 'approve' && !allChecked) { setError('Tick all three checks before approving.'); return }
    if (action === 'reject' && !notes.trim()) { setError('Add a reason before rejecting.'); return }

    const auditNotes = action === 'approve'
      ? ['Qualification verified — name ✓ · ref ✓ · in-date ✓', notes.trim()].filter(Boolean).join(' — ')
      : notes.trim()

    setLoading(action)
    const res = await fetch('/api/admin/therapist/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ teacherId, action, notes: auditNotes }),
    })
    setLoading(null)
    if (res.ok) setDone(action === 'approve' ? 'approved' : 'rejected')
    else setError('Something went wrong — try again.')
  }

  if (done) {
    return (
      <span className={`inline-block text-sm font-medium px-3 py-1.5 rounded-lg ${
        done === 'approved' ? 'bg-brand-100 text-brand-700' : 'bg-red-100 text-red-700'
      }`}>
        {done === 'approved' ? `Approved ✓ — ${teacherName} is now active` : `Rejected ✗ — ${teacherName}`}
      </span>
    )
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-1.5">
        {CHECKS.map(c => (
          <label key={c.key} className="flex items-start gap-2 cursor-pointer text-sm text-sand-700">
            <input
              type="checkbox"
              checked={checks[c.key]}
              onChange={e => setChecks(prev => ({ ...prev, [c.key]: e.target.checked }))}
              className="mt-0.5 w-4 h-4 accent-brand-600 shrink-0"
            />
            {c.label}
          </label>
        ))}
      </div>

      <textarea
        value={notes}
        onChange={e => setNotes(e.target.value)}
        placeholder="Notes (optional for approve, required reason for reject) — e.g. register status, anything unusual"
        rows={2}
        className="w-full text-sm border border-sand-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent"
      />

      {error && <p className="text-sm text-red-600">{error}</p>}

      {emailing && (
        <div className="rounded-lg border border-sand-200 bg-sand-50/60 p-3 space-y-2">
          <input
            value={emSubject}
            onChange={e => setEmSubject(e.target.value)}
            maxLength={160}
            placeholder="Subject"
            className="w-full text-sm border border-sand-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-400"
          />
          <textarea
            value={emBody}
            onChange={e => setEmBody(e.target.value)}
            rows={4}
            maxLength={5000}
            placeholder={`Message to ${teacherName} — e.g. "Please upload your qualification certificate so we can finish your verification."`}
            className="w-full text-sm border border-sand-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-400"
          />
          {emError && <p className="text-sm text-red-600">{emError}</p>}
          <div className="flex items-center gap-2">
            <button
              onClick={sendTherapistEmail}
              disabled={emStatus === 'sending'}
              className="px-4 py-1.5 text-sm bg-brand-600 text-white rounded-lg hover:bg-brand-700 disabled:opacity-50"
            >
              {emStatus === 'sending' ? 'Sending…' : emStatus === 'sent' ? 'Sent ✓' : 'Send email'}
            </button>
            <button onClick={() => { setEmailing(false); setEmError('') }} className="text-sm text-sand-500 hover:text-brand-700">Cancel</button>
          </div>
        </div>
      )}

      <div className="flex gap-2">
        <button
          onClick={() => setEmailing(v => !v)}
          disabled={loading !== null}
          className="px-4 py-2 text-sm border border-sand-200 text-sand-600 rounded-lg hover:bg-sand-50 transition disabled:opacity-50"
        >
          Email
        </button>
        <button
          onClick={() => act('reject')}
          disabled={loading !== null}
          className="px-4 py-2 text-sm border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition disabled:opacity-50"
        >
          {loading === 'reject' ? '…' : 'Reject'}
        </button>
        <button
          onClick={() => act('approve')}
          disabled={loading !== null || !allChecked}
          title={allChecked ? '' : 'Tick all three checks first'}
          className="px-5 py-2 text-sm bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition disabled:opacity-40"
        >
          {loading === 'approve' ? '…' : 'Approve'}
        </button>
      </div>
    </div>
  )
}
