import { getDictionary, getLocaleFromHeaders } from '@/lib/dictionaries'
import { StudentOnboarding } from '@/components/StudentOnboarding'

export default async function StudentOnboardingPage() {
  const { onboarding_student } = await getDictionary(await getLocaleFromHeaders())
  return <StudentOnboarding t={onboarding_student} />
}
