import PatientSidebar from '@/components/patient/PatientSidebar'
import AuthGuard from '@/components/AuthGuard'
import OnboardingGuard from '@/components/OnboardingGuard'

export default function PatientLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard requiredRole="patient">
      <OnboardingGuard>
        <div className="flex min-h-screen bg-slate-50">
          <PatientSidebar />
          <main className="ml-64 flex-1 p-8">{children}</main>
        </div>
      </OnboardingGuard>
    </AuthGuard>
  )
}
