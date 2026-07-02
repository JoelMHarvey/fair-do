'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { SUBJECTS } from '@/lib/taxonomy'

// Client half of /school/structure — talks to /api/school/structure and
// refreshes the server-rendered lists after every successful write.

type YearGroup = { id: string; name: string; order: number }
type House = { id: string; name: string; color: string | null }
type SchoolClass = { id: string; name: string; kind: string; yearGroupId: string | null; subjectId: string | null }
type OrgSubject = { id: string; name: string; marketplaceKey: string | null; examBoard: string | null }

const EXAM_BOARDS = ['AQA', 'Edexcel', 'OCR', 'WJEC', 'Other'] as const

const inputCls = 'rounded-lg border border-sand-300 px-3 py-1.5 text-sm focus:border-brand-400 focus:outline-none'
const btnCls = 'bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white text-sm font-medium rounded-full px-4 py-1.5 transition'
const smallBtnCls = 'text-xs text-sand-500 hover:text-brand-700 transition'

export default function StructureManager({ yearGroups, houses, classes, subjects }: {
  yearGroups: YearGroup[]
  houses: House[]
  classes: SchoolClass[]
  subjects: OrgSubject[]
}) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function call(method: 'POST' | 'PATCH' | 'DELETE', body: unknown): Promise<boolean> {
    setBusy(true)
    setError(null)
    try {
      const res = await fetch('/api/school/structure', {
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

  const yearName = (id: string | null) => yearGroups.find(y => y.id === id)?.name ?? '—'
  const subjectName = (id: string | null) => subjects.find(s => s.id === id)?.name ?? '—'

  return (
    <div className="space-y-6">
      {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-2">{error}</p>}

      {(yearGroups.length === 0 || subjects.length === 0) && (
        <section className="bg-brand-50 border border-brand-200 rounded-xl p-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-medium text-brand-800">Starting from scratch?</p>
            <p className="text-sm text-sand-600">One click adds Years 7–13 and the common GCSE / A-level subjects. You can rename or delete anything after.</p>
          </div>
          <button type="button" disabled={busy} onClick={() => call('POST', { entity: 'preset', preset: 'uk-secondary' })} className={btnCls}>
            Apply UK secondary preset
          </button>
        </section>
      )}

      <YearGroupSection yearGroups={yearGroups} busy={busy} call={call} />
      <HouseSection houses={houses} busy={busy} call={call} />
      <ClassSection classes={classes} yearGroups={yearGroups} subjects={subjects} yearName={yearName} subjectName={subjectName} busy={busy} call={call} />
      <SubjectSection subjects={subjects} busy={busy} call={call} />
    </div>
  )
}

type Call = (method: 'POST' | 'PATCH' | 'DELETE', body: unknown) => Promise<boolean>

function Section({ title, hint, children }: { title: string; hint: string; children: React.ReactNode }) {
  return (
    <section className="bg-white rounded-xl border border-sand-200 p-6">
      <h2 className="font-display text-lg text-sand-900">{title}</h2>
      <p className="text-xs text-sand-500 mt-0.5 mb-4">{hint}</p>
      {children}
    </section>
  )
}

function RowActions({ editing, busy, onEdit, onSave, onCancel, onDelete }: {
  editing: boolean; busy: boolean; onEdit: () => void; onSave: () => void; onCancel: () => void; onDelete: () => void
}) {
  return (
    <span className="flex items-center gap-3 shrink-0">
      {editing ? (
        <>
          <button type="button" disabled={busy} onClick={onSave} className="text-xs font-medium text-brand-700 hover:text-brand-800">Save</button>
          <button type="button" disabled={busy} onClick={onCancel} className={smallBtnCls}>Cancel</button>
        </>
      ) : (
        <>
          <button type="button" disabled={busy} onClick={onEdit} className={smallBtnCls}>Edit</button>
          <button type="button" disabled={busy} onClick={onDelete} className="text-xs text-sand-400 hover:text-red-600 transition">Delete</button>
        </>
      )}
    </span>
  )
}

function YearGroupSection({ yearGroups, busy, call }: { yearGroups: YearGroup[]; busy: boolean; call: Call }) {
  const [name, setName] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [draft, setDraft] = useState({ name: '', order: 0 })

  return (
    <Section title="Year groups" hint="Sorted by the order number — Year 7 = 7 keeps them in school order.">
      <ul className="divide-y divide-sand-100 mb-4">
        {yearGroups.map(y => (
          <li key={y.id} className="flex items-center justify-between gap-3 py-2">
            {editingId === y.id ? (
              <span className="flex items-center gap-2 flex-1">
                <input value={draft.name} onChange={e => setDraft({ ...draft, name: e.target.value })} className={`${inputCls} flex-1`} aria-label="Year group name" />
                <input type="number" min={0} value={draft.order} onChange={e => setDraft({ ...draft, order: Number(e.target.value) })} className={`${inputCls} w-20`} aria-label="Order" />
              </span>
            ) : (
              <span className="text-sm text-sand-800">{y.name} <span className="text-xs text-sand-400">· order {y.order}</span></span>
            )}
            <RowActions
              editing={editingId === y.id}
              busy={busy}
              onEdit={() => { setEditingId(y.id); setDraft({ name: y.name, order: y.order }) }}
              onSave={async () => { if (await call('PATCH', { entity: 'year', id: y.id, name: draft.name, order: draft.order })) setEditingId(null) }}
              onCancel={() => setEditingId(null)}
              onDelete={() => call('DELETE', { entity: 'year', id: y.id })}
            />
          </li>
        ))}
        {yearGroups.length === 0 && <li className="py-2 text-sm text-sand-400">No year groups yet.</li>}
      </ul>
      <form
        onSubmit={async e => {
          e.preventDefault()
          // New years default to the next order slot so they land at the bottom.
          if (await call('POST', { entity: 'year', name, order: (yearGroups.at(-1)?.order ?? 0) + 1 })) setName('')
        }}
        className="flex gap-2"
      >
        <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Year 7" className={`${inputCls} flex-1`} aria-label="New year group name" />
        <button type="submit" disabled={busy || !name.trim()} className={btnCls}>Add year group</button>
      </form>
    </Section>
  )
}

function HouseSection({ houses, busy, call }: { houses: House[]; busy: boolean; call: Call }) {
  const [name, setName] = useState('')
  const [color, setColor] = useState('#b91c1c')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [draft, setDraft] = useState({ name: '', color: '#b91c1c' })

  return (
    <Section title="Houses" hint="Optional — shown as coloured chips on member rows and usable in mail groups.">
      <ul className="divide-y divide-sand-100 mb-4">
        {houses.map(h => (
          <li key={h.id} className="flex items-center justify-between gap-3 py-2">
            {editingId === h.id ? (
              <span className="flex items-center gap-2 flex-1">
                <input value={draft.name} onChange={e => setDraft({ ...draft, name: e.target.value })} className={`${inputCls} flex-1`} aria-label="House name" />
                <input type="color" value={draft.color} onChange={e => setDraft({ ...draft, color: e.target.value })} className="h-8 w-10 rounded border border-sand-300" aria-label="House colour" />
              </span>
            ) : (
              <span className="flex items-center gap-2 text-sm text-sand-800">
                <span className="w-3 h-3 rounded-full border border-sand-200" style={{ backgroundColor: h.color ?? '#e7e0d8' }} aria-hidden />
                {h.name}
              </span>
            )}
            <RowActions
              editing={editingId === h.id}
              busy={busy}
              onEdit={() => { setEditingId(h.id); setDraft({ name: h.name, color: h.color ?? '#b91c1c' }) }}
              onSave={async () => { if (await call('PATCH', { entity: 'house', id: h.id, name: draft.name, color: draft.color })) setEditingId(null) }}
              onCancel={() => setEditingId(null)}
              onDelete={() => call('DELETE', { entity: 'house', id: h.id })}
            />
          </li>
        ))}
        {houses.length === 0 && <li className="py-2 text-sm text-sand-400">No houses yet.</li>}
      </ul>
      <form
        onSubmit={async e => {
          e.preventDefault()
          if (await call('POST', { entity: 'house', name, color })) setName('')
        }}
        className="flex gap-2"
      >
        <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Churchill" className={`${inputCls} flex-1`} aria-label="New house name" />
        <input type="color" value={color} onChange={e => setColor(e.target.value)} className="h-9 w-11 rounded border border-sand-300" aria-label="New house colour" />
        <button type="submit" disabled={busy || !name.trim()} className={btnCls}>Add house</button>
      </form>
    </Section>
  )
}

function ClassSection({ classes, yearGroups, subjects, yearName, subjectName, busy, call }: {
  classes: SchoolClass[]
  yearGroups: YearGroup[]
  subjects: OrgSubject[]
  yearName: (id: string | null) => string
  subjectName: (id: string | null) => string
  busy: boolean
  call: Call
}) {
  const empty = { name: '', kind: 'form', yearGroupId: '', subjectId: '' }
  const [add, setAdd] = useState(empty)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [draft, setDraft] = useState(empty)

  const fields = (state: typeof empty, set: (v: typeof empty) => void, idPrefix: string) => (
    <>
      <input value={state.name} onChange={e => set({ ...state, name: e.target.value })} placeholder="e.g. 10B or Set 1 Maths" className={`${inputCls} flex-1 min-w-32`} aria-label={`${idPrefix} class name`} />
      <select value={state.kind} onChange={e => set({ ...state, kind: e.target.value })} className={inputCls} aria-label={`${idPrefix} class kind`}>
        <option value="form">Form group</option>
        <option value="set">Teaching set</option>
      </select>
      <select value={state.yearGroupId} onChange={e => set({ ...state, yearGroupId: e.target.value })} className={inputCls} aria-label={`${idPrefix} class year group`}>
        <option value="">No year group</option>
        {yearGroups.map(y => <option key={y.id} value={y.id}>{y.name}</option>)}
      </select>
      <select value={state.subjectId} onChange={e => set({ ...state, subjectId: e.target.value })} className={inputCls} aria-label={`${idPrefix} class subject`}>
        <option value="">No subject</option>
        {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
      </select>
    </>
  )

  return (
    <Section title="Classes" hint="Form groups (10B) and teaching sets (Set 1 Maths). Sets can carry a year group and subject.">
      <ul className="divide-y divide-sand-100 mb-4">
        {classes.map(c => (
          <li key={c.id} className="flex flex-wrap items-center justify-between gap-3 py-2">
            {editingId === c.id ? (
              <span className="flex flex-wrap items-center gap-2 flex-1">{fields(draft, setDraft, 'Edit')}</span>
            ) : (
              <span className="text-sm text-sand-800">
                {c.name}{' '}
                <span className="text-xs text-sand-400">
                  · {c.kind === 'set' ? 'set' : 'form'}{c.yearGroupId ? ` · ${yearName(c.yearGroupId)}` : ''}{c.subjectId ? ` · ${subjectName(c.subjectId)}` : ''}
                </span>
              </span>
            )}
            <RowActions
              editing={editingId === c.id}
              busy={busy}
              onEdit={() => { setEditingId(c.id); setDraft({ name: c.name, kind: c.kind, yearGroupId: c.yearGroupId ?? '', subjectId: c.subjectId ?? '' }) }}
              onSave={async () => {
                const ok = await call('PATCH', { entity: 'class', id: c.id, name: draft.name, kind: draft.kind, yearGroupId: draft.yearGroupId || null, subjectId: draft.subjectId || null })
                if (ok) setEditingId(null)
              }}
              onCancel={() => setEditingId(null)}
              onDelete={() => call('DELETE', { entity: 'class', id: c.id })}
            />
          </li>
        ))}
        {classes.length === 0 && <li className="py-2 text-sm text-sand-400">No classes yet.</li>}
      </ul>
      <form
        onSubmit={async e => {
          e.preventDefault()
          const ok = await call('POST', { entity: 'class', name: add.name, kind: add.kind, yearGroupId: add.yearGroupId || null, subjectId: add.subjectId || null })
          if (ok) setAdd(empty)
        }}
        className="flex flex-wrap gap-2"
      >
        {fields(add, setAdd, 'New')}
        <button type="submit" disabled={busy || !add.name.trim()} className={btnCls}>Add class</button>
      </form>
    </Section>
  )
}

function SubjectSection({ subjects, busy, call }: { subjects: OrgSubject[]; busy: boolean; call: Call }) {
  const empty = { name: '', marketplaceKey: '', examBoard: '' }
  const [add, setAdd] = useState(empty)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [draft, setDraft] = useState(empty)

  const fields = (state: typeof empty, set: (v: typeof empty) => void, idPrefix: string) => (
    <>
      <input value={state.name} onChange={e => set({ ...state, name: e.target.value })} placeholder="e.g. Mathematics" className={`${inputCls} flex-1 min-w-32`} aria-label={`${idPrefix} subject name`} />
      <select value={state.marketplaceKey} onChange={e => set({ ...state, marketplaceKey: e.target.value })} className={inputCls} aria-label={`${idPrefix} marketplace subject`}>
        <option value="">No marketplace mapping</option>
        {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
      </select>
      <select value={state.examBoard} onChange={e => set({ ...state, examBoard: e.target.value })} className={inputCls} aria-label={`${idPrefix} exam board`}>
        <option value="">No exam board</option>
        {EXAM_BOARDS.map(b => <option key={b} value={b}>{b}</option>)}
      </select>
    </>
  )

  return (
    <Section title="Subjects" hint="Map each subject to a fair-do marketplace subject so tutor matching keeps working for your students.">
      <ul className="divide-y divide-sand-100 mb-4">
        {subjects.map(s => (
          <li key={s.id} className="flex flex-wrap items-center justify-between gap-3 py-2">
            {editingId === s.id ? (
              <span className="flex flex-wrap items-center gap-2 flex-1">{fields(draft, setDraft, 'Edit')}</span>
            ) : (
              <span className="text-sm text-sand-800">
                {s.name}{' '}
                <span className="text-xs text-sand-400">
                  {s.marketplaceKey ? `· matches “${s.marketplaceKey}”` : '· not mapped'}{s.examBoard ? ` · ${s.examBoard}` : ''}
                </span>
              </span>
            )}
            <RowActions
              editing={editingId === s.id}
              busy={busy}
              onEdit={() => { setEditingId(s.id); setDraft({ name: s.name, marketplaceKey: s.marketplaceKey ?? '', examBoard: s.examBoard ?? '' }) }}
              onSave={async () => {
                const ok = await call('PATCH', { entity: 'subject', id: s.id, name: draft.name, marketplaceKey: draft.marketplaceKey || null, examBoard: draft.examBoard || null })
                if (ok) setEditingId(null)
              }}
              onCancel={() => setEditingId(null)}
              onDelete={() => call('DELETE', { entity: 'subject', id: s.id })}
            />
          </li>
        ))}
        {subjects.length === 0 && <li className="py-2 text-sm text-sand-400">No subjects yet.</li>}
      </ul>
      <form
        onSubmit={async e => {
          e.preventDefault()
          const ok = await call('POST', { entity: 'subject', name: add.name, marketplaceKey: add.marketplaceKey || null, examBoard: add.examBoard || null })
          if (ok) setAdd(empty)
        }}
        className="flex flex-wrap gap-2"
      >
        {fields(add, setAdd, 'New')}
        <button type="submit" disabled={busy || !add.name.trim()} className={btnCls}>Add subject</button>
      </form>
    </Section>
  )
}
