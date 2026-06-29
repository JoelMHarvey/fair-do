import { prisma } from './prisma'

// Runtime settings an admin can flip from the dashboard (env flags are build-time).

export type InboxAgentLevel = 'off' | 'draft' | 'ack' | 'assist'
export const INBOX_AGENT_LEVELS: InboxAgentLevel[] = ['off', 'draft', 'ack', 'assist']
export const INBOX_AGENT_KEY = 'inbox_agent_level'

// Read a setting, defaulting safely if the row — or even the table — is absent, so the
// app behaves as the fallback before the migration is pushed and never throws.
export async function getSetting(key: string, fallback: string): Promise<string> {
  try {
    const row = await prisma.setting.findUnique({ where: { key } })
    return row?.value ?? fallback
  } catch {
    return fallback
  }
}

export async function setSetting(key: string, value: string, updatedBy?: string): Promise<void> {
  await prisma.setting.upsert({
    where: { key },
    create: { key, value, updatedBy: updatedBy ?? null },
    update: { value, updatedBy: updatedBy ?? null },
  })
}

export async function getInboxAgentLevel(): Promise<InboxAgentLevel> {
  const v = await getSetting(INBOX_AGENT_KEY, 'off')
  return (INBOX_AGENT_LEVELS as string[]).includes(v) ? (v as InboxAgentLevel) : 'off'
}

export async function setInboxAgentLevel(level: InboxAgentLevel, updatedBy?: string): Promise<void> {
  await setSetting(INBOX_AGENT_KEY, level, updatedBy)
}
