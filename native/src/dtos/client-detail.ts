import { z } from 'zod'

const SessionRefSchema = z.object({
  id: z.string(),
  scheduledAt: z.string(),
  durationMins: z.number(),
  status: z.string(),
  dailyRoomUrl: z.string().nullable(),
})

export const ClientDetailSchema = z.object({
  matchId: z.string(),
  customRatePence: z.number().nullable(),
  source: z.string(),
  notes: z.string().nullable(),
  startedAt: z.string(),
  active: z.boolean(),
  client: z.object({
    id: z.string(),
    firstName: z.string(),
    lastName: z.string(),
    contactEmail: z.string().nullable(),
    phone: z.string().nullable(),
    dateOfBirth: z.string().nullable(),
    consentGiven: z.boolean(),
    consentDate: z.string().nullable(),
    createdAt: z.string(),
  }),
  upcomingSessions: z.array(SessionRefSchema),
  pastSessions: z.array(
    SessionRefSchema.extend({
      payment: z
        .object({
          amountTotalPence: z.number(),
          teacherPayoutPence: z.number(),
          status: z.string(),
        })
        .nullable(),
    }),
  ),
  documents: z.array(
    z.object({
      id: z.string(),
      label: z.string(),
      url: z.string(),
      category: z.string(),
      createdAt: z.string(),
    }),
  ),
  outcomeScores: z.array(
    z.object({
      id: z.string(),
      measure: z.string(),
      measureName: z.string().nullable(),
      score: z.number(),
      takenOn: z.string(),
    }),
  ),
  forms: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      type: z.string(),
      status: z.string(),
      sentAt: z.string(),
      completedAt: z.string().nullable(),
    }),
  ),
})

export type ClientDetail = z.infer<typeof ClientDetailSchema>
