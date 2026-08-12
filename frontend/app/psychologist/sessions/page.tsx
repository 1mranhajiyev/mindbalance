'use client'
import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'
import { format } from 'date-fns'
import { az } from 'date-fns/locale'

export default function PsychologistSessions() {
  const { data: sessions, isLoading } = useQuery({
    queryKey: ['psych-sessions'],
    queryFn: () => api.get('/sessions').then(r => r.data)
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Seanslar</h1>
        <p className="text-gray-500 mt-1">Bütün seanslarınızı idarə edin</p>
      </div>
      <div className="card">
        {isLoading ? (
          <p className="text-gray-400 text-sm">Yüklənilir...</p>
        ) : !sessions?.length ? (
          <p className="text-gray-400 text-sm">Heç bir seans tapılmadı.</p>
        ) : (
          <div className="space-y-3">
            {sessions.map((s: any) => (
              <div key={s.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div>
                  <p className="font-medium text-gray-900 text-sm">{s.patient_name || 'Pasiyent'}</p>
                  <p className="text-xs text-gray-500">{format(new Date(s.scheduled_at), 'd MMMM yyyy, HH:mm', { locale: az })}</p>
                </div>
                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                  s.status === 'completed' ? 'bg-green-100 text-green-700' :
                  s.status === 'scheduled' ? 'bg-violet-100 text-violet-700' :
                  'bg-gray-100 text-gray-600'
                }`}>{s.status}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
