import 'server-only'

// Resource & homework sharing (P2-5). Teachers and students share files for a
// lesson (worksheets, past papers, submitted work). Ships behind a flag.
export const RESOURCES_ENABLED = process.env.RESOURCES_ENABLED === 'true'

export const MAX_RESOURCE_BYTES = 25 * 1024 * 1024 // 25 MB

export const RESOURCE_CATEGORIES = ['worksheet', 'homework', 'past-paper', 'notes', 'submission', 'other'] as const
export type ResourceCategory = (typeof RESOURCE_CATEGORIES)[number]

// Per-tier storage quota (P2-5): free teachers are capped; paid tiers are unlimited.
export const FREE_TIER_STORAGE_BYTES = 100 * 1024 * 1024 // 100 MB
export const STORAGE_UNLIMITED_TIERS = new Set(['pro', 'school', 'enterprise', 'practice', 'clinic'])
