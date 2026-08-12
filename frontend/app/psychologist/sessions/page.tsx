'use client'
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'
import ApiErrorAlert from '@/components/ApiErrorAlert'
import { format } from 'date-fns'
import { az } from 'date-fns/locale'
import { Video } from 'lucide-react'
import { getSessionLabel, getSessionStyle, canJoinSession } from '@/lib/sessionStatus'

export default function PsychologistSessions() {
  const router = useRouter()
  const qc = useQueryClient()
  const [patientId, setPatientId] = useState('')
  const [scheduledAt, setScheduledAt] = useState('')
  const [formatType, setFormatType] = useState('online')

  const { data: sessions = [], isLoading } = useQuery({
    queryKey: ['psych-sessions'],
    queryFn: () => api.get('/sessions').then(r => r.data),
    refetchInterval: 3000,
  })

  const { data: patients = [] } = useQuery({
    queryKey: ['patients'],
    queryFn: () => api.get('/patients').then(r => r.data)
  })

  const mutation = useMutation({
    mutationFn: (data: any) => api.post('/sessions', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['psych-sessions'] })
      setScheduledAt('')
    }
  })

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">Seanslar</h1>
        <p className="page-subtitle">Bütün seanslarınızı idarə edin</p>
      </div>

      <div className="card space-y-3">
        <h2 className="font-semibold text-gray-900">Yeni seans planla</h2>
        <ApiErrorAlert error={mutation.error} fallback="Seans yaradıla bilmədi" />
        <select value={patientId} onChange={e => setPatientId(e.target.value)} className="select">
          <option value="">Pasiyent seçin</option>
          {patients.map((p: any) => (
            <option key={p.id} value={p.id}>{p.full_name}</option>
          ))}
        </select>
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
          onClick={() => mutation.mutate({
            patient_id: patientId,
            scheduled_at: new Date(scheduledAt).toISOString(),
            format: formatType,
            duration_minutes: 50,
            status: 'scheduled',
          })}
          disabled={!patientId || !scheduledAt || mutation.isPending}
          className="btn-primary"
        >
          {mutation.isPending ? 'Saxlanılır...' : 'Seans yarat'}
        </button>
      </div>

      <div className="card">
        {isLoading ? (
          <p className="text-gray-400 text-sm">Yüklənilir...</p>
        ) : !sessions?.length ? (
          <p className="text-gray-400 text-sm">Heç bir seans tapılmadı.</p>
        ) : (
          <div className="space-y-3">
            {sessions.map((s: any) => (
              <div key={s.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-primary-50/50 rounded-xl gap-3 transition-colors hover:bg-primary-50">
                <div className="min-w-0">
                  <p className="font-medium text-gray-900 text-sm">{s.patient_name || 'Pasiyent'}</p>
                  <p className="text-xs text-gray-500">{format(new Date(s.scheduled_at), 'd MMMM yyyy, HH:mm', { locale: az })}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  {canJoinSession(s) && (
                    <button
                      onClick={() => router.push(`/psychologist/sessions/${s.id}/call`)}
                      className="btn-primary text-xs flex items-center gap-1.5 px-3 py-1.5"
                    >
                      <Video size={14} />
                      Seansa qoşul
                    </button>
                  )}
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${getSessionStyle(s)}`}>
                    {getSessionLabel(s)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
