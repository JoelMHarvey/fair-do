import { z } from 'zod'

export const SessionRoomSchema = z.object({
  sessionId: z.string(),
  roomUrl: z.string(),
  meetingToken: z.string().nullable(),
  clientFirstName: z.string(),
  clientLastName: z.string(),
  scheduledAt: z.string(),
})

export type SessionRoom = z.infer<typeof SessionRoomSchema>
