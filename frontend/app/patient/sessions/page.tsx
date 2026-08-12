'use client'
import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'
import { format } from 'date-fns'
import { az } from 'date-fns/locale'
import { useRouter } from 'next/navigation'
import { getSessionLabel, getSessionStyle, isPastSession, isUpcomingSession, canJoinSession } from '@/lib/sessionStatus'

export default function SessionsPage() {
  const router = useRouter()
  const { data: sessions = [] } = useQuery({
    queryKey: ['sessions'],
    queryFn: () => api.get('/sessions').then(r => r.data),
    refetchInterval: 3000,
  })

  const upcoming = sessions.filter((s: any) => isUpcomingSession(s))
  const past = sessions.filter((s: any) => isPastSession(s))

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">📅 Seanslarım</h1>
      <div>
        <h2 className="font-semibold text-gray-700 mb-3">Gələcək seanslar</h2>
        <div className="space-y-3">
          {upcoming.length === 0 && <p className="text-gray-400 text-sm">Planlanan seans yoxdur.</p>}
          {upcoming.map((s: any) => (
            <div key={s.id} className="card flex items-center justify-between gap-3">
              <div>
                <p className="font-semibold text-gray-900">{format(new Date(s.scheduled_at), 'd MMMM, HH:mm', { locale: az })}</p>
                <p className="text-sm text-gray-500">{s.duration_minutes} dəqə • {s.format === 'online' ? 'Online' : 'Ofis'}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${getSessionStyle(s)}`}>
                  {getSessionLabel(s)}
                </span>
                {canJoinSession(s) && (
                  <button onClick={() => router.push(`/patient/sessions/${s.id}/call`)} className="btn-primary text-sm">
                    Seansa qoşul
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div>
        <h2 className="font-semibold text-gray-700 mb-3">Keçmiş seanslar</h2>
        <div className="space-y-3">
          {past.length === 0 && <p className="text-gray-400 text-sm">Keçmiş seans yoxdur.</p>}
          {past.map((s: any) => (
            <div key={s.id} className="card flex items-center justify-between">
              <div>
                <p className="font-semibold text-gray-900">{format(new Date(s.scheduled_at), 'd MMMM yyyy, HH:mm', { locale: az })}</p>
                <p className="text-sm text-gray-500">{s.duration_minutes} dəqə</p>
              </div>
              <span className={`text-xs font-semibold px-2 py-1 rounded-full ${getSessionStyle(s)}`}>
                {getSessionLabel(s)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
