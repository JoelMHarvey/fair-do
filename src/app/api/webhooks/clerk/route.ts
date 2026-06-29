import { headers } from 'next/headers'
import { Webhook } from 'svix'
import { prisma } from '@/lib/prisma'

type ClerkUserCreatedEvent = {
  type: 'user.created'
  data: {
    id: string
    email_addresses: { email_address: string; id: string }[]
    primary_email_address_id: string
  }
}

export async function POST(req: Request) {
  const secret = process.env.CLERK_WEBHOOK_SECRET
  if (!secret) return new Response('Webhook secret not configured', { status: 500 })

  const headerPayload = await headers()
  const svixId = headerPayload.get('svix-id')
  const svixTimestamp = headerPayload.get('svix-timestamp')
  const svixSignature = headerPayload.get('svix-signature')

  if (!svixId || !svixTimestamp || !svixSignature) {
    return new Response('Missing svix headers', { status: 400 })
  }

  const payload = await req.text()

  let event: ClerkUserCreatedEvent
  try {
    const wh = new Webhook(secret)
    event = wh.verify(payload, {
      'svix-id': svixId,
      'svix-timestamp': svixTimestamp,
      'svix-signature': svixSignature,
    }) as ClerkUserCreatedEvent
  } catch {
    return new Response('Invalid signature', { status: 400 })
  }

  if (event.type !== 'user.created') {
    return new Response('Ignored', { status: 200 })
  }

  const primaryEmail = event.data.email_addresses.find(
    (e) => e.id === event.data.primary_email_address_id
  )

  if (!primaryEmail) {
    return new Response('No primary email', { status: 400 })
  }

  // Upsert by email so a redelivered event, or a Clerk dev→prod instance migration
  // (new clerkId for an existing email), re-links the existing row instead of throwing
  // a unique-constraint error. A pre-existing row keeps its role; new ones default STUDENT.
  await prisma.user.upsert({
    where: { email: primaryEmail.email_address },
    update: { clerkId: event.data.id },
    create: {
      clerkId: event.data.id,
      email: primaryEmail.email_address,
      role: 'STUDENT', // default — overwritten during onboarding
    },
  })

  return new Response('OK', { status: 200 })
}
