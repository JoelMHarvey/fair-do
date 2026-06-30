import { z } from 'zod'

export const SessionSummarySchema = z.object({
  id: z.string(),
  clientFirstName: z.string(),
  clientLastName: z.string(),
  clientId: z.string(),
  scheduledAt: z.string(),
  durationMins: z.number(),
  status: z.string(),
  dailyRoomUrl: z.string().nullable(),
  isJoinable: z.boolean(),
})

export const AlertSchema = z.object({
  type: z.string(),
  severity: z.enum(['warning', 'critical']),
  message: z.string(),
  daysUntil: z.number().nullable(),
})

export const DashboardSchema = z.object({
  teacher: z.object({
    id: z.string(),
    firstName: z.string(),
    lastName: z.string(),
    status: z.enum(['PENDING', 'ACTIVE', 'SUSPENDED']),
    profileImageUrl: z.string().nullable(),
    stripeOnboarded: z.boolean(),
    registrationBody: z.string(),
    sessionRatePence: z.number(),
  }),
  todaySessions: z.array(SessionSummarySchema),
  upcomingSessions: z.array(SessionSummarySchema),
  earnings: z.object({
    monthTotalPence: z.number(),
    monthSessionCount: z.number(),
  }),
  activeClientCount: z.number(),
  unreadMessageCount: z.number(),
  alerts: z.array(AlertSchema),
})

export type Dashboard = z.infer<typeof DashboardSchema>
export type SessionSummary = z.infer<typeof SessionSummarySchema>
export type Alert = z.infer<typeof AlertSchema>
