import { z } from 'zod'

export const CalendarSessionSchema = z.object({
  id: z.string(),
  studentId: z.string(),
  clientFirstName: z.string(),
  clientLastName: z.string(),
  matchId: z.string(),
  scheduledAt: z.string(),
  durationMins: z.number(),
  status: z.string(),
  dailyRoomUrl: z.string().nullable(),
  isJoinable: z.boolean(),
})

export const CalendarResponseSchema = z.object({
  from: z.string(),
  to: z.string(),
  sessions: z.array(CalendarSessionSchema),
})

export type CalendarSession = z.infer<typeof CalendarSessionSchema>
