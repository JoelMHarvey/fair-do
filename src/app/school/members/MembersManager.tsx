'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

// Client half of /school/members — add-single-student form plus per-row
// year/house/class assignment against /api/school/members.

type Member = {
  id: string
  firstName: string
  lastName: string
  email: string | null
  managed: boolean
  yearGroupId: string | null
  houseId: string | null
  classIds: string[]
}
type Named = { id: string; name: string }
type House = { id: string; name: string; color: string | null }

const inputCls = 'rounded-lg border border-sand-300 px-3 py-1.5 text-sm focus:border-brand-400 focus:outline-none'
const btnCls = 'bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white text-sm font-medium rounded-full px-4 py-1.5 transition'

export default function MembersManager({ members, yearGroups, houses, classes }: {
  members: Member[]
  yearGroups: Named[]
  houses: House[]
  classes: Named[]
}) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [add, setAdd] = useState({ firstName: '', lastName: '', contactEmail: '' })
  const [openId, setOpenId] = useState<string | null>(null)

  async function call(method: 'POST' | 'PATCH', body: unknown): Promise<boolean> {
    setBusy(true)
    setError(null)
    try {
      const res = await fetch('/api/school/members', {
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

  const yearName = (id: string | null) => yearGroups.find(y => y.id === id)?.name
  const house = (id: string | null) => houses.find(h => h.id === id)
  const className = (id: string) => classes.find(c => c.id === id)?.name

  return (
    <div className="space-y-6">
      {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-2">{error}</p>}

      <section className="bg-white rounded-xl border border-sand-200 p-6">
        <h2 className="font-display text-lg text-sand-900">Add a student</h2>
        <p className="text-xs text-sand-500 mt-0.5 mb-4">
          Creates a managed record (no login needed) — the contact email is used for booking and receipt emails.
        </p>
        <form
          onSubmit={async e => {
            e.preventDefault()
            if (await call('POST', { firstName: add.firstName, lastName: add.lastName, contactEmail: add.contactEmail })) {
              setAdd({ firstName: '', lastName: '', contactEmail: '' })
            }
          }}
          className="flex flex-wrap gap-2"
        >
          <input value={add.firstName} onChange={e => setAdd({ ...add, firstName: e.target.value })} placeholder="First name" className={`${inputCls} flex-1 min-w-32`} aria-label="First name" />
          <input value={add.lastName} onChange={e => setAdd({ ...add, lastName: e.target.value })} placeholder="Last name" className={`${inputCls} flex-1 min-w-32`} aria-label="Last name" />
          <input type="email" value={add.contactEmail} onChange={e => setAdd({ ...add, contactEmail: e.target.value })} placeholder="Contact email (optional)" className={`${inputCls} flex-1 min-w-48`} aria-label="Contact email" />
          <button type="submit" disabled={busy || !add.firstName.trim() || !add.lastName.trim()} className={btnCls}>Add student</button>
        </form>
      </section>

      <section className="bg-white rounded-xl border border-sand-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-sand-50 border-b border-sand-100">
            <tr>
              <th className="text-left px-4 py-2.5 font-medium text-sand-600">Student</th>
              <th className="text-left px-4 py-2.5 font-medium text-sand-600 hidden sm:table-cell">Email</th>
              <th className="text-left px-4 py-2.5 font-medium text-sand-600">Year</th>
              <th className="text-left px-4 py-2.5 font-medium text-sand-600 hidden md:table-cell">House</th>
              <th className="text-left px-4 py-2.5 font-medium text-sand-600 hidden md:table-cell">Classes</th>
              <th className="px-4 py-2.5" />
            </tr>
          </thead>
          <tbody className="divide-y divide-sand-100">
            {members.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-6 text-center text-sand-400">No students yet — add one above or import a CSV below.</td></tr>
            )}
            {members.map(m => (
              <MemberRow
                key={m.id}
                member={m}
                open={openId === m.id}
                onToggle={() => setOpenId(openId === m.id ? null : m.id)}
                yearGroups={yearGroups}
                houses={houses}
                classes={classes}
                yearName={yearName}
                house={house}
                className={className}
                busy={busy}
                call={call}
              />
            ))}
          </tbody>
        </table>
      </section>
    </div>
  )
}

function MemberRow({ member: m, open, onToggle, yearGroups, houses, classes, yearName, house, className, busy, call }: {
  member: Member
  open: boolean
  onToggle: () => void
  yearGroups: Named[]
  houses: House[]
  classes: Named[]
  yearName: (id: string | null) => string | undefined
  house: (id: string | null) => House | undefined
  className: (id: string) => string | undefined
  busy: boolean
  call: (method: 'POST' | 'PATCH', body: unknown) => Promise<boolean>
}) {
  const h = house(m.houseId)
  const [draft, setDraft] = useState({ yearGroupId: m.yearGroupId ?? '', houseId: m.houseId ?? '', classIds: m.classIds })

  return (
    <>
      <tr>
        <td className="px-4 py-2.5 text-sand-800">
          {m.firstName} {m.lastName}
          {m.managed && <span className="ml-2 text-[10px] uppercase tracking-wide text-sand-400 border border-sand-200 rounded px-1 py-0.5">managed</span>}
        </td>
        <td className="px-4 py-2.5 text-sand-500 hidden sm:table-cell">{m.email ?? '—'}</td>
        <td className="px-4 py-2.5 text-sand-600">{yearName(m.yearGroupId) ?? '—'}</td>
        <td className="px-4 py-2.5 text-sand-600 hidden md:table-cell">
          {h ? (
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full border border-sand-200" style={{ backgroundColor: h.color ?? '#e7e0d8' }} aria-hidden />
              {h.name}
            </span>
          ) : '—'}
        </td>
        <td className="px-4 py-2.5 text-sand-600 hidden md:table-cell">
          {m.classIds.length > 0 ? m.classIds.map(className).filter(Boolean).join(', ') : '—'}
        </td>
        <td className="px-4 py-2.5 text-right">
          <button
            type="button"
            onClick={() => {
              setDraft({ yearGroupId: m.yearGroupId ?? '', houseId: m.houseId ?? '', classIds: m.classIds })
              onToggle()
            }}
            className="text-xs text-sand-500 hover:text-brand-700 transition"
          >
            {open ? 'Close' : 'Assign'}
          </button>
        </td>
      </tr>
      {open && (
        <tr className="bg-sand-50/60">
          <td colSpan={6} className="px-4 py-3">
            <form
              onSubmit={async e => {
                e.preventDefault()
                const ok = await call('PATCH', {
                  studentId: m.id,
                  yearGroupId: draft.yearGroupId || null,
                  houseId: draft.houseId || null,
                  classIds: draft.classIds,
                })
                if (ok) onToggle()
              }}
              className="flex flex-wrap items-start gap-4"
            >
              <label className="text-xs text-sand-500">
                Year group
                <select value={draft.yearGroupId} onChange={e => setDraft({ ...draft, yearGroupId: e.target.value })} className={`${inputCls} block mt-1`}>
                  <option value="">Unassigned</option>
                  {yearGroups.map(y => <option key={y.id} value={y.id}>{y.name}</option>)}
                </select>
              </label>
              <label className="text-xs text-sand-500">
                House
                <select value={draft.houseId} onChange={e => setDraft({ ...draft, houseId: e.target.value })} className={`${inputCls} block mt-1`}>
                  <option value="">Unassigned</option>
                  {houses.map(hs => <option key={hs.id} value={hs.id}>{hs.name}</option>)}
                </select>
              </label>
              <fieldset className="text-xs text-sand-500">
                <legend>Classes</legend>
                <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 max-w-xl">
                  {classes.length === 0 && <span className="text-sand-400">No classes set up yet.</span>}
                  {classes.map(c => (
                    <label key={c.id} className="inline-flex items-center gap-1.5 text-sm text-sand-700">
                      <input
                        type="checkbox"
                        checked={draft.classIds.includes(c.id)}
                        onChange={e =>
                          setDraft({
                            ...draft,
                            classIds: e.target.checked ? [...draft.classIds, c.id] : draft.classIds.filter(id => id !== c.id),
                          })
                        }
                      />
                      {c.name}
                    </label>
                  ))}
                </div>
              </fieldset>
              <button type="submit" disabled={busy} className={`${btnCls} self-end`}>Save</button>
            </form>
          </td>
        </tr>
      )}
    </>
  )
}
