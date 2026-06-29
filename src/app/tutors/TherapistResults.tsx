'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { convertMinor, formatMinor } from '@/lib/currency'

type T = {
  id: string
  firstName: string
  lastName: string
  bio: string
  tagline: string | null
  profileImageUrl: string | null
  qualificationBody: string | null
  sessionRatePence: number
  introRatePence: number | null
  displayPence: number
  nextAvailableTs: number | null
  isFoundingMember: boolean
  country: string
  languages: string[]
  ratingAverage: number
  ratingCount: number
  subjects: string[]
  score: number
}

type Sort = 'match' | 'cheapest' | 'soonest'

function relTime(ts: number | null): string {
  if (!ts) return 'Ask for times'
  const d = new Date(ts)
  const now = new Date()
  const sameDay = d.toDateString() === now.toDateString()
  const tomorrow = new Date(now); tomorrow.setDate(now.getDate() + 1)
  const isTomorrow = d.toDateString() === tomorrow.toDateString()
  const time = d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
  if (sameDay) return `Today ${time}`
  if (isTomorrow) return `Tomorrow ${time}`
  return d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' }) + ` ${time}`
}

export default function TherapistResults({ therapists, currency = 'GBP', rates = {} }: { therapists: T[]; currency?: string; rates?: Record<string, number> }) {
  // Price in the tutor's charge currency, with an estimate in the visitor's.
  function Price({ minor, country }: { minor: number; country: string }) {
    const base = country === 'US' ? 'USD' : 'GBP'
    const baseStr = formatMinor(minor, base, true)
    if (currency === base) return <>{baseStr}</>
    return <>{baseStr} <span className="text-sm text-sand-400 font-normal">≈ {formatMinor(convertMinor(minor, base, currency, rates), currency, true)}</span></>
  }

  const [sort, setSort] = useState<Sort>('match')
  const [lang, setLang] = useState('')

  // Languages offered across the matched tutors (for the filter dropdown).
  const langOptions = useMemo(() => {
    const set = new Set<string>()
    therapists.forEach(t => t.languages?.forEach(l => set.add(l)))
    return [...set].sort()
  }, [therapists])

  const sorted = useMemo(() => {
    let arr = [...therapists]
    if (lang) arr = arr.filter(t => t.languages?.includes(lang))
    if (sort === 'cheapest') arr.sort((a, b) => a.displayPence - b.displayPence)
    else if (sort === 'soonest') arr.sort((a, b) => (a.nextAvailableTs ?? Infinity) - (b.nextAvailableTs ?? Infinity))
    // 'match' keeps server order (by score)
    return arr
  }, [therapists, sort, lang])

  const tab = (s: Sort, txt: string) =>
    `px-4 py-2 rounded-full text-sm font-medium transition ${
      sort === s ? 'bg-brand-600 text-white' : 'bg-white text-sand-600 border border-sand-200 hover:border-brand-300'
    }`

  return (
    <>
      <div className="flex gap-2 mb-5 flex-wrap items-center">
        <button className={tab('match', '')} onClick={() => setSort('match')}>Best match</button>
        <button className={tab('cheapest', '')} onClick={() => setSort('cheapest')}>Cheapest</button>
        <button className={tab('soonest', '')} onClick={() => setSort('soonest')}>Soonest</button>
        {langOptions.length > 1 && (
          <select
            value={lang}
            onChange={e => setLang(e.target.value)}
            className="ml-auto px-4 py-2 rounded-full text-sm bg-white text-sand-700 border border-sand-200 hover:border-brand-300"
          >
            <option value="">Any language</option>
            {langOptions.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
        )}
      </div>

      {sorted.length === 0 && (
        <p className="text-sand-500 text-sm mb-4">No tutors match that language yet.</p>
      )}

      <div className="space-y-4">
        {sorted.map((t, i) => {
          const showIntro = t.introRatePence != null && t.introRatePence < t.sessionRatePence
          return (
            <div key={t.id} className="bg-white rounded-3xl border border-sand-200 p-6 hover:border-brand-300 hover:shadow-md transition shadow-sm">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-brand-100 overflow-hidden flex items-center justify-center text-brand-700 font-display font-semibold shrink-0">
                  {t.profileImageUrl
                    ? <img src={t.profileImageUrl} alt="" className="w-full h-full object-cover" />
                    : <>{t.firstName[0]}{t.lastName[0]}</>}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-display text-lg font-semibold text-brand-900">{t.firstName} {t.lastName}</p>
                    {sort === 'match' && i === 0 && t.score > 0 && (
                      <span className="text-xs bg-brand-600 text-white px-2 py-0.5 rounded-full font-medium">Best match</span>
                    )}
                    {t.ratingCount > 0 && (
                      <span className="text-xs bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full font-medium">★ {t.ratingAverage} ({t.ratingCount})</span>
                    )}
                    {t.isFoundingMember && (
                      <span className="text-xs bg-coral-50 text-coral-600 border border-coral-200 px-2 py-0.5 rounded-full font-medium">★ Founding</span>
                    )}
                  </div>
                  <p className="text-sm text-sand-500">{t.qualificationBody}{t.tagline ? ` · ${t.tagline}` : ''}</p>
                  <p className="text-sm text-sand-600 mt-2.5 line-clamp-2">{t.bio}</p>
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {t.subjects.slice(0, 4).map(s => (
                      <span key={s} className="text-xs bg-sand-100 text-sand-600 px-2 py-0.5 rounded-full">{s}</span>
                    ))}
                  </div>
                  <p className="text-xs text-brand-600 mt-2.5 font-medium">⏱ Next: {relTime(t.nextAvailableTs)}</p>
                  {t.languages && t.languages.length > 1 && (
                    <p className="text-xs text-sand-500 mt-1">🗣 {t.languages.join(', ')}</p>
                  )}
                </div>

                <div className="shrink-0 text-right">
                  {showIntro ? (
                    <>
                      <p className="font-display text-xl font-semibold text-brand-900"><Price minor={t.introRatePence!} country={t.country} /></p>
                      <p className="text-[11px] text-coral-600">first lesson</p>
                    </>
                  ) : (
                    <>
                      <p className="font-display text-xl font-semibold text-brand-900"><Price minor={t.sessionRatePence} country={t.country} /></p>
                      <p className="text-[11px] text-sand-400">per lesson</p>
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 mt-4 pt-4 border-t border-sand-100">
                <Link href={`/book/${t.id}`} className="flex-1 bg-brand-600 text-white px-4 py-2.5 rounded-full text-sm font-medium hover:bg-brand-700 transition text-center">
                  Book lesson
                </Link>
                <Link href={`/tutors/${t.id}`} className="px-5 py-2.5 rounded-full text-sm text-sand-600 border border-sand-200 hover:border-brand-300 hover:text-brand-700 transition">
                  View profile
                </Link>
              </div>
            </div>
          )
        })}
      </div>
    </>
  )
}
