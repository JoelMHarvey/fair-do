import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { enterprisePortalEnabled } from '@/lib/tenant'
import { requireSchoolMember, SchoolAccessError } from '@/lib/org'
import { getSchoolApiContext } from '@/lib/school'
import { resolveMailGroup, type MailRecipient } from '@/lib/mail-groups'
import { sendSchoolBroadcast } from '@/lib/email'
import type { EmailBrand } from '@/lib/email-brand'
import { checkRateLimit, rateLimitResponse } from '@/lib/ratelimit'
import { z } from 'zod'

const schema = z.object({
  mailGroupId: z.string().min(1),
  subject: z.string().min(1).max(160),
  body: z.string().min(1).max(5000),
})

// Send emails in batches so one Resend hiccup doesn't stall the whole run and
// we don't fire hundreds of concurrent requests. Failure-tolerant: settled
// results are counted, not thrown (same accounting as the practice broadcast).
const BATCH_SIZE = 50

// The school's letterhead for outbound mail — same validation rules as the
// teacher brand (Cloudinary-only logo, #rrggbb colour), resolved from the org row.
function orgEmailBrand(org: { name: string; brandLogoUrl: string | null; brandColor: string | null; footerLine: string | null; contactEmail: string }): EmailBrand {
  return {
    practiceName: org.name,
    logoUrl: org.brandLogoUrl?.startsWith('https://res.cloudinary.com/') ? org.brandLogoUrl : undefined,
    color: /^#[0-9a-fA-F]{6}$/.test(org.brandColor ?? '') ? org.brandColor! : '#4f46e5',
    footerLine: org.footerLine ?? undefined,
    replyTo: org.contactEmail || undefined,
  }
}

function firstNameOf(r: MailRecipient): string {
  return r.name?.split(/\s+/)[0] || 'there'
}

// POST /api/school/broadcast — resolve the mail group at send time and send the
// announcement through the same Resend pipeline as practice broadcasts, then
// store the audit row on Broadcast.
export async function POST(req: Request) {
  if (!enterprisePortalEnabled()) return new Response('Not found', { status: 404 })

  try {
    const { tenantScopedOrgId } = await getSchoolApiContext()
    // STAFF may broadcast too (plan §3: staff broadcast to their groups).
    // TODO(per-group ownership): v1 lets STAFF send to ANY of the school's
    // groups — MailGroup has no owner yet. Add an ownership/allowlist model
    // before schools with delegated heads-of-year rely on this.
    const { org } = await requireSchoolMember(tenantScopedOrgId)
    const { userId } = await auth()

    // Per-ORG limit (not per-user): a school's domain reputation is shared, so
    // two admins can't double the school's send budget.
    const rl = await checkRateLimit(`school-broadcast:${org.id}`, { limit: 5, windowMs: 60 * 60_000 })
    if (!rl.allowed) return rateLimitResponse(rl.retryAfterMs)

    const parsed = schema.safeParse(await req.json())
    if (!parsed.success) return Response.json({ error: 'Invalid data' }, { status: 400 })
    const { mailGroupId, subject, body } = parsed.data

    const recipients = await resolveMailGroup(mailGroupId, org.id)
    if (recipients === null) return Response.json({ error: 'Mail group not found' }, { status: 404 })
    if (recipients.length === 0) {
      return Response.json({ error: 'This group currently resolves to no one with an email address.' }, { status: 422 })
    }

    const brand = orgEmailBrand(org)
    let delivered = 0
    for (let i = 0; i < recipients.length; i += BATCH_SIZE) {
      const batch = recipients.slice(i, i + BATCH_SIZE)
      const results = await Promise.allSettled(
        batch.map(r =>
          sendSchoolBroadcast({
            to: r.email,
            recipientFirstName: firstNameOf(r),
            schoolName: org.name,
            subject,
            body,
            brand,
          }),
        ),
      )
      delivered += results.filter(r => r.status === 'fulfilled').length
    }

    await prisma.broadcast.create({
      data: {
        organisationId: org.id,
        mailGroupId,
        sentByClerkId: userId ?? null,
        subject,
        body,
        recipientCount: delivered,
      },
    })

    return Response.json({ recipientCount: delivered, attempted: recipients.length }, { status: 201 })
  } catch (e) {
    if (e instanceof SchoolAccessError) return Response.json({ error: 'School access required' }, { status: 403 })
    throw e
  }
}
