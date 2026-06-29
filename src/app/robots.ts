import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/api/', '/dashboard', '/messages', '/session', '/onboarding',
        '/admin', '/therapist', '/availability', '/org', '/sign-in', '/sign-out',
      ],
    },
    sitemap: 'https://faresay.com/sitemap.xml',
  }
}
