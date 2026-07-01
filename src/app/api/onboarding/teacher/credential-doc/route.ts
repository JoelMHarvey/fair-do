import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { extractCredential } from '@/lib/credential-extraction'
import { z } from 'zod'

// Called after the teacher uploads a document to Cloudinary (client-side via the
// Cloudinary Upload Widget). Stores the URL on the Teacher record and triggers
// synchronous Claude extraction so the admin panel has results immediately.
//
// Two call modes:
//   1. During initial onboarding (no Teacher record yet): returns extraction only.
//      The URL is sent with the main onboarding form submission.
//   2. Profile update (Teacher exists): saves URL + creates CredentialDocument.

const schema = z.object({
  url:      z.string().url(),
  fileName: z.string().max(260).optional(),
  // Declared values for comparison — sent from the form that is currently open.
  name: z.string().max(200).optional(),
  body: z.string().max(60).optional(),
  ref:  z.string().max(100).optional(),
})

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return new Response('Unauthorized', { status: 401 })

  const body = await req.json().catch(() => null)
  const parsed = schema.safeParse(body)
  if (!parsed.success) return Response.json({ error: 'Invalid request' }, { status: 400 })

  const { url, fileName, name = '', body: qualBody = '', ref = '' } = parsed.data

  // Run Claude extraction immediately (synchronous; ~2–4s).
  const extraction = await extractCredential(url, { name, body: qualBody, ref })

  // If the teacher record already exists (profile edit path), persist the document.
  const user = await prisma.user.findUnique({ where: { clerkId: userId } })
  const teacher = user ? await prisma.teacher.findUnique({ where: { userId: user.id } }) : null

  if (teacher) {
    // Update the quick-access URL on the Teacher record.
    await prisma.teacher.update({
      where: { id: teacher.id },
      data: { credentialDocUrl: url },
    })

    // Persist the extraction audit record.
    // Raw SQL until prisma generate runs against the new schema.
    try {
      await prisma.$executeRaw`
        INSERT INTO "CredentialDocument"
          ("id", "teacherId", "url", "fileName", "uploadedAt",
           "extractedAt", "extractedName", "extractedBody", "extractedRef",
           "extractedExpiry", "confidenceScore", "flags")
        VALUES (
          gen_random_uuid()::text, ${teacher.id}, ${url}, ${fileName ?? null}, NOW(),
          NOW(), ${extraction.extractedName}, ${extraction.extractedBody},
          ${extraction.extractedRef}, ${extraction.extractedExpiry ?? null},
          ${extraction.confidenceScore}, ${extraction.flags}
        )
      `
    } catch (e) {
      // Table not yet created (pre-migration) — log and continue.
      console.warn('[credential-doc] CredentialDocument insert skipped (pre-migration?):', e instanceof Error ? e.message : e)
    }
  }

  return Response.json({ url, extraction })
}
