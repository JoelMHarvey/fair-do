import { getDictionary, getLocaleFromHeaders } from '@/lib/dictionaries'
import { TeacherOnboarding } from '@/components/TeacherOnboarding'

export default async function TeacherOnboardingPage() {
  const { onboarding_teacher } = await getDictionary(await getLocaleFromHeaders())
  return <TeacherOnboarding t={onboarding_teacher} />
}
