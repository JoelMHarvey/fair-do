import { z } from 'zod'

export const ThreadSummarySchema = z.object({
  id: z.string(),
  matchId: z.string(),
  studentId: z.string(),
  clientFirstName: z.string(),
  clientLastName: z.string(),
  updatedAt: z.string(),
  unreadCount: z.number(),
  lastMessage: z
    .object({
      id: z.string(),
      body: z.string(),
      senderClerkId: z.string(),
      isFromTeacher: z.boolean(),
      createdAt: z.string(),
    })
    .nullable(),
})

export const ThreadsResponseSchema = z.object({
  threads: z.array(ThreadSummarySchema),
})

export const MessageSchema = z.object({
  id: z.string(),
  body: z.string(),
  fileUrl: z.string().nullable(),
  senderClerkId: z.string(),
  isFromTeacher: z.boolean(),
  createdAt: z.string(),
})

export const ThreadDetailSchema = z.object({
  id: z.string(),
  matchId: z.string(),
  student: z.object({
    id: z.string(),
    firstName: z.string(),
    lastName: z.string(),
  }),
  currentClerkId: z.string(),
  messages: z.array(MessageSchema),
})

export type ThreadSummary = z.infer<typeof ThreadSummarySchema>
export type ThreadDetail = z.infer<typeof ThreadDetailSchema>
export type Message = z.infer<typeof MessageSchema>
