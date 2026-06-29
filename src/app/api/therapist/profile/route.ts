import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { styledCloudinaryUrl } from '@/lib/cloudinary'
import { z } from 'zod'

const urlOrEmpty = z.string().url().or(z.literal('')).optional()

const schema = z.object({
  tagline: z.string().max(120).optional(),
  bio: z.string().min(50).max(2000).optional(),
  sessionRatePence: z.number().int().min(3000).max(20000).optional(),
  introRatePence: z.number().int().min(1000).max(50000).nullable().optional(),
  groupRatePence: z.number().int().min(1000).max(50000).nullable().optional(),
  groupMaxSize: z.number().int().min(1).max(12).optional(),
  availableForNew: z.boolean().optional(),
  languages: z.array(z.string().max(40)).max(30).optional(),
  websiteUrl: urlOrEmpty,
  linkedinUrl: urlOrEmpty,
  introVideoUrl: urlOrEmpty,
  profileImageUrl: urlOrEmpty,
  photoBaseUrl: urlOrEmpty,
  photoStyle: z.enum(['original', 'blurred', 'illustrated']).optional(),
})

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return new Response('Unauthorized', { status: 401 })

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: { teacher: true },
  })
  if (!user?.teacher) return new Response('Not a teacher', { status: 403 })

  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return Response.json({ error: parsed.error.issues[0]?.message ?? 'Invalid' }, { status: 400 })

  const d = parsed.data
  // Empty strings → null for optional URL columns
  const clean = (v: string | undefined) => (v === '' ? null : v)

  // Intro rate must be below the (possibly updated) standard rate
  const effectiveStandard = d.sessionRatePence ?? user.teacher.sessionRatePence
  if (d.introRatePence != null && d.introRatePence >= effectiveStandard) {
    return Response.json({ error: 'First-session rate must be below your standard rate' }, { status: 400 })
  }

  await prisma.teacher.update({
    where: { id: user.teacher.id },
    data: {
      ...(d.tagline !== undefined && { tagline: d.tagline || null }),
      ...(d.bio !== undefined && { bio: d.bio }),
      ...(d.sessionRatePence !== undefined && { sessionRatePence: d.sessionRatePence }),
      ...(d.introRatePence !== undefined && { introRatePence: d.introRatePence }),
      ...(d.groupRatePence !== undefined && { groupRatePence: d.groupRatePence }),
      ...(d.groupMaxSize !== undefined && { groupMaxSize: d.groupMaxSize }),
      ...(d.availableForNew !== undefined && { availableForNew: d.availableForNew }),
      ...(d.languages !== undefined && { languages: d.languages.length ? d.languages : ['English'] }),
      ...(d.websiteUrl !== undefined && { websiteUrl: clean(d.websiteUrl) }),
      ...(d.linkedinUrl !== undefined && { linkedinUrl: clean(d.linkedinUrl) }),
      ...(d.introVideoUrl !== undefined && { introVideoUrl: clean(d.introVideoUrl) }),
      ...(d.profileImageUrl !== undefined && { profileImageUrl: clean(d.profileImageUrl) }),
      // Photo: store the base + style, and bake the styled URL into profileImageUrl (used everywhere for display)
      ...(d.photoBaseUrl !== undefined && {
        photoBaseUrl: clean(d.photoBaseUrl),
        photoStyle: d.photoStyle ?? 'original',
        profileImageUrl: styledCloudinaryUrl(clean(d.photoBaseUrl), d.photoStyle ?? 'original'),
      }),
    },
  })

  return Response.json({ ok: true })
}
