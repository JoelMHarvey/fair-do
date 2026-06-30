import { getDictionary, getLocaleFromHeaders } from '@/lib/dictionaries'
import { GiftForm } from '@/components/GiftForm'

export default async function GiftPage() {
  const { gift } = await getDictionary(await getLocaleFromHeaders())
  return <GiftForm t={gift} />
}
