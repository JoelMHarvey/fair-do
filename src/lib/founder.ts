import { auth, clerkClient } from '@clerk/nextjs/server'
import { promises as fs } from 'fs'
import path from 'path'
import { isAdminEmail } from '@/lib/admin'

// Founder/admin business documentation portal. Gated to the full-access allowlist
// (see lib/admin.ts — joelmharvey@gmail.com, admin@fair-do.com, support@fair-do.com).
export const FOUNDER_EMAIL = (process.env.FOUNDER_EMAIL ?? 'joelmharvey@gmail.com').toLowerCase()

export async function isFounder(): Promise<boolean> {
  const { userId } = await auth()
  if (!userId) return false
  try {
    const clerk = await clerkClient()
    const user = await clerk.users.getUser(userId)
    return user.emailAddresses.some(e => isAdminEmail(e.emailAddress))
  } catch {
    return false
  }
}

export type DocMeta = { slug: string; title: string }
export type DocCategory = 'current' | 'archive'
export type DocGroup = { title: string; category: DocCategory; docs: DocMeta[] }

export const DOC_GROUPS: DocGroup[] = [
  {
    title: 'Strategy & build',
    category: 'current',
    docs: [
      { slug: 'project', title: '★ Project Roadmap' },
      { slug: 'teacher-app-plan', title: '★ Teacher App — Dev Plan (Phase 1 + Phase 2)' },
      { slug: 'technical-spec', title: 'Technical Specification' },
      { slug: 'future-plans', title: 'Future Plans Review' },
      { slug: 'scale', title: 'Scale & Expansion' },
      { slug: 'us-expansion', title: 'US Expansion Plan' },
    ],
  },
  {
    title: 'Launch & ops',
    category: 'current',
    docs: [
      { slug: 'launch-tracker', title: '◷ Launch Tracker (UK + US)' },
      { slug: 'launch', title: 'Launch Checklist' },
      { slug: 'phase-2-launch', title: '▸ Phase 2 Launch Checklist' },
      { slug: 'stripe-vercel', title: '▸ Stripe → Vercel Setup' },
      { slug: 'stripe-golive', title: 'Stripe Go-Live (Connect)' },
      { slug: 'uat', title: 'UAT' },
      { slug: 'observability', title: 'Observability' },
      { slug: 'security', title: 'Security' },
    ],
  },
  {
    title: 'Go-to-market & legal',
    category: 'current',
    docs: [
      { slug: 'marketing', title: 'Marketing' },
      { slug: 'recruitment', title: 'Recruitment' },
      { slug: 'referral', title: 'Referral — Free Month Plan' },
      { slug: 'legal-brief', title: '⚖ Legal Brief' },
      { slug: 'us-legal-ny', title: '⚖ US Legal — New York' },
      { slug: 'credential-verification', title: 'Credential Verification' },
      { slug: 'i18n-plan', title: 'i18n Plan' },
      { slug: 'inbox-agent', title: 'Inbox Agent Spec' },
    ],
  },
]

// Slug → source file path (relative to the repo root).
const FILE_BY_SLUG: Record<string, string> = {
  project: 'PROJECT.md',
  'teacher-app-plan': 'docs/teacher-app-plan.md',
  'technical-spec': 'docs/TECHNICAL-SPEC.md',
  'future-plans': 'docs/FUTURE-PLANS-REVIEW.md',
  scale: 'docs/SCALE-AND-EXPANSION.md',
  'us-expansion': 'docs/US-EXPANSION-PLAN.md',
  'launch-tracker': 'docs/LAUNCH-TRACKER.md',
  launch: 'docs/LAUNCH.md',
  'phase-2-launch': 'docs/PHASE-2-LAUNCH.md',
  'stripe-vercel': 'docs/STRIPE-VERCEL-SETUP.md',
  'stripe-golive': 'docs/STRIPE-GOLIVE.md',
  uat: 'docs/UAT.md',
  observability: 'docs/OBSERVABILITY.md',
  security: 'docs/SECURITY.md',
  marketing: 'docs/MARKETING.md',
  recruitment: 'docs/RECRUITMENT.md',
  referral: 'docs/REFERRAL-FREE-MONTH-PLAN.md',
  'legal-brief': 'docs/LEGAL-BRIEF.md',
  'us-legal-ny': 'docs/US-LEGAL-NY.md',
  'credential-verification': 'docs/CREDENTIAL-VERIFICATION.md',
  'i18n-plan': 'docs/I18N-PLAN.md',
  'inbox-agent': 'docs/INBOX-AGENT-SPEC.md',
}

const ALL_SLUGS = new Set(DOC_GROUPS.flatMap(g => g.docs.map(d => d.slug)))
const TITLE_BY_SLUG = new Map(DOC_GROUPS.flatMap(g => g.docs.map(d => [d.slug, d.title] as const)))

export function docTitle(slug: string): string | undefined {
  return TITLE_BY_SLUG.get(slug)
}

export type SearchDoc = { slug: string; title: string; group: string; text: string }

// Crude markdown → plaintext for client-side search (titles + body).
function stripMarkdown(md: string): string {
  return md
    .replace(/```[\s\S]*?```/g, ' ')          // fenced code blocks
    .replace(/`([^`]+)`/g, '$1')              // inline code
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')    // images
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')  // links → link text
    .replace(/^\s*[>#|]+/gm, ' ')             // line-leading markers
    .replace(/[*_~#>|]/g, ' ')                // residual markers + table pipes
    .replace(/\s+/g, ' ')                     // collapse whitespace
    .trim()
}

// Build a searchable index of every doc in the portal (read once per page load).
export async function buildSearchIndex(): Promise<SearchDoc[]> {
  const flat = DOC_GROUPS.flatMap(group => group.docs.map(d => ({ ...d, group: group.title })))
  const docs = await Promise.all(
    flat.map(async d => {
      const md = await readDoc(d.slug)
      return md == null ? null : { slug: d.slug, title: d.title, group: d.group, text: stripMarkdown(md) }
    }),
  )
  return docs.filter((d): d is SearchDoc => d !== null)
}

export async function readDoc(slug: string): Promise<string | null> {
  if (!ALL_SLUGS.has(slug)) return null
  const file = FILE_BY_SLUG[slug]
  if (!file) return null
  try {
    return await fs.readFile(path.join(process.cwd(), file), 'utf8')
  } catch {
    return null
  }
}
