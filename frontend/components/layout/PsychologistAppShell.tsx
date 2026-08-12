'use client'
import AppShell from '@/components/layout/AppShell'
import PsychologistSidebar from '@/components/psychologist/PsychologistSidebar'

export default function PsychologistAppShell({ children }: { children: React.ReactNode }) {
  return (
    <AppShell
      panelLabel="Psixoloq"
      sidebar={({ onNavigate }) => <PsychologistSidebar onNavigate={onNavigate} />}
    >
      {children}
    </AppShell>
  )
}
