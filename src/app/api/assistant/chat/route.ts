import { auth } from '@clerk/nextjs/server'
import { headers } from 'next/headers'
import Anthropic from '@anthropic-ai/sdk'
import { prisma } from '@/lib/prisma'
import { checkRateLimit, rateLimitResponse } from '@/lib/ratelimit'
import { PRACTICE_PORTAL_ENABLED } from '@/lib/practice'
import { ASSISTANT_MODEL, ASSISTANT_SYSTEM, assistantConfigured } from '@/lib/assistant'
import { hasPaidAccess } from '@/lib/access'
import { z } from 'zod'

export const runtime = 'nodejs'

const schema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string().min(1).max(4000),
      }),
    )
    .min(1)
    .max(24),
})

export async function POST(req: Request) {
  if (!PRACTICE_PORTAL_ENABLED) return new Response('Not found', { status: 404 })
  if (!assistantConfigured()) {
    return Response.json({ error: 'The assistant isn’t available right now.' }, { status: 503 })
  }

  const { userId } = await auth()
  if (!userId) return new Response('Unauthorized', { status: 401 })

  const ip = (await headers()).get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown'
  const rl = await checkRateLimit(`assistant:${userId}:${ip}`, { limit: 30, windowMs: 5 * 60_000 })
  if (!rl.allowed) return rateLimitResponse(rl.retryAfterMs)

  const parsed = schema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return Response.json({ error: 'Invalid request' }, { status: 400 })
  const { messages } = parsed.data
  if (messages[messages.length - 1].role !== 'user') {
    return Response.json({ error: 'Invalid request' }, { status: 400 })
  }

  // Paid tier only (Practice/Clinic) — the assistant is a paid-plan feature.
  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: { teacher: { include: { subscription: { select: { tier: true, status: true } } } } },
  })
  const teacher = user?.teacher
  if (!teacher) return new Response('Not a teacher', { status: 403 })
  const sub = teacher.subscription
  const isPaid = hasPaidAccess({ email: user!.email, subscription: sub })
  if (!isPaid) {
    return Response.json({ error: 'The assistant is on the Pro plan.' }, { status: 403 })
  }

  // A small, un-cached context block — the large system prompt above it stays
  // byte-stable so it prompt-caches across turns.
  const context = `Context: you're helping ${teacher.firstName}, who is on the ${sub!.tier} plan.`

  const client = new Anthropic()
  const stream = client.messages.stream({
    model: ASSISTANT_MODEL,
    max_tokens: 1024,
    system: [
      { type: 'text', text: ASSISTANT_SYSTEM, cache_control: { type: 'ephemeral' } },
      { type: 'text', text: context },
    ],
    messages: messages.map(m => ({ role: m.role, content: m.content })),
  })

  const encoder = new TextEncoder()
  const body = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for await (const event of stream) {
          if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
            controller.enqueue(encoder.encode(event.delta.text))
          }
        }
      } catch (e) {
        console.error('[assistant] stream failed:', e instanceof Error ? e.message : e)
        controller.enqueue(encoder.encode(`\n\nSorry — I hit a problem. Please try again, or email support@fair-do.com.`))
      } finally {
        controller.close()
      }
    },
  })

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' },
  })
}
