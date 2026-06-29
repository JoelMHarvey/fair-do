import type { MetadataRoute } from 'next'
import { POSTS } from '@/lib/blog'

const BASE = 'https://faresay.com'

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPaths = [
    '', '/tutors', '/about', '/faq', '/for-therapists', '/for-business',
    '/ai-therapy', '/styles', '/help', '/blog', '/gift', '/privacy', '/terms',
  ]
  const now = new Date()
  const pages = staticPaths.map((p) => ({
    url: `${BASE}${p}`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: p === '' ? 1 : 0.7,
  }))
  const localePages = ['/fr', '/de', '/it', '/es', '/pt'].map((p) => ({
    url: `${BASE}${p}`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: 0.9,
  }))
  const posts = POSTS.map((post) => ({
    url: `${BASE}/blog/${post.slug}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }))
  return [...pages, ...localePages, ...posts]
}
