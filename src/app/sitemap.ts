import type { MetadataRoute } from 'next'
import { POSTS } from '@/lib/blog'
import { NON_EN_LOCALES, I18N_ENABLED } from '@/lib/locale-config'
import { localeUrl, hreflangLanguages } from '@/lib/i18n-seo'

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPaths = [
    '', '/tutors', '/about', '/faq', '/for-tutors', '/for-schools',
    '/ai-tutoring', '/styles', '/help', '/blog', '/gift', '/privacy', '/terms',
  ]
  const now = new Date()

  // For each path emit the English URL plus, when i18n is on, every locale
  // version — each entry carrying the full hreflang alternates set.
  const pages: MetadataRoute.Sitemap = []
  for (const p of staticPaths) {
    const languages = hreflangLanguages(p)
    const priority = p === '' ? 1 : 0.7
    pages.push({
      url: localeUrl(p, 'en'),
      lastModified: now,
      changeFrequency: 'weekly',
      priority,
      ...(languages ? { alternates: { languages } } : {}),
    })
    if (I18N_ENABLED) {
      for (const l of NON_EN_LOCALES) {
        pages.push({
          url: localeUrl(p, l),
          lastModified: now,
          changeFrequency: 'weekly',
          priority: p === '' ? 0.9 : 0.6,
          alternates: { languages },
        })
      }
    }
  }

  const posts = POSTS.map((post) => ({
    url: localeUrl(`/blog/${post.slug}`, 'en'),
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }))

  return [...pages, ...posts]
}
