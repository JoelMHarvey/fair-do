'use client'

import { useState } from 'react'
import Link from 'next/link'

type Slot = { id: string; name: string; ratePence: number; country: string }
type Day = { date: string; label: string; dow: number }

const sym = (c: string) => (c === 'US' ? '$' : '£')

export default function AvailabilityGrid({
  days, hours, slotMap,
}: {
  days: Day[]
  hours: number[]
  slotMap: Record<string, Slot[]>
}) {
  const [selected, setSelected] = useState<string | null>(null)
  const selectedTherapists = selected ? slotMap[selected] ?? [] : []
  const [selDate, selHour] = selected ? selected.split('|') : ['', '']

  function cellTone(count: number) {
    if (count === 0) return 'bg-sand-50 text-sand-300'
    if (count <= 1) return 'bg-brand-50 text-brand-700'
    if (count <= 3) return 'bg-brand-100 text-brand-800'
    return 'bg-brand-200 text-brand-900'
  }

  return (
    <div>
      <div className="bg-white rounded-3xl border border-sand-200 p-4 sm:p-5 shadow-sm overflow-x-auto">
        <table className="w-full border-separate" style={{ borderSpacing: '4px' }}>
          <thead>
            <tr>
              <th className="text-left"></th>
              {days.map(d => (
                <th key={d.date} className="text-xs font-medium text-sand-600 pb-1 min-w-[44px]">{d.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {hours.map(h => (
              <tr key={h}>
                <td className="text-xs text-sand-500 pr-2 text-right whitespace-nowrap">{String(h).padStart(2, '0')}:00</td>
                {days.map(d => {
                  const key = `${d.date}|${h}`
                  const count = slotMap[key]?.length ?? 0
                  const isSel = selected === key
                  return (
                    <td key={key}>
                      <button
                        disabled={count === 0}
                        onClick={() => setSelected(isSel ? null : key)}
                        className={`w-full h-9 rounded-lg text-xs font-medium transition ${cellTone(count)} ${
                          count > 0 ? 'hover:ring-2 hover:ring-brand-400 cursor-pointer' : 'cursor-default'
                        } ${isSel ? 'ring-2 ring-brand-600' : ''}`}
                      >
                        {count > 0 ? count : ''}
                      </button>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selected && selectedTherapists.length > 0 && (
        <div className="mt-6">
          <h2 className="font-display text-lg font-semibold text-brand-900 mb-3">
            {selectedTherapists.length} free · {new Date(selDate).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })} at {String(selHour).padStart(2, '0')}:00
          </h2>
          <div className="space-y-2">
            {selectedTherapists.map(t => (
              <div key={t.id} className="flex items-center justify-between bg-white rounded-2xl border border-sand-200 px-5 py-3.5 shadow-sm">
                <div>
                  <p className="font-medium text-brand-900 text-sm">{t.name}</p>
                  <p className="text-xs text-sand-500">{sym(t.country)}{(t.ratePence / 100).toFixed(0)} per lesson</p>
                </div>
                <div className="flex items-center gap-2">
                  <Link href={`/tutors/${t.id}`} className="text-sm text-sand-600 hover:text-brand-700 px-3 py-1.5">Profile</Link>
                  <Link href={`/book/${t.id}`} className="text-sm bg-brand-600 text-white px-4 py-1.5 rounded-full hover:bg-brand-700 transition">Book</Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
