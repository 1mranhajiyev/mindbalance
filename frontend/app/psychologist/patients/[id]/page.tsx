'use client'
import { useQuery } from '@tanstack/react-query'
import { useParams } from 'next/navigation'
import api from '@/lib/api'
import Link from 'next/link'
import { format } from 'date-fns'
import { az } from 'date-fns/locale'
import { getSessionLabel } from '@/lib/sessionStatus'
import { ArrowLeft } from 'lucide-react'

export default function PatientDetailPage() {
  const params = useParams()
  const patientId = params.id as string

  const { data: patient, isLoading } = useQuery({
    queryKey: ['patient', patientId],
    queryFn: () => api.get(`/patients/${patientId}`).then(r => r.data),
    enabled: !!patientId,
  })

  const { data: tasks = [] } = useQuery({
    queryKey: ['tasks', patientId],
    queryFn: () => api.get('/tasks').then(r => r.data),
  })

  const { data: sessions = [] } = useQuery({
    queryKey: ['sessions', patientId],
    queryFn: () => api.get('/sessions').then(r => r.data),
  })

  const patientTasks = tasks.filter((t: any) => t.patient === patientId)
  const patientSessions = sessions.filter((s: any) => s.patient === patientId)

  if (isLoading) return <p className="text-gray-400">Yüklənir...</p>
  if (!patient) return <p className="text-gray-400">Pasiyent tapılmadı.</p>

  return (
    <div className="space-y-6">
      <Link href="/psychologist/patients" className="inline-flex items-center gap-1 text-sm text-primary-600">
        <ArrowLeft size={16} /> Geri
      </Link>

      <div className="card">
        <h1 className="text-2xl font-bold text-gray-900">{patient.full_name}</h1>
        <p className="text-gray-500">{patient.email}</p>
        {patient.therapy_start_date && (
          <p className="text-sm text-gray-400 mt-2">
            Terapiya başlanğıcı: {format(new Date(patient.therapy_start_date), 'd MMMM yyyy', { locale: az })}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card">
          <h2 className="font-semibold mb-3">Seanslar ({patientSessions.length})</h2>
          {patientSessions.length === 0 ? (
            <p className="text-sm text-gray-400">Seans yoxdur.</p>
          ) : (
            <ul className="space-y-2">
              {patientSessions.map((s: any) => (
                <li key={s.id} className="text-sm text-gray-700">
                  {format(new Date(s.scheduled_at), 'd MMM yyyy, HH:mm', { locale: az })} — {getSessionLabel(s)}
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="card">
          <h2 className="font-semibold mb-3">Tapşırıqlar ({patientTasks.length})</h2>
          {patientTasks.length === 0 ? (
            <p className="text-sm text-gray-400">Tapşırıq yoxdur.</p>
          ) : (
            <ul className="space-y-2">
              {patientTasks.map((t: any) => (
                <li key={t.id} className="text-sm text-gray-700">
                  {t.title} {t.is_completed ? '✓' : ''}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
