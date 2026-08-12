'use client'
import AppShell from '@/components/layout/AppShell'
import PatientSidebar from '@/components/patient/PatientSidebar'

export default function PatientAppShell({ children }: { children: React.ReactNode }) {
  return (
    <AppShell
      panelLabel="Pasiyent"
      sidebar={({ onNavigate }) => <PatientSidebar onNavigate={onNavigate} />}
    >
      {children}
    </AppShell>
  )
}
