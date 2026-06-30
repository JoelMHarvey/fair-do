import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse, NextRequest, type NextFetchEvent } from 'next/server'
import { LOCALES, I18N_ENABLED, splitLocalePath, isValidLocale, type Locale } from '@/lib/locale-config'

// ── Locale helpers ───────────────────────────────────────────────────────────

// Negotiate locale from Accept-Language header (no external deps).
function negotiateLocale(acceptLanguage: string | null): Locale {
  if (!acceptLanguage) return 'en'
  const supported: Locale[] = [...LOCALES]
  const prefs = acceptLanguage
    .split(',')
    .slice(0, 10)
    .map(part => {
      const [lang, q = '1'] = part.trim().split(';q=')
      const qVal = parseFloat(q)
      return { lang: lang.split('-')[0].toLowerCase(), q: isNaN(qVal) ? 1 : Math.min(Math.max(qVal, 0), 1) }
    })
    .filter(p => p.q > 0)
    .sort((a, b) => b.q - a.q)
  for (const { lang } of prefs) {
    const hit = supported.find(s => s === lang)
    if (hit) return hit
  }
  return 'en'
}

// ── Route matchers ───────────────────────────────────────────────────────────

const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/sign-out',
  '/about',
  '/values',
  '/faq',
  '/privacy',
  '/terms',
  '/complaints',
  '/help',
  '/styles',
  '/ai-tutoring',
  '/blog',
  '/blog/(.*)',
  '/for-schools',
  '/for-tutors',
  '/pricing',
  '/pricing/(.*)',
  '/compare',
  '/gift',
  '/gift/success',
  '/tutors',
  '/tutors/(.+)',
  '/r/(.*)',
  '/api/webhooks/(.*)',
  '/api/gift/create',
  '/api/health',
  '/api/metrics',
  '/api/cron/(.*)',
  '/api/calendar/(.*)',
  '/forms/(.+)',
  '/api/forms/(.*)',
  '/p/(.+)',
  '/session/(.+)',
  '/api/practice/self-book',
  '/api/practice/self-book/confirm',
])

// ── Middleware ───────────────────────────────────────────────────────────────

const clerkAuth = clerkMiddleware(async (auth, request) => {
  // i18n OFF → behave exactly like the single-locale middleware: just gate auth.
  if (!I18N_ENABLED) {
    if (!isPublicRoute(request)) {
      await auth.protect()
    }
    return
  }

  const { pathname } = request.nextUrl
  const { locale, basePath, prefixed } = splitLocalePath(pathname)
  const cookieOpts = { path: '/', maxAge: 31_536_000, sameSite: 'lax' as const, secure: true }

  // At the root, send the visitor to their locale's prefixed home.
  // - saved non-English choice (NEXT_LOCALE cookie) → honour it on return visits
  // - no saved choice → negotiate from Accept-Language
  // - explicit English (cookie 'en', set by the LocaleSwitcher) → stay at root
  if (pathname === '/') {
    const cookieLocale = request.cookies.get('NEXT_LOCALE')?.value
    const target = cookieLocale
      ? (isValidLocale(cookieLocale) ? cookieLocale : 'en')
      : negotiateLocale(request.headers.get('accept-language'))
    if (target !== 'en') {
      const res = NextResponse.redirect(new URL(`/${target}`, request.url))
      res.cookies.set('NEXT_LOCALE', target, cookieOpts)
      return res
    }
  }

  // Auth is checked against the locale-stripped path so /es/dashboard gates the
  // same as /dashboard (and /es/pricing stays public like /pricing).
  const baseReq = prefixed
    ? new NextRequest(new URL(basePath + request.nextUrl.search, request.url), request)
    : request
  if (!isPublicRoute(baseReq)) {
    await auth.protect()
  }

  // Forward locale to server components via a request header.
  // Server components read this via: (await headers()).get('x-locale')
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-locale', locale)

  // Prefixed locale paths (/es/pricing) are rewritten to the base route
  // (/pricing) so the existing root pages render in that locale — the browser
  // URL stays /es/pricing. English paths pass through unchanged.
  let response: NextResponse
  if (prefixed) {
    const url = request.nextUrl.clone()
    url.pathname = basePath
    response = NextResponse.rewrite(url, { request: { headers: requestHeaders } })
    response.cookies.set('NEXT_LOCALE', locale, cookieOpts)
  } else {
    response = NextResponse.next({ request: { headers: requestHeaders } })
    if (pathname === '/') response.cookies.set('NEXT_LOCALE', 'en', cookieOpts)
  }

  return response
})

// Fail fast with a clear, actionable message when Clerk isn't configured. Without
// this, clerkMiddleware throws a cryptic "Missing publishableKey" on every request
// and the deploy shows a generic 500 — common on Vercel Preview deploys that have
// no env vars set. See docs/LAUNCH.md for the full env list.
export default function middleware(request: NextRequest, event: NextFetchEvent) {
  if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || !process.env.CLERK_SECRET_KEY) {
    console.error(
      '[fair-do] Authentication is not configured: set NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ' +
      'and CLERK_SECRET_KEY (use Clerk development keys for Preview deploys) in the Vercel ' +
      'project environment variables, then redeploy.',
    )
    return new NextResponse(
      'fair-do is not configured.\n\n' +
      'Missing authentication keys (Clerk). Set NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY and ' +
      'CLERK_SECRET_KEY — plus the rest of the runtime env (see docs/LAUNCH.md) — in the ' +
      'Vercel project for this environment, then redeploy.\n\n' +
      'Preview deploys must use Clerk *development* keys (pk_test_/sk_test_); live keys are ' +
      'locked to the production domain.',
      { status: 503, headers: { 'content-type': 'text/plain; charset=utf-8' } },
    )
  }
  return clerkAuth(request, event)
}

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
    '/__clerk/:path*',
  ],
}
