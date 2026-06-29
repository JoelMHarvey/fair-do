import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

// Referral link: /r/CODE → remember the code, send to sign-up.
export async function GET(_req: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params
  const jar = await cookies()
  jar.set('fair-do_ref', code.toUpperCase().slice(0, 40), {
    maxAge: 60 * 60 * 24 * 30, // 30 days
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
  })
  redirect('/sign-up')
}
