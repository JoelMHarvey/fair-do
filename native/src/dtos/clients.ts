import { z } from 'zod'

export const ClientSummarySchema = z.object({
  matchId: z.string(),
  clientId: z.string(),
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

export const ClientsResponseSchema = z.object({
  clients: z.array(ClientSummarySchema),
})

export type ClientSummary = z.infer<typeof ClientSummarySchema>
