import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// ── Mail groups (fair-do for Schools, plan §3.4) ─────────────────────────────
// A MailGroup is either RULE-BASED (MailGroup.rule JSON, resolved fresh at send
// time so membership tracks the school's structure) or MANUAL (rule=null →
// MailGroupMember rows, entered by the admin with an affirmed consent basis).

// The rule shape stored in MailGroup.rule. audience picks WHO receives the
// mail; the optional structure filters narrow WHICH students anchor the
// audience (parents/tutors are resolved *via* the filtered students).
export const mailGroupRuleSchema = z.object({
  audience: z.enum(['students', 'parents', 'tutors']),
  yearGroupId: z.string().min(1).optional(),
  houseId: z.string().min(1).optional(),
  classId: z.string().min(1).optional(),
})

export type MailGroupRule = z.infer<typeof mailGroupRuleSchema>

// Lenient read of a stored rule: null/invalid JSON → treat the group as manual.
export function parseMailGroupRule(raw: unknown): MailGroupRule | null {
  if (raw == null) return null
  const parsed = mailGroupRuleSchema.safeParse(raw)
  return parsed.success ? parsed.data : null
}

export type MailRecipient = { email: string; name?: string }

// Normalise + dedupe manual member rows before writing, so nested creates
// can't trip the [mailGroupId, email] unique constraint on duplicate form rows.
export function normaliseMembers(members: { email: string; name?: string }[]): { email: string; name: string | null }[] {
  const seen = new Set<string>()
  const out: { email: string; name: string | null }[] = []
  for (const m of members) {
    const email = m.email.trim().toLowerCase()
    if (!email || seen.has(email)) continue
    seen.add(email)
    out.push({ email, name: m.name?.trim() || null })
  }
  return out
}

// Dedupe by case-insensitive email, first entry wins.
function dedupe(recipients: (MailRecipient | null)[]): MailRecipient[] {
  const seen = new Set<string>()
  const out: MailRecipient[] = []
  for (const r of recipients) {
    const email = r?.email?.trim()
    if (!email) continue
    const key = email.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    out.push({ email, ...(r!.name?.trim() ? { name: r!.name.trim() } : {}) })
  }
  return out
}

// The org students a rule selects. With no structure filters this is every org
// student (including those with no StudentOrgProfile yet); with filters it goes
// through the profile (classId matches when it appears in classIds).
function findRuleStudents(orgId: string, rule: MailGroupRule) {
  const hasFilters = !!(rule.yearGroupId || rule.houseId || rule.classId)
  return prisma.student.findMany({
    where: {
      organisationId: orgId,
      ...(hasFilters
        ? {
            orgProfile: {
              is: {
                organisationId: orgId,
                ...(rule.yearGroupId ? { yearGroupId: rule.yearGroupId } : {}),
                ...(rule.houseId ? { houseId: rule.houseId } : {}),
                ...(rule.classId ? { classIds: { has: rule.classId } } : {}),
              },
            },
          }
        : {}),
    },
    include: { user: { select: { email: true } } },
  })
}

/**
 * Resolve a rule to its current recipients — called at send time (and by the
 * live preview) so "all Year 10 parents" tracks membership changes.
 */
export async function resolveMailGroupRule(orgId: string, rule: MailGroupRule): Promise<MailRecipient[]> {
  const students = await findRuleStudents(orgId, rule)

  if (rule.audience === 'students') {
    // Account email wins; managed (accountless) students fall back to contactEmail.
    return dedupe(
      students.map(s => {
        const email = s.user?.email ?? s.contactEmail
        return email ? { email, name: `${s.firstName} ${s.lastName}`.trim() } : null
      }),
    )
  }

  const studentIds = students.map(s => s.id)
  if (studentIds.length === 0) return []

  if (rule.audience === 'parents') {
    // Active parent links only (pending invites haven't consented; revoked are out).
    const links = await prisma.parentLink.findMany({
      where: { studentId: { in: studentIds }, status: 'active' },
      include: { parentUser: { select: { email: true } } },
    })
    return dedupe(
      links.map(l => {
        const email = l.parentUser?.email ?? l.inviteEmail
        return email ? { email } : null
      }),
    )
  }

  // tutors: teachers with an active Match to any of the filtered org students.
  const matches = await prisma.match.findMany({
    where: { studentId: { in: studentIds }, active: true },
    include: { teacher: { select: { firstName: true, lastName: true, user: { select: { email: true } } } } },
  })
  return dedupe(
    matches.map(m => {
      const email = m.teacher?.user?.email
      return email ? { email, name: `${m.teacher.firstName} ${m.teacher.lastName}`.trim() } : null
    }),
  )
}

/**
 * Resolve a mail group (scoped to the org — a group id from another tenant
 * returns null) to a deduped recipient list. Manual groups return their
 * MailGroupMember rows; rule groups resolve the rule live.
 */
export async function resolveMailGroup(groupId: string, orgId: string): Promise<MailRecipient[] | null> {
  const group = await prisma.mailGroup.findFirst({
    where: { id: groupId, organisationId: orgId },
    include: { members: true },
  })
  if (!group) return null

  const rule = parseMailGroupRule(group.rule)
  if (!rule) {
    return dedupe(group.members.map(m => ({ email: m.email, name: m.name ?? undefined })))
  }
  return resolveMailGroupRule(orgId, rule)
}
