'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AddClientForm({ defaultRatePence }: { defaultRatePence: number }) {
  const router = useRouter()
  const [managed, setManaged] = useState(false) // accountless client the therapist runs
  const [email, setEmail] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [customRate, setCustomRate] = useState('') // pounds, optional
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [okMsg, setOkMsg] = useState<string | null>(null)

  function resetFields() {
    setEmail(''); setFirstName(''); setLastName(''); setCustomRate(''); setNote('')
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setOkMsg(null)
    const ratePounds = parseFloat(customRate)
    const customRatePence = customRate.trim() && !Number.isNaN(ratePounds) ? Math.round(ratePounds * 100) : undefined
    try {
      let res: Response
      if (managed) {
        res = await fetch('/api/practice/students/managed', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ firstName: firstName.trim(), lastName: lastName.trim(), contactEmail: email.trim(), customRatePence }),
        })
      } else {
        // Invite one or many — split on commas / newlines.
        const emails = [...new Set(email.split(/[,\n]/).map(s => s.trim().toLowerCase()).filter(Boolean))]
        if (emails.length === 0) { setError('Enter at least one email.'); setLoading(false); return }
        const results = await Promise.all(emails.map(async addr => {
          const payload: Record<string, unknown> = { email: addr }
          if (emails.length === 1 && firstName.trim()) payload.firstName = firstName.trim()
          if (note.trim()) payload.note = note.trim()
          if (customRatePence != null) payload.customRatePence = customRatePence
          const r = await fetch('/api/practice/students', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
          return { addr, ok: r.ok }
        }))
        const failed = results.filter(r => !r.ok).map(r => r.addr)
        const sent = results.filter(r => r.ok).map(r => r.addr)
        if (failed.length) setError(`Couldn’t invite: ${failed.join(', ')}`)
        if (sent.length) setOkMsg(`Invite${sent.length > 1 ? 's' : ''} sent to ${sent.join(', ')}.`)
        resetFields()
        setLoading(false)
        router.refresh()
        return
      }
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(data.error ?? 'Couldn’t add the client.')
        setLoading(false)
        return
      }
      setOkMsg(`Added ${firstName.trim()} ${lastName.trim()}.`)
      resetFields()
      setLoading(false)
      router.refresh()
    } catch {
      setError('Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  const canSubmit = managed ? !!firstName.trim() && !!lastName.trim() : !!email.trim()

  return (
    <form onSubmit={submit} className="bg-white rounded-2xl border border-sand-200 p-5 space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <input
          type="email"
          multiple={!managed}
          required={!managed}
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder={managed ? 'Email (optional)' : 'Email — one or more, comma-separated'}
          className="rounded-xl border border-sand-300 px-3 py-2.5 text-sm focus:border-brand-400 focus:outline-none"
        />
        <input
          value={firstName}
          onChange={e => setFirstName(e.target.value)}
          placeholder={managed ? 'First name' : 'First name (optional)'}
          required={managed}
          className="rounded-xl border border-sand-300 px-3 py-2.5 text-sm focus:border-brand-400 focus:outline-none"
        />
      </div>
      {managed && (
        <input
          value={lastName}
          onChange={e => setLastName(e.target.value)}
          placeholder="Last name"
          required
          className="w-full rounded-xl border border-sand-300 px-3 py-2.5 text-sm focus:border-brand-400 focus:outline-none"
        />
      )}
      <div className="relative sm:w-1/2">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sand-400 text-sm">£</span>
        <input
          type="number"
          min="0"
          step="1"
          value={customRate}
          onChange={e => setCustomRate(e.target.value)}
          placeholder={`Rate per session — default ${(defaultRatePence / 100).toFixed(0)}`}
          className="w-full rounded-xl border border-sand-300 pl-7 pr-3 py-2.5 text-sm focus:border-brand-400 focus:outline-none"
        />
      </div>
      {!managed && (
        <input
          value={note}
          onChange={e => setNote(e.target.value)}
          placeholder="Personal note in the invite (optional)"
          maxLength={500}
          className="w-full rounded-xl border border-sand-300 px-3 py-2.5 text-sm focus:border-brand-400 focus:outline-none"
        />
      )}

      <label className="flex items-start gap-2 text-sm text-sand-600 cursor-pointer">
        <input
          type="checkbox"
          checked={managed}
          onChange={e => { setManaged(e.target.checked); setError(null); setOkMsg(null) }}
          className="mt-0.5 w-4 h-4 accent-brand-600"
        />
        <span>
          Manage without an account — they won’t log in; you handle their bookings and payments.
          {managed && <span className="block text-xs text-sand-400 mt-0.5">Only add someone who’s agreed to you managing their details.</span>}
        </span>
      </label>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {okMsg && <p className="text-sm text-brand-700">{okMsg}</p>}
      <button
        type="submit"
        disabled={loading || !canSubmit}
        className="bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-medium rounded-full px-6 py-2.5 text-sm transition"
      >
        {loading ? (managed ? 'Adding…' : 'Sending…') : managed ? 'Add client' : 'Send invite'}
      </button>
    </form>
  )
}
