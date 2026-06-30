import { z } from 'zod'

export const StudentSummarySchema = z.object({
  matchId: z.string(),
  studentId: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  contactEmail: z.string().nullable(),
  customRatePence: z.number().nullable(),
  source: z.string(),
  startedAt: z.string(),
  nextSession: z
    .object({
      id: z.string(),
      scheduledAt: z.string(),
      status: z.string(),
    })
    .nullable(),
  totalSessions: z.number(),
  pendingForms: z.number(),
  unreadMessages: z.number(),
})

export const StudentsResponseSchema = z.object({
  students: z.array(StudentSummarySchema),
})

export type StudentSummary = z.infer<typeof StudentSummarySchema>
