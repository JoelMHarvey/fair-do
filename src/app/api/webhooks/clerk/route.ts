import { headers } from 'next/headers'
import { Webhook } from 'svix'
import { prisma } from '@/lib/prisma'
import { eraseUserByClerkId } from '@/lib/erasure'

type ClerkUserCreatedEvent = {
  type: 'user.created'
  data: {
    id: string
    email_addresses: { email_address: string; id: string }[]
    primary_email_address_id: string
  }
}

type ClerkUserDeletedEvent = {
  type: 'user.deleted'
  data: { id: string }
}

type ClerkEvent = ClerkUserCreatedEvent | ClerkUserDeletedEvent | { type: string; data: unknown }

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

  let event: ClerkEvent
  try {
    const wh = new Webhook(secret)
    event = wh.verify(payload, {
      'svix-id': svixId,
      'svix-timestamp': svixTimestamp,
      'svix-signature': svixSignature,
    }) as ClerkEvent
  } catch {
    return new Response('Invalid signature', { status: 400 })
  }

  // Account deletion in Clerk → GDPR erasure of the local data (Art. 17).
  if (event.type === 'user.deleted') {
    const id = (event as ClerkUserDeletedEvent).data?.id
    if (id) await eraseUserByClerkId(id).catch(e => console.error('[clerk webhook] erasure failed for', id, e))
    return new Response('OK', { status: 200 })
  }

  if (event.type !== 'user.created') {
    return new Response('Ignored', { status: 200 })
  }

  const createdEvent = event as ClerkUserCreatedEvent
  const primaryEmail = createdEvent.data.email_addresses.find(
    (e) => e.id === createdEvent.data.primary_email_address_id
  )

  if (!primaryEmail) {
    return new Response('No primary email', { status: 400 })
  }

  // Upsert by email so a redelivered event, or a Clerk dev→prod instance migration
  // (new clerkId for an existing email), re-links the existing row instead of throwing
  // a unique-constraint error. A pre-existing row keeps its role; new ones default STUDENT.
  await prisma.user.upsert({
    where: { email: primaryEmail.email_address },
    update: { clerkId: createdEvent.data.id },
    create: {
      clerkId: createdEvent.data.id,
      email: primaryEmail.email_address,
      role: 'STUDENT', // default — overwritten during onboarding
    },
  })

  return new Response('OK', { status: 200 })
}
