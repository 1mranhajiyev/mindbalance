'use client'
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import ApiErrorAlert from '@/components/ApiErrorAlert'
import { format } from 'date-fns'
import { az } from 'date-fns/locale'

export default function PsychologistSessions() {
  const qc = useQueryClient()
  const [patientId, setPatientId] = useState('')
  const [scheduledAt, setScheduledAt] = useState('')
  const [formatType, setFormatType] = useState('online')

  const { data: sessions = [], isLoading } = useQuery({
    queryKey: ['psych-sessions'],
    queryFn: () => api.get('/sessions').then(r => r.data)
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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Seanslar</h1>
        <p className="text-gray-500 mt-1">Bütün seanslarınızı idarə edin</p>
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
