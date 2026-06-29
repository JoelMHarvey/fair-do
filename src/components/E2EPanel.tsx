'use client'

import { useState, useEffect, useCallback, useTransition } from 'react'
import type { WorkflowRun, RunConclusion } from '@/lib/github-actions'

type ApiResponse = { configured: boolean; runs: WorkflowRun[]; error?: string }

function conclusionDot(conclusion: RunConclusion, status: string) {
  if (status === 'in_progress' || status === 'queued') return '🟡'
  if (conclusion === 'success') return '🟢'
  if (conclusion === 'failure') return '🔴'
  return '⚪'
}

function fmtDuration(secs: number | null) {
  if (!secs) return ''
  return secs < 60 ? `${secs}s` : `${Math.floor(secs / 60)}m ${secs % 60}s`
}

function fmtAge(iso: string) {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (diff < 60) return `${diff}s ago`
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  return `${Math.floor(diff / 3600)}h ago`
}

function conclusionLabel(run: WorkflowRun) {
  if (run.status === 'queued') return 'queued'
  if (run.status === 'in_progress') return 'running…'
  return run.conclusion ?? 'unknown'
}

export function E2EPanel() {
  const [data, setData] = useState<ApiResponse | null>(null)
  const [triggered, setTriggered] = useState(false)
  const [isPending, startTransition] = useTransition()

  const fetchRuns = useCallback(async () => {
    try {
      const res = await fetch('/api/founder/e2e', { cache: 'no-store' })
      if (res.ok) setData(await res.json())
    } catch { /* network error — keep stale */ }
  }, [])

  useEffect(() => {
    fetchRuns()
  }, [fetchRuns])

  // Poll every 15s while any run is active.
  useEffect(() => {
    const hasActive = data?.runs.some(r => r.status !== 'completed')
    if (!hasActive && !triggered) return
    const id = setInterval(fetchRuns, 15_000)
    return () => clearInterval(id)
  }, [data, triggered, fetchRuns])

  async function trigger() {
    startTransition(async () => {
      setTriggered(true)
      try {
        const res = await fetch('/api/founder/e2e', { method: 'POST' })
        if (!res.ok) {
          const j = await res.json().catch(() => ({})) as { error?: string }
          alert(`Trigger failed: ${j.error ?? res.status}`)
          setTriggered(false)
          return
        }
        // Brief delay then re-fetch so the new queued run appears.
        setTimeout(() => { fetchRuns(); setTriggered(false) }, 3000)
      } catch {
        alert('Network error triggering E2E run.')
        setTriggered(false)
      }
    })
  }

  if (!data) {
    return <div className="bg-white rounded-xl border border-sand-200 p-4 text-sm text-sand-400">Loading E2E status…</div>
  }

  if (!data.configured) {
    return (
      <div className="bg-white rounded-xl border border-sand-200 p-4 text-sm text-sand-500">
        Not configured — add <code className="text-xs bg-sand-100 px-1 rounded">GH_PAT</code> to Vercel environment variables
        (needs <code className="text-xs bg-sand-100 px-1 rounded">actions:read</code> + <code className="text-xs bg-sand-100 px-1 rounded">actions:write</code> scopes on <code className="text-xs bg-sand-100 px-1 rounded">JoelMHarvey/faresay</code>).
      </div>
    )
  }

  if (data.error) {
    return <div className="bg-white rounded-xl border border-sand-200 p-4 text-sm text-coral-600">GitHub API error: {data.error}</div>
  }

  const latestRun = data.runs[0]
  const latestOk = latestRun?.conclusion === 'success'
  const hasActive = data.runs.some(r => r.status !== 'completed') || triggered

  return (
    <div className="bg-white rounded-xl border border-sand-200 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-sand-100">
        <div className="flex items-center gap-2">
          {latestRun ? (
            <span className="text-base leading-none">{conclusionDot(latestRun.conclusion, latestRun.status)}</span>
          ) : null}
          <span className="text-sm font-medium text-sand-900">
            {latestRun
              ? latestOk ? 'All passing' : latestRun.status !== 'completed' ? 'Run in progress' : 'Last run failed'
              : 'No runs yet'}
          </span>
          {hasActive && (
            <span className="text-xs text-amber-600 animate-pulse">● live</span>
          )}
        </div>
        <button
          onClick={trigger}
          disabled={isPending || triggered}
          className="text-xs font-medium px-3 py-1.5 rounded-lg bg-brand-600 text-white hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {triggered ? 'Queued…' : isPending ? 'Triggering…' : 'Run E2E now'}
        </button>
      </div>

      {data.runs.length === 0 ? (
        <p className="px-4 py-3 text-sm text-sand-400">No runs found.</p>
      ) : (
        <div>
          {data.runs.map((run, i) => (
            <a
              key={run.id}
              href={run.htmlUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center justify-between px-4 py-3 text-xs hover:bg-sand-50 transition ${i > 0 ? 'border-t border-sand-100' : ''}`}
            >
              <span className="flex items-center gap-2">
                <span className="leading-none">{conclusionDot(run.conclusion, run.status)}</span>
                <span className={`font-medium ${run.conclusion === 'failure' ? 'text-coral-700' : run.status !== 'completed' ? 'text-amber-700' : 'text-brand-700'}`}>
                  {conclusionLabel(run)}
                </span>
                <span className="text-sand-400">{run.event === 'schedule' ? 'nightly' : 'manual'}</span>
              </span>
              <span className="flex items-center gap-3 text-sand-400">
                {run.durationSecs ? <span>{fmtDuration(run.durationSecs)}</span> : null}
                <span>{fmtAge(run.createdAt)}</span>
              </span>
            </a>
          ))}
        </div>
      )}
    </div>
  )
}
