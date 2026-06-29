const OWNER = 'JoelMHarvey'
const REPO = 'faresay'
const WORKFLOW = 'e2e.yml'
const API = 'https://api.github.com'

export type RunStatus = 'queued' | 'in_progress' | 'completed'
export type RunConclusion = 'success' | 'failure' | 'cancelled' | 'skipped' | null

export type WorkflowRun = {
  id: number
  status: RunStatus
  conclusion: RunConclusion
  createdAt: string
  updatedAt: string
  htmlUrl: string
  branch: string
  event: string
  durationSecs: number | null
}

function headers() {
  const pat = process.env.GH_PAT
  if (!pat) throw new Error('GH_PAT not set')
  return {
    Authorization: `Bearer ${pat}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  }
}

export async function getE2ERuns(limit = 8): Promise<WorkflowRun[]> {
  const res = await fetch(
    `${API}/repos/${OWNER}/${REPO}/actions/workflows/${WORKFLOW}/runs?per_page=${limit}`,
    { headers: headers(), next: { revalidate: 0 } },
  )
  if (!res.ok) throw new Error(`GitHub API ${res.status}`)
  const json = await res.json() as { workflow_runs: unknown[] }
  return (json.workflow_runs as Record<string, unknown>[]).map(r => {
    const started = r.run_started_at ? new Date(r.run_started_at as string).getTime() : null
    const updated = new Date(r.updated_at as string).getTime()
    return {
      id: r.id as number,
      status: r.status as RunStatus,
      conclusion: (r.conclusion ?? null) as RunConclusion,
      createdAt: r.created_at as string,
      updatedAt: r.updated_at as string,
      htmlUrl: r.html_url as string,
      branch: r.head_branch as string,
      event: r.event as string,
      durationSecs: started && r.status === 'completed' ? Math.round((updated - started) / 1000) : null,
    }
  })
}

export async function triggerE2ERun(): Promise<void> {
  const res = await fetch(
    `${API}/repos/${OWNER}/${REPO}/actions/workflows/${WORKFLOW}/dispatches`,
    {
      method: 'POST',
      headers: { ...headers(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ ref: 'main' }),
    },
  )
  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(`GitHub API ${res.status}: ${body}`)
  }
}

export function isGHPatConfigured(): boolean {
  return !!process.env.GH_PAT
}
