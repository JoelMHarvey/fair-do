import { auth } from '@clerk/nextjs/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { getStripe } from '@/lib/stripe'
import { ensureTeacherReferralCode, linkTeacherReferral } from '@/lib/teacher-referral'
import { isStateLive } from '@/lib/locale'
import { toE164 } from '@/lib/sms'
import { styledCloudinaryUrl } from '@/lib/cloudinary'
import { z } from 'zod'

const availSchema = z.object({
  dayOfWeek: z.number().int().min(0).max(6),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/),
})

const schema = z.object({
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  bio: z.string().min(50).max(2000),
  sessionRatePence: z.number().int().min(3000).max(50000),
  qualificationBody: z.string().min(1).max(60),
  qualificationRef: z.string().min(1),
  qualificationExpiry: z.string(),
  dbsNumber: z.string().max(60).optional(),
  dbsDate: z.string().optional(),
  licenseState: z.string().max(4).optional(),
  subjects: z.array(z.string()).min(1),
  levels: z.array(z.string()).optional(),
  ageGroups: z.array(z.string()).optional(),
  teachingStyles: z.array(z.string()),
  availability: z.array(availSchema).min(1),
  referralCode: z.string().max(40).optional(),
  // New: profile completeness
  professionalTitle: z.string().max(120).optional(),
  tagline: z.string().max(160).optional(),
  phone: z.string().max(30).optional(),
  photoBaseUrl: z.string().url().optional(),
  photoStyle: z.string().max(20).optional(),
  agreementAccepted: z.literal(true), // Teacher Agreement + DPA — required, recorded
  agreementVersion: z.string().max(40).optional(),
  safeguardingAccepted: z.literal(true), // Safeguarding Policy — required, recorded
  safeguardingPolicyVersion: z.string().max(40).optional(),
})

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return new Response('Unauthorized', { status: 401 })

  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return Response.json({ error: 'Invalid data', details: parsed.error.flatten() }, { status: 400 })
  }

  const data = parsed.data

  const user = await prisma.user.findUnique({ where: { clerkId: userId } })
  if (!user) return new Response('User not found', { status: 404 })
  if (user.role !== 'TEACHER') return new Response('Not a teacher', { status: 403 })

  if (user.country === 'US' && !isStateLive(data.licenseState)) {
    return Response.json({ error: 'fair-do isn\'t accepting teachers in that state yet.' }, { status: 422 })
  }

  // Idempotent — reuse existing record if re-submitting
  let existing = await prisma.teacher.findUnique({ where: { userId: user.id } })

  // Founding-member promo: while the offer is on, new teachers keep 90% (10% fee).
  const foundingOffer = process.env.FOUNDING_OFFER !== 'false' // default ON until disabled

  if (!existing) {
    const now = new Date()
    const photoBaseUrl = data.photoBaseUrl ?? null
    const photoStyle = data.photoStyle ?? 'original'
    existing = await prisma.teacher.create({
      data: {
        userId: user.id,
        firstName: data.firstName,
        lastName: data.lastName,
        professionalTitle: data.professionalTitle ?? null,
        tagline: data.tagline ?? null,
        phone: toE164(data.phone) ?? data.phone ?? null,
        bio: data.bio,
        isFoundingMember: foundingOffer,
        country: user.country,
        licenseState: user.country === 'US' ? (data.licenseState ?? null) : null,
        sessionRatePence: data.sessionRatePence,
        qualificationBody: data.qualificationBody,
        qualificationRef: data.qualificationRef,
        qualificationExpiry: new Date(data.qualificationExpiry),
        dbsNumber: data.dbsNumber ?? null,
        dbsDate: data.dbsDate ? new Date(data.dbsDate) : null,
        subjects: data.subjects,
        levels: data.levels ?? [],
        ageGroups: data.ageGroups ?? [],
        teachingStyles: data.teachingStyles,
        photoBaseUrl,
        photoStyle,
        profileImageUrl: photoBaseUrl ? styledCloudinaryUrl(photoBaseUrl, photoStyle) : null,
        agreementAcceptedAt: now,
        agreementVersion: data.agreementVersion ?? null,
        dpaAcceptedAt: now,
        safeguardingAcceptedAt: now,
        safeguardingPolicyVersion: data.safeguardingPolicyVersion ?? null,
        availability: {
          create: data.availability.map(a => ({
            dayOfWeek: a.dayOfWeek,
            startTime: a.startTime,
            endTime: a.endTime,
          })),
        },
      },
    })

    // Peer referral — give them a code + link to whoever referred them.
    await ensureTeacherReferralCode(existing.id, data.firstName).catch(() => {})
    const jar = await cookies()
    const refCode = (data.referralCode || jar.get('fair-do_ref')?.value)?.toUpperCase()
    if (refCode) {
      await linkTeacherReferral(existing.id, refCode)
      jar.delete('fair-do_ref')
    }
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3001'
  const completeUrl = `${appUrl}/onboarding/teacher/complete`

  // Stripe Connect Express — skip only when Stripe genuinely isn't configured (local dev).
  if (!process.env.STRIPE_SECRET_KEY) {
    return Response.json({ stripeUrl: completeUrl }, { status: 201 })
  }

  try {
    const stripe = getStripe()

    let stripeAccountId = existing.stripeAccountId

    // Discard a stale stored account id — one created under a different Stripe key/mode
    // (e.g. an old test acct after a platform/key change) no longer resolves and would
    // make accountLinks.create throw "No such account". Drop it and create a fresh one.
    if (stripeAccountId) {
      try {
        await stripe.accounts.retrieve(stripeAccountId)
      } catch {
        stripeAccountId = null
      }
    }

    if (!stripeAccountId) {
      // Region-aware Connect account: US teachers onboard as US accounts (USD payouts),
      // UK as GB (GBP). NOTE: requires the matching Stripe *platform* account/region.
      const account = await stripe.accounts.create({
        type: 'express',
        country: user.country === 'US' ? 'US' : 'GB',
        email: user.email,
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
        business_profile: {
          mcc: '8299', // educational services
          url: 'https://fair-do.com',
        },
      })

      stripeAccountId = account.id

      await prisma.teacher.update({
        where: { id: existing.id },
        data: { stripeAccountId },
      })
    }

    const accountLink = await stripe.accountLinks.create({
      account: stripeAccountId,
      refresh_url: `${appUrl}/onboarding/teacher`,
      return_url: completeUrl,
      type: 'account_onboarding',
    })

    return Response.json({ stripeUrl: accountLink.url }, { status: 201 })
  } catch (e) {
    // Surface the real failure instead of silently bouncing the teacher past the bank
    // step (the old bare catch made a genuine Stripe error look like success).
    console.error('[onboarding/teacher] Stripe Connect failed:', e instanceof Error ? e.message : e)
    return Response.json({ error: 'Could not start bank connection. Please try again or contact support.' }, { status: 502 })
  }
}
