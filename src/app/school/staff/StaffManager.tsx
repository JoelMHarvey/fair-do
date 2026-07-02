'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

// Client half of /school/staff — CRUD + up/down ordering against
// /api/school/staff.

type Staff = {
  id: string
  name: string
  title: string
  department: string | null
  email: string
  phone: string | null
  photoUrl: string | null
  isDSL: boolean
  isTutoringCoordinator: boolean
  visibility: string
}

type Draft = {
  name: string
  title: string
  department: string
  email: string
  phone: string
  photoUrl: string
  isDSL: boolean
  isTutoringCoordinator: boolean
  visibility: string
}

const EMPTY: Draft = { name: '', title: '', department: '', email: '', phone: '', photoUrl: '', isDSL: false, isTutoringCoordinator: false, visibility: 'parents' }

const VISIBILITY_OPTIONS = [
  { value: 'public', label: 'Public — anyone' },
  { value: 'parents', label: 'Parents & students' },
  { value: 'students', label: 'Students' },
  { value: 'tutors', label: 'Tutors only' },
]

const inputCls = 'rounded-lg border border-sand-300 px-3 py-1.5 text-sm focus:border-brand-400 focus:outline-none'
const btnCls = 'bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white text-sm font-medium rounded-full px-4 py-1.5 transition'

