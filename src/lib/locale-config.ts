// Single source of truth for supported locales.
// No server-only restriction — safe to import in middleware and client components.

// Master switch for the whole i18n feature. OFF by default — locale routing,
// the /fr|/de|… pages, the auto-redirect and the language switcher all stay dark
// until a market actually launches. Flip with I18N_ENABLED=true (per env).
export const I18N_ENABLED = process.env.I18N_ENABLED === 'true'

export const LOCALES = ['en', 'fr', 'de', 'it', 'es', 'pt'] as const
export const NON_EN_LOCALES = ['fr', 'de', 'it', 'es', 'pt'] as const
export type Locale = typeof LOCALES[number]
export type NonEnLocale = typeof NON_EN_LOCALES[number]

export function isValidLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value)
}

// Split a request path into its locale and the locale-stripped base path.
// English lives at the root (no prefix); other locales are prefixed (/es/...).
//   /es/pricing → { locale: 'es', basePath: '/pricing', prefixed: true }
//   /es         → { locale: 'es', basePath: '/',        prefixed: true }
//   /pricing    → { locale: 'en', basePath: '/pricing', prefixed: false }
// The middleware rewrites prefixed paths to basePath (carrying x-locale) so the
// existing root pages render in the requested locale at real /es/... URLs.
export function splitLocalePath(pathname: string): { locale: Locale; basePath: string; prefixed: boolean } {
  const seg = pathname.split('/')[1] ?? ''
  if ((NON_EN_LOCALES as readonly string[]).includes(seg)) {
    return { locale: seg as Locale, basePath: pathname.slice(seg.length + 1) || '/', prefixed: true }
  }
  return { locale: 'en', basePath: pathname, prefixed: false }
}

// Shape of a loaded dictionary (en.json is the source of truth). Type-only —
// erased at build, so it's safe to import in client components for `t` props
// (e.g. `t: Messages['gift']`) without bundling the JSON or tripping the
// server-only guard on dictionaries.ts.
export type Messages = typeof import('../messages/en.json')
