'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

type Row = { email: string; firstName?: string; customRatePence?: number }
type Summary = { created: number; alreadyClients: number; alreadyInvited: number; invalid: number }

function parseCsv(text: string): Row[] {
  const rows: Row[] = []
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim()
    if (!line) continue
    const cells = line.split(',').map(c => c.trim())
    const email = cells[0]?.toLowerCase()
    if (!email || email === 'email') continue // skip blanks + header
    const row: Row = { email }
    if (cells[1]) row.firstName = cells[1]
    if (cells[2]) {
      const pounds = parseFloat(cells[2].replace(/[£$,]/g, ''))
      if (!Number.isNaN(pounds) && pounds >= 0) row.customRatePence = Math.round(pounds * 100)
    }
    rows.push(row)
  }
  return rows
}

export default function ImportForm() {
  const router = useRouter()
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [summary, setSummary] = useState<Summary | null>(null)

  const parsedCount = parseCsv(text).length

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSummary(null)
    const rows = parseCsv(text)
    if (rows.length === 0) {
      setError('Add at least one client (email per line).')
      return
    }
    if (rows.length > 200) {
      setError('Please import up to 200 clients at a time.')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/practice/students/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rows }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(data.error ?? 'Import failed.')
        setLoading(false)
        return
      }
      setSummary(data as Summary)
      setText('')
      setLoading(false)
      router.refresh()
    } catch {
      setError('Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <label htmlFor="client-list" className="block text-sm font-medium text-sand-700">
        Your client list
      </label>
      <p className="text-xs text-sand-400 -mt-1">
        Type or paste one client per line, starting with their email. Nothing is sent until you press the button below.
      </p>
      <textarea
        id="client-list"
        value={text}
        onChange={e => setText(e.target.value)}
        rows={10}
        placeholder={'jane@example.com, Jane, 60\nsam@example.com, Sam\nalex@example.com'}
        className="w-full rounded-2xl border border-sand-300 px-4 py-3 text-sm font-mono focus:border-brand-400 focus:outline-none"
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
      {summary && (
        <div className="bg-brand-50 border border-brand-200 rounded-xl p-4 text-sm text-brand-800">
          <p><strong>{summary.created}</strong> invite{summary.created !== 1 ? 's' : ''} sent.</p>
          {(summary.alreadyClients > 0 || summary.alreadyInvited > 0 || summary.invalid > 0) && (
            <p className="text-brand-700/80 text-xs mt-1">
              {summary.alreadyClients > 0 && `${summary.alreadyClients} already your client. `}
              {summary.alreadyInvited > 0 && `${summary.alreadyInvited} already invited. `}
              {summary.invalid > 0 && `${summary.invalid} skipped (invalid email).`}
            </p>
          )}
        </div>
      )}
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={loading || parsedCount === 0}
          className="bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-medium rounded-full px-6 py-2.5 text-sm transition"
        >
          {loading ? 'Sending invites…' : parsedCount > 0 ? `Send ${parsedCount} invite${parsedCount !== 1 ? 's' : ''}` : 'Send invites'}
        </button>
        {summary && (
          <Link href="/teacher/students" className="text-sm text-brand-700 hover:underline">
            Back to clients →
          </Link>
        )}
      </div>
    </form>
  )
}
