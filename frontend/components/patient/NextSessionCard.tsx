import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { az } from 'date-fns/locale'

export default function NextSessionCard({ session }: { session?: any }) {
  const router = useRouter()
  if (!session) {
    return (
      <div className="card">
        <h2 className="font-semibold text-gray-900 mb-2">📹 Növbəti seans</h2>
        <p className="text-gray-400 text-sm">Planlanan seans yoxdur.</p>
      </div>
    )
  }
  return (
    <div className="card border-primary-200">
      <h2 className="font-semibold text-gray-900 mb-3">📹 Növbəti seans</h2>
      <p className="text-primary-700 font-bold text-lg">{format(new Date(session.scheduled_at), 'd MMMM, HH:mm', { locale: az })}</p>
      <p className="text-sm text-gray-500 mt-1">{session.duration_minutes} dəqə</p>
      {session.format === 'online' && (
        <button onClick={() => router.push(`/patient/sessions/${session.id}/call`)} className="btn-primary w-full mt-4 text-sm">
          Seansa qoşul
        </button>
      )}
    </div>
  )
}
