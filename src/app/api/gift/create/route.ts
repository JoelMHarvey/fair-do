import { headers } from 'next/headers'
import { getStripe } from '@/lib/stripe'
import { checkRateLimit, rateLimitResponse } from '@/lib/ratelimit'
import { z } from 'zod'

const schema = z.object({
  amountPence: z.number().int().min(1000).max(50000), // £10–£500
  purchaserEmail: z.string().email(),
  recipientEmail: z.string().email().optional().or(z.literal('')),
  message: z.string().max(300).optional(),
})

export async function POST(req: Request) {
  const headersList = await headers()
  const ip = headersList.get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown'
  const rl = await checkRateLimit(`gift:${ip}`, { limit: 5, windowMs: 60_000 })
  if (!rl.allowed) return rateLimitResponse(rl.retryAfterMs)

  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return Response.json({ error: 'Invalid data' }, { status: 400 })

  const { amountPence, purchaserEmail, recipientEmail, message } = parsed.data
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3001'
  const stripe = getStripe()

  let checkout
  try {
    checkout = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      customer_email: purchaserEmail,
      line_items: [
        {
          price_data: {
            currency: 'gbp',
            product_data: {
              name: 'Faresay therapy gift voucher',
              description: `£${(amountPence / 100).toFixed(2)} of therapy credit`,
            },
            unit_amount: amountPence,
          },
          quantity: 1,
        },
      ],
      success_url: `${appUrl}/gift/success`,
      cancel_url: `${appUrl}/gift`,
      metadata: {
        type: 'gift',
        amountPence: String(amountPence),
        purchaserEmail,
        recipientEmail: recipientEmail || '',
        message: message || '',
      },
    })
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    console.error('[gift/create] Stripe error:', msg)
    return Response.json({ error: 'Could not start checkout' }, { status: 502 })
  }

  return Response.json({ checkoutUrl: checkout.url }, { status: 201 })
}
