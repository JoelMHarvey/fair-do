import { getDictionary, getLocaleFromHeaders } from '@/lib/dictionaries'
import { OnboardingHome } from '@/components/OnboardingHome'

export default async function OnboardingPage() {
  const { onboarding_home } = await getDictionary(await getLocaleFromHeaders())
  return <OnboardingHome t={onboarding_home} />
}
