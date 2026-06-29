import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { PRACTICE_PORTAL_ENABLED } from '@/lib/practice'
import { assistantConfigured } from '@/lib/assistant'
import { hasPaidAccess } from '@/lib/access'
import { AssistantWidget } from '@/components/AssistantWidget'

// Mounts the paid-tier in-app assistant on every therapist page. Pages keep their
// own auth/redirect logic — this layout only decides whether to render the widget.
export default async function TherapistLayout({ children }: { children: React.ReactNode }) {
  let showAssistant = false
  if (PRACTICE_PORTAL_ENABLED && assistantConfigured()) {
    const { userId } = await auth()
    if (userId) {
      const user = await prisma.user.findUnique({
        where: { clerkId: userId },
        include: { teacher: { include: { subscription: { select: { tier: true, status: true } } } } },
      })
      showAssistant = hasPaidAccess({ email: user?.email, subscription: user?.teacher?.subscription })
    }
  }

  return (
    <>
      {children}
      {showAssistant && <AssistantWidget />}
    </>
  )
}
