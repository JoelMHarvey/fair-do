'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

type Rule = { audience: 'students' | 'parents' | 'tutors'; yearGroupId?: string; houseId?: string; classId?: string }
type MemberRow = { email: string; name: string }
type Group = { id: string; name: string; rule: Rule | null; members: MemberRow[] }
type Option = { id: string; name: string }

const inputCls = 'w-full rounded-xl border border-sand-300 px-3 py-2.5 text-sm focus:border-brand-400 focus:outline-none'
const selectCls = 'rounded-xl border border-sand-300 px-3 py-2 text-sm text-sand-700 focus:border-brand-400 focus:outline-none'

const AUDIENCE_LABELS: Record<Rule['audience'], string> = {
  students: 'Students',
  parents: 'Parents',
  tutors: 'Tutors',
}

function ruleLabel(rule: Rule, yearGroups: Option[], houses: Option[], classes: Option[]): string {
  const bits = [AUDIENCE_LABELS[rule.audience]]
  const name = (opts: Option[], id?: string) => opts.find(o => o.id === id)?.name
  const yg = name(yearGroups, rule.yearGroupId)
  const h = name(houses, rule.houseId)
  const c = name(classes, rule.classId)
  if (yg) bits.push(yg)
  if (h) bits.push(`${h} house`)
  if (c) bits.push(`class ${c}`)
  return bits.join(' · ')
}

type EditorState = {
  id: string | null // null = creating
  name: string
  mode: 'rule' | 'manual'
  rule: Rule
  members: MemberRow[]
  consent: boolean
}

const blankEditor = (): EditorState => ({
  id: null,
  name: '',
  mode: 'rule',
  rule: { audience: 'students' },
  members: [{ email: '', name: '' }],
  consent: false,
})

