import type { NextConfig } from "next";

const securityHeaders = [
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://clerk.fair-do.com https://*.clerk.accounts.dev https://challenges.cloudflare.com https://plausible.io https://upload-widget.cloudinary.com",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self' https://upload-widget.cloudinary.com",
      "connect-src 'self' https://clerk.fair-do.com https://*.clerk.accounts.dev https://*.daily.co wss://*.daily.co https://api.stripe.com https://plausible.io https://challenges.cloudflare.com https://api.cloudinary.com https://res.cloudinary.com https://upload-widget.cloudinary.com",
      "frame-src 'self' https://*.daily.co https://js.stripe.com https://hooks.stripe.com https://challenges.cloudflare.com https://upload-widget.cloudinary.com",
      "worker-src 'self' blob:",
      "media-src 'self' blob:",
    ].join('; '),
  },
]

const nextConfig: NextConfig = {
  // Bundle the founder business-docs markdown into the serverless function (read via fs at runtime).
  outputFileTracingIncludes: {
    '/founder/[slug]': ['./src/content/founder-docs/**'],
    '/founder': ['./src/content/founder-docs/**'],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ]
  },
}

// NOTE: Sentry's withSentryConfig wrapper broke route collection under Next 16 Turbopack
// on Vercel (only the root route compiled). Removed until Sentry fully supports Turbopack builds.
// Instrumentation files + logError seam remain; re-add the wrapper once compatible.
export default nextConfig