export default function StaffManager({ staff }: { staff: Staff[] }) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [add, setAdd] = useState<Draft>(EMPTY)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [draft, setDraft] = useState<Draft>(EMPTY)

  async function call(method: 'POST' | 'PATCH' | 'DELETE', body: unknown): Promise<boolean> {
    setBusy(true)
    setError(null)
    try {
      const res = await fetch('/api/school/staff', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data.error ?? 'Something went wrong')
        return false
      }
      router.refresh()
      return true
    } catch {
      setError('Something went wrong. Please try again.')
      return false
    } finally {
      setBusy(false)
    }
  }

  const toBody = (d: Draft) => ({
    name: d.name,
    title: d.title,
    department: d.department || null,
    email: d.email,
    phone: d.phone || null,
    photoUrl: d.photoUrl || null,
    isDSL: d.isDSL,
    isTutoringCoordinator: d.isTutoringCoordinator,
    visibility: d.visibility,
  })

  const fields = (state: Draft, set: (v: Draft) => void, prefix: string) => (
    <div className="grid sm:grid-cols-2 gap-2">
      <input value={state.name} onChange={e => set({ ...state, name: e.target.value })} placeholder="Name" className={inputCls} aria-label={`${prefix} name`} />
      <input value={state.title} onChange={e => set({ ...state, title: e.target.value })} placeholder="Role / title, e.g. Head of Year 10" className={inputCls} aria-label={`${prefix} title`} />
      <input value={state.department} onChange={e => set({ ...state, department: e.target.value })} placeholder="Department (optional)" className={inputCls} aria-label={`${prefix} department`} />
      <input type="email" value={state.email} onChange={e => set({ ...state, email: e.target.value })} placeholder="Email" className={inputCls} aria-label={`${prefix} email`} />
      <input value={state.phone} onChange={e => set({ ...state, phone: e.target.value })} placeholder="Phone (optional)" className={inputCls} aria-label={`${prefix} phone`} />
      <input value={state.photoUrl} onChange={e => set({ ...state, photoUrl: e.target.value })} placeholder="Photo URL (Cloudinary, optional)" className={inputCls} aria-label={`${prefix} photo URL`} />
      <select value={state.visibility} onChange={e => set({ ...state, visibility: e.target.value })} className={inputCls} aria-label={`${prefix} visibility`}>
        {VISIBILITY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      <div className="flex items-center gap-4 text-sm text-sand-700">
        <label className="inline-flex items-center gap-1.5">
          <input type="checkbox" checked={state.isDSL} onChange={e => set({ ...state, isDSL: e.target.checked })} />
          Safeguarding lead (DSL)
        </label>
        <label className="inline-flex items-center gap-1.5">
          <input type="checkbox" checked={state.isTutoringCoordinator} onChange={e => set({ ...state, isTutoringCoordinator: e.target.checked })} />
          Tutoring coordinator
        </label>
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-2">{error}</p>}

      <section className="bg-white rounded-xl border border-sand-200 divide-y divide-sand-100">
        {staff.length === 0 && <p className="px-6 py-6 text-sm text-sand-400">No staff contacts yet — add your first below.</p>}
        {staff.map((s, i) => (
          <div key={s.id} className="px-6 py-4">
            {editingId === s.id ? (
              <form
                onSubmit={async e => {
                  e.preventDefault()
                  if (await call('PATCH', { id: s.id, ...toBody(draft) })) setEditingId(null)
                }}
                className="space-y-3"
              >
                {fields(draft, setDraft, 'Edit')}
                <div className="flex gap-3">
                  <button type="submit" disabled={busy} className={btnCls}>Save</button>
                  <button type="button" disabled={busy} onClick={() => setEditingId(null)} className="text-sm text-sand-500 hover:text-brand-700">Cancel</button>
                </div>
              </form>
            ) : (
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sand-900 font-medium">
                    {s.name}
                    {s.isDSL && <span className="ml-2 text-[10px] uppercase tracking-wide bg-coral-50 text-coral-600 border border-coral-200 rounded-full px-2 py-0.5">DSL</span>}
                    {s.isTutoringCoordinator && <span className="ml-2 text-[10px] uppercase tracking-wide bg-brand-50 text-brand-700 border border-brand-200 rounded-full px-2 py-0.5">Tutoring coordinator</span>}
                  </p>
                  <p className="text-sm text-sand-600">{s.title}{s.department ? ` · ${s.department}` : ''}</p>
                  <p className="text-xs text-sand-400 mt-0.5">
                    {s.email}{s.phone ? ` · ${s.phone}` : ''} · visible to: {VISIBILITY_OPTIONS.find(o => o.value === s.visibility)?.label ?? s.visibility}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button type="button" disabled={busy || i === 0} onClick={() => call('PATCH', { id: s.id, move: 'up' })} className="text-sand-400 hover:text-brand-700 disabled:opacity-30" aria-label={`Move ${s.name} up`}>↑</button>
                  <button type="button" disabled={busy || i === staff.length - 1} onClick={() => call('PATCH', { id: s.id, move: 'down' })} className="text-sand-400 hover:text-brand-700 disabled:opacity-30" aria-label={`Move ${s.name} down`}>↓</button>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => {
                      setEditingId(s.id)
                      setDraft({
                        name: s.name,
                        title: s.title,
                        department: s.department ?? '',
                        email: s.email,
                        phone: s.phone ?? '',
                        photoUrl: s.photoUrl ?? '',
                        isDSL: s.isDSL,
                        isTutoringCoordinator: s.isTutoringCoordinator,
                        visibility: s.visibility,
                      })
                    }}
                    className="text-xs text-sand-500 hover:text-brand-700 transition"
                  >
                    Edit
                  </button>
                  <button type="button" disabled={busy} onClick={() => call('DELETE', { id: s.id })} className="text-xs text-sand-400 hover:text-red-600 transition">Delete</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </section>

      <section className="bg-white rounded-xl border border-sand-200 p-6">
        <h2 className="font-display text-lg text-sand-900 mb-4">Add a staff contact</h2>
        <form
          onSubmit={async e => {
            e.preventDefault()
            if (await call('POST', toBody(add))) setAdd(EMPTY)
          }}
          className="space-y-3"
        >
          {fields(add, setAdd, 'New')}
          <button type="submit" disabled={busy || !add.name.trim() || !add.title.trim() || !add.email.trim()} className={btnCls}>Add contact</button>
        </form>
      </section>
    </div>
  )
}
