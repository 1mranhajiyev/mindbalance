import PsychologistSidebar from '@/components/psychologist/PsychologistSidebar'

export default function PsychologistLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <PsychologistSidebar />
      <main className="ml-64 flex-1 p-8">{children}</main>
    </div>
  )
}
