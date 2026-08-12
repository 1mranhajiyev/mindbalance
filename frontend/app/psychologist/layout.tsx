import AuthGuard from '@/components/AuthGuard'
import PsychologistAppShell from '@/components/layout/PsychologistAppShell'

export default function PsychologistLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard requiredRole="psychologist">
      <PsychologistAppShell>{children}</PsychologistAppShell>
    </AuthGuard>
  )
}
