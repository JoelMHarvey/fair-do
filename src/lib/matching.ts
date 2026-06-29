import { prisma } from './prisma'

// Maps student questionnaire reasons to teacher subject tags
const REASON_TO_SUBJECT: Record<string, string[]> = {
  'Anxiety or worry': ['Anxiety'],
  'Depression or low mood': ['Depression'],
  'Trauma or PTSD': ['Trauma / PTSD'],
  'Relationship difficulties': ['Relationships'],
  'Grief or loss': ['Grief & loss', 'Bereavement'],
  'Work stress': ['Work stress'],
  'Identity or self-esteem': ['Identity / LGBTQ+'],
  'Life transitions': ['Life transitions'],
  'Other': [],
}

const DAY_NAME_TO_DOW: Record<string, number> = {
  Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6, Sun: 0,
}

export type MatchedTherapist = {
  id: string
  firstName: string
  lastName: string
  bio: string
  tagline: string | null
  profileImageUrl: string | null
  qualificationBody: string | null
  sessionRatePence: number
  introRatePence: number | null
  displayPence: number       // intro rate if set, else standard — used for "cheapest"
  nextAvailableTs: number | null // ms timestamp of next open slot, for "soonest"
  isFoundingMember: boolean
  country: string
  languages: string[]
  ratingAverage: number
  ratingCount: number
  subjects: string[]
  teachingStyles: string[]
  score: number
}

// Next open slot from weekly availability, searching the next 14 days.
function computeNextAvailable(avail: { dayOfWeek: number; startTime: string }[]): number | null {
  if (!avail.length) return null
  const now = new Date()
  for (let d = 0; d < 14; d++) {
    const day = new Date(now)
    day.setDate(now.getDate() + d)
    const dow = day.getDay()
    const slots = avail.filter(a => a.dayOfWeek === dow)
    for (const s of slots) {
      const [h, m] = s.startTime.split(':').map(Number)
      const slot = new Date(day)
      slot.setHours(h, m, 0, 0)
      if (slot.getTime() > now.getTime()) return slot.getTime()
    }
  }
  return null
}

export async function getMatchesForClient(studentId: string): Promise<MatchedTherapist[]> {
  const student = await prisma.student.findUnique({
    where: { id: studentId },
  })

  if (!student) return []

  const questionnaire = student.questionnaire as {
    reason?: string
    reasons?: string[]
    preferredApproach?: string
    preferredApproaches?: string[]
    availability?: string[]
  } | null

  // Support both new multi-select and legacy single-value questionnaires.
  const reasons = questionnaire?.reasons?.length
    ? questionnaire.reasons
    : (questionnaire?.reason ? [questionnaire.reason] : [])
  const approaches = questionnaire?.preferredApproaches?.length
    ? questionnaire.preferredApproaches
    : (questionnaire?.preferredApproach ? [questionnaire.preferredApproach] : [])

  // Region scoping: only same-country teachers; for the US, only those licensed
  // in the student's state (a teacher can only legally see students physically in-state).
  const regionWhere: { country: typeof student.country; licenseState?: string } = { country: student.country }
  if (student.country === 'US' && student.usState) {
    regionWhere.licenseState = student.usState
  }

  const teachersRaw = await prisma.teacher.findMany({
    where: { status: 'ACTIVE', availableForNew: true, ...regionWhere },
    include: { availability: true },
  })
  // Defensive: never surface demo/seed teachers (fake Stripe accounts) to real students,
  // even if the prod cleanup script hasn't been run. UAT sets ALLOW_DEMO_DATA=true to show them.
  const teachers = process.env.ALLOW_DEMO_DATA === 'true'
    ? teachersRaw
    : teachersRaw.filter(t => !t.stripeAccountId?.startsWith('acct_demo_'))

  // Batch ratings for all matched teachers.
  const ratingRows = await prisma.review.groupBy({
    by: ['teacherId'],
    where: { teacherId: { in: teachers.map(t => t.id) } },
    _avg: { rating: true },
    _count: { rating: true },
  })
  const ratingMap = new Map(ratingRows.map(r => [r.teacherId, { avg: Math.round((r._avg.rating ?? 0) * 10) / 10, count: r._count.rating }]))

  // Every subject implied by any selected reason
  const targetSubjects = new Set(reasons.flatMap(r => REASON_TO_SUBJECT[r] ?? []))
  const wantedStyles = approaches.filter(a => a !== 'No preference')

  const scored = teachers.map(t => {
    let score = 0

    // Subject match — +50 per overlapping subject (capped), so more matches rank higher
    const subjectHits = t.subjects.filter(s => targetSubjects.has(s)).length
    if (subjectHits > 0) score += Math.min(50 + (subjectHits - 1) * 15, 95)

    // Teaching style match — +30 if the teacher offers any preferred style
    if (wantedStyles.some(a => t.teachingStyles.includes(a))) score += 30

    // Availability overlap (+20)
    if (questionnaire?.availability?.length) {
      const studentDows = questionnaire.availability.map(d => DAY_NAME_TO_DOW[d]).filter(d => d !== undefined)
      const teacherDows = t.availability.map(a => a.dayOfWeek)
      if (studentDows.some(d => teacherDows.includes(d))) score += 20
    }

    return {
      id: t.id,
      firstName: t.firstName,
      lastName: t.lastName,
      bio: t.bio,
      tagline: t.tagline,
      profileImageUrl: t.profileImageUrl,
      qualificationBody: t.qualificationBody,
      sessionRatePence: t.sessionRatePence,
      introRatePence: t.introRatePence,
      displayPence: t.introRatePence ?? t.sessionRatePence,
      nextAvailableTs: computeNextAvailable(t.availability),
      isFoundingMember: t.isFoundingMember,
      country: t.country,
      languages: t.languages,
      ratingAverage: ratingMap.get(t.id)?.avg ?? 0,
      ratingCount: ratingMap.get(t.id)?.count ?? 0,
      subjects: t.subjects,
      teachingStyles: t.teachingStyles,
      score,
    }
  })

  // Sort by score desc, then alphabetically by name as tiebreaker
  return scored.sort((a, b) =>
    b.score !== a.score ? b.score - a.score : a.lastName.localeCompare(b.lastName)
  )
}
