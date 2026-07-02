import { getSchoolContext } from '@/lib/school'
import { BrandingForm } from './BrandingForm'

export const metadata = { title: 'Branding — fair-do' }

// Branding editor (M1) — logo, colours, subdomain and portal messages. Saves
// via PATCH /api/school/branding; the portal reflects changes without a deploy
// (the tenant lookup cache expires within a minute).
export default async function SchoolBrandingPage() {
  const { org, role } = await getSchoolContext()

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-2xl text-sand-900">Branding</h1>
        <p className="text-sm text-sand-500 mt-1">
          Your logo, colours and messages — shown across your portal
          {org.slug ? ` at ${org.slug}.fair-do.com` : ''} and on emails to your students and parents.
        </p>
      </header>

      {role === 'ADMIN' ? (
        <BrandingForm
          schoolName={org.name}
          initial={{
            slug: org.slug ?? '',
            brandColor: org.brandColor ?? '',
            accentColor: org.accentColor ?? '',
            brandLogoUrl: org.brandLogoUrl ?? '',
            welcomeMessage: org.welcomeMessage ?? '',
            footerLine: org.footerLine ?? '',
          }}
        />
      ) : (
        <p className="text-sm text-sand-500 bg-white rounded-xl border border-sand-200 p-6">
          Only school admins can change branding. Ask your school&apos;s fair-do admin if something needs updating.
        </p>
      )}
    </div>
  )
}
