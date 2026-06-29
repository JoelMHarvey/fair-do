'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'

type DocMeta = { slug: string; title: string }
type DocGroup = { title: string; category: 'current' | 'archive'; docs: DocMeta[] }
type SearchDoc = { slug: string; title: string; group: string; text: string }

type Result = SearchDoc & { snippet: { before: string; match: string; after: string } | null }

function buildSnippet(text: string, q: string): Result['snippet'] {
  const i = text.toLowerCase().indexOf(q)
  if (i < 0) return null
  const start = Math.max(0, i - 70)
  const end = Math.min(text.length, i + q.length + 90)
  return {
    before: (start > 0 ? '… ' : '') + text.slice(start, i),
    match: text.slice(i, i + q.length),
    after: text.slice(i + q.length, end) + (end < text.length ? ' …' : ''),
  }
}

export default function DocSearch({ groups, index }: { groups: DocGroup[]; index: SearchDoc[] }) {
  const [query, setQuery] = useState('')
  const q = query.trim().toLowerCase()
  const searching = q.length >= 2

  const results = useMemo<Result[]>(() => {
    if (q.length < 2) return []
    return index
      .map(d => {
        const inTitle = d.title.toLowerCase().includes(q)
        const inBody = d.text.toLowerCase().includes(q)
        if (!inTitle && !inBody) return null
        return { ...d, snippet: buildSnippet(d.text, q) }
      })
      .filter((r): r is Result => r !== null)
  }, [q, index])

  const visibleGroups = groups

  return (
    <div>
      {/* Search */}
      <div className="relative mb-6">
        <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-sand-400 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="7" />
          <path d="m21 21-4.3-4.3" strokeLinecap="round" />
        </svg>
        <input
          type="search"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search all documents…"
          aria-label="Search documents"
          className="w-full rounded-full border border-sand-200 bg-white pl-11 pr-4 py-3 text-sand-800 shadow-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
        />
      </div>

      {searching ? (
        <section>
          <p className="text-sm text-sand-500 mb-4">
            {results.length} result{results.length !== 1 ? 's' : ''} for “{query.trim()}”
          </p>
          {results.length === 0 ? (
            <div className="bg-white rounded-2xl border border-sand-200 p-8 text-center text-sand-400 text-sm">Nothing matched. Try another term.</div>
          ) : (
            <div className="space-y-3">
              {results.map(r => (
                <Link key={r.slug} href={`/founder/${r.slug}`} className="block bg-white rounded-2xl border border-sand-200 px-5 py-4 shadow-sm hover:border-brand-300 hover:shadow-md transition">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sand-800 font-medium">{r.title}</span>
                    <span className="text-xs text-sand-400 shrink-0">{r.group}</span>
                  </div>
                  {r.snippet && (
                    <p className="text-sm text-sand-500 mt-2 leading-relaxed">
                      {r.snippet.before}
                      <mark className="bg-brand-100 text-brand-900 rounded px-0.5">{r.snippet.match}</mark>
                      {r.snippet.after}
                    </p>
                  )}
                </Link>
              ))}
            </div>
          )}
        </section>
      ) : (
        <>
          <div className="space-y-8">
            {visibleGroups.map(group => (
              <section key={group.title}>
                <h2 className="font-display text-lg font-semibold text-brand-900 mb-3">{group.title}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {group.docs.map(d => (
                    <Link
                      key={d.slug}
                      href={`/founder/${d.slug}`}
                      className="bg-white rounded-2xl border border-sand-200 px-5 py-4 shadow-sm hover:border-brand-300 hover:shadow-md transition flex items-center justify-between gap-3"
                    >
                      <span className="text-sand-800 font-medium">{d.title}</span>
                      <span className="text-brand-700 text-sm shrink-0">Open →</span>
                    </Link>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
