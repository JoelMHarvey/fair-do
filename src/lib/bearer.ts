import { timingSafeEqual } from 'crypto'

// Constant-time check of an `Authorization: Bearer <secret>` header against a
// configured secret. Fails closed when the secret is unset. Mirrors the
// timingSafeEqual pattern already used in the Daily webhook route.
export function bearerOk(authHeader: string | null, secret: string | undefined): boolean {
  if (!secret || !authHeader?.startsWith('Bearer ')) return false
  const a = Buffer.from(authHeader.slice(7))
  const b = Buffer.from(secret)
  return a.length === b.length && timingSafeEqual(a, b)
}
