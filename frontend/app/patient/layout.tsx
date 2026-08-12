import AuthGuard from '@/components/AuthGuard'
import OnboardingGuard from '@/components/OnboardingGuard'
import PatientAppShell from '@/components/layout/PatientAppShell'

export default function PatientLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard requiredRole="patient">
      <OnboardingGuard>
        <PatientAppShell>{children}</PatientAppShell>
      </OnboardingGuard>
    </AuthGuard>
  )
}
