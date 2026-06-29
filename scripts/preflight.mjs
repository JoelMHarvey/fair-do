// Production readiness check: node scripts/preflight.mjs
// Reads process.env (run with prod env, or `vercel env pull` first).
const REQUIRED = [
  'DATABASE_URL',
  'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
  'CLERK_SECRET_KEY',
  'CLERK_WEBHOOK_SECRET',
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET',
  'DAILY_API_KEY',
  'RESEND_API_KEY',
  'NEXT_PUBLIC_APP_URL',
]
const RECOMMENDED = ['CRON_SECRET', 'SENTRY_DSN', 'NEXT_PUBLIC_SENTRY_DSN', 'RESEND_FROM', 'COMPLAINTS_EMAIL']

let fail = 0, warn = 0
console.log('Faresay preflight\n')

for (const k of REQUIRED) {
  if (!process.env[k]) { console.log(`  ✗ MISSING  ${k}`); fail++ }
  else console.log(`  ✓ ${k}`)
}

console.log('\nRecommended:')
for (const k of RECOMMENDED) {
  if (!process.env[k]) { console.log(`  ⚠ unset    ${k}`); warn++ }
  else console.log(`  ✓ ${k}`)
}

console.log('\nGo-live checks:')
const sk = process.env.STRIPE_SECRET_KEY ?? ''
if (sk.startsWith('sk_test_')) { console.log('  ⚠ Stripe is in TEST mode (sk_test_) — switch to sk_live_ for real payments'); warn++ }
else if (sk.startsWith('sk_live_')) console.log('  ✓ Stripe LIVE keys')

const pk = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ?? ''
if (pk.startsWith('pk_test_')) { console.log('  ⚠ Clerk is a DEVELOPMENT instance (pk_test_) — create a production instance for launch'); warn++ }
else if (pk.startsWith('pk_live_')) console.log('  ✓ Clerk PRODUCTION instance')

const from = process.env.RESEND_FROM ?? ''
if (from.includes('resend.dev')) { console.log('  ⚠ RESEND_FROM uses resend.dev — verify faresay.com in Resend so mail does not hit spam'); warn++ }

const url = process.env.NEXT_PUBLIC_APP_URL ?? ''
if (!url.startsWith('https://faresay.com')) { console.log(`  ⚠ NEXT_PUBLIC_APP_URL is "${url}" — should be https://faresay.com in production`); warn++ }

console.log(`\n${fail} blocking, ${warn} warnings.`)
process.exit(fail > 0 ? 1 : 0)
