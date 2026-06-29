import { z } from 'zod'

export const AvailabilityWindowSchema = z.object({
  id: z.string(),
  dayOfWeek: z.number().int().min(0).max(6),
  startTime: z.string(),
  endTime: z.string(),
  timezone: z.string(),
})

export const AvailabilityResponseSchema = z.object({
  availability: z.array(AvailabilityWindowSchema),
  timezone: z.string(),
})

export type AvailabilityWindow = z.infer<typeof AvailabilityWindowSchema>

export const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const
