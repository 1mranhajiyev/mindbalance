import PatientSidebar from '@/components/patient/PatientSidebar'

export default function PatientLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <PatientSidebar />
      <main className="ml-64 flex-1 p-8">{children}</main>
    </div>
  )
}
