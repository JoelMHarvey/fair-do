import { headers } from 'next/headers'
import { getStripe } from '@/lib/stripe'
import { getMyOrg } from '@/lib/org'
import { checkRateLimit, rateLimitResponse } from '@/lib/ratelimit'
import { z } from 'zod'

const schema = z.object({ amountPence: z.number().int().min(5000).max(1_000_000_00) })

export async function POST(req: Request) {
  const mine = await getMyOrg()
  if (!mine) return new Response('No organisation', { status: 403 })
  if (!mine.isContact) return new Response('Only the org contact can top up', { status: 403 })

  const headersList = await headers()
  const ip = headersList.get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown'
  const rl = await checkRateLimit(`orgtopup:${mine.org.id}:${ip}`, { limit: 5, windowMs: 60_000 })
  if (!rl.allowed) return rateLimitResponse(rl.retryAfterMs)

  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return Response.json({ error: 'Invalid amount' }, { status: 400 })

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3001'
  const stripe = getStripe()
  let checkout
  try {
    checkout = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      customer_email: mine.org.contactEmail,
      line_items: [{
        price_data: {
          currency: 'gbp',
          product_data: { name: `Faresay credit pool top-up — ${mine.org.name}` },
          unit_amount: parsed.data.amountPence,
        },
        quantity: 1,
      }],
      success_url: `${appUrl}/org?topup=success`,
      cancel_url: `${appUrl}/org`,
      metadata: { type: 'org_topup', orgId: mine.org.id, amountPence: String(parsed.data.amountPence) },
    })
  } catch (e) {
    console.error('[org/topup] stripe error:', e)
    return Response.json({ error: 'Could not start checkout' }, { status: 502 })
  }
  return Response.json({ checkoutUrl: checkout.url }, { status: 201 })
}
