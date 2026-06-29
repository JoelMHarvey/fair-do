import { NextResponse } from 'next/server'
import { isFounder } from '@/lib/founder'
import { getE2ERuns, triggerE2ERun, isGHPatConfigured } from '@/lib/github-actions'

export const dynamic = 'force-dynamic'

export async function GET() {
  if (!(await isFounder())) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  if (!isGHPatConfigured()) {
    return NextResponse.json({ configured: false, runs: [] })
  }
  try {
    const runs = await getE2ERuns(8)
    return NextResponse.json({ configured: true, runs })
  } catch (err) {
    return NextResponse.json({ configured: true, error: String(err), runs: [] }, { status: 502 })
  }
}

export async function POST() {
  if (!(await isFounder())) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  if (!isGHPatConfigured()) {
    return NextResponse.json({ error: 'GH_PAT not configured' }, { status: 503 })
  }
  try {
    await triggerE2ERun()
    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 502 })
  }
}
