import Link from 'next/link'
import { Show, UserButton } from '@clerk/nextjs'
import { auth } from '@clerk/nextjs/server'
import { headers } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { Logo } from './Logo'
import { MobileMenu } from './MobileMenu'
import { LocaleSwitcher } from './LocaleSwitcher'
import { I18N_ENABLED } from '@/lib/locale-config'
import { isFounder } from '@/lib/founder'
import { getDictionary, isValidLocale, type Locale } from '@/lib/dictionaries'
import { PRACTICE_PORTAL_ENABLED, DIRECTORY_ENABLED } from '@/lib/practice'
import { getTenant } from '@/lib/tenant'

export async function SiteNav() {
  // Public pages must render even if auth/DB is briefly unavailable — degrade to a
  // logged-out nav rather than 500ing the whole page on a Clerk/Prisma hiccup.
  // Allowlist (founder) accounts are admins too — show the Admin link for them, not just role === 'ADMIN'.
  let founder = false
  let isAdmin = false
  try {
    const { userId } = await auth()
    if (userId) {
      const [user, isFounderUser] = await Promise.all([
        prisma.user.findUnique({ where: { clerkId: userId }, select: { role: true } }),
        isFounder(),
      ])
      founder = isFounderUser
      isAdmin = isFounderUser || user?.role === 'ADMIN'
    }
  } catch (e) {
    console.error('[SiteNav] auth/db lookup failed; rendering logged-out nav', e)
  }

  const rawLocale = (await headers()).get('x-locale') ?? 'en'
  const locale: Locale = isValidLocale(rawLocale) ? rawLocale : 'en'
  const { nav } = await getDictionary(locale)

  // Tenant (school) hosts show the school's logo/name in place of the fair-do
  // mark. Same degrade-to-default posture as the auth lookup above.
  let tenantLogo: { name: string; logoUrl: string | null } | null = null
  try {
    const tenant = await getTenant()
    if (tenant) {
      tenantLogo = {
        name: tenant.name,
        logoUrl: tenant.brandLogoUrl?.startsWith('https://res.cloudinary.com/') ? tenant.brandLogoUrl : null,
      }
    }
  } catch (e) {
    console.error('[SiteNav] tenant lookup failed; rendering fair-do logo', e)
  }

  const centerLinks = PRACTICE_PORTAL_ENABLED
    ? [
        { href: '/for-tutors', label: nav.features },
        { href: '/pricing', label: nav.pricing },
        ...(DIRECTORY_ENABLED ? [{ href: '/tutors', label: nav.find_tutor }] : []),
      ]
    : [
        ...(DIRECTORY_ENABLED ? [{ href: '/tutors', label: nav.find_tutor }] : []),
        { href: '/styles', label: nav.subjects },
        { href: '/#how', label: nav.how_it_works },
        { href: '/faq', label: nav.faq },
      ]
  const cta = PRACTICE_PORTAL_ENABLED
    ? { href: '/sign-up?role=teacher', label: nav.cta_practice }
    : { href: '/sign-up', label: nav.cta_marketplace }

  return (
    <>
    <nav aria-label="Main" className="sticky top-0 z-50 border-b border-sand-200/70 bg-sand-50/80 backdrop-blur-md">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[100] focus:bg-white focus:text-brand-700 focus:px-4 focus:py-2 focus:rounded-lg focus:shadow-lg focus:text-sm focus:font-medium">
        Skip to main content
      </a>
      <div className="max-w-6xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
        <Logo tenant={tenantLogo} />
        <div className="hidden sm:flex items-center gap-7 text-sm text-sand-700">
          {centerLinks.map(l => (
            <Link key={l.href} href={l.href} className="hover:text-brand-700 transition">{l.label}</Link>
          ))}
        </div>
        <div className="hidden sm:flex items-center gap-3">
          {founder && (
            <Link href="/founder" className="text-sm font-medium text-brand-700 hover:text-brand-800 transition">
              Docs
            </Link>
          )}
          {isAdmin && (
            <Link href="/admin" className="text-sm font-medium text-coral-600 hover:text-coral-700 transition">
              Admin
            </Link>
          )}
          {I18N_ENABLED && <LocaleSwitcher />}
          <Show when="signed-out">
            <Link href="/sign-in" className="text-sm font-medium text-sand-700 hover:text-brand-700 transition">
              {nav.sign_in}
            </Link>
            <Link
              href={cta.href}
              className="text-sm font-medium bg-brand-600 text-white px-4 py-2 rounded-full hover:bg-brand-700 transition shadow-sm"
            >
              {cta.label}
            </Link>
          </Show>
          <Show when="signed-in">
            <Link href="/dashboard" className="text-sm font-medium text-sand-700 hover:text-brand-700 transition">
              {nav.dashboard}
            </Link>
            <UserButton />
          </Show>
        </div>
        <MobileMenu isAdmin={isAdmin} isFounder={founder} links={centerLinks} cta={cta} />
      </div>
    </nav>
    </>
  )
}
