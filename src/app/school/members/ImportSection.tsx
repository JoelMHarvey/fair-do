'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

// CSV import UI (M2.4). Two-step: "Preview" runs a server-side dry run
// (nothing written), then "Import" commits the same CSV in one transaction.

type RowResult = {
  line: number
  email: string | null
  name: string | null
  action: 'create' | 'link' | 'error'
  reason?: string
}
type ImportResponse = {
  dryRun: boolean
  results: RowResult[]
  summary: { create: number; link: number; error: number }
  willCreate?: { yearGroups: string[]; houses: string[]; classes: string[] }
}

const btnCls = 'bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white text-sm font-medium rounded-full px-5 py-2 transition'

export default function ImportSection() {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)
  const [csv, setCsv] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [preview, setPreview] = useState<ImportResponse | null>(null)
  const [done, setDone] = useState<ImportResponse | null>(null)

  async function run(commit: boolean) {
    setBusy(true)
    setError(null)
    if (commit) setDone(null)
    else setPreview(null)
    try {
      const res = await fetch('/api/school/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ csv, commit }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(data.error ?? 'Import failed')
        return
      }
      if (commit) {
        setDone(data as ImportResponse)
        setPreview(null)
        setCsv('')
        if (fileRef.current) fileRef.current.value = ''
        router.refresh()
      } else {
        setPreview(data as ImportResponse)
      }
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setPreview(null)
    setDone(null)
    const reader = new FileReader()
    reader.onload = () => setCsv(String(reader.result ?? ''))
    reader.readAsText(file)
  }

  const actionLabel = { create: 'Create student', link: 'Link existing', error: 'Error' } as const
  const actionCls = {
    create: 'text-brand-700 bg-brand-50 border-brand-200',
    link: 'text-sand-700 bg-sand-100 border-sand-200',
    error: 'text-red-700 bg-red-50 border-red-200',
  } as const

  return (
    <section className="bg-white rounded-xl border border-sand-200 p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-display text-lg text-sand-900">Import students from CSV</h2>
        <a href="/api/school/import?template=1" className="text-sm text-brand-600 hover:text-brand-700 font-medium">Download template ↓</a>
      </div>
      <p className="text-xs text-sand-500 mt-0.5 mb-4">
        Columns: firstName, lastName, email, yearGroup, house, class1, class2… Up to 500 students per file.
        Missing year groups, houses and classes are created for you — the preview shows exactly what will happen before anything is saved.
      </p>

      <div className="space-y-3">
        <input ref={fileRef} type="file" accept=".csv,text/csv" onChange={onFile} className="block text-sm text-sand-600" aria-label="CSV file" />
        <textarea
          value={csv}
          onChange={e => { setCsv(e.target.value); setPreview(null); setDone(null) }}
          rows={6}
          placeholder={'firstName,lastName,email,yearGroup,house,class1\nAda,Lovelace,ada@example.com,Year 9,Austen,9B'}
          className="w-full rounded-2xl border border-sand-300 px-4 py-3 text-sm font-mono focus:border-brand-400 focus:outline-none"
          aria-label="CSV contents"
        />

        {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-2">{error}</p>}

        {done && (
          <div className="bg-brand-50 border border-brand-200 rounded-xl p-4 text-sm text-brand-800">
            <p><strong>Import complete.</strong> {done.summary.create} created, {done.summary.link} linked{done.summary.error > 0 ? `, ${done.summary.error} skipped with errors` : ''}.</p>
          </div>
        )}

        {preview && (
          <div className="border border-sand-200 rounded-xl overflow-hidden">
            <div className="bg-sand-50 border-b border-sand-100 px-4 py-2.5 text-sm text-sand-700 flex flex-wrap gap-x-4 gap-y-1">
              <span><strong>{preview.summary.create}</strong> to create</span>
              <span><strong>{preview.summary.link}</strong> to link to existing students</span>
              <span className={preview.summary.error > 0 ? 'text-red-600' : ''}><strong>{preview.summary.error}</strong> errors</span>
            </div>
            {preview.willCreate && (preview.willCreate.yearGroups.length > 0 || preview.willCreate.houses.length > 0 || preview.willCreate.classes.length > 0) && (
              <p className="px-4 py-2 text-xs text-sand-600 border-b border-sand-100">
                Will also create:
                {preview.willCreate.yearGroups.length > 0 && <> year groups {preview.willCreate.yearGroups.join(', ')};</>}
                {preview.willCreate.houses.length > 0 && <> houses {preview.willCreate.houses.join(', ')};</>}
                {preview.willCreate.classes.length > 0 && <> classes {preview.willCreate.classes.join(', ')}</>}
              </p>
            )}
            <div className="max-h-72 overflow-y-auto">
              <table className="w-full text-sm">
                <tbody className="divide-y divide-sand-100">
                  {preview.results.map(r => (
                    <tr key={r.line}>
                      <td className="px-4 py-2 text-sand-400 w-14">#{r.line}</td>
                      <td className="px-4 py-2 text-sand-800">{r.name ?? '—'}</td>
                      <td className="px-4 py-2 text-sand-500 hidden sm:table-cell">{r.email ?? ''}</td>
                      <td className="px-4 py-2">
                        <span className={`inline-block text-xs border rounded-full px-2 py-0.5 ${actionCls[r.action]}`}>{actionLabel[r.action]}</span>
                        {r.reason && <span className="ml-2 text-xs text-red-600">{r.reason}</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="flex items-center gap-3">
          <button type="button" disabled={busy || !csv.trim()} onClick={() => run(false)} className="border border-brand-600 text-brand-700 hover:bg-brand-50 disabled:opacity-50 text-sm font-medium rounded-full px-5 py-2 transition">
            {busy && !preview ? 'Checking…' : 'Preview (dry run)'}
          </button>
          <button
            type="button"
            disabled={busy || !preview || preview.summary.create + preview.summary.link === 0}
            onClick={() => run(true)}
            className={btnCls}
          >
            {busy && preview ? 'Importing…' : preview ? `Import ${preview.summary.create + preview.summary.link} students` : 'Import'}
          </button>
        </div>
      </div>
    </section>
  )
}
