'use client'
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import ApiErrorAlert from '@/components/ApiErrorAlert'
import { format } from 'date-fns'
import { az } from 'date-fns/locale'
import { useRouter } from 'next/navigation'
import { CalendarPlus } from 'lucide-react'
import { getSessionLabel, getSessionStyle, isPastSession, isUpcomingSession, canJoinSession } from '@/lib/sessionStatus'

export default function SessionsPage() {
  const router = useRouter()
  const qc = useQueryClient()
  const [scheduledAt, setScheduledAt] = useState('')
  const [formatType, setFormatType] = useState('online')
  const [psychologistId, setPsychologistId] = useState('')

  const { data: sessions = [] } = useQuery({
    queryKey: ['sessions'],
    queryFn: () => api.get('/sessions').then(r => r.data),
    refetchInterval: 3000,
  })

  const { data: psychologists = [] } = useQuery({
    queryKey: ['my-psychologists'],
    queryFn: () => api.get('/onboarding/my-psychologists').then(r => r.data),
  })

  const bookMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => api.post('/sessions', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sessions'] })
      setScheduledAt('')
    },
  })

  const upcoming = sessions.filter((s: any) => isUpcomingSession(s))
  const past = sessions.filter((s: any) => isPastSession(s))

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">Seanslarım</h1>
      </div>

      <div className="card space-y-3">
        <h2 className="font-semibold text-gray-900 flex items-center gap-2">
          <CalendarPlus size={18} className="text-primary-600" />
          Seans bron et
        </h2>
        <ApiErrorAlert error={bookMutation.error} fallback="Seans bron edilə bilmədi" />
        {psychologists.length > 1 && (
          <select value={psychologistId} onChange={e => setPsychologistId(e.target.value)} className="select">
            <option value="">Psixoloq seçin</option>
            {psychologists.map((p: any) => (
              <option key={p.id} value={p.id}>{p.full_name}</option>
            ))}
          </select>
        )}
        <input
          type="datetime-local"
          value={scheduledAt}
          onChange={e => setScheduledAt(e.target.value)}
          className="input"
        />
        <select value={formatType} onChange={e => setFormatType(e.target.value)} className="select">
          <option value="online">Online</option>
          <option value="in_person">Üz-üzə</option>
        </select>
        <button
          onClick={() => bookMutation.mutate({
            scheduled_at: new Date(scheduledAt).toISOString(),
            format: formatType,
            duration_minutes: 50,
            status: 'scheduled',
            ...(psychologistId ? { psychologist_id: psychologistId } : {}),
          })}
          disabled={!scheduledAt || bookMutation.isPending || psychologists.length === 0}
          className="btn-primary"
        >
          {bookMutation.isPending ? 'Saxlanılır...' : 'Bron et'}
        </button>
        {psychologists.length === 0 && (
          <p className="text-xs text-amber-600">Seans bron etmək üçün əvvəlcə psixoloq assign olunmalıdır.</p>
        )}
      </div>

      <div>
        <h2 className="section-title">Gələcək seanslar</h2>
        <div className="space-y-3 stagger-children">
          {upcoming.length === 0 && <p className="text-gray-400 text-sm">Planlanan seans yoxdur.</p>}
          {upcoming.map((s: any) => (
            <div key={s.id} className="card flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="font-semibold text-gray-900">{format(new Date(s.scheduled_at), 'd MMMM, HH:mm', { locale: az })}</p>
                <p className="text-sm text-gray-500">{s.duration_minutes} dəqə • {s.format === 'online' ? 'Online' : 'Ofis'}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2 shrink-0">
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
        <h2 className="section-title">Keçmiş seanslar</h2>
        <div className="space-y-3">
          {past.length === 0 && <p className="text-gray-400 text-sm">Keçmiş seans yoxdur.</p>}
          {past.map((s: any) => (
            <div key={s.id} className="card flex flex-col sm:flex-row sm:items-center justify-between gap-2">
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
