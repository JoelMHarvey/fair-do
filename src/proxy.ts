import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { NON_EN_LOCALES, LOCALES, I18N_ENABLED, type Locale, type NonEnLocale } from '@/lib/locale-config'

// ── Locale helpers ───────────────────────────────────────────────────────────

function getPathLocale(pathname: string): NonEnLocale | null {
  const seg = pathname.split('/')[1] as string
  return (NON_EN_LOCALES as readonly string[]).includes(seg) ? (seg as NonEnLocale) : null
}

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
  // Locale-prefixed public roots — only matched when i18n is enabled.
  ...(I18N_ENABLED ? NON_EN_LOCALES.map(l => `/${l}`) : []),
])

// ── Middleware ───────────────────────────────────────────────────────────────

export default clerkMiddleware(async (auth, request) => {
  // i18n OFF → behave exactly like the single-locale middleware: just gate auth.
  if (!I18N_ENABLED) {
    if (!isPublicRoute(request)) {
      await auth.protect()
    }
    return
  }

  const { pathname } = request.nextUrl
  const pathLocale = getPathLocale(pathname)
  const locale: Locale = pathLocale ?? 'en'

  // Auto-redirect / to the visitor's preferred locale on first visit.
  // If the user has already chosen a locale (cookie present), honour that choice.
  // Clicking the LocaleSwitcher to EN sets NEXT_LOCALE=en, stopping future redirects.
  if (pathname === '/') {
    const cookieLocale = request.cookies.get('NEXT_LOCALE')?.value
    if (!cookieLocale) {
      // No preference saved — negotiate from Accept-Language
      const preferred = negotiateLocale(request.headers.get('accept-language'))
      if (preferred !== 'en') {
        const res = NextResponse.redirect(new URL(`/${preferred}`, request.url))
        res.cookies.set('NEXT_LOCALE', preferred, { path: '/', maxAge: 31_536_000, sameSite: 'lax', secure: true })
        return res
      }
    }
  }

  // Protect non-public routes with Clerk auth
  if (!isPublicRoute(request)) {
    await auth.protect()
  }

  // Forward locale to server components via a request header.
  // Server components read this via: (await headers()).get('x-locale')
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-locale', locale)
  const response = NextResponse.next({ request: { headers: requestHeaders } })

  // Persist locale cookie:
  // - visiting /fr|/de|/it → sets that locale
  // - visiting / → sets 'en' (user chose English, stops Accept-Language redirect loop)
  if (pathLocale) {
    response.cookies.set('NEXT_LOCALE', pathLocale, { path: '/', maxAge: 31_536_000, sameSite: 'lax', secure: true })
  } else if (pathname === '/') {
    response.cookies.set('NEXT_LOCALE', 'en', { path: '/', maxAge: 31_536_000, sameSite: 'lax', secure: true })
  }

  return response
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
    '/__clerk/:path*',
  ],
}
