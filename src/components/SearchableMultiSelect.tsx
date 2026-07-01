'use client'

import { useState } from 'react'

// Searchable multi-select over a fixed option list. Selected values show as
// removable chips; a filter box narrows the list. Keeps `selected: string[]`.
export function SearchableMultiSelect({
  options,
  selected,
  onToggle,
  placeholder = 'Search…',
}: {
  options: readonly string[]
  selected: string[]
  onToggle: (value: string) => void
  placeholder?: string
}) {
  const [q, setQ] = useState('')
  const filtered = q ? options.filter(o => o.toLowerCase().includes(q.toLowerCase())) : options

  return (
    <div className="space-y-2">
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selected.map(s => (
            <button
              key={s}
              type="button"
              onClick={() => onToggle(s)}
              className="text-sm px-3 py-1.5 rounded-full border border-brand-500 bg-brand-50 text-brand-700"
            >
              {s} ✕
            </button>
          ))}
        </div>
      )}
      <input
        value={q}
        onChange={e => setQ(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-sand-300 px-3 py-2 text-sm focus:border-brand-400 focus:outline-none"
      />
      <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto">
        {filtered.map(o => (
          <button
            key={o}
            type="button"
            onClick={() => onToggle(o)}
            className={`text-sm px-3 py-1.5 rounded-full border transition ${
              selected.includes(o) ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-sand-200 text-sand-700 hover:border-brand-300'
            }`}
          >
            {o}
          </button>
        ))}
        {filtered.length === 0 && <p className="text-sm text-sand-400">No matches.</p>}
      </div>
    </div>
  )
}
