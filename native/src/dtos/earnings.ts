import { z } from 'zod'

export const EarningsResponseSchema = z.object({
  currencySymbol: z.string(),
  monthTotalPence: z.number(),
  allTimeTotalPence: z.number(),
  payments: z.array(
    z.object({
      id: z.string(),
      amountTotalPence: z.number(),
      therapistPayoutPence: z.number(),
      platformFeePence: z.number(),
      currency: z.string(),
      createdAt: z.string(),
      clientFirstName: z.string(),
      clientLastName: z.string(),
      sessionScheduledAt: z.string().nullable(),
    }),
  ),
})

export type EarningsResponse = z.infer<typeof EarningsResponseSchema>
