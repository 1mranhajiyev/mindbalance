import PsychologistSidebar from '@/components/psychologist/PsychologistSidebar'
import AuthGuard from '@/components/AuthGuard'

export default function PsychologistLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard requiredRole="psychologist">
      <div className="flex min-h-screen bg-slate-50">
        <PsychologistSidebar />
        <main className="ml-64 flex-1 p-8">{children}</main>
      </div>
    </AuthGuard>
  )
}