export default function MailGroupsClient({
  groups, yearGroups, houses, classes,
}: { groups: Group[]; yearGroups: Option[]; houses: Option[]; classes: Option[] }) {
  const router = useRouter()
  const [editor, setEditor] = useState<EditorState | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  // Live member-count preview, keyed by the rule it was counted for — a stale
  // key renders as "counting…" without needing a synchronous reset in the effect.
  const [preview, setPreview] = useState<{ key: string; count: number } | null>(null)

  const rule = editor?.mode === 'rule' ? editor.rule : null
  const ruleKey = rule ? JSON.stringify(rule) : null
  const previewCount = ruleKey && preview?.key === ruleKey ? preview.count : null
  useEffect(() => {
    if (!ruleKey) return
    let cancelled = false
    const t = setTimeout(async () => {
      const r: Rule = JSON.parse(ruleKey)
      const qs = new URLSearchParams({ preview: '1', audience: r.audience })
      if (r.yearGroupId) qs.set('yearGroupId', r.yearGroupId)
      if (r.houseId) qs.set('houseId', r.houseId)
      if (r.classId) qs.set('classId', r.classId)
      try {
        const res = await fetch(`/api/school/mail-groups?${qs}`)
        const data = await res.json().catch(() => ({}))
        if (!cancelled && res.ok && typeof data.count === 'number') setPreview({ key: ruleKey, count: data.count })
      } catch { /* preview is best-effort */ }
    }, 350)
    return () => { cancelled = true; clearTimeout(t) }
  }, [ruleKey])

  function openEditor(g?: Group) {
    setError(null)
    if (!g) { setEditor(blankEditor()); return }
    setEditor({
      id: g.id,
      name: g.name,
      mode: g.rule ? 'rule' : 'manual',
      rule: g.rule ?? { audience: 'students' },
      members: g.members.length > 0 ? g.members.map(m => ({ ...m })) : [{ email: '', name: '' }],
      consent: false,
    })
  }

  function setRule(patch: Partial<Rule>) {
    setEditor(e => (e ? { ...e, rule: { ...e.rule, ...patch } } : e))
  }

  function setMember(i: number, patch: Partial<MemberRow>) {
    setEditor(e => {
      if (!e) return e
      const members = e.members.map((m, j) => (j === i ? { ...m, ...patch } : m))
      return { ...e, members, consent: false }
    })
  }

  async function save() {
    if (!editor) return
    setSaving(true)
    setError(null)
    const members = editor.mode === 'manual'
      ? editor.members.map(m => ({ email: m.email.trim(), ...(m.name.trim() ? { name: m.name.trim() } : {}) })).filter(m => m.email)
      : []
    const payload = {
      name: editor.name.trim(),
      rule: editor.mode === 'rule' ? editor.rule : null,
      members,
      consentConfirmed: editor.consent,
    }
    try {
      const res = await fetch(editor.id ? `/api/school/mail-groups/${editor.id}` : '/api/school/mail-groups', {
        method: editor.id ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) { setError(data.error ?? 'Could not save the group.'); setSaving(false); return }
      setEditor(null)
      setSaving(false)
      router.refresh()
    } catch {
      setError('Something went wrong. Please try again.')
      setSaving(false)
    }
  }

  async function remove(g: Group) {
    if (!window.confirm(`Delete the mail group "${g.name}"? Past broadcasts keep their history.`)) return
    await fetch(`/api/school/mail-groups/${g.id}`, { method: 'DELETE' }).catch(() => {})
    router.refresh()
  }

  const manualHasRows = editor?.mode === 'manual' && editor.members.some(m => m.email.trim())
  const canSave = !!editor && editor.name.trim().length > 0 && (editor.mode === 'rule' || !manualHasRows || editor.consent)

  return (
    <div className="space-y-5">
      {/* Group list */}
      <div className="bg-white rounded-2xl border border-sand-200 divide-y divide-sand-100">
        {groups.length === 0 && (
          <p className="p-5 text-sm text-sand-400">No mail groups yet — create your first below.</p>
        )}
        {groups.map(g => (
          <div key={g.id} className="p-4 sm:px-5 flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sand-900 truncate">{g.name}</p>
              <p className="text-xs text-sand-500 mt-0.5">
                {g.rule
                  ? <>Rule: {ruleLabel(g.rule, yearGroups, houses, classes)} <span className="text-sand-400">· resolved when you send</span></>
                  : `Manual list · ${g.members.length} member${g.members.length !== 1 ? 's' : ''}`}
              </p>
            </div>
            <button onClick={() => openEditor(g)} className="text-sm text-brand-700 hover:text-brand-800 shrink-0">Edit</button>
            <button onClick={() => remove(g)} className="text-sm text-red-500 hover:text-red-700 shrink-0">Delete</button>
          </div>
        ))}
      </div>

      {!editor && (
        <button onClick={() => openEditor()} className="bg-brand-600 hover:bg-brand-700 text-white font-medium rounded-full px-6 py-2.5 text-sm transition">
          New mail group
        </button>
      )}

      {/* Editor */}
      {editor && (
        <div className="bg-white rounded-2xl border border-sand-200 p-5 space-y-4">
          <h2 className="font-display text-lg text-sand-900">{editor.id ? 'Edit group' : 'New group'}</h2>

          <input
            value={editor.name}
            onChange={e => setEditor(s => (s ? { ...s, name: e.target.value } : s))}
            maxLength={80}
            placeholder='Group name (e.g. "Year 10 parents")'
            className={inputCls}
          />

          <div className="inline-flex rounded-full border border-sand-200 p-0.5 bg-sand-50">
            {(['rule', 'manual'] as const).map(m => (
              <button
                key={m}
                onClick={() => setEditor(s => (s ? { ...s, mode: m } : s))}
                className={`px-4 py-1.5 rounded-full text-sm transition ${editor.mode === m ? 'bg-white shadow-sm text-brand-700 font-medium' : 'text-sand-500'}`}
              >
                {m === 'rule' ? 'Rule-based' : 'Manual list'}
              </button>
            ))}
          </div>

          {editor.mode === 'rule' ? (
            <div className="space-y-3">
              <div className="flex flex-wrap gap-3">
                <label className="text-xs text-sand-500">
                  Audience
                  <select
                    value={editor.rule.audience}
                    onChange={e => setRule({ audience: e.target.value as Rule['audience'] })}
                    className={`${selectCls} block mt-1`}
                  >
                    <option value="students">Students</option>
                    <option value="parents">Parents</option>
                    <option value="tutors">Tutors</option>
                  </select>
                </label>
                <label className="text-xs text-sand-500">
                  Year group
                  <select
                    value={editor.rule.yearGroupId ?? ''}
                    onChange={e => setRule({ yearGroupId: e.target.value || undefined })}
                    className={`${selectCls} block mt-1`}
                  >
                    <option value="">Any</option>
                    {yearGroups.map(y => <option key={y.id} value={y.id}>{y.name}</option>)}
                  </select>
                </label>
                <label className="text-xs text-sand-500">
                  House
                  <select
                    value={editor.rule.houseId ?? ''}
                    onChange={e => setRule({ houseId: e.target.value || undefined })}
                    className={`${selectCls} block mt-1`}
                  >
                    <option value="">Any</option>
                    {houses.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
                  </select>
                </label>
                <label className="text-xs text-sand-500">
                  Class
                  <select
                    value={editor.rule.classId ?? ''}
                    onChange={e => setRule({ classId: e.target.value || undefined })}
                    className={`${selectCls} block mt-1`}
                  >
                    <option value="">Any</option>
                    {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </label>
              </div>
              <p className="text-sm text-sand-600">
                {previewCount === null
                  ? 'Counting current members…'
                  : <><span className="font-medium text-brand-700">{previewCount}</span> recipient{previewCount !== 1 ? 's' : ''} right now — resolved again each time you send.</>}
              </p>
              {editor.rule.audience === 'parents' && (
                <p className="text-xs text-sand-400">Parents are counted through their linked children — only active parent links are included.</p>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <div className="space-y-2">
                {editor.members.map((m, i) => (
                  <div key={i} className="flex gap-2">
                    <input value={m.email} onChange={e => setMember(i, { email: e.target.value })} type="email" maxLength={254} placeholder="email@example.com" className={inputCls} />
                    <input value={m.name} onChange={e => setMember(i, { name: e.target.value })} maxLength={120} placeholder="Name (optional)" className={inputCls} />
                    <button
                      onClick={() => setEditor(s => (s ? { ...s, members: s.members.filter((_, j) => j !== i), consent: false } : s))}
                      className="text-sand-400 hover:text-red-600 px-2 shrink-0"
                      aria-label="Remove row"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
              <button
                onClick={() => setEditor(s => (s ? { ...s, members: [...s.members, { email: '', name: '' }] } : s))}
                className="text-sm text-brand-700 hover:text-brand-800 underline underline-offset-4"
              >
                Add another person
              </button>
              {manualHasRows && (
                <label className="flex items-start gap-2 text-xs text-sand-600 bg-sand-50 border border-sand-200 rounded-xl p-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editor.consent}
                    onChange={e => setEditor(s => (s ? { ...s, consent: e.target.checked } : s))}
                    className="mt-0.5 rounded border-sand-300 text-brand-600 focus:ring-brand-400"
                  />
                  <span>
                    I confirm the school has a lawful basis for emailing these people — legitimate interest for
                    school communications — and that they can ask us to remove them at any time.
                  </span>
                </label>
              )}
            </div>
          )}

          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex items-center gap-3">
            <button onClick={save} disabled={!canSave || saving} className="bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-medium rounded-full px-6 py-2.5 text-sm transition">
              {saving ? 'Saving…' : editor.id ? 'Save changes' : 'Create group'}
            </button>
            <button onClick={() => setEditor(null)} disabled={saving} className="text-sm text-sand-500 hover:text-brand-700">Cancel</button>
          </div>
        </div>
      )}
    </div>
  )
}
