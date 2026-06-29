import { auth } from '@clerk/nextjs/server'
import { headers } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { checkRateLimit, rateLimitResponse } from '@/lib/ratelimit'
import { Resend } from 'resend'
import { z } from 'zod'

const schema = z.object({
  category: z.enum(['safeguarding', 'conduct', 'billing', 'technical', 'other']),
  body: z.string().min(10).max(4000),
  therapistId: z.string().optional(),
  sessionId: z.string().optional(),
})

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return new Response('Unauthorized', { status: 401 })

  const headersList = await headers()
  const ip = headersList.get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown'
  const rl = await checkRateLimit(`complaint:${userId}:${ip}`, { limit: 3, windowMs: 300_000 })
  if (!rl.allowed) return rateLimitResponse(rl.retryAfterMs)

  const json = await req.json()
  const parsed = schema.safeParse(json)
  if (!parsed.success) return Response.json({ error: 'Invalid data' }, { status: 400 })

  const { category, body, therapistId, sessionId } = parsed.data

  const complaint = await prisma.complaint.create({
    data: {
      reporterClerkId: userId,
      category,
      body,
      teacherId: therapistId || null,
      sessionId: sessionId || null,
    },
  })

  // Notify safeguarding/admin inbox — non-blocking
  try {
    const resend = new Resend(process.env.RESEND_API_KEY)
    const adminEmail = process.env.COMPLAINTS_EMAIL ?? 'complaints@faresay.com'
    await resend.emails.send({
      from: process.env.RESEND_FROM ?? 'Faresay <onboarding@resend.dev>',
      to: adminEmail,
      subject: `[${category.toUpperCase()}] New complaint ${complaint.id}`,
      html: `<p><strong>Category:</strong> ${category}</p><p><strong>Reporter:</strong> ${userId}</p>${therapistId ? `<p><strong>Therapist:</strong> ${therapistId}</p>` : ''}${sessionId ? `<p><strong>Session:</strong> ${sessionId}</p>` : ''}<p><strong>Detail:</strong></p><p>${body.replace(/</g, '&lt;')}</p>`,
    })
  } catch (e) {
    console.error('[complaints] admin notify failed:', e)
  }

  return Response.json({ ok: true, id: complaint.id }, { status: 201 })
}
