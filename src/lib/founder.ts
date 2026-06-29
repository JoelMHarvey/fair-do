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
  // ── CURRENT — practice portal (B2B SaaS, subscription + small commission) ──
  {
    title: 'Strategy & build',
    category: 'current',
    docs: [
      { slug: 'technical-spec', title: '★ Technical Specification (architecture, stack, data model)' },
      { slug: 'model-comparison', title: '★ Marketplace vs Practice Portal — Comparison' },
      { slug: 'pivot-project-plan', title: '◷ Project Plan & Tracker (living)' },
      { slug: 'practice-portal-golive', title: '▸ Go-Live Runbook (design partner)' },
      { slug: 'pp-validation-plan', title: '✓ Design-Partner Validation Plan' },
      { slug: 'pp-recruitment-assets', title: 'Design-Partner Recruitment Assets' },
      { slug: 'pp-native-app-plan', title: 'Native App Plan (Capacitor)' },
      { slug: 'pp-calendar-sync-plan', title: 'Two-Way Calendar Sync — Plan' },
      { slug: 'pp-competitive-features', title: '★ Competitor Features — What to Adopt' },
      { slug: 'therapist-portal-pivot', title: 'Pivot Plan — Therapist Practice Portal' },
      { slug: 'pp-business-plan', title: 'Business Plan' },
      { slug: 'pp-gtm-strategy', title: 'Go-To-Market (B2B SaaS)' },
      { slug: 'pp-customer-persona', title: 'Customer Personas' },
      { slug: 'pp-business-model-canvas', title: 'Business Model Canvas' },
      { slug: 'pp-product-requirements-document', title: 'Product Requirements' },
      { slug: 'pp-market-research-synthesis', title: 'Market Research' },
      { slug: 'pp-risk-register', title: 'Risk Register' },
      { slug: 'pp-financial-model', title: 'Financial Model' },
    ],
  },
  {
    title: 'UK legal — solicitor pack',
    category: 'current',
    docs: [
      { slug: 'pp-uk-business-overview', title: 'UK Business Overview' },
      { slug: 'pp-uk-legal-brief', title: '⚖ UK Legal Brief & Questions' },
    ],
  },
  {
    title: 'UK policies — practice portal (draft for sign-off)',
    category: 'current',
    docs: [
      { slug: 'pp-terms-of-service', title: 'Terms of Service (SaaS subscription)' },
      { slug: 'pp-privacy-policy', title: 'Privacy Policy' },
      { slug: 'pp-dpa', title: '⚖ Data Processing Agreement (Art 28)' },
      { slug: 'pp-toms', title: 'Technical & Organisational Measures (Annex 2)' },
      { slug: 'pp-sub-processors', title: 'Sub-processor List (Annex 3)' },
      { slug: 'pp-ropa', title: 'Record of Processing Activities (Art 30)' },
      { slug: 'pp-dpia', title: '⚖ Data Protection Impact Assessment (Art 35)' },
      { slug: 'pp-security-data-protection-policy', title: 'Security & Data Protection' },
      { slug: 'pp-clinical-governance-policy', title: 'Clinical Governance' },
      { slug: 'pp-crisis-safeguarding-policy', title: 'Crisis & Safeguarding' },
    ],
  },
  {
    title: 'Internal context',
    category: 'current',
    docs: [
      { slug: 'weekly-summary', title: '◷ Weekly Build Summary' },
      { slug: 'context', title: 'Context Primer' },
      { slug: 'handoff', title: 'Handoff Notes' },
    ],
  },
]

// Slug → source filename (some files are upper-case on disk).
const FILE_BY_SLUG: Record<string, string> = {
  context: 'CONTEXT.md',
  handoff: 'HANDOFF.md',
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
  const file = FILE_BY_SLUG[slug] ?? `${slug}.md`
  try {
    const full = path.join(process.cwd(), 'src/content/founder-docs', file)
    return await fs.readFile(full, 'utf8')
  } catch {
    return null
  }
}
