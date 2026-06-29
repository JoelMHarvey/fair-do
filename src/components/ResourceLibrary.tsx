'use client'

import { useState, useRef } from 'react'

export type Resource = {
  id: string
  label: string
  url: string
  category: string
  uploadedBy: string
  studentVisible: boolean
  fileName: string | null
  fileSizeBytes: number | null
}

const MAX = 25 * 1024 * 1024
const CLOUD = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
const PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET

const CATS = [
  { v: 'worksheet', l: 'Worksheet' },
  { v: 'homework', l: 'Homework' },
  { v: 'past-paper', l: 'Past paper' },
  { v: 'notes', l: 'Notes' },
  { v: 'submission', l: 'Submitted work' },
  { v: 'other', l: 'Other' },
]
const CAT_LABEL = Object.fromEntries(CATS.map(c => [c.v, c.l]))

function fmtSize(b: number | null) {
  if (!b) return ''
  return b > 1_048_576 ? `${(b / 1_048_576).toFixed(1)} MB` : `${Math.max(1, Math.round(b / 1024))} KB`
}

export function ResourceLibrary({ matchId, role, initial }: { matchId: string; role: 'teacher' | 'student'; initial: Resource[] }) {
  const [items, setItems] = useState<Resource[]>(initial)
  const [category, setCategory] = useState(role === 'student' ? 'submission' : 'worksheet')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)
  const configured = !!CLOUD && !!PRESET

  async function upload(file: File) {
    setError('')
    if (file.size > MAX) { setError('File is larger than 25 MB.'); return }
    setBusy(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('upload_preset', PRESET!)
      const cres = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD}/auto/upload`, { method: 'POST', body: fd })
      if (!cres.ok) throw new Error('upload failed')
      const c = await cres.json() as { secure_url: string; bytes: number; original_filename: string }
      const res = await fetch('/api/resources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matchId, label: file.name, url: c.secure_url, category, fileName: file.name, fileSizeBytes: c.bytes }),
      })
      if (!res.ok) { const d = await res.json().catch(() => ({})); throw new Error(d.error ?? 'save failed') }
      const { document } = await res.json()
      setItems(prev => [...prev, document])
      if (fileRef.current) fileRef.current.value = ''
    } catch (e) {
      setError(e instanceof Error && e.message !== 'upload failed' ? e.message : 'Upload failed — try again.')
    }
    setBusy(false)
  }

  async function toggleVisible(r: Resource) {
    const next = !r.studentVisible
    setItems(prev => prev.map(x => x.id === r.id ? { ...x, studentVisible: next } : x))
    await fetch('/api/resources', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: r.id, studentVisible: next }) }).catch(() => {})
  }

  async function remove(id: string) {
    setItems(prev => prev.filter(x => x.id !== id))
    await fetch('/api/resources', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) }).catch(() => {})
  }

  return (
    <div>
      {items.length > 0 && (
        <div className="bg-white rounded-2xl border border-sand-200 overflow-hidden mb-3">
          {items.map((r, i) => (
            <div key={r.id} className={`flex items-center justify-between gap-3 px-4 py-3 ${i > 0 ? 'border-t border-sand-100' : ''}`}>
              <div className="min-w-0">
                <a href={r.url} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-brand-700 hover:underline truncate block">
                  📎 {r.label}
                </a>
                <span className="text-xs text-sand-400">
                  {CAT_LABEL[r.category] ?? r.category}
                  {r.fileSizeBytes ? ` · ${fmtSize(r.fileSizeBytes)}` : ''}
                  {r.uploadedBy === 'student' ? ' · from student' : ''}
                </span>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                {role === 'teacher' && (
                  <button onClick={() => toggleVisible(r)} className={`text-xs px-2 py-0.5 rounded-full ${r.studentVisible ? 'bg-brand-50 text-brand-700 border border-brand-200' : 'bg-sand-100 text-sand-500'}`}>
                    {r.studentVisible ? 'Visible to student' : 'Hidden'}
                  </button>
                )}
                {(role === 'teacher' || r.uploadedBy === 'student') && (
                  <button onClick={() => remove(r.id)} className="text-sand-400 hover:text-red-500 text-sm">Remove</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {configured ? (
        <div className="flex flex-wrap items-center gap-2">
          <select value={category} onChange={e => setCategory(e.target.value)} className="rounded-xl border border-sand-200 px-3 py-2 text-sm">
            {CATS.map(c => <option key={c.v} value={c.v}>{c.l}</option>)}
          </select>
          <input ref={fileRef} type="file" disabled={busy} onChange={e => { const f = e.target.files?.[0]; if (f) upload(f) }}
            className="text-sm text-sand-600 file:mr-3 file:rounded-lg file:border-0 file:bg-brand-600 file:text-white file:px-4 file:py-2 file:text-sm file:font-medium hover:file:bg-brand-700" />
          {busy && <span className="text-sm text-sand-500">Uploading…</span>}
        </div>
      ) : (
        <p className="text-sm text-sand-400">File uploads aren&rsquo;t configured yet.</p>
      )}
      {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
    </div>
  )
}
