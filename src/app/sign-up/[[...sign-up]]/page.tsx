import { SignUp } from '@clerk/nextjs'

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      {/* Route new users through /dashboard, which forwards them to onboarding
          (existing students land on their dashboard). Without this Clerk falls
          back to "/" (the marketing home). */}
      <SignUp forceRedirectUrl="/dashboard" />
    </div>
  )
}
