import { headers } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { PRACTICE_PORTAL_ENABLED } from '@/lib/practice'
import { checkRateLimit, rateLimitResponse } from '@/lib/ratelimit'
import type { FormField } from '@/lib/forms'

// Public form submission (token-gated). The student fills the form their teacher sent.
export async function POST(req: Request, { params }: { params: Promise<{ token: string }> }) {
  if (!PRACTICE_PORTAL_ENABLED) return new Response('Not found', { status: 404 })
  const { token } = await params
  if (!token || token.length < 12) return new Response('Not found', { status: 404 })

  const ip = (await headers()).get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown'
  const rl = await checkRateLimit(`form-submit:${ip}`, { limit: 20, windowMs: 60_000 })
  if (!rl.allowed) return rateLimitResponse(rl.retryAfterMs)

  const form = await prisma.studentForm.findUnique({ where: { token } })
  if (!form || form.status === 'completed') return new Response('Not available', { status: 410 })

  const body = await req.json().catch(() => null)
  const responses = body?.responses
  if (!responses || typeof responses !== 'object') return Response.json({ error: 'Invalid' }, { status: 400 })

  // Required-field check against the form's own fields.
  const fields = form.fields as unknown as FormField[]
  for (const f of fields) {
    if (f.required) {
      const v = responses[f.id]
      const missing = f.type === 'checkbox' ? v !== true : !String(v ?? '').trim()
      if (missing) return Response.json({ error: `Please complete: ${f.label}` }, { status: 400 })
    }
  }

  // Keep only known fields; cap string lengths.
  const clean: Record<string, unknown> = {}
  for (const f of fields) {
    const v = responses[f.id]
    clean[f.id] = f.type === 'checkbox' ? v === true : String(v ?? '').slice(0, 5000)
  }

  await prisma.studentForm.update({
    where: { token },
    data: { responses: clean as object, status: 'completed', completedAt: new Date() },
  })
  return Response.json({ ok: true }, { status: 200 })
}
