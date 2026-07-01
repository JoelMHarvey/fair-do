import { auth } from '@clerk/nextjs/server'
import { z } from 'zod'
import { extractCredential } from '@/lib/credential-extraction'

// Stateless extraction endpoint — no DB write. Called immediately after a teacher
// uploads their credential document during onboarding. Returns Claude's extraction
// result so the UI can show inline confirmation and flag mismatches before submit.

const schema = z.object({
  url:  z.string().url(),
  name: z.string().min(1).max(200),
  body: z.string().min(1).max(60),
  ref:  z.string().min(1).max(100),
})

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return new Response('Unauthorized', { status: 401 })

  const body = await req.json().catch(() => null)
  const parsed = schema.safeParse(body)
  if (!parsed.success) return Response.json({ error: 'Invalid request' }, { status: 400 })

  const { url, name, body: qualBody, ref } = parsed.data

  const result = await extractCredential(url, { name, body: qualBody, ref })
  return Response.json(result)
}
