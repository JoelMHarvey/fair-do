import { z } from 'zod'

export const ProfileResponseSchema = z.object({
  id: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  professionalTitle: z.string().nullable(),
  bio: z.string(),
  tagline: z.string().nullable(),
  profileImageUrl: z.string().nullable(),
  registrationBody: z.string(),
  registrationNumber: z.string(),
  registrationExpiry: z.string(),
  insuranceProvider: z.string().nullable(),
  insuranceExpiry: z.string().nullable(),
  credentialVerified: z.boolean(),
  stripeOnboarded: z.boolean(),
  status: z.enum(['PENDING', 'ACTIVE', 'SUSPENDED']),
  sessionRatePence: z.number(),
  introRatePence: z.number().nullable(),
  availableForNew: z.boolean(),
  specialisms: z.array(z.string()),
  approachTags: z.array(z.string()),
  languages: z.array(z.string()),
  websiteUrl: z.string().nullable(),
  country: z.string(),
  practiceName: z.string().nullable(),
  practiceSlug: z.string().nullable(),
})

export type ProfileResponse = z.infer<typeof ProfileResponseSchema>
