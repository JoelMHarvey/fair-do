import 'server-only'

// Resource & homework sharing (P2-5). Teachers and students share files for a
// lesson (worksheets, past papers, submitted work). Ships behind a flag.
export const RESOURCES_ENABLED = process.env.RESOURCES_ENABLED === 'true'

export const MAX_RESOURCE_BYTES = 25 * 1024 * 1024 // 25 MB

export const RESOURCE_CATEGORIES = ['worksheet', 'homework', 'past-paper', 'notes', 'submission', 'other'] as const
export type ResourceCategory = (typeof RESOURCE_CATEGORIES)[number]
