import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { isAdminUser } from '@/lib/admin'
import { generateCredentialReview, type TeacherForReview } from '@/lib/credential-review'
import { z } from 'zod'

// Admin-only: generate an AI review summary for a pending teacher application.
// Aggregates the teacher's declared data, any uploaded certificate extraction,
// and DBS status into a structured recommendation.

const schema = z.object({ teacherId: z.string().min(1) })

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return new Response('Unauthorized', { status: 401 })

  const user = await prisma.user.findUnique({ where: { clerkId: userId } })
  if (!isAdminUser(user)) return new Response('Forbidden', { status: 403 })

  const body = await req.json().catch(() => null)
  const parsed = schema.safeParse(body)
  if (!parsed.success) return Response.json({ error: 'Invalid request' }, { status: 400 })

  const teacher = await prisma.teacher.findUnique({
    where: { id: parsed.data.teacherId },
    include: {
      // credentialDocuments is new — safely handled below with type cast
    },
  })
  if (!teacher) return Response.json({ error: 'Not found' }, { status: 404 })

  // Load the most recent credential document with extraction results.
  // Using prisma.$queryRaw to work before a full Prisma client regeneration.
  // Once `prisma generate` runs against the updated schema this can use
  // prisma.credentialDocument.findFirst(...)
  let credentialDoc: TeacherForReview['credentialDoc'] = null
  try {
    type RawDoc = {
      extractedName: string | null
      extractedBody: string | null
      extractedRef: string | null
      extractedExpiry: Date | null
      confidenceScore: number | null
      flags: string[]
    }
    const docs = await prisma.$queryRaw<RawDoc[]>`
      SELECT "extractedName", "extractedBody", "extractedRef", "extractedExpiry",
             "confidenceScore", "flags"
      FROM "CredentialDocument"
      WHERE "teacherId" = ${teacher.id}
      ORDER BY "uploadedAt" DESC
      LIMIT 1
    `
    if (docs.length > 0) {
      credentialDoc = {
        extractedName:    docs[0].extractedName,
        extractedBody:    docs[0].extractedBody,
        extractedRef:     docs[0].extractedRef,
        extractedExpiry:  docs[0].extractedExpiry ? new Date(docs[0].extractedExpiry) : null,
        confidenceScore:  docs[0].confidenceScore ? Number(docs[0].confidenceScore) : null,
        flags:            Array.isArray(docs[0].flags) ? docs[0].flags : [],
      }
    }
  } catch {
    // Table may not exist yet (pre-migration). credentialDoc stays null.
  }

  const teacherForReview: TeacherForReview = {
    firstName:          teacher.firstName,
    lastName:           teacher.lastName,
    qualificationBody:  teacher.qualificationBody,
    qualificationRef:   teacher.qualificationRef,
    qualificationExpiry: teacher.qualificationExpiry,
    dbsNumber:          teacher.dbsNumber,
    dbsDate:            teacher.dbsDate,
    // New fields — safely typed with fallback
    dbsCheckStatus:     (teacher as Record<string, unknown>).dbsCheckStatus as string | null ?? null,
    dbsLastCheckedAt:   (teacher as Record<string, unknown>).dbsLastCheckedAt as Date | null ?? null,
    credentialDoc,
  }

  const review = await generateCredentialReview(teacherForReview)
  if (!review) return Response.json({ error: 'AI review unavailable' }, { status: 503 })

  return Response.json(review)
}
